export interface Miembro {
  id: string;
  user_id: string;
  nombre: string;
  email: string;
  telefono?: string;
  rol: string;
  organizacion_id: string;
  nivel: number;
  activo: boolean;
}

export interface CrearMiembroPayload {
  nombre: string;
  email: string;
  telefono?: string;
  rol: string;
  organizacion_id: string;
}

export interface ActualizarMiembroPayload {
  miembro_id: string;
  nombre?: string;
  email?: string;
  telefono?: string;
  rol?: string;
  organizacion_id?: string;
  activo?: boolean;
}

export interface ListarMiembrosPayload {
  organizacion_id?: string;
  incluir_inactivos?: boolean;
}

export interface ObtenerMiembroPorIdPayload {
  miembro_id: string;
}

export interface MiembrosListResponse {
  items: Miembro[];
  total: number;
}
