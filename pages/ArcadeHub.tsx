
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { AppRoute } from '../types';
import { ArrowLeft, Gamepad2, Brain, Rocket, Activity, Flag, LayoutGrid, Zap } from 'lucide-react';

const ArcadeHub: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="h-full flex flex-col font-sans relative bg-[#1e1b4b] text-white overflow-hidden">
      <div className="absolute inset-0 opacity-20 pointer-events-none" 
           style={{ 
             backgroundImage: 'radial-gradient(#4f46e5 2px, transparent 2px)', 
             backgroundSize: '30px 30px' 
           }} 
      />
      
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

      <div className="flex-1 overflow-y-auto p-4 z-10 flex flex-col gap-4 pb-20 scrollbar-hide">
        
        <div className="text-center mb-4">
          <h2 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-pink-400 via-purple-400 to-indigo-400 animate-pulse">
            DIVERSÃO TOTAL!
          </h2>
          <p className="text-indigo-400 font-bold text-sm uppercase tracking-widest">Escolha sua aventura</p>
        </div>

        {/* MUNDO DOS BLOCOS */}
        <button 
          onClick={() => navigate(AppRoute.GAME_BLOCKS)}
          className="group relative bg-gradient-to-br from-blue-600 to-indigo-700 rounded-[2.5rem] p-6 border-b-8 border-indigo-900 active:border-b-0 active:translate-y-2 transition-all shadow-lg overflow-hidden"
        >
           <div className="flex items-center gap-6 relative z-10">
              <div className="w-20 h-20 bg-white/20 rounded-2xl flex items-center justify-center text-white backdrop-blur-sm border border-white/30">
                 <LayoutGrid size={40} />
              </div>
              <div className="text-left">
                 <span className="block text-xs font-bold text-blue-200 uppercase tracking-widest">Lógica e Gravidade</span>
                 <span className="block text-3xl font-black text-white leading-none">Mundo dos Blocos</span>
                 <span className="block text-sm text-blue-100 mt-1 opacity-80">Arrastar e Encaixar!</span>
              </div>
           </div>
           <LayoutGrid className="absolute -right-4 -bottom-4 opacity-10 transform rotate-12" size={120} />
        </button>

        {/* SUPER CORRIDA */}
        <button 
          onClick={() => navigate(AppRoute.GAME_RACING)}
          className="group relative bg-gradient-to-br from-orange-500 to-red-600 rounded-[2.5rem] p-6 border-b-8 border-red-800 active:border-b-0 active:translate-y-2 transition-all shadow-lg overflow-hidden"
        >
           <div className="flex items-center gap-6 relative z-10">
              <div className="w-20 h-20 bg-white/20 rounded-2xl flex items-center justify-center text-white backdrop-blur-sm border border-white/30">
                 <Flag size={40} />
              </div>
              <div className="text-left">
                 <span className="block text-xs font-bold text-orange-200 uppercase tracking-widest">Velocidade</span>
                 <span className="block text-3xl font-black text-white leading-none">Super Corrida</span>
                 <span className="block text-sm text-orange-100 mt-1 opacity-80">Seja o piloto mais rápido!</span>
              </div>
           </div>
        </button>

        {/* ESPAÇO SIDERAL */}
        <button 
          onClick={() => navigate(AppRoute.GAME_SPACE)}
          className="group relative bg-gradient-to-br from-indigo-700 to-slate-900 rounded-[2.5rem] p-6 border-b-8 border-black active:border-b-0 active:translate-y-2 transition-all shadow-lg overflow-hidden"
        >
           <div className="flex items-center gap-6 relative z-10">
              <div className="w-20 h-20 bg-indigo-500/40 rounded-2xl flex items-center justify-center text-white backdrop-blur-sm border border-white/20">
                 <Rocket size={40} />
              </div>
              <div className="text-left">
                 <span className="block text-xs font-bold text-indigo-300 uppercase tracking-widest">Ação Espacial</span>
                 <span className="block text-3xl font-black text-white leading-none">Defesa Galáctica</span>
                 <span className="block text-sm text-indigo-200 mt-1 opacity-80">Proteja o universo!</span>
              </div>
           </div>
           <Rocket className="absolute -right-6 -bottom-6 opacity-10 transform rotate-45" size={140} />
        </button>

        {/* COBRINHA */}
        <button 
          onClick={() => navigate(AppRoute.GAME_SNAKE)}
          className="group relative bg-gradient-to-br from-emerald-500 to-teal-700 rounded-[2.5rem] p-6 border-b-8 border-teal-900 active:border-b-0 active:translate-y-2 transition-all shadow-lg overflow-hidden"
        >
           <div className="flex items-center gap-6 relative z-10">
              <div className="w-20 h-20 bg-white/20 rounded-2xl flex items-center justify-center text-white backdrop-blur-sm border border-white/30">
                 <Activity size={40} />
              </div>
              <div className="text-left">
                 <span className="block text-xs font-bold text-emerald-200 uppercase tracking-widest">Clássico</span>
                 <span className="block text-3xl font-black text-white leading-none">Cobrinha</span>
                 <span className="block text-sm text-emerald-100 mt-1 opacity-80">Coma as maçãs!</span>
              </div>
           </div>
        </button>

        {/* MEMÓRIA */}
        <button 
          onClick={() => navigate(AppRoute.GAME_MEMORY)}
          className="group relative bg-gradient-to-br from-pink-500 to-rose-600 rounded-[2.5rem] p-6 border-b-8 border-rose-800 active:border-b-0 active:translate-y-2 transition-all shadow-lg overflow-hidden"
        >
           <div className="flex items-center gap-6 relative z-10">
              <div className="w-20 h-20 bg-white/20 rounded-2xl flex items-center justify-center text-white backdrop-blur-sm border border-white/30">
                 <Brain size={40} />
              </div>
              <div className="text-left">
                 <span className="block text-xs font-bold text-pink-200 uppercase tracking-widest">Memória</span>
                 <span className="block text-3xl font-black text-white leading-none">Desafio Genial</span>
                 <span className="block text-sm text-pink-100 mt-1 opacity-80">Encontre os pares!</span>
              </div>
           </div>
        </button>

      </div>
    </div>
  );
};

export default ArcadeHub;
