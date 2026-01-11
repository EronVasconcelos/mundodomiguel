
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
import ChallengeHub from './pages/ChallengeHub';
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
import SplashScreen from './pages/SplashScreen'; // Importação da nova Splash
import { AppRoute } from './types';

// Auth Guard Component
const AuthGuard: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [checking, setChecking] = useState(true);
  const [showSplash, setShowSplash] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data } = await supabase.auth.getSession();
        const session = data?.session;
        
        const publicRoutes = [AppRoute.WELCOME, AppRoute.LOGIN, AppRoute.REGISTER];
        const isPublic = publicRoutes.includes(location.pathname as AppRoute);

        if (!session && !isPublic) {
          navigate(AppRoute.WELCOME);
          setChecking(false);
        } else if (session) {
           // Usuário logado: Ativar Splash apenas se estiver indo para a Home pela primeira vez
           if (location.pathname === AppRoute.HOME || location.pathname === '/') {
              setShowSplash(true);
              // Mantém a splash por 2.5 segundos para o efeito visual
              setTimeout(() => {
                setShowSplash(false);
                setChecking(false);
              }, 2500);
           } else {
              setChecking(false);
           }

           // Validação de perfis em segundo plano
           const storedProfiles = localStorage.getItem('child_profiles');
           if (!storedProfiles || JSON.parse(storedProfiles).length === 0) {
              const { count } = await supabase.from('child_profiles').select('*', { count: 'exact', head: true });
              if ((count || 0) === 0 && location.pathname !== AppRoute.PROFILE) {
                 navigate(AppRoute.PROFILE);
              }
           }
        } else {
           setChecking(false);
        }
      } catch (e) {
        console.warn("Auth check failed", e);
        setChecking(false);
      }
    };

    checkAuth();
  }, []); // Executa apenas no mount inicial

  if (showSplash) return <SplashScreen />;
  if (checking) return null; 

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
          
          <Route path={AppRoute.CHALLENGE_HUB} element={<ChallengeHub />} />
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
