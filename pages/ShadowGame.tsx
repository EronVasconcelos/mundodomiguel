
import React, { useState, useEffect } from 'react';
import { Layout } from '../components/Layout';
import { Trophy, Check } from 'lucide-react';
import { incrementShadow, getDailyProgress, getGoals } from '../services/progressService';
import { 
  Cat, Dog, Fish, Bird, Bug, Zap, Heart, Cloud, Sun, Moon, 
  Car, Plane, Anchor, Key, Gift, Music, Ghost,
  Rabbit, Snail, Turtle, Trees, Flower, Leaf, Snowflake, Flame, Droplets,
  Bus, Truck, Bike, Ship, Rocket,
  Apple, Banana, Cherry, Pizza, IceCream, Cookie,
  Crown, Star, Watch, Umbrella, Glasses, Bell
} from 'lucide-react';

// --- CATEGORIZED ICONS DB ---
// 40 Icons Total
const ICONS = [
  // ANIMALS (10)
  { id: 'cat', icon: Cat, color: '#f97316', category: 'animal' },
  { id: 'dog', icon: Dog, color: '#8b5cf6', category: 'animal' },
  { id: 'fish', icon: Fish, color: '#06b6d4', category: 'animal' },
  { id: 'bird', icon: Bird, color: '#ef4444', category: 'animal' },
  { id: 'bug', icon: Bug, color: '#84cc16', category: 'animal' },
  { id: 'rabbit', icon: Rabbit, color: '#f472b6', category: 'animal' },
  { id: 'snail', icon: Snail, color: '#a855f7', category: 'animal' },
  { id: 'turtle', icon: Turtle, color: '#10b981', category: 'animal' },
  { id: 'ghost', icon: Ghost, color: '#94a3b8', category: 'animal' }, // Bonus
  
  // NATURE (9)
  { id: 'cloud', icon: Cloud, color: '#3b82f6', category: 'nature' },
  { id: 'sun', icon: Sun, color: '#f59e0b', category: 'nature' },
  { id: 'moon', icon: Moon, color: '#6366f1', category: 'nature' },
  { id: 'tree', icon: Trees, color: '#15803d', category: 'nature' },
  { id: 'flower', icon: Flower, color: '#ec4899', category: 'nature' },
  { id: 'leaf', icon: Leaf, color: '#22c55e', category: 'nature' },
  { id: 'snow', icon: Snowflake, color: '#0ea5e9', category: 'nature' },
  { id: 'flame', icon: Flame, color: '#f97316', category: 'nature' },
  { id: 'drop', icon: Droplets, color: '#3b82f6', category: 'nature' },

  // VEHICLES (7)
  { id: 'car', icon: Car, color: '#ef4444', category: 'vehicle' },
  { id: 'plane', icon: Plane, color: '#3b82f6', category: 'vehicle' },
  { id: 'bus', icon: Bus, color: '#f59e0b', category: 'vehicle' },
  { id: 'truck', icon: Truck, color: '#64748b', category: 'vehicle' },
  { id: 'bike', icon: Bike, color: '#14b8a6', category: 'vehicle' },
  { id: 'ship', icon: Ship, color: '#3b82f6', category: 'vehicle' },
  { id: 'rocket', icon: Rocket, color: '#8b5cf6', category: 'vehicle' },

  // FOOD (6)
  { id: 'apple', icon: Apple, color: '#ef4444', category: 'food' },
  { id: 'banana', icon: Banana, color: '#facc15', category: 'food' },
  { id: 'cherry', icon: Cherry, color: '#be123c', category: 'food' },
  { id: 'pizza', icon: Pizza, color: '#f97316', category: 'food' },
  { id: 'icecream', icon: IceCream, color: '#f472b6', category: 'food' },
  { id: 'cookie', icon: Cookie, color: '#d97706', category: 'food' },

  // OBJECTS (8)
  { id: 'key', icon: Key, color: '#fbbf24', category: 'object' },
  { id: 'gift', icon: Gift, color: '#f43f5e', category: 'object' },
  { id: 'music', icon: Music, color: '#d946ef', category: 'object' },
  { id: 'bell', icon: Bell, color: '#f59e0b', category: 'object' },
  { id: 'anchor', icon: Anchor, color: '#1e293b', category: 'object' },
  { id: 'glasses', icon: Glasses, color: '#334155', category: 'object' },
  { id: 'umbrella', icon: Umbrella, color: '#8b5cf6', category: 'object' },
  { id: 'crown', icon: Crown, color: '#eab308', category: 'object' },
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

    // 1. Pick random target from ALL icons
    const targetItem = ICONS[Math.floor(Math.random() * ICONS.length)];
    setTarget(targetItem);

    // 2. Pick 3 distractions
    // LOGIC: Try to pick from SAME CATEGORY to make shadows similar (harder/better)
    const categoryMates = ICONS.filter(i => i.category === targetItem.category && i.id !== targetItem.id);
    const otherMates = ICONS.filter(i => i.category !== targetItem.category);
    
    let pool = [...categoryMates];
    
    // Fill pool with randoms if category is too small (shouldn't happen with updated list, but safe)
    if (pool.length < 3) {
        pool = [...pool, ...otherMates];
    }

    // Shuffle pool and pick 3
    const distractions = pool.sort(() => Math.random() - 0.5).slice(0, 3);
    
    // Combine and shuffle options
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
