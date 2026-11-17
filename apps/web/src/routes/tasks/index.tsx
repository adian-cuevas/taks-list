import { createFileRoute, Link } from '@tanstack/react-router';

export const Route = createFileRoute('/tasks/')({
  component: TasksPage,
});

const tasks = [
  { id: 'task-001', title: 'Configurar el proyecto' },
  { id: 'task-002', title: 'Implementar el módulo de tareas' },
  { id: 'task-003', title: 'Escribir pruebas' },
];

function TasksPage() {
  return (
    <section>
      <h1>Mis tareas</h1>
      <p>Listado provisional de tareas.</p>

      <Link to="/tasks/new">Crear tarea</Link>

      <ul>
        {tasks.map((task) => (
          <li key={task.id}>
            <Link to="/tasks/$id" params={{ id: task.id }}>
              {task.title}
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
