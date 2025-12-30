
import { GoogleGenAI, Type, Modality } from "@google/genai";
import { StoryData, DevotionalData, ChildProfile } from '../types';

/**
 * Handle API errors, specifically identifying when the selected API key 
 * is invalid or missing billing, allowing the UI to reset and prompt re-selection.
 */
const handleAIError = (error: any) => {
  console.error("Gemini API Error:", error);
  const errorMessage = error?.message || "";
  
  // Lista de erros que indicam problema com a chave ou projeto
  if (errorMessage.includes("Requested entity was not found") || 
      errorMessage.includes("API key not valid") || 
      errorMessage.includes("404") || // Entity not found code
      errorMessage.includes("403")    // Permission denied
     ) {
    localStorage.removeItem('ai_active_global');
    localStorage.removeItem('ai_enabled_decision');
    // Dispara evento para que a UI (FaithCorner/StoryTime) saiba que deve pedir login novamente
    window.dispatchEvent(new CustomEvent('ai_auth_reset'));
  }
};

export const generateStoryText = async (topic: string, profile: ChildProfile): Promise<StoryData> => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) throw new Error("API Key missing");
  
  // Instancia aqui para pegar a chave mais recente do ambiente
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
