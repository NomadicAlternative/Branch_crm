export type EstadoAcuerdo = 'pendiente' | 'en_progreso' | 'completado';

export interface CrearAcuerdoConsejoInput {
  titulo: string;
  descripcion?: string;
  responsable_user_id: string;
  fecha_compromiso?: string;
}

export interface CrearActaConsejoPayload {
  organizacion_id: string;
  titulo: string;
  resumen?: string;
  fecha_reunion: string;
  acuerdos: CrearAcuerdoConsejoInput[];
}

export interface ListarAcuerdosConsejoPayload {
  organizacion_id?: string;
  estado?: EstadoAcuerdo;
}

export interface SeguimientoConsejoPayload {
  acuerdo_id: string;
  estado: EstadoAcuerdo;
  comentario?: string;
}

export interface AcuerdoConsejo {
  id: string;
  acta_id: string;
  titulo: string;
  descripcion?: string;
  responsable_user_id: string;
  estado: EstadoAcuerdo;
  comentario_seguimiento?: string;
  fecha_compromiso?: string;
  completado_en?: string;
}

export interface ActaConsejo {
  id: string;
  organizacion_id: string;
  titulo: string;
  resumen?: string;
  fecha_reunion: string;
  creado_por_user_id: string;
  acuerdos: AcuerdoConsejo[];
}
