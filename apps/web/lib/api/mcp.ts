import type {
  ActualizarMiembroPayload,
  AcuerdoConsejo,
  AlertaReporte,
  AsignarTareaPayload,
  CrearActaConsejoPayload,
  CompletarTareaPayload,
  CrearMiembroPayload,
  CrearTareaPayload,
  IndicadoresReporte,
  ListarAcuerdosConsejoPayload,
  McpActor,
  McpRequest,
  McpResponse,
  Miembro,
  MiembrosListResponse,
  ListarTareasPayload,
  Tarea,
  TareasListResponse,
  ReportesBasePayload,
  ResumenOrganizacion,
  SeguimientoConsejoPayload,
} from '@crm/shared';
import { getApiBaseUrl } from './config';

interface SessionLike {
  accessToken: string;
  actor: McpActor;
}

async function callMcp<TData>(
  session: SessionLike,
  domain: McpRequest['intent']['domain'],
  action: string,
  payload: Record<string, unknown> = {},
) {
  const request: McpRequest = {
    meta: {
      request_id: crypto.randomUUID(),
      timestamp: new Date().toISOString(),
      actor: session.actor,
    },
    intent: {
      domain,
      action,
    },
    payload,
    context: {},
  };

  const response = await fetch(`${getApiBaseUrl()}/mcp`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${session.accessToken}`,
    },
    cache: 'no-store',
    body: JSON.stringify(request),
  });

  const data = (await response.json()) as McpResponse;

  if (!response.ok || data.meta.status === 'error') {
    throw new Error(data.error?.message ?? 'Error al consultar MCP');
  }

  return data.data as TData;
}

export function getResumenOrganizacion(session: SessionLike, payload: ReportesBasePayload = {}) {
  return callMcp<ResumenOrganizacion>(session, 'reportes', 'resumen_organizacion', { ...payload });
}

export function getIndicadores(session: SessionLike, payload: ReportesBasePayload = {}) {
  return callMcp<IndicadoresReporte>(session, 'reportes', 'indicadores', { ...payload });
}

export function getAlertas(session: SessionLike, payload: ReportesBasePayload = {}) {
  return callMcp<AlertaReporte[]>(session, 'reportes', 'alertas', { ...payload });
}

export function getMiembros(session: SessionLike, payload: { organizacion_id?: string; incluir_inactivos?: boolean } = {}) {
  return callMcp<MiembrosListResponse>(session, 'miembros', 'listar', { ...payload });
}

export function getMiembroById(session: SessionLike, miembroId: string) {
  return callMcp<Miembro | null>(session, 'miembros', 'obtener_por_id', { miembro_id: miembroId });
}

export function createMiembro(session: SessionLike, payload: CrearMiembroPayload) {
  return callMcp<Miembro>(session, 'miembros', 'crear', { ...payload });
}

export function updateMiembro(
  session: SessionLike,
  miembroId: string,
  payload: Omit<ActualizarMiembroPayload, 'miembro_id'>,
) {
  return callMcp<Miembro | null>(session, 'miembros', 'actualizar', {
    miembro_id: miembroId,
    ...payload,
  });
}

export function getTareas(session: SessionLike, payload: ListarTareasPayload = {}) {
  return callMcp<TareasListResponse>(session, 'tareas', 'listar', { ...payload });
}

export function createTarea(session: SessionLike, payload: CrearTareaPayload) {
  return callMcp<Tarea>(session, 'tareas', 'crear', { ...payload });
}

export function assignTarea(session: SessionLike, payload: AsignarTareaPayload) {
  return callMcp<Tarea>(session, 'tareas', 'asignar', { ...payload });
}

export function completeTarea(session: SessionLike, payload: CompletarTareaPayload) {
  return callMcp<Tarea>(session, 'tareas', 'completar', { ...payload });
}

export function getAcuerdosConsejo(session: SessionLike, payload: ListarAcuerdosConsejoPayload = {}) {
  return callMcp<AcuerdoConsejo[]>(session, 'consejo', 'listar_acuerdos', { ...payload });
}

export function createActaConsejo(session: SessionLike, payload: CrearActaConsejoPayload) {
  return callMcp(session, 'consejo', 'crear_acta', { ...payload });
}

export function seguimientoConsejo(session: SessionLike, payload: SeguimientoConsejoPayload) {
  return callMcp<AcuerdoConsejo>(session, 'consejo', 'seguimiento', { ...payload });
}
