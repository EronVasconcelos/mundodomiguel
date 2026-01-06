
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppRoute, DailyProgress } from '../types';
import { Layout } from '../components/Layout';
import { 
  Gamepad2, Heart, Lock, CheckCircle, Target, X, Trophy, Rocket, 
  Palette, Brush, BookOpen, ChevronRight, Zap, ZapOff, Brain, Search, Puzzle, Ghost
} from 'lucide-react';
import { getDailyProgress, getGoals, fetchRemoteProgress } from '../services/progressService';
import { isAIAvailable } from '../services/geminiService';

declare global {
  interface AIStudio {
    hasSelectedApiKey: () => Promise<boolean>;
    openSelectKey: () => Promise<void>;
  }
  interface Window {
    aistudio?: AIStudio;
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
  const [aiActive, setAiActive] = useState(false);

  const GOALS = getGoals();

  useEffect(() => {
    initApp();
  }, []);

  const initApp = async () => {
    await updateAIStatus();
    const localP = getDailyProgress();
    setProgress(localP);
    fetchRemoteProgress().then(remoteP => {
        if (remoteP) setProgress(remoteP);
    });
  };

  const updateAIStatus = async () => {
    // Check if the hardcoded key or environmental key is active
    const available = isAIAvailable();
    setAiActive(available);

    // If not available and in AI Studio environment, check their dialog
    if (!available && window.aistudio) {
        const hasKey = await window.aistudio.hasSelectedApiKey();
        setAiActive(hasKey);
    }
  };

  const handleAIConnect = async () => {
    if (window.aistudio && !aiActive) {
        await window.aistudio.openSelectKey();
        await updateAIStatus();
    } else if (aiActive) {
        // Silently do nothing or show a "IA Ativa" toast
    } else {
        alert("O Mundo Mágico está operando em modo offline. Conecte-se à internet para as funções de IA.");
    }
  };

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

  const MissionItem = ({ label, current, target, done, icon, route }: any) => (
    <button 
      onClick={() => { setShowMissionModal(false); navigate(route); }}
      className={`w-full flex items-center gap-4 p-3 rounded-2xl border-b-4 active:scale-95 transition-all text-left ${done ? 'bg-green-50 border-green-200' : 'bg-slate-50 border-slate-200'}`}
    >
       <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-white flex-shrink-0 shadow-sm ${done ? 'bg-green-500' : 'bg-slate-200 text-slate-400'}`}>
          {done ? <CheckCircle size={20}/> : icon}
       </div>
       <div className="flex-1">
          <span className={`block font-bold text-sm ${done ? 'text-green-700' : 'text-slate-600'}`}>{label}</span>
          {!done && (
            <div className="w-full bg-slate-200 h-1.5 rounded-full mt-1">
                <div className="h-full bg-blue-400 rounded-full" style={{ width: `${Math.min((typeof current === 'boolean' ? (current ? 100 : 0) : (current/target)*100), 100)}%` }} />
            </div>
          )}
       </div>
       <span className="text-xs font-black text-slate-400">
         {typeof current === 'boolean' ? (current ? '1/1' : '0/1') : `${current}/${target}`}
       </span>
    </button>
  );

  return (
    <Layout title="Home">
      <div className="flex flex-col gap-4 pb-6">
        
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
                        <h2 className="text-xs font-black text-slate-800 uppercase tracking-tight">Missão de Hoje</h2>
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
                    <button 
                        onClick={(e) => { e.stopPropagation(); handleAIConnect(); }}
                        className={`flex items-center gap-1 text-[10px] font-black uppercase tracking-tighter px-2 py-0.5 rounded-full border transition-colors ${aiActive ? 'text-emerald-500 border-emerald-200 bg-emerald-50' : 'text-red-500 border-red-200 bg-red-50'}`}
                    >
                        {aiActive ? <Zap size={10} className="fill-emerald-500" /> : <ZapOff size={10} />}
                        {aiActive ? 'Mundo Conectado' : 'Conectar IA'}
                    </button>
                </div>
            </div>

            <div className="w-full bg-white h-3 rounded-full overflow-hidden border border-amber-100">
                <div 
                    className="h-full bg-gradient-to-r from-amber-400 to-orange-500 transition-all duration-1000 ease-out rounded-full" 
                    style={{ width: `${Math.max(5, progressPercent)}%` }} 
                />
            </div>
        </button>

        <div className="bg-emerald-50 rounded-3xl p-4 py-4">
            <h3 className="text-lg font-black text-slate-800 mb-2 px-2">Escola Encantada</h3>
            <div className="grid grid-cols-2 gap-3">
                <button onClick={() => navigate(AppRoute.MATH)} className="bg-white border-b-4 border-emerald-200 p-4 rounded-3xl active:border-b-0 active:translate-y-1 transition-all flex flex-col items-center justify-center gap-2 h-32 relative">
                    {isMathDone && <div className="absolute top-2 right-2 text-emerald-500 bg-white rounded-full p-1 shadow-sm"><CheckCircle size={14} /></div>}
                    <div className="w-14 h-14"><MathIcon /></div>
                    <span className="font-black text-emerald-700">Matemática</span>
                </button>
                <button onClick={() => navigate(AppRoute.WORDS)} className="bg-white border-b-4 border-sky-200 p-4 rounded-3xl active:border-b-0 active:translate-y-1 transition-all flex flex-col items-center justify-center gap-2 h-32 relative">
                    {isWordsDone && <div className="absolute top-2 right-2 text-sky-500 bg-white rounded-full p-1 shadow-sm"><CheckCircle size={14} /></div>}
                    <div className="w-14 h-14"><WordsIcon /></div>
                    <span className="font-black text-sky-700">Palavras</span>
                </button>
            </div>
        </div>

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

        <div className="bg-orange-50 rounded-3xl p-4 py-4">
            <h3 className="text-lg font-black text-slate-800 mb-2 px-2">Jogos de Lógica</h3>
            <button onClick={() => navigate(AppRoute.CHALLENGE_HUB)} className="w-full bg-white border-b-4 border-orange-200 p-5 rounded-[2rem] active:border-b-0 active:translate-y-1 transition-all flex items-center gap-5 relative">
                <div className="w-14 h-14 bg-orange-100 rounded-2xl flex items-center justify-center text-orange-500 shrink-0">
                    <Brain size={36} />
                </div>
                <div className="text-left flex-1">
                    <span className="block font-black text-orange-800 text-xl">Desafios Mentais</span>
                    <span className="text-xs text-orange-500 font-bold uppercase tracking-widest">Puzzles e Mistérios</span>
                </div>
                <ChevronRight className="text-orange-200" />
            </button>
        </div>

        <div className="bg-pink-50 rounded-3xl p-4 py-4">
            <h3 className="text-lg font-black text-slate-800 mb-2 px-2">Atelier de Arte</h3>
            <div className="flex gap-3">
                <button onClick={() => navigate(AppRoute.ART)} className="flex-1 bg-white p-3 rounded-2xl border-b-4 border-pink-200 active:border-b-0 active:translate-y-1 transition-all flex items-center justify-center gap-2">
                    <Palette size={20} className="text-pink-400" />
                    <span className="font-black text-pink-700">Pintar</span>
                </button>
                <button onClick={() => navigate(AppRoute.COLORING)} className="flex-1 bg-white p-3 rounded-2xl border-b-4 border-fuchsia-200 active:border-b-0 active:translate-y-1 transition-all flex items-center justify-center gap-2">
                    <Brush size={20} className="text-fuchsia-400" />
                    <span className="font-black text-fuchsia-700">Colorir</span>
                </button>
            </div>
        </div>

        <button 
          onClick={() => isArcadeUnlocked ? navigate(AppRoute.ARCADE) : setShowMissionModal(true)}
          className={`w-full rounded-[2.5rem] p-6 text-left relative overflow-hidden flex items-center gap-6 shadow-md transition-all active:scale-95 border-b-8
            ${isArcadeUnlocked ? 'bg-slate-800 text-white border-slate-900' : 'bg-slate-200 text-slate-400 border-slate-300 cursor-not-allowed'}
          `}
        >
           <div className={`w-14 h-14 flex-shrink-0 rounded-2xl flex items-center justify-center ${isArcadeUnlocked ? 'bg-slate-700 text-yellow-400 shadow-lg shadow-yellow-400/20' : 'bg-slate-300 text-slate-400'}`}>
               {isArcadeUnlocked ? <Gamepad2 size={32} /> : <Lock size={32} />}
           </div>
           <div className="relative z-10 flex-1">
              <span className={`text-[10px] font-bold uppercase tracking-widest block mb-1 ${isArcadeUnlocked ? 'text-slate-400' : 'text-slate-500'}`}>
                  {isArcadeUnlocked ? "Área de Diversão Liberada!" : "Complete a missão para liberar"}
              </span>
              <span className={`text-2xl font-black leading-none ${isArcadeUnlocked ? 'text-white' : 'text-slate-500'}`}>
                  Arcade Kids
              </span>
           </div>
           {isArcadeUnlocked && <Rocket className="text-yellow-400 w-24 h-24 absolute -right-4 -bottom-4 rotate-12 opacity-10" />}
        </button>

        {showMissionModal && (
           <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-fade-in" onClick={() => setShowMissionModal(false)}>
              <div className="bg-white w-full max-w-sm rounded-[2.5rem] p-6 shadow-2xl relative animate-slide-up border-4 border-indigo-100" onClick={e => e.stopPropagation()}>
                 <button onClick={() => setShowMissionModal(false)} className="absolute top-4 right-4 text-slate-400 bg-slate-100 rounded-full p-2"><X size={20}/></button>
                 
                 <div className="text-center mb-6">
                    <h2 className="text-2xl font-black text-indigo-900">Missão do Dia 🚀</h2>
                    <p className="text-slate-500 text-sm font-bold">Ganhe estrelas para abrir o Arcade!</p>
                 </div>

                 <div className="space-y-2 mb-6 max-h-[50vh] overflow-y-auto scrollbar-hide">
                    <MissionItem label="Matemática" current={progress.mathCount} target={GOALS.MATH} done={isMathDone} icon="1+2" route={AppRoute.MATH} />
                    <MissionItem label="Aprender Palavras" current={progress.wordLevel} target={GOALS.WORDS_LEVEL} done={isWordsDone} icon="Aa" route={AppRoute.WORDS} />
                    <MissionItem label="Devocional do Dia" current={progress.faithDone} target={true} done={isFaithDone} icon={<Heart size={16}/>} route={AppRoute.FAITH} />
                    <MissionItem label="Labirintos" current={progress.mazesSolved} target={GOALS.MAZES} done={isMazesDone} icon={<Target size={16}/>} route={AppRoute.CHALLENGE} />
                    <MissionItem label="Caça Palavras" current={progress.wordSearchSolved} target={GOALS.WORD_SEARCH} done={isWordSearchDone} icon={<Search size={16}/>} route={AppRoute.WORD_SEARCH} />
                    <MissionItem label="Quebra-Cabeça" current={progress.puzzlesSolved} target={GOALS.PUZZLES} done={isPuzzleDone} icon={<Puzzle size={16}/>} route={AppRoute.PUZZLE} />
                    <MissionItem label="Jogo das Sombras" current={progress.shadowSolved} target={GOALS.SHADOW} done={isShadowDone} icon={<Ghost size={16}/>} route={AppRoute.SHADOW} />
                 </div>

                 {isArcadeUnlocked ? (
                    <button onClick={() => { setShowMissionModal(false); navigate(AppRoute.ARCADE); }} className="w-full py-4 bg-green-500 text-white rounded-2xl font-black text-xl shadow-lg animate-bounce">
                       JOGAR NO ARCADE!
                    </button>
                 ) : (
                    <div className="text-center p-3 bg-slate-50 rounded-2xl text-slate-400 text-xs font-bold uppercase">
                       Faltam {totalTasks - completedTasks} tarefas!
                    </div>
                 )}
              </div>
           </div>
        )}
      </div>
    </Layout>
  );
};

export default Home;
