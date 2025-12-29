import React, { useState, useEffect, useRef } from 'react';
import { generateDevotionalContent, generateStoryImage, generateDevotionalAudio } from '../services/geminiService';
import { DevotionalData, ChildProfile } from '../types';
import { Layout } from '../components/Layout';
import { Cloud, Sun, Volume2, Star, BookOpen, Loader2, Sparkles, Heart, StopCircle, Key, Check, ShieldCheck, Zap } from 'lucide-react';
import { completeFaith } from '../services/progressService';

const FaithCorner: React.FC = () => {
  const [data, setData] = useState<DevotionalData | null>(null);
  const [loading, setLoading] = useState(true);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [imageLoading, setImageLoading] = useState(false);
  const [profile, setProfile] = useState<ChildProfile | null>(null);
  
  const [showPremiumGate, setShowPremiumGate] = useState(false);
  const [aiActiveGlobal, setAiActiveGlobal] = useState(false);
  const hasAIStudio = typeof window !== 'undefined' && (window as any).aistudio;

  // Audio State
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isGeneratingAudio, setIsGeneratingAudio] = useState(false);
  const audioContextRef = useRef<AudioContext | null>(null);
  const audioSourceRef = useRef<AudioBufferSourceNode | null>(null);

  useEffect(() => {
    // 1. Load Profile
    const storedProfile = localStorage.getItem('child_profile');
    if (storedProfile) setProfile(JSON.parse(storedProfile));

    // 2. Check Global AI Status
    const globalStatus = localStorage.getItem('ai_active_global') === 'true';
    setAiActiveGlobal(globalStatus);

    if (!globalStatus) {
        // Only ask if not globally active and no decision made
        const decision = localStorage.getItem('ai_enabled_decision');
        if (decision === null) {
            setShowPremiumGate(true);
            setLoading(false);
        } else if (decision === 'true' && hasAIStudio) {
            // Should be active but flag missing? Try loading anyway
            // In a real app we might re-verify token here
        }
    }
    
    // Mark progress as completed just by visiting/reading
    completeFaith();
  }, []);

  useEffect(() => {
    if (profile) {
        // If gate is showing, wait. Otherwise load.
        if (!showPremiumGate) {
            loadContent(profile);
        }
    }
    return () => stopAudio();
  }, [profile, showPremiumGate]);

  const loadContent = async (currentProfile: ChildProfile) => {
    setLoading(true);
    // Passing profile handles both AI and Offline generation internally in service
    const content = await generateDevotionalContent(currentProfile);
    setData(content);
    setLoading(false);

    const savedImgKey = `faith_img_${content.date}_${currentProfile.name}`;
    const savedImg = localStorage.getItem(savedImgKey);
    
    if (savedImg) {
        setImageUrl(savedImg);
    } else if (content.imagePrompt) {
        // Only generate image if we have a prompt (implies AI was used or we have a prompt strategy)
        // If offline mode returned no prompt, we get offline image.
        if (aiActiveGlobal || localStorage.getItem('ai_enabled_decision') === 'true') {
            setImageLoading(true);
            const img = await generateStoryImage(content.imagePrompt, currentProfile);
            setImageUrl(img);
            localStorage.setItem(savedImgKey, img);
            setImageLoading(false);
        }
    }
  };

  const activateAI = async () => {
      try {
          if (hasAIStudio) {
              await (window as any).aistudio.openSelectKey();
          }
          localStorage.setItem('ai_active_global', 'true');
          localStorage.setItem('ai_enabled_decision', 'true');
          setAiActiveGlobal(true);
          setShowPremiumGate(false);
      } catch (e) {
          console.error("Auth failed", e);
      }
  };

  const declineAI = () => {
      localStorage.setItem('ai_enabled_decision', 'false');
      setShowPremiumGate(false);
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

  function decodeBase64(base64: string) {
    const binaryString = atob(base64);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
        bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes;
  }

  async function decodeAudioData(data: Uint8Array, ctx: AudioContext, sampleRate: number, numChannels: number): Promise<AudioBuffer> {
    const dataInt16 = new Int16Array(data.buffer);
    const frameCount = dataInt16.length / numChannels;
    const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);
    for (let channel = 0; channel < numChannels; channel++) {
        const channelData = buffer.getChannelData(channel);
        for (let i = 0; i < frameCount; i++) {
           channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
        }
    }
    return buffer;
  }

  const speakDevotional = async () => {
    if (!data) return;
    if (isSpeaking) {
        stopAudio();
        return;
    }
    const textToRead = `Devocional de hoje. Versículo: ${data.verse}. ${data.devotional}. Agora, uma história: ${data.storyTitle}. ${data.storyContent}. Vamos orar? ${data.prayer}`;

    if (aiActiveGlobal) {
        setIsGeneratingAudio(true);
        try {
            const base64Audio = await generateDevotionalAudio(textToRead);
            if (base64Audio) {
                const ctx = new (window.AudioContext || (window as any).webkitAudioContext)({sampleRate: 24000});
                audioContextRef.current = ctx;
                const rawBytes = decodeBase64(base64Audio);
                const audioBuffer = await decodeAudioData(rawBytes, ctx, 24000, 1);
                const source = ctx.createBufferSource();
                source.buffer = audioBuffer;
                source.connect(ctx.destination);
                source.onended = () => { setIsSpeaking(false); setIsGeneratingAudio(false); };
                audioSourceRef.current = source;
                source.start();
                setIsSpeaking(true);
                setIsGeneratingAudio(false);
                return;
            }
        } catch (e) {
            console.warn("Gemini TTS failed", e);
        }
    }

    // Fallback
    const utterance = new SpeechSynthesisUtterance(textToRead);
    utterance.lang = 'pt-BR';
    utterance.rate = 0.9; 
    utterance.pitch = 1.1; 
    utterance.onend = () => { setIsSpeaking(false); setIsGeneratingAudio(false); };
    setIsSpeaking(true);
    setIsGeneratingAudio(false);
    window.speechSynthesis.speak(utterance);
  };

  return (
    <div className="h-full flex flex-col font-sans bg-sky-50 text-slate-800 relative">
        <Layout title="Cantinho da Fé" color="text-sky-600">
            {loading ? (
                <div className="flex flex-col items-center justify-center h-full gap-4">
                    <Loader2 className="animate-spin text-sky-400 w-12 h-12" />
                    <p className="text-sky-400 font-bold animate-pulse">Buscando a palavra de hoje...</p>
                </div>
            ) : data ? (
                <div className="space-y-6 pb-12">
                    {/* Header Card */}
                    <div className="bg-gradient-to-br from-sky-400 to-blue-500 rounded-[2.5rem] p-6 text-white shadow-lg relative overflow-hidden">
                        <Cloud className="absolute -top-4 -right-4 w-32 h-32 text-white/20" />
                        <Sun className="absolute top-4 left-4 w-12 h-12 text-yellow-300 animate-spin-slow" />
                        <div className="relative z-10 text-center mt-6">
                            <h2 className="text-sm font-bold opacity-90 uppercase tracking-widest mb-2 flex items-center justify-center gap-2">
                                Palavra do Dia
                                {aiActiveGlobal && <Check size={14} className="text-green-300 bg-white/20 rounded-full p-0.5"/>}
                            </h2>
                            <p className="text-2xl font-black italic mb-2">"{data.verse}"</p>
                            <p className="font-bold opacity-80">{data.reference}</p>
                        </div>
                    </div>

                    <button 
                        onClick={speakDevotional}
                        disabled={isGeneratingAudio}
                        className={`w-full py-4 rounded-2xl font-black text-lg flex items-center justify-center gap-3 transition-all active:scale-95 shadow-md ${isSpeaking ? 'bg-amber-400 text-amber-900 border-b-4 border-amber-600' : 'bg-white text-slate-600 border-b-4 border-slate-200'} ${isGeneratingAudio ? 'opacity-70 cursor-wait' : ''}`}
                    >
                        {isGeneratingAudio ? <Loader2 className="animate-spin" /> : isSpeaking ? <StopCircle className="animate-pulse fill-amber-900/20" /> : <Volume2 />}
                        {isGeneratingAudio ? "Preparando Voz..." : isSpeaking ? "Parar Áudio" : "Ouvir Devocional"}
                    </button>

                    {/* Explanation */}
                    <div className="bg-white rounded-[2rem] p-6 border border-slate-100 shadow-sm relative">
                        <div className="absolute -top-3 left-6 bg-sky-100 text-sky-600 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider">Para {profile?.name}</div>
                        <p className="text-lg leading-relaxed text-slate-600 font-medium">{data.devotional}</p>
                    </div>

                    {/* Story */}
                    <div className="bg-white rounded-[2rem] p-6 border-l-8 border-sky-300 shadow-sm">
                        <div className="flex items-center gap-2 mb-4">
                            <BookOpen className="text-sky-500" size={24} />
                            <h3 className="font-black text-xl text-slate-700">{data.storyTitle}</h3>
                        </div>
                        <div className="prose prose-slate text-slate-600 leading-relaxed">
                            {data.storyContent.split('\n').map((p, i) => <p key={i} className="mb-2">{p}</p>)}
                        </div>
                    </div>

                    {/* Image */}
                    <div className="relative aspect-square w-full bg-slate-200 rounded-[2.5rem] overflow-hidden shadow-inner border-4 border-white">
                        {imageLoading ? (
                            <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-400 gap-2">
                                <Sparkles className="animate-spin text-yellow-400 w-8 h-8" />
                                <span className="text-xs font-bold">Pintando a história...</span>
                            </div>
                        ) : imageUrl ? (
                            <img src={imageUrl} alt="História" className="w-full h-full object-cover animate-fade-in" />
                        ) : (
                            <div className="absolute inset-0 flex items-center justify-center text-slate-300">
                                <Cloud size={48} />
                            </div>
                        )}
                    </div>

                    {/* Prayer */}
                    <div className="bg-yellow-50 rounded-[2rem] p-6 border-2 border-yellow-100 text-center relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-1 bg-yellow-300" />
                        <h4 className="font-black text-yellow-600 uppercase tracking-widest mb-3 flex items-center justify-center gap-2"><Heart size={16} fill="#ca8a04" /> Hora de Orar</h4>
                        <p className="text-xl font-bold text-slate-700 italic">"{data.prayer}"</p>
                    </div>
                </div>
            ) : (
                <div className="text-center p-8 text-slate-400"><p>Carregando...</p></div>
            )}
        </Layout>

        {/* --- PREMIUM GATE MODAL --- */}
      {showPremiumGate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fade-in">
           <div className="bg-white p-6 rounded-[2.5rem] max-w-md w-full relative shadow-2xl text-center">
              <div className="w-20 h-20 bg-sky-100 rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm">
                <Sparkles size={40} className="text-sky-500 fill-sky-200 animate-spin-slow" />
              </div>
              <h2 className="text-2xl font-black text-slate-800 mb-2">Devocionais Personalizados?</h2>
              <div className="space-y-4 text-slate-500 text-sm leading-relaxed mb-8">
                 <p className="font-medium text-slate-700 text-base">Olá! 👋</p>
                 <p>Conecte sua conta Google para gerar devocionais únicos para <strong>{profile?.name}</strong>. É seguro e grátis.</p>
                 <div className="flex items-center justify-center gap-2 text-xs font-bold bg-green-50 text-green-700 p-2 rounded-lg">
                    <Zap size={14}/> Ativa para TODOS os perfis
                 </div>
              </div>
              <div className="space-y-3">
                  <button onClick={activateAI} className="w-full py-4 bg-sky-500 text-white font-black text-lg rounded-xl transition-all shadow-lg shadow-sky-200 active:scale-95 flex items-center justify-center gap-2">
                     <Key size={20} /> CONECTAR GOOGLE
                  </button>
                  <button onClick={declineAI} className="w-full py-3 text-slate-400 font-bold text-sm hover:text-slate-600 transition-colors">Não, usar devocional genérico</button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default FaithCorner;