
import React, { useState, useEffect } from 'react';
import { Layout } from '../components/Layout';
import { Trophy, RefreshCw, Star, Check, X } from 'lucide-react';
import { incrementShadow, getDailyProgress, getGoals } from '../services/progressService';
import { 
  Cat, Dog, Fish, Bird, Bug, Zap, Heart, Cloud, Sun, Moon, 
  Umbrella, Car, Plane, Anchor, Key, Bell, Gift, Music, Camera, Ghost 
} from 'lucide-react';

const ICONS = [
  { id: 'cat', icon: Cat, color: '#f97316' }, // Orange
  { id: 'dog', icon: Dog, color: '#8b5cf6' }, // Violet
  { id: 'fish', icon: Fish, color: '#06b6d4' }, // Cyan
  { id: 'bird', icon: Bird, color: '#ef4444' }, // Red
  { id: 'bug', icon: Bug, color: '#84cc16' }, // Lime
  { id: 'zap', icon: Zap, color: '#eab308' }, // Yellow
  { id: 'heart', icon: Heart, color: '#ec4899' }, // Pink
  { id: 'cloud', icon: Cloud, color: '#3b82f6' }, // Blue
  { id: 'sun', icon: Sun, color: '#f59e0b' }, // Amber
  { id: 'moon', icon: Moon, color: '#6366f1' }, // Indigo
  { id: 'car', icon: Car, color: '#10b981' }, // Emerald
  { id: 'plane', icon: Plane, color: '#3b82f6' }, // Blue
  { id: 'key', icon: Key, color: '#fbbf24' }, // Amber
  { id: 'gift', icon: Gift, color: '#f43f5e' }, // Rose
  { id: 'music', icon: Music, color: '#d946ef' }, // Fuchsia
  { id: 'ghost', icon: Ghost, color: '#94a3b8' }, // Slate
];

const ShadowGame: React.FC = () => {
  const [target, setTarget] = useState<any>(null);
  const [options, setOptions] = useState<any[]>([]);
  const [won, setWon] = useState(false);
  const [wrongIndex, setWrongIndex] = useState<number | null>(null);
  const [showMissionComplete, setShowMissionComplete] = useState(false);
  const [missionStats, setMissionStats] = useState({ current: 0, target: 5 });

  useEffect(() => {
    startNewRound();
    const p = getDailyProgress();
    const g = getGoals();
    setMissionStats({ current: p.shadowSolved || 0, target: g.SHADOW });
  }, []);

  const startNewRound = () => {
    setWon(false);
    setWrongIndex(null);
    setShowMissionComplete(false);

    // Pick random target
    const targetItem = ICONS[Math.floor(Math.random() * ICONS.length)];
    setTarget(targetItem);

    // Pick 3 distractions (unique)
    let distractions = ICONS.filter(i => i.id !== targetItem.id);
    distractions = distractions.sort(() => Math.random() - 0.5).slice(0, 3);
    
    // Combine and shuffle
    const allOptions = [targetItem, ...distractions].sort(() => Math.random() - 0.5);
    setOptions(allOptions);
  };

  const handleChoice = (item: any, index: number) => {
    if (won) return;

    if (item.id === target.id) {
        setWon(true);
        const reached = incrementShadow();
        const p = getDailyProgress();
        setMissionStats({ ...missionStats, current: p.shadowSolved || 0 });
        
        if (reached) setTimeout(() => setShowMissionComplete(true), 1000);
        else setTimeout(startNewRound, 1500); // Auto next round if not mission complete
    } else {
        setWrongIndex(index);
        setTimeout(() => setWrongIndex(null), 500);
    }
  };

  if (!target) return null;

  const TargetIcon = target.icon;

  return (
    <Layout title="Jogo das Sombras" color="text-slate-600" missionTarget={missionStats}>
      <div className="flex flex-col h-full items-center justify-between py-6">
        
        {/* Main Target Display */}
        <div className="flex-1 flex flex-col items-center justify-center w-full">
            <div className="relative animate-slide-up">
                <div className="w-48 h-48 bg-white rounded-[3rem] border-4 border-slate-100 shadow-xl flex items-center justify-center relative overflow-hidden">
                   {/* Background Decor */}
                   <div className="absolute inset-0 opacity-10" style={{ backgroundColor: target.color }} />
                   
                   {won ? (
                       <TargetIcon size={96} color={target.color} fill={target.color} className="animate-pop drop-shadow-lg" />
                   ) : (
                       <TargetIcon size={96} color={target.color} fill={target.color} className="drop-shadow-lg" />
                   )}
                </div>
                
                {won && (
                    <div className="absolute -top-4 -right-4 bg-green-500 text-white p-2 rounded-full shadow-lg animate-bounce">
                        <Check size={32} strokeWidth={4} />
                    </div>
                )}
            </div>
            
            <h2 className="text-2xl font-black text-slate-400 mt-8 uppercase tracking-widest">
                {won ? "ACERTOU!" : "Qual é a sombra?"}
            </h2>
        </div>

        {/* Options Grid */}
        <div className="grid grid-cols-2 gap-4 w-full max-w-sm px-4">
            {options.map((opt, idx) => {
                const OptIcon = opt.icon;
                const isCorrect = opt.id === target.id;
                
                // Shadow Style: Dark Gray Fill, No Stroke variation or Dark Stroke
                return (
                    <button
                        key={idx}
                        onClick={() => handleChoice(opt, idx)}
                        disabled={won}
                        className={`
                            h-32 rounded-3xl flex items-center justify-center transition-all duration-300 border-4
                            ${wrongIndex === idx ? 'bg-red-100 border-red-300 animate-shake' : 'bg-slate-200 border-slate-300 hover:bg-slate-300 active:scale-95'}
                            ${won && isCorrect ? 'bg-green-100 border-green-400 ring-4 ring-green-200' : ''}
                        `}
                    >
                        <OptIcon 
                            size={64} 
                            color="#334155" 
                            fill="#334155" // Silhouette look
                            className={`transition-all ${won && isCorrect ? 'scale-110' : 'opacity-60'}`} 
                        />
                    </button>
                );
            })}
        </div>

        {/* Mission Complete Popup */}
        {showMissionComplete && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-6 animate-fade-in">
                <div className="bg-white w-full max-w-sm rounded-[2.5rem] p-8 flex flex-col items-center animate-pop relative overflow-hidden shadow-2xl border-4 border-yellow-300">
                    <div className="w-24 h-24 bg-yellow-100 rounded-full flex items-center justify-center mb-4">
                        <Trophy className="w-12 h-12 text-yellow-500 animate-bounce" />
                    </div>
                    <h2 className="text-2xl font-black text-slate-800 text-center mb-2">MESTRE DAS SOMBRAS!</h2>
                    <p className="text-slate-500 font-bold text-center mb-6">Você encontrou 5 sombras hoje.</p>
                    
                    <button 
                    onClick={() => setShowMissionComplete(false)}
                    className="w-full py-4 bg-yellow-400 text-yellow-900 rounded-2xl font-black text-xl active:scale-95 transition-transform"
                    >
                    CONTINUAR
                    </button>
                </div>
            </div>
        )}

      </div>
    </Layout>
  );
};

export default ShadowGame;
