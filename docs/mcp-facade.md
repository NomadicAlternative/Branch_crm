# Fachada MCP

## Endpoint

`POST /mcp`

## Autenticación

- requiere `Authorization: Bearer <token>`
- el token se obtiene en `POST /auth/login`
- la fachada ya NO confía en el actor enviado por el cliente como fuente de verdad
- si el `meta.actor` no coincide con el actor resuelto desde el token, la request se rechaza

## Responsabilidad

Recibir requests MCP, validar el sobre mínimo y delegar la ejecución al dominio correcto.

## Endurecimiento actual

- valida claves exactas en `meta`, `intent`, `payload` y `context`
- valida `request_id`, `timestamp` ISO y actor con `nivel` entero
- valida que `domain` y `action` estén dentro del catálogo soportado
- valida payload por dominio/acción con listas blancas de campos y tipos esperados
- rechaza claves inesperadas en payload para reducir superficie de abuso
- normaliza errores de validación como `McpResponse.error`

## Routing soportado

- `jerarquia` → `validar_acceso`, `obtener_subordinados`, `calcular_nivel`
- `miembros` → `crear`, `actualizar`, `listar`, `obtener_por_id`
- `tareas` → `crear`, `asignar`, `completar`
- `consejo` → `crear_acta`, `listar_acuerdos`, `seguimiento`
- `reportes` → `resumen_organizacion`, `indicadores`, `alertas`

## Ejemplo

### Login

```json
{
  "email": "presidente.rama@crm.local",
  "password": "changeme123"
}
```

### MCP autenticado

```json
{
  "meta": {
    "request_id": "req_001",
    "timestamp": "2026-03-31T14:30:00.000Z",
    "actor": {
      "user_id": "u-rama-presidente",
      "rol": "presidente_rama",
      "organizacion_id": "rama-sud",
      "nivel": 100
    }
  },
  "intent": {
    "domain": "reportes",
    "action": "indicadores"
  },
  "payload": {},
  "context": {}
}
```

## Respuesta

Siempre vuelve el contrato MCP:

- `meta.request_id`
- `meta.status`
- `data`
- `error` si corresponde

## Nota

La fachada ya aplica validación estructural estricta y autenticación JWT básica. Lo que todavía falta es hardening productivo: rotación de secretos, refresh tokens, revocación y un proveedor de identidad real.
