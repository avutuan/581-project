/**
 * ----------------------------------------------------------
 * GameShell Component
 * ----------------------------------------------------------
 * Author: Kevinh Nguyen
 * Last Modified: 2025/11/7
 *
 * Description:
 * This React component acts as a "shell" or layout for a game page.
 * It organizes the page into sections like a header, playfield, sidebar,
 * and optional footer. The component also supports dynamic metadata,
 * like displaying stats or info about the current game feature.
 *
 * Basically, this is like the "frame" around the game content.
 * ----------------------------------------------------------
 */

const GameShell = ({ title, description, meta = [], children, sidebar, footer }) => {
  return (
    <div className="game-shell">
      {/* Header Section - shows title, description, and optional meta info */}
      <header className="game-shell__header">
        <div>
          {/* Static label for which sprint or feature this is */}
          <p className="game-shell__eyebrow">Sprint 1 Feature</p>
          
          {/* Dynamic title passed from props */}
          <h1>{title}</h1>
          
          {/* Optional description (only shows if passed in) */}
          {description && <p className="game-shell__description">{description}</p>}
        </div>

        {/* Optional meta info (like score, version, or player stats) */}
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

      {/* Body Section - contains the main game area and sidebar */}
      <div className="game-shell__body">
        {/* Main playfield - this is where the actual game content goes */}
        <section className="game-shell__playfield">
          {children}
        </section>

        {/* Sidebar - can include menus, stats, or other info */}
        <aside className="game-shell__sidebar">
          {sidebar}
        </aside>
      </div>

      {/* Footer Section - optional, shown only if provided */}
      {footer && (
        <footer className="game-shell__footer">
          {footer}
        </footer>
      )}
    </div>
  );
};

export default GameShell;
