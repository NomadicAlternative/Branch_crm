import { ForbiddenException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import type {
  AlertaReporte,
  IndicadoresReporte,
  McpActor,
  ReportesBasePayload,
  ResumenOrganizacion,
} from '@crm/shared';
import { JerarquiaService } from '../jerarquia/jerarquia.service';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ReportesService {
  constructor(
    @Inject(JerarquiaService) private readonly jerarquiaService: JerarquiaService,
    @Inject(PrismaService) private readonly prisma: PrismaService,
  ) {}

  async resumenOrganizacion(
    actor: McpActor,
    payload: ReportesBasePayload = {},
  ): Promise<ResumenOrganizacion> {
    const targetOrgId = payload.organizacion_id ?? actor.organizacion_id;
    await this.ensureOrganizationAccess(actor, targetOrgId);

    const organization = await this.prisma.organization.findUnique({
      where: { id: targetOrgId },
      include: {
        children: true,
        members: { include: { user: true } },
        tasks: true,
        councilMinutes: { orderBy: { meetingDate: 'desc' }, take: 1 },
      },
    });

    if (!organization) {
      throw new NotFoundException('ORGANIZACION_NO_ENCONTRADA');
    }

    const acuerdosAbiertos = await this.prisma.councilAgreement.count({
      where: {
        minute: { organizationId: targetOrgId },
        status: { in: ['pendiente', 'en_progreso'] },
      },
    });

    return {
      organizacion_id: organization.id,
      nombre: organization.name,
      organizaciones_hijas: organization.children.length,
      miembros_activos: organization.members.filter((member) => member.active).length,
      tareas_pendientes: organization.tasks.filter((task) => task.status !== 'completada').length,
      tareas_completadas: organization.tasks.filter((task) => task.status === 'completada').length,
      acuerdos_abiertos: acuerdosAbiertos,
      ultima_reunion_consejo: organization.councilMinutes[0]?.meetingDate.toISOString(),
    };
  }

  async indicadores(
    actor: McpActor,
    payload: ReportesBasePayload = {},
  ): Promise<IndicadoresReporte> {
    const scope = await this.getScopedOrganizations(actor, payload.organizacion_id);

    const [members, tasks, agreements] = await Promise.all([
      this.prisma.member.findMany({
        where: { organizationId: { in: scope } },
      }),
      this.prisma.task.findMany({
        where: { organizationId: { in: scope } },
      }),
      this.prisma.councilAgreement.findMany({
        where: { minute: { organizationId: { in: scope } } },
      }),
    ]);

    const miembrosActivos = members.filter((member) => member.active).length;
    const miembrosInactivos = members.filter((member) => !member.active).length;
    const tareasCompletadas = tasks.filter((task) => task.status === 'completada').length;
    const tareasAbiertas = tasks.filter((task) => task.status !== 'completada').length;
    const acuerdosCompletados = agreements.filter((agreement) => agreement.status === 'completado').length;
    const acuerdosAbiertos = agreements.filter((agreement) => agreement.status !== 'completado').length;

    return {
      organizaciones_en_scope: scope.length,
      miembros_activos: miembrosActivos,
      miembros_inactivos: miembrosInactivos,
      tareas_totales: tasks.length,
      tareas_completadas: tareasCompletadas,
      tareas_vencidas_o_abiertas: tareasAbiertas,
      acuerdos_totales: agreements.length,
      acuerdos_completados: acuerdosCompletados,
      acuerdos_abiertos: acuerdosAbiertos,
      tasa_cumplimiento_tareas: tasks.length === 0 ? 0 : Number(((tareasCompletadas / tasks.length) * 100).toFixed(2)),
      tasa_cumplimiento_acuerdos:
        agreements.length === 0 ? 0 : Number(((acuerdosCompletados / agreements.length) * 100).toFixed(2)),
    };
  }

  async alertas(actor: McpActor, payload: ReportesBasePayload = {}): Promise<AlertaReporte[]> {
    const scope = await this.getScopedOrganizations(actor, payload.organizacion_id);

    const [openTasks, overdueAgreements, inactiveMembers] = await Promise.all([
      this.prisma.task.findMany({
        where: {
          organizationId: { in: scope },
          status: { in: ['pendiente', 'asignada'] },
        },
      }),
      this.prisma.councilAgreement.findMany({
        where: {
          minute: { organizationId: { in: scope } },
          status: { in: ['pendiente', 'en_progreso'] },
          dueDate: { lt: new Date() },
        },
        include: { minute: true },
      }),
      this.prisma.member.findMany({
        where: {
          organizationId: { in: scope },
          active: false,
        },
        include: { user: true },
      }),
    ]);

    const taskAlerts: AlertaReporte[] = openTasks.map((task) => ({
      tipo: 'tarea_abierta',
      severidad: 'media',
      titulo: `Tarea abierta: ${task.title}`,
      descripcion: 'La tarea sigue pendiente o asignada y requiere seguimiento.',
      organizacion_id: task.organizationId,
      referencia_id: task.id,
    }));

    const agreementAlerts: AlertaReporte[] = overdueAgreements.map((agreement) => ({
      tipo: 'acuerdo_vencido',
      severidad: 'alta',
      titulo: `Acuerdo vencido: ${agreement.title}`,
      descripcion: 'El acuerdo está abierto y superó su fecha compromiso.',
      organizacion_id: agreement.minute.organizationId,
      referencia_id: agreement.id,
    }));

    const inactiveAlerts: AlertaReporte[] = inactiveMembers.map((member) => ({
      tipo: 'miembro_inactivo',
      severidad: 'media',
      titulo: `Miembro inactivo: ${member.user.displayName}`,
      descripcion: 'El miembro está marcado como inactivo y requiere revisión.',
      organizacion_id: member.organizationId,
      referencia_id: member.id,
    }));

    return [...agreementAlerts, ...taskAlerts, ...inactiveAlerts];
  }

  private async getScopedOrganizations(actor: McpActor, targetOrganizationId?: string): Promise<string[]> {
    const rootId = targetOrganizationId ?? actor.organizacion_id;
    await this.ensureOrganizationAccess(actor, rootId);
    return this.jerarquiaService.getAccessibleOrganizationIds(rootId);
  }

  private async ensureOrganizationAccess(actor: McpActor, targetOrganizationId: string): Promise<void> {
    const access = await this.jerarquiaService.validarAcceso(actor, {
      target_organizacion_id: targetOrganizationId,
    });

    if (!access.allowed) {
      throw new ForbiddenException('ACCESO_DENEGADO');
    }
  }
}
