import { createFileRoute, Link } from '@tanstack/react-router';

export const Route = createFileRoute('/')({
  component: HomePage,
});

function HomePage() {
  return (
    <section>
      <h1>Task List</h1>

      <p>Gestiona tus tareas desde un solo lugar.</p>

      <Link to="/tasks">Ver mis tareas</Link>
    </section>
  );
}
