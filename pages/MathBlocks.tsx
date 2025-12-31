
import React, { useState, useEffect, useRef } from 'react';
import { Layout } from '../components/Layout';
import { RefreshCw, Plus, Minus, X, Divide, Trophy, CheckCircle, XCircle } from 'lucide-react';
import { incrementMath, getDailyProgress, getGoals } from '../services/progressService';

// --- STYLES FOR BLOCKS ---
const getCharacterStyle = (numberValue: number, blockIndex: number) => {
  if (numberValue === 7) {
    const rainbowColors = ['bg-red-500', 'bg-orange-500', 'bg-yellow-500', 'bg-green-500', 'bg-cyan-500', 'bg-blue-500', 'bg-purple-500'];
    return rainbowColors[blockIndex % 7] + ' text-white';
  }
  if (numberValue >= 10 && numberValue % 10 === 0) return 'bg-white border-2 border-red-500 text-red-500';
  
  switch (numberValue) {
    case 1: return 'bg-red-500 text-white shadow-red-700';
    case 2: return 'bg-orange-500 text-white shadow-orange-700';
    case 3: return 'bg-yellow-400 text-yellow-900 shadow-yellow-600';
    case 4: return 'bg-green-500 text-white shadow-green-700';
    case 5: return 'bg-cyan-500 text-white shadow-cyan-700';
    case 6: return 'bg-purple-500 text-white shadow-purple-700';
    case 8: return 'bg-pink-500 text-white shadow-pink-700';
    case 9: return 'bg-slate-500 text-white shadow-slate-700';
    default: return 'bg-blue-500 text-white shadow-blue-700';
  }
};

interface NumberCharacterLocalProps {
  value: number;
  size?: "sm" | "md" | "lg";
}

const NumberCharacterLocal: React.FC<NumberCharacterLocalProps> = ({ value, size = "md" }) => {
  // Ajuste visual para parecer um bloco 3D (border-b-4 ou shadow simulada)
  const blockSizeClass = size === "lg" ? "w-16 h-16 text-3xl" : size === "md" ? "w-12 h-12 text-xl" : "w-8 h-8 text-sm";
  
  if (value > 10 && value % 10 !== 0) {
     const tens = Math.floor(value / 10);
     const remainder = value % 10;
     return (
       <div className="flex items-end gap-1">
          {Array.from({length: tens}).map((_, i) => <NumberCharacterLocal key={`ten-${i}`} value={10} size={size} />)}
          <NumberCharacterLocal value={remainder} size={size} />
       </div>
     );
  }

  const blocksCount = value >= 10 ? value / 10 : value;
  const isTen = value >= 10;

  return (
    <div className="flex flex-col-reverse items-center transition-all duration-500 animate-slide-up pb-1">
      {Array.from({ length: blocksCount }).map((_, i) => {
        const isFace = i === blocksCount - 1;
        const style = getCharacterStyle(value, i);
        return (
          <div key={i} className={`${blockSizeClass} ${style} rounded-xl flex items-center justify-center relative -mb-2 z-[${i}] border-b-4 border-black/20`}>
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
      <span className={`font-black text-slate-300 mt-2 ${size === "lg" ? "text-2xl" : "text-lg"}`}>{value}</span>
    </div>
  );
};

// Componente Visual para Operadores e Igualdade (Estilo Bloco)
const SymbolBlock: React.FC<{ children: React.ReactNode, colorClass?: string }> = ({ children, colorClass = "bg-slate-700 text-white" }) => (
    <div className="flex flex-col items-center justify-end pb-6 h-full"> 
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl font-black border-b-4 border-black/20 shadow-sm ${colorClass}`}>
            {children}
        </div>
    </div>
);

type Operation = 'ADD' | 'SUB' | 'MUL' | 'DIV';

const MathBlocks: React.FC = () => {
  const [num1, setNum1] = useState(2);
  const [num2, setNum2] = useState(3);
  const [operation, setOperation] = useState<Operation>('ADD');
  
  const [userAnswer, setUserAnswer] = useState<number | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  
  const [showMissionComplete, setShowMissionComplete] = useState(false);
  const [missionStats, setMissionStats] = useState({ current: 0, target: 20 });
  const historyRef = useRef<string[]>([]);

  useEffect(() => {
    const p = getDailyProgress();
    const g = getGoals();
    setMissionStats({ current: p.mathCount, target: g.MATH });
    generateProblem();
  }, []);

  let target = 0;
  if (operation === 'ADD') target = num1 + num2;
  if (operation === 'SUB') target = num1 - num2;
  if (operation === 'MUL') target = num1 * num2;
  if (operation === 'DIV') target = num1 / num2;

  const generateProblem = () => {
    setIsCorrect(null);
    setUserAnswer(null);
    setShowMissionComplete(false);
    
    const ops: Operation[] = ['ADD', 'SUB', 'MUL', 'DIV'];
    
    let isValid = false;
    let attempts = 0;
    let newOp: Operation = 'ADD';
    let n1 = 0;
    let n2 = 0;

    while (!isValid && attempts < 50) {
        attempts++;
        newOp = ops[Math.floor(Math.random() * ops.length)];
        
        switch (newOp) {
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

        const problemKey = `${n1}${newOp}${n2}`;
        if (!historyRef.current.includes(problemKey)) {
            isValid = true;
            historyRef.current.push(problemKey);
            if (historyRef.current.length > 40) historyRef.current.shift();
        }
    }
    
    setOperation(newOp);
    setNum1(n1);
    setNum2(n2);
  };

  const handleAnswer = (val: number) => {
    if (isCorrect === true) return; // Prevent double clicking if already correct

    setUserAnswer(val);
    
    if (val === target) {
      setIsCorrect(true);
      const reached = incrementMath(); 
      const p = getDailyProgress();
      setMissionStats({ ...missionStats, current: p.mathCount });

      // Auto advance after short delay
      setTimeout(() => {
          if (reached) {
              setShowMissionComplete(true);
          } else {
              generateProblem();
          }
      }, 1500);

    } else {
      setIsCorrect(false);
      // Reset error state after visual feedback
      setTimeout(() => {
          setUserAnswer(null);
          setIsCorrect(null);
      }, 1000);
    }
  };

  const renderOperator = () => {
    if (operation === 'ADD') return <SymbolBlock colorClass="bg-slate-700 text-white"><Plus strokeWidth={4} /></SymbolBlock>;
    if (operation === 'SUB') return <SymbolBlock colorClass="bg-slate-700 text-white"><Minus strokeWidth={4} /></SymbolBlock>;
    if (operation === 'MUL') return <SymbolBlock colorClass="bg-slate-700 text-white"><X strokeWidth={4} /></SymbolBlock>;
    return <SymbolBlock colorClass="bg-slate-700 text-white"><Divide strokeWidth={4} /></SymbolBlock>;
  }

  // Generate exactly 3 options
  const options = React.useMemo(() => {
    const opts = new Set<number>();
    opts.add(target);
    while (opts.size < 3) {
      let offset = Math.floor(Math.random() * 5) + 1;
      if (Math.random() > 0.5) offset *= -1;
      const fake = target + offset;
      if (fake > 0 && fake <= 100) opts.add(fake);
    }
    return Array.from(opts).sort((a, b) => a - b);
  }, [target, operation]);

  return (
    <Layout title="Matemática" missionTarget={missionStats}>
      <div className="flex flex-col h-full gap-6 justify-center"> {/* Adicionado justify-center aqui */}
        
        {/* EQUATION AREA */}
        <div className="bg-slate-800 rounded-[2.5rem] border border-slate-700 shadow-sm flex flex-col items-center justify-center relative overflow-hidden py-8"> {/* Removido flex-1 */}
           
           {/* The Equation Row */}
           <div className="flex items-end justify-center gap-2 md:gap-3 w-full px-2">
              
              {/* Num 1 */}
              <div className="flex flex-col items-center justify-end h-32 w-16">
                 <NumberCharacterLocal value={num1} />
              </div>
              
              {/* Operator */}
              <div className="h-20 pb-4">
                  {renderOperator()}
              </div>
              
              {/* Num 2 */}
              <div className="flex flex-col items-center justify-end h-32 w-16">
                <NumberCharacterLocal value={num2} />
              </div>
              
              {/* Equals */}
              <div className="h-20 pb-4">
                 <SymbolBlock colorClass="bg-slate-700 text-slate-300">=</SymbolBlock>
              </div>
              
              {/* Result Placeholder / Answer */}
              <div className="flex flex-col items-center justify-end h-32 w-20">
                 {userAnswer !== null ? (
                    <div className={`animate-pop flex flex-col items-center`}>
                        <div className={`w-16 h-16 rounded-xl flex items-center justify-center text-3xl font-black border-b-4 shadow-sm mb-2
                            ${isCorrect 
                                ? 'bg-green-500 border-green-700 text-white' 
                                : 'bg-red-500 border-red-700 text-white animate-shake'
                            }`}>
                            {userAnswer}
                        </div>
                         {isCorrect && <CheckCircle className="text-green-500 animate-bounce" size={24} />}
                         {isCorrect === false && <XCircle className="text-red-500" size={24} />}
                    </div>
                 ) : (
                    <div className="w-16 h-16 bg-slate-700 rounded-xl border-4 border-dashed border-slate-600 flex items-center justify-center text-slate-400 text-3xl font-black mb-2 animate-pulse">
                        ?
                    </div>
                 )}
              </div>
           </div>
           
           {/* Manual Refresh (if stuck) */}
           <div className="absolute top-4 right-4">
              <button onClick={generateProblem} className="p-2 bg-slate-700 rounded-full text-slate-400 hover:bg-slate-600 transition-colors">
                <RefreshCw size={20} />
              </button>
           </div>
        </div>

        {/* OPTIONS AREA - 3 Buttons in a Row */}
        <div className="w-full">
           <p className="text-center font-bold text-slate-300 uppercase tracking-widest text-xs mb-4">Escolha a resposta:</p>
           <div className="flex gap-4 justify-center px-4">
             {options.map((opt) => (
               <button
                 key={opt}
                 onClick={() => handleAnswer(opt)}
                 disabled={userAnswer !== null} 
                 className={`flex-1 h-20 rounded-2xl text-3xl font-black border-b-8 transition-all active:border-b-0 active:translate-y-2
                   ${userAnswer === opt 
                      ? (isCorrect ? 'bg-green-500 border-green-700 text-white' : 'bg-red-500 border-red-700 text-white') 
                      : 'bg-slate-800 border-slate-700 text-slate-300 shadow-sm hover:bg-slate-700'
                   }`}
               >
                 {opt}
               </button>
             ))}
           </div>
        </div>

        {/* Mission Complete Popup */}
        {showMissionComplete && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-6 animate-fade-in">
               <div className="bg-slate-900 w-full max-w-sm rounded-[2.5rem] p-8 flex flex-col items-center animate-pop relative overflow-hidden shadow-2xl border-4 border-yellow-300">
                  <div className="w-24 h-24 bg-yellow-100 rounded-full flex items-center justify-center mb-4">
                     <Trophy className="w-12 h-12 text-yellow-500 animate-bounce" />
                  </div>
                  <h2 className="text-2xl font-black text-white text-center mb-2">MISSÃO MATEMÁTICA!</h2>
                  <p className="text-slate-300 font-bold text-center mb-6">Você atingiu a meta de hoje.</p>
                  
                  <button 
                    onClick={generateProblem}
                    className="w-full py-4 bg-yellow-600 text-yellow-950 rounded-2xl font-black text-xl active:scale-95 transition-transform"
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