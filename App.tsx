
import React, { useEffect, useState } from 'react';
import { HashRouter, Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { supabase } from './services/supabase';
import Welcome from './pages/Welcome';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ProfileSetup from './pages/ProfileSetup';
import Home from './pages/Home';
import MathBlocks from './pages/MathBlocks';
import ArtStudio from './pages/ArtStudio';
import ColoringBook from './pages/ColoringBook';
import ChallengeArena from './pages/ChallengeArena';
import WordSearch from './pages/WordSearch';
import PuzzleGame from './pages/PuzzleGame';
import ShadowGame from './pages/ShadowGame';
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
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data } = await supabase.auth.getSession();
        const session = data?.session;
        
        const publicRoutes = [AppRoute.WELCOME, AppRoute.LOGIN, AppRoute.REGISTER];
        const isPublic = publicRoutes.includes(location.pathname as AppRoute);

        if (!session && !isPublic) {
          navigate(AppRoute.WELCOME);
        } else if (session) {
           // Logged in, check if has profiles
           const storedProfiles = localStorage.getItem('child_profiles');
           if (!storedProfiles || JSON.parse(storedProfiles).length === 0) {
              // If no local profiles, double check DB (in case of fresh login on new device)
              const { count } = await supabase.from('child_profiles').select('*', { count: 'exact', head: true });
              if ((count || 0) === 0 && location.pathname !== AppRoute.PROFILE) {
                 navigate(AppRoute.PROFILE);
              }
           }
        }
      } catch (e) {
        console.warn("Auth check failed, assuming offline/logged out", e);
        // Fallback: If auth fails entirely (e.g. invalid URL), go to welcome if not public
        const publicRoutes = [AppRoute.WELCOME, AppRoute.LOGIN, AppRoute.REGISTER];
        if (!publicRoutes.includes(location.pathname as AppRoute)) {
            navigate(AppRoute.WELCOME);
        }
      } finally {
        setChecking(false);
      }
    };

    checkAuth();
  }, [location, navigate]);

  if (checking) return null; // Or a loading spinner

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
          <Route path={AppRoute.WORD_SEARCH} element={<WordSearch />} />
          <Route path={AppRoute.PUZZLE} element={<PuzzleGame />} />
          <Route path={AppRoute.SHADOW} element={<ShadowGame />} />
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
