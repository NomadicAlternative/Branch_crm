# Contrato MCP

## Request

```json
{
  "meta": {
    "request_id": "string",
    "timestamp": "ISO",
    "actor": {
      "user_id": "string",
      "rol": "string",
      "organizacion_id": "string",
      "nivel": 0
    }
  },
  "intent": {
    "domain": "miembros | jerarquia | tareas | consejo | reportes",
    "action": "string"
  },
  "payload": {},
  "context": {}
}
```

## Response

```json
{
  "meta": {
    "request_id": "string",
    "status": "success | error"
  },
  "data": {},
  "error": {
    "code": "string",
    "message": "string"
  }
}
```

## Seguridad

1. Validar permisos siempre.
2. Toda validación pasa por `jerarquia`.
3. Nunca confiar en el payload.
4. Nunca devolver datos fuera del alcance jerárquico.
5. Si hay duda de permisos, denegar.
