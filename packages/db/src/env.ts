import { existsSync } from 'node:fs';
import { resolve } from 'node:path';

// En desarrollo carga el .env de la raíz; en producción las variables ya vienen inyectadas.
const rootEnv = resolve(process.cwd(), '../../.env');
if (existsSync(rootEnv)) process.loadEnvFile(rootEnv);

export function getDatabaseUrl(): string {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error('DATABASE_URL no está definida (copia .env.example a .env)');
  return url;
}
