import { BadRequestException, ForbiddenException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import type {
  AcuerdoConsejo,
  ActaConsejo,
  CrearActaConsejoPayload,
  ListarAcuerdosConsejoPayload,
  McpActor,
  SeguimientoConsejoPayload,
} from '@crm/shared';
import { JerarquiaService } from '../jerarquia/jerarquia.service';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ConsejoService {
  constructor(
    @Inject(JerarquiaService) private readonly jerarquiaService: JerarquiaService,
    @Inject(PrismaService) private readonly prisma: PrismaService,
  ) {}

  async crearActa(actor: McpActor, payload: CrearActaConsejoPayload): Promise<ActaConsejo> {
    const access = await this.jerarquiaService.validarAcceso(actor, {
      target_organizacion_id: payload.organizacion_id,
    });

    if (!access.allowed) {
      throw new ForbiddenException('ACCESO_DENEGADO');
    }

    const creator = await this.prisma.member.findFirst({ where: { userId: actor.user_id } });
    if (!creator) {
      throw new NotFoundException('MIEMBRO_CREADOR_NO_ENCONTRADO');
    }

    for (const acuerdo of payload.acuerdos) {
      const responsible = await this.prisma.member.findFirst({
        where: { userId: acuerdo.responsable_user_id },
        include: { user: true },
      });

      if (!responsible) {
        throw new NotFoundException('RESPONSABLE_NO_ENCONTRADO');
      }

      const responsibleAccess = await this.jerarquiaService.validarAcceso(actor, {
        target_user_id: acuerdo.responsable_user_id,
      });

      if (!responsibleAccess.allowed || responsible.organizationId !== payload.organizacion_id) {
        throw new ForbiddenException('ACCESO_DENEGADO');
      }
    }

    const minute = await this.prisma.councilMinute.create({
      data: {
        title: payload.titulo,
        summary: payload.resumen,
        meetingDate: new Date(payload.fecha_reunion),
        organizationId: payload.organizacion_id,
        createdByMemberId: creator.id,
        agreements: {
          create: await Promise.all(
            payload.acuerdos.map(async (acuerdo) => {
              const responsible = await this.prisma.member.findFirst({
                where: { userId: acuerdo.responsable_user_id },
              });

              if (!responsible) {
                throw new NotFoundException('RESPONSABLE_NO_ENCONTRADO');
              }

              return {
                title: acuerdo.titulo,
                description: acuerdo.descripcion,
                responsibleMemberId: responsible.id,
                dueDate: acuerdo.fecha_compromiso ? new Date(acuerdo.fecha_compromiso) : undefined,
              };
            }),
          ),
        },
      },
      include: {
        createdBy: { include: { user: true } },
        agreements: {
          include: {
            responsibleMember: { include: { user: true } },
          },
        },
      },
    });

    return this.toActa(minute);
  }

  async listarAcuerdos(actor: McpActor, payload: ListarAcuerdosConsejoPayload = {}): Promise<AcuerdoConsejo[]> {
    const scope = await this.jerarquiaService.getAccessibleOrganizationIds(actor.organizacion_id);
    const agreements = await this.prisma.councilAgreement.findMany({
      where: {
        minute: {
          organizationId: {
            in: payload.organizacion_id ? [payload.organizacion_id] : scope,
          },
        },
        ...(payload.estado ? { status: payload.estado } : {}),
      },
      include: {
        minute: true,
        responsibleMember: { include: { user: true } },
      },
      orderBy: [{ status: 'asc' }, { dueDate: 'asc' }],
    });

    return agreements
      .filter((agreement) => agreement.responsibleMember.user.level < actor.nivel)
      .map((agreement) => this.toAcuerdo(agreement));
  }

  async seguimiento(actor: McpActor, payload: SeguimientoConsejoPayload): Promise<AcuerdoConsejo> {
    const agreement = await this.prisma.councilAgreement.findUnique({
      where: { id: payload.acuerdo_id },
      include: {
        minute: true,
        responsibleMember: { include: { user: true } },
      },
    });

    if (!agreement) {
      throw new NotFoundException('ACUERDO_NO_ENCONTRADO');
    }

    const isResponsible = agreement.responsibleMember.userId === actor.user_id;
    const hierarchyAccess = await this.jerarquiaService.validarAcceso(actor, {
      target_user_id: agreement.responsibleMember.userId,
    });

    if (!isResponsible && !hierarchyAccess.allowed) {
      throw new ForbiddenException('ACCESO_DENEGADO');
    }

    const updated = await this.prisma.councilAgreement.update({
      where: { id: agreement.id },
      data: {
        status: payload.estado,
        followUpComment: payload.comentario,
        completedAt: payload.estado === 'completado' ? new Date() : null,
      },
      include: {
        minute: true,
        responsibleMember: { include: { user: true } },
      },
    });

    return this.toAcuerdo(updated);
  }

  private toActa(minute: {
    id: string;
    title: string;
    summary: string | null;
    meetingDate: Date;
    organizationId: string;
    createdBy: { userId: string };
    agreements: Array<{
      id: string;
      minuteId: string;
      title: string;
      description: string | null;
      status: 'pendiente' | 'en_progreso' | 'completado';
      followUpComment: string | null;
      dueDate: Date | null;
      completedAt: Date | null;
      responsibleMember: { userId: string };
    }>;
  }): ActaConsejo {
    return {
      id: minute.id,
      organizacion_id: minute.organizationId,
      titulo: minute.title,
      resumen: minute.summary ?? undefined,
      fecha_reunion: minute.meetingDate.toISOString(),
      creado_por_user_id: minute.createdBy.userId,
      acuerdos: minute.agreements.map((agreement) => ({
        id: agreement.id,
        acta_id: agreement.minuteId,
        titulo: agreement.title,
        descripcion: agreement.description ?? undefined,
        responsable_user_id: agreement.responsibleMember.userId,
        estado: agreement.status,
        comentario_seguimiento: agreement.followUpComment ?? undefined,
        fecha_compromiso: agreement.dueDate?.toISOString(),
        completado_en: agreement.completedAt?.toISOString(),
      })),
    };
  }

  private toAcuerdo(agreement: {
    id: string;
    minuteId: string;
    title: string;
    description: string | null;
    status: 'pendiente' | 'en_progreso' | 'completado';
    followUpComment: string | null;
    dueDate: Date | null;
    completedAt: Date | null;
    responsibleMember: { userId: string };
  }): AcuerdoConsejo {
    return {
      id: agreement.id,
      acta_id: agreement.minuteId,
      titulo: agreement.title,
      descripcion: agreement.description ?? undefined,
      responsable_user_id: agreement.responsibleMember.userId,
      estado: agreement.status,
      comentario_seguimiento: agreement.followUpComment ?? undefined,
      fecha_compromiso: agreement.dueDate?.toISOString(),
      completado_en: agreement.completedAt?.toISOString(),
    };
  }
}
