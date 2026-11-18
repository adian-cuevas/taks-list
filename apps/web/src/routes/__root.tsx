import { createRootRoute, Link, Outlet } from '@tanstack/react-router';
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools';
import { AppHeader } from '../components/layout/app-header';

function RootLayout() {
  return (
    <div className="min-h-screen bg-background">
      <AppHeader />

      <main className="mx-auto w-full max-w-6xl">
        <Outlet />
      </main>

      {import.meta.env.DEV && <TanStackRouterDevtools />}
    </div>
  );
}

export const Route = createRootRoute({
  component: RootLayout,
  notFoundComponent: () => (
    <section className="mx-auto max-w-6xl space-y-4 px-6 py-10">
      <h1 className="text-2xl font-semibold">404 - Página no encontrada</h1>

      <Link to="/tasks" className="text-primary underline underline-offset-4">
        Volver a mis tareas
      </Link>
    </section>
  ),
});
