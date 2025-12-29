import React from 'react';
import { useNavigate } from 'react-router-dom';
import { AppRoute } from '../types';
import { Rocket, Star } from 'lucide-react';

const Welcome: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="h-full flex flex-col items-center justify-center bg-slate-900 text-white p-6 relative overflow-hidden">
      {/* Background stars */}
      <div className="absolute inset-0 opacity-30" style={{ backgroundImage: 'radial-gradient(white 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
      
      <div className="z-10 text-center animate-slide-up">
        <div className="mb-8 relative">
           <div className="w-32 h-32 bg-blue-500 rounded-full flex items-center justify-center mx-auto shadow-[0_0_50px_rgba(59,130,246,0.5)]">
             <Rocket size={64} className="text-white ml-1 mb-1" />
           </div>
           <Star className="absolute top-0 right-1/3 text-yellow-400 fill-yellow-400 animate-spin-slow" size={32} />
        </div>

        <h1 className="text-4xl font-black mb-2 tracking-tight">Mundo Mágico</h1>
        <p className="text-slate-400 text-lg mb-12">Um super app para crianças <br/> inteligentes e criativas.</p>

        <div className="space-y-4 w-full max-w-xs mx-auto">
           <button 
             onClick={() => navigate(AppRoute.PROFILE)}
             className="w-full py-4 bg-yellow-400 text-yellow-900 rounded-2xl font-black text-xl shadow-lg shadow-yellow-900/20 active:scale-95 transition-transform"
           >
             CRIAR CONTA
           </button>
           
           <button 
             onClick={() => navigate(AppRoute.PROFILE)}
             className="w-full py-4 bg-slate-800 text-white rounded-2xl font-bold text-lg border-2 border-slate-700 active:scale-95 transition-transform"
           >
             JÁ TENHO CONTA
           </button>
        </div>

        <p className="mt-8 text-xs text-slate-600 font-bold uppercase tracking-widest">Versão 2.0 - IA Integrada</p>
      </div>
    </div>
  );
};

export default Welcome;