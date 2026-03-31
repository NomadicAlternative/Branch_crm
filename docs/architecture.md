# Arquitectura inicial

## Objetivo

Base para un CRM jerárquico orientado a dominios con validación de permisos centralizada en `jerarquia`.

## Decisiones

- Monorepo TypeScript con `apps` y `packages`.
- Frontend en Next.js.
- Backend en NestJS como monolito modular.
- Contratos MCP compartidos en `packages/shared`.
- Evolución por dominios: `miembros`, `jerarquia`, `tareas`, `consejo`, `reportes`.

## Regla crítica

Ningún dominio ejecuta acciones sensibles sin validación previa por el dominio `jerarquia`.

## Dominio `jerarquia`

La implementación actual usa Prisma/PostgreSQL para resolver alcance organizacional y nivel de usuario, conservando la misma interfaz pública del servicio.

- `JerarquiaService.validarAcceso(actor, payload)` valida alcance organizacional y nivel relativo.
- `JerarquiaService.obtenerSubordinados(actor, payload)` expone organizaciones y usuarios por debajo del actor.
- `JerarquiaService.calcularNivel(payload)` resuelve nivel por rol o por usuario.

La jerarquía base se carga con `prisma/seed.mjs`; los dominios base ya operan sobre Prisma y el siguiente paso funcional es cerrar `reportes` sobre persistencia real.

## Dominio `miembros`

`miembros` depende explícitamente de `jerarquia` para toda operación sensible.

- `listar` filtra por alcance organizacional y por nivel relativo del actor.
- `obtener_por_id` valida acceso con `JerarquiaService` antes de devolver el registro.
- `crear` y `actualizar` recalculan nivel por rol y deniegan cuando el actor no supera el nivel objetivo.

En la implementación actual, `miembros` ya consulta y escribe directamente sobre Prisma.

## Dominio `tareas`

`tareas` depende de `jerarquia` para validar alcance y de `miembros` para garantizar que los asignados existan dentro de la organización objetivo.

- `crear` valida acceso al ámbito organizacional de la tarea.
- `asignar` exige que actor pueda actuar sobre el miembro asignado y que el miembro pertenezca a la organización de la tarea.
- `completar` permite completar al asignado o a un líder con alcance jerárquico sobre la organización.

## Dominio `consejo`

`consejo` persiste actas y acuerdos usando Prisma, siempre validando alcance y responsables mediante `jerarquia`.

- `crear_acta` crea acta + acuerdos en una organización donde el actor tiene alcance.
- `listar_acuerdos` expone acuerdos subordinados filtrados por scope y estado.
- `seguimiento` permite actualizar el estado del acuerdo al responsable o a un líder con permiso jerárquico.

## Dominio `reportes`

`reportes` consolida datos persistidos de miembros, tareas y consejo usando Prisma, siempre bajo validación previa por `jerarquia`.

- `resumen_organizacion` resume actividad y estado operativo de una organización.
- `indicadores` calcula métricas agregadas de cumplimiento y volumen.
- `alertas` detecta tareas abiertas, acuerdos vencidos y miembros inactivos dentro del scope.

## Fachada MCP

La entrada unificada del backend vive en `POST /mcp` y delega por `domain` + `action` hacia los servicios de dominio.

- valida el sobre MCP mínimo (`meta`, `intent`, `payload`, `context`)
- valida actor, dominio, acción y payload con listas blancas por operación
- exige JWT y resuelve el actor real desde backend
- nunca ejecuta lógica de negocio propia
- normaliza respuestas al contrato `McpResponse`
- traduce errores de dominio a `status: error` con `code` y `message`
