# Prisma y persistencia

## Objetivo

Mover el sistema desde seeds en memoria hacia PostgreSQL con Prisma sin romper la interfaz pública de los dominios.

## Base incluida

- `prisma/schema.prisma` con modelos iniciales para `Organization`, `User`, `Member` y `Task`.
- `apps/api/src/prisma/prisma.service.ts` como cliente global de NestJS.
- `apps/api/src/prisma/prisma.module.ts` para inyección de dependencias.
- scripts raíz y de API para `generate`, `migrate` y `studio`.

## Estrategia recomendada

1. Crear migración inicial.
2. Cargar datos semilla equivalentes a los arrays en memoria.
3. Introducir repositorios Prisma por dominio.
4. Sustituir gradualmente `*.data.ts` sin cambiar contratos ni servicios públicos.

## Estado actual

- Migración inicial aplicada.
- `jerarquia` ya consulta `Organization`, `User` y `Member` mediante Prisma.
- `miembros` ya consulta y escribe `User` + `Member` mediante Prisma.
- `tareas` ya consulta y escribe `Task` mediante Prisma.
- `consejo` ya consulta y escribe `CouncilMinute` + `CouncilAgreement` mediante Prisma.
- `reportes` ya consolida métricas y alertas directamente desde Prisma.
- `prisma/seed.mjs` carga jerarquía, miembros, tareas y consejo para desarrollo local.

## Pendiente

- Endurecer validaciones/transacciones y autenticación según necesidades de producción.
