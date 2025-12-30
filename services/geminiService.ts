
import { GoogleGenAI, Type, Modality } from "@google/genai";
import { StoryData, DevotionalData, ChildProfile } from '../types';

/**
 * Utilitário de tratamento de erro para capturar problemas de chave/faturamento
 * e notificar a UI para resetar o estado de autenticação.
 */
const handleAIError = (error: any) => {
  console.error("Gemini API Error:", error);
  const errorMessage = error?.message || "";
  
  // Se a entidade não for encontrada ou a chave for inválida/sem faturamento, 
  // limpamos o estado local e avisamos a UI.
  if (errorMessage.includes("Requested entity was not found") || 
      errorMessage.includes("API key not valid") ||
      errorMessage.includes("not found")) {
    
    localStorage.removeItem('ai_active_global');
    localStorage.removeItem('ai_enabled_decision');
    window.dispatchEvent(new CustomEvent('ai_auth_reset'));
  }
};

export const generateStoryText = async (topic: string, profile: ChildProfile): Promise<StoryData> => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) throw new Error("API Key missing");
  
  // Criar instância nova a cada chamada para garantir que pegamos a chave atualizada
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
    throw error;
  }
};

export const generateDevotionalContent = async (profile: ChildProfile): Promise<DevotionalData> => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) throw new Error("API Key missing");

  const ai = new GoogleGenAI({ apiKey });
  const prompt = `Devocional cristão diário para ${profile.name}, ${profile.age} anos. Retorne JSON com: verse, reference, devotional (reflexão curta), storyTitle, storyContent (história bíblica lúdica), prayer (oração curta), imagePrompt (descrição para IA de imagem estilo Pixar).`;

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
    throw error;
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
    const charContext = profile ? `Child name: ${profile.name}, Age: ${profile.age}, ${profile.gender === 'boy' ? 'Boy' : 'Girl'}.` : "";
    const prompt = `3D Pixar animation style, soft lighting, high detail. ${charContext} Scene: ${storyPrompt.substring(0, 500)}`;
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
