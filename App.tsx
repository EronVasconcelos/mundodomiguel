import React, { useEffect } from 'react';
import { HashRouter, Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import Welcome from './pages/Welcome';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ProfileSetup from './pages/ProfileSetup';
import Home from './pages/Home';
import MathBlocks from './pages/MathBlocks';
import ArtStudio from './pages/ArtStudio';
import ColoringBook from './pages/ColoringBook';
import ChallengeArena from './pages/ChallengeArena';
import WordLearning from './pages/WordLearning';
import StoryTime from './pages/StoryTime';
import FaithCorner from './pages/FaithCorner';
import ArcadeHub from './pages/ArcadeHub';
import MemoryGame from './pages/games/MemoryGame';
import SnakeGame from './pages/games/SnakeGame';
import SpaceShooter from './pages/games/SpaceShooter';
import RacingGame from './pages/games/RacingGame';
import { AppRoute } from './types';

// Auth Guard Component
const AuthGuard: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const token = localStorage.getItem('auth_token');
    const profile = localStorage.getItem('child_profile');
    
    const publicRoutes = [AppRoute.WELCOME, AppRoute.LOGIN, AppRoute.REGISTER];
    const isPublic = publicRoutes.includes(location.pathname as AppRoute);

    if (!token && !isPublic) {
      navigate(AppRoute.WELCOME);
    } else if (token && !profile && location.pathname !== AppRoute.PROFILE) {
      // Logged in but no child profile
      navigate(AppRoute.PROFILE);
    }
  }, [location, navigate]);

  return <>{children}</>;
};

function App() {
  return (
    <HashRouter>
      <AuthGuard>
        <Routes>
          <Route path={AppRoute.WELCOME} element={<Welcome />} />
          <Route path={AppRoute.LOGIN} element={<LoginPage />} />
          <Route path={AppRoute.REGISTER} element={<RegisterPage />} />
          <Route path={AppRoute.PROFILE} element={<ProfileSetup />} />
          
          <Route path={AppRoute.HOME} element={<Home />} />
          <Route path={AppRoute.MATH} element={<MathBlocks />} />
          <Route path={AppRoute.ART} element={<ArtStudio />} />
          <Route path={AppRoute.COLORING} element={<ColoringBook />} />
          <Route path={AppRoute.CHALLENGE} element={<ChallengeArena />} />
          <Route path={AppRoute.WORDS} element={<WordLearning />} />
          <Route path={AppRoute.STORY} element={<StoryTime />} />
          <Route path={AppRoute.FAITH} element={<FaithCorner />} />
          
          {/* Arcade Routes */}
          <Route path={AppRoute.ARCADE} element={<ArcadeHub />} />
          <Route path={AppRoute.GAME_MEMORY} element={<MemoryGame />} />
          <Route path={AppRoute.GAME_SNAKE} element={<SnakeGame />} />
          <Route path={AppRoute.GAME_SPACE} element={<SpaceShooter />} />
          <Route path={AppRoute.GAME_RACING} element={<RacingGame />} />
        </Routes>
      </AuthGuard>
    </HashRouter>
  );
}

export default App;