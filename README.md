# CRM Rama

Monorepo TypeScript para un CRM jerárquico con contratos MCP, frontend en Next.js y backend en NestJS.

## Estructura

- `apps/web`: aplicación web en Next.js
- `apps/api`: API modular en NestJS
- `packages/shared`: contratos MCP, tipos de dominio y utilidades compartidas
- `packages/ui`: componentes UI compartidos
- `packages/config`: configuración compartida
- `docs`: decisiones de arquitectura y contratos
- `infra`: notas de infraestructura y despliegue

## Stack aprobado

- TypeScript monorepo
- Next.js
- NestJS
- PostgreSQL
- Prisma
- Zod
- pnpm workspaces
- Turborepo

## Bootstrap sugerido

```bash
cp .env.example .env
pnpm install
pnpm db:generate
pnpm db:seed
pnpm dev
```

## PostgreSQL local

Si querés levantar la base local con Docker:

```bash
docker compose -f infra/docker-compose.yml up -d
pnpm db:migrate --name init
pnpm db:seed
```

## Tests MCP

```bash
pnpm --filter @crm/api test
```

## Estado actual

- Backend NestJS con JWT operativo.
- Fachada `POST /mcp` autenticada y validada.
- Persistencia Prisma/PostgreSQL para jerarquía, miembros, tareas, consejo y reportes.
- Frontend Next.js con login, dashboard, miembros, tareas, consejo y reportes.

## Seguridad actual

- La integración recomendada del frontend es `POST /auth/login` + `POST /mcp`.
- Los controladores REST por dominio existen como superficie secundaria, pero ahora también exigen `AuthGuard` y usan el actor autenticado del token en lugar de confiar en datos enviados por el cliente.

## Verificaciones útiles

```bash
pnpm --filter @crm/api typecheck
pnpm --filter @crm/api test
pnpm --filter @crm/web typecheck
pnpm --filter @crm/web build
```

## Próximos pasos recomendados

1. Pulir UX/UI del frontend (toasts, loading states, tablas y feedback de éxito/error).
2. Evaluar si mantener los endpoints REST por dominio o consolidar el uso exclusivo de MCP.
3. Aumentar cobertura de tests para módulos del frontend y auth REST.
4. Preparar commits y documentación final del estado actual.
