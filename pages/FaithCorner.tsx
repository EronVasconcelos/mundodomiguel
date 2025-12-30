
import React, { useState, useEffect, useRef } from 'react';
import { generateDevotionalContent, generateStoryImage, generateDevotionalAudio } from '../services/geminiService';
import { DevotionalData, ChildProfile } from '../types';
import { Layout } from '../components/Layout';
import { Cloud, Sun, Volume2, BookOpen, Loader2, Sparkles, StopCircle, Key, Check, Trophy } from 'lucide-react';
import { completeFaith, getDailyProgress } from '../services/progressService';

const FaithCorner: React.FC = () => {
  const [data, setData] = useState<DevotionalData | null>(null);
  const [loading, setLoading] = useState(true);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [imageLoading, setImageLoading] = useState(false);
  const [profile, setProfile] = useState<ChildProfile | null>(null);
  const [showMissionComplete, setShowMissionComplete] = useState(false);
  
  const [showPremiumGate, setShowPremiumGate] = useState(false);
  const [aiActiveGlobal, setAiActiveGlobal] = useState(false);
  const [missionStats, setMissionStats] = useState({ current: 0, target: true });
  const [isConnecting, setIsConnecting] = useState(false);

  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isGeneratingAudio, setIsGeneratingAudio] = useState(false);
  const audioContextRef = useRef<AudioContext | null>(null);
  const audioSourceRef = useRef<AudioBufferSourceNode | null>(null);
  
  // Ref para detectar fim da rolagem
  const endOfContentRef = useRef<HTMLDivElement>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    const storedProfile = localStorage.getItem('child_profile');
    if (storedProfile) setProfile(JSON.parse(storedProfile));

    const globalStatus = localStorage.getItem('ai_active_global') === 'true';
    setAiActiveGlobal(globalStatus);
    
    // Check mission status (visual only initially)
    const p = getDailyProgress();
    setMissionStats({ current: p.faithDone ? 1 : 0, target: true });

    const handleAuthReset = () => {
        setAiActiveGlobal(false);
    };
    window.addEventListener('ai_auth_reset', handleAuthReset);
    return () => {
        window.removeEventListener('ai_auth_reset', handleAuthReset);
        if (observerRef.current) observerRef.current.disconnect();
    };
  }, []);

  // Intersection Observer para completar missão ao rolar
  useEffect(() => {
    if (!data || missionStats.current === 1) return;

    if (observerRef.current) observerRef.current.disconnect();

    observerRef.current = new IntersectionObserver((entries) => {
        const [entry] = entries;
        if (entry.isIntersecting) {
            triggerCompletion();
            observerRef.current?.disconnect();
        }
    }, { threshold: 0.5 });

    if (endOfContentRef.current) {
        observerRef.current.observe(endOfContentRef.current);
    }
  }, [data, missionStats.current]);

  const triggerCompletion = () => {
      const p = getDailyProgress();
      if (!p.faithDone) {
          const reached = completeFaith();
          setMissionStats({ current: 1, target: true });
          if (reached) {
             setShowMissionComplete(true);
          }
      }
  };

  useEffect(() => {
    if (profile) {
        loadContent(profile);
    }
  }, [profile]);

  const loadContent = async (currentProfile: ChildProfile) => {
    setLoading(true);
    try {
        const content = await generateDevotionalContent(currentProfile);
        setData(content);
        setLoading(false);

        // Se estiver offline, generateStoryImage retorna o fallback automaticamente
        // Se estiver online mas sem imagem salva, gera uma nova
        const aiEnabled = localStorage.getItem('ai_active_global') === 'true';
        
        if (!aiEnabled) {
            // Modo Offline: Pega imagem de fallback direto
            const fallbackImg = await generateStoryImage("pastor", currentProfile);
            setImageUrl(fallbackImg);
        } else if (content.imagePrompt) {
            const savedImgKey = `faith_img_${content.date}_${currentProfile.name}`;
            const savedImg = localStorage.getItem(savedImgKey);
            
            if (savedImg) {
                setImageUrl(savedImg);
            } else {
                setImageLoading(true);
                const img = await generateStoryImage(content.imagePrompt, currentProfile);
                if (img) {
                    setImageUrl(img);
                    localStorage.setItem(savedImgKey, img);
                }
                setImageLoading(false);
            }
        }
    } catch (e) {
        console.error("Erro ao carregar conteúdo", e);
        setLoading(false);
    }
  };

  const activateAI = () => {
      setIsConnecting(true);
      const aiStudio = (window as any).aistudio;
      if (aiStudio && typeof aiStudio.openSelectKey === 'function') {
          aiStudio.openSelectKey();
      }
      
      localStorage.setItem('ai_active_global', 'true');
      setAiActiveGlobal(true);
      
      setTimeout(() => {
         setShowPremiumGate(false); 
         setIsConnecting(false);
         if (profile) loadContent(profile); 
      }, 1000);
  };

  const stopAudio = () => {
    if (audioSourceRef.current) {
        try { audioSourceRef.current.stop(); } catch(e) {}
        audioSourceRef.current = null;
    }
    if (audioContextRef.current) {
        audioContextRef.current.close();
        audioContextRef.current = null;
    }
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
  };

  const speakDevotional = async () => {
    if (!data) return;
    
    // Completa a missão ao clicar em ouvir
    triggerCompletion();

    if (isSpeaking) {
        stopAudio();
        return;
    }
    const textToRead = `Devocional de hoje. Versículo: ${data.verse}. ${data.devotional}. Agora, uma história: ${data.storyTitle}. ${data.storyContent}. Vamos orar? ${data.prayer}`;

    // 1. Tentar Gemini Audio (Voz Fenrir - Masculina)
    if (aiActiveGlobal) {
        setIsGeneratingAudio(true);
        try {
            const base64Audio = await generateDevotionalAudio(textToRead);
            if (base64Audio) {
                const ctx = new (window.AudioContext || (window as any).webkitAudioContext)({sampleRate: 24000});
                audioContextRef.current = ctx;
                const binaryString = atob(base64Audio);
                const bytes = new Uint8Array(binaryString.length);
                for (let i = 0; i < binaryString.length; i++) bytes[i] = binaryString.charCodeAt(i);
                
                const dataInt16 = new Int16Array(bytes.buffer);
                const buffer = ctx.createBuffer(1, dataInt16.length, 24000);
                const channelData = buffer.getChannelData(0);
                for (let i = 0; i < dataInt16.length; i++) channelData[i] = dataInt16[i] / 32768.0;

                const source = ctx.createBufferSource();
                source.buffer = buffer;
                source.connect(ctx.destination);
                source.onended = () => { setIsSpeaking(false); setIsGeneratingAudio(false); };
                audioSourceRef.current = source;
                source.start();
                setIsSpeaking(true);
                setIsGeneratingAudio(false);
                return;
            }
        } catch (e) { console.warn(e); }
    }

    // 2. Fallback Web Speech API - Tentar forçar voz masculina
    const utterance = new SpeechSynthesisUtterance(textToRead);
    utterance.lang = 'pt-BR';
    
    // Buscar voz masculina disponível
    const voices = window.speechSynthesis.getVoices();
    const maleVoice = voices.find(v => 
        (v.lang.includes('pt') || v.lang.includes('PT')) && 
        (v.name.toLowerCase().includes('daniel') || v.name.toLowerCase().includes('male') || v.name.includes('Felipe'))
    );
    
    if (maleVoice) {
        utterance.voice = maleVoice;
        // Ajustes para soar mais natural
        utterance.pitch = 0.9; 
        utterance.rate = 1.1; 
    } else {
        // Se cair na padrão (Google Português - geralmente feminina), baixa o pitch
        utterance.pitch = 0.8; 
    }

    utterance.onend = () => { setIsSpeaking(false); setIsGeneratingAudio(false); };
    setIsSpeaking(true);
    setIsGeneratingAudio(false);
    window.speechSynthesis.speak(utterance);
  };

  return (
    <div className="h-full flex flex-col font-sans bg-sky-50 text-slate-800 relative">
        <Layout title="Cantinho da Fé" color="text-sky-600" missionTarget={missionStats}>
            
            <div className="absolute top-2 right-14 z-20">
               <button 
                  onClick={() => setShowPremiumGate(true)}
                  className={`flex items-center gap-1 px-3 py-1 rounded-full text-[10px] font-bold shadow-sm active:scale-95 transition-all
                    ${aiActiveGlobal ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white' : 'bg-white text-slate-400 border border-slate-200'}
                  `}
               >
                  <Sparkles size={12} /> {aiActiveGlobal ? 'IA ATIVA' : 'ATIVAR IA'}
               </button>
            </div>

            {loading ? (
                <div className="flex flex-col items-center justify-center h-full gap-4">
                    <Loader2 className="animate-spin text-sky-400 w-12 h-12" />
                    <p className="text-sky-400 font-bold animate-pulse">Buscando a palavra de hoje...</p>
                </div>
            ) : data ? (
                <div className="space-y-6 pb-12">
                    <div className="bg-gradient-to-br from-sky-400 to-blue-500 rounded-[2.5rem] p-6 text-white shadow-lg relative overflow-hidden">
                        <Cloud className="absolute -top-4 -right-4 w-32 h-32 text-white/20" />
                        <Sun className="absolute top-4 left-4 w-12 h-12 text-yellow-300 animate-spin-slow" />
                        <div className="relative z-10 text-center mt-6">
                            <h2 className="text-sm font-bold opacity-90 uppercase tracking-widest mb-2 flex items-center justify-center gap-2">
                                Palavra do Dia
                            </h2>
                            <p className="text-2xl font-black italic mb-2">"{data.verse}"</p>
                            <p className="font-bold opacity-80">{data.reference}</p>
                        </div>
                    </div>

                    <button 
                        onClick={speakDevotional}
                        disabled={isGeneratingAudio}
                        className={`w-full py-4 rounded-2xl font-black text-lg flex items-center justify-center gap-3 transition-all active:scale-95 shadow-md ${isSpeaking ? 'bg-amber-400 text-amber-900 border-b-4 border-amber-600' : 'bg-white text-slate-600 border-b-4 border-slate-200'}`}
                    >
                        {isGeneratingAudio ? <Loader2 className="animate-spin" /> : isSpeaking ? <StopCircle className="animate-pulse" /> : <Volume2 />}
                        {isGeneratingAudio ? "Criando Áudio..." : isSpeaking ? "Parar Áudio" : "Ouvir Devocional"}
                    </button>

                    <div className="bg-white rounded-[2rem] p-6 border border-slate-100 shadow-sm relative">
                        <div className="absolute -top-3 left-6 bg-sky-100 text-sky-600 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider">Para {profile?.name}</div>
                        <p className="text-lg leading-relaxed text-slate-600 font-medium">{data.devotional}</p>
                    </div>

                    <div className="bg-white rounded-[2rem] p-6 border-l-8 border-sky-300 shadow-sm">
                        <div className="flex items-center gap-2 mb-4">
                            <BookOpen className="text-sky-500" size={24} />
                            <h3 className="font-black text-xl text-slate-700">{data.storyTitle}</h3>
                        </div>
                        <div className="prose prose-slate text-slate-600 leading-relaxed">
                            {data.storyContent.split('\n').map((p, i) => <p key={i} className="mb-2">{p}</p>)}
                        </div>
                    </div>

                    <div className="relative aspect-square w-full bg-slate-200 rounded-[2.5rem] overflow-hidden shadow-inner border-4 border-white">
                        {imageLoading ? (
                            <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-400 gap-2">
                                <Sparkles className="animate-spin text-yellow-400 w-8 h-8" />
                                <span className="text-xs font-bold">Pintando...</span>
                            </div>
                        ) : imageUrl ? (
                            <img src={imageUrl} alt="História" className="w-full h-full object-cover animate-fade-in" />
                        ) : (
                            <div className="absolute inset-0 flex items-center justify-center text-slate-300">
                                <Cloud size={48} />
                            </div>
                        )}
                    </div>
                    
                    {/* Elemento invisível para detectar fim da rolagem */}
                    <div ref={endOfContentRef} className="h-10 w-full" />
                </div>
            ) : null}
        </Layout>

        {showMissionComplete && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-6 animate-fade-in">
               <div className="bg-white w-full max-w-sm rounded-[2.5rem] p-8 flex flex-col items-center animate-pop relative overflow-hidden shadow-2xl border-4 border-yellow-300">
                  <Trophy className="w-12 h-12 text-yellow-500 animate-bounce mb-4" />
                  <h2 className="text-2xl font-black text-slate-800 text-center mb-2">DEVOCIONAL LIDO!</h2>
                  <button onClick={() => setShowMissionComplete(false)} className="w-full py-4 bg-yellow-400 text-yellow-900 rounded-2xl font-black text-xl">AMÉM!</button>
               </div>
            </div>
        )}

      {showPremiumGate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fade-in">
           <div className="bg-white p-8 rounded-[2.5rem] max-w-sm w-full relative shadow-2xl text-center">
              <Sparkles size={48} className="text-sky-500 mx-auto mb-6 animate-pulse" />
              <h2 className="text-2xl font-black text-slate-800 mb-2">Ativar IA Mágica?</h2>
              
              <p className="text-slate-500 font-medium mb-8 leading-relaxed">
                 Conecte sua conta para gerar imagens únicas e ouvir histórias com vozes reais.
              </p>

              <div className="space-y-3">
                  <button 
                    onClick={activateAI} 
                    disabled={isConnecting} 
                    className="w-full py-4 bg-sky-500 text-white font-black text-lg rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-sky-100 active:scale-95 disabled:opacity-50"
                  >
                     {isConnecting ? <Loader2 className="animate-spin" /> : <Key size={20} />}
                     CONECTAR
                  </button>
                  <button onClick={() => setShowPremiumGate(false)} disabled={isConnecting} className="w-full py-3 text-slate-400 font-bold text-sm">Cancelar</button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default FaithCorner;
