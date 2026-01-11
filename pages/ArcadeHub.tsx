
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { AppRoute } from '../types';
import { ArrowLeft, Gamepad2, Brain, Rocket, Activity, Flag } from 'lucide-react';

const ArcadeHub: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="h-full flex flex-col font-sans relative bg-[#1e1b4b] text-white overflow-hidden">
      {/* Background Decor */}
      <div className="absolute inset-0 opacity-20 pointer-events-none" 
           style={{ 
             backgroundImage: 'radial-gradient(#4f46e5 2px, transparent 2px)', 
             backgroundSize: '30px 30px' 
           }} 
      />
      
      {/* Header */}
      <div className="px-4 pt-6 pb-2 z-10">
         <header className="bg-indigo-900/50 backdrop-blur-md rounded-3xl px-4 py-3 flex items-center justify-between border border-indigo-700/50">
            <button onClick={() => navigate(-1)} className="w-10 h-10 bg-indigo-800 rounded-full flex items-center justify-center text-indigo-300 active:scale-95 transition-transform">
               <ArrowLeft size={24} strokeWidth={3} />
            </button>
            <h1 className="text-xl font-black uppercase tracking-wider text-center flex-1 mx-2 text-indigo-300 flex items-center justify-center gap-2">
               <Gamepad2 size={20}/> Arcade
            </h1>
            <div className="w-10" />
         </header>
      </div>

      <div className="flex-1 overflow-y-auto p-4 z-10 flex flex-col gap-4 pb-20">
        
        <div className="text-center mb-4">
          <h2 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-pink-400 via-purple-400 to-indigo-400 animate-pulse">
            DIVERSÃO TOTAL!
          </h2>
          <p className="text-indigo-400 font-bold text-sm">Escolha seu jogo favorito</p>
        </div>

        {/* RACING GAME */}
        <button 
          onClick={() => navigate(AppRoute.GAME_RACING)}
          className="group relative bg-gradient-to-br from-orange-500 to-red-600 rounded-[2.5rem] p-6 border-b-8 border-red-800 active:border-b-0 active:translate-y-2 transition-all shadow-lg shadow-orange-900/50 overflow-hidden"
        >
           <div className="flex items-center gap-6 relative z-10">
              <div className="w-20 h-20 bg-white/20 rounded-2xl flex items-center justify-center text-white backdrop-blur-sm">
                 <Flag size={40} />
              </div>
              <div className="text-left">
                 <span className="block text-xs font-bold text-orange-200 uppercase tracking-widest">Velocidade</span>
                 <span className="block text-3xl font-black text-white leading-none">Super Corrida</span>
                 <span className="block text-sm text-orange-100 mt-1 opacity-80">Desvie dos carros!</span>
              </div>
           </div>
           <div className="absolute -right-2 -bottom-2 opacity-20 transform rotate-12">
             <Flag size={120} />
           </div>
        </button>

        {/* MEMORY GAME */}
        <button 
          onClick={() => navigate(AppRoute.GAME_MEMORY)}
          className="group relative bg-gradient-to-br from-pink-500 to-rose-600 rounded-[2.5rem] p-6 border-b-8 border-rose-800 active:border-b-0 active:translate-y-2 transition-all shadow-lg shadow-pink-900/50 overflow-hidden"
        >
           <div className="flex items-center gap-6 relative z-10">
              <div className="w-20 h-20 bg-white/20 rounded-2xl flex items-center justify-center text-white backdrop-blur-sm">
                 <Brain size={40} />
              </div>
              <div className="text-left">
                 <span className="block text-xs font-bold text-pink-200 uppercase tracking-widest">Desafio</span>
                 <span className="block text-3xl font-black text-white leading-none">Memória</span>
                 <span className="block text-sm text-pink-100 mt-1 opacity-80">Encontre os pares!</span>
              </div>
           </div>
           <Brain className="absolute -right-4 -bottom-4 w-32 h-32 text-rose-400/20 rotate-12 group-hover:rotate-45 transition-transform" />
        </button>

        {/* SNAKE GAME */}
        <button 
          onClick={() => navigate(AppRoute.GAME_SNAKE)}
          className="group relative bg-gradient-to-br from-emerald-500 to-green-600 rounded-[2.5rem] p-6 border-b-8 border-emerald-800 active:border-b-0 active:translate-y-2 transition-all shadow-lg shadow-emerald-900/50 overflow-hidden"
        >
           <div className="flex items-center gap-6 relative z-10">
              <div className="w-20 h-20 bg-white/20 rounded-2xl flex items-center justify-center text-white backdrop-blur-sm">
                 <Activity size={40} />
              </div>
              <div className="text-left">
                 <span className="block text-xs font-bold text-emerald-200 uppercase tracking-widest">Clássico</span>
                 <span className="block text-3xl font-black text-white leading-none">Cobrinha</span>
                 <span className="block text-sm text-emerald-100 mt-1 opacity-80">Coma as frutinhas!</span>
              </div>
           </div>
           <Activity className="absolute -right-4 -bottom-4 w-32 h-32 text-emerald-400/20 rotate-12 group-hover:scale-110 transition-transform" />
        </button>

        {/* SPACE GAME */}
        <button 
          onClick={() => navigate(AppRoute.GAME_SPACE)}
          className="group relative bg-gradient-to-br from-violet-600 to-indigo-700 rounded-[2.5rem] p-6 border-b-8 border-indigo-900 active:border-b-0 active:translate-y-2 transition-all shadow-lg shadow-indigo-900/50 overflow-hidden"
        >
           <div className="flex items-center gap-6 relative z-10">
              <div className="w-20 h-20 bg-white/20 rounded-2xl flex items-center justify-center text-white backdrop-blur-sm">
                 <Rocket size={40} />
              </div>
              <div className="text-left">
                 <span className="block text-xs font-bold text-indigo-200 uppercase tracking-widest">Ação</span>
                 <span className="block text-3xl font-black text-white leading-none">Espaço</span>
                 <span className="block text-sm text-indigo-100 mt-1 opacity-80">Defenda a galáxia!</span>
              </div>
           </div>
           <Rocket className="absolute -right-4 -bottom-4 w-32 h-32 text-indigo-400/20 -rotate-45 group-hover:-translate-y-4 transition-transform" />
        </button>

      </div>
    </div>
  );
};

export default ArcadeHub;
