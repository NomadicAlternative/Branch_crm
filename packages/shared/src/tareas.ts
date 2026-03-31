export type EstadoTarea = 'pendiente' | 'asignada' | 'completada';

export interface Tarea {
  id: string;
  titulo: string;
  descripcion?: string;
  organizacion_id: string;
  creado_por_user_id: string;
  asignado_a_user_id?: string;
  estado: EstadoTarea;
  completado_en?: string;
}

export interface CrearTareaPayload {
  titulo: string;
  descripcion?: string;
  organizacion_id: string;
}

export interface AsignarTareaPayload {
  tarea_id: string;
  asignado_a_user_id: string;
}

export interface CompletarTareaPayload {
  tarea_id: string;
}

export interface ListarTareasPayload {
  organizacion_id?: string;
  estado?: EstadoTarea;
}

export interface ObtenerTareaPorIdPayload {
  tarea_id: string;
}

export interface TareasListResponse {
  items: Tarea[];
  total: number;
}
