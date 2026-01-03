
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
    // Verificação simplificada: assume-se que o ambiente injetará a chave.
    const key = process.env.API_KEY;
    return !!key && key !== "undefined" && key.length > 5;
};

// --- CONTENT GENERATION ---

export const generateStoryText = async (topic: string, profile: ChildProfile): Promise<StoryData> => {
  // Instancia o SDK no momento da chamada para garantir o acesso à chave injetada
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const prompt = `Você é um contador de histórias mágico para crianças. Crie uma história infantil curta, educativa e cativante para ${profile.name}, de ${profile.age} anos. Tema: ${topic}. Retorne JSON rigoroso: title, content, moral.`;

  try {
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
  } catch (error) {
    console.error("Erro na geração de história:", error);
    throw new Error("Não consegui criar a história. Tente novamente em instantes!");
  }
};

export const generateDevotionalContent = async (profile: ChildProfile): Promise<DevotionalData> => {
  if (!isAIAvailable()) return FALLBACK_DEVOTIONAL;

  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const prompt = `Crie um devocional cristão curto e gentil para uma criança de ${profile.age} anos chamada ${profile.name}. Retorne JSON: verse, reference, devotional, storyTitle, storyContent, prayer, imagePrompt.`;

  try {
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
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  try {
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
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const charDesc = profile ? `a cute ${profile.age} year old ${profile.gender === 'boy' ? 'boy' : 'girl'} with ${profile.hairColor} hair and ${profile.skinTone} skin` : "a cute child";
  const prompt = `Disney Pixar 3D animation style, cinematic lighting, high quality. Subject: ${charDesc}. Scene: ${storyPrompt.substring(0, 300)}. NO TEXT.`;

  try {
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
