/**
 * ----------------------------------------------------------
 * App Component
 * ----------------------------------------------------------
 * Author: John Tran
 * Last Modified: 2025/11/9
 *
 * Description:
 * This is the main application component that sets up routing
 * and the overall layout for the casino 401k app. It includes
 * protected routes for authenticated users and common layout
 * elements like header and footer.
 * ----------------------------------------------------------
 */

import { Route, Routes } from 'react-router-dom';
import SiteHeader from './components/layout/SiteHeader.jsx';
import SiteFooter from './components/layout/SiteFooter.jsx';
import ProtectedRoute from './components/common/ProtectedRoute.jsx';
import LandingPage from './pages/LandingPage.jsx';
import LoginPage from './pages/LoginPage.jsx';
import LobbyPage from './pages/LobbyPage.jsx';
import BlackjackPage from './pages/BlackjackPage.jsx';
import WalletPage from './pages/WalletPage.jsx';
import GamePlaceholderPage from './pages/GamePlaceholderPage.jsx';
import HighLowPage from './pages/HighLowPage.jsx';
import NotFoundPage from './pages/NotFoundPage.jsx';

// App layout component with header, footer, and main content area
const AppLayout = () => (
  // Application shell
  <div className="app-shell">
    {/* Site header */}
    <SiteHeader />
    {/* Site main content area */}
    <main className="app-main">
      {/* Application routes */}
      <Routes>
        {/** Public routes */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        {/** Protected routes */}
        <Route element={<ProtectedRoute />}>
          <Route path="/lobby" element={<LobbyPage />} />
          <Route path="/wallet" element={<WalletPage />} />
          <Route path="/game/blackjack" element={<BlackjackPage />} />
          <Route path="/game/high-low" element={<HighLowPage />} />
          <Route path="/game/:gameId" element={<GamePlaceholderPage />} />
        </Route>
        {/** Fallback route for 404 Not Found */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </main>
    {/* Site footer */}
    <SiteFooter />
  </div>
);

// Main App component
const App = () => {
  return <AppLayout />;
};

export default App;
