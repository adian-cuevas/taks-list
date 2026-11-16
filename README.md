# task-list

Monorepo de práctica: aplicación de tareas full-stack construida con estándares profesionales.

## Requisitos

Node >= 26 y pnpm 11.

## Comandos

- `pnpm install`: instala dependencias y activa los hooks.
- `pnpm check`: lint y formato (Biome).
- `pnpm typecheck`: tipos en todos los paquetes (Turborepo).
- `pnpm validate`: todo lo anterior.

Decisiones técnicas en `docs/adr/`.

## Problemas conocidos

- **`all predefined address pools have been fully subnetted`** al hacer `pnpm db:up`:
  una VPN activa ocupa todos los rangos que Docker usa. Copia
  `compose.override.example.yaml` a `compose.override.yaml`.
