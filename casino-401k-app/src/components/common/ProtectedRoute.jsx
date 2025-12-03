/*
Prologue Comments:
- ProtectedRoute: This component is a route guard that ensures a user is authenticated before rendering a protected route.
- Inputs: None.
- Outputs: Renders the nested route or redirects to the login page.
- External sources: None.
- Author: John Tran, Creation date: 2025-11-09
*/

// Import navigation utilities from React Router: Navigate for redirects,
// Outlet to render nested routes, useLocation to capture current route.
import { Navigate, Outlet, useLocation } from 'react-router-dom';
// Import custom auth context hook to access readiness and auth status.
import { useSupabaseAuth } from '../../context/SupabaseAuthContext.jsx';
// Import custom account context hook to ensure ledger state is initialized.
import { useSupabaseAccount } from '../../context/SupabaseAccountContext.jsx';

// Route guard: ensures auth and account (ledger) contexts are initialized before
// rendering protected routes. If not authenticated, user is redirected to /login.

const ProtectedRoute = () => {
  // Pull the authentication readiness flag and whether the user is logged in.
  const { isAuthenticated, isReady } = useSupabaseAuth();
  // Pull the ledger/account readiness; rename to avoid shadowing isReady.
  const { isReady: ledgerReady } = useSupabaseAccount();
  // Get the current route so we can return here after login.
  const location = useLocation();

  // While either context is still initializing, render a loading placeholder.
  if (!isReady || !ledgerReady) {
    return (
      <div className="loading-screen">
        {/* Friendly loading state while providers finish initialization. */}
        <h2>Loading your satirical ledger…</h2>
        <p>Calculating how risky today wants to be.</p>
      </div>
    );
  }

  // If the user isn't authenticated once providers are ready, redirect to login.
  // Preserve the current location so we can navigate back post-login.
  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  // Otherwise, render the nested protected route content.
  return <Outlet />;
};

// Default export so routes can import this guard.
export default ProtectedRoute;
