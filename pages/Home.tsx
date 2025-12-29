import React from 'react';
import { useNavigate } from 'react-router-dom';
import { AppRoute } from '../types';
import { Layout } from '../components/Layout';

// --- STICKER ILLUSTRATIONS ---
const MathIllustration = () => (
  <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-sm">
    <rect x="20" y="20" width="60" height="60" rx="12" fill="#FDBA74" /> {/* Orange-300 */}
    <rect x="20" y="25" width="60" height="60" rx="12" fill="#F97316" /> {/* Orange-500 */}
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

  return (
    <Layout title="Home">
      <div className="flex flex-col gap-6 pb-4">
        
        {/* Title Section */}
        <div className="text-center mt-2 mb-2">
           <h1 className="text-3xl font-black text-slate-800 leading-tight">
             Escolha sua <span className="text-blue-600">missão!</span> 🚀
           </h1>
           <p className="text-slate-400 font-bold text-sm mt-1">O que vamos aprender hoje?</p>
        </div>

        {/* --- ROW 1: LOGIC & CREATIVITY (Split Grid) --- */}
        <div className="grid grid-cols-2 gap-4">
          
          {/* LOGIC CARD (Math) - Orange */}
          <button 
            onClick={() => navigate(AppRoute.MATH)}
            className="bg-orange-400 rounded-[2rem] p-5 text-left text-white shadow-[0_10px_20px_-5px_rgba(251,146,60,0.4)] active:scale-95 transition-transform relative overflow-hidden group h-48 flex flex-col justify-between border-b-8 border-orange-500 active:border-b-0 active:translate-y-2"
          >
             <div className="w-20 h-20 -ml-2">
                <MathIllustration />
             </div>
             
             <div className="relative z-10 mt-auto">
                <span className="text-xs font-bold text-orange-100 uppercase tracking-wider block mb-1">Lógica</span>
                <span className="text-xl font-black leading-tight block">Matemática</span>
             </div>
          </button>

          {/* CREATIVITY CARD (Art) - Purple */}
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

        {/* --- ROW 2: WORDS & COLORING (Smaller Buttons) --- */}
        <div className="grid grid-cols-2 gap-4">
           <button 
             onClick={() => navigate(AppRoute.WORDS)}
             className="bg-white rounded-[2rem] p-4 flex items-center gap-3 border-b-4 border-slate-200 active:border-b-0 active:translate-y-1 active:bg-slate-50 transition-all shadow-sm"
           >
              <div className="w-14 h-14 flex-shrink-0">
                 <WordsIllustration />
              </div>
              <div className="text-left">
                 <span className="block text-xs font-bold text-slate-400 uppercase">Aprender</span>
                 <span className="block font-black text-slate-700 leading-tight">Palavras</span>
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

        {/* --- ROW 3: ACTION (Blue Wide Card) --- */}
        <button 
          onClick={() => navigate(AppRoute.CHALLENGE)}
          className="bg-blue-500 rounded-[2.5rem] p-6 text-left text-white shadow-[0_15px_30px_-10px_rgba(59,130,246,0.5)] active:scale-95 transition-transform relative overflow-hidden group flex items-center justify-between border-b-8 border-blue-600 active:border-b-0 active:translate-y-2 h-36"
        >
           <div className="relative z-10 flex flex-col gap-1">
              <span className="inline-block bg-yellow-400 text-yellow-900 text-[10px] font-black px-2 py-1 rounded-md self-start uppercase shadow-sm">Novo</span>
              <span className="text-xs font-bold text-blue-100 uppercase tracking-wider mt-1">Ação</span>
              <h2 className="text-3xl font-black leading-none">Arena de <br/> Desafios</h2>
           </div>
           
           <div className="relative z-10 w-28 h-28 -mr-4">
               <ChallengeIllustration />
           </div>

           {/* Decor Background */}
           <div className="absolute right-0 top-0 h-full w-2/3 bg-gradient-to-l from-blue-400/30 to-transparent skew-x-12" />
        </button>

        {/* --- ROW 4: STORY (Green Wide Card) --- */}
        <button 
          onClick={() => navigate(AppRoute.STORY)}
          className="bg-emerald-400 rounded-[2.5rem] p-6 text-left text-white shadow-[0_15px_30px_-10px_rgba(52,211,153,0.5)] active:scale-95 transition-transform relative overflow-hidden group flex items-center gap-6 border-b-8 border-emerald-500 active:border-b-0 active:translate-y-2 h-36"
        >
           <div className="w-20 h-20 flex-shrink-0">
               <StoryIllustration />
           </div>
           
           <div className="relative z-10 flex-1">
              <span className="text-xs font-bold text-emerald-100 uppercase tracking-wider block">Hora de Dormir</span>
              <span className="text-2xl font-black leading-tight block">Leitura Mágica</span>
              <span className="text-emerald-100 text-xs font-bold mt-1 block opacity-90">Com Inteligência Artificial</span>
           </div>
        </button>

        {/* FOOTER */}
        <footer className="text-center text-slate-400 text-xs font-bold mt-4 opacity-60">
          Desenvolvido por Eron Vasconcelos
        </footer>

      </div>
    </Layout>
  );
};

export default Home;