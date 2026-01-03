
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppRoute, DailyProgress } from '../types';
import { Layout } from '../components/Layout';
import { 
  Gamepad2, Heart, Lock, CheckCircle, Target, X, Trophy, Rocket, 
  Palette, Brush, BookOpen, Play, ChevronRight, Zap, ZapOff, Sparkles
} from 'lucide-react';
import { getDailyProgress, getGoals, checkUnlock, fetchRemoteProgress } from '../services/progressService';
import { isAIAvailable } from '../services/geminiService';

declare global {
  interface AIStudio {
    hasSelectedApiKey: () => Promise<boolean>;
    openSelectKey: () => Promise<void>;
  }
  interface Window {
    // Removed readonly to match other potential declarations of aistudio in the global environment
    aistudio: AIStudio;
  }
}

const MathIcon = () => (
  <svg viewBox="0 0 100 100" className="w-full h-full">
    <circle cx="50" cy="50" r="45" fill="#d1fae5" />
    <path d="M30 50 L70 50 M50 30 L50 70" stroke="#10b981" strokeWidth="8" strokeLinecap="round" />
    <text x="65" y="40" fontSize="20" fill="#10b981" fontWeight="bold">1</text>
    <text x="25" y="75" fontSize="20" fill="#10b981" fontWeight="bold">2</text>
  </svg>
);

const WordsIcon = () => (
  <svg viewBox="0 0 100 100" className="w-full h-full">
    <rect x="15" y="15" width="70" height="70" rx="15" fill="#dbeafe" />
    <text x="50" y="65" fontSize="50" fontWeight="900" fill="#3b82f6" textAnchor="middle">Aa</text>
  </svg>
);

const Home: React.FC = () => {
  const navigate = useNavigate();
  const [progress, setProgress] = useState<DailyProgress | null>(null);
  const [showMissionModal, setShowMissionModal] = useState(false);
  const [showUnlockBanner, setShowUnlockBanner] = useState(false);
  const [aiActive, setAiActive] = useState(false);

  const GOALS = getGoals();

  useEffect(() => {
    initApp();
  }, []);

  const initApp = async () => {
    // 1. Verifica status da IA
    const hasKey = await checkAIStatus();
    setAiActive(hasKey);

    // 2. Carrega Progresso
    const localP = getDailyProgress();
    setProgress(localP);

    // 3. Sync Remoto
    fetchRemoteProgress().then(remoteP => {
        if (remoteP) {
            setProgress(remoteP);
            const wasLocked = !localP.arcadeUnlocked;
            if (wasLocked && checkUnlock(remoteP)) setShowUnlockBanner(true);
        }
    });
  };

  const checkAIStatus = async (): Promise<boolean> => {
    if (window.aistudio) {
        return await window.aistudio.hasSelectedApiKey();
    }
    return isAIAvailable();
  };

  const handleActivateAI = async () => {
    if (window.aistudio) {
        await window.aistudio.openSelectKey();
        // Após abrir o seletor, assumimos sucesso conforme instruções do SDK
        setAiActive(true);
    }
  };

  if (!progress) return null;

  const isMathDone = progress.mathCount >= GOALS.MATH;
  const isWordsDone = progress.wordLevel >= GOALS.WORDS_LEVEL;
  const isFaithDone = progress.faithDone;
  const isArcadeUnlocked = progress.arcadeUnlocked;

  const totalTasks = 7;
  const completedTasks = [
    isMathDone, isWordsDone, isFaithDone, 
    progress.mazesSolved >= GOALS.MAZES, 
    (progress.wordSearchSolved || 0) >= GOALS.WORD_SEARCH, 
    (progress.puzzlesSolved || 0) >= GOALS.PUZZLES, 
    (progress.shadowSolved || 0) >= GOALS.SHADOW
  ].filter(Boolean).length;
  
  const progressPercent = Math.round((completedTasks / totalTasks) * 100);

  return (
    <Layout title="Home">
      <div className="flex flex-col gap-4 pb-6">
        
        {/* --- AI ACTIVATION BANNER --- */}
        {!aiActive && (
            <button 
                onClick={handleActivateAI}
                className="bg-gradient-to-r from-indigo-600 to-fuchsia-600 p-4 rounded-[2rem] text-white flex items-center gap-4 shadow-lg animate-pulse border-b-4 border-indigo-800 active:scale-95 transition-transform"
            >
                <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center">
                    <Sparkles className="text-yellow-300" fill="currentColor" />
                </div>
                <div className="text-left">
                    <span className="block font-black text-lg leading-tight">ATIVAR MÁGICA (IA)</span>
                    <span className="text-[10px] font-bold opacity-80 uppercase tracking-widest">Toque para conectar sua chave</span>
                </div>
                <ChevronRight className="ml-auto opacity-50" />
            </button>
        )}

        {/* --- HERO: DAILY PROGRESS --- */}
        <button 
           onClick={() => setShowMissionModal(true)}
           className="bg-amber-50 rounded-[2rem] p-4 shadow-sm border-b-4 border-amber-200 relative overflow-hidden active:scale-[0.98] transition-all text-left"
        >
            <div className="flex justify-between items-center mb-3">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-amber-500 shadow-sm border-2 border-amber-100">
                        <Trophy size={20} className="fill-amber-500" />
                    </div>
                    <div>
                        <h2 className="text-xs font-black text-slate-800 uppercase tracking-tight">Missão Diária</h2>
                        <div className="flex items-center gap-1">
                           <span className="text-[10px] font-bold text-slate-500">{progressPercent}% Concluído</span>
                        </div>
                    </div>
                </div>
                <div className="text-right flex flex-col items-end">
                    <div className="flex items-baseline gap-1">
                        <span className="text-2xl font-black text-slate-800">{completedTasks}</span>
                        <span className="text-xs font-bold text-slate-400">/{totalTasks}</span>
                    </div>
                    <div className={`flex items-center gap-1 text-[10px] font-black uppercase tracking-tighter ${aiActive ? 'text-emerald-500' : 'text-slate-400'}`}>
                        {aiActive ? <Zap size={10} className="fill-emerald-500" /> : <ZapOff size={10} />}
                        {aiActive ? 'IA Ativa' : 'IA Offline'}
                    </div>
                </div>
            </div>

            <div className="w-full bg-white h-3 rounded-full overflow-hidden border border-amber-100">
                <div 
                    className="h-full bg-gradient-to-r from-amber-400 to-orange-500 transition-all duration-1000 ease-out rounded-full" 
                    style={{ width: `${Math.max(5, progressPercent)}%` }} 
                />
            </div>
        </button>

        {/* --- APRENDER --- */}
        <div className="bg-emerald-50 rounded-3xl p-4 py-4">
            <h3 className="text-lg font-black text-slate-800 mb-2 px-2">Vamos Aprender</h3>
            <div className="grid grid-cols-2 gap-3">
                <button onClick={() => navigate(AppRoute.MATH)} className="bg-white border-b-4 border-emerald-200 p-4 rounded-3xl active:border-b-0 active:translate-y-1 transition-all flex flex-col items-center justify-center gap-2 h-32 relative">
                    {isMathDone && <div className="absolute top-2 right-2 text-emerald-500 bg-white rounded-full p-1 shadow-sm"><CheckCircle size={14} /></div>}
                    <div className="w-12 h-12"><MathIcon /></div>
                    <span className="font-black text-emerald-700">Matemática</span>
                </button>
                <button onClick={() => navigate(AppRoute.WORDS)} className="bg-white border-b-4 border-sky-200 p-4 rounded-3xl active:border-b-0 active:translate-y-1 transition-all flex flex-col items-center justify-center gap-2 h-32 relative">
                    {isWordsDone && <div className="absolute top-2 right-2 text-sky-500 bg-white rounded-full p-1 shadow-sm"><CheckCircle size={14} /></div>}
                    <div className="w-12 h-12"><WordsIcon /></div>
                    <span className="font-black text-sky-700">Palavras</span>
                </button>
            </div>
        </div>

        {/* --- RELAXAR (IA) --- */}
        <div className="bg-violet-50 rounded-3xl p-4 py-4">
            <h3 className="text-lg font-black text-slate-800 mb-2 px-2">Mundo da Imaginação</h3>
            <div className="space-y-3">
                <button onClick={() => navigate(AppRoute.STORY)} className="w-full bg-white border-b-4 border-violet-200 p-5 rounded-[2rem] active:border-b-0 active:translate-y-1 transition-all flex items-center gap-5">
                    <div className="w-14 h-14 bg-violet-200 rounded-2xl flex items-center justify-center text-violet-600 shrink-0">
                        <BookOpen size={32} />
                    </div>
                    <div className="text-left flex-1">
                        <span className="block font-black text-violet-800 text-xl">Histórias Mágicas</span>
                        <span className="text-xs text-violet-500 font-bold uppercase tracking-widest">Criar com IA</span>
                    </div>
                    <ChevronRight className="text-violet-200" />
                </button>

                <button onClick={() => navigate(AppRoute.FAITH)} className="w-full bg-white border-b-4 border-cyan-200 p-5 rounded-[2rem] active:border-b-0 active:translate-y-1 transition-all flex items-center gap-5">
                    {isFaithDone && <div className="absolute top-3 right-3 text-cyan-500 bg-white rounded-full p-1 shadow-sm"><CheckCircle size={14} /></div>}
                    <div className="w-14 h-14 bg-cyan-200 rounded-2xl flex items-center justify-center text-cyan-700 shrink-0">
                        <Heart size={32} className="fill-cyan-700" />
                    </div>
                    <div className="text-left flex-1">
                        <span className="block font-black text-cyan-800 text-xl">Cantinho da Fé</span>
                        <span className="text-xs text-cyan-600 font-bold uppercase tracking-widest">Devocional IA</span>
                    </div>
                    <ChevronRight className="text-cyan-200" />
                </button>
            </div>
        </div>

        {/* --- ARCADE --- */}
        <button 
          onClick={() => isArcadeUnlocked ? navigate(AppRoute.ARCADE) : setShowMissionModal(true)}
          className={`w-full rounded-[2rem] p-5 text-left relative overflow-hidden flex items-center gap-6 shadow-md transition-all active:scale-95 border-b-8
            ${isArcadeUnlocked ? 'bg-slate-800 text-white border-slate-900' : 'bg-slate-200 text-slate-400 border-slate-300 cursor-not-allowed'}
          `}
        >
           <div className={`w-12 h-12 flex-shrink-0 rounded-2xl flex items-center justify-center ${isArcadeUnlocked ? 'bg-slate-700 text-yellow-400' : 'bg-slate-300 text-slate-400'}`}>
               {isArcadeUnlocked ? <Gamepad2 size={24} /> : <Lock size={24} />}
           </div>
           <div className="relative z-10 flex-1">
              <span className={`text-[10px] font-bold uppercase tracking-wider block ${isArcadeUnlocked ? 'text-slate-400' : 'text-slate-500'}`}>
                  {isArcadeUnlocked ? "Área de Jogos" : "Complete a missão para liberar"}
              </span>
              <span className={`text-xl font-black leading-none ${isArcadeUnlocked ? 'text-white' : 'text-slate-500'}`}>
                  Arcade
              </span>
           </div>
        </button>

        <footer className="text-center mt-4 opacity-40 pb-4">
          <p className="text-[10px] font-bold uppercase tracking-widest">v2.0 Auto-IA Connect</p>
        </footer>

      </div>
    </Layout>
  );
};

export default Home;
