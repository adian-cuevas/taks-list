import { TASK_PRIORITIES, TASK_STATUSES } from '@task-list/contracts';
import { createDb } from './client';
import { getDatabaseUrl } from './env';
import { tasks } from './schema';

if (process.env.NODE_ENV === 'production') {
  throw new Error('El seed no puede ejecutarse en producción');
}

const verbs = ['Revisar', 'Diseñar', 'Implementar', 'Probar', 'Documentar', 'Desplegar'];
const subjects = [
  'login',
  'dashboard',
  'API de pagos',
  'reportes',
  'notificaciones',
  'backups',
  'CI',
  'métricas',
];

const rows = Array.from({ length: 40 }, (_, i) => ({
  title: `${verbs[i % verbs.length]} ${subjects[(i * 3) % subjects.length]} #${i + 1}`,
  description: i % 3 === 0 ? null : `Tarea de ejemplo número ${i + 1}.`,
  status: TASK_STATUSES[i % TASK_STATUSES.length],
  priority: TASK_PRIORITIES[(i * 2) % TASK_PRIORITIES.length],
  dueDate: i % 4 === 0 ? null : `2026-12-${String((i % 28) + 1).padStart(2, '0')}`,
}));

const { db, pool } = createDb(getDatabaseUrl());

try {
  await db.delete(tasks);
  await db.insert(tasks).values(rows);
  console.log(`Seed completado: ${rows.length} tareas`);
} finally {
  await pool.end();
}
