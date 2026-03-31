# CRM Rama

Monorepo TypeScript para un CRM jerárquico con contratos MCP, frontend en Next.js y backend en NestJS.

## Estructura

- `apps/web`: aplicación web en Next.js (puerto 3000)
- `apps/api`: API modular en NestJS (puerto 3001)
- `packages/shared`: contratos MCP, tipos de dominio y utilidades compartidas
- `packages/ui`: componentes UI compartidos
- `packages/config`: configuración compartida
- `docs`: decisiones de arquitectura y contratos
- `infra`: Docker Compose para PostgreSQL

## Stack aprobado

- TypeScript monorepo
- Next.js 15
- NestJS 11
- PostgreSQL
- Prisma
- Zod
- pnpm workspaces
- Turborepo

## Quick Start

### 1. Levantar PostgreSQL

```bash
docker compose -f infra/docker-compose.yml up -d
```

### 2. Configurar variables de entorno

```bash
cp .env.example .env
cp .env apps/api/.env
```

### 3. Instalar dependencias e inicializar BD

```bash
pnpm install
pnpm db:generate
pnpm db:migrate
pnpm db:seed
```

### 4. Iniciar en modo desarrollo

```bash
pnpm dev
```

Esto levanta:
- **Frontend**: http://localhost:3000
- **API**: http://localhost:3001

## Usuarios de prueba

| Email | Contraseña | Rol |
|-------|------------|-----|
| `presidente.rama@crm.local` | `password123` | Presidente de Rama |
| `consejero.rama@crm.local` | `password123` | Consejero de Rama |
| `jovenes.presidencia@crm.local` | `password123` | Presidenta Jóvenes |
| `miembro.jovenes@crm.local` | `password123` | Miembro |

## Comandos útiles

```bash
# Desarrollo
pnpm dev                          # Levantar frontend + API

# Base de datos
pnpm db:generate                  # Generar cliente Prisma
pnpm db:migrate                   # Aplicar migraciones
pnpm db:seed                      # Cargar datos de prueba
pnpm db:studio                    # Abrir Prisma Studio

# Verificaciones
pnpm --filter @crm/api typecheck  # Verificar tipos API
pnpm --filter @crm/api test       # Tests API
pnpm --filter @crm/web typecheck  # Verificar tipos Web
pnpm --filter @crm/web build      # Build producción Web
```

## Estado actual

- ✅ Backend NestJS con JWT operativo
- ✅ Fachada `POST /mcp` autenticada y validada
- ✅ Persistencia Prisma/PostgreSQL para jerarquía, miembros, tareas, consejo y reportes
- ✅ Frontend Next.js con login, dashboard, miembros, tareas, consejo y reportes
- ✅ Desarrollo con `tsx` para hot-reload sin compilar

## Arquitectura

### Autenticación
- `POST /auth/login` → JWT token
- Todos los endpoints protegidos con `AuthGuard`
- El actor se extrae del token, no del payload

### MCP (Model Context Protocol)
- Fachada única: `POST /mcp`
- Dominios: `jerarquia`, `miembros`, `tareas`, `consejo`, `reportes`
- Validación con Zod

## Troubleshooting

### Puerto en uso
```bash
lsof -ti:3000,3001 | xargs kill -9
```

### Reinstalar dependencias
```bash
rm -rf node_modules apps/*/node_modules packages/*/node_modules
pnpm install
```

## Próximos pasos recomendados

1. Pulir UX/UI del frontend (toasts, loading states, feedback)
2. Aumentar cobertura de tests
3. Evaluar consolidación de endpoints REST vs MCP exclusivo

