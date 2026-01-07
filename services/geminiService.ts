
import { GoogleGenAI, Type, Modality } from "@google/genai";
import { StoryData, DevotionalData, ChildProfile } from '../types';

// Configurações de segurança: Desativadas para evitar falsos positivos em prompts infantis
const SAFETY_SETTINGS = [
  { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_NONE' },
  { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_NONE' },
  { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_NONE' },
  { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_NONE' },
];

/**
 * Pega a chave de API de forma resiliente de todas as pontes possíveis.
 */
const getRawKey = (): string => {
  return (
    (window as any).VITE_API_KEY ||
    (window as any).process?.env?.API_KEY ||
    process.env.API_KEY || 
    ""
  );
};

export const isAIAvailable = (): boolean => {
  const key = getRawKey();
  return typeof key === 'string' && key.length > 20;
};

const getAI = () => {
  const key = getRawKey();
  if (!key) throw new Error("Chave de API não encontrada.");
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
    console.error("Erro Texto IA:", error);
    return STATIC_STORIES[0];
  }
};

export const generateDevotionalContent = async (profile: ChildProfile): Promise<DevotionalData> => {
  try {
    const ai = getAI();
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Crie um devocional cristão doce para ${profile.name}, de ${profile.age} anos. Retorne APENAS JSON: verse, reference, devotional, storyTitle, storyContent, prayer, imagePrompt.`,
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
    console.error("Erro Devocional IA:", error);
    return { ...FALLBACK_DEVOTIONAL, date: new Date().toDateString() };
  }
};

export const generateDevotionalAudio = async (text: string, gender: 'boy' | 'girl' = 'boy'): Promise<string | null> => {
  try {
    const ai = getAI();
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-preview-tts",
      contents: [{ parts: [{ text: `Leia com voz doce e calma: ${text}` }] }],
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
    // Prompt ultra-específico e seguro para evitar bloqueios de segurança
    const charDesc = profile 
      ? `A cute ${profile.age} year old ${profile.gender === 'boy' ? 'boy' : 'girl'} with ${profile.hairColor} hair and ${profile.skinTone} skin tone` 
      : "A happy child";
    
    const finalPrompt = `Digital art, Disney Pixar 3D animated movie style, masterpiece, vibrant colors, soft lighting. Subject: ${charDesc}. Scene: ${storyPrompt.substring(0, 180)}. High resolution, cute character design.`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [{ text: finalPrompt }],
      },
      config: { 
        imageConfig: { aspectRatio: "1:1" },
        safetySettings: SAFETY_SETTINGS // Força desativação de bloqueios para imagens
      },
    });

    // Percorre todas as partes da resposta para garantir captura da imagem
    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData?.data) {
        return `data:image/png;base64,${part.inlineData.data}`;
      }
    }
    
    console.warn("IA não retornou dados de imagem na resposta.");
    return null;
  } catch (error) {
    console.error("Erro crítico na geração de imagem:", error);
    return null;
  }
};

// --- DADOS DE BACKUP ---
export const STATIC_STORIES: StoryData[] = [
  { title: "O Jardim Secreto", content: "Miguel descobriu uma porta mágica atrás das flores. Lá, os passarinhos falavam e as nuvens eram de algodão doce!", moral: "A imaginação nos leva a lugares incríveis." }
];

export const FALLBACK_DEVOTIONAL: DevotionalData = {
  date: new Date().toDateString(),
  verse: "O Senhor é o meu pastor.",
  reference: "Salmos 23:1",
  devotional: "Jesus cuida de você como um pastor cuida de suas ovelhinhas com muito amor!",
  storyTitle: "A Ovelhinha Feliz",
  storyContent: "Havia uma ovelhinha que nunca tinha medo, pois sabia que o seu pastor estava sempre por perto.",
  prayer: "Obrigado Jesus por cuidar de mim. Amém!",
  imagePrompt: "Cute white lamb in green field Disney style"
};

export const getFallbackStoryImage = () => "https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?q=80&w=1000";
export const getFallbackDevotionalImage = () => "https://images.unsplash.com/photo-1491841550275-ad7854e35ca6?q=80&w=1000";
