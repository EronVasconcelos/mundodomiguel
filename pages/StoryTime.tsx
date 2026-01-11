
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { generateStoryText, generateStoryImage, STATIC_STORIES, isAIAvailable } from '../services/geminiService';
import { Sparkles, Loader2, BookOpen, Moon, WifiOff, Download, Gift, Pencil, Wand2, Book, ArrowLeft } from 'lucide-react';
import { StoryData, ChildProfile } from '../types';

const StoryTime: React.FC = () => {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<ChildProfile | null>(null);
  
  const [activeTab, setActiveTab] = useState<'kids' | 'ai'>('kids');
  const [customTopic, setCustomTopic] = useState('');

  const [loading, setLoading] = useState(false); 
  const [imageLoading, setImageLoading] = useState(false);
  
  const [story, setStory] = useState<StoryData | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [aiEnabled, setAiEnabled] = useState(false);
  const [showImageReveal, setShowImageReveal] = useState(false); 
  
  const IMAGINATION_TOPICS = [
    "Patrulha Canina",
    "Mickey e Minnie",
    "Princesas Disney",
    "Homem Aranha",
    "Frozen - Uma Aventura",
    "Bob Esponja",
    "Peppa Pig",
    "Toy Story",
    "Dinossauros",
    "Minecraft",
    "Unicórnios",
    "Animais da Floresta",
    "Fundo do Mar",
    "Viagem ao Espaço"
  ];

  useEffect(() => {
    const stored = localStorage.getItem('child_profile');
    if (stored) setProfile(JSON.parse(stored));
    
    // Verifica se a IA está disponível na inicialização
    const isAvailable = isAIAvailable();
    setAiEnabled(isAvailable);
  }, []);

  const handleTabSwitch = (tab: 'kids' | 'ai') => {
    setActiveTab(tab);
    resetStoryState();
  };

  const resetStoryState = () => {
    setStory(null);
    setImageUrl(null);
    setShowImageReveal(false);
    setImageLoading(false);
  };

  // Handler for STATIC stories (Livro Kids)
  const handleSelectStaticStory = (selectedStory: StoryData) => {
    resetStoryState();
    setStory(selectedStory);
  };
  
  // Handler for AI stories
  const handleCreateAIStory = async (topic: string) => {
    if (!profile || !aiEnabled) return;
    if (!topic.trim()) return;

    setLoading(true);
    resetStoryState();
    
    try {
      const storyData = await generateStoryText(topic, profile);
      setStory(storyData);
      setLoading(false);

      setImageLoading(true);
      const img = await generateStoryImage(storyData.content, profile);
      // Se img for null (offline/erro), a UI lidará
      setImageUrl(img);
      setImageLoading(false);
    } catch (e) {
      console.error(e);
      alert("Ops! Não consegui criar a história agora.");
      setLoading(false);
      setImageLoading(false);
    }
  };

  const handleDownloadImage = () => {
    if (!imageUrl) return;
    const link = document.createElement('a');
    link.href = imageUrl;
    link.download = `historia-magica-${new Date().getTime()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleBack = () => {
    if (story) {
      resetStoryState();
    } else {
      navigate(-1);
    }
  };

  return (
    <div className="h-full flex flex-col font-sans relative bg-[#0f172a] text-white">
       <div className="px-4 pt-6 pb-2">
         <header className="bg-slate-800/50 backdrop-blur-md rounded-3xl px-4 py-3 flex items-center justify-between border border-slate-700">
            <button onClick={handleBack} className="w-10 h-10 bg-slate-700 rounded-full flex items-center justify-center text-slate-300 active:scale-95 transition-transform">
               <ArrowLeft size={24} strokeWidth={3} />
            </button>
            <h1 className="text-xl font-black uppercase text-yellow-400">Hora da História</h1>
            <div className="w-10 flex items-center justify-center">
              {aiEnabled ? <Moon className="text-yellow-200 fill-yellow-200" /> : <WifiOff className="text-slate-500" size={20} />}
            </div>
         </header>
       </div>

      <div className="flex-1 overflow-y-auto p-4 pb-20 scroll-smooth">
        {!story && !loading && (
          <div className="space-y-6">
            {/* TABS - Só mostra opção de troca se IA estiver disponível */}
            {aiEnabled ? (
                <div className="flex bg-slate-800 p-1 rounded-2xl border border-slate-700">
                <button onClick={() => handleTabSwitch('kids')} className={`flex-1 py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 ${activeTab === 'kids' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-white'}`}>
                    <Book size={18} /> Livro Kids
                </button>
                <button onClick={() => handleTabSwitch('ai')} className={`flex-1 py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 ${activeTab === 'ai' ? 'bg-fuchsia-600 text-white shadow-md' : 'text-slate-400 hover:text-white'}`}>
                    <Wand2 size={18} /> IA Mágica
                </button>
                </div>
            ) : (
                <div className="bg-slate-800/50 p-4 rounded-2xl border border-slate-700 text-center mb-4">
                    <p className="text-slate-400 text-sm font-bold flex items-center justify-center gap-2">
                        <WifiOff size={16}/> Modo Offline: Apenas histórias do Livro
                    </p>
                </div>
            )}

            {/* TAB CONTENT: LIVRO KIDS (Lista Estática) */}
            {(activeTab === 'kids' || !aiEnabled) && (
               <div className="animate-slide-up space-y-4">
                  <div className="text-center mb-6">
                     <h2 className="text-2xl font-black text-indigo-300">Biblioteca Encantada</h2>
                     <p className="text-slate-400 text-sm">Histórias clássicas para ler agora!</p>
                  </div>
                  
                  <div className="grid gap-3">
                     {STATIC_STORIES.map((s, idx) => (
                        <button 
                           key={idx} 
                           onClick={() => handleSelectStaticStory(s)}
                           className="w-full bg-slate-800 hover:bg-slate-700 border-l-4 border-indigo-500 p-5 rounded-r-2xl text-left active:scale-95 transition-all flex items-center justify-between group"
                        >
                           <div>
                              <span className="block font-black text-lg text-slate-200 group-hover:text-yellow-400 transition-colors">{s.title}</span>
                              <span className="text-xs text-slate-500 font-bold uppercase tracking-wider">Ler História</span>
                           </div>
                           <BookOpen size={20} className="text-indigo-500 opacity-50 group-hover:opacity-100" />
                        </button>
                     ))}
                  </div>
               </div>
            )}

            {/* TAB CONTENT: IA MÁGICA (Gerador) - Só renderiza se AI enabled */}
            {activeTab === 'ai' && aiEnabled && (
               <div className="animate-slide-up space-y-6">
                  <div className="bg-slate-800/50 p-6 rounded-[2rem] border border-slate-700">
                     <h2 className="text-xl font-black text-center mb-4 text-fuchsia-300">O que vamos imaginar?</h2>
                     
                     {/* INPUT CUSTOMIZADO */}
                     <div className="space-y-3 mb-8">
                        <label className="text-xs font-bold text-slate-400 uppercase ml-2">Criar História</label>
                        <div className="flex gap-2">
                           <input 
                              type="text" 
                              value={customTopic}
                              onChange={(e) => setCustomTopic(e.target.value)}
                              placeholder="Ex: Um gato astronauta..."
                              className="flex-1 bg-slate-900 border border-slate-600 rounded-2xl px-4 py-3 text-white placeholder-slate-500 outline-none focus:border-fuchsia-500 transition-colors"
                           />
                           <button 
                              onClick={() => handleCreateAIStory(customTopic)}
                              disabled={!customTopic.trim()}
                              className="bg-fuchsia-600 disabled:bg-slate-700 text-white p-3 rounded-2xl shadow-lg active:scale-95 transition-transform"
                           >
                              <Pencil />
                           </button>
                        </div>
                     </div>

                     {/* SUGESTÕES */}
                     <div>
                        <h3 className="text-xs font-bold text-slate-400 uppercase mb-3 ml-2">Sugestões de Personagens</h3>
                        <div className="grid grid-cols-2 gap-3">
                           {IMAGINATION_TOPICS.map(t => (
                              <button 
                                 key={t} 
                                 onClick={() => handleCreateAIStory(t)} 
                                 className="px-3 py-3 rounded-xl bg-slate-700 hover:bg-slate-600 active:scale-95 transition-all text-slate-200 font-bold text-sm text-left border-b-4 border-slate-900 active:border-b-0 active:translate-y-1"
                              >
                                 {t}
                              </button>
                           ))}
                        </div>
                     </div>
                  </div>
               </div>
            )}
          </div>
        )}

        {/* LOADING STATE */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-20 animate-fade-in">
            <Loader2 className="w-16 h-16 animate-spin text-fuchsia-400 mb-4" />
            <p className="text-2xl font-bold animate-pulse text-yellow-200 text-center">
               A mágica está<br/>acontecendo...
            </p>
          </div>
        )}

        {/* STORY DISPLAY */}
        {story && (
          <div className="space-y-6 animate-slide-up pb-8">
            <h2 className="text-3xl font-black text-yellow-400 text-center leading-tight mt-2">{story.title}</h2>
            
            <div className="bg-slate-800 p-6 rounded-[2rem] border border-slate-700 text-slate-300 leading-relaxed text-lg shadow-lg">
              {story.content.split('\n').map((p, i) => <p key={i} className="mb-4 last:mb-0 indent-4">{p}</p>)}
            </div>

            <div className="p-4 bg-indigo-900/30 rounded-2xl text-yellow-100 font-bold italic text-center border border-indigo-500/30">
                ✨ Moral: {story.moral}
            </div>
            
            {/* AREA DA IMAGEM (Apenas se for Modo IA e a imagem foi gerada com sucesso) */}
            {activeTab === 'ai' && aiEnabled && (
                <div className="mt-8">
                    {!showImageReveal ? (
                        <button 
                            onClick={() => setShowImageReveal(true)}
                            className="w-full py-8 bg-gradient-to-r from-purple-600 to-pink-600 rounded-[2rem] shadow-[0_0_30px_rgba(219,39,119,0.3)] animate-pulse flex flex-col items-center justify-center gap-3 border-4 border-white/20 active:scale-95 transition-transform"
                        >
                            <Gift size={48} className="text-white mb-1" />
                            <span className="text-2xl font-black text-white uppercase tracking-widest">Abrir Presente Mágico</span>
                            <span className="text-sm font-bold text-pink-200">Toque para ver o desenho!</span>
                        </button>
                    ) : (
                        <div className="animate-pop space-y-4">
                            <div className="aspect-square w-full bg-slate-900 rounded-[2.5rem] overflow-hidden border-4 border-indigo-500 shadow-2xl relative group">
                                {imageUrl ? (
                                    <>
                                        <img src={imageUrl} alt="Story Illustration" className="w-full h-full object-cover" />
                                        <button 
                                            onClick={handleDownloadImage}
                                            className="absolute top-4 right-4 w-12 h-12 bg-black/50 backdrop-blur-md rounded-full flex items-center justify-center text-white border border-white/30 active:scale-95 hover:bg-black/70 transition-all shadow-lg"
                                            title="Baixar Imagem"
                                        >
                                            <Download size={24} />
                                        </button>
                                    </>
                                ) : (
                                    <div className="w-full h-full flex flex-col items-center justify-center bg-slate-800 gap-4 text-slate-400">
                                        {imageLoading ? (
                                            <>
                                                <Loader2 className="w-12 h-12 animate-spin text-fuchsia-400" />
                                                <p className="font-bold text-center px-6">Pintando o desenho...<br/>Quase pronto!</p>
                                            </>
                                        ) : (
                                            <p className="font-bold text-center px-6 text-sm">Imagem não disponível offline.</p>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            )}

            <button onClick={resetStoryState} className="w-full bg-slate-700 text-slate-300 py-4 rounded-2xl font-bold hover:bg-slate-600 transition-colors mt-6">
                Ler Outra História
            </button>

          </div>
        )}
      </div>
    </div>
  );
};

export default StoryTime;
