
import { GoogleGenAI, Type, Modality } from "@google/genai";
import { StoryData, DevotionalData, ChildProfile } from '../types';

// Configurações de segurança para o público infantil - Evita bloqueios por falsos positivos
const SAFETY_SETTINGS = [
  { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_NONE' },
  { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_NONE' },
  { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_NONE' },
  { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_NONE' },
];

/**
 * Captura a chave de API de forma resiliente, priorizando VITE_API_KEY que funcionou para o usuário.
 */
const getRawKey = (): string => {
  return (
    (import.meta as any).env?.VITE_API_KEY ||
    (window as any).VITE_API_KEY ||
    process.env.API_KEY || 
    (window as any).process?.env?.API_KEY ||
    ""
  );
};

export const isAIAvailable = (): boolean => {
  const key = getRawKey();
  return typeof key === 'string' && key.length > 20;
};

const getAI = () => {
  const key = getRawKey();
  if (!key) throw new Error("API_KEY_NOT_FOUND");
  return new GoogleGenAI({ apiKey: key });
};

// --- GERAÇÃO DE CONTEÚDO ---

export const generateStoryText = async (topic: string, profile: ChildProfile): Promise<StoryData> => {
  try {
    const ai = getAI();
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Você é um contador de histórias mágico. Crie uma história infantil para ${profile.name}, ${profile.age} anos. Tema: ${topic}. Retorne APENAS JSON: title, content, moral.`,
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
  } catch (error) {
    console.error("Erro Texto Story:", error);
    return STATIC_STORIES[0];
  }
};

export const generateDevotionalContent = async (profile: ChildProfile): Promise<DevotionalData> => {
  try {
    const ai = getAI();
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Crie um devocional cristão doce para ${profile.name}, ${profile.age} anos. Retorne APENAS JSON: verse, reference, devotional, storyTitle, storyContent, prayer, imagePrompt.`,
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
  } catch (error) {
    console.error("Erro Devocional:", error);
    return { ...FALLBACK_DEVOTIONAL, date: new Date().toDateString() };
  }
};

export const generateDevotionalAudio = async (text: string, gender: 'boy' | 'girl' = 'boy'): Promise<string | null> => {
  try {
    const ai = getAI();
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-preview-tts",
      contents: [{ parts: [{ text: `Leia com carinho: ${text}` }] }],
      config: {
        responseModalalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: gender === 'girl' ? 'Kore' : 'Puck' },
          },
        },
      },
    });
    return response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data || null;
  } catch { return null; }
};

export const generateStoryImage = async (storyPrompt: string, profile?: ChildProfile): Promise<string | null> => {
  try {
    const ai = getAI();
    const char = profile 
      ? `A cute ${profile.age} year old ${profile.gender === 'boy' ? 'boy' : 'girl'} with ${profile.hairColor} hair and ${profile.skinTone} skin tone` 
      : "A happy child";
    
    // Prompt altamente descritivo para garantir o estilo desejado
    const fullPrompt = `3D render, Pixar and Disney movie style, masterpiece, vibrant colors, soft lighting. Scene: ${storyPrompt.substring(0, 200)}. Character: ${char}. High resolution, 4k.`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [{ text: fullPrompt }],
      },
      config: { 
        imageConfig: { aspectRatio: "1:1" },
        safetySettings: SAFETY_SETTINGS // Fundamental para evitar bloqueios na geração de imagens
      },
    });

    // Varre todas as partes da resposta procurando por inlineData (a imagem base64)
    const candidate = response.candidates?.[0];
    if (candidate?.content?.parts) {
      for (const part of candidate.content.parts) {
        if (part.inlineData?.data) {
          return `data:image/png;base64,${part.inlineData.data}`;
        }
      }
    }
    
    return null;
  } catch (error) {
    console.error("Erro ao gerar imagem:", error);
    return null;
  }
};

// --- FALLBACKS ---
export const STATIC_STORIES: StoryData[] = [
  { title: "Aventura no Jardim", content: "Miguel encontrou um pequeno grilo que tocava violino. Eles dançaram juntos sob a luz da lua.", moral: "A música está em todo lugar." }
];

export const FALLBACK_DEVOTIONAL: DevotionalData = {
  date: new Date().toDateString(),
  verse: "Deixai vir a mim as criancinhas.",
  reference: "Mateus 19:14",
  devotional: "Jesus ama muito você e quer ser seu melhor amigo todos os dias!",
  storyTitle: "O Convite Especial",
  storyContent: "Jesus estava conversando com muitas pessoas, mas parou tudo só para abraçar as crianças.",
  prayer: "Obrigado Jesus por me amar tanto. Amém!",
  imagePrompt: "Jesus hugging children Pixar style"
};

export const getFallbackStoryImage = () => "https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?q=80&w=1000";
export const getFallbackDevotionalImage = () => "https://images.unsplash.com/photo-1491841550275-ad7854e35ca6?q=80&w=1000";
