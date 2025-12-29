import React, { useState, useEffect, useRef } from 'react';
import { generateDevotionalContent, generateStoryImage, generateDevotionalAudio } from '../services/geminiService';
import { DevotionalData } from '../types';
import { Layout } from '../components/Layout';
import { Cloud, Sun, Volume2, Star, BookOpen, Loader2, Sparkles, Heart, StopCircle } from 'lucide-react';

const FaithCorner: React.FC = () => {
  const [data, setData] = useState<DevotionalData | null>(null);
  const [loading, setLoading] = useState(true);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [imageLoading, setImageLoading] = useState(false);
  
  // Audio State
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isGeneratingAudio, setIsGeneratingAudio] = useState(false);
  
  // Refs for Audio Playback
  const audioContextRef = useRef<AudioContext | null>(null);
  const audioSourceRef = useRef<AudioBufferSourceNode | null>(null);

  useEffect(() => {
    loadContent();
    return () => {
        stopAudio();
    }
  }, []);

  const loadContent = async () => {
    setLoading(true);
    const content = await generateDevotionalContent();
    setData(content);
    setLoading(false);

    // Try to load image from session if available, else generate
    const savedImgKey = `faith_img_${content.date}`;
    const savedImg = localStorage.getItem(savedImgKey);
    
    if (savedImg) {
        setImageUrl(savedImg);
    } else if (content.imagePrompt) {
        setImageLoading(true);
        const img = await generateStoryImage(content.imagePrompt);
        setImageUrl(img);
        localStorage.setItem(savedImgKey, img);
        setImageLoading(false);
    }
  };

  const stopAudio = () => {
    // 1. Stop Gemini Audio
    if (audioSourceRef.current) {
        try {
            audioSourceRef.current.stop();
        } catch(e) {}
        audioSourceRef.current = null;
    }
    if (audioContextRef.current) {
        audioContextRef.current.close();
        audioContextRef.current = null;
    }

    // 2. Stop Browser Native Audio
    window.speechSynthesis.cancel();
    
    setIsSpeaking(false);
  };

  // Helper function to decode base64
  function decodeBase64(base64: string) {
    const binaryString = atob(base64);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
        bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes;
  }

  // Helper function to decode PCM data
  async function decodeAudioData(
    data: Uint8Array,
    ctx: AudioContext,
    sampleRate: number,
    numChannels: number,
    ): Promise<AudioBuffer> {
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

    const textToRead = `
        Devocional de hoje. 
        Versículo: ${data.verse}.
        O que isso significa? ${data.devotional}.
        Agora, uma história: ${data.storyTitle}.
        ${data.storyContent}.
        Vamos orar? ${data.prayer}
    `;

    // Strategy: Try Gemini TTS first (High Quality), fallback to Browser TTS
    setIsGeneratingAudio(true);
    
    try {
        const base64Audio = await generateDevotionalAudio(textToRead);
        
        if (base64Audio) {
            // --- PLAY GEMINI AUDIO ---
            const ctx = new (window.AudioContext || (window as any).webkitAudioContext)({sampleRate: 24000});
            audioContextRef.current = ctx;
            
            const rawBytes = decodeBase64(base64Audio);
            const audioBuffer = await decodeAudioData(rawBytes, ctx, 24000, 1);
            
            const source = ctx.createBufferSource();
            source.buffer = audioBuffer;
            source.connect(ctx.destination);
            
            source.onended = () => {
                setIsSpeaking(false);
                setIsGeneratingAudio(false);
            };
            
            audioSourceRef.current = source;
            source.start();
            setIsSpeaking(true);
            setIsGeneratingAudio(false);
            
        } else {
            throw new Error("No audio data returned");
        }

    } catch (e) {
        console.warn("Gemini TTS failed, falling back to browser voice", e);
        // --- FALLBACK BROWSER AUDIO ---
        const utterance = new SpeechSynthesisUtterance(textToRead);
        utterance.lang = 'pt-BR';
        utterance.rate = 0.9; 
        utterance.pitch = 1.1; 
        
        utterance.onend = () => {
            setIsSpeaking(false);
            setIsGeneratingAudio(false);
        };
        
        setIsSpeaking(true);
        setIsGeneratingAudio(false);
        window.speechSynthesis.speak(utterance);
    }
  };

  return (
    <div className="h-full flex flex-col font-sans bg-sky-50 text-slate-800">
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
                            <h2 className="text-sm font-bold opacity-90 uppercase tracking-widest mb-2">Palavra do Dia</h2>
                            <p className="text-2xl font-black italic mb-2">"{data.verse}"</p>
                            <p className="font-bold opacity-80">{data.reference}</p>
                        </div>
                    </div>

                    {/* Audio Player Button */}
                    <button 
                        onClick={speakDevotional}
                        disabled={isGeneratingAudio}
                        className={`w-full py-4 rounded-2xl font-black text-lg flex items-center justify-center gap-3 transition-all active:scale-95 shadow-md
                        ${isSpeaking 
                            ? 'bg-amber-400 text-amber-900 border-b-4 border-amber-600' 
                            : 'bg-white text-slate-600 border-b-4 border-slate-200'}
                        ${isGeneratingAudio ? 'opacity-70 cursor-wait' : ''}
                        `}
                    >
                        {isGeneratingAudio ? (
                            <Loader2 className="animate-spin" />
                        ) : isSpeaking ? (
                            <StopCircle className="animate-pulse fill-amber-900/20" />
                        ) : (
                            <Volume2 />
                        )}
                        
                        {isGeneratingAudio 
                            ? "Preparando Voz..." 
                            : isSpeaking 
                                ? "Parar Áudio" 
                                : "Ouvir Devocional"
                        }
                    </button>

                    {/* Explanation Section */}
                    <div className="bg-white rounded-[2rem] p-6 border border-slate-100 shadow-sm relative">
                        <div className="absolute -top-3 left-6 bg-sky-100 text-sky-600 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider">
                            Para o Miguel
                        </div>
                        <p className="text-lg leading-relaxed text-slate-600 font-medium">
                            {data.devotional}
                        </p>
                    </div>

                    {/* Story Section */}
                    <div className="bg-white rounded-[2rem] p-6 border-l-8 border-sky-300 shadow-sm">
                        <div className="flex items-center gap-2 mb-4">
                            <BookOpen className="text-sky-500" size={24} />
                            <h3 className="font-black text-xl text-slate-700">{data.storyTitle}</h3>
                        </div>
                        <div className="prose prose-slate text-slate-600 leading-relaxed">
                            {data.storyContent.split('\n').map((p, i) => (
                                <p key={i} className="mb-2">{p}</p>
                            ))}
                        </div>
                    </div>

                    {/* Image Section */}
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

                    {/* Prayer Section */}
                    <div className="bg-yellow-50 rounded-[2rem] p-6 border-2 border-yellow-100 text-center relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-1 bg-yellow-300" />
                        <h4 className="font-black text-yellow-600 uppercase tracking-widest mb-3 flex items-center justify-center gap-2">
                            <Heart size={16} fill="#ca8a04" /> Hora de Orar
                        </h4>
                        <p className="text-xl font-bold text-slate-700 italic">
                            "{data.prayer}"
                        </p>
                    </div>

                </div>
            ) : (
                <div className="text-center p-8 text-slate-400">
                    <p>Não foi possível carregar o devocional hoje. Tente mais tarde!</p>
                </div>
            )}
        </Layout>
    </div>
  );
};

export default FaithCorner;