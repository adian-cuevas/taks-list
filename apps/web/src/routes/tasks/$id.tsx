import { createFileRoute, Link } from '@tanstack/react-router';

export const Route = createFileRoute('/tasks/$id')({
  component: TaskDetailPage,
});

function TaskDetailPage() {
  const { id } = Route.useParams();

  return (
    <section>
      <h1>Detalle de la tarea</h1>
      <p>
        Identificador: <strong>{id}</strong>
      </p>

      <Link to="/tasks">Volver a mis tareas</Link>
    </section>
  );
}
