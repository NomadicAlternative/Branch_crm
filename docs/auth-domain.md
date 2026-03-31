# Auth MCP

## Objetivo

Evitar confiar en el actor enviado por cliente y resolver identidad real en backend antes de ejecutar cualquier acción MCP.

## Componentes

- `POST /auth/login` para emitir JWT por email + password
- `AuthGuard` para proteger `POST /mcp`
- `AuthService` para validar credenciales y reconstruir `McpActor` desde Prisma

## Estado actual

- passwords hasheados con `bcryptjs`
- JWT firmado con `JWT_SECRET`
- seed local incluye credenciales de desarrollo

## Credenciales dev

- usuario ejemplo: `presidente.rama@crm.local`
- password ejemplo: `changeme123`

## Pendiente

- refresh tokens
- revocación
- proveedor real de identidad
- rate limiting / lockout de login
