import { createRootRoute, Link, Outlet } from '@tanstack/react-router';
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools';

function RootLayout() {
  return (
    <>
      <header>
        <nav aria-label="Navegación principal">
          <Link to="/">Inicio</Link>
        </nav>
      </header>

      <main>
        <Outlet />
      </main>

      {import.meta.env.DEV && <TanStackRouterDevtools />}
    </>
  );
}

export const Route = createRootRoute({
  component: RootLayout,
  notFoundComponent: () => (
    <section>
      <h1>404 - Página no encontrada</h1>
      <Link to="/">Volver al inicio</Link>
    </section>
  ),
});
