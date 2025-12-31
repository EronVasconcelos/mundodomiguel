
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppRoute, DailyProgress } from '../types';
import { Layout } from '../components/Layout';
import { CheckCircle, Trophy, Ghost, Search, Puzzle, Target, Brain } from 'lucide-react';
import { getDailyProgress, getGoals } from '../services/progressService';

const ChallengeHub: React.FC = () => {
  const navigate = useNavigate();
  const [progress, setProgress] = useState<DailyProgress | null>(null);
  const GOALS = getGoals();

  useEffect(() => {
    setProgress(getDailyProgress());
  }, []);

  if (!progress) return null;

  const isMazesDone = progress.mazesSolved >= GOALS.MAZES;
  const isWordSearchDone = (progress.wordSearchSolved || 0) >= GOALS.WORD_SEARCH;
  const isPuzzleDone = (progress.puzzlesSolved || 0) >= GOALS.PUZZLES;
  const isShadowDone = (progress.shadowSolved || 0) >= GOALS.SHADOW;

  return (
    <Layout title="Desafios" color="text-orange-500">
      <div className="flex flex-col h-full pb-6">
        
        <div className="mb-6 bg-orange-50 rounded-3xl p-6 border border-orange-100 flex items-center gap-4">
            <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center text-orange-500">
                <Brain size={32} />
            </div>
            <div>
                <h1 className="text-xl font-black text-slate-800">Ginástica Mental</h1>
                <p className="text-sm text-slate-500 font-medium">Jogos para ficar inteligente!</p>
            </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
            
            {/* Labirinto */}
            <button 
                onClick={() => navigate(AppRoute.CHALLENGE)} 
                className="aspect-square bg-white rounded-3xl border-b-4 border-slate-100 active:border-b-0 active:translate-y-1 transition-all flex flex-col items-center justify-center gap-3 relative shadow-sm"
            >
                {isMazesDone && <div className="absolute top-3 right-3 text-green-500 bg-green-50 rounded-full p-1"><CheckCircle size={20} /></div>}
                <div className="w-14 h-14 bg-orange-100 rounded-2xl flex items-center justify-center text-orange-500">
                    <Target size={32} />
                </div>
                <span className="font-black text-slate-700 text-lg">Labirinto</span>
                <span className="text-xs font-bold text-slate-400">{progress.mazesSolved}/{GOALS.MAZES}</span>
            </button>

            {/* Puzzle */}
            <button 
                onClick={() => navigate(AppRoute.PUZZLE)} 
                className="aspect-square bg-white rounded-3xl border-b-4 border-slate-100 active:border-b-0 active:translate-y-1 transition-all flex flex-col items-center justify-center gap-3 relative shadow-sm"
            >
                {isPuzzleDone && <div className="absolute top-3 right-3 text-green-500 bg-green-50 rounded-full p-1"><CheckCircle size={20} /></div>}
                <div className="w-14 h-14 bg-amber-100 rounded-2xl flex items-center justify-center text-amber-500">
                    <Puzzle size={32} />
                </div>
                <span className="font-black text-slate-700 text-lg">Puzzle</span>
                <span className="text-xs font-bold text-slate-400">{progress.puzzlesSolved}/{GOALS.PUZZLES}</span>
            </button>

            {/* Caça Palavras */}
            <button 
                onClick={() => navigate(AppRoute.WORD_SEARCH)} 
                className="aspect-square bg-white rounded-3xl border-b-4 border-slate-100 active:border-b-0 active:translate-y-1 transition-all flex flex-col items-center justify-center gap-3 relative shadow-sm"
            >
                {isWordSearchDone && <div className="absolute top-3 right-3 text-green-500 bg-green-50 rounded-full p-1"><CheckCircle size={20} /></div>}
                <div className="w-14 h-14 bg-rose-100 rounded-2xl flex items-center justify-center text-rose-500">
                    <Search size={32} />
                </div>
                <span className="font-black text-slate-700 text-lg">Caça</span>
                <span className="text-xs font-bold text-slate-400">{progress.wordSearchSolved}/{GOALS.WORD_SEARCH}</span>
            </button>

            {/* Sombras */}
            <button 
                onClick={() => navigate(AppRoute.SHADOW)} 
                className="aspect-square bg-white rounded-3xl border-b-4 border-slate-100 active:border-b-0 active:translate-y-1 transition-all flex flex-col items-center justify-center gap-3 relative shadow-sm"
            >
                {isShadowDone && <div className="absolute top-3 right-3 text-green-500 bg-green-50 rounded-full p-1"><CheckCircle size={20} /></div>}
                <div className="w-14 h-14 bg-indigo-100 rounded-2xl flex items-center justify-center text-indigo-500">
                    <Ghost size={32} />
                </div>
                <span className="font-black text-slate-700 text-lg">Sombra</span>
                <span className="text-xs font-bold text-slate-400">{progress.shadowSolved}/{GOALS.SHADOW}</span>
            </button>

        </div>
      </div>
    </Layout>
  );
};

export default ChallengeHub;
