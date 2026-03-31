# Dominio Tareas

## Objetivo

Gestionar tareas operativas respetando alcance organizacional y subordinación jerárquica.

## Acciones iniciales

- `crear`
- `asignar`
- `completar`

## Reglas aplicadas

1. Nadie crea tareas fuera de su scope jerárquico.
2. Una tarea solo puede asignarse a miembros de la misma organización.
3. El actor debe tener permiso sobre el miembro asignado.
4. Puede completar la tarea el asignado o un líder con alcance sobre esa organización.

## Implementación actual

- `apps/api/src/tareas/tareas.service.ts` contiene la lógica.
- `apps/api/src/tareas/tareas.controller.ts` expone endpoints base.
- `apps/api/src/prisma/prisma.service.ts` provee persistencia real para crear, asignar y completar tareas.
- `packages/shared/src/tareas.ts` define contratos del dominio.

## Estado

- `tareas` ya persiste en Prisma.
- `prisma/seed.mjs` carga tareas iniciales para desarrollo local.
