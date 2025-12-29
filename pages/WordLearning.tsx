import React, { useState, useEffect } from 'react';
import { Layout } from '../components/Layout';
import { Check, RefreshCw, Volume2, Trophy, Star, Crown } from 'lucide-react';
import { updateWordLevel, getDailyProgress } from '../services/progressService';

// Database expanded with 4 levels
const WORDS_DB = [
  // LEVEL 1 (2 Syllables - Simple)
  { level: 1, word: 'BOLA', syllables: ['BO', 'LA'], icon: '⚽' },
  { level: 1, word: 'CASA', syllables: ['CA', 'SA'], icon: '🏠' },
  { level: 1, word: 'PATO', syllables: ['PA', 'TO'], icon: '🦆' },
  { level: 1, word: 'GATO', syllables: ['GA', 'TO'], icon: '🐱' },
  { level: 1, word: 'DADO', syllables: ['DA', 'DO'], icon: '🎲' },
  { level: 1, word: 'SAPO', syllables: ['SA', 'PO'], icon: '🐸' },
  { level: 1, word: 'LUA', syllables: ['LU', 'A'], icon: '🌙' },
  { level: 1, word: 'SOL', syllables: ['SOL'], icon: '☀️' },
  { level: 1, word: 'MÃO', syllables: ['MÃO'], icon: '✋' },
  { level: 1, word: 'PÉ', syllables: ['PÉ'], icon: '🦶' },
  { level: 1, word: 'LEÃO', syllables: ['LE', 'ÃO'], icon: '🦁' },
  { level: 1, word: 'URSO', syllables: ['UR', 'SO'], icon: '🐻' },
  { level: 1, word: 'UVA', syllables: ['U', 'VA'], icon: '🍇' },
  { level: 1, word: 'OVO', syllables: ['O', 'VO'], icon: '🥚' },
  { level: 1, word: 'BOLO', syllables: ['BO', 'LO'], icon: '🍰' },
  { level: 1, word: 'FACA', syllables: ['FA', 'CA'], icon: '🔪' },
  { level: 1, word: 'MALA', syllables: ['MA', 'LA'], icon: '🧳' },
  { level: 1, word: 'RATO', syllables: ['RA', 'TO'], icon: '🐀' },
  { level: 1, word: 'VACA', syllables: ['VA', 'CA'], icon: '🐄' },
  { level: 1, word: 'LIXO', syllables: ['LI', 'XO'], icon: '🗑️' },
  { level: 1, word: 'FOCA', syllables: ['FO', 'CA'], icon: '🦭' },
  { level: 1, word: 'LOBO', syllables: ['LO', 'BO'], icon: '🐺' },
  { level: 1, word: 'SUCO', syllables: ['SU', 'CO'], icon: '🧃' },
  { level: 1, word: 'RODA', syllables: ['RO', 'DA'], icon: '🛞' },
  { level: 1, word: 'VELA', syllables: ['VE', 'LA'], icon: '🕯️' },
  { level: 1, word: 'MOTO', syllables: ['MO', 'TO'], icon: '🏍️' },
  { level: 1, word: 'BICO', syllables: ['BI', 'CO'], icon: '👶' },
  { level: 1, word: 'FOGO', syllables: ['FO', 'GO'], icon: '🔥' },
  { level: 1, word: 'GELO', syllables: ['GE', 'LO'], icon: '🧊' },

  // LEVEL 2 (3 Syllables - Medium)
  { level: 2, word: 'MACACO', syllables: ['MA', 'CA', 'CO'], icon: '🐵' },
  { level: 2, word: 'BANANA', syllables: ['BA', 'NA', 'NA'], icon: '🍌' },
  { level: 2, word: 'CAVALO', syllables: ['CA', 'VA', 'LO'], icon: '🐎' },
  { level: 2, word: 'TOMATE', syllables: ['TO', 'MA', 'TE'], icon: '🍅' },
  { level: 2, word: 'ESCOLA', syllables: ['ES', 'CO', 'LA'], icon: '🏫' },
  { level: 2, word: 'PIPOCA', syllables: ['PI', 'PO', 'CA'], icon: '🍿' },
  { level: 2, word: 'GIRAFA', syllables: ['GI', 'RA', 'FA'], icon: '🦒' },
  { level: 2, word: 'SAPATO', syllables: ['SA', 'PA', 'TO'], icon: '👞' },
  { level: 2, word: 'JANELA', syllables: ['JA', 'NE', 'LA'], icon: '🪟' },
  { level: 2, word: 'ABELHA', syllables: ['A', 'BE', 'LHA'], icon: '🐝' },
  { level: 2, word: 'JACARÉ', syllables: ['JA', 'CA', 'RÉ'], icon: '🐊' },
  { level: 2, word: 'CAMISA', syllables: ['CA', 'MI', 'SA'], icon: '👕' },
  { level: 2, word: 'BONECA', syllables: ['BO', 'NE', 'CA'], icon: '🎎' },
  { level: 2, word: 'CORUJA', syllables: ['CO', 'RU', 'JA'], icon: '🦉' },
  { level: 2, word: 'MENINO', syllables: ['ME', 'NI', 'NO'], icon: '👦' },
  { level: 2, word: 'BATATA', syllables: ['BA', 'TA', 'TA'], icon: '🥔' },
  { level: 2, word: 'BALEIA', syllables: ['BA', 'LEI', 'A'], icon: '🐋' },
  { level: 2, word: 'COELHO', syllables: ['CO', 'E', 'LHO'], icon: '🐇' },
  { level: 2, word: 'ESTRELA', syllables: ['ES', 'TRE', 'LA'], icon: '⭐' },
  { level: 2, word: 'FOGUETE', syllables: ['FO', 'GUE', 'TE'], icon: '🚀' },
  { level: 2, word: 'SORVETE', syllables: ['SOR', 'VE', 'TE'], icon: '🍦' },
  { level: 2, word: 'PIRATA', syllables: ['PI', 'RA', 'TA'], icon: '🏴‍☠️' },
  { level: 2, word: 'TUBARÃO', syllables: ['TU', 'BA', 'RÃO'], icon: '🦈' },
  { level: 2, word: 'ROBÔ', syllables: ['RO', 'BÔ'], icon: '🤖' },
  { level: 2, word: 'VIOLÃO', syllables: ['VI', 'O', 'LÃO'], icon: '🎸' },

  // LEVEL 3 (4+ Syllables - Hard)
  { level: 3, word: 'ELEFANTE', syllables: ['E', 'LE', 'FAN', 'TE'], icon: '🐘' },
  { level: 3, word: 'BORBOLETA', syllables: ['BOR', 'BO', 'LE', 'TA'], icon: '🦋' },
  { level: 3, word: 'BICICLETA', syllables: ['BI', 'CI', 'CLE', 'TA'], icon: '🚲' },
  { level: 3, word: 'TARTARUGA', syllables: ['TAR', 'TA', 'RU', 'GA'], icon: '🐢' },
  { level: 3, word: 'HIPOPÓTAMO', syllables: ['HI', 'PO', 'PÓ', 'TA', 'MO'], icon: '🦛' },
  { level: 3, word: 'MELANCIA', syllables: ['ME', 'LAN', 'CI', 'A'], icon: '🍉' },
  { level: 3, word: 'COMPUTADOR', syllables: ['COM', 'PU', 'TA', 'DOR'], icon: '💻' },
  { level: 3, word: 'ABACAXI', syllables: ['A', 'BA', 'CA', 'XI'], icon: '🍍' },
  { level: 3, word: 'CHOCOLATE', syllables: ['CHO', 'CO', 'LA', 'TE'], icon: '🍫' },
  { level: 3, word: 'GELADEIRA', syllables: ['GE', 'LA', 'DEI', 'RA'], icon: '❄️' },
  { level: 3, word: 'TELEFONE', syllables: ['TE', 'LE', 'FO', 'NE'], icon: '☎️' },
  { level: 3, word: 'PASSARINHO', syllables: ['PAS', 'SA', 'RI', 'NHO'], icon: '🐦' },
  { level: 3, word: 'GOLFINHO', syllables: ['GOL', 'FI', 'NHO'], icon: '🐬' },
  { level: 3, word: 'UNICÓRNIO', syllables: ['U', 'NI', 'CÓR', 'NIO'], icon: '🦄' },
  { level: 3, word: 'ARCO-ÍRIS', syllables: ['AR', 'CO', 'Í', 'RIS'], icon: '🌈' },

  // LEVEL 4 (Master - Miguel's Favorites & Complex Sounds)
  { level: 4, word: 'BOMBEIRO', syllables: ['BOM', 'BEI', 'RO'], icon: '🚒' },
  { level: 4, word: 'POLICIAL', syllables: ['PO', 'LI', 'CI', 'AL'], icon: '👮' },
  { level: 4, word: 'AMBULÂNCIA', syllables: ['AM', 'BU', 'LÂN', 'CIA'], icon: '🚑' },
  { level: 4, word: 'DINOSSAURO', syllables: ['DI', 'NOS', 'SAU', 'RO'], icon: '🦖' },
  { level: 4, word: 'HELICÓPTERO', syllables: ['HE', 'LI', 'CÓP', 'TE', 'RO'], icon: '🚁' },
  { level: 4, word: 'ASTRONAUTA', syllables: ['AS', 'TRO', 'NAU', 'TA'], icon: '👨‍🚀' },
  { level: 4, word: 'FUTEBOL', syllables: ['FU', 'TE', 'BOL'], icon: '⚽' },
  { level: 4, word: 'ENFERMEIRA', syllables: ['EN', 'FER', 'MEI', 'RA'], icon: '👩‍⚕️' },
  { level: 4, word: 'PROFESSORA', syllables: ['PRO', 'FES', 'SO', 'RA'], icon: '👩‍🏫' },
  { level: 4, word: 'TRATOR', syllables: ['TRA', 'TOR'], icon: '🚜' },
  { level: 4, word: 'TESOURO', syllables: ['TE', 'SOU', 'RO'], icon: '💎' },
];

const WordLearning: React.FC = () => {
  // Sync state with global daily progress on mount
  const [level, setLevel] = useState(1);
  const [score, setScore] = useState(0);
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [selectedSyllables, setSelectedSyllables] = useState<string[]>([]);
  const [shuffledSyllables, setShuffledSyllables] = useState<string[]>([]);
  const [isSuccess, setIsSuccess] = useState(false);
  const [filteredWords, setFilteredWords] = useState(WORDS_DB.filter(w => w.level === 1));

  useEffect(() => {
    // Resume from saved daily progress if higher
    const progress = getDailyProgress();
    if (progress.wordLevel > 1) {
        setLevel(Math.min(progress.wordLevel, 4));
    }
  }, []);

  useEffect(() => {
    // Filter words by current level
    const words = WORDS_DB.filter(w => w.level === level);
    setFilteredWords(words.sort(() => Math.random() - 0.5)); // Shuffle order
    setCurrentWordIndex(0);
  }, [level]);

  const currentWord = filteredWords[currentWordIndex] || filteredWords[0];

  useEffect(() => {
    if (currentWord) startLevel();
  }, [currentWordIndex, filteredWords]);

  const startLevel = () => {
    setSelectedSyllables([]);
    setIsSuccess(false);
    // Shuffle syllables
    const syls = [...currentWord.syllables].sort(() => Math.random() - 0.5);
    setShuffledSyllables(syls);
  };

  const handleSyllableClick = (syl: string) => {
    if (isSuccess) return;
    const newSelected = [...selectedSyllables, syl];
    setSelectedSyllables(newSelected);

    const currentString = newSelected.join('');
    const targetString = currentWord.syllables.join('');
    
    if (targetString === currentString) {
       setIsSuccess(true);
       setScore(prev => prev + 1);
    } else if (!targetString.startsWith(currentString)) {
       // Wrong sequence, shake effect (implied) and reset
       setTimeout(() => {
         setSelectedSyllables([]);
       }, 400);
    }
  };

  const nextWord = () => {
    if (score > 0 && score % 5 === 0 && level < 4) {
      // Level Up!
      const newLevel = level + 1;
      setLevel(newLevel);
      updateWordLevel(newLevel); // Sync global progress
    } else {
      setCurrentWordIndex((prev) => (prev + 1) % filteredWords.length);
    }
  };

  const getLevelColor = () => {
    switch(level) {
      case 1: return "bg-orange-500";
      case 2: return "bg-emerald-500";
      case 3: return "bg-blue-500";
      case 4: return "bg-purple-600";
      default: return "bg-orange-500";
    }
  }

  const getLevelTextColor = () => {
    switch(level) {
      case 1: return "text-orange-500";
      case 2: return "text-emerald-500";
      case 3: return "text-blue-500";
      case 4: return "text-purple-600";
      default: return "text-orange-500";
    }
  }

  const getLevelName = () => {
    switch(level) {
      case 1: return "Nível 1";
      case 2: return "Nível 2";
      case 3: return "Nível 3";
      case 4: return "Mestre";
      default: return "Nível 1";
    }
  }

  return (
    <Layout title={getLevelName()} color={getLevelTextColor()}>
      <div className="flex flex-col h-full items-center justify-between p-4 pb-8">
        
        {/* Progress Bar & Level Indicator */}
        <div className="w-full max-w-xs flex flex-col gap-2 mb-4">
           <div className="flex justify-between items-center px-2">
             <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Progresso</span>
             <div className="flex gap-1">
                {Array.from({length: 4}).map((_, i) => (
                  <div key={i} className={`w-2 h-2 rounded-full ${i < level ? getLevelColor() : 'bg-slate-200'}`} />
                ))}
             </div>
           </div>
           <div className="w-full bg-slate-200 h-4 rounded-full overflow-hidden">
             <div 
               className={`h-full ${getLevelColor()} transition-all duration-500`}
               style={{ width: `${(score % 5) * 20}%` }} 
             />
           </div>
        </div>

        {/* Image Display */}
        <div className="flex-1 flex flex-col items-center justify-center w-full">
            <div className={`w-56 h-56 bg-white rounded-[3rem] flex items-center justify-center text-[8rem] mb-8 border-b-8 border-slate-200 relative`}>
              {level === 4 && <Crown className="absolute -top-6 -right-6 text-yellow-400 fill-yellow-400 w-16 h-16 animate-bounce" />}
              {currentWord?.icon}
            </div>

            {/* Success Feedback */}
            {isSuccess ? (
            <div className="flex flex-col items-center animate-slide-up">
                <div className="flex items-center gap-2 mb-2">
                    <Star className="text-yellow-400 fill-yellow-400 w-8 h-8 animate-spin-slow" />
                    <h2 className="text-5xl font-black text-green-500 tracking-widest">{currentWord?.word}</h2>
                    <Star className="text-yellow-400 fill-yellow-400 w-8 h-8 animate-spin-slow" />
                </div>
                <button 
                    onClick={nextWord}
                    className="mt-6 bg-green-500 text-white px-10 py-4 rounded-2xl font-black text-xl border-b-8 border-green-700 active:border-b-0 active:translate-y-2 transition-all"
                >
                    {score > 0 && score % 5 === 0 && level < 4 ? "PRÓXIMO NÍVEL!" : "PRÓXIMA"}
                </button>
            </div>
            ) : (
            <div className="mb-8 min-h-[5rem] flex flex-wrap justify-center gap-2 bg-slate-100 rounded-2xl p-4 w-full max-w-sm border-2 border-slate-200">
                {selectedSyllables.map((s, i) => (
                    <span key={i} className="text-5xl font-black text-slate-800 animate-pop bg-white px-2 rounded-lg border-b-4 border-slate-300">{s}</span>
                ))}
                {selectedSyllables.length === 0 && <span className="text-slate-400 text-xl font-bold self-center">Toque nas sílabas...</span>}
            </div>
            )}
        </div>

        {/* Syllable Keyboard */}
        {!isSuccess && (
          <div className="flex flex-wrap gap-3 justify-center max-w-md w-full">
            {shuffledSyllables.map((syl, idx) => {
              // Simple usage tracking logic
              const timesInWord = currentWord?.syllables.filter(x => x === syl).length || 0;
              const timesSelected = selectedSyllables.filter(x => x === syl).length;
              const isUsed = timesSelected >= timesInWord;

              return (
                <button
                  key={`${syl}-${idx}`}
                  onClick={() => !isUsed && handleSyllableClick(syl)}
                  disabled={isUsed}
                  className={`min-w-[5rem] h-20 px-4 rounded-2xl font-black text-3xl border-b-8 transition-all
                    ${isUsed 
                      ? 'bg-slate-100 text-slate-300 border-slate-200 scale-95' 
                      : `${getLevelColor()} text-white border-black/20 active:border-b-0 active:translate-y-2`
                    }`}
                >
                  {syl}
                </button>
              );
            })}
          </div>
        )}
        
        <div className="mt-6 w-full flex justify-center">
           <button onClick={() => { setSelectedSyllables([]); }} className="text-slate-400 font-bold flex items-center gap-2 bg-white px-4 py-2 rounded-full border-2 border-slate-100">
             <RefreshCw size={16} /> Reiniciar palavra
           </button>
        </div>
      </div>
    </Layout>
  );
};

export default WordLearning;