import React, { useState, useEffect } from 'react';
import { getInstantStory, generateStoryText, generateStoryImage } from '../services/geminiService';
import { Sparkles, Loader2, BookOpen, Gift, Moon, Edit3, Send, WifiOff, Key, Download, Check, HelpCircle, X, ExternalLink } from 'lucide-react';
import { StoryData } from '../types';

const StoryTime: React.FC = () => {
  const [topic, setTopic] = useState("Aventura Espacial");
  const [customTopic, setCustomTopic] = useState("");
  const [showCustomInput, setShowCustomInput] = useState(false);
  
  // State for Mode Selection
  const [useAI, setUseAI] = useState(false); // Default to Local (False)

  const [loading, setLoading] = useState(false);
  const [loadingPhase, setLoadingPhase] = useState("");
  const [story, setStory] = useState<StoryData | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [imageRevealed, setImageRevealed] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [downloaded, setDownloaded] = useState(false);
  const [showKeyHelp, setShowKeyHelp] = useState(false);
  
  // Check for AI Studio environment
  const hasAIStudio = typeof window !== 'undefined' && (window as any).aistudio;

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const handleModeSwitch = (mode: boolean) => {
    setUseAI(mode);
    // Clear current story so the UI is clean for the new mode
    setStory(null);
    setImageUrl(null);
    setImageRevealed(false);
    setDownloaded(false);
  };

  const predefinedTopics = [
    "Polícia e Ladrão", "Futebol de Robôs", "Bombeiro Herói", 
    "Numberblocks na Praia", "Castelo de LEGO", "Dinossauro Amigo",
    "Viagem à Lua", "Fundo do Mar", "Escola de Super-Heróis", "Piquenique na Floresta"
  ];

  const handleCreateStory = async (selectedTopic: string) => {
    setLoading(true);
    setStory(null);
    setImageUrl(null);
    setImageRevealed(false);
    setDownloaded(false);
    
    try {
      if (!useAI) {
        // --- LOCAL MODE (INSTANT) ---
        setLoadingPhase("Abrindo o livro...");
        // Small delay for UI feel
        await new Promise(r => setTimeout(r, 600)); 
        
        const localStory = getInstantStory(selectedTopic);
        setStory({
          title: localStory.title,
          content: localStory.content,
          moral: localStory.moral
        });
        setImageUrl(localStory.image);
      } else {
        // --- AI MODE (GENERATE) ---
        if (!isOnline) {
          alert("A mágica precisa de internet! Mudando para modo Livro.");
          setUseAI(false);
          setLoading(false);
          return;
        }

        setLoadingPhase("A Mágica está escrevendo...");
        const storyData = await generateStoryText(selectedTopic);
        setStory(storyData);

        setLoadingPhase("Pintando o desenho...");
        const img = await generateStoryImage(storyData.content);
        setImageUrl(img);
      }

    } catch (e) {
      alert("Ops! O contador de histórias dormiu. Tente de novo!");
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadImage = () => {
    if (!imageUrl) return;
    
    const link = document.createElement('a');
    link.href = imageUrl;
    link.download = `Historia-Miguel-${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    setDownloaded(true);
    setTimeout(() => setDownloaded(false), 3000);
  };

  return (
    // Override Layout background specifically for StoryTime to be Night Mode
    <div className="h-full flex flex-col font-sans relative bg-[#0f172a] text-white">
       {/* Simple Header for Story Mode */}
       <div className="px-4 pt-6 pb-2">
         <header className="bg-slate-800/50 backdrop-blur-md rounded-3xl px-4 py-3 flex items-center justify-between border border-slate-700">
            <button onClick={() => window.history.back()} className="w-10 h-10 bg-slate-700 rounded-full flex items-center justify-center text-slate-300 active:scale-95 transition-transform">
               <BookOpen />
            </button>
            <h1 className="text-xl font-black uppercase tracking-wider text-center flex-1 mx-2 text-yellow-400">Hora de Dormir</h1>
            <div className="flex items-center gap-2">
              {hasAIStudio && (
                <>
                  <button 
                    onClick={() => setShowKeyHelp(true)}
                    className="w-10 h-10 bg-slate-700 rounded-full flex items-center justify-center text-slate-300 active:scale-95 transition-transform"
                  >
                    <HelpCircle size={18} />
                  </button>
                  <button 
                    onClick={() => (window as any).aistudio.openSelectKey()}
                    className="w-10 h-10 bg-yellow-500/20 border border-yellow-500/50 rounded-full flex items-center justify-center text-yellow-400 active:scale-95 transition-transform animate-pulse"
                    title="Configurar Chave Mágica"
                  >
                     <Key size={18} />
                  </button>
                </>
              )}
              <div className="w-10 flex items-center justify-center">
                {isOnline ? <Moon className="text-yellow-200 fill-yellow-200" /> : <WifiOff className="text-slate-500" size={20} />}
              </div>
            </div>
         </header>
       </div>

      <div className="flex-1 overflow-y-auto p-4 pb-20">
        
        {/* Input Section */}
        {!story && !loading && (
          <div className="bg-slate-800/50 p-6 rounded-3xl border border-slate-700 space-y-6">
            
            {/* Mode Toggle */}
            <div className="flex bg-slate-900 p-1 rounded-2xl border border-slate-700 relative">
               <button 
                 onClick={() => handleModeSwitch(false)}
                 className={`flex-1 py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all relative z-10 ${!useAI ? 'bg-slate-700 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'}`}
               >
                  <BookOpen size={18} /> Livro (Rápido)
               </button>
               <button 
                 onClick={() => handleModeSwitch(true)}
                 className={`flex-1 py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all relative z-10 ${useAI ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-900/50' : 'text-slate-400 hover:text-slate-200'}`}
               >
                  <Sparkles size={18} /> Mágica IA
               </button>
            </div>

            <h2 className="text-2xl font-black text-white text-center">
              {useAI ? "O que vamos criar hoje?" : "Qual história vamos ler?"}
            </h2>
            
            <div className="flex flex-wrap gap-3 justify-center">
              {predefinedTopics.map(t => (
                <button 
                  key={t}
                  onClick={() => handleCreateStory(t)}
                  className="px-4 py-3 rounded-2xl border-b-4 border-slate-900 active:border-b-0 active:translate-y-1 bg-slate-700 text-slate-200 font-bold text-sm transition-all hover:bg-slate-600"
                >
                  {t}
                </button>
              ))}
              
              <button 
                onClick={() => setShowCustomInput(!showCustomInput)}
                className={`px-4 py-3 rounded-2xl border-b-4 active:border-b-0 active:translate-y-1 font-bold text-sm transition-all flex items-center gap-2 ${useAI ? 'bg-indigo-600 border-indigo-900 text-white' : 'bg-slate-700 border-slate-900 text-slate-200'}`}
              >
                <Edit3 size={16} /> Outro Assunto...
              </button>
            </div>

            {showCustomInput && (
              <div className="flex gap-2 animate-slide-up">
                 <input 
                   type="text" 
                   value={customTopic}
                   onChange={(e) => setCustomTopic(e.target.value)}
                   placeholder={useAI ? "Invente uma história nova..." : "Procure uma história..."}
                   className="flex-1 bg-slate-900 border border-slate-600 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-yellow-500"
                 />
                 <button 
                   onClick={() => customTopic && handleCreateStory(customTopic)}
                   className="bg-green-500 text-white p-3 rounded-xl font-bold"
                 >
                   <Send />
                 </button>
              </div>
            )}
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-20 text-slate-400">
            {useAI ? (
              <Loader2 className="w-16 h-16 animate-spin mb-4 text-indigo-400" />
            ) : (
              <BookOpen className="w-16 h-16 animate-bounce mb-4 text-slate-400" />
            )}
            <p className="text-2xl font-bold animate-pulse text-yellow-200 text-center px-4">{loadingPhase}</p>
          </div>
        )}

        {/* Story Display */}
        {story && (
          <div className="space-y-6 animate-slide-up">
            <div className="text-center py-6 px-4">
               <h2 className="text-4xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-200 to-amber-500 leading-tight">
                 {story.title}
               </h2>
               {!useAI && <span className="text-xs font-bold text-slate-500 bg-slate-800 px-2 py-1 rounded-full mt-2 inline-block">DO LIVRO MÁGICO</span>}
            </div>

            <div className="bg-slate-800 p-6 md:p-8 rounded-[2rem] border border-slate-700 shadow-xl">
              <div className="prose prose-lg max-w-none text-slate-300 font-medium leading-relaxed space-y-4 text-lg">
                 {story.content.split('\n').map((paragraph, idx) => (
                    paragraph.trim() && <p key={idx}>{paragraph}</p>
                 ))}
              </div>
              
              <div className="mt-8 bg-slate-900 p-4 rounded-2xl border border-slate-700 flex gap-3 items-start">
                <Sparkles className="w-6 h-6 text-yellow-400 flex-shrink-0 mt-1" />
                <div>
                  <span className="font-bold text-slate-500 block text-sm uppercase tracking-wide">Moral da História:</span>
                  <span className="text-yellow-100 font-bold text-lg">{story.moral}</span>
                </div>
              </div>
            </div>

            <div className="mt-8">
              {!imageRevealed ? (
                <button 
                   onClick={() => setImageRevealed(true)}
                   className="w-full py-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-[2.5rem] text-white flex flex-col items-center justify-center gap-2 animate-bounce-slow active:scale-95 transition-transform border border-white/20 shadow-lg shadow-indigo-900/50"
                >
                   <Gift className="w-16 h-16 mb-2" />
                   <span className="text-2xl font-black tracking-wider">ABRIR SURPRESA!</span>
                </button>
              ) : (
                <div className="animate-pop space-y-4">
                   <div className="aspect-square w-full bg-slate-900 rounded-[2.5rem] overflow-hidden border-4 border-slate-700 relative shadow-2xl group">
                      {imageUrl ? (
                        <img 
                            src={imageUrl} 
                            alt="Story Surprise" 
                            className="w-full h-full object-cover" 
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <BookOpen className="w-12 h-12 text-slate-700" />
                        </div>
                      )}

                      {/* Download Button */}
                      {imageUrl && (
                        <button 
                          onClick={handleDownloadImage}
                          className={`absolute bottom-4 right-4 px-5 py-3 rounded-full font-bold text-sm flex items-center gap-2 shadow-lg active:scale-95 transition-all
                            ${downloaded ? 'bg-green-500 text-white' : 'bg-white/90 text-slate-900 hover:bg-white'}
                          `}
                        >
                           {downloaded ? (
                              <><Check className="w-5 h-5" /> Salvo!</>
                           ) : (
                              <><Download className="w-5 h-5 text-indigo-600" /> Salvar Foto</>
                           )}
                        </button>
                      )}
                   </div>
                </div>
              )}
            </div>

            <div className="pt-8 pb-4">
              <button 
                onClick={() => { setStory(null); setImageUrl(null); setImageRevealed(false); setDownloaded(false); }}
                className="w-full bg-slate-800 text-slate-400 font-bold py-4 rounded-2xl border-b-4 border-slate-900 active:border-b-0 active:translate-y-1 transition-all"
              >
                Ler outra história
              </button>
            </div>
          </div>
        )}
      </div>

      {/* --- INSTRUCTION MODAL (API KEY HELP) --- */}
      {showKeyHelp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fade-in">
           <div className="bg-slate-900 border-2 border-yellow-500/50 p-6 rounded-3xl max-w-md w-full relative shadow-2xl shadow-yellow-900/20">
              <button onClick={() => setShowKeyHelp(false)} className="absolute top-4 right-4 text-slate-400 hover:text-white bg-slate-800 p-2 rounded-full"><X size={20}/></button>
              
              <div className="flex flex-col gap-4">
                 <h2 className="text-2xl font-black text-yellow-400 flex items-center gap-3">
                   <Key className="w-8 h-8 fill-yellow-500/20"/>
                   Ativar a Mágica
                 </h2>
                 
                 <div className="space-y-4 text-slate-300 text-sm leading-relaxed">
                    <p className="font-medium text-white text-base">Olá Guardião! 👋</p>
                    <p>Para criar histórias novas e infinitas, você precisa ativar a chave da inteligência artificial.</p>
                    
                    <div className="bg-slate-800 p-4 rounded-xl border border-slate-700">
                       <h3 className="text-white font-bold mb-2">Como fazer?</h3>
                       <ol className="list-decimal pl-5 space-y-2 text-slate-400">
                          <li>Toque no botão <span className="text-yellow-400 font-bold">Selecionar Chave</span> abaixo.</li>
                          <li>Isso abrirá uma janela do Google.</li>
                          <li>Selecione ou crie um projeto (é gratuito para texto e imagens).</li>
                       </ol>
                    </div>

                    <button onClick={() => { setShowKeyHelp(false); (window as any).aistudio.openSelectKey(); }} className="w-full py-4 bg-gradient-to-r from-yellow-500 to-amber-600 hover:from-yellow-400 hover:to-amber-500 text-white font-black text-lg rounded-xl transition-all shadow-lg shadow-yellow-900/40 active:scale-95 flex items-center justify-center gap-2">
                       <Key size={20} /> SELECIONAR CHAVE
                    </button>
                    
                    <p className="text-center text-xs text-slate-500 mt-2">Se não ativar, continuaremos usando as histórias do livro offline.</p>
                 </div>
              </div>
           </div>
        </div>
      )}

    </div>
  );
};

export default StoryTime;