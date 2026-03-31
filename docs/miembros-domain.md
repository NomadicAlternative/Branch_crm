# Dominio Miembros

## Objetivo

Gestionar el ciclo básico de miembros respetando siempre el alcance jerárquico resuelto por el dominio `jerarquia`.

## Acciones iniciales

- `crear`
- `actualizar`
- `listar`
- `obtener_por_id`

## Regla crítica

`miembros` no decide permisos por su cuenta: siempre consulta a `JerarquiaService`.

## Implementación actual

- `apps/api/src/miembros/miembros.service.ts` contiene la lógica de negocio.
- `apps/api/src/miembros/miembros.controller.ts` expone endpoints base.
- `apps/api/src/prisma/prisma.service.ts` provee persistencia real para consultas y mutaciones del dominio.
- `packages/shared/src/miembros.ts` define contratos compartidos.

## Notas

- `listar` nunca devuelve usuarios fuera del scope jerárquico del actor.
- `crear` y `actualizar` recalculan `nivel` a partir del `rol`.
- `miembros` ya consulta y escribe en Prisma; `tareas` reutiliza Prisma para validar asignaciones de miembros aunque todavía persista tareas en memoria.
