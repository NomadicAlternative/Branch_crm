import type { McpActor } from './mcp';

export interface OrganizacionJerarquica {
  id: string;
  nombre: string;
  parent_id: string | null;
  nivel: number;
}

export interface UsuarioJerarquico {
  user_id: string;
  nombre: string;
  rol: string;
  organizacion_id: string;
  nivel: number;
}

export interface ValidarAccesoPayload {
  target_user_id?: string;
  target_organizacion_id?: string;
  required_min_level?: number;
}

export interface ValidarAccesoResultado {
  allowed: boolean;
  reason:
    | 'ACCESS_GRANTED'
    | 'TARGET_USER_NOT_FOUND'
    | 'TARGET_ORG_NOT_FOUND'
    | 'OUT_OF_SCOPE_ORGANIZATION'
    | 'INSUFFICIENT_LEVEL'
    | 'INVALID_TARGET';
  actor_scope: string[];
  target_level?: number;
}

export interface ObtenerSubordinadosPayload {
  include_users?: boolean;
}

export interface ObtenerSubordinadosResultado {
  organizaciones: OrganizacionJerarquica[];
  usuarios: UsuarioJerarquico[];
}

export interface CalcularNivelPayload {
  rol?: string;
  user_id?: string;
}

export interface CalcularNivelResultado {
  nivel: number | null;
  source: 'role-map' | 'user-record' | 'not-found';
}

export interface JerarquiaSnapshot {
  actor: McpActor;
  organizaciones: OrganizacionJerarquica[];
  usuarios: UsuarioJerarquico[];
}
