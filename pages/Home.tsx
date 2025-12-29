
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppRoute, DailyProgress } from '../types';
import { Layout } from '../components/Layout';
import { Gamepad2, Heart, Lock, CheckCircle, Target, X, Trophy, Rocket, Palette, Brush, Search } from 'lucide-react';
import { getDailyProgress, getGoals, checkUnlock, fetchRemoteProgress } from '../services/progressService';

// --- STICKER ILLUSTRATIONS ---
const MathIllustration = () => (
  <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-sm">
    <rect x="20" y="20" width="60" height="60" rx="12" fill="#86efac" /> 
    <rect x="20" y="25" width="60" height="60" rx="12" fill="#22c55e" />
    <text x="50" y="68" fontSize="40" fontWeight="900" fill="white" textAnchor="middle">1+2</text>
    <circle cx="85" cy="15" r="10" fill="#dcfce7" opacity="0.8" />
  </svg>
);

const WordsIllustration = () => (
  <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-sm">
    <rect x="25" y="25" width="50" height="50" rx="10" fill="#3b82f6" />
    <text x="50" y="62" fontSize="36" fontWeight="900" fill="white" textAnchor="middle">Aa</text>
  </svg>
);

const StoryIllustration = () => (
  <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-sm">
    <rect x="15" y="25" width="70" height="50" rx="4" fill="#10B981" />
    <path d="M15 35 Q50 35 85 35" stroke="#D1FAE5" strokeWidth="2" fill="none" />
    <path d="M50 25 L50 75" stroke="#047857" strokeWidth="2" />
    <circle cx="30" cy="50" r="8" fill="#ECFDF5" />
    <rect x="55" y="45" width="20" height="4" rx="2" fill="#ECFDF5" />
    <rect x="55" y="55" width="15" height="4" rx="2" fill="#ECFDF5" />
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
  const isArcadeUnlocked = progress.arcadeUnlocked;

  const handleArcadeClick = () => {
    if (isArcadeUnlocked) {
      navigate(AppRoute.ARCADE);
    } else {
      setShowMissionModal(true);
    }
  };

  const MissionItem = ({ label, current, target, done, icon, onClick }: any) => (
    <button onClick={onClick} className={`w-full flex items-center gap-4 p-3 rounded-2xl border-2 active:scale-95 transition-transform text-left ${done ? 'bg-green-50 border-green-200' : 'bg-slate-50 border-slate-100'}`}>
       <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white flex-shrink-0 ${done ? 'bg-green-500' : 'bg-slate-300'}`}>
          {done ? <CheckCircle size={20}/> : icon}
       </div>
       <div className="flex-1">
          <span className={`block font-bold text-sm ${done ? 'text-green-700' : 'text-slate-600'}`}>{label}</span>
          <div className="w-full bg-white h-2 rounded-full mt-1 border border-slate-100 overflow-hidden">
             <div className="h-full bg-green-500 transition-all duration-500" style={{ width: `${Math.min((current/target)*100, 100)}%` }} />
          </div>
       </div>
       <span className={`text-xs font-black ${done ? 'text-green-600' : 'text-slate-400'}`}>
         {typeof current === 'boolean' ? (current ? '1/1' : '0/1') : `${current}/${target}`}
       </span>
    </button>
  );

  return (
    <Layout title="Home">
      <div className="flex flex-col gap-6 pb-4 relative">
        
        {/* Header / Mission Button */}
        <div className="flex justify-between items-center px-1">
           <div className="text-left">
              <h1 className="text-3xl font-black text-slate-800 leading-tight">
                Vamos <span className="text-blue-600">Aprender!</span>
              </h1>
              <p className="text-slate-400 font-bold text-sm">Complete a missão para jogar.</p>
           </div>
           
           <button 
             onClick={() => setShowMissionModal(true)}
             className="flex flex-col items-center justify-center bg-white border-2 border-slate-100 rounded-2xl p-2 shadow-sm active:scale-95 transition-transform"
           >
              <div className="relative">
                 <Target size={24} className={isArcadeUnlocked ? "text-green-500" : "text-blue-500"} />
                 {isArcadeUnlocked && <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white"/>}
              </div>
              <span className="text-[10px] font-black uppercase text-slate-400 mt-1">Missão</span>
           </button>
        </div>

        {/* --- LINHA 1: MATEMÁTICA & PALAVRAS --- */}
        <div className="grid grid-cols-2 gap-4">
          {/* MATH (Now GREEN) */}
          <button 
            onClick={() => navigate(AppRoute.MATH)}
            className="bg-green-500 rounded-[2rem] p-5 text-left text-white shadow-[0_10px_20px_-5px_rgba(34,197,94,0.4)] active:scale-95 transition-transform relative overflow-hidden group h-48 flex flex-col justify-between border-b-8 border-green-600 active:border-b-0 active:translate-y-2"
          >
             {isMathDone && <div className="absolute top-3 right-3 bg-white/20 rounded-full p-1"><CheckCircle size={16} className="text-white"/></div>}
             <div className="w-20 h-20 -ml-2">
                <MathIllustration />
             </div>
             
             <div className="relative z-10 mt-auto w-full">
                <span className="text-xs font-bold text-green-100 uppercase tracking-wider block mb-1">Lógica</span>
                <span className="text-xl font-black leading-tight block">Matemática</span>
                {!isMathDone && <div className="absolute bottom-0 right-0 text-[10px] bg-black/20 px-2 py-0.5 rounded-full">{progress.mathCount}/{GOALS.MATH}</div>}
             </div>
          </button>

          {/* WORDS (Now BLUE) */}
          <button 
            onClick={() => navigate(AppRoute.WORDS)}
            className="bg-blue-500 rounded-[2rem] p-5 text-left text-white shadow-[0_10px_20px_-5px_rgba(59,130,246,0.4)] active:scale-95 transition-transform relative overflow-hidden group h-48 flex flex-col justify-between border-b-8 border-blue-600 active:border-b-0 active:translate-y-2"
          >
             {isWordsDone && <div className="absolute top-3 right-3 bg-white/20 rounded-full p-1"><CheckCircle size={16} className="text-white"/></div>}
             <div className="w-20 h-20 -ml-2">
                <WordsIllustration />
             </div>
             <div className="relative z-10 mt-auto w-full">
                <span className="text-xs font-bold text-blue-100 uppercase tracking-wider block mb-1">Aprender</span>
                <span className="text-xl font-black leading-tight block">Palavras</span>
                {!isWordsDone && <div className="absolute bottom-0 right-0 text-[10px] bg-black/20 px-2 py-0.5 rounded-full">Nível {progress.wordLevel}</div>}
             </div>
          </button>
        </div>

        {/* --- LINHA 2: DESAFIOS (Now ORANGE) --- */}
        <div className="bg-orange-500 rounded-[2.5rem] p-6 shadow-lg relative overflow-hidden border-b-8 border-orange-600">
           <div className="flex items-center gap-2 mb-4 text-orange-100">
              <Rocket size={20} />
              <span className="font-black uppercase tracking-widest text-sm">Arena de Desafios</span>
           </div>

           <div className="grid grid-cols-2 gap-3">
              {/* MAZE - Light Orange bg, Orange Check */}
              <button 
                  onClick={() => navigate(AppRoute.CHALLENGE)}
                  className="bg-orange-100 rounded-2xl p-4 text-left hover:bg-orange-200 transition-colors active:scale-95 border border-white/10 relative"
              >
                  <div className="absolute bottom-2 right-2 text-[10px] font-bold bg-orange-200 px-2 py-0.5 rounded-full text-orange-700">
                     {progress.mazesSolved}/{GOALS.MAZES}
                  </div>
                  <div className="flex justify-between items-start mb-2">
                     <div className="text-3xl">🧩</div>
                     {isMazesDone && <CheckCircle size={16} className="text-orange-500"/>}
                  </div>
                  <span className="block font-black text-orange-600 leading-tight">Labirinto</span>
              </button>

              {/* WORD SEARCH - Light Orange bg */}
              <button 
                  onClick={() => navigate(AppRoute.WORD_SEARCH)}
                  className="bg-orange-100 rounded-2xl p-4 text-left hover:bg-orange-200 transition-colors active:scale-95 border border-white/10 relative"
              >
                  <div className="absolute bottom-2 right-2 text-[10px] font-bold bg-orange-200 px-2 py-0.5 rounded-full text-orange-700">
                     {(progress.wordSearchSolved || 0)}/{GOALS.WORD_SEARCH}
                  </div>
                  <div className="flex justify-between items-start mb-2">
                     <div className="text-3xl">🔎</div>
                     {isWordSearchDone && <CheckCircle size={16} className="text-orange-500"/>}
                  </div>
                  <span className="block font-black text-orange-600 leading-tight">Caça Palavras</span>
              </button>
           </div>
        </div>

        {/* --- LINHA 3: ARTE & COLORIR --- */}
        <div className="grid grid-cols-2 gap-4">
           {/* ART */}
           <button 
            onClick={() => navigate(AppRoute.ART)}
            className="bg-white rounded-[2rem] p-5 text-left border-2 border-purple-500 shadow-sm active:scale-95 transition-transform flex flex-col justify-between h-32 relative overflow-hidden"
          >
             <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center text-purple-500 mb-2">
                <Palette size={20} />
             </div>
             <div>
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">Criar</span>
                <span className="text-lg font-black leading-tight block text-purple-600">Arte Livre</span>
             </div>
          </button>

          {/* COLORING (Renamed) */}
          <button 
             onClick={() => navigate(AppRoute.COLORING)}
             className="bg-white rounded-[2rem] p-5 text-left border-2 border-pink-500 shadow-sm active:scale-95 transition-transform flex flex-col justify-between h-32 relative overflow-hidden"
           >
              <div className="w-10 h-10 bg-pink-100 rounded-full flex items-center justify-center text-pink-500 mb-2">
                 <Brush size={20} />
              </div>
              <div>
                 <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">Colorir</span>
                 <span className="text-lg font-black leading-tight block text-pink-500">Desenhos</span>
              </div>
           </button>
        </div>

        {/* --- LINHA 4: CANTINHO DA FÉ --- */}
        <button 
          onClick={() => navigate(AppRoute.FAITH)}
          className="bg-sky-400 rounded-[2.5rem] p-6 text-left text-white shadow-[0_15px_30px_-10px_rgba(56,189,248,0.5)] active:scale-95 transition-transform relative overflow-hidden group flex items-center gap-6 border-b-8 border-sky-500 active:border-b-0 active:translate-y-2 h-32 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] bg-blend-overlay"
        >
           {isFaithDone && <div className="absolute top-4 right-4 bg-white/20 rounded-full p-1"><CheckCircle size={20} className="text-white"/></div>}
           <div className="w-16 h-16 flex-shrink-0 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm border-2 border-white/30">
               <Heart className="w-8 h-8 text-white fill-white animate-pulse" />
           </div>
           
           <div className="relative z-10 flex-1">
              <span className="text-xs font-bold text-sky-100 uppercase tracking-wider block">Devocional Diário</span>
              <span className="text-2xl font-black leading-none text-white">Cantinho da Fé</span>
           </div>
        </button>

        {/* --- LINHA 5: HISTÓRIAS --- */}
        <button 
            onClick={() => navigate(AppRoute.STORY)}
            className="bg-emerald-400 rounded-[2.5rem] p-5 text-left text-white shadow-[0_10px_20px_-5px_rgba(52,211,153,0.4)] active:scale-95 transition-transform relative overflow-hidden group h-32 flex items-center gap-4 border-b-8 border-emerald-500 active:border-b-0 active:translate-y-2"
        >
            <div className="w-16 h-16 ml-2">
                <StoryIllustration />
            </div>
            
            <div className="relative z-10 flex-1">
                <span className="text-xs font-bold text-emerald-100 uppercase tracking-wider block mb-1">Hora de Dormir</span>
                <span className="text-2xl font-black leading-tight block">Histórias</span>
            </div>
        </button>

        {/* --- LINHA 6: ARCADE --- */}
        <button 
          onClick={handleArcadeClick}
          className={`rounded-[2.5rem] p-6 text-left text-white shadow-[0_15px_30px_-10px_rgba(15,23,42,0.5)] active:scale-95 transition-transform relative overflow-hidden group flex items-center gap-6 border-b-8 active:border-b-0 active:translate-y-2 h-32
            ${isArcadeUnlocked ? 'bg-slate-800 border-slate-900' : 'bg-slate-300 border-slate-400 cursor-not-allowed'}
          `}
        >
           <div className={`w-16 h-16 flex-shrink-0 rounded-2xl flex items-center justify-center shadow-inner ${isArcadeUnlocked ? 'bg-slate-700 text-yellow-400' : 'bg-slate-400 text-slate-500'}`}>
               {isArcadeUnlocked ? <Gamepad2 size={32} /> : <Lock size={32} />}
           </div>
           
           <div className="relative z-10 flex-1">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">{isArcadeUnlocked ? "Diversão" : "Bloqueado"}</span>
              <span className={`text-3xl font-black leading-none bg-clip-text text-transparent ${isArcadeUnlocked ? 'bg-gradient-to-r from-yellow-400 to-pink-500' : 'bg-slate-500'}`}>Arcade</span>
           </div>
        </button>

        {/* FOOTER */}
        <footer className="text-center mt-8 opacity-60 pb-8">
          <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mb-4">
            Reinicia diariamente à 00:00h
          </p>
          <div className="flex flex-col gap-1">
            <p className="text-slate-500 font-black text-[10px] tracking-wide">
              2025 MUNDO MÁGICO KIDS | TODOS OS DIREITOS RESERVADOS
            </p>
            <p className="text-slate-400 text-[10px] font-bold">
              Desenvolvido por Eron Vasconcelos
            </p>
          </div>
        </footer>

        {/* --- MISSION MODAL --- */}
        {showMissionModal && (
           <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-fade-in" onClick={() => setShowMissionModal(false)}>
              <div className="bg-white w-full max-w-sm rounded-[2.5rem] p-6 shadow-2xl relative animate-slide-up" onClick={e => e.stopPropagation()}>
                 <button onClick={() => setShowMissionModal(false)} className="absolute top-4 right-4 text-slate-400"><X /></button>
                 
                 <div className="text-center mb-6">
                    <h2 className="text-2xl font-black text-slate-800">Missão do Dia 🚀</h2>
                    <p className="text-slate-400 text-sm">Toque para ir direto à tarefa!</p>
                 </div>

                 <div className="space-y-3 mb-6">
                    <MissionItem 
                       label="Aprender Palavras (Nível 4)" 
                       current={progress.wordLevel} 
                       target={GOALS.WORDS_LEVEL} 
                       done={isWordsDone} 
                       icon="Aa"
                       onClick={() => navigate(AppRoute.WORDS)}
                    />
                    <MissionItem 
                       label="Matemática (20 Acertos)" 
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
                    <MissionItem 
                       label="Vencer 3 Labirintos" 
                       current={progress.mazesSolved} 
                       target={GOALS.MAZES} 
                       done={isMazesDone} 
                       icon={<Target size={16}/>}
                       onClick={() => navigate(AppRoute.CHALLENGE)}
                    />
                     <MissionItem 
                       label="Vencer 3 Caça Palavras" 
                       current={progress.wordSearchSolved || 0} 
                       target={GOALS.WORD_SEARCH} 
                       done={isWordSearchDone} 
                       icon={<Search size={16}/>}
                       onClick={() => navigate(AppRoute.WORD_SEARCH)}
                    />
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
                <div className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-8 py-4 rounded-full shadow-2xl flex items-center gap-4 animate-pop pointer-events-auto cursor-pointer" onClick={() => navigate(AppRoute.ARCADE)}>
                   <Trophy className="animate-bounce" />
                   <div>
                      <span className="block font-black text-lg">ARCADE LIBERADO!</span>
                      <span className="text-xs font-bold text-yellow-100">Toque para jogar</span>
                   </div>
                </div>
            </div>
        )}

      </div>
    </Layout>
  );
};

export default Home;
