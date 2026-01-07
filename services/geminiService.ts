
import { GoogleGenAI, Type, Modality } from "@google/genai";
import { StoryData, DevotionalData, ChildProfile } from '../types';

/**
 * Inicializa o cliente seguindo a regra estrita: 
 * new GoogleGenAI({ apiKey: process.env.API_KEY })
 */
const getAI = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    console.error("ERRO CRÍTICO: API_KEY não encontrada no ambiente process.env.");
  }
  return new GoogleGenAI({ apiKey: apiKey || "" });
};

export const isAIAvailable = (): boolean => {
  return !!process.env.API_KEY && process.env.API_KEY.length > 20;
};

// --- GERAÇÃO DE CONTEÚDO (HISTÓRIAS) ---

export const generateStoryText = async (topic: string, profile: ChildProfile): Promise<StoryData> => {
  try {
    const ai = getAI();
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: [{ 
        parts: [{ 
          text: `Você é um contador de histórias mágico. Crie uma história infantil curta (máximo 3 parágrafos) para ${profile.name}, que tem ${profile.age} anos. Tema: ${topic}. Retorne apenas JSON com as chaves: title, content, moral.` 
        }] 
      }],
      config: {
        responseMimeType: "application/json",
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

    const jsonText = response.text;
    if (!jsonText) throw new Error("IA retornou texto vazio");
    return JSON.parse(jsonText.trim()) as StoryData;
  } catch (error) {
    console.error("Falha ao gerar texto da história:", error);
    return STATIC_STORIES[0];
  }
};

// --- GERAÇÃO DE IMAGEM (ESTILO PIXAR) ---

export const generateStoryImage = async (storyPrompt: string, profile?: ChildProfile): Promise<string | null> => {
  try {
    const ai = getAI();
    const character = profile 
      ? `A cute ${profile.age} year old ${profile.gender === 'boy' ? 'boy' : 'girl'} with ${profile.hairColor} hair and ${profile.skinTone} skin tone.` 
      : "A happy child.";
    
    const prompt = `3D Disney Pixar movie style, high detail, vibrant colors, magical lighting. Scene: ${storyPrompt}. Subject: ${character}`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [{ text: prompt }],
      },
      config: {
        imageConfig: {
          aspectRatio: "1:1"
        }
      }
    });

    // A resposta pode conter múltiplas partes; devemos encontrar a inlineData
    if (response.candidates?.[0]?.content?.parts) {
      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData) {
          return `data:image/png;base64,${part.inlineData.data}`;
        }
      }
    }
    
    throw new Error("Nenhuma imagem encontrada nas partes da resposta.");
  } catch (error) {
    console.error("Falha ao gerar imagem:", error);
    return null;
  }
};

// --- GERAÇÃO DE DEVOCIONAL (FÉ) ---

export const generateDevotionalContent = async (profile: ChildProfile): Promise<DevotionalData> => {
  try {
    const ai = getAI();
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: [{ 
        parts: [{ 
          text: `Crie um devocional cristão doce e simples para ${profile.name}, ${profile.age} anos. Retorne apenas JSON: verse, reference, devotional, storyTitle, storyContent, prayer, imagePrompt.` 
        }] 
      }],
      config: {
        responseMimeType: "application/json",
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

    const jsonText = response.text;
    if (!jsonText) throw new Error("IA retornou texto vazio");
    return { ...JSON.parse(jsonText.trim()), date: new Date().toDateString() };
  } catch (error) {
    console.error("Falha ao gerar devocional:", error);
    return { ...FALLBACK_DEVOTIONAL, date: new Date().toDateString() };
  }
};

// --- GERAÇÃO DE VOZ (TTS) ---

export const generateDevotionalAudio = async (text: string, gender: 'boy' | 'girl' = 'boy'): Promise<string | null> => {
  try {
    const ai = getAI();
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-preview-tts",
      contents: [{ parts: [{ text: `Diga de forma carinhosa e lenta: ${text}` }] }],
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: gender === 'girl' ? 'Kore' : 'Puck' },
          },
        },
      },
    });

    return response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data || null;
  } catch (error) {
    console.error("Falha ao gerar áudio:", error);
    return null;
  }
};

// --- FALLBACKS ---
export const STATIC_STORIES: StoryData[] = [
  { title: "O Amigo Grilo", content: "Miguel encontrou um grilo que tocava violino. Eles fizeram um concerto para todas as formigas do jardim sob a luz da lua.", moral: "Grandes amizades podem surgir dos menores encontros." }
];

export const FALLBACK_DEVOTIONAL: DevotionalData = {
  date: new Date().toDateString(),
  verse: "O Senhor é o meu pastor.",
  reference: "Salmos 23:1",
  devotional: "Jesus cuida de você como um pastor cuida de suas ovelhinhas!",
  storyTitle: "A Ovelhinha Alegre",
  storyContent: "Havia uma ovelhinha que amava pular. O pastor a vigiava para que ela estivesse sempre segura.",
  prayer: "Obrigado Jesus por cuidar de mim. Amém!",
  imagePrompt: "Cute lamb in a green pasture Disney style"
};

export const getFallbackStoryImage = () => "https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?q=80&w=1000";
export const getFallbackDevotionalImage = () => "https://images.unsplash.com/photo-1491841550275-ad7854e35ca6?q=80&w=1000";
