
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

export const isAIAvailable = (): boolean => {
    try {
        // Acesso estrito via process.env conforme diretrizes da SDK
        const key = process.env.API_KEY;
        return !!key && key !== "undefined" && key.length > 20;
    } catch {
        return false;
    }
};

const getAI = () => {
    if (!isAIAvailable()) throw new Error("API_KEY_MISSING");
    return new GoogleGenAI({ apiKey: process.env.API_KEY! });
};

// --- CONTENT GENERATION ---

export const generateStoryText = async (topic: string, profile: ChildProfile): Promise<StoryData> => {
  try {
    const ai = getAI();
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Você é um contador de histórias infantil mágico. Crie uma história curta, educativa e feliz para ${profile.name}, que tem ${profile.age} anos. O tema é: ${topic}. Retorne APENAS um JSON com os campos: title, content, moral.`,
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
    
    const text = response.text;
    if (!text) throw new Error("Empty response from Gemini");
    return JSON.parse(text) as StoryData;
  } catch (error: any) {
    console.error("Gemini Story Error Details:", error);
    // Retorna uma história estática em caso de falha para não travar a experiência da criança
    return STATIC_STORIES[Math.floor(Math.random() * STATIC_STORIES.length)];
  }
};

export const generateDevotionalContent = async (profile: ChildProfile): Promise<DevotionalData> => {
  try {
    const ai = getAI();
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Crie um devocional cristão muito doce para uma criança de ${profile.age} anos chamada ${profile.name}. Retorne JSON com: verse (um versículo curto), reference (capítulo e versículo), devotional (explicação simples), storyTitle, storyContent (uma historinha curta sobre o tema), prayer (uma oração curta), imagePrompt (descrição para gerar uma imagem estilo Disney Pixar).`,
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
    const text = response.text;
    if (!text) throw new Error("Empty response");
    return { ...JSON.parse(text), date: new Date().toDateString() };
  } catch (error: any) {
    console.error("Gemini Devotional Error:", error);
    return { ...FALLBACK_DEVOTIONAL, date: new Date().toDateString() };
  }
};

export const generateDevotionalAudio = async (text: string, gender: 'boy' | 'girl' = 'boy'): Promise<string | null> => {
  try {
    const ai = getAI();
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-preview-tts',
      contents: [{ parts: [{ text: `Leia este texto para uma criança com voz carinhosa: ${text}` }] }],
      config: {
        responseModalalities: [Modality.AUDIO],
        speechConfig: { 
          voiceConfig: { prebuiltVoiceConfig: { voiceName: gender === 'girl' ? 'Kore' : 'Puck' } } 
        },
      },
    });
    return response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data || null;
  } catch (error) { 
    console.error("TTS Error:", error);
    return null; 
  }
};

export const generateStoryImage = async (storyPrompt: string, profile?: ChildProfile): Promise<string | null> => {
  try {
    const ai = getAI();
    const charDesc = profile ? `a cute ${profile.age} year old ${profile.gender === 'boy' ? 'boy' : 'girl'}, ${profile.hairColor} hair, ${profile.skinTone} skin` : "a cute happy child";
    const fullPrompt = `Disney Pixar 3D style, high quality, colorful. ${charDesc} in a scene about: ${storyPrompt.substring(0, 200)}.`;
    
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: { parts: [{ text: fullPrompt }] },
      config: { imageConfig: { aspectRatio: "1:1" } }
    });
    
    const imgPart = response.candidates?.[0]?.content?.parts.find(p => p.inlineData);
    return imgPart ? `data:image/png;base64,${imgPart.inlineData?.data}` : null;
  } catch (error) { 
    console.error("Image Gen Error:", error);
    return null; 
  }
};

// --- DATA ---
export const STATIC_STORIES: StoryData[] = [
  { title: "Os Três Porquinhos", content: "Cícero, Heitor e Prático construíram casas de palha, madeira e tijolos. O lobo soprou as duas primeiras, mas a de tijolos protegeu a todos!", moral: "O trabalho bem feito e a paciência nos deixam seguros." },
  { title: "O Patinho Diferente", content: "Um patinho nasceu diferente e todos achavam estranho, até que ele cresceu e descobriu que era um lindo cisne branco!", moral: "Cada um de nós é especial do jeitinho que Deus criou." }
];

export const FALLBACK_DEVOTIONAL: DevotionalData = {
    date: new Date().toDateString(),
    verse: "O Senhor é o meu pastor e nada me faltará.", 
    reference: "Salmos 23:1",
    devotional: "Oi Miguel! Hoje o Papai do Céu quer te lembrar que Ele cuida de você em cada detalhe, como um pastor cuida da sua ovelhinha favorita.",
    storyTitle: "A Ovelhinha Saltitante", 
    storyContent: "Havia uma ovelhinha que amava pular. Um dia ela se perdeu, mas o bom pastor a encontrou e a trouxe de volta nos braços, com muito carinho.",
    prayer: "Papai do Céu, obrigado por me proteger e por estar sempre comigo. Amém!", 
    imagePrompt: "cute lamb in a green field Disney Pixar style"
};

export const getFallbackStoryImage = () => STATIC_STORY_IMAGE;
export const getFallbackDevotionalImage = () => STATIC_DEVOTIONAL_IMAGE;
