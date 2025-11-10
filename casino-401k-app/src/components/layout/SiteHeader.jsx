/**
 * ----------------------------------------------------------
 * SiteHeader Component
 * ----------------------------------------------------------
 * Author: John Tran
 * Last Modified: 2025/11/9
 *
 * Description:
 * This React component renders the site header for the casino 401k app.
 * It includes the brand logo, navigation links, and user account information.
 * ----------------------------------------------------------
 */

import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useSupabaseAuth } from '../../context/SupabaseAuthContext.jsx';
import { useSupabaseAccount } from '../../context/SupabaseAccountContext.jsx';

// SiteHeader component definition
const SiteHeader = () => {
  // Hooks and context
  const navigate = useNavigate();
  const { isAuthenticated, currentUser, logout } = useSupabaseAuth();
  const { balance } = useSupabaseAccount();

  // Handle user logout
  const handleLogout = () => {
    logout();
    navigate('/');
  };

  // Render the site header
  return (
    // Header element
    <header className="site-header">
      <div className="site-header__brand">
        {/* Brand logo and name */}
        <Link to="/" className="brand-link">
          <img src="/chip.svg" alt="401k Casino chip" className="brand-logo" />
          <span className="brand-name">401k Casino</span>
        </Link>
        <p className="brand-tagline">Sprint 2 • Satirical gaming</p>
      </div>

      {/* Navigation links */}
      <nav className="site-nav">
        {/* Home link */}
        <NavLink to="/" className={({ isActive }) => isActive ? 'nav-link nav-link--active' : 'nav-link'}>
          Home
        </NavLink>
        {/* Lobby link */}
        <NavLink to="/lobby" className={({ isActive }) => isActive ? 'nav-link nav-link--active' : 'nav-link'}>
          Lobby
        </NavLink>
        {/* Blackjack link */}
        <NavLink to="/game/blackjack" className={({ isActive }) => isActive ? 'nav-link nav-link--active' : 'nav-link'}>
          Blackjack
        </NavLink>
        {/* High-Low link */}
        <NavLink to="/game/high-low" className={({ isActive }) => isActive ? 'nav-link nav-link--active' : 'nav-link'}>
          High-Low
        </NavLink>
        {/* Slots Mini link */}
        <NavLink to="/game/slots" className={({ isActive }) => isActive ? 'nav-link nav-link--active' : 'nav-link'}>
          Slots Mini
        </NavLink>
      </nav>

      {/* User account information */}
      <div className="site-header__actions">
        {/* User chip */}
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
