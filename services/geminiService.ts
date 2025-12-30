
import { GoogleGenAI, Type, Modality } from "@google/genai";
import { StoryData, DevotionalData, ChildProfile } from '../types';

// --- DADOS DE FALLBACK (OFFLINE/MOCK) ---
const FALLBACK_STORY_IMAGE = "https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?q=80&w=1000&auto=format&fit=crop"; 
const FALLBACK_DEVOTIONAL_IMAGE = "https://images.unsplash.com/photo-1491841550275-ad7854e35ca6?q=80&w=1000&auto=format&fit=crop"; 

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
  
  if (!apiKey) {
    console.log("Modo Offline (Sem Chave): Retornando história padrão.");
    return {
        ...FALLBACK_STORY,
        title: `${FALLBACK_STORY.title} (${topic})`,
        content: `(História do Livro Mágico: ${topic})\n\n${FALLBACK_STORY.content}`
    };
  }
  
  const ai = new GoogleGenAI({ apiKey });
  // Prompt mais robusto para garantir JSON válido e história envolvente
  const prompt = `Você é um contador de histórias mágico. Crie uma história infantil muito curta, cativante e educativa para ${profile.name}, uma criança de ${profile.age} anos. 
  Tema: ${topic}.
  A história deve ter começo, meio e fim claros.
  Retorne APENAS um JSON estrito com as chaves: "title", "content", "moral". Sem formatação markdown.`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
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
    
    if (response.text) {
        return JSON.parse(response.text) as StoryData;
    }
    throw new Error("Resposta vazia da IA");
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
  const prompt = `Crie um devocional cristão curto e simples para uma criança de ${profile.age} anos chamada ${profile.name}.
  Retorne JSON estrito: verse (versículo), reference (referência), devotional (explicação simples), storyTitle (titulo historia), storyContent (historia biblica curta), prayer (oração), imagePrompt (descrição visual para gerar imagem estilo Pixar).`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
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
  
  const isDevotional = storyPrompt.toLowerCase().includes('pastor') || storyPrompt.toLowerCase().includes('deus') || storyPrompt.toLowerCase().includes('jesus') || storyPrompt.toLowerCase().includes('biblia');
  const fallbackImage = isDevotional ? FALLBACK_DEVOTIONAL_IMAGE : FALLBACK_STORY_IMAGE;

  if (!apiKey) {
      return fallbackImage;
  }

  const ai = new GoogleGenAI({ apiKey });
  try {
    const charDesc = profile ? `A cute ${profile.age} year old ${profile.gender}, ${profile.hairColor} hair, ${profile.skinTone} skin` : "A cute child";
    
    // Prompt altamente otimizado para qualidade visual
    const enhancedPrompt = `Disney Pixar movie poster style, 3D render, masterpiece, 8k resolution, soft cinematic lighting, vibrant colors, cute and magical atmosphere.
    Subject: ${charDesc} in the scene: ${storyPrompt.substring(0, 300)}.
    High detail, smooth textures, centered composition.`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: { parts: [{ text: enhancedPrompt }] },
      config: { 
          imageConfig: { aspectRatio: "1:1" } 
      }
    });
    
    const imgPart = response.candidates?.[0]?.content?.parts.find(p => p.inlineData);
    if (imgPart) {
        return `data:image/png;base64,${imgPart.inlineData.data}`;
    }
    return fallbackImage;
  } catch (error) { 
    console.error("Erro AI Imagem:", error);
    return fallbackImage; 
  }
};
