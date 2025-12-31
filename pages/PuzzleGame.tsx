
import React, { useState, useEffect } from 'react';
import { Layout } from '../components/Layout';
import { Trophy, RefreshCw, Star, Shuffle, ArrowRight } from 'lucide-react';
import { incrementPuzzle, getDailyProgress, getGoals } from '../services/progressService';

const GRID_SIZE = 3; // 3x3 Grid
const TILE_COUNT = GRID_SIZE * GRID_SIZE;

// --- GERADOR DE IMAGENS VETORIAIS (SVG) ---
const svgToUrl = (svgString: string) => `data:image/svg+xml;utf8,${encodeURIComponent(svgString)}`;

const RAW_SVGS = [
  // 1. LEÃOZINHO
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400"><rect width="400" height="400" fill="#fffbeb"/><circle cx="200" cy="200" r="140" fill="#f59e0b"/><circle cx="200" cy="200" r="100" fill="#fbbf24"/><circle cx="160" cy="180" r="12" fill="#374151"/><circle cx="240" cy="180" r="12" fill="#374151"/><circle cx="162" cy="178" r="4" fill="white"/><circle cx="242" cy="178" r="4" fill="white"/><ellipse cx="150" cy="200" rx="15" ry="8" fill="#ef4444" opacity="0.4"/><ellipse cx="250" cy="200" rx="15" ry="8" fill="#ef4444" opacity="0.4"/><path d="M190 220 L210 220 L200 235 Z" fill="#78350f"/><path d="M200 235 L200 255" stroke="#78350f" stroke-width="6" stroke-linecap="round"/><path d="M180 255 Q200 280 220 255" stroke="#78350f" stroke-width="6" fill="none" stroke-linecap="round"/></svg>`,

  // 2. FOGUETE
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400"><rect width="400" height="400" fill="#1e293b"/><circle cx="50" cy="50" r="2" fill="white" opacity="0.5"/><circle cx="350" cy="80" r="3" fill="white" opacity="0.7"/><circle cx="100" cy="300" r="2" fill="white" opacity="0.3"/><path d="M200 80 Q250 150 250 250 L150 250 Q150 150 200 80 Z" fill="#ef4444"/><circle cx="200" cy="180" r="25" fill="#3b82f6" stroke="#e2e8f0" stroke-width="5"/><path d="M150 250 L130 290 L150 270 Z" fill="#991b1b"/><path d="M250 250 L270 290 L250 270 Z" fill="#991b1b"/><path d="M170 250 L180 300 L220 300 L230 250 Z" fill="#f59e0b"/></svg>`,

  // 3. ROBÔ
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400"><rect width="400" height="400" fill="#e0f2fe"/><rect x="120" y="100" width="160" height="140" rx="20" fill="#64748b"/><rect x="100" y="150" width="20" height="40" rx="5" fill="#ef4444"/><rect x="280" y="150" width="20" height="40" rx="5" fill="#ef4444"/><line x1="200" y1="100" x2="200" y2="60" stroke="#64748b" stroke-width="8"/><circle cx="200" cy="50" r="15" fill="#ef4444"/><rect x="150" y="140" width="100" height="30" rx="15" fill="#1e293b"/><circle cx="170" cy="155" r="8" fill="#22c55e"/><circle cx="230" cy="155" r="8" fill="#22c55e"/><path d="M120 240 L280 240 L280 350 L120 350 Z" fill="#3b82f6"/></svg>`,

  // 4. FUNDO DO MAR
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400"><rect width="400" height="400" fill="#0ea5e9"/><path d="M0 350 Q100 320 200 350 T400 350 L400 400 L0 400 Z" fill="#eab308"/><path d="M250 200 Q300 150 350 200 Q300 250 250 200 Z" fill="#f97316"/><path d="M350 200 L380 180 L380 220 Z" fill="#f97316"/><circle cx="280" cy="190" r="5" fill="black"/><path d="M200 280 Q210 200 200 150" stroke="#22c55e" stroke-width="5" fill="none"/></svg>`,

  // 5. CASTELO
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400"><rect width="400" height="400" fill="#f3e8ff"/><rect x="100" y="200" width="200" height="150" fill="#c084fc"/><rect x="80" y="150" width="60" height="200" fill="#a855f7"/><rect x="260" y="150" width="60" height="200" fill="#a855f7"/><path d="M70 150 L110 80 L150 150 Z" fill="#ef4444"/><path d="M250 150 L290 80 L330 150 Z" fill="#ef4444"/><path d="M170 280 Q200 250 230 280 L230 350 L170 350 Z" fill="#4c1d95"/></svg>`,

  // 6. DINOSSAURO
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400"><rect width="400" height="400" fill="#ecfccb"/><path d="M0 300 Q200 280 400 300 L400 400 L0 400 Z" fill="#84cc16"/><path d="M100 250 Q120 150 200 150 Q280 150 300 250 L280 320 L120 320 Z" fill="#22c55e"/><path d="M200 150 Q220 100 280 80 Q320 80 320 120 Q300 150 250 160" fill="#22c55e"/><circle cx="290" cy="100" r="5" fill="black"/><circle cx="50" cy="50" r="40" fill="#facc15"/></svg>`,

  // 7. CARRO VERMELHO
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400"><rect width="400" height="400" fill="#e2e8f0"/><rect x="50" y="200" width="300" height="80" rx="20" fill="#ef4444"/><path d="M100 200 L130 140 L270 140 L300 200 Z" fill="#3b82f6" opacity="0.8"/><circle cx="100" cy="280" r="30" fill="#1e293b"/><circle cx="300" cy="280" r="30" fill="#1e293b"/><circle cx="100" cy="280" r="12" fill="#94a3b8"/><circle cx="300" cy="280" r="12" fill="#94a3b8"/><rect x="20" y="320" width="360" height="10" rx="5" fill="#475569"/></svg>`,

  // 8. BORBOLETA
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400"><rect width="400" height="400" fill="#f0fdf4"/><ellipse cx="200" cy="200" rx="20" ry="100" fill="#374151"/><circle cx="200" cy="120" r="15" fill="#374151"/><path d="M200 150 Q280 80 350 150 Q300 250 200 220" fill="#f472b6"/><path d="M200 150 Q120 80 50 150 Q100 250 200 220" fill="#f472b6"/><path d="M200 220 Q280 320 320 280 Q250 200 200 220" fill="#ec4899"/><path d="M200 220 Q120 320 80 280 Q150 200 200 220" fill="#ec4899"/></svg>`,

  // 9. CORUJA
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400"><rect width="400" height="400" fill="#1e1b4b"/><circle cx="200" cy="200" r="100" fill="#a855f7"/><circle cx="160" cy="180" r="25" fill="white"/><circle cx="240" cy="180" r="25" fill="white"/><circle cx="160" cy="180" r="10" fill="black"/><circle cx="240" cy="180" r="10" fill="black"/><path d="M190 210 L210 210 L200 230 Z" fill="#facc15"/><ellipse cx="150" cy="220" rx="40" ry="80" fill="#9333ea" opacity="0.3"/><ellipse cx="250" cy="220" rx="40" ry="80" fill="#9333ea" opacity="0.3"/><path d="M150 300 L150 330" stroke="#facc15" stroke-width="5"/><path d="M250 300 L250 330" stroke="#facc15" stroke-width="5"/><circle cx="50" cy="50" r="30" fill="#fef08a" opacity="0.8"/></svg>`,

  // 10. CUPCAKE
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400"><rect width="400" height="400" fill="#fff1f2"/><path d="M120 250 L140 350 L260 350 L280 250 Z" fill="#d97706"/><circle cx="200" cy="240" r="70" fill="#fbcfe8"/><circle cx="150" cy="240" r="50" fill="#fbcfe8"/><circle cx="250" cy="240" r="50" fill="#fbcfe8"/><circle cx="200" cy="180" r="50" fill="#fbcfe8"/><circle cx="200" cy="130" r="20" fill="#ef4444"/><rect x="180" y="280" width="10" height="20" rx="5" fill="#f43f5e"/><rect x="210" y="300" width="10" height="20" rx="5" fill="#f9a8d4"/></svg>`,

  // 11. CASA
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400"><rect width="400" height="400" fill="#bae6fd"/><rect x="100" y="200" width="200" height="150" fill="#fde047"/><path d="M80 200 L200 100 L320 200 Z" fill="#ef4444"/><rect x="170" y="270" width="60" height="80" fill="#7c2d12"/><rect x="130" y="230" width="40" height="40" fill="#60a5fa" stroke="white" stroke-width="4"/><path d="M50 350 Q200 340 350 350" stroke="#22c55e" stroke-width="20" fill="none"/></svg>`,

  // 12. BARCO
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400"><rect width="400" height="400" fill="#bfdbfe"/><path d="M0 280 Q200 300 400 280 L400 400 L0 400 Z" fill="#3b82f6"/><path d="M100 250 L300 250 L270 320 L130 320 Z" fill="#7c2d12"/><rect x="195" y="100" width="10" height="150" fill="#3f3f46"/><path d="M205 110 L300 180 L205 230 Z" fill="#ef4444"/><path d="M195 120 L130 180 L195 230 Z" fill="white"/></svg>`,

  // 13. PLANETA
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400"><rect width="400" height="400" fill="#0f172a"/><circle cx="200" cy="200" r="100" fill="#f59e0b"/><ellipse cx="200" cy="200" rx="140" ry="40" fill="none" stroke="#fcd34d" stroke-width="10" transform="rotate(-20 200 200)"/><circle cx="200" cy="200" r="90" fill="#d97706" opacity="0.3"/><circle cx="50" cy="80" r="2" fill="white"/><circle cx="350" cy="300" r="3" fill="white"/><circle cx="100" cy="350" r="2" fill="white"/></svg>`,

  // 14. ARCO-ÍRIS
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400"><rect width="400" height="400" fill="#e0f2fe"/><path d="M50 300 A150 150 0 0 1 350 300" stroke="#ef4444" stroke-width="20" fill="none"/><path d="M70 300 A130 130 0 0 1 330 300" stroke="#f97316" stroke-width="20" fill="none"/><path d="M90 300 A110 110 0 0 1 310 300" stroke="#eab308" stroke-width="20" fill="none"/><path d="M110 300 A90 90 0 0 1 290 300" stroke="#22c55e" stroke-width="20" fill="none"/><path d="M130 300 A70 70 0 0 1 270 300" stroke="#3b82f6" stroke-width="20" fill="none"/><circle cx="60" cy="300" r="30" fill="white" opacity="0.8"/><circle cx="340" cy="300" r="30" fill="white" opacity="0.8"/></svg>`,

  // 15. PINGUIM
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400"><rect width="400" height="400" fill="#e0f7fa"/><ellipse cx="200" cy="220" rx="80" ry="110" fill="#1e293b"/><ellipse cx="200" cy="230" rx="50" ry="80" fill="white"/><circle cx="180" cy="180" r="5" fill="black"/><circle cx="220" cy="180" r="5" fill="black"/><path d="M190 200 L210 200 L200 220 Z" fill="#f97316"/><ellipse cx="140" cy="320" rx="20" ry="10" fill="#f97316"/><ellipse cx="260" cy="320" rx="20" ry="10" fill="#f97316"/></svg>`,

  // 16. FLOR
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400"><rect width="400" height="400" fill="#ecfccb"/><rect x="190" y="200" width="20" height="150" fill="#16a34a"/><circle cx="200" cy="200" r="40" fill="#facc15"/><circle cx="200" cy="140" r="30" fill="#f472b6"/><circle cx="260" cy="200" r="30" fill="#f472b6"/><circle cx="200" cy="260" r="30" fill="#f472b6"/><circle cx="140" cy="200" r="30" fill="#f472b6"/><ellipse cx="240" cy="280" rx="30" ry="15" fill="#22c55e" transform="rotate(-30 240 280)"/></svg>`,

  // 17. TREM
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400"><rect width="400" height="400" fill="#ffedd5"/><rect x="100" y="200" width="160" height="100" rx="10" fill="#ef4444"/><rect x="260" y="240" width="60" height="60" rx="5" fill="#3b82f6"/><rect x="220" y="160" width="30" height="60" fill="black"/><rect x="120" y="220" width="60" height="40" fill="#93c5fd"/><circle cx="140" cy="300" r="25" fill="#374151"/><circle cx="220" cy="300" r="25" fill="#374151"/><circle cx="290" cy="300" r="20" fill="#374151"/><path d="M50 330 L350 330" stroke="#713f12" stroke-width="10"/></svg>`,

  // 18. SOL FELIZ
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400"><rect width="400" height="400" fill="#bae6fd"/><circle cx="200" cy="200" r="80" fill="#facc15"/><circle cx="170" cy="190" r="8" fill="black"/><circle cx="230" cy="190" r="8" fill="black"/><path d="M170 230 Q200 260 230 230" stroke="black" stroke-width="4" fill="none" stroke-linecap="round"/><line x1="200" y1="100" x2="200" y2="70" stroke="#facc15" stroke-width="10" stroke-linecap="round"/><line x1="200" y1="300" x2="200" y2="330" stroke="#facc15" stroke-width="10" stroke-linecap="round"/><line x1="300" y1="200" x2="330" y2="200" stroke="#facc15" stroke-width="10" stroke-linecap="round"/><line x1="100" y1="200" x2="70" y2="200" stroke="#facc15" stroke-width="10" stroke-linecap="round"/></svg>`,

  // 19. JOANINHA
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400"><rect width="400" height="400" fill="#dcfce7"/><circle cx="200" cy="200" r="100" fill="#ef4444"/><circle cx="200" cy="140" r="60" fill="black"/><line x1="200" y1="140" x2="200" y2="300" stroke="black" stroke-width="4"/><circle cx="160" cy="220" r="15" fill="black"/><circle cx="240" cy="220" r="15" fill="black"/><circle cx="180" cy="270" r="12" fill="black"/><circle cx="220" cy="270" r="12" fill="black"/><circle cx="180" cy="130" r="5" fill="white"/><circle cx="220" cy="130" r="5" fill="white"/></svg>`,

  // 20. SUBMARINO
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400"><rect width="400" height="400" fill="#0284c7"/><ellipse cx="200" cy="250" rx="120" ry="60" fill="#facc15"/><rect x="160" y="160" width="40" height="40" fill="#facc15"/><rect x="170" y="130" width="60" height="10" rx="5" fill="#facc15"/><circle cx="160" cy="250" r="15" fill="#0ea5e9"/><circle cx="240" cy="250" r="15" fill="#0ea5e9"/><path d="M320 250 L350 220 L350 280 Z" fill="#facc15"/><circle cx="50" cy="300" r="5" fill="white" opacity="0.3"/><circle cx="80" cy="250" r="8" fill="white" opacity="0.3"/></svg>`
];

const PuzzleGame: React.FC = () => {
  const [tiles, setTiles] = useState<number[]>([]);
  const [emptyIndex, setEmptyIndex] = useState(TILE_COUNT - 1);
  const [won, setWon] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showMissionComplete, setShowMissionComplete] = useState(false);
  const [missionStats, setMissionStats] = useState({ current: 0, target: 3 });

  useEffect(() => {
    // Pick random image on start
    setCurrentImageIndex(Math.floor(Math.random() * RAW_SVGS.length));
    startNewGame();
    
    const p = getDailyProgress();
    const g = getGoals();
    setMissionStats({ current: p.puzzlesSolved || 0, target: g.PUZZLES });
  }, []);

  const startNewGame = () => {
    setWon(false);
    setShowMissionComplete(false);
    
    // Create solved state
    let newTiles = Array.from({ length: TILE_COUNT }, (_, i) => i);
    
    // Shuffle by making random valid moves (ensures solvability)
    let currentEmpty = TILE_COUNT - 1;
    const moves = 60; 
    
    for (let i = 0; i < moves; i++) {
        const neighbors = getNeighbors(currentEmpty);
        const randomNeighbor = neighbors[Math.floor(Math.random() * neighbors.length)];
        newTiles[currentEmpty] = newTiles[randomNeighbor];
        newTiles[randomNeighbor] = TILE_COUNT - 1; 
        currentEmpty = randomNeighbor;
    }

    setTiles(newTiles);
    setEmptyIndex(currentEmpty);
  };

  // Logic to load NEXT level (Random new image)
  const nextLevel = () => {
      let next = Math.floor(Math.random() * RAW_SVGS.length);
      // Ensure we don't pick the same image twice in a row
      while(next === currentImageIndex && RAW_SVGS.length > 1) {
          next = Math.floor(Math.random() * RAW_SVGS.length);
      }
      setCurrentImageIndex(next);
      startNewGame();
  };

  const getNeighbors = (index: number) => {
    const row = Math.floor(index / GRID_SIZE);
    const col = index % GRID_SIZE;
    const neighbors = [];
    if (row > 0) neighbors.push(index - GRID_SIZE); // Top
    if (row < GRID_SIZE - 1) neighbors.push(index + GRID_SIZE); // Bottom
    if (col > 0) neighbors.push(index - 1); // Left
    if (col < GRID_SIZE - 1) neighbors.push(index + 1); // Right
    return neighbors;
  };

  const handleTileClick = (index: number) => {
    if (won) return;

    const neighbors = getNeighbors(emptyIndex);
    if (neighbors.includes(index)) {
        const newTiles = [...tiles];
        newTiles[emptyIndex] = newTiles[index];
        newTiles[index] = TILE_COUNT - 1; 
        
        setTiles(newTiles);
        setEmptyIndex(index);
        checkWin(newTiles);
    }
  };

  const checkWin = (currentTiles: number[]) => {
      const isWin = currentTiles.every((val, index) => val === index);
      if (isWin) {
          setWon(true);
          const reached = incrementPuzzle();
          const p = getDailyProgress();
          setMissionStats({ ...missionStats, current: p.puzzlesSolved || 0 });
          if (reached) setTimeout(() => setShowMissionComplete(true), 800);
      }
  };

  const shuffleImage = () => {
      nextLevel();
  };

  const currentImageUrl = svgToUrl(RAW_SVGS[currentImageIndex]);

  return (
    <Layout title="Quebra-Cabeça" color="text-indigo-600" missionTarget={missionStats}>
      <div className="flex flex-col h-full gap-6 items-center pt-4">
        
        {/* Shuffle Button */}
        <button 
            onClick={shuffleImage} 
            className="bg-white text-indigo-600 px-6 py-3 rounded-2xl border border-slate-200 shadow-sm active:scale-95 transition-transform font-bold text-sm flex items-center gap-2"
        >
            <Shuffle size={20} /> TROCAR IMAGEM
        </button>

        {/* Puzzle Board */}
        <div className="relative p-2 bg-indigo-500 rounded-[2.5rem] shadow-[0_15px_40px_rgba(79,70,229,0.3)]">
            <div 
                className="grid gap-1 bg-indigo-600 p-1 rounded-[2rem] relative overflow-hidden"
                style={{ 
                    gridTemplateColumns: `repeat(${GRID_SIZE}, 1fr)`,
                    width: '320px',
                    height: '320px'
                }}
            >
                {tiles.map((tileValue, index) => {
                    const isEmpty = tileValue === TILE_COUNT - 1; // 8
                    
                    const row = Math.floor(tileValue / GRID_SIZE);
                    const col = tileValue % GRID_SIZE;
                    const xPos = (col * 100) / (GRID_SIZE - 1);
                    const yPos = (row * 100) / (GRID_SIZE - 1);

                    return (
                        <div
                            key={index}
                            onClick={() => handleTileClick(index)}
                            className={`w-full h-full rounded-xl transition-all duration-200 cursor-pointer relative overflow-hidden
                                ${isEmpty && !won ? 'opacity-0 pointer-events-none' : 'shadow-sm border border-white/20'}
                                ${won ? 'scale-100 border-none' : ''}
                            `}
                            style={{
                                backgroundImage: `url("${currentImageUrl}")`,
                                backgroundSize: `${GRID_SIZE * 100}% ${GRID_SIZE * 100}%`,
                                backgroundPosition: `${xPos}% ${yPos}%`,
                                transform: isEmpty && !won ? 'scale(0)' : 'scale(1)'
                            }}
                        >
                           {/* Hint number */}
                           {!won && !isEmpty && (
                                <div className="absolute top-1 left-1 w-5 h-5 bg-black/20 rounded-full flex items-center justify-center text-[10px] text-white font-bold backdrop-blur-sm">
                                    {tileValue + 1}
                                </div>
                           )}
                        </div>
                    );
                })}
            </div>

            {/* Win Overlay */}
            {won && !showMissionComplete && (
                <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-black/50 backdrop-blur-sm rounded-[2.5rem] animate-fade-in">
                    <Star size={64} className="text-yellow-400 animate-spin-slow mb-4 fill-yellow-400" />
                    <h2 className="text-3xl font-black text-white mb-2">LINDO!</h2>
                    <button 
                        onClick={nextLevel} 
                        className="bg-white text-indigo-600 px-8 py-3 rounded-2xl font-black text-lg flex items-center gap-2 active:scale-95 transition-transform shadow-lg mt-4"
                    >
                        <RefreshCw /> NOVO JOGO
                    </button>
                </div>
            )}
        </div>

        {/* Mini Preview & Instruction */}
        {!won && (
            <div className="flex items-center gap-4 bg-white p-3 rounded-2xl border border-slate-100 shadow-sm max-w-xs">
                <div className="w-12 h-12 rounded-lg overflow-hidden border border-slate-200 shrink-0">
                    <img src={currentImageUrl} className="w-full h-full object-cover" />
                </div>
                <p className="text-slate-400 text-xs font-bold leading-tight">Monte a imagem movendo as peças para o espaço vazio.</p>
            </div>
        )}

        {/* Mission Complete Popup */}
        {showMissionComplete && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-6 animate-fade-in">
                <div className="bg-white w-full max-w-sm rounded-[2.5rem] p-8 flex flex-col items-center animate-pop relative overflow-hidden shadow-2xl border-4 border-yellow-300">
                    <div className="w-24 h-24 bg-yellow-100 rounded-full flex items-center justify-center mb-4">
                        <Trophy className="w-12 h-12 text-yellow-500 animate-bounce" />
                    </div>
                    <h2 className="text-2xl font-black text-slate-800 text-center mb-2">QUEBRA-CABEÇA!</h2>
                    <p className="text-slate-500 font-bold text-center mb-6">Você completou o desafio de hoje.</p>
                    
                    <button 
                    onClick={() => { setShowMissionComplete(false); nextLevel(); }}
                    className="w-full py-4 bg-yellow-400 text-yellow-900 rounded-2xl font-black text-xl active:scale-95 transition-transform flex items-center justify-center gap-2"
                    >
                        CONTINUAR <ArrowRight />
                    </button>
                </div>
            </div>
        )}

      </div>
    </Layout>
  );
};

export default PuzzleGame;
