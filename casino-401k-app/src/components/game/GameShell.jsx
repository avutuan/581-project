const GameShell = ({ title, description, meta = [], children, sidebar, footer }) => {
  return (
    <div className="game-shell">
      <header className="game-shell__header">
        <div>
          <p className="game-shell__eyebrow">Sprint 1 Feature</p>
          <h1>{title}</h1>
          {description && <p className="game-shell__description">{description}</p>}
        </div>
        {meta.length > 0 && (
          <ul className="game-shell__meta">
            {meta.map((item) => (
              <li key={item.label}>
                <span className="game-shell__meta-label">{item.label}</span>
                <span className="game-shell__meta-value">{item.value}</span>
              </li>
            ))}
          </ul>
        )}
      </header>

      <div className="game-shell__body">
        <section className="game-shell__playfield">
          {children}
        </section>
        <aside className="game-shell__sidebar">
          {sidebar}
        </aside>
      </div>

      {footer && (
        <footer className="game-shell__footer">
          {footer}
        </footer>
      )}
    </div>
  );
};

export default GameShell;
