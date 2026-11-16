import { fileURLToPath } from 'node:url';
import { migrate } from 'drizzle-orm/node-postgres/migrator';
import { createDb } from './client';
import { getDatabaseUrl } from './env';

const { db, pool } = createDb(getDatabaseUrl());

try {
  await migrate(db, { migrationsFolder: fileURLToPath(new URL('../migrations', import.meta.url)) });
  console.log('Migraciones aplicadas');
} finally {
  await pool.end();
}
