# ADR 0002: Arquitectura de la API

- Estado: aceptada
- Fecha: 2026-11-16

## Decisiones

- **Capas** `routes -> service -> repository`, cada una como función fábrica con
  dependencias inyectadas. Las rutas solo traducen HTTP; las reglas viven en el servicio;
  solo el repositorio conoce Drizzle.
- **Contratos en Zod puro** (`@task-list/contracts`). `@hono/zod-openapi` los consume tal cual,
  de modo que contracts no depende de Hono y el frontend reutiliza los mismos esquemas.
- **Errores**: un único formato `{ error: { code, message, details? } }`. Los errores de dominio
  (`AppError`) se mapean en un solo `onError`; la validación usa un `defaultHook` propio.
- **Concurrencia optimista**: `PATCH` exige `version`; el `UPDATE` filtra por ella y, si no
  afecta filas, el servicio distingue 404 de 409.
- **Una sola copia de Zod** en el monorepo (misma versión exacta en todos los paquetes).
- **Logs** estructurados con pino; un logger hijo por petición con `requestId`.

## Consecuencias

- El servicio y la app se prueban sin base de datos; Postgres real se reserva para integración.
- Cambiar de ORM o de framework HTTP afecta a una sola capa.
