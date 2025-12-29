
import React, { useState, useEffect, useRef } from 'react';
import { Layout } from '../components/Layout';
import { Trophy, RefreshCw, Check, Star } from 'lucide-react';
import { incrementWordSearch, getDailyProgress, getGoals } from '../services/progressService';

const GRID_SIZE = 8;
const WORDS_POOL = ['PATO', 'GATO', 'BOLA', 'CASA', 'UVA', 'OVO', 'SOL', 'LUA', 'DADO', 'MALA', 'VACA', 'FACA', 'REI', 'PÉ', 'MÃO'];

type Cell = {
  letter: string;
  selected: boolean;
  found: boolean;
  x: number;
  y: number;
};

const WordSearch: React.FC = () => {
  const [grid, setGrid] = useState<Cell[]>([]);
  const [targetWords, setTargetWords] = useState<string[]>([]);
  const [foundWords, setFoundWords] = useState<string[]>([]);
  const [selection, setSelection] = useState<number[]>([]);
  const [won, setWon] = useState(false);
  const [showMissionComplete, setShowMissionComplete] = useState(false);
  
  const [missionStats, setMissionStats] = useState({ current: 0, target: 3 });
  
  const gridRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    startNewGame();
    // Load Mission Progress
    const p = getDailyProgress();
    const g = getGoals();
    setMissionStats({ current: p.wordSearchSolved || 0, target: g.WORD_SEARCH });
  }, []);

  const startNewGame = () => {
    setShowMissionComplete(false);
    const shuffled = [...WORDS_POOL].sort(() => Math.random() - 0.5);
    const chosen = shuffled.slice(0, 3);
    setTargetWords(chosen);
    setFoundWords([]);
    setWon(false);
    setSelection([]);

    let newGrid: Cell[] = Array.from({ length: GRID_SIZE * GRID_SIZE }, (_, i) => ({
      letter: '',
      selected: false,
      found: false,
      x: i % GRID_SIZE,
      y: Math.floor(i / GRID_SIZE)
    }));

    chosen.forEach(word => {
      let placed = false;
      let attempts = 0;
      while (!placed && attempts < 50) {
        const direction = Math.random() > 0.5 ? 'H' : 'V';
        const row = Math.floor(Math.random() * GRID_SIZE);
        const col = Math.floor(Math.random() * GRID_SIZE);

        if (canPlace(newGrid, word, row, col, direction)) {
           placeWord(newGrid, word, row, col, direction);
           placed = true;
        }
        attempts++;
      }
    });

    const alphabet = "ABCDEFGHIJLMNOPQRSTUVXZ";
    newGrid = newGrid.map(cell => {
      if (cell.letter === '') {
        return { ...cell, letter: alphabet[Math.floor(Math.random() * alphabet.length)] };
      }
      return cell;
    });

    setGrid(newGrid);
  };

  const canPlace = (g: Cell[], word: string, row: number, col: number, dir: string) => {
    if (dir === 'H') {
      if (col + word.length > GRID_SIZE) return false;
      for (let i = 0; i < word.length; i++) {
        const idx = row * GRID_SIZE + (col + i);
        if (g[idx].letter !== '' && g[idx].letter !== word[i]) return false;
      }
    } else {
      if (row + word.length > GRID_SIZE) return false;
      for (let i = 0; i < word.length; i++) {
        const idx = (row + i) * GRID_SIZE + col;
        if (g[idx].letter !== '' && g[idx].letter !== word[i]) return false;
      }
    }
    return true;
  };

  const placeWord = (g: Cell[], word: string, row: number, col: number, dir: string) => {
    for (let i = 0; i < word.length; i++) {
      const idx = dir === 'H' ? row * GRID_SIZE + (col + i) : (row + i) * GRID_SIZE + col;
      g[idx].letter = word[i];
    }
  };

  const handleStart = (idx: number) => {
    if (won) return;
    setSelection([idx]);
  };

  const handleEnter = (idx: number) => {
    if (won || selection.length === 0) return;
    const startIdx = selection[0];
    const startX = startIdx % GRID_SIZE;
    const startY = Math.floor(startIdx / GRID_SIZE);
    const currX = idx % GRID_SIZE;
    const currY = Math.floor(idx / GRID_SIZE);

    if (startX === currX || startY === currY) {
      const path: number[] = [];
      if (startX === currX) { 
         const min = Math.min(startY, currY);
         const max = Math.max(startY, currY);
         for(let y=min; y<=max; y++) path.push(y * GRID_SIZE + startX);
      } else { 
         const min = Math.min(startX, currX);
         const max = Math.max(startX, currX);
         for(let x=min; x<=max; x++) path.push(startY * GRID_SIZE + x);
      }
      setSelection(path);
    }
  };

  // Fixed touch handler
  const handleTouchMove = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    const element = document.elementFromPoint(touch.clientX, touch.clientY);
    
    // Find the cell div via data attribute
    const cellDiv = element?.closest('[data-cell-index]');
    if (cellDiv) {
       const idx = parseInt(cellDiv.getAttribute('data-cell-index') || '-1');
       if (idx !== -1) {
          handleEnter(idx);
       }
    }
  };

  const handleEnd = () => {
    if (won || selection.length === 0) return;
    
    const selectedWord = selection.map(idx => grid[idx].letter).join('');
    const reversedWord = selectedWord.split('').reverse().join('');
    
    if (targetWords.includes(selectedWord) && !foundWords.includes(selectedWord)) {
       markFound(selectedWord, selection);
    } else if (targetWords.includes(reversedWord) && !foundWords.includes(reversedWord)) {
       markFound(reversedWord, selection);
    }

    setSelection([]);
  };

  const markFound = (word: string, indices: number[]) => {
    const newFound = [...foundWords, word];
    setFoundWords(newFound);
    
    const newGrid = [...grid];
    indices.forEach(idx => newGrid[idx].found = true);
    setGrid(newGrid);

    if (newFound.length === targetWords.length) {
      setWon(true);
      const reached = incrementWordSearch();
      // Update local state to reflect new count immediately in header
      const p = getDailyProgress();
      setMissionStats({ ...missionStats, current: p.wordSearchSolved || 0 });
      
      if (reached) setTimeout(() => setShowMissionComplete(true), 1000);
    }
  };

  return (
    <Layout title="Caça Palavras" color="text-indigo-600" missionTarget={missionStats}>
      <div className="flex flex-col h-full gap-4 items-center">
        
        <div className="bg-white rounded-2xl p-4 w-full shadow-sm border border-slate-100 mb-2">
           <p className="text-center text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Encontre as palavras:</p>
           <div className="flex flex-wrap justify-center gap-2">
             {targetWords.map(word => (
               <div key={word} className={`px-4 py-2 rounded-xl font-black text-lg transition-all ${foundWords.includes(word) ? 'bg-green-500 text-white scale-110 shadow-lg shadow-green-200' : 'bg-slate-100 text-slate-400'}`}>
                 {word}
               </div>
             ))}
           </div>
        </div>

        <div 
           className="relative bg-white p-3 rounded-2xl shadow-lg border-b-8 border-indigo-200 touch-none"
           onMouseLeave={handleEnd}
           onTouchEnd={handleEnd}
           onMouseUp={handleEnd}
           onTouchMove={handleTouchMove} 
        >
           {won && !showMissionComplete && (
              <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-white/90 backdrop-blur-sm rounded-2xl animate-fade-in">
                 <Trophy size={64} className="text-yellow-400 animate-bounce mb-4" />
                 <h2 className="text-3xl font-black text-indigo-900 mb-6">MUITO BEM!</h2>
                 <button onClick={startNewGame} className="bg-indigo-500 text-white px-8 py-4 rounded-2xl font-black text-xl flex items-center gap-2 active:scale-95 transition-transform shadow-lg shadow-indigo-300">
                    <RefreshCw /> JOGAR MAIS
                 </button>
              </div>
           )}

           <div 
             className="grid gap-1 touch-none select-none"
             style={{ gridTemplateColumns: `repeat(${GRID_SIZE}, 1fr)` }}
             ref={gridRef}
           >
             {grid.map((cell, idx) => {
               const isSelected = selection.includes(idx);
               const isFound = cell.found;
               
               let style = "bg-indigo-50 text-indigo-900";
               if (isFound) style = "bg-green-500 text-white animate-pop";
               else if (isSelected) style = "bg-indigo-400 text-white scale-95";

               return (
                 <div
                   key={idx}
                   data-cell-index={idx} // Crucial for touch detection
                   onMouseDown={() => handleStart(idx)}
                   onMouseEnter={() => handleEnter(idx)}
                   onTouchStart={() => handleStart(idx)}
                   className={`w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center rounded-lg font-black text-xl cursor-pointer transition-colors ${style}`}
                 >
                   {cell.letter}
                 </div>
               );
             })}
           </div>
        </div>

        {/* Mission Complete Popup */}
        {showMissionComplete && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-6 animate-fade-in">
               <div className="bg-white w-full max-w-sm rounded-[2.5rem] p-8 flex flex-col items-center animate-pop relative overflow-hidden shadow-2xl border-4 border-yellow-300">
                  <div className="w-24 h-24 bg-yellow-100 rounded-full flex items-center justify-center mb-4">
                     <Trophy className="w-12 h-12 text-yellow-500 animate-bounce" />
                  </div>
                  <h2 className="text-2xl font-black text-slate-800 text-center mb-2">MISSÃO CUMPRIDA!</h2>
                  <p className="text-slate-500 font-bold text-center mb-6">Você achou todas as palavras da missão.</p>
                  
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

export default WordSearch;
