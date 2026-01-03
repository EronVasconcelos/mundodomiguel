
import { GoogleGenAI, Type, Modality } from "@google/genai";
import { StoryData, DevotionalData, ChildProfile } from '../types';

// --- FALLBACK DATA ---
const STATIC_STORY_IMAGE = "https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?q=80&w=1000&auto=format&fit=crop"; 
const STATIC_DEVOTIONAL_IMAGE = "https://images.unsplash.com/photo-1491841550275-ad7854e35ca6?q=80&w=1000&auto=format&fit=crop"; 

export const STATIC_STORIES: StoryData[] = [
  {
    title: "Os Três Porquinhos",
    content: "Era uma vez três porquinhos irmãos. O primeiro, Cícero, fez uma casa de palha porque queria brincar logo. O segundo, Heitor, fez uma de madeira. O terceiro, Prático, trabalhou muito e fez uma casa de tijolos.\n\nUm dia, o Lobo Mau apareceu! Ele soprou a casa de palha e a de madeira, e elas caíram. Os irmãos correram para a casa de Prático. O Lobo soprou, soprou, mas a casa de tijolos não caiu! Ele tentou entrar pela chaminé, mas caiu num caldeirão de água quente e fugiu para nunca mais voltar.",
    moral: "O trabalho duro e a dedicação trazem segurança e bons resultados."
  },
  {
    title: "A Lebre e a Tartaruga",
    content: "A Lebre vivia zombando da Tartaruga por ser lenta. Um dia, a Tartaruga desafiou a Lebre para uma corrida. A Lebre aceitou rindo e saiu disparada na frente.\n\nConfiante de que ganharia fácil, a Lebre parou para tirar uma soneca no meio do caminho. A Tartaruga, devagar e sempre, continuou andando sem parar. Quando a Lebre acordou, viu que a Tartaruga já estava cruzando a linha de chegada! A Lebre correu o máximo que pôde, mas foi tarde demais.",
    moral: "Devagar e sempre se vai ao longe. A persistência vence a arrogância."
  }
];

const FALLBACK_DEVOTIONAL: DevotionalData = {
  date: new Date().toDateString(),
  verse: "O Senhor é o meu pastor; nada me faltará.",
  reference: "Salmos 23:1",
  devotional: "Assim como um pastor cuida de suas ovelhinhas, Deus cuida de você com muito amor. Ele sabe de tudo o que você precisa.",
  storyTitle: "O Pastor Amoroso",
  storyContent: "Davi era um menino que cuidava de ovelhas. Ele sabia o nome de cada uma! Assim também é Deus conosco. Você pode confiar nEle sempre.",
  prayer: "Senhor Jesus, obrigado por cuidar de mim como um bom pastor. Amém.",
  imagePrompt: "a cute child shepherd with sheep in a beautiful green field, pixar style" 
};

// --- API AVAILABILITY CHECK ---
export const isAIAvailable = (): boolean => {
    const key = process.env.API_KEY;
    // Verifica se a chave existe e não é uma string de erro comum
    return !!key && key !== "" && key !== "undefined" && key.length > 5;
};

// Auxiliar para instanciar com tratamento de erro
const getAIClient = () => {
    const apiKey = process.env.API_KEY;
    if (!apiKey) {
        throw new Error("API_KEY_MISSING");
    }
    return new GoogleGenAI({ apiKey });
};

// --- CONTENT GENERATION ---

export const generateStoryText = async (topic: string, profile: ChildProfile): Promise<StoryData> => {
  try {
    const ai = getAIClient();
    const prompt = `Você é um contador de histórias mágico para crianças. Crie uma história infantil curta, educativa e cativante para ${profile.name}, de ${profile.age} anos. Tema: ${topic}. Retorne JSON rigoroso: title, content, moral.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
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
    
    return JSON.parse(response.text || '{}') as StoryData;
  } catch (error: any) {
    console.error("Erro na geração de história:", error);
    if (error.message === "API_KEY_MISSING") throw new Error("A chave da IA não foi configurada. Toque no ícone de rede na Home para conectar.");
    throw new Error("Não consegui criar a história. Tente novamente em instantes!");
  }
};

export const generateDevotionalContent = async (profile: ChildProfile): Promise<DevotionalData> => {
  try {
    const ai = getAIClient();
    const prompt = `Crie um devocional cristão curto e gentil para uma criança de ${profile.age} anos chamada ${profile.name}. Retorne JSON: verse, reference, devotional, storyTitle, storyContent, prayer, imagePrompt.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
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
    return { ...JSON.parse(response.text || '{}'), date: new Date().toDateString() };
  } catch (error) {
    console.error("Erro no devocional IA:", error);
    return FALLBACK_DEVOTIONAL;
  }
};

export const generateDevotionalAudio = async (text: string, gender: 'boy' | 'girl' = 'boy'): Promise<string | null> => {
  try {
    const ai = getAIClient();
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-preview-tts',
      contents: [{ parts: [{ text: `Diga com voz doce e calma para uma criança: ${text}` }] }],
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: { 
          voiceConfig: { prebuiltVoiceConfig: { voiceName: gender === 'girl' ? 'Kore' : 'Puck' } } 
        },
      },
    });
    return response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data || null;
  } catch (error) {
    return null; 
  }
};

export const generateStoryImage = async (storyPrompt: string, profile?: ChildProfile): Promise<string | null> => {
  try {
    const ai = getAIClient();
    const charDesc = profile ? `a cute ${profile.age} year old ${profile.gender === 'boy' ? 'boy' : 'girl'} with ${profile.hairColor} hair and ${profile.skinTone} skin` : "a cute child";
    const prompt = `Disney Pixar 3D animation style, cinematic lighting, high quality. Subject: ${charDesc}. Scene: ${storyPrompt.substring(0, 300)}. NO TEXT.`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: { parts: [{ text: prompt }] },
      config: { imageConfig: { aspectRatio: "1:1" } }
    });
    
    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData?.data) {
        return `data:image/png;base64,${part.inlineData.data}`;
      }
    }
  } catch (error) {}
  return null;
};

export const getFallbackStoryImage = () => STATIC_STORY_IMAGE;
export const getFallbackDevotionalImage = () => STATIC_DEVOTIONAL_IMAGE;
