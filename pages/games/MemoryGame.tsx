
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppRoute, GameState } from '../../types';
import { ArrowLeft, RefreshCw, Trophy } from 'lucide-react';

const CARDS_ICONS = ['🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼'];

interface Card {
  id: number;
  icon: string;
  isFlipped: boolean;
  isMatched: boolean;
}

const MemoryGame: React.FC = () => {
  const navigate = useNavigate();
  const [cards, setCards] = useState<Card[]>([]);
  const [flippedCards, setFlippedCards] = useState<number[]>([]);
  const [gameState, setGameState] = useState<GameState>(GameState.IDLE);
  const [moves, setMoves] = useState(0);

  useEffect(() => {
    startNewGame();
  }, []);

  const startNewGame = () => {
    const shuffledCards = [...CARDS_ICONS, ...CARDS_ICONS]
      .sort(() => Math.random() - 0.5)
      .map((icon, index) => ({
        id: index,
        icon,
        isFlipped: false,
        isMatched: false,
      }));
    setCards(shuffledCards);
    setFlippedCards([]);
    setMoves(0);
    setGameState(GameState.PLAYING);
  };

  const handleCardClick = (id: number) => {
    if (gameState !== GameState.PLAYING) return;
    
    // Prevent clicking already matched, flipped, or if 2 cards are already flipped
    const clickedCard = cards.find(c => c.id === id);
    if (!clickedCard || clickedCard.isMatched || clickedCard.isFlipped || flippedCards.length >= 2) return;

    // Flip the card
    const newCards = cards.map(c => c.id === id ? { ...c, isFlipped: true } : c);
    setCards(newCards);
    
    const newFlipped = [...flippedCards, id];
    setFlippedCards(newFlipped);

    if (newFlipped.length === 2) {
      setMoves(p => p + 1);
      checkForMatch(newFlipped, newCards);
    }
  };

  const checkForMatch = (flippedIds: number[], currentCards: Card[]) => {
    const [firstId, secondId] = flippedIds;
    const firstCard = currentCards.find(c => c.id === firstId);
    const secondCard = currentCards.find(c => c.id === secondId);

    if (firstCard?.icon === secondCard?.icon) {
      // Match!
      setTimeout(() => {
        const matchedCards = currentCards.map(c => 
          flippedIds.includes(c.id) ? { ...c, isMatched: true, isFlipped: true } : c
        );
        setCards(matchedCards);
        setFlippedCards([]);
        
        // Check win
        if (matchedCards.every(c => c.isMatched)) {
          setGameState(GameState.WON);
        }
      }, 500);
    } else {
      // No match
      setTimeout(() => {
        const resetCards = currentCards.map(c => 
          flippedIds.includes(c.id) ? { ...c, isFlipped: false } : c
        );
        setCards(resetCards);
        setFlippedCards([]);
      }, 1000);
    }
  };

  return (
    <div className="h-full flex flex-col font-sans bg-pink-950 text-white relative">
      {/* Header */}
      <div className="p-4 flex items-center justify-between bg-pink-900/50 backdrop-blur-md border-b border-pink-800">
         <button onClick={() => navigate(-1)} className="w-10 h-10 bg-pink-800 rounded-full flex items-center justify-center active:scale-95 transition-transform"><ArrowLeft size={24} strokeWidth={3} /></button>
         <h1 className="text-xl font-black uppercase">Memória</h1>
         <div className="bg-pink-800 px-3 py-1 rounded-full text-sm font-bold">{moves} Jogadas</div>
      </div>

      <div className="flex-1 p-4 flex flex-col items-center justify-center">
        {gameState === GameState.WON ? (
          <div className="text-center animate-pop bg-white/10 p-8 rounded-3xl border border-white/20 backdrop-blur-md">
             <Trophy size={64} className="mx-auto text-yellow-400 mb-4 animate-bounce" />
             <h2 className="text-4xl font-black mb-2">Parabéns!</h2>
             <p className="text-pink-200 mb-6">Você completou em {moves} jogadas.</p>
             <button onClick={startNewGame} className="bg-pink-500 hover:bg-pink-400 text-white px-8 py-4 rounded-2xl font-black text-xl flex items-center gap-2 mx-auto active:scale-95 transition-transform">
               <RefreshCw /> Jogar de Novo
             </button>
          </div>
        ) : (
          <div className="grid grid-cols-4 gap-3 w-full max-w-md aspect-square">
            {cards.map(card => (
              <button
                key={card.id}
                onClick={() => handleCardClick(card.id)}
                className={`relative w-full h-full rounded-xl transition-all duration-300 transform preserve-3d
                   ${card.isFlipped || card.isMatched ? 'rotate-y-180' : 'active:scale-95'}
                `}
                style={{ perspective: '1000px' }}
              >
                 <div className={`absolute inset-0 w-full h-full rounded-xl flex items-center justify-center backface-hidden transition-all duration-300
                    ${card.isFlipped || card.isMatched 
                      ? 'bg-white text-5xl rotate-y-180 border-b-4 border-slate-200' 
                      : 'bg-gradient-to-br from-pink-500 to-rose-600 border-b-4 border-rose-800 shadow-md'}
                 `}>
                    {card.isFlipped || card.isMatched ? card.icon : '❓'}
                 </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MemoryGame;
