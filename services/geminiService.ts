
import { GoogleGenAI, Type, Modality } from "@google/genai";
import { StoryData, DevotionalData, ChildProfile } from '../types';

// --- CONFIGURAÇÃO DE SEGURANÇA E FALLBACK ---
const SAFETY_SETTINGS = [
    { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_NONE' },
    { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_NONE' },
    { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_NONE' },
    { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_NONE' },
];

const STATIC_STORY_IMAGE = "https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?q=80&w=1000&auto=format&fit=crop"; 
const STATIC_DEVOTIONAL_IMAGE = "https://images.unsplash.com/photo-1491841550275-ad7854e35ca6?q=80&w=1000&auto=format&fit=crop"; 

// Variável de controle de erro em runtime
let runtimeAIFailure = false;

export const isAIAvailable = (): boolean => {
    if (runtimeAIFailure) return false;
    try {
        // No Vite em produção, as variáveis podem estar em import.meta.env ou process.env
        const key = (import.meta as any).env?.VITE_API_KEY || 
                    process.env.API_KEY || 
                    (window as any).process?.env?.API_KEY;
                    
        const valid = !!key && typeof key === 'string' && key.length > 30 && key.startsWith("AIza");
        return valid;
    } catch {
        return false;
    }
};

const getAIClient = () => {
    const key = (import.meta as any).env?.VITE_API_KEY || 
                process.env.API_KEY || 
                (window as any).process?.env?.API_KEY;
                
    if (!key || runtimeAIFailure) throw new Error("IA_OFFLINE");
    return new GoogleGenAI({ apiKey: key });
};

// --- CONTENT GENERATION ---

export const generateStoryText = async (topic: string, profile: ChildProfile): Promise<StoryData> => {
  try {
    const ai = getAIClient();
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Você é um contador de histórias mágico. Crie uma história curta para ${profile.name}, ${profile.age} anos. Tema: ${topic}. Retorne JSON: title, content, moral.`,
      config: {
        responseMimeType: "application/json",
        safetySettings: SAFETY_SETTINGS,
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            content: { type: Type.STRING },
            moral: { type: Type.STRING },
          },
          required: ["title", "content", "moral"],
        },
      },
    });
    return JSON.parse(response.text || '{}') as StoryData;
  } catch (error: any) {
    console.warn("IA Story Error:", error);
    if (error.message?.includes("403") || error.message?.includes("API_KEY")) runtimeAIFailure = true;
    return STATIC_STORIES[Math.floor(Math.random() * STATIC_STORIES.length)];
  }
};

export const generateDevotionalContent = async (profile: ChildProfile): Promise<DevotionalData> => {
  try {
    const ai = getAIClient();
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Crie um devocional cristão para uma criança de ${profile.age} anos chamada ${profile.name}. Retorne JSON: verse, reference, devotional, storyTitle, storyContent, prayer, imagePrompt.`,
      config: {
        responseMimeType: "application/json",
        safetySettings: SAFETY_SETTINGS,
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            verse: { type: Type.STRING },
            reference: { type: Type.STRING },
            devotional: { type: Type.STRING },
            storyTitle: { type: Type.STRING },
            storyContent: { type: Type.STRING },
            prayer: { type: Type.STRING },
            imagePrompt: { type: Type.STRING },
          },
          required: ["verse", "reference", "devotional", "storyTitle", "storyContent", "prayer", "imagePrompt"],
        },
      },
    });
    return { ...JSON.parse(response.text || '{}'), date: new Date().toDateString() };
  } catch (error: any) {
    console.warn("IA Devotional Error:", error);
    if (error.message?.includes("403")) runtimeAIFailure = true;
    return { ...FALLBACK_DEVOTIONAL, date: new Date().toDateString() };
  }
};

export const generateDevotionalAudio = async (text: string, gender: 'boy' | 'girl' = 'boy'): Promise<string | null> => {
  try {
    const ai = getAIClient();
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-preview-tts',
      contents: [{ parts: [{ text: `Diga com voz doce: ${text}` }] }],
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: { 
          voiceConfig: { prebuiltVoiceConfig: { voiceName: gender === 'girl' ? 'Kore' : 'Puck' } } 
        },
      },
    });
    return response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data || null;
  } catch { return null; }
};

export const generateStoryImage = async (storyPrompt: string, profile?: ChildProfile): Promise<string | null> => {
  try {
    const ai = getAIClient();
    const charDesc = profile ? `${profile.age} year old ${profile.gender === 'boy' ? 'boy' : 'girl'}, ${profile.hairColor} hair, ${profile.skinTone} skin` : "cute child";
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: { parts: [{ text: `Disney Pixar 3D style. Subject: ${charDesc}. Scene: ${storyPrompt.substring(0, 200)}` }] },
      config: { imageConfig: { aspectRatio: "1:1" } }
    });
    const imgPart = response.candidates?.[0]?.content?.parts.find(p => p.inlineData);
    return imgPart ? `data:image/png;base64,${imgPart.inlineData?.data}` : null;
  } catch { return null; }
};

// --- DATA ---
export const STATIC_STORIES: StoryData[] = [
  { title: "Os Três Porquinhos", content: "Cícero, Heitor e Prático construíram casas de palha, madeira e tijolos. O lobo soprou as duas primeiras, mas a de tijolos protegeu a todos!", moral: "O trabalho bem feito traz segurança." },
  { title: "O Patinho Feio", content: "Um patinho era diferente e sofria por isso, até descobrir que era um lindo cisne!", moral: "A beleza real está dentro de nós." }
];

export const FALLBACK_DEVOTIONAL: DevotionalData = {
    date: new Date().toDateString(),
    verse: "O Senhor é o meu pastor e nada me faltará.", 
    reference: "Salmos 23:1",
    devotional: "Oi! Hoje o Papai do Céu quer te lembrar que Ele cuida de você como um pastor cuida da sua ovelhinha.",
    storyTitle: "A Ovelhinha Segura", 
    storyContent: "A pequena ovelhinha estava feliz porque sabia que o pastor estava sempre por perto para protegê-la.",
    prayer: "Papai do Céu, obrigado por cuidar de mim. Amém!", 
    imagePrompt: "cute lamb in field Pixar style"
};

export const getFallbackStoryImage = () => STATIC_STORY_IMAGE;
export const getFallbackDevotionalImage = () => STATIC_DEVOTIONAL_IMAGE;
