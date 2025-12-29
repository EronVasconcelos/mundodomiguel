import React, { useState, useEffect } from 'react';
import { getInstantStory, generateStoryText, generateStoryImage } from '../services/geminiService';
import { Sparkles, Loader2, BookOpen, Gift, Moon, Edit3, Send, WifiOff, Key, Download, Check, X, ShieldCheck } from 'lucide-react';
import { StoryData, ChildProfile } from '../types';

const StoryTime: React.FC = () => {
  const [topic, setTopic] = useState("Aventura Espacial");
  const [customTopic, setCustomTopic] = useState("");
  const [showCustomInput, setShowCustomInput] = useState(false);
  const [profile, setProfile] = useState<ChildProfile | null>(null);
  
  // State for Mode Selection
  const [useAI, setUseAI] = useState(false); // Default to Local (False)

  const [loading, setLoading] = useState(false);
  const [loadingPhase, setLoadingPhase] = useState("");
  const [story, setStory] = useState<StoryData | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [imageRevealed, setImageRevealed] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [downloaded, setDownloaded] = useState(false);
  const [showPremiumGate, setShowPremiumGate] = useState(false);
  
  // Check for AI Studio environment
  const hasAIStudio = typeof window !== 'undefined' && (window as any).aistudio;

  useEffect(() => {
    const stored = localStorage.getItem('child_profile');
    if (stored) {
      setProfile(JSON.parse(stored));
    }

    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    // Check if user has already made a decision about AI
    const aiDecision = localStorage.getItem('ai_enabled_decision');
    if (aiDecision === 'true' && hasAIStudio) {
         setUseAI(true);
    } else {
         // If no decision yet, trigger the prompt on first load
         if (aiDecision === null) {
            setShowPremiumGate(true);
         }
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const handleModeSwitch = async (wantAI: boolean) => {
    if (wantAI) {
        if (hasAIStudio) {
            const hasKey = await (window as any).aistudio.hasSelectedApiKey();
            if (!hasKey) {
                setShowPremiumGate(true);
                return;
            }
        } else {
           // Fallback for dev environment without AI Studio
           // Typically wouldn't happen in the target environment
        }
    }
    setUseAI(wantAI);
    setStory(null);
    setImageUrl(null);
    setImageRevealed(false);
    setDownloaded(false);
  };
  
  const activateAI = async () => {
      if (hasAIStudio) {
          await (window as any).aistudio.openSelectKey();
          // Assume success for UX flow
          localStorage.setItem('ai_enabled_decision', 'true');
          setUseAI(true);
          setShowPremiumGate(false);
      }
  };

  const declineAI = () => {
      localStorage.setItem('ai_enabled_decision', 'false');
      setUseAI(false);
      setShowPremiumGate(false);
  };

  const predefinedTopics = [
    "Polícia e Ladrão", "Futebol de Robôs", "Bombeiro Herói", 
    "Numberblocks na Praia", "Castelo de LEGO", "Dinossauro Amigo",
    "Viagem à Lua", "Fundo do Mar", "Escola de Super-Heróis", "Piquenique na Floresta"
  ];

  const handleCreateStory = async (selectedTopic: string) => {
    if (!profile) return;
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
        
        const localStory = getInstantStory(selectedTopic, profile);
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
        const storyData = await generateStoryText(selectedTopic, profile);
        setStory(storyData);

        setLoadingPhase("Pintando o desenho...");
        const img = await generateStoryImage(storyData.content, profile);
        setImageUrl(img);
      }

    } catch (e) {
      alert("Ops! Tente novamente.");
      console.error(e);
      setUseAI(false); // Fallback logic
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadImage = () => {
    if (!imageUrl) return;
    
    const link = document.createElement('a');
    link.href = imageUrl;
    link.download = `Historia-${profile?.name}-${Date.now()}.png`;
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
                  <BookOpen size={18} /> Livro (Genérico)
               </button>
               <button 
                 onClick={() => handleModeSwitch(true)}
                 className={`flex-1 py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all relative z-10 ${useAI ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-900/50' : 'text-slate-400 hover:text-slate-200'}`}
               >
                  <Sparkles size={18} /> Mágica IA
               </button>
            </div>

            <h2 className="text-2xl font-black text-white text-center">
              {useAI ? `O que ${profile?.name} quer imaginar?` : "Qual história vamos ler?"}
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

      {/* --- PREMIUM GATE / CONNECT GOOGLE --- */}
      {showPremiumGate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-4 animate-fade-in">
           <div className="bg-gradient-to-br from-indigo-900 to-slate-900 border border-indigo-500/50 p-6 rounded-[2.5rem] max-w-md w-full relative shadow-2xl text-center">
              
              <div className="w-20 h-20 bg-indigo-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg shadow-indigo-500/40">
                <Sparkles size={40} className="text-white fill-white animate-spin-slow" />
              </div>

              <h2 className="text-2xl font-black text-white mb-2">
                 Ativar Inteligência Artificial?
              </h2>
              
              <div className="space-y-4 text-slate-300 text-sm leading-relaxed mb-8">
                 <p className="font-medium text-white text-base">
                    Olá Papai/Mamãe! 👋
                 </p>
                 <p>
                    Para criar histórias <strong>únicas</strong> e imagens personalizadas para <strong>{profile?.name}</strong>, precisamos conectar sua conta Google (Gemini).
                 </p>
                 <ul className="text-left bg-slate-800/50 p-4 rounded-2xl space-y-2 border border-slate-700">
                    <li className="flex items-center gap-2"><Check size={16} className="text-green-400"/> Histórias infinitas e criativas</li>
                    <li className="flex items-center gap-2"><Check size={16} className="text-green-400"/> Imagens personalizadas do {profile?.name}</li>
                    <li className="flex items-center gap-2"><ShieldCheck size={16} className="text-green-400"/> Sem custos adicionais (Free Tier)</li>
                 </ul>
              </div>

              <div className="space-y-3">
                  <button onClick={activateAI} className="w-full py-4 bg-white text-indigo-900 font-black text-lg rounded-xl transition-all shadow-lg active:scale-95 flex items-center justify-center gap-2">
                     <Key size={20} /> CONECTAR GOOGLE
                  </button>
                  
                  <button onClick={declineAI} className="w-full py-3 text-slate-400 font-bold text-sm hover:text-white transition-colors">
                     Não, usar histórias genéricas
                  </button>
              </div>
           </div>
        </div>
      )}

    </div>
  );
};

export default StoryTime;