import React from 'react';
import { HashRouter, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import MathBlocks from './pages/MathBlocks';
import ArtStudio from './pages/ArtStudio';
import ColoringBook from './pages/ColoringBook';
import ChallengeArena from './pages/ChallengeArena';
import WordLearning from './pages/WordLearning';
import StoryTime from './pages/StoryTime';
import { AppRoute } from './types';

function App() {
  return (
    <HashRouter>
      <Routes>
        <Route path={AppRoute.HOME} element={<Home />} />
        <Route path={AppRoute.MATH} element={<MathBlocks />} />
        <Route path={AppRoute.ART} element={<ArtStudio />} />
        <Route path={AppRoute.COLORING} element={<ColoringBook />} />
        <Route path={AppRoute.CHALLENGE} element={<ChallengeArena />} />
        <Route path={AppRoute.WORDS} element={<WordLearning />} />
        <Route path={AppRoute.STORY} element={<StoryTime />} />
      </Routes>
    </HashRouter>
  );
}

export default App;