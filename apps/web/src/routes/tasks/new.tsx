import { createFileRoute, Link } from '@tanstack/react-router';

export const Route = createFileRoute('/tasks/new')({
  component: NewTaskPage,
});

function NewTaskPage() {
  return (
    <section>
      <h1>Nueva tarea</h1>
      <p>Aquí construiremos el formulario para crear una tarea.</p>

      <Link to="/tasks">Volver a mis tareas</Link>
    </section>
  );
}
