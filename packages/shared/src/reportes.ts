export interface ReportesBasePayload {
  organizacion_id?: string;
}

export interface ResumenOrganizacion {
  organizacion_id: string;
  nombre: string;
  organizaciones_hijas: number;
  miembros_activos: number;
  tareas_pendientes: number;
  tareas_completadas: number;
  acuerdos_abiertos: number;
  ultima_reunion_consejo?: string;
}

export interface IndicadoresReporte {
  organizaciones_en_scope: number;
  miembros_activos: number;
  miembros_inactivos: number;
  tareas_totales: number;
  tareas_completadas: number;
  tareas_vencidas_o_abiertas: number;
  acuerdos_totales: number;
  acuerdos_completados: number;
  acuerdos_abiertos: number;
  tasa_cumplimiento_tareas: number;
  tasa_cumplimiento_acuerdos: number;
}

export interface AlertaReporte {
  tipo: 'tarea_abierta' | 'acuerdo_vencido' | 'miembro_inactivo';
  severidad: 'media' | 'alta';
  titulo: string;
  descripcion: string;
  organizacion_id: string;
  referencia_id: string;
}
