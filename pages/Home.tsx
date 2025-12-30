
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
    <button onClick={onClick} className={`w-full flex items-center gap-4 p-3 rounded-2xl border-b-4 active:scale-95 active:border-b-0 active:translate-y-1 transition-all text-left ${done ? 'bg-green-50 border-green-200' : 'bg-white border-slate-100'}`}>
       <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-white flex-shrink-0 shadow-sm ${done ? 'bg-green-500' : 'bg-slate-200 text-slate-400'}`}>
          {done ? <CheckCircle size={20}/> : icon}
       </div>
       <div className="flex-1">
          <span className={`block font-bold text-sm ${done ? 'text-green-700' : 'text-slate-600'}`}>{label}</span>
          {!done && (
            <div className="w-full bg-slate-100 h-2 rounded-full mt-1 overflow-hidden">
                <div className="h-full bg-blue-400 transition-all duration-500" style={{ width: `${Math.min((current/target)*100, 100)}%` }} />
            </div>
          )}
       </div>
       <span className={`text-xs font-black ${done ? 'text-green-600' : 'text-slate-400'}`}>
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
           className="bg-amber-50 rounded-[2rem] p-5 shadow-sm border-b-4 border-amber-200 relative overflow-hidden active:scale-[0.98] transition-all text-left"
        >
            <div className="flex justify-between items-center mb-4">
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-amber-500 shadow-sm border-2 border-amber-100">
                        <Trophy size={24} className="fill-amber-500" />
                    </div>
                    <div>
                        <h2 className="text-sm font-black text-slate-800 uppercase tracking-tight">Missão Diária</h2>
                        <div className="flex items-center gap-1">
                           <span className="text-xs font-bold text-slate-500">{progressPercent}% Concluído</span>
                        </div>
                    </div>
                </div>
                <div className="text-right">
                    <div className="flex items-baseline gap-1 justify-end">
                        <span className="text-3xl font-black text-slate-800">{completedTasks}</span>
                        <span className="text-sm font-bold text-slate-400">/{totalTasks}</span>
                    </div>
                    <div className="flex items-center gap-1 text-amber-600 text-xs font-bold justify-end">
                        Ver Lista <ChevronRight size={12} />
                    </div>
                </div>
            </div>

            <div className="w-full bg-white h-4 rounded-full overflow-hidden border border-amber-100">
                <div 
                    className="h-full bg-gradient-to-r from-amber-400 to-orange-500 shadow-[0_0_10px_rgba(251,191,36,0.5)] transition-all duration-1000 ease-out rounded-full" 
                    style={{ width: `${Math.max(5, progressPercent)}%` }} 
                />
            </div>
        </button>

        {/* --- SECTION 1: APRENDER --- */}
        <div>
            <h3 className="text-xl font-black text-slate-800 mb-3 px-2 flex items-center gap-2">
                <Star size={24} className="text-yellow-400 fill-yellow-400" /> Vamos Aprender
            </h3>
            <div className="grid grid-cols-2 gap-4">
                {/* MATH */}
                <button 
                    onClick={() => navigate(AppRoute.MATH)}
                    className="bg-emerald-50 border-b-4 border-emerald-200 p-4 rounded-3xl active:border-b-0 active:translate-y-1 active:bg-emerald-100 transition-all flex flex-col items-center justify-center gap-3 h-40 relative group"
                >
                    {isMathDone && <div className="absolute top-2 right-2 text-emerald-500 bg-white rounded-full p-1 shadow-sm"><CheckCircle size={16} /></div>}
                    <div className="w-16 h-16"><MathIcon /></div>
                    <span className="font-black text-emerald-700 text-lg">Matemática</span>
                </button>

                {/* WORDS */}
                <button 
                    onClick={() => navigate(AppRoute.WORDS)}
                    className="bg-sky-50 border-b-4 border-sky-200 p-4 rounded-3xl active:border-b-0 active:translate-y-1 active:bg-sky-100 transition-all flex flex-col items-center justify-center gap-3 h-40 relative group"
                >
                    {isWordsDone && <div className="absolute top-2 right-2 text-sky-500 bg-white rounded-full p-1 shadow-sm"><CheckCircle size={16} /></div>}
                    <div className="w-16 h-16"><WordsIcon /></div>
                    <span className="font-black text-sky-700 text-lg">Palavras</span>
                </button>
            </div>
        </div>

        {/* --- SECTION 2: RELAXAR --- */}
        <div>
            <h3 className="text-xl font-black text-slate-800 mb-3 px-2 flex items-center gap-2">
                <Heart size={24} className="text-pink-400 fill-pink-400" /> Hora de Relaxar
            </h3>
            <div className="space-y-3">
                {/* STORIES */}
                <button 
                    onClick={() => navigate(AppRoute.STORY)}
                    className="w-full bg-violet-50 border-b-4 border-violet-200 p-4 rounded-3xl active:border-b-0 active:translate-y-1 active:bg-violet-100 transition-all flex items-center gap-4 relative overflow-hidden"
                >
                    <div className="w-14 h-14 bg-violet-200 rounded-2xl flex items-center justify-center text-violet-600 shrink-0 shadow-sm">
                        <BookOpen size={28} />
                    </div>
                    <div className="text-left flex-1">
                        <span className="block font-black text-violet-800 text-lg">Histórias Mágicas</span>
                        <span className="text-xs text-violet-500 font-bold uppercase">Ler ou Criar com IA</span>
                    </div>
                    <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-violet-300">
                        <Play size={14} fill="currentColor" />
                    </div>
                </button>

                {/* FAITH */}
                <button 
                    onClick={() => navigate(AppRoute.FAITH)}
                    className="w-full bg-cyan-50 border-b-4 border-cyan-200 p-4 rounded-3xl active:border-b-0 active:translate-y-1 active:bg-cyan-100 transition-all flex items-center gap-4 relative overflow-hidden"
                >
                     {isFaithDone && <div className="absolute top-4 right-4 text-cyan-500 bg-white rounded-full p-1"><CheckCircle size={14} /></div>}
                    <div className="w-14 h-14 bg-cyan-200 rounded-2xl flex items-center justify-center text-cyan-700 shrink-0 shadow-sm">
                        <Heart size={28} className="fill-cyan-700" />
                    </div>
                    <div className="text-left flex-1">
                        <span className="block font-black text-cyan-800 text-lg">Cantinho da Fé</span>
                        <span className="text-xs text-cyan-600 font-bold uppercase">Devocional Diário</span>
                    </div>
                </button>
            </div>
        </div>

        {/* --- SECTION 3: DESAFIOS (Single Large Card) --- */}
        <div>
            <h3 className="text-xl font-black text-slate-800 mb-3 px-2 flex items-center gap-2">
                <Brain size={24} className="text-orange-400" /> Desafios
            </h3>
            <button 
                onClick={() => navigate(AppRoute.CHALLENGE_HUB)}
                className="w-full bg-orange-50 border-b-4 border-orange-200 p-4 rounded-3xl active:border-b-0 active:translate-y-1 active:bg-orange-100 transition-all flex items-center gap-4 relative group"
            >
                <div className="w-14 h-14 bg-orange-100 rounded-2xl flex items-center justify-center text-orange-500 shrink-0">
                    <Target size={32} />
                </div>
                <div className="text-left flex-1">
                    <span className="block font-black text-orange-800 text-lg">Jogos de Lógica</span>
                    <span className="text-xs text-orange-500 font-bold uppercase">Labirinto, Sombra, Puzzle...</span>
                </div>
                <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-orange-300">
                    <ChevronRight size={18} />
                </div>
            </button>
        </div>

        {/* --- SECTION 4: CRIATIVIDADE --- */}
        <div>
            <h3 className="text-xl font-black text-slate-800 mb-3 px-2 flex items-center gap-2">
                <Palette size={24} className="text-fuchsia-400" /> Arte e Cores
            </h3>
            <div className="flex gap-3">
               <button 
                  onClick={() => navigate(AppRoute.ART)}
                  className="flex-1 bg-fuchsia-50 p-3 rounded-2xl border-b-4 border-fuchsia-200 active:border-b-0 active:translate-y-1 active:bg-fuchsia-100 transition-all flex items-center gap-3"
               >
                  <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-fuchsia-400 shadow-sm"><Palette size={20} /></div>
                  <span className="font-black text-fuchsia-700 text-lg">Desenhar</span>
               </button>
               <button 
                  onClick={() => navigate(AppRoute.COLORING)}
                  className="flex-1 bg-pink-50 p-3 rounded-2xl border-b-4 border-pink-200 active:border-b-0 active:translate-y-1 active:bg-pink-100 transition-all flex items-center gap-3"
               >
                  <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-pink-400 shadow-sm"><Brush size={20} /></div>
                  <span className="font-black text-pink-700 text-lg">Colorir</span>
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
              <div className="bg-white w-full max-w-sm rounded-[2.5rem] p-6 shadow-2xl relative animate-slide-up border-4 border-indigo-100" onClick={e => e.stopPropagation()}>
                 <button onClick={() => setShowMissionModal(false)} className="absolute top-4 right-4 text-slate-400 bg-slate-100 rounded-full p-2"><X size={20}/></button>
                 
                 <div className="text-center mb-6">
                    <h2 className="text-2xl font-black text-indigo-900">Missão do Dia 🚀</h2>
                    <p className="text-slate-500 text-sm font-bold">Complete para liberar o Arcade!</p>
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
                    <button onClick={() => { setShowMissionModal(false); navigate(AppRoute.CHALLENGE_HUB); }} className={`w-full flex items-center gap-4 p-3 rounded-2xl border-b-4 active:scale-95 active:border-b-0 active:translate-y-1 transition-all text-left bg-white border-slate-100`}>
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-white flex-shrink-0 shadow-sm bg-slate-200 text-slate-400`}>
                            <Target size={20}/>
                        </div>
                        <div className="flex-1">
                            <span className={`block font-bold text-sm text-slate-600`}>Jogos de Lógica</span>
                            <span className="text-xs font-black text-slate-400">Ver Lista</span>
                        </div>
                    </button>

                 </div>

                 {isArcadeUnlocked ? (
                    <button onClick={() => { setShowMissionModal(false); navigate(AppRoute.ARCADE); }} className="w-full py-4 bg-green-500 text-white rounded-2xl font-black shadow-lg shadow-green-200 animate-bounce">
                       JOGAR AGORA!
                    </button>
                 ) : (
                    <div className="text-center p-3 bg-slate-50 rounded-2xl text-slate-400 text-xs font-bold">
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
