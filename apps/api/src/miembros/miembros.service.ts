import { BadRequestException, ForbiddenException, Inject, Injectable } from '@nestjs/common';
import type {
  ActualizarMiembroPayload,
  CrearMiembroPayload,
  ListarMiembrosPayload,
  McpActor,
  Miembro,
  MiembrosListResponse,
  ObtenerMiembroPorIdPayload,
} from '@crm/shared';
import { JerarquiaService } from '../jerarquia/jerarquia.service';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class MiembrosService {
  constructor(
    @Inject(JerarquiaService) private readonly jerarquiaService: JerarquiaService,
    @Inject(PrismaService) private readonly prisma: PrismaService,
  ) {}

  async listar(actor: McpActor, payload: ListarMiembrosPayload = {}): Promise<MiembrosListResponse> {
    const scope = await this.jerarquiaService.getAccessibleOrganizationIds(actor.organizacion_id);

    const members = await this.prisma.member.findMany({
      where: {
        organizationId: { in: scope },
        ...(payload.organizacion_id ? { organizationId: payload.organizacion_id } : {}),
        ...(payload.incluir_inactivos ? {} : { active: true }),
        user: { level: { lt: actor.nivel } },
      },
      include: { user: true },
      orderBy: [{ user: { level: 'desc' } }, { user: { displayName: 'asc' } }],
    });

    const items = members.map((member) => this.toMiembro(member));
    return { items, total: items.length };
  }

  async obtenerPorId(actor: McpActor, payload: ObtenerMiembroPorIdPayload): Promise<Miembro | null> {
    const member = await this.prisma.member.findUnique({
      where: { id: payload.miembro_id },
      include: { user: true },
    });

    if (!member) {
      return null;
    }

    const miembro = this.toMiembro(member);
    const access = await this.jerarquiaService.validarAcceso(actor, {
      target_user_id: miembro.user_id,
    });

    return access.allowed ? miembro : null;
  }

  async crear(actor: McpActor, payload: CrearMiembroPayload): Promise<Miembro> {
    const targetLevel = (await this.jerarquiaService.calcularNivel({ rol: payload.rol })).nivel;

    if (targetLevel === null) {
      throw new BadRequestException('ROL_INVALIDO');
    }

    const access = await this.jerarquiaService.validarAcceso(actor, {
      target_organizacion_id: payload.organizacion_id,
      required_min_level: targetLevel + 1,
    });

    if (!access.allowed || actor.nivel <= targetLevel) {
      throw new ForbiddenException('ACCESO_DENEGADO');
    }

    const userId = this.createId('u');
    const memberId = this.createId('m');

    await this.prisma.user.create({
      data: {
        id: userId,
        email: payload.email,
        displayName: payload.nombre,
        role: payload.rol,
        level: targetLevel,
      },
    });

    await this.prisma.member.create({
      data: {
        id: memberId,
        userId,
        organizationId: payload.organizacion_id,
        phone: payload.telefono,
        active: true,
      },
    });

    const created = await this.prisma.member.findUnique({
      where: { id: memberId },
      include: { user: true },
    });

    if (!created) {
      throw new BadRequestException('MIEMBRO_NO_CREADO');
    }

    return this.toMiembro(created);
  }

  async actualizar(actor: McpActor, payload: ActualizarMiembroPayload): Promise<Miembro | null> {
    const existing = await this.prisma.member.findUnique({
      where: { id: payload.miembro_id },
      include: { user: true },
    });

    if (!existing) {
      return null;
    }

    const miembro = this.toMiembro(existing);
    const access = await this.jerarquiaService.validarAcceso(actor, {
      target_user_id: miembro.user_id,
    });

    if (!access.allowed) {
      throw new ForbiddenException('ACCESO_DENEGADO');
    }

    const nextLevel = payload.rol
      ? (await this.jerarquiaService.calcularNivel({ rol: payload.rol })).nivel
      : miembro.nivel;

    if (nextLevel === null || actor.nivel <= nextLevel) {
      throw new BadRequestException('ROL_INVALIDO');
    }

    if (payload.organizacion_id) {
      const orgAccess = await this.jerarquiaService.validarAcceso(actor, {
        target_organizacion_id: payload.organizacion_id,
      });

      if (!orgAccess.allowed) {
        throw new ForbiddenException('ACCESO_DENEGADO');
      }
    }

    await this.prisma.user.update({
      where: { id: miembro.user_id },
      data: {
        email: payload.email ?? miembro.email,
        displayName: payload.nombre ?? miembro.nombre,
        role: payload.rol ?? miembro.rol,
        level: nextLevel,
      },
    });

    await this.prisma.member.update({
      where: { id: miembro.id },
      data: {
        organizationId: payload.organizacion_id ?? miembro.organizacion_id,
        phone: payload.telefono ?? miembro.telefono,
        active: payload.activo ?? miembro.activo,
      },
    });

    const updated = await this.prisma.member.findUnique({
      where: { id: miembro.id },
      include: { user: true },
    });

    if (!updated) {
      throw new BadRequestException('MIEMBRO_NO_ACTUALIZADO');
    }

    return this.toMiembro(updated);
  }

  private createId(prefix: string): string {
    return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
  }

  private toMiembro(member: {
    id: string;
    userId: string;
    organizationId: string;
    phone: string | null;
    active: boolean;
    user: { displayName: string; email: string; role: string; level: number };
  }): Miembro {
    return {
      id: member.id,
      user_id: member.userId,
      nombre: member.user.displayName,
      email: member.user.email,
      telefono: member.phone ?? undefined,
      rol: member.user.role,
      organizacion_id: member.organizationId,
      nivel: member.user.level,
      activo: member.active,
    };
  }
}
