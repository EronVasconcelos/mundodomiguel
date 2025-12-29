import React from 'react';
import { useNavigate } from 'react-router-dom';
import { AppRoute } from '../types';
import { Rocket, Star, LogIn, UserPlus } from 'lucide-react';

const Welcome: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="h-full flex flex-col items-center justify-center bg-slate-900 text-white p-6 relative overflow-hidden">
      {/* Background stars */}
      <div className="absolute inset-0 opacity-30" style={{ backgroundImage: 'radial-gradient(white 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
      
      <div className="z-10 text-center animate-slide-up w-full max-w-sm">
        <div className="mb-10 relative">
           <div className="w-32 h-32 bg-blue-500 rounded-full flex items-center justify-center mx-auto shadow-[0_0_50px_rgba(59,130,246,0.5)] border-4 border-blue-400">
             <Rocket size={64} className="text-white ml-1 mb-1" />
           </div>
           <Star className="absolute top-0 right-1/4 text-yellow-400 fill-yellow-400 animate-spin-slow" size={32} />
        </div>

        <h1 className="text-4xl font-black mb-2 tracking-tight">Mundo Mágico</h1>
        <p className="text-slate-400 text-lg mb-12">Aprendizado e diversão <br/> com Inteligência Artificial.</p>

        <div className="space-y-4 w-full">
           <button 
             onClick={() => navigate(AppRoute.REGISTER)}
             className="w-full py-4 bg-yellow-400 text-yellow-900 rounded-2xl font-black text-xl shadow-lg shadow-yellow-900/20 active:scale-95 transition-transform flex items-center justify-center gap-2"
           >
             <UserPlus size={24} /> CRIAR CONTA
           </button>
           
           <button 
             onClick={() => navigate(AppRoute.LOGIN)}
             className="w-full py-4 bg-slate-800 text-white rounded-2xl font-bold text-lg border-2 border-slate-700 active:scale-95 transition-transform flex items-center justify-center gap-2"
           >
             <LogIn size={24} /> JÁ TENHO CONTA
           </button>
        </div>

        <p className="mt-12 text-xs text-slate-600 font-bold uppercase tracking-widest">Área dos Pais</p>
      </div>
    </div>
  );
};

export default Welcome;