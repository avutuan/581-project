import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useSupabaseAuth } from '../../context/SupabaseAuthContext.jsx';
import { useSupabaseAccount } from '../../context/SupabaseAccountContext.jsx';

const SiteHeader = () => {
  const navigate = useNavigate();
  const { isAuthenticated, currentUser, logout } = useSupabaseAuth();
  const { balance } = useSupabaseAccount();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <header className="site-header">
      <div className="site-header__brand">
        <Link to="/" className="brand-link">
          <img src="/chip.svg" alt="401k Casino chip" className="brand-logo" />
          <span className="brand-name">401k Casino</span>
        </Link>
        <p className="brand-tagline">Sprint 1 • Satirical retirement gaming</p>
      </div>

      <nav className="site-nav">
        <NavLink to="/" className={({ isActive }) => isActive ? 'nav-link nav-link--active' : 'nav-link'}>
          Home
        </NavLink>
        <NavLink to="/lobby" className={({ isActive }) => isActive ? 'nav-link nav-link--active' : 'nav-link'}>
          Lobby
        </NavLink>
        <NavLink to="/game/blackjack" className={({ isActive }) => isActive ? 'nav-link nav-link--active' : 'nav-link'}>
          Blackjack
        </NavLink>
        <NavLink to="/wallet" className={({ isActive }) => isActive ? 'nav-link nav-link--active' : 'nav-link'}>
          Wallet
        </NavLink>
      </nav>

      <div className="site-header__actions">
        {isAuthenticated ? (
          <>
            <div className="user-chip">
              <span className="user-chip__email">{currentUser?.email}</span>
              <span className="user-chip__balance">{balance.toLocaleString()} tokens</span>
            </div>
            <button type="button" className="cta-button cta-button--ghost" onClick={handleLogout}>
              Log out
            </button>
          </>
        ) : (
          <Link to="/login" className="cta-button cta-button--primary">
            Sign in
          </Link>
        )}
      </div>
    </header>
  );
};

export default SiteHeader;
