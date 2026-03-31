import {
  CONSEJO_ACTIONS,
  JERARQUIA_ACTIONS,
  MIEMBROS_ACTIONS,
  REPORTES_ACTIONS,
  TAREAS_ACTIONS,
  type Domain,
  type McpRequest,
} from '@crm/shared';

type PlainObject = Record<string, unknown>;

const ACTIONS_BY_DOMAIN: Record<Domain, readonly string[]> = {
  jerarquia: JERARQUIA_ACTIONS,
  miembros: MIEMBROS_ACTIONS,
  tareas: TAREAS_ACTIONS,
  consejo: CONSEJO_ACTIONS,
  reportes: REPORTES_ACTIONS,
};

export class McpValidationError extends Error {
  constructor(
    public readonly code: string,
    message: string,
  ) {
    super(message);
    this.name = 'McpValidationError';
  }
}

export function validateMcpRequest(request: McpRequest): asserts request is McpRequest {
  assertPlainObject(request, 'request', 'INVALID_MCP_REQUEST');
  assertExactKeys(request, ['meta', 'intent', 'payload', 'context'], 'INVALID_MCP_ENVELOPE');

  assertPlainObject(request.meta, 'meta', 'INVALID_MCP_META');
  assertExactKeys(request.meta, ['request_id', 'timestamp', 'actor'], 'INVALID_MCP_META');
  assertString(request.meta.request_id, 'meta.request_id', 'INVALID_REQUEST_ID');
  assertString(request.meta.timestamp, 'meta.timestamp', 'INVALID_TIMESTAMP');

  if (Number.isNaN(Date.parse(request.meta.timestamp))) {
    throw new McpValidationError('INVALID_TIMESTAMP', 'meta.timestamp must be a valid ISO date');
  }

  validateActor(request.meta.actor as unknown as PlainObject);

  assertPlainObject(request.intent, 'intent', 'INVALID_MCP_INTENT');
  assertExactKeys(request.intent, ['domain', 'action'], 'INVALID_MCP_INTENT');
  assertString(request.intent.domain, 'intent.domain', 'INVALID_DOMAIN');
  assertString(request.intent.action, 'intent.action', 'INVALID_ACTION');

  if (!(request.intent.domain in ACTIONS_BY_DOMAIN)) {
    throw new McpValidationError('UNSUPPORTED_DOMAIN', `Unsupported MCP domain: ${request.intent.domain}`);
  }

  if (!ACTIONS_BY_DOMAIN[request.intent.domain as Domain].includes(request.intent.action)) {
    throw new McpValidationError(
      'UNSUPPORTED_ACTION',
      `Unsupported action '${request.intent.action}' for domain '${request.intent.domain}'`,
    );
  }

  assertPlainObject(request.payload, 'payload', 'INVALID_PAYLOAD');
  assertPlainObject(request.context, 'context', 'INVALID_CONTEXT');

  validatePayload(request.intent.domain as Domain, request.intent.action, request.payload);
}

function validateActor(actor: PlainObject) {
  assertPlainObject(actor, 'meta.actor', 'INVALID_ACTOR');
  assertExactKeys(actor, ['user_id', 'rol', 'organizacion_id', 'nivel'], 'INVALID_ACTOR');
  assertString(actor.user_id, 'meta.actor.user_id', 'INVALID_ACTOR');
  assertString(actor.rol, 'meta.actor.rol', 'INVALID_ACTOR');
  assertString(actor.organizacion_id, 'meta.actor.organizacion_id', 'INVALID_ACTOR');
  assertInteger(actor.nivel, 'meta.actor.nivel', 'INVALID_ACTOR');

  if ((actor.nivel as number) < 0) {
    throw new McpValidationError('INVALID_ACTOR', 'meta.actor.nivel must be >= 0');
  }
}

function validatePayload(domain: Domain, action: string, payload: PlainObject) {
  switch (domain) {
    case 'jerarquia':
      return validateJerarquiaPayload(action, payload);
    case 'miembros':
      return validateMiembrosPayload(action, payload);
    case 'tareas':
      return validateTareasPayload(action, payload);
    case 'consejo':
      return validateConsejoPayload(action, payload);
    case 'reportes':
      return validateReportesPayload(payload);
  }
}

function validateJerarquiaPayload(action: string, payload: PlainObject) {
  switch (action) {
    case 'validar_acceso':
      assertAllowedKeys(payload, ['target_user_id', 'target_organizacion_id', 'required_min_level'], 'INVALID_PAYLOAD');
      assertAtLeastOneKey(payload, ['target_user_id', 'target_organizacion_id'], 'INVALID_PAYLOAD');
      assertOptionalString(payload.target_user_id, 'payload.target_user_id', 'INVALID_PAYLOAD');
      assertOptionalString(payload.target_organizacion_id, 'payload.target_organizacion_id', 'INVALID_PAYLOAD');
      assertOptionalInteger(payload.required_min_level, 'payload.required_min_level', 'INVALID_PAYLOAD');
      return;
    case 'obtener_subordinados':
      assertAllowedKeys(payload, ['include_users'], 'INVALID_PAYLOAD');
      assertOptionalBoolean(payload.include_users, 'payload.include_users', 'INVALID_PAYLOAD');
      return;
    case 'calcular_nivel':
      assertAllowedKeys(payload, ['rol', 'user_id'], 'INVALID_PAYLOAD');
      assertAtLeastOneKey(payload, ['rol', 'user_id'], 'INVALID_PAYLOAD');
      assertOptionalString(payload.rol, 'payload.rol', 'INVALID_PAYLOAD');
      assertOptionalString(payload.user_id, 'payload.user_id', 'INVALID_PAYLOAD');
      return;
  }
}

function validateMiembrosPayload(action: string, payload: PlainObject) {
  switch (action) {
    case 'crear':
      assertRequiredStrings(payload, ['nombre', 'email', 'rol', 'organizacion_id'], 'INVALID_PAYLOAD');
      assertAllowedKeys(payload, ['nombre', 'email', 'telefono', 'rol', 'organizacion_id'], 'INVALID_PAYLOAD');
      assertOptionalString(payload.telefono, 'payload.telefono', 'INVALID_PAYLOAD');
      return;
    case 'actualizar':
      assertRequiredStrings(payload, ['miembro_id'], 'INVALID_PAYLOAD');
      assertAllowedKeys(
        payload,
        ['miembro_id', 'nombre', 'email', 'telefono', 'rol', 'organizacion_id', 'activo'],
        'INVALID_PAYLOAD',
      );
      assertOptionalString(payload.nombre, 'payload.nombre', 'INVALID_PAYLOAD');
      assertOptionalString(payload.email, 'payload.email', 'INVALID_PAYLOAD');
      assertOptionalString(payload.telefono, 'payload.telefono', 'INVALID_PAYLOAD');
      assertOptionalString(payload.rol, 'payload.rol', 'INVALID_PAYLOAD');
      assertOptionalString(payload.organizacion_id, 'payload.organizacion_id', 'INVALID_PAYLOAD');
      assertOptionalBoolean(payload.activo, 'payload.activo', 'INVALID_PAYLOAD');
      return;
    case 'listar':
      assertAllowedKeys(payload, ['organizacion_id', 'incluir_inactivos'], 'INVALID_PAYLOAD');
      assertOptionalString(payload.organizacion_id, 'payload.organizacion_id', 'INVALID_PAYLOAD');
      assertOptionalBoolean(payload.incluir_inactivos, 'payload.incluir_inactivos', 'INVALID_PAYLOAD');
      return;
    case 'obtener_por_id':
      assertRequiredStrings(payload, ['miembro_id'], 'INVALID_PAYLOAD');
      assertAllowedKeys(payload, ['miembro_id'], 'INVALID_PAYLOAD');
      return;
  }
}

function validateTareasPayload(action: string, payload: PlainObject) {
  switch (action) {
    case 'crear':
      assertRequiredStrings(payload, ['titulo', 'organizacion_id'], 'INVALID_PAYLOAD');
      assertAllowedKeys(payload, ['titulo', 'descripcion', 'organizacion_id'], 'INVALID_PAYLOAD');
      assertOptionalString(payload.descripcion, 'payload.descripcion', 'INVALID_PAYLOAD');
      return;
    case 'asignar':
      assertRequiredStrings(payload, ['tarea_id', 'asignado_a_user_id'], 'INVALID_PAYLOAD');
      assertAllowedKeys(payload, ['tarea_id', 'asignado_a_user_id'], 'INVALID_PAYLOAD');
      return;
    case 'completar':
      assertRequiredStrings(payload, ['tarea_id'], 'INVALID_PAYLOAD');
      assertAllowedKeys(payload, ['tarea_id'], 'INVALID_PAYLOAD');
      return;
    case 'listar':
      assertAllowedKeys(payload, ['organizacion_id', 'estado'], 'INVALID_PAYLOAD');
      assertOptionalString(payload.organizacion_id, 'payload.organizacion_id', 'INVALID_PAYLOAD');
      assertOptionalString(payload.estado, 'payload.estado', 'INVALID_PAYLOAD');
      return;
    case 'obtener_por_id':
      assertRequiredStrings(payload, ['tarea_id'], 'INVALID_PAYLOAD');
      assertAllowedKeys(payload, ['tarea_id'], 'INVALID_PAYLOAD');
      return;
  }
}

function validateConsejoPayload(action: string, payload: PlainObject) {
  switch (action) {
    case 'crear_acta': {
      assertRequiredStrings(payload, ['organizacion_id', 'titulo', 'fecha_reunion'], 'INVALID_PAYLOAD');
      assertAllowedKeys(payload, ['organizacion_id', 'titulo', 'resumen', 'fecha_reunion', 'acuerdos'], 'INVALID_PAYLOAD');
      assertOptionalString(payload.resumen, 'payload.resumen', 'INVALID_PAYLOAD');

      if (!Array.isArray(payload.acuerdos) || payload.acuerdos.length === 0) {
        throw new McpValidationError('INVALID_PAYLOAD', 'payload.acuerdos must be a non-empty array');
      }

      for (const [index, acuerdo] of payload.acuerdos.entries()) {
        assertPlainObject(acuerdo, `payload.acuerdos[${index}]`, 'INVALID_PAYLOAD');
        assertRequiredStrings(acuerdo, ['titulo', 'responsable_user_id'], 'INVALID_PAYLOAD');
        assertAllowedKeys(
          acuerdo,
          ['titulo', 'descripcion', 'responsable_user_id', 'fecha_compromiso'],
          'INVALID_PAYLOAD',
        );
        assertOptionalString(acuerdo.descripcion, `payload.acuerdos[${index}].descripcion`, 'INVALID_PAYLOAD');
        assertOptionalString(acuerdo.fecha_compromiso, `payload.acuerdos[${index}].fecha_compromiso`, 'INVALID_PAYLOAD');
      }
      return;
    }
    case 'listar_acuerdos':
      assertAllowedKeys(payload, ['organizacion_id', 'estado'], 'INVALID_PAYLOAD');
      assertOptionalString(payload.organizacion_id, 'payload.organizacion_id', 'INVALID_PAYLOAD');
      assertOptionalString(payload.estado, 'payload.estado', 'INVALID_PAYLOAD');
      return;
    case 'seguimiento':
      assertRequiredStrings(payload, ['acuerdo_id', 'estado'], 'INVALID_PAYLOAD');
      assertAllowedKeys(payload, ['acuerdo_id', 'estado', 'comentario'], 'INVALID_PAYLOAD');
      assertOptionalString(payload.comentario, 'payload.comentario', 'INVALID_PAYLOAD');
      return;
  }
}

function validateReportesPayload(payload: PlainObject) {
  assertAllowedKeys(payload, ['organizacion_id'], 'INVALID_PAYLOAD');
  assertOptionalString(payload.organizacion_id, 'payload.organizacion_id', 'INVALID_PAYLOAD');
}

function assertRequiredStrings(payload: PlainObject, keys: string[], code: string) {
  for (const key of keys) {
    assertString(payload[key], `payload.${key}`, code);
  }
}

function assertAtLeastOneKey(payload: PlainObject, keys: string[], code: string) {
  const found = keys.some((key) => payload[key] !== undefined && payload[key] !== null && payload[key] !== '');
  if (!found) {
    throw new McpValidationError(code, `payload must include at least one of: ${keys.join(', ')}`);
  }
}

function assertExactKeys(payload: PlainObject, keys: string[], code: string) {
  assertAllowedKeys(payload, keys, code);

  for (const key of keys) {
    if (!(key in payload)) {
      throw new McpValidationError(code, `Missing required key: ${key}`);
    }
  }
}

function assertAllowedKeys(payload: PlainObject, keys: string[], code: string) {
  const allowed = new Set(keys);
  for (const key of Object.keys(payload)) {
    if (!allowed.has(key)) {
      throw new McpValidationError(code, `Unexpected key: ${key}`);
    }
  }
}

function assertPlainObject(value: unknown, field: string, code: string): asserts value is PlainObject {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    throw new McpValidationError(code, `${field} must be an object`);
  }
}

function assertString(value: unknown, field: string, code: string) {
  if (typeof value !== 'string' || value.trim().length === 0) {
    throw new McpValidationError(code, `${field} must be a non-empty string`);
  }
}

function assertInteger(value: unknown, field: string, code: string) {
  if (typeof value !== 'number' || !Number.isInteger(value)) {
    throw new McpValidationError(code, `${field} must be an integer`);
  }
}

function assertOptionalString(value: unknown, field: string, code: string) {
  if (value !== undefined && value !== null && typeof value !== 'string') {
    throw new McpValidationError(code, `${field} must be a string when present`);
  }
}

function assertOptionalBoolean(value: unknown, field: string, code: string) {
  if (value !== undefined && value !== null && typeof value !== 'boolean') {
    throw new McpValidationError(code, `${field} must be a boolean when present`);
  }
}

function assertOptionalInteger(value: unknown, field: string, code: string) {
  if (value !== undefined && value !== null && (typeof value !== 'number' || !Number.isInteger(value))) {
    throw new McpValidationError(code, `${field} must be an integer when present`);
  }
}
