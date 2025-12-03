/*
Prologue Comments:
- SiteFooter: This component displays the site footer.
- Inputs: None.
- Outputs: Renders the site footer.
- External sources: None.
- Author: John Tran, Creation date: 2025-11-09
*/

// Component: SiteFooter
// Purpose: Display a satirical disclaimer and a roadmap note.
// Notes: Pure presentational; no props or state required.
const SiteFooter = () => {
  return (
    // Semantic footer element with styling hook class
    <footer className="site-footer">
      {/* Primary disclaimer paragraph about the fictitious nature of the app */}
      <p>
        401k Casino is a satirical project built for coursework. Please do not gamble your retirement,
        or if you do, acknowledge this app definitely isn&apos;t real.
      </p>
      {/* Roadmap / sprint scope clarification */}
      <p className="site-footer__note">
        Sprint 2 &amp; 3 features (wallet panel, more games, fairness blurb) are placeholders until later
        iterations.
      </p>
    </footer>
  );
};

// Export so layout shell can include the footer.
export default SiteFooter;
