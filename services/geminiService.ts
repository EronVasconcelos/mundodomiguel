
import { GoogleGenAI, Type, Modality } from "@google/genai";
import { StoryData, DevotionalData, ChildProfile } from '../types';

/**
 * Handle API errors, specifically identifying when the selected API key 
 * is invalid or missing billing, allowing the UI to reset and prompt re-selection.
 */
const handleAIError = (error: any) => {
  console.error("Gemini API Error:", error);
  const errorMessage = error?.message || "";
  
  if (errorMessage.includes("Requested entity was not found") || 
      errorMessage.includes("API key not valid") || 
      errorMessage.includes("404") ||
      errorMessage.includes("403")
     ) {
    localStorage.removeItem('ai_active_global');
    localStorage.removeItem('ai_enabled_decision');
    window.dispatchEvent(new CustomEvent('ai_auth_reset'));
  }
};

// --- MOCK DATA FOR OFFLINE/FALLBACK MODE ---
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
  imagePrompt: "A cute shepherd boy sitting on grass with white sheep, sunny day, blue sky, 3d pixar style"
};

export const generateStoryText = async (topic: string, profile: ChildProfile): Promise<StoryData> => {
  const apiKey = process.env.API_KEY;
  
  // FALLBACK: Se não houver chave (Modo Livro Nativo), retorna história local
  if (!apiKey) {
    return {
        ...FALLBACK_STORY,
        title: `${FALLBACK_STORY.title} (${topic})`, // Personaliza levemente o título
        content: `(Modo Offline: ${topic}) ${FALLBACK_STORY.content}`
    };
  }
  
  const ai = new GoogleGenAI({ apiKey });
  const prompt = `Crie uma história para uma criança chamada ${profile.name}. Idade: ${profile.age} anos. Gênero: ${profile.gender === 'boy' ? 'Menino' : 'Menina'}. Tema: ${topic}. Retorne apenas JSON com title, content (aprox 300 palavras), moral.`;

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
    handleAIError(error);
    // Em caso de erro na API, também retorna fallback para não travar o app
    return FALLBACK_STORY;
  }
};

export const generateDevotionalContent = async (profile: ChildProfile): Promise<DevotionalData> => {
  const apiKey = process.env.API_KEY;
  
  // FALLBACK: Se não houver chave (Modo Simples), retorna devocional local
  if (!apiKey) {
      return FALLBACK_DEVOTIONAL;
  }

  const ai = new GoogleGenAI({ apiKey });
  const prompt = `Devocional cristão diário para ${profile.name}, ${profile.age} anos. JSON com verse, reference, devotional, storyTitle, storyContent, prayer, imagePrompt (3D Pixar style).`;

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
    handleAIError(error);
    return FALLBACK_DEVOTIONAL;
  }
};

export const generateDevotionalAudio = async (text: string): Promise<string | null> => {
  const apiKey = process.env.API_KEY;
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
    handleAIError(error);
    return null; 
  }
};

export const generateStoryImage = async (storyPrompt: string, profile?: ChildProfile): Promise<string> => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) return "";
  const ai = new GoogleGenAI({ apiKey });
  try {
    const char = profile ? `Child is ${profile.age}yo ${profile.gender}, ${profile.hairColor} hair.` : "";
    const prompt = `Pixar style 3D render, highly detailed. ${char} Scene: ${storyPrompt.substring(0, 300)}`;
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: { parts: [{ text: prompt }] },
      config: { imageConfig: { aspectRatio: "1:1" } }
    });
    const imgPart = response.candidates?.[0]?.content?.parts.find(p => p.inlineData);
    return imgPart ? `data:image/png;base64,${imgPart.inlineData.data}` : "";
  } catch (error) { 
    handleAIError(error);
    return ""; 
  }
};
