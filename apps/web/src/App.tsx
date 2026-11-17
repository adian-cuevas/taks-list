function App() {
  return (
    <main className="app">
      <header className="app-header">
        <a className="brand" href="/">
          <span className="brand-icon">T</span>
          <span>Task List</span>
        </a>

        <span className="status">
          <span className="status-indicator" />
          Frontend preparado
        </span>
      </header>

      <section className="welcome">
        <span className="eyebrow">GESTIÓN DE TAREAS</span>

        <h1>Organiza tu trabajo.</h1>

        <p className="welcome-description">
          Un espacio para organizar, administrar y dar seguimiento a tus tareas.
        </p>

        <div className="status-card">
          <div className="status-card-icon">✓</div>

          <div>
            <h2>Aplicación inicializada</h2>
            <p>
              La estructura del frontend está preparada. Próximamente podrás gestionar tus tareas
              desde aquí.
            </p>
          </div>
        </div>
      </section>

      <footer className="app-footer">
        <span>Task List</span>
        <span>Desarrollo en progreso</span>
      </footer>
    </main>
  );
}

export default App;
