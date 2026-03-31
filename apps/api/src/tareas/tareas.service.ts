import { BadRequestException, ForbiddenException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import type {
  AsignarTareaPayload,
  CompletarTareaPayload,
  CrearTareaPayload,
  ListarTareasPayload,
  McpActor,
  ObtenerTareaPorIdPayload,
  Tarea,
  TareasListResponse,
} from '@crm/shared';
import { JerarquiaService } from '../jerarquia/jerarquia.service';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class TareasService {
  constructor(
    @Inject(JerarquiaService) private readonly jerarquiaService: JerarquiaService,
    @Inject(PrismaService) private readonly prisma: PrismaService,
  ) {}

  async crear(actor: McpActor, payload: CrearTareaPayload): Promise<Tarea> {
    const access = await this.jerarquiaService.validarAcceso(actor, {
      target_organizacion_id: payload.organizacion_id,
    });

    if (!access.allowed) {
      throw new ForbiddenException('ACCESO_DENEGADO');
    }

    const creator = await this.prisma.member.findFirst({
      where: { userId: actor.user_id },
    });

    if (!creator) {
      throw new NotFoundException('MIEMBRO_CREADOR_NO_ENCONTRADO');
    }

    const created = await this.prisma.task.create({
      data: {
        id: this.createId('t'),
        title: payload.titulo,
        description: payload.descripcion,
        organizationId: payload.organizacion_id,
        createdByMemberId: creator.id,
        status: 'pendiente',
      },
      include: {
        createdBy: {
          include: { user: true },
        },
      },
    });

    return this.toTarea(created, creator.userId);
  }

  async listar(actor: McpActor, payload: ListarTareasPayload = {}): Promise<TareasListResponse> {
    const scope = await this.jerarquiaService.getAccessibleOrganizationIds(actor.organizacion_id);

    const tasks = await this.prisma.task.findMany({
      where: {
        organizationId: {
          in: payload.organizacion_id ? [payload.organizacion_id] : scope,
        },
        ...(payload.estado ? { status: payload.estado } : {}),
      },
      include: {
        createdBy: {
          include: { user: true },
        },
        assignedTo: {
          include: { user: true },
        },
      },
      orderBy: [{ status: 'asc' }, { createdAt: 'desc' }],
    });

    const items = tasks.map((task) => this.toTarea(task, task.assignedTo?.userId, task.createdBy.userId));
    return { items, total: items.length };
  }

  async obtenerPorId(actor: McpActor, payload: ObtenerTareaPorIdPayload): Promise<Tarea | null> {
    const task = await this.prisma.task.findUnique({
      where: { id: payload.tarea_id },
      include: {
        createdBy: {
          include: { user: true },
        },
        assignedTo: {
          include: { user: true },
        },
      },
    });

    if (!task) {
      return null;
    }

    const access = await this.jerarquiaService.validarAcceso(actor, {
      target_organizacion_id: task.organizationId,
    });

    if (!access.allowed) {
      throw new ForbiddenException('ACCESO_DENEGADO');
    }

    return this.toTarea(task, task.assignedTo?.userId, task.createdBy.userId);
  }

  async asignar(actor: McpActor, payload: AsignarTareaPayload): Promise<Tarea> {
    const tarea = await this.prisma.task.findUnique({
      where: { id: payload.tarea_id },
    });

    if (!tarea) {
      throw new NotFoundException('TAREA_NO_ENCONTRADA');
    }

    const miembro = await this.prisma.member.findFirst({
      where: { userId: payload.asignado_a_user_id },
      include: { user: true },
    });

    if (!miembro) {
      throw new NotFoundException('MIEMBRO_NO_ENCONTRADO');
    }

    const orgAccess = await this.jerarquiaService.validarAcceso(actor, {
      target_organizacion_id: tarea.organizationId,
    });
    const userAccess = await this.jerarquiaService.validarAcceso(actor, {
      target_user_id: miembro.userId,
    });

    if (!orgAccess.allowed || !userAccess.allowed) {
      throw new ForbiddenException('ACCESO_DENEGADO');
    }

    if (miembro.organizationId !== tarea.organizationId) {
      throw new BadRequestException('MIEMBRO_FUERA_DE_ORGANIZACION');
    }

    const updated = await this.prisma.task.update({
      where: { id: tarea.id },
      data: {
        assignedToMemberId: miembro.id,
        status: 'asignada',
      },
      include: {
        createdBy: {
          include: { user: true },
        },
      },
    });

    return this.toTarea(updated, miembro.userId, updated.createdBy.userId);
  }

  async completar(actor: McpActor, payload: CompletarTareaPayload): Promise<Tarea> {
    const tarea = await this.prisma.task.findUnique({
      where: { id: payload.tarea_id },
      include: {
        assignedTo: {
          include: { user: true },
        },
        createdBy: {
          include: { user: true },
        },
      },
    });

    if (!tarea) {
      throw new NotFoundException('TAREA_NO_ENCONTRADA');
    }

    const assignedUserId = tarea.assignedTo?.userId;
    const canCompleteOwnTask = assignedUserId === actor.user_id;
    const canCompleteByHierarchy = (
      await this.jerarquiaService.validarAcceso(actor, {
        target_organizacion_id: tarea.organizationId,
      })
    ).allowed;

    if (!canCompleteOwnTask && !canCompleteByHierarchy) {
      throw new ForbiddenException('ACCESO_DENEGADO');
    }

    const updated = await this.prisma.task.update({
      where: { id: tarea.id },
      data: {
        status: 'completada',
        completedAt: new Date(),
      },
      include: {
        assignedTo: {
          include: { user: true },
        },
        createdBy: {
          include: { user: true },
        },
      },
    });

    return this.toTarea(updated, updated.assignedTo?.userId, updated.createdBy.userId);
  }

  private toTarea(task: {
    id: string;
    title: string;
    description: string | null;
    organizationId: string;
    status: 'pendiente' | 'asignada' | 'completada';
    createdByMemberId: string;
    assignedToMemberId: string | null;
    completedAt: Date | null;
  }, assignedUserId?: string, createdByUserId?: string): Tarea {
    return {
      id: task.id,
      titulo: task.title,
      descripcion: task.description ?? undefined,
      organizacion_id: task.organizationId,
      creado_por_user_id: createdByUserId ?? task.createdByMemberId,
      asignado_a_user_id: assignedUserId,
      estado: task.status,
      completado_en: task.completedAt?.toISOString(),
    };
  }

  private createId(prefix: string): string {
    return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
  }
}
