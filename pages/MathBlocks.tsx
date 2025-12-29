
import React, { useState, useEffect } from 'react';
import { Layout } from '../components/Layout';
import { Star, RefreshCw, Plus, Minus, X, Divide, Check, Trophy } from 'lucide-react';
import { incrementMath, getDailyProgress, getGoals } from '../services/progressService';

const getCharacterStyle = (numberValue: number, blockIndex: number) => {
  if (numberValue === 7) {
    const rainbowColors = ['bg-red-500', 'bg-orange-500', 'bg-yellow-500', 'bg-green-500', 'bg-cyan-500', 'bg-blue-500', 'bg-purple-500'];
    return rainbowColors[blockIndex % 7] + ' text-white';
  }
  if (numberValue >= 10 && numberValue % 10 === 0) return 'bg-white border-2 border-red-500 text-red-500';
  
  switch (numberValue) {
    case 1: return 'bg-red-500 text-white';
    case 2: return 'bg-orange-500 text-white';
    case 3: return 'bg-yellow-400 text-yellow-900';
    case 4: return 'bg-green-500 text-white';
    case 5: return 'bg-cyan-500 text-white';
    case 6: return 'bg-purple-500 text-white';
    case 8: return 'bg-pink-500 text-white';
    case 9: return 'bg-slate-500 text-white';
    default: return 'bg-blue-500 text-white';
  }
};

interface NumberCharacterLocalProps {
  value: number;
  size?: "sm" | "md" | "lg";
}

const NumberCharacterLocal: React.FC<NumberCharacterLocalProps> = ({ value, size = "md" }) => {
  const blockSizeClass = size === "lg" ? "w-14 h-14 text-2xl" : size === "md" ? "w-12 h-12 text-xl" : "w-8 h-8 text-sm";
  
  if (value > 10 && value % 10 !== 0) {
     const tens = Math.floor(value / 10);
     const remainder = value % 10;
     return (
       <div className="flex items-end gap-2">
          {Array.from({length: tens}).map((_, i) => <NumberCharacterLocal key={`ten-${i}`} value={10} size={size} />)}
          <NumberCharacterLocal value={remainder} size={size} />
       </div>
     );
  }

  const blocksCount = value >= 10 ? value / 10 : value;
  const isTen = value >= 10;

  return (
    <div className="flex flex-col-reverse items-center transition-all duration-500 animate-slide-up">
      {Array.from({ length: blocksCount }).map((_, i) => {
        const isFace = i === blocksCount - 1;
        const style = getCharacterStyle(value, i);
        return (
          <div key={i} className={`${blockSizeClass} ${style} rounded-lg flex items-center justify-center relative mb-1 z-[${i}] shadow-sm`}>
            {isFace && (
              <div className="absolute inset-0 flex flex-col items-center justify-center opacity-90">
                 <div className="flex gap-1 mb-1">
                    <div className="w-2 h-2 bg-white rounded-full flex items-center justify-center"><div className="w-1 h-1 bg-black rounded-full" /></div>
                    {value !== 1 && <div className="w-2 h-2 bg-white rounded-full flex items-center justify-center"><div className="w-1 h-1 bg-black rounded-full" /></div>}
                 </div>
                 <div className="w-3 h-1 bg-black/40 rounded-full" />
              </div>
            )}
            {isTen && <span className="font-bold opacity-30 text-[10px]">10</span>}
          </div>
        );
      })}
      <span className={`font-black text-slate-400 mt-2 ${size === "lg" ? "text-3xl" : "text-xl"}`}>{value}</span>
    </div>
  );
};

type Operation = 'ADD' | 'SUB' | 'MUL' | 'DIV';

const MathBlocks: React.FC = () => {
  const [num1, setNum1] = useState(2);
  const [num2, setNum2] = useState(3);
  const [operation, setOperation] = useState<Operation>('ADD');
  const [userAnswer, setUserAnswer] = useState<number | null>(null);
  const [showConfetti, setShowConfetti] = useState(false);
  const [showMissionComplete, setShowMissionComplete] = useState(false);
  
  const [missionStats, setMissionStats] = useState({ current: 0, target: 20 });

  useEffect(() => {
    const p = getDailyProgress();
    const g = getGoals();
    setMissionStats({ current: p.mathCount, target: g.MATH });
  }, []);

  // Calculate correct answer
  let target = 0;
  if (operation === 'ADD') target = num1 + num2;
  if (operation === 'SUB') target = num1 - num2;
  if (operation === 'MUL') target = num1 * num2;
  if (operation === 'DIV') target = num1 / num2;

  const generateProblem = () => {
    setShowConfetti(false);
    setShowMissionComplete(false);
    setUserAnswer(null);
    
    // RANDOMIZE OPERATION
    const ops: Operation[] = ['ADD', 'SUB', 'MUL', 'DIV'];
    const nextOp = ops[Math.floor(Math.random() * ops.length)];
    setOperation(nextOp);

    let n1 = 0, n2 = 0;

    switch (nextOp) {
      case 'ADD':
        if (Math.random() > 0.7) {
           n1 = (Math.floor(Math.random() * 3) + 1) * 10; 
           n2 = 10;
        } else {
           n1 = Math.floor(Math.random() * 5) + 1; 
           n2 = Math.floor(Math.random() * 5) + 1;
        }
        break;
      case 'SUB':
        n1 = Math.floor(Math.random() * 8) + 2; 
        n2 = Math.floor(Math.random() * (n1 - 1)) + 1; 
        break;
      case 'MUL':
        n2 = 2; 
        n1 = Math.floor(Math.random() * 4) + 1;
        break;
      case 'DIV':
        n2 = 2;
        n1 = n2 * (Math.floor(Math.random() * 4) + 1); 
        break;
    }
    
    setNum1(n1);
    setNum2(n2);
  };

  const handleAnswer = (val: number) => {
    if (showConfetti) return;
    setUserAnswer(val);
    if (val === target) {
      const reached = incrementMath(); // Track progress
      
      const p = getDailyProgress();
      setMissionStats({ ...missionStats, current: p.mathCount });

      setShowConfetti(true);
      if (reached) {
        setTimeout(() => setShowMissionComplete(true), 800);
      }
    }
  };

  const renderOperator = () => {
    // Cleaner Operator Design - Reduced Size
    const style = "w-12 h-12 flex items-center justify-center bg-slate-800 text-white rounded-2xl shadow-md";
    if (operation === 'ADD') return <div className={style}><Plus size={28} strokeWidth={4} /></div>;
    if (operation === 'SUB') return <div className={style}><Minus size={28} strokeWidth={4} /></div>;
    if (operation === 'MUL') return <div className={style}><X size={28} strokeWidth={4} /></div>;
    return <div className={style}><Divide size={28} strokeWidth={4} /></div>;
  }

  const options = React.useMemo(() => {
    const opts = new Set<number>();
    opts.add(target);
    while (opts.size < 4) {
      let offset = Math.floor(Math.random() * 5) + 1;
      if (Math.random() > 0.5) offset *= -1;
      const fake = target + offset;
      if (fake > 0 && fake <= 100) opts.add(fake);
    }
    return Array.from(opts).sort((a, b) => a - b);
  }, [target, operation]);

  return (
    <Layout title="Matemática" missionTarget={missionStats}>
      <div className="flex flex-col h-full gap-4">
        
        {/* Challenge Area */}
        <div className="flex-1 bg-white rounded-[2rem] border border-slate-100 shadow-sm m-2 flex flex-col items-center justify-center relative overflow-hidden">
           <div className="flex items-end justify-center gap-2 md:gap-4 w-full p-4 z-10 scale-90">
              <div className="flex flex-col items-center">
                 <NumberCharacterLocal value={num1} />
              </div>
              
              <div className="mb-14 mx-2">{renderOperator()}</div>
              
              <div className="flex flex-col items-center">
                <NumberCharacterLocal value={num2} />
              </div>
              
              <div className="mb-16 text-5xl font-black text-slate-300">=</div>
              
              <div className="mb-12">
                 <div className={`w-24 h-28 border-4 border-dashed rounded-2xl flex items-center justify-center text-5xl font-black transition-all ${userAnswer === target ? 'bg-green-100 border-green-400 text-green-600' : 'border-slate-200 text-slate-300 bg-slate-50'}`}>
                    {userAnswer ?? "?"}
                 </div>
              </div>
           </div>
           
           <div className="absolute top-4 right-4">
              <button onClick={generateProblem} className="p-3 bg-slate-50 rounded-full text-slate-400 hover:bg-slate-100 transition-colors">
                <RefreshCw size={24} />
              </button>
           </div>
        </div>

        {/* Options Pad */}
        <div className="bg-white rounded-t-[3rem] p-6 pb-12 shadow-[0_-5px_20px_rgba(0,0,0,0.03)] z-20">
           <p className="text-center font-bold text-slate-400 uppercase tracking-widest text-xs mb-6">Qual é a resposta?</p>
           <div className="grid grid-cols-2 gap-4 max-w-md mx-auto">
             {options.map((opt) => (
               <button
                 key={opt}
                 onClick={() => handleAnswer(opt)}
                 className={`py-6 rounded-2xl text-4xl font-black active:scale-95 transition-transform 
                   ${userAnswer === opt 
                      ? (opt === target ? 'bg-green-500 text-white shadow-lg shadow-green-200' : 'bg-red-500 text-white shadow-lg shadow-red-200') 
                      : 'bg-blue-50 text-blue-600 border border-blue-100 hover:bg-blue-100'
                   }`}
               >
                 {opt}
               </button>
             ))}
           </div>
        </div>

        {/* Success Popup */}
        {showConfetti && !showMissionComplete && (
          <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-6">
             <div className="bg-white w-full max-w-sm rounded-[2.5rem] p-8 flex flex-col items-center animate-pop relative overflow-hidden shadow-2xl">
                <div className="flex items-center gap-2 mb-4">
                  <Star className="w-10 h-10 fill-yellow-400 text-yellow-500 animate-spin-slow flex-shrink-0" />
                  <h2 className="text-3xl font-black text-slate-800 tracking-wide whitespace-nowrap">MUITO BEM!</h2>
                  <Star className="w-10 h-10 fill-yellow-400 text-yellow-500 animate-spin-slow flex-shrink-0" />
                </div>
                
                <div className="mb-8 p-6 bg-slate-50 rounded-3xl border border-slate-100 w-full flex justify-center">
                  <NumberCharacterLocal value={target} size="lg" />
                </div>
                
                <button 
                  onClick={() => generateProblem()}
                  className="w-full py-4 bg-green-500 text-white rounded-2xl font-black text-xl active:scale-95 flex items-center justify-center gap-3 transition-transform shadow-lg shadow-green-200"
                >
                  <Check strokeWidth={4} className="w-6 h-6"/> CONTINUAR
                </button>
             </div>
          </div>
        )}

        {/* Mission Complete Popup */}
        {showMissionComplete && (
            <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-6 animate-fade-in">
               <div className="bg-white w-full max-w-sm rounded-[2.5rem] p-8 flex flex-col items-center animate-pop relative overflow-hidden shadow-2xl border-4 border-yellow-300">
                  <div className="w-24 h-24 bg-yellow-100 rounded-full flex items-center justify-center mb-4">
                     <Trophy className="w-12 h-12 text-yellow-500 animate-bounce" />
                  </div>
                  <h2 className="text-2xl font-black text-slate-800 text-center mb-2">MISSÃO MATEMÁTICA!</h2>
                  <p className="text-slate-500 font-bold text-center mb-6">Você atingiu a meta de hoje.</p>
                  
                  <button 
                    onClick={() => generateProblem()}
                    className="w-full py-4 bg-yellow-400 text-yellow-900 rounded-2xl font-black text-xl active:scale-95 transition-transform"
                  >
                    CONTINUAR JOGANDO
                  </button>
               </div>
            </div>
        )}
      </div>
    </Layout>
  );
};

export default MathBlocks;
