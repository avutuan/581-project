import { Route, Routes } from 'react-router-dom';
import SiteHeader from './components/layout/SiteHeader.jsx';
import SiteFooter from './components/layout/SiteFooter.jsx';
import ProtectedRoute from './components/common/ProtectedRoute.jsx';
import LandingPage from './pages/LandingPage.jsx';
import LoginPage from './pages/LoginPage.jsx';
import LobbyPage from './pages/LobbyPage.jsx';
import BlackjackPage from './pages/BlackjackPage.jsx';
import GamePlaceholderPage from './pages/GamePlaceholderPage.jsx';
import NotFoundPage from './pages/NotFoundPage.jsx';

const AppLayout = () => (
  <div className="app-shell">
    <SiteHeader />
    <main className="app-main">
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route element={<ProtectedRoute />}>
          <Route path="/lobby" element={<LobbyPage />} />
          <Route path="/game/blackjack" element={<BlackjackPage />} />
          <Route path="/game/:gameId" element={<GamePlaceholderPage />} />
        </Route>
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </main>
    <SiteFooter />
  </div>
);

const App = () => {
  return <AppLayout />;
};

export default App;
