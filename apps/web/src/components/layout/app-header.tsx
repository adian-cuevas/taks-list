import { Link } from '@tanstack/react-router';
import { CheckSquare, ListTodo, Plus } from 'lucide-react';
import { Button } from '../ui/button';

function AppHeader() {
  return (
    <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-6">
        <Link to="/" className="flex items-center gap-2">
          <div className="flex size-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <CheckSquare className="size-5" />
          </div>

          <span className="text-lg font-semibold tracking-tight">Task List</span>
        </Link>

        <nav aria-label="Navegación principal" className="flex items-center gap-2">
          <Button render={<Link to="/tasks" />} variant="ghost" className="gap-2">
            <ListTodo />
            <span className="hidden sm:inline">Mis tareas</span>
          </Button>

          <Button render={<Link to="/tasks/new" />} className="gap-2">
            <Plus />
            <span>Nueva tarea</span>
          </Button>
        </nav>
      </div>
    </header>
  );
}

export { AppHeader };
