export type Domain = 'miembros' | 'jerarquia' | 'tareas' | 'consejo' | 'reportes';

export type HierarquiaAction = 'validar_acceso' | 'obtener_subordinados' | 'calcular_nivel';
export type MiembrosAction = 'crear' | 'actualizar' | 'listar' | 'obtener_por_id';
export type TareasAction = 'crear' | 'asignar' | 'completar' | 'listar' | 'obtener_por_id';
export type ConsejoAction = 'crear_acta' | 'listar_acuerdos' | 'seguimiento';
export type ReportesAction = 'resumen_organizacion' | 'indicadores' | 'alertas';

export const JERARQUIA_ACTIONS: HierarquiaAction[] = [
  'validar_acceso',
  'obtener_subordinados',
  'calcular_nivel',
];

export const MIEMBROS_ACTIONS: MiembrosAction[] = ['crear', 'actualizar', 'listar', 'obtener_por_id'];
export const TAREAS_ACTIONS: TareasAction[] = ['crear', 'asignar', 'completar', 'listar', 'obtener_por_id'];
export const CONSEJO_ACTIONS: ConsejoAction[] = ['crear_acta', 'listar_acuerdos', 'seguimiento'];
export const REPORTES_ACTIONS: ReportesAction[] = ['resumen_organizacion', 'indicadores', 'alertas'];

export interface McpActor {
  user_id: string;
  rol: string;
  organizacion_id: string;
  nivel: number;
}

export interface McpRequest {
  meta: {
    request_id: string;
    timestamp: string;
    actor: McpActor;
  };
  intent: {
    domain: Domain;
    action: string;
  };
  payload: Record<string, unknown>;
  context: Record<string, unknown>;
}

export interface McpResponse {
  meta: {
    request_id: string;
    status: 'success' | 'error';
  };
  data: Record<string, unknown>;
  error?: {
    code: string;
    message: string;
  };
}
