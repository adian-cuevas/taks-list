import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/tasks/')({
  component: TasksPage,
});

function TasksPage() {
  return (
    <section>
      <h1>Mis tareas</h1>
      <p>Aquí aparecerá el listado de tareas.</p>
    </section>
  );
}
