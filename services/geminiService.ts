
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
  },
  {
    title: "O Patinho Feio",
    content: "Dentre vários patinhos amarelos, nasceu um patinho cinza e diferente. Todos riam dele por não ser igual aos outros. Triste, ele fugiu para o lago.\n\nO tempo passou e ele cresceu. Um dia, ao olhar seu reflexo na água, ele não viu mais um patinho feio, mas sim um lindo cisne branco! Ele descobriu que sempre pertenceu a uma família de cisnes maravihosos e viveu feliz para sempre.",
    moral: "A beleza verdadeira vem de quem realmente somos, não do que os outros pensam."
  },
  {
    title: "Pinóquio",
    content: "Gepeto era um carpinteiro que fez um boneco de madeira chamado Pinóquio. Uma fada deu vida a ele, mas avisou: para ser um menino de verdade, ele teria que ser corajoso e honesto.\n\nToda vez que Pinóquio mentia, seu nariz crescia! Depois de muitas aventuras e de aprender que falar a verdade é sempre o melhor caminho, a fada o transformou em um menino de verdade para a alegria de Gepeto.",
    moral: "A honestidade é a base do caráter e nos transforma em pessoas melhores."
  }
];

export const FALLBACK_DEVOTIONAL: DevotionalData = {
    date: new Date().toDateString(),
    verse: "O Senhor é o meu pastor e nada me faltará.", 
    reference: "Salmos 23:1",
    devotional: "Oi Miguel! Hoje vamos lembrar que o Papai do Céu cuida de nós em todos os momentos, como um pastor cuida de suas ovelhinhas. Você nunca está sozinho!",
    storyTitle: "A Ovelhinha Segura", 
    storyContent: "Havia uma ovelhinha que adorava brincar no campo. Às vezes ela se afastava um pouquinho, mas logo ouvia a voz do seu pastor chamando e voltava feliz, sabendo que ele sempre a protegeria de qualquer perigo.",
    prayer: "Papai do Céu, muito obrigado por cuidar de mi e da minha família hoje e sempre. Amém!", 
    imagePrompt: "cute little lamb in a green field Disney Pixar style"
};

const SAFETY_SETTINGS = [
    { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_NONE' },
    { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_NONE' },
    { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_NONE' },
    { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_NONE' },
];

export const isAIAvailable = (): boolean => {
    try {
        const key = process.env.API_KEY || (window as any).process?.env?.API_KEY;
        // Validação rigorosa: Não pode ser vazio, "undefined", "null" e deve ter o formato de chave Google (geralmente começa com AIza e tem > 30 chars)
        const isValidKey = !!key && 
                          typeof key === 'string' && 
                          key.length > 30 && 
                          key !== "undefined" && 
                          key !== "null" &&
                          key.startsWith("AIza");
        return isValidKey;
    } catch {
        return false;
    }
};

const getAIClient = () => {
    const apiKey = process.env.API_KEY || (window as any).process?.env?.API_KEY;
    if (!isAIAvailable()) {
        throw new Error("MUNDO_OFFLINE: API_KEY não configurada corretamente.");
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
  } catch (error: any) {
    console.warn("Erro na geração de história, usando fallback:", error);
    return STATIC_STORIES[Math.floor(Math.random() * STATIC_STORIES.length)];
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
    console.warn("IA Falhou no devocional, usando fallback.");
    return { ...FALLBACK_DEVOTIONAL, date: new Date().toDateString() };
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
        safetySettings: SAFETY_SETTINGS,
        speechConfig: { 
          voiceConfig: { prebuiltVoiceConfig: { voiceName: gender === 'girl' ? 'Kore' : 'Puck' } } 
        },
      },
    });
    return response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data || null;
  } catch (error) { 
    console.warn("Erro ao gerar áudio TTS");
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
      config: { 
        imageConfig: { aspectRatio: "1:1" },
        safetySettings: SAFETY_SETTINGS
      }
    });
    return `data:image/png;base64,${response.candidates?.[0]?.content?.parts.find(p => p.inlineData)?.inlineData?.data}`;
  } catch (error) { 
    console.warn("Erro ao gerar imagem");
    return null; 
  }
};

export const getFallbackStoryImage = () => STATIC_STORY_IMAGE;
export const getFallbackDevotionalImage = () => STATIC_DEVOTIONAL_IMAGE;
