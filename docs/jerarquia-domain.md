# Dominio Jerarquía

## Objetivo

Centralizar la validación de permisos y alcance organizacional para todos los dominios del CRM.

## Capacidades iniciales

- `validar_acceso`
- `obtener_subordinados`
- `calcular_nivel`

## Reglas aplicadas

1. El actor puede acceder a su organización.
2. El actor puede acceder a organizaciones descendientes dentro de su árbol.
3. El actor solo puede actuar sobre usuarios con menor nivel.
4. Si no existe objetivo válido o hay duda de permisos, el acceso se deniega.

## Implementación actual

- `apps/api/src/jerarquia/jerarquia.service.ts` contiene las reglas de negocio.
- `apps/api/src/jerarquia/jerarquia.controller.ts` expone endpoints base del dominio.
- `apps/api/src/prisma/prisma.service.ts` provee persistencia real con PostgreSQL/Prisma.
- `packages/shared/src/jerarquia.ts` define contratos compartidos para otros dominios.
- `prisma/seed.mjs` carga la jerarquía inicial y usuarios base.

## Próxima evolución

Migrar `miembros` y `tareas` para que dependan completamente de Prisma y eliminar definitivamente los arrays en memoria.
