
import React from 'react';
import { Rocket, Star } from 'lucide-react';

const SplashScreen: React.FC = () => {
  return (
    <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-slate-900 text-white p-6 overflow-hidden animate-fade-in">
      {/* Estrelas de Fundo */}
      <div className="absolute inset-0 opacity-30" style={{ backgroundImage: 'radial-gradient(white 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
      
      {/* Estrelas Animadas Espalhadas */}
      <Star className="absolute top-1/4 left-1/4 text-yellow-400 fill-yellow-400 animate-pulse opacity-50" size={16} />
      <Star className="absolute top-1/3 right-1/4 text-white fill-white animate-bounce-slow opacity-30" size={12} />
      <Star className="absolute bottom-1/4 right-1/3 text-yellow-200 fill-yellow-200 animate-pulse opacity-40" size={20} />

      <div className="z-10 text-center flex flex-col items-center">
        {/* Círculo do Foguete - Design Unificado */}
        <div className="mb-8 relative">
           <div className="w-40 h-40 bg-blue-500 rounded-full flex items-center justify-center shadow-[0_0_60px_rgba(59,130,246,0.6)] border-4 border-blue-400 animate-pop">
             <Rocket size={80} className="text-white ml-1.5 mb-1.5 animate-levitate" />
           </div>
           {/* Faíscas/Brilho */}
           <div className="absolute -bottom-2 w-20 h-4 bg-blue-400/20 blur-xl rounded-full animate-pulse" />
        </div>

        {/* Título */}
        <div className="animate-slide-up" style={{ animationDelay: '0.2s' }}>
            <h1 className="text-4xl font-black tracking-tight leading-none">Mundo Mágico</h1>
            <span className="text-xl font-bold text-yellow-400 uppercase tracking-[0.3em] block mb-2 opacity-90">Kids</span>
        </div>

        {/* Spinner de Carregamento Discreto */}
        <div className="mt-12 flex gap-2">
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0s' }} />
            <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
            <div className="w-2 h-2 bg-blue-300 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }} />
        </div>
      </div>

      <style>{`
        @keyframes levitate {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          50% { transform: translateY(-10px) rotate(2deg); }
        }
        .animate-levitate {
          animation: levitate 3s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};

export default SplashScreen;
