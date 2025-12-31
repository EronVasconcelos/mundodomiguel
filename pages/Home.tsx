
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppRoute, DailyProgress } from '../types';
import { Layout } from '../components/Layout';
import { 
  Gamepad2, Heart, Lock, CheckCircle, Target, X, Trophy, Rocket, 
  Palette, Brush, Search, Puzzle, Ghost, Star, BookOpen, Music, Play, Zap, ChevronRight, Brain
} from 'lucide-react';
import { getDailyProgress, getGoals, checkUnlock, fetchRemoteProgress } from '../services/progressService';

// --- CUSTOM ICONS (SVG) ---
const MathIcon = () => (
  <svg viewBox="0 0 100 100" className="w-full h-full">
    <circle cx="50" cy="50" r="45" fill="#065f46" />
    <path d="M30 50 L70 50 M50 30 L50 70" stroke="#34d399" strokeWidth="8" strokeLinecap="round" />
    <text x="65" y="40" fontSize="20" fill="#34d399" fontWeight="bold">1</text>
    <text x="25" y="75" fontSize="20" fill="#34d399" fontWeight="bold">2</text>
  </svg>
);

const WordsIcon = () => (
  <svg viewBox="0 0 100 100" className="w-full h-full">
    <rect x="15" y="15" width="70" height="70" rx="15" fill="#1e3a8a" />
    <text x="50" y="65" fontSize="50" fontWeight="900" fill="#93c5fd" textAnchor="middle">Aa</text>
  </svg>
);

const Home: React.FC = () => {
  const navigate = useNavigate();
  const [progress, setProgress] = useState<DailyProgress | null>(null);
  const [showMissionModal, setShowMissionModal] = useState(false);
  const [showUnlockBanner, setShowUnlockBanner] = useState(false);

  const GOALS = getGoals();

  useEffect(() => {
    const localP = getDailyProgress();
    setProgress(localP);

    fetchRemoteProgress().then(remoteP => {
        if (remoteP) {
            setProgress(remoteP);
            const wasLocked = !localP.arcadeUnlocked;
            const isNowUnlocked = checkUnlock(remoteP);
            if (wasLocked && isNowUnlocked) setShowUnlockBanner(true);
        } else {
            const wasLocked = !localP.arcadeUnlocked;
            const isNowUnlocked = checkUnlock(localP);
            if (wasLocked && isNowUnlocked) setShowUnlockBanner(true);
        }
    });
  }, []);

  if (!progress) return null;

  const isMathDone = progress.mathCount >= GOALS.MATH;
  const isWordsDone = progress.wordLevel >= GOALS.WORDS_LEVEL;
  const isFaithDone = progress.faithDone;
  const isMazesDone = progress.mazesSolved >= GOALS.MAZES;
  const isWordSearchDone = (progress.wordSearchSolved || 0) >= GOALS.WORD_SEARCH;
  const isPuzzleDone = (progress.puzzlesSolved || 0) >= GOALS.PUZZLES;
  const isShadowDone = (progress.shadowSolved || 0) >= GOALS.SHADOW;
  const isArcadeUnlocked = progress.arcadeUnlocked;

  const totalTasks = 7;
  const completedTasks = [
    isMathDone, isWordsDone, isFaithDone, isMazesDone, 
    isWordSearchDone, isPuzzleDone, isShadowDone
  ].filter(Boolean).length;
  
  const progressPercent = Math.round((completedTasks / totalTasks) * 100);

  const handleArcadeClick = () => {
    if (isArcadeUnlocked) {
      navigate(AppRoute.ARCADE);
    } else {
      setShowMissionModal(true);
    }
  };

  const MissionItem = ({ label, current, target, done, icon, onClick }: any) => (
    <button onClick={onClick} className={`w-full flex items-center gap-4 p-3 rounded-2xl border-b-4 active:scale-95 active:border-b-0 active:translate-y-1 transition-all text-left ${done ? 'bg-green-900 border-green-700' : 'bg-slate-800 border-slate-700'}`}>
       <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-white flex-shrink-0 shadow-sm ${done ? 'bg-green-700' : 'bg-slate-700 text-slate-400'}`}>
          {done ? <CheckCircle size={20}/> : icon}
       </div>
       <div className="flex-1">
          <span className={`block font-bold text-sm ${done ? 'text-green-200' : 'text-slate-300'}`}>{label}</span>
          {!done && (
            <div className="w-full bg-slate-700 h-2 rounded-full mt-1 overflow-hidden">
                <div className="h-full bg-blue-400 transition-all duration-500" style={{ width: `${Math.min((current/target)*100, 100)}%` }} />
            </div>
          )}
       </div>
       <span className={`text-xs font-black ${done ? 'text-green-300' : 'text-slate-500'}`}>
         {typeof current === 'boolean' ? (current ? '1/1' : '0/1') : `${current}/${target}`}
       </span>
    </button>
  );

  return (
    <Layout title="Home">
      <div className="flex flex-col gap-6 pb-6">
        
        {/* --- HERO: DAILY PROGRESS --- */}
        <button 
           onClick={() => setShowMissionModal(true)}
           className="bg-amber-900 rounded-[2rem] p-5 shadow-sm border-b-4 border-amber-700 relative overflow-hidden active:scale-[0.98] transition-all text-left"
        >
            <div className="flex justify-between items-center mb-4">
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-amber-800 rounded-full flex items-center justify-center text-amber-100 shadow-sm border-2 border-amber-700">
                        <Trophy size={24} className="fill-amber-100" />
                    </div>
                    <div>
                        <h2 className="text-sm font-black text-amber-100 uppercase tracking-tight">Missão Diária</h2>
                        <div className="flex items-center gap-1">
                           <span className="text-xs font-bold text-amber-200">{progressPercent}% Concluído</span>
                        </div>
                    </div>
                </div>
                <div className="text-right">
                    <div className="flex items-baseline gap-1 justify-end">
                        <span className="text-3xl font-black text-white">{completedTasks}</span>
                        <span className="text-sm font-bold text-amber-300">/{totalTasks}</span>
                    </div>
                    <div className="flex items-center gap-1 text-amber-100 text-xs font-bold justify-end">
                        Ver Lista <ChevronRight size={12} />
                    </div>
                </div>
            </div>

            <div className="w-full bg-amber-800 h-4 rounded-full overflow-hidden border border-amber-700">
                <div 
                    className="h-full bg-gradient-to-r from-amber-400 to-orange-500 shadow-[0_0_10px_rgba(251,191,36,0.5)] transition-all duration-1000 ease-out rounded-full" 
                    style={{ width: `${Math.max(5, progressPercent)}%` }} 
                />
            </div>
        </button>

        {/* --- SECTION 1: APRENDER --- */}
        <div className="bg-emerald-800 rounded-3xl p-4 py-6 mb-6">
            <h3 className="text-xl font-black text-white mb-3 px-2 flex items-center gap-2">
                Vamos Aprender
            </h3>
            <div className="grid grid-cols-2 gap-4">
                {/* MATH */}
                <button 
                    onClick={() => navigate(AppRoute.MATH)}
                    className="bg-slate-800 border-b-4 border-emerald-700 p-4 rounded-3xl active:border-b-0 active:translate-y-1 active:bg-emerald-900 transition-all flex flex-col items-center justify-center gap-3 h-40 relative group"
                >
                    {isMathDone && <div className="absolute top-2 right-2 text-emerald-500 bg-emerald-900 rounded-full p-1 shadow-sm"><CheckCircle size={16} /></div>}
                    <div className="w-16 h-16"><MathIcon /></div>
                    <span className="font-black text-emerald-300 text-lg">Matemática</span>
                </button>

                {/* WORDS */}
                <button 
                    onClick={() => navigate(AppRoute.WORDS)}
                    className="bg-slate-800 border-b-4 border-sky-700 p-4 rounded-3xl active:border-b-0 active:translate-y-1 active:bg-sky-900 transition-all flex flex-col items-center justify-center gap-3 h-40 relative group"
                >
                    {isWordsDone && <div className="absolute top-2 right-2 text-sky-500 bg-sky-900 rounded-full p-1 shadow-sm"><CheckCircle size={16} /></div>}
                    <div className="w-16 h-16"><WordsIcon /></div>
                    <span className="font-black text-sky-300 text-lg">Palavras</span>
                </button>
            </div>
        </div>

        {/* --- SECTION 2: RELAXAR --- */}
        <div className="bg-violet-800 rounded-3xl p-4 py-6 mb-6">
            <h3 className="text-xl font-black text-white mb-3 px-2 flex items-center gap-2">
                Hora de Relaxar
            </h3>
            <div className="space-y-3">
                {/* STORIES */}
                <button 
                    onClick={() => navigate(AppRoute.STORY)}
                    className="w-full bg-slate-800 border-b-4 border-violet-700 p-4 rounded-3xl active:border-b-0 active:translate-y-1 active:bg-violet-900 transition-all flex items-center gap-4 relative overflow-hidden"
                >
                    <div className="w-14 h-14 bg-violet-700 rounded-2xl flex items-center justify-center text-violet-200 shrink-0 shadow-sm">
                        <BookOpen size={28} />
                    </div>
                    <div className="text-left flex-1">
                        <span className="block font-black text-violet-300 text-lg">Histórias Mágicas</span>
                        <span className="text-xs text-violet-400 font-bold uppercase">Ler ou Criar com IA</span>
                    </div>
                    <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-violet-400">
                        <Play size={14} fill="currentColor" />
                    </div>
                </button>

                {/* FAITH */}
                <button 
                    onClick={() => navigate(AppRoute.FAITH)}
                    className="w-full bg-slate-800 border-b-4 border-cyan-700 p-4 rounded-3xl active:border-b-0 active:translate-y-1 active:bg-cyan-900 transition-all flex items-center gap-4 relative overflow-hidden"
                >
                     {isFaithDone && <div className="absolute top-4 right-4 text-cyan-500 bg-cyan-900 rounded-full p-1"><CheckCircle size={14} /></div>}
                    <div className="w-14 h-14 bg-cyan-700 rounded-2xl flex items-center justify-center text-cyan-200 shrink-0 shadow-sm">
                        <Heart size={28} className="fill-cyan-200" />
                    </div>
                    <div className="text-left flex-1">
                        <span className="block font-black text-cyan-300 text-lg">Cantinho da Fé</span>
                        <span className="text-xs text-cyan-400 font-bold uppercase">Devocional Diário</span>
                    </div>
                </button>
            </div>
        </div>

        {/* --- SECTION 3: DESAFIOS (Single Large Card) --- */}
        <div className="bg-orange-800 rounded-3xl p-4 py-6 mb-6">
            <h3 className="text-xl font-black text-white mb-3 px-2 flex items-center gap-2">
                Desafios
            </h3>
            <button 
                onClick={() => navigate(AppRoute.CHALLENGE_HUB)}
                className="w-full bg-slate-800 border-b-4 border-orange-700 p-4 rounded-3xl active:border-b-0 active:translate-y-1 active:bg-orange-900 transition-all flex items-center gap-4 relative group"
            >
                <div className="w-14 h-14 bg-orange-700 rounded-2xl flex items-center justify-center text-orange-200 shrink-0">
                    <Target size={32} />
                </div>
                <div className="text-left flex-1">
                    <span className="block font-black text-orange-300 text-lg">Jogos de Lógica</span>
                    <span className="text-xs text-orange-400 font-bold uppercase">Labirinto, Sombra, Puzzle...</span>
                </div>
                <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-orange-400">
                    <ChevronRight size={18} />
                </div>
            </button>
        </div>

        {/* --- SECTION 4: CRIATIVIDADE --- */}
        <div className="bg-fuchsia-800 rounded-3xl p-4 py-6 mb-6">
            <h3 className="text-xl font-black text-white mb-3 px-2 flex items-center gap-2">
                Arte e Cores
            </h3>
            <div className="flex gap-3">
               <button 
                  onClick={() => navigate(AppRoute.ART)}
                  className="flex-1 bg-slate-800 p-3 rounded-2xl border-b-4 border-fuchsia-700 active:border-b-0 active:translate-y-1 active:bg-fuchsia-900 transition-all flex items-center gap-3"
               >
                  <div className="w-10 h-10 bg-slate-700 rounded-full flex items-center justify-center text-fuchsia-300 shadow-sm"><Palette size={20} /></div>
                  <span className="font-black text-fuchsia-300 text-lg">Desenhar</span>
               </button>
               <button 
                  onClick={() => navigate(AppRoute.COLORING)}
                  className="flex-1 bg-slate-800 p-3 rounded-2xl border-b-4 border-pink-700 active:border-b-0 active:translate-y-1 active:bg-pink-900 transition-all flex items-center gap-3"
               >
                  <div className="w-10 h-10 bg-slate-700 rounded-full flex items-center justify-center text-pink-300 shadow-sm"><Brush size={20} /></div>
                  <span className="font-black text-pink-300 text-lg">Colorir</span>
               </button>
            </div>
        </div>

        {/* --- SECTION 5: ARCADE (Banner) --- */}
        <button 
          onClick={handleArcadeClick}
          className={`w-full mt-2 rounded-[2rem] p-6 text-left relative overflow-hidden group flex items-center gap-6 shadow-md transition-all active:scale-95 border-b-8
            ${isArcadeUnlocked 
                ? 'bg-slate-800 text-white border-slate-900 shadow-slate-300' 
                : 'bg-slate-200 text-slate-400 border-slate-300 cursor-not-allowed'}
          `}
        >
           <div className={`w-14 h-14 flex-shrink-0 rounded-2xl flex items-center justify-center ${isArcadeUnlocked ? 'bg-slate-700 text-yellow-400' : 'bg-slate-300 text-slate-400'}`}>
               {isArcadeUnlocked ? <Gamepad2 size={28} /> : <Lock size={28} />}
           </div>
           
           <div className="relative z-10 flex-1">
              <span className={`text-xs font-bold uppercase tracking-wider block ${isArcadeUnlocked ? 'text-slate-400' : 'text-slate-500'}`}>
                  {isArcadeUnlocked ? "Área de Jogos" : "Complete a missão para liberar"}
              </span>
              <span className={`text-2xl font-black leading-none ${isArcadeUnlocked ? 'text-white' : 'text-slate-500'}`}>
                  Arcade
              </span>
           </div>
           {isArcadeUnlocked && <Rocket className="text-yellow-400 w-24 h-24 absolute -right-6 -bottom-6 rotate-12 opacity-20" />}
        </button>

        {/* --- FOOTER --- */}
        <footer className="text-center mt-8 opacity-40 pb-4">
          <p className="text-[10px] font-bold uppercase tracking-widest mb-1">Reinicia diariamente à 00:00h</p>
          <p className="text-[10px]">v1.5 Premium Edition</p>
        </footer>

        {/* --- MISSION MODAL --- */}
        {showMissionModal && (
           <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-fade-in" onClick={() => setShowMissionModal(false)}>
              <div className="bg-slate-900 w-full max-w-sm rounded-[2.5rem] p-6 shadow-2xl relative animate-slide-up border-4 border-indigo-800" onClick={e => e.stopPropagation()}>
                 <button onClick={() => setShowMissionModal(false)} className="absolute top-4 right-4 text-slate-300 bg-slate-800 rounded-full p-2"><X size={20}/></button>
                 
                 <div className="text-center mb-6">
                    <h2 className="text-2xl font-black text-indigo-200">Missão do Dia 🚀</h2>
                    <p className="text-slate-300 text-sm font-bold">Complete para liberar o Arcade!</p>
                 </div>

                 <div className="space-y-3 mb-6 max-h-[60vh] overflow-y-auto scrollbar-hide">
                    <MissionItem 
                       label="Aprender Palavras" 
                       current={progress.wordLevel} 
                       target={GOALS.WORDS_LEVEL} 
                       done={isWordsDone} 
                       icon="Aa"
                       onClick={() => navigate(AppRoute.WORDS)}
                    />
                    <MissionItem 
                       label="Matemática" 
                       current={progress.mathCount} 
                       target={GOALS.MATH} 
                       done={isMathDone} 
                       icon="1+2"
                       onClick={() => navigate(AppRoute.MATH)}
                    />
                    <MissionItem 
                       label="Ler o Devocional" 
                       current={progress.faithDone} 
                       target={true} 
                       done={isFaithDone} 
                       icon={<Heart size={16}/>}
                       onClick={() => navigate(AppRoute.FAITH)}
                    />
                    
                    {/* Atalho para os desafios agora redireciona para o Hub */}
                    <button onClick={() => { setShowMissionModal(false); navigate(AppRoute.CHALLENGE_HUB); }} className={`w-full flex items-center gap-4 p-3 rounded-2xl border-b-4 active:scale-95 active:border-b-0 active:translate-y-1 transition-all text-left bg-slate-800 border-slate-700`}>
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-white flex-shrink-0 shadow-sm bg-slate-700 text-slate-400`}>
                            <Target size={20}/>
                        </div>
                        <div className="flex-1">
                            <span className={`block font-bold text-sm text-slate-300`}>Jogos de Lógica</span>
                            <span className="text-xs font-black text-slate-500">Ver Lista</span>
                        </div>
                    </button>

                 </div>

                 {isArcadeUnlocked ? (
                    <button onClick={() => { setShowMissionModal(false); navigate(AppRoute.ARCADE); }} className="w-full py-4 bg-green-600 text-white rounded-2xl font-black shadow-lg shadow-green-900/50 animate-bounce">
                       JOGAR AGORA!
                    </button>
                 ) : (
                    <div className="text-center p-3 bg-slate-800 rounded-2xl text-slate-500 text-xs font-bold">
                       Continue estudando para liberar!
                    </div>
                 )}
              </div>
           </div>
        )}

        {/* --- UNLOCK BANNER POPUP --- */}
        {showUnlockBanner && (
            <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none">
                <div className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-8 py-4 rounded-full shadow-2xl flex items-center gap-4 animate-pop pointer-events-auto cursor-pointer border-4 border-white" onClick={() => navigate(AppRoute.ARCADE)}>
                   <Trophy className="animate-bounce" size={32} />
                   <div>
                      <span className="block font-black text-xl">ARCADE LIBERADO!</span>
                      <span className="text-sm font-bold text-yellow-100">Toque para jogar</span>
                   </div>
                </div>
            </div>
        )}

      </div>
    </Layout>
  );
};

export default Home;