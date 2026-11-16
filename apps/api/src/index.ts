import { serve } from '@hono/node-server';
import { createDb, pingDatabase } from '@task-list/db';
import { createApp } from './app';
import { loadEnv } from './env';
import { createLogger } from './logger';
import { createTaskRepository } from './modules/tasks/task.repository';
import { createTaskService } from './modules/tasks/task.service';

const env = loadEnv();
const logger = createLogger(env.LOG_LEVEL);
const { db, pool } = createDb(env.DATABASE_URL);

const app = createApp({
  logger,
  corsOrigins: env.CORS_ORIGIN,
  checkDatabase: () => pingDatabase(db),
  taskService: createTaskService(createTaskRepository(db)),
});

const server = serve({ fetch: app.fetch, port: env.PORT, hostname: env.HOST }, (info) => {
  logger.info({ port: info.port, env: env.NODE_ENV }, 'API escuchando');
});

function shutdown(signal: string) {
  logger.info({ signal }, 'Apagando servidor');
  setTimeout(() => process.exit(1), 10_000).unref();
  server.close(async () => {
    await pool.end();
    process.exit(0);
  });
}

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));
