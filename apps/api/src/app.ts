import { Scalar } from '@scalar/hono-api-reference';
import { cors } from 'hono/cors';
import { requestId } from 'hono/request-id';
import { secureHeaders } from 'hono/secure-headers';
import type { Logger } from 'pino';
import { handleError, handleNotFound } from './errors';
import { httpLogger } from './middleware/http-logger';
import { createHealthRoutes } from './modules/health/health.routes';
import { createTaskRoutes } from './modules/tasks/task.routes';
import type { TaskService } from './modules/tasks/task.service';
import { createOpenApiRouter } from './openapi';

export interface AppDeps {
  logger: Logger;
  taskService: TaskService;
  checkDatabase: () => Promise<void>;
  corsOrigins: string[];
}

/** Fábrica de la app: no abre conexiones ni lee el entorno, así es fácil de probar. */
export function createApp(deps: AppDeps) {
  const app = createOpenApiRouter();

  app.use(requestId());
  app.use(secureHeaders());
  app.use(cors({ origin: deps.corsOrigins }));
  app.use(httpLogger(deps.logger));
  app.onError(handleError);
  app.notFound(handleNotFound);

  const routes = app
    .route('/', createHealthRoutes(deps.checkDatabase))
    .route('/api/tasks', createTaskRoutes(deps.taskService));

  app.doc31('/openapi.json', {
    openapi: '3.1.0',
    info: { title: 'Task List API', version: '0.1.0' },
  });
  app.get('/docs', Scalar({ url: '/openapi.json' }));

  return routes;
}

/** Tipo de la app, para el cliente tipado del frontend (Fase 3). */
export type AppType = ReturnType<typeof createApp>;
