# ADR 0001: Toolchain del monorepo

- Estado: aceptada
- Fecha: 2026-11-16

## Decisiones

| Área               | Elección                          | Motivo                                                                  |
| ------------------ | --------------------------------- | ----------------------------------------------------------------------- |
| Gestor de paquetes | pnpm 11 (workspaces)              | Estable; se evita pnpm 12 (port a Rust) por ser reciente                |
| Orquestación       | Turborepo                         | Caché de tareas probado; Vite+ queda como experimento por estar en beta |
| Lint y formato     | Biome                             | Una sola herramienta; no depende de la API de TypeScript                |
| TypeScript         | `tsc` 7 + alias `typescript` -> 6 | TS 7 aún no expone API; el tooling sigue usando la 6                    |
| Paquetes internos  | Exportan código fuente (.ts)      | Sin build intermedio; los bundlers compilan todo                        |
| Runtime            | Node 26 LTS                       | Soporte hasta abril de 2029                                             |
| Commits            | Conventional Commits + commitlint | Base para changelog y versionado automáticos                            |

## Consecuencias

- Al salir TypeScript 7.1 se podrá retirar el alias a la versión 6.
- Cambiar de gestor o de orquestador implica tocar solo la raíz y los scripts.
