import { createFileRoute, Link } from '@tanstack/react-router';
import { useTasks } from '../../hooks/tasks/use-tasks';
import { ApiError } from '../../lib/api/client';

export const Route = createFileRoute('/tasks/')({
  component: TasksPage,
});

function TasksPage() {
  const tasksQuery = useTasks();

  if (tasksQuery.isPending) {
    return (
      <section>
        <h1>Mis tareas</h1>
        <p role="status">Cargando tareas...</p>
      </section>
    );
  }

  if (tasksQuery.isError) {
    const message =
      tasksQuery.error instanceof ApiError
        ? tasksQuery.error.message
        : 'No fue posible cargar las tareas.';

    return (
      <section>
        <h1>Mis tareas</h1>
        <p role="alert">{message}</p>
        <button type="button" onClick={() => tasksQuery.refetch()}>
          Reintentar
        </button>
      </section>
    );
  }

  const { items, total, page, totalPages } = tasksQuery.data;

  return (
    <section>
      <h1>Mis tareas</h1>

      <p>
        {total} {total === 1 ? 'tarea registrada' : 'tareas registradas'}
      </p>

      <Link to="/tasks/new">Crear tarea</Link>

      {items.length === 0 ? (
        <p>No hay tareas registradas todavía.</p>
      ) : (
        <ul>
          {items.map((task) => (
            <li key={task.id}>
              <Link to="/tasks/$id" params={{ id: task.id }}>
                {task.title}
              </Link>

              <span> — {task.status}</span>
              <span> — Prioridad: {task.priority}</span>
            </li>
          ))}
        </ul>
      )}

      <p>
        Página {page} de {totalPages}
      </p>
    </section>
  );
}
