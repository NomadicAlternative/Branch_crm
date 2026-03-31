# Dominio Consejo

## Objetivo

Gestionar actas y acuerdos de consejo respetando alcance organizacional y responsabilidad jerárquica.

## Acciones iniciales

- `crear_acta`
- `listar_acuerdos`
- `seguimiento`

## Reglas aplicadas

1. El actor solo puede crear actas dentro de su scope jerárquico.
2. Cada acuerdo debe asignarse a un responsable real de la misma organización del acta.
3. El seguimiento lo puede hacer el responsable o un líder con acceso jerárquico sobre él.
4. Si hay duda de permisos, se deniega.

## Implementación actual

- `apps/api/src/consejo/consejo.service.ts` contiene la lógica de negocio.
- `apps/api/src/consejo/consejo.controller.ts` expone endpoints base.
- `apps/api/src/prisma/prisma.service.ts` provee persistencia real.
- `prisma/seed.mjs` carga una acta base con acuerdos iniciales.
- `packages/shared/src/consejo.ts` define contratos compartidos.
