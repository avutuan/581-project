import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useSupabaseAuth } from '../../context/SupabaseAuthContext.jsx';
import { useSupabaseAccount } from '../../context/SupabaseAccountContext.jsx';

const ProtectedRoute = () => {
  const { isAuthenticated, isReady } = useSupabaseAuth();
  const { isReady: ledgerReady } = useSupabaseAccount();
  const location = useLocation();

  if (!isReady || !ledgerReady) {
    return (
      <div className="loading-screen">
        <h2>Loading your satirical ledger…</h2>
        <p>Calculating how risky today wants to be.</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
