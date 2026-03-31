# Dominio Reportes

## Objetivo

Exponer vistas de resumen, indicadores y alertas operativas respetando el alcance jerárquico del actor.

## Acciones iniciales

- `resumen_organizacion`
- `indicadores`
- `alertas`

## Reglas aplicadas

1. Todo reporte valida primero acceso jerárquico a la organización objetivo.
2. Nunca se reportan organizaciones fuera del scope del actor.
3. Las alertas priorizan tareas abiertas, acuerdos vencidos y miembros inactivos.

## Implementación actual

- `apps/api/src/reportes/reportes.service.ts` contiene las consultas agregadas a Prisma.
- `apps/api/src/reportes/reportes.controller.ts` expone endpoints base del dominio.
- `apps/api/src/prisma/prisma.service.ts` provee acceso a datos persistidos.
- `packages/shared/src/reportes.ts` define contratos compartidos.
