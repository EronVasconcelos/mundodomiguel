import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppRoute, DailyProgress } from '../types';
import { Layout } from '../components/Layout';
import { Gamepad2, Heart, Lock, CheckCircle, Star, Target, X, Trophy } from 'lucide-react';
import { getDailyProgress, getGoals, checkUnlock, fetchRemoteProgress } from '../services/progressService';

// --- STICKER ILLUSTRATIONS ---
const MathIllustration = () => (
  <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-sm">
    <rect x="20" y="20" width="60" height="60" rx="12" fill="#FDBA74" />
    <rect x="20" y="25" width="60" height="60" rx="12" fill="#F97316" />
    <text x="50" y="68" fontSize="40" fontWeight="900" fill="white" textAnchor="middle">1+2</text>
    <circle cx="85" cy="15" r="10" fill="#FECCA9" opacity="0.8" />
  </svg>
);

const ArtIllustration = () => (
  <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-sm">
    <path d="M50 15 C30 15 15 30 15 50 C15 70 30 85 50 85 C60 85 65 80 65 75 C65 70 60 70 60 65 C60 55 70 55 75 55 C85 55 85 40 85 35 C85 25 70 15 50 15" fill="#A855F7" />
    <circle cx="35" cy="35" r="6" fill="#F3E8FF" />
    <circle cx="65" cy="30" r="6" fill="#F3E8FF" />
    <circle cx="30" cy="60" r="6" fill="#F3E8FF" />
    <circle cx="50" cy="70" r="6" fill="#F3E8FF" />
    <path d="M70 65 L90 85" stroke="#F3E8FF" strokeWidth="8" strokeLinecap="round" />
  </svg>
);

const ChallengeIllustration = () => (
  <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-sm">
    <circle cx="50" cy="50" r="35" fill="#3B82F6" />
    <path d="M50 25 L56 40 L72 40 L59 50 L64 65 L50 55 L36 65 L41 50 L28 40 L44 40 Z" fill="#FACC15" />
    <path d="M15 80 L25 50 M85 80 L75 50" stroke="#93C5FD" strokeWidth="4" strokeLinecap="round" />
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

const WordsIllustration = () => (
  <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-sm">
    <rect x="25" y="25" width="50" height="50" rx="10" fill="#EAB308" />
    <text x="50" y="62" fontSize="36" fontWeight="900" fill="white" textAnchor="middle">Aa</text>
  </svg>
);

const ColoringIllustration = () => (
  <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-sm">
    <rect x="35" y="20" width="30" height="60" rx="4" fill="#EC4899" transform="rotate(15 50 50)" />
    <path d="M40 20 L50 5 L60 20" fill="#FBCFE8" transform="rotate(15 50 50)" />
  </svg>
);


const Home: React.FC = () => {
  const navigate = useNavigate();
  const [progress, setProgress] = useState<DailyProgress>(getDailyProgress());
  const [showMissionModal, setShowMissionModal] = useState(false);
  const [showUnlockBanner, setShowUnlockBanner] = useState(false);

  const GOALS = getGoals();

  useEffect(() => {
    // 1. Load Local Progress (Instant)
    const localP = getDailyProgress();
    setProgress(localP);

    // 2. Fetch Remote Progress (Async) and update if changed
    fetchRemoteProgress().then(remoteP => {
        if (remoteP) {
            setProgress(remoteP);
            // Check unlock on remote state
            const wasLocked = !localP.arcadeUnlocked;
            const isNowUnlocked = checkUnlock(remoteP);
            if (wasLocked && isNowUnlocked) setShowUnlockBanner(true);
        } else {
            // No remote data, check unlock on local
            const wasLocked = !localP.arcadeUnlocked;
            const isNowUnlocked = checkUnlock(localP);
            if (wasLocked && isNowUnlocked) setShowUnlockBanner(true);
        }
    });
  }, []);

  const isMathDone = progress.mathCount >= GOALS.MATH;
  const isWordsDone = progress.wordLevel >= GOALS.WORDS_LEVEL;
  const isFaithDone = progress.faithDone;
  const isMazesDone = progress.mazesSolved >= GOALS.MAZES;
  const isArcadeUnlocked = progress.arcadeUnlocked;

  const handleArcadeClick = () => {
    if (isArcadeUnlocked) {
      navigate(AppRoute.ARCADE);
    } else {
      setShowMissionModal(true);
    }
  };

  const MissionItem = ({ label, current, target, done, icon }: any) => (
    <div className={`flex items-center gap-4 p-3 rounded-2xl border-2 ${done ? 'bg-green-50 border-green-200' : 'bg-slate-50 border-slate-100'}`}>
       <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white ${done ? 'bg-green-500' : 'bg-slate-300'}`}>
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
    </div>
  );

  return (
    <Layout title="Home">
      <div className="flex flex-col gap-6 pb-4 relative">
        
        {/* Mission Status Button (Top Right Absolute or In Flow) */}
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

        {/* --- ROW 1: LOGIC & CREATIVITY --- */}
        <div className="grid grid-cols-2 gap-4">
          
          {/* LOGIC CARD (Math) */}
          <button 
            onClick={() => navigate(AppRoute.MATH)}
            className="bg-orange-400 rounded-[2rem] p-5 text-left text-white shadow-[0_10px_20px_-5px_rgba(251,146,60,0.4)] active:scale-95 transition-transform relative overflow-hidden group h-48 flex flex-col justify-between border-b-8 border-orange-500 active:border-b-0 active:translate-y-2"
          >
             {isMathDone && <div className="absolute top-3 right-3 bg-white/20 rounded-full p-1"><CheckCircle size={16} className="text-white"/></div>}
             <div className="w-20 h-20 -ml-2">
                <MathIllustration />
             </div>
             
             <div className="relative z-10 mt-auto">
                <span className="text-xs font-bold text-orange-100 uppercase tracking-wider block mb-1">Lógica</span>
                <span className="text-xl font-black leading-tight block">Matemática</span>
                {!isMathDone && <span className="text-[10px] bg-black/20 px-2 py-0.5 rounded-full inline-block mt-1">{progress.mathCount}/{GOALS.MATH}</span>}
             </div>
          </button>

          {/* CREATIVITY CARD (Art) */}
          <button 
            onClick={() => navigate(AppRoute.ART)}
            className="bg-purple-500 rounded-[2rem] p-5 text-left text-white shadow-[0_10px_20px_-5px_rgba(168,85,247,0.4)] active:scale-95 transition-transform relative overflow-hidden group h-48 flex flex-col justify-between border-b-8 border-purple-600 active:border-b-0 active:translate-y-2"
          >
             <div className="w-20 h-20 -ml-2">
                <ArtIllustration />
             </div>
             
             <div className="relative z-10 mt-auto">
                <span className="text-xs font-bold text-purple-100 uppercase tracking-wider block mb-1">Criatividade</span>
                <span className="text-xl font-black leading-tight block">Arte</span>
             </div>
          </button>
        </div>

        {/* --- ROW 2: WORDS & COLORING --- */}
        <div className="grid grid-cols-2 gap-4">
           <button 
             onClick={() => navigate(AppRoute.WORDS)}
             className="bg-white rounded-[2rem] p-4 flex items-center gap-3 border-b-4 border-slate-200 active:border-b-0 active:translate-y-1 active:bg-slate-50 transition-all shadow-sm relative overflow-hidden"
           >
              {isWordsDone && <div className="absolute top-2 right-2"><CheckCircle size={16} className="text-green-500"/></div>}
              <div className="w-14 h-14 flex-shrink-0">
                 <WordsIllustration />
              </div>
              <div className="text-left">
                 <span className="block text-xs font-bold text-slate-400 uppercase">Aprender</span>
                 <span className="block font-black text-slate-700 leading-tight">Palavras</span>
                 {!isWordsDone && <span className="text-[10px] text-orange-500 font-bold">Nível {progress.wordLevel}</span>}
              </div>
           </button>

           <button 
             onClick={() => navigate(AppRoute.COLORING)}
             className="bg-white rounded-[2rem] p-4 flex items-center gap-3 border-b-4 border-slate-200 active:border-b-0 active:translate-y-1 active:bg-slate-50 transition-all shadow-sm"
           >
              <div className="w-14 h-14 flex-shrink-0">
                 <ColoringIllustration />
              </div>
              <div className="text-left">
                 <span className="block text-xs font-bold text-slate-400 uppercase">Colorir</span>
                 <span className="block font-black text-slate-700 leading-tight">Desenhos</span>
              </div>
           </button>
        </div>

        {/* --- ROW 3: FAITH (FULL WIDTH) --- */}
        <button 
          onClick={() => navigate(AppRoute.FAITH)}
          className="bg-sky-400 rounded-[2.5rem] p-6 text-left text-white shadow-[0_15px_30px_-10px_rgba(56,189,248,0.5)] active:scale-95 transition-transform relative overflow-hidden group flex items-center gap-6 border-b-8 border-sky-500 active:border-b-0 active:translate-y-2 h-36 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] bg-blend-overlay"
        >
           {isFaithDone && <div className="absolute top-4 right-4 bg-white/20 rounded-full p-1"><CheckCircle size={20} className="text-white"/></div>}
           <div className="w-20 h-20 flex-shrink-0 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm border-2 border-white/30">
               <Heart className="w-10 h-10 text-white fill-white animate-pulse" />
           </div>
           
           <div className="relative z-10 flex-1">
              <span className="text-xs font-bold text-sky-100 uppercase tracking-wider block">Devocional Diário</span>
              <span className="text-3xl font-black leading-none text-white">Cantinho da Fé</span>
              <span className="text-sky-100 text-xs font-bold mt-2 block">Histórias e Orações</span>
           </div>
        </button>

        {/* --- ROW 4: ACTION & STORY (SIDE BY SIDE) --- */}
        <div className="grid grid-cols-2 gap-4">
            {/* ACTION (CHALLENGE) */}
            <button 
                onClick={() => navigate(AppRoute.CHALLENGE)}
                className="bg-blue-500 rounded-[2rem] p-5 text-left text-white shadow-[0_10px_20px_-5px_rgba(59,130,246,0.4)] active:scale-95 transition-transform relative overflow-hidden group h-48 flex flex-col justify-between border-b-8 border-blue-600 active:border-b-0 active:translate-y-2"
            >
                {isMazesDone && <div className="absolute top-3 right-3 bg-white/20 rounded-full p-1"><CheckCircle size={16} className="text-white"/></div>}
                
                <div className="relative z-10 w-24 h-24 -ml-3 -mt-2">
                    <ChallengeIllustration />
                </div>
                
                <div className="relative z-10 mt-auto">
                    <span className="text-xs font-bold text-blue-100 uppercase tracking-wider block mb-1">Ação</span>
                    <span className="text-xl font-black leading-tight block">Arena de Desafios</span>
                    {!isMazesDone && <span className="text-[10px] bg-black/20 px-2 py-0.5 rounded-full inline-block mt-1">{progress.mazesSolved}/{GOALS.MAZES}</span>}
                </div>
            </button>

            {/* STORY */}
            <button 
                onClick={() => navigate(AppRoute.STORY)}
                className="bg-emerald-400 rounded-[2rem] p-5 text-left text-white shadow-[0_10px_20px_-5px_rgba(52,211,153,0.4)] active:scale-95 transition-transform relative overflow-hidden group h-48 flex flex-col justify-between border-b-8 border-emerald-500 active:border-b-0 active:translate-y-2"
            >
                <div className="w-20 h-20 -ml-2">
                    <StoryIllustration />
                </div>
                
                <div className="relative z-10 mt-auto">
                    <span className="text-xs font-bold text-emerald-100 uppercase tracking-wider block mb-1">Hora de Dormir</span>
                    <span className="text-xl font-black leading-tight block">Leitura Mágica</span>
                </div>
            </button>
        </div>

        {/* --- ROW 5: ARCADE (LOCKED/UNLOCKED) - MOVED TO END --- */}
        <button 
          onClick={handleArcadeClick}
          className={`rounded-[2.5rem] p-6 text-left text-white shadow-[0_15px_30px_-10px_rgba(15,23,42,0.5)] active:scale-95 transition-transform relative overflow-hidden group flex items-center gap-6 border-b-8 active:border-b-0 active:translate-y-2 h-36
            ${isArcadeUnlocked ? 'bg-slate-800 border-slate-900' : 'bg-slate-300 border-slate-400 cursor-not-allowed'}
          `}
        >
           <div className={`w-20 h-20 flex-shrink-0 rounded-2xl flex items-center justify-center shadow-inner ${isArcadeUnlocked ? 'bg-slate-700 text-yellow-400' : 'bg-slate-400 text-slate-500'}`}>
               {isArcadeUnlocked ? <Gamepad2 size={40} /> : <Lock size={40} />}
           </div>
           
           <div className="relative z-10 flex-1">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">{isArcadeUnlocked ? "Joguinhos" : "Bloqueado"}</span>
              <span className={`text-3xl font-black leading-none bg-clip-text text-transparent ${isArcadeUnlocked ? 'bg-gradient-to-r from-yellow-400 to-pink-500' : 'bg-slate-500'}`}>Arcade</span>
              <span className="text-slate-400 text-xs font-bold mt-2 block">
                {isArcadeUnlocked ? "Memória, Snake e mais!" : "Complete a missão do dia!"}
              </span>
           </div>
        </button>

        {/* FOOTER */}
        <footer className="text-center mt-4 opacity-60 pb-4">
          <p className="text-slate-400 text-xs font-bold mb-1">
            Reinicia todos os dias à 00:00h
          </p>
          <div className="mt-4">
            <p className="text-slate-500 font-bold text-sm">Desenvolvido por Eron Vasconcelos</p>
            <p className="text-slate-400 text-xs mt-1">2025 | Todos os direitos reservados</p>
          </div>
        </footer>

        {/* --- MISSION MODAL --- */}
        {showMissionModal && (
           <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-fade-in" onClick={() => setShowMissionModal(false)}>
              <div className="bg-white w-full max-w-sm rounded-[2.5rem] p-6 shadow-2xl relative animate-slide-up" onClick={e => e.stopPropagation()}>
                 <button onClick={() => setShowMissionModal(false)} className="absolute top-4 right-4 text-slate-400"><X /></button>
                 
                 <div className="text-center mb-6">
                    <h2 className="text-2xl font-black text-slate-800">Missão do Dia 🚀</h2>
                    <p className="text-slate-400 text-sm">Complete para liberar os jogos!</p>
                 </div>

                 <div className="space-y-3 mb-6">
                    <MissionItem 
                       label="Chegar ao Nível 4 em Palavras" 
                       current={progress.wordLevel} 
                       target={GOALS.WORDS_LEVEL} 
                       done={isWordsDone} 
                       icon="Aa"
                    />
                    <MissionItem 
                       label="30 Acertos em Matemática" 
                       current={progress.mathCount} 
                       target={GOALS.MATH} 
                       done={isMathDone} 
                       icon="1+2"
                    />
                    <MissionItem 
                       label="Ler o Devocional" 
                       current={progress.faithDone} 
                       target={true} 
                       done={isFaithDone} 
                       icon={<Heart size={16}/>}
                    />
                    <MissionItem 
                       label="Vencer 3 Labirintos" 
                       current={progress.mazesSolved} 
                       target={GOALS.MAZES} 
                       done={isMazesDone} 
                       icon={<Target size={16}/>}
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