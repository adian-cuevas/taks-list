import { createFileRoute, Link } from '@tanstack/react-router';
import type { TaskPriority, TaskStatus } from '@task-list/contracts';
import { useTask } from '../../hooks/tasks/use-tasks';
import { ApiError } from '../../lib/api/client';

export const Route = createFileRoute('/tasks/$id')({
  component: TaskDetailPage,
});

const statusLabels: Record<TaskStatus, string> = {
  todo: 'Pendiente',
  in_progress: 'En progreso',
  done: 'Completada',
};

const priorityLabels: Record<TaskPriority, string> = {
  low: 'Baja',
  medium: 'Media',
  high: 'Alta',
};

function formatDateTime(value: string): string {
  return new Intl.DateTimeFormat('es', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value));
}

function formatDate(value: string): string {
  const date = new Date(`${value}T00:00:00`);

  return new Intl.DateTimeFormat('es', {
    dateStyle: 'long',
  }).format(date);
}

function TaskDetailPage() {
  const { id } = Route.useParams();
  const taskQuery = useTask(id);

  if (taskQuery.isPending) {
    return (
      <section>
        <h1>Detalle de tarea</h1>
        <p role="status">Cargando tarea...</p>
      </section>
    );
  }

  if (taskQuery.isError) {
    const isNotFound = taskQuery.error instanceof ApiError && taskQuery.error.status === 404;

    const message = isNotFound
      ? 'La tarea que buscas no existe o ha sido eliminada.'
      : taskQuery.error instanceof ApiError
        ? taskQuery.error.message
        : 'No fue posible cargar la tarea.';

    return (
      <section>
        <h1>Detalle de tarea</h1>

        <p role="alert">{message}</p>

        {!isNotFound && (
          <button type="button" onClick={() => taskQuery.refetch()}>
            Reintentar
          </button>
        )}

        <Link to="/tasks">Volver a mis tareas</Link>
      </section>
    );
  }

  const task = taskQuery.data;

  return (
    <section>
      <header>
        <h1>{task.title}</h1>
        <Link to="/tasks">Volver a mis tareas</Link>
      </header>

      <dl>
        <div>
          <dt>Descripción</dt>
          <dd>{task.description || 'Sin descripción'}</dd>
        </div>

        <div>
          <dt>Estado</dt>
          <dd>{statusLabels[task.status]}</dd>
        </div>

        <div>
          <dt>Prioridad</dt>
          <dd>{priorityLabels[task.priority]}</dd>
        </div>

        <div>
          <dt>Fecha límite</dt>
          <dd>{task.dueDate ? formatDate(task.dueDate) : 'Sin fecha límite'}</dd>
        </div>

        <div>
          <dt>Versión</dt>
          <dd>{task.version}</dd>
        </div>

        <div>
          <dt>Creada</dt>
          <dd>{formatDateTime(task.createdAt)}</dd>
        </div>

        <div>
          <dt>Última actualización</dt>
          <dd>{formatDateTime(task.updatedAt)}</dd>
        </div>

        <div>
          <dt>Identificador</dt>
          <dd>{task.id}</dd>
        </div>
      </dl>
    </section>
  );
}
