
import { GoogleGenAI, Type, Modality } from "@google/genai";
import { StoryData, DevotionalData, ChildProfile } from '../types';

// --- DADOS DE FALLBACK (OFFLINE/MOCK) ---
// Imagens reais do Unsplash para dar vida ao modo offline
const FALLBACK_STORY_IMAGE = "https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?q=80&w=1000&auto=format&fit=crop"; // Floresta mágica
const FALLBACK_DEVOTIONAL_IMAGE = "https://images.unsplash.com/photo-1491841550275-ad7854e35ca6?q=80&w=1000&auto=format&fit=crop"; // Ovelhas/Pastor

const FALLBACK_STORY: StoryData = {
  title: "O Piquenique da Floresta",
  content: "Era uma vez um coelhinho chamado Pimpão que adorava cenouras. Um dia, ele decidiu fazer um grande piquenique na floresta. Convidou a tartaruga Tita, o esquilo Zeca e a coruja Olivia. Cada um trouxe algo gostoso. Tita trouxe folhas fresquinhas, Zeca trouxe nozes crocantes e Olivia trouxe frutas vermelhas. Eles estenderam uma toalha xadrez na grama verde e compartilharam suas comidas. O sol brilhava e os pássaros cantavam. Pimpão percebeu que a comida ficava muito mais gostosa quando compartilhada com amigos. Eles brincaram de esconde-esconde até o sol se pôr e voltaram para casa felizes.",
  moral: "Compartilhar momentos com amigos traz a verdadeira felicidade."
};

const FALLBACK_DEVOTIONAL: DevotionalData = {
  date: new Date().toDateString(),
  verse: "O Senhor é o meu pastor; nada me faltará.",
  reference: "Salmos 23:1",
  devotional: "Assim como um pastor cuida de suas ovelhinhas, Deus cuida de você com muito amor. Ele sabe de tudo o que você precisa.",
  storyTitle: "O Pastor Amoroso",
  storyContent: "Davi era um menino que cuidava de ovelhas. Ele protegia suas ovelhinhas de leões e ursos. Ele sabia o nome de cada uma! Assim também é Deus conosco. Ele nos protege, nos guia e nos ama muito mais do que qualquer pastor ama suas ovelhas. Você pode confiar nEle sempre.",
  prayer: "Senhor Jesus, obrigado por cuidar de mim como um bom pastor. Ajuda-me a confiar em Ti em todos os momentos. Amém.",
  imagePrompt: "" 
};

// Acessa a chave diretamente do ambiente
const getApiKey = () => process.env.API_KEY;

export const generateStoryText = async (topic: string, profile: ChildProfile): Promise<StoryData> => {
  const apiKey = getApiKey();
  
  // Modo Offline Silencioso
  if (!apiKey) {
    console.log("Modo Offline (Sem Chave): Retornando história padrão.");
    return {
        ...FALLBACK_STORY,
        title: `${FALLBACK_STORY.title} (${topic})`,
        content: `(História do Livro Mágico: ${topic})\n\n${FALLBACK_STORY.content}`
    };
  }
  
  const ai = new GoogleGenAI({ apiKey });
  const prompt = `Crie uma história infantil curta e mágica para ${profile.name}, ${profile.age} anos. Tema: ${topic}. Retorne JSON estrito com as chaves: title, content, moral.`;

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
    return JSON.parse(response.text) as StoryData;
  } catch (error) {
    console.error("Erro AI Texto:", error);
    return FALLBACK_STORY;
  }
};

export const generateDevotionalContent = async (profile: ChildProfile): Promise<DevotionalData> => {
  const apiKey = getApiKey();
  
  if (!apiKey) {
      return FALLBACK_DEVOTIONAL;
  }

  const ai = new GoogleGenAI({ apiKey });
  const prompt = `Devocional cristão curto para ${profile.name}, ${profile.age} anos. JSON estrito: verse, reference, devotional, storyTitle, storyContent, prayer, imagePrompt (Pixar style).`;

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
    return { ...JSON.parse(response.text), date: new Date().toDateString() };
  } catch (error) {
    console.error("Erro AI Devocional:", error);
    return FALLBACK_DEVOTIONAL;
  }
};

export const generateDevotionalAudio = async (text: string): Promise<string | null> => {
  const apiKey = getApiKey();
  if (!apiKey) return null;

  const ai = new GoogleGenAI({ apiKey });
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-preview-tts',
      contents: { parts: [{ text: text }] },
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: { 
          voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Fenrir' } } 
        },
      },
    });
    return response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data || null;
  } catch (error) { 
    console.error("Erro AI Audio:", error);
    return null; 
  }
};

export const generateStoryImage = async (storyPrompt: string, profile?: ChildProfile): Promise<string> => {
  const apiKey = getApiKey();
  
  // Lógica de Fallback Inteligente
  const isDevotional = storyPrompt.toLowerCase().includes('pastor') || storyPrompt.toLowerCase().includes('deus') || storyPrompt.toLowerCase().includes('jesus');
  const fallbackImage = isDevotional ? FALLBACK_DEVOTIONAL_IMAGE : FALLBACK_STORY_IMAGE;

  if (!apiKey) {
      return fallbackImage;
  }

  const ai = new GoogleGenAI({ apiKey });
  try {
    const char = profile ? `Child is ${profile.age}yo ${profile.gender}.` : "";
    const prompt = `Pixar style 3D render, cute, bright colors. ${char} Scene: ${storyPrompt.substring(0, 200)}`;
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: { parts: [{ text: prompt }] },
      config: { imageConfig: { aspectRatio: "1:1" } }
    });
    const imgPart = response.candidates?.[0]?.content?.parts.find(p => p.inlineData);
    return imgPart ? `data:image/png;base64,${imgPart.inlineData.data}` : fallbackImage;
  } catch (error) { 
    console.error("Erro AI Imagem:", error);
    return fallbackImage; 
  }
};
