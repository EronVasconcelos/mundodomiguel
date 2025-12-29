import { GoogleGenAI, Type } from "@google/genai";
import { StoryData } from '../types';

// --- OFFLINE CONTENT DATABASE ---
// Pre-generated stories to ensure the app works 100% offline or when API quota is exceeded.

const OFFLINE_IMAGES = {
  SPACE: `data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400"><rect width="400" height="400" fill="%231e1b4b"/><circle cx="200" cy="200" r="150" fill="%23312e81"/><circle cx="50" cy="50" r="2" fill="white"/><circle cx="350" cy="350" r="2" fill="white"/><circle cx="100" cy="300" r="2" fill="white"/><circle cx="300" cy="100" r="2" fill="white"/><text x="200" y="200" font-size="80" text-anchor="middle" dy=".3em">🚀</text><text x="280" y="80" font-size="40" text-anchor="middle">⭐</text><text x="80" y="320" font-size="40" text-anchor="middle">🪐</text></svg>`,
  DINO: `data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400"><rect width="400" height="400" fill="%2314532d"/><circle cx="200" cy="200" r="160" fill="%2322c55e" opacity="0.3"/><path d="M0 300 Q200 250 400 300 L400 400 L0 400 Z" fill="%23166534"/><text x="200" y="220" font-size="120" text-anchor="middle" dy=".3em">🦖</text><text x="320" y="100" font-size="60" text-anchor="middle">🌿</text></svg>`,
  BEAR: `data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400"><rect width="400" height="400" fill="%2378350f"/><circle cx="200" cy="200" r="150" fill="%2392400e"/><text x="200" y="220" font-size="120" text-anchor="middle" dy=".3em">🧸</text><text x="300" y="300" font-size="50" text-anchor="middle">💤</text><text x="100" y="100" font-size="50" text-anchor="middle">🌙</text></svg>`,
  HERO: `data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400"><rect width="400" height="400" fill="%231e3a8a"/><rect x="50" y="50" width="300" height="300" rx="20" fill="%232563eb" opacity="0.5"/><text x="200" y="220" font-size="120" text-anchor="middle" dy=".3em">🦸</text><text x="320" y="80" font-size="60" text-anchor="middle">⚡</text></svg>`,
};

const OFFLINE_STORIES: (StoryData & { image: string, tags: string[] })[] = [
  {
    title: "A Viagem Espacial do Miguel",
    content: "Miguel era um menino que adorava olhar as estrelas. Uma noite, seu foguete de brinquedo começou a brilhar e cresceu até ficar gigante!\nMiguel subiu as escadas, colocou seu capacete espacial e apertou o botão vermelho: 3, 2, 1, Decolar!\nEles voaram passando pela Lua, que parecia um queijo gigante, e deram tchau para os marcianos que comiam pipoca em Saturno.\nDepois de brincar de esconde-esconde nas nuvens de poeira estelar, Miguel sentiu sono. O foguete voltou suavemente para o quintal de casa.\nAo deitar na cama, Miguel sorriu, sabendo que o universo era seu grande quintal de brincadeiras.",
    moral: "A imaginação pode nos levar para lugares infinitos.",
    tags: ['espaço', 'lua', 'foguete', 'viagem'],
    image: OFFLINE_IMAGES.SPACE
  },
  {
    title: "O Dinossauro que Amava Dançar",
    content: "Na floresta antiga, vivia Dino, um T-Rex diferente. Enquanto todos os outros dinossauros rugiam alto, Dino gostava de sapatear.\n'Tum, tum, tá!', faziam seus pés grandes no chão. Os outros dinossauros achavam estranho, mas Dino não ligava.\nUm dia, uma grande tempestade deixou todos tristes e com medo na caverna. Dino teve uma ideia: começou a dançar uma música bem alegre.\nLogo, o Tricerátops começou a bater palmas e o Pterodáctilo começou a assobiar. A caverna virou uma grande festa!\nA chuva passou, mas a alegria ficou. Dino ensinou a todos que ser diferente é o que nos torna especiais.",
    moral: "Ser você mesmo traz alegria para todos ao redor.",
    tags: ['dino', 'dinossauro', 'floresta'],
    image: OFFLINE_IMAGES.DINO
  },
  {
    title: "O Ursinho que Perdeu o Sono",
    content: "O Ursinho Pimpão estava rolando na cama para lá e para cá. Ele não conseguia dormir!\nEle tentou contar ovelhinhas, mas elas pulavam a cerca e saíam correndo para brincar. Ele tentou beber leite morno, mas só ficou com bigode de leite.\nSua mãe entrou no quarto e disse: 'Pimpão, feche os olhos e pense na coisa mais macia do mundo'.\nPimpão pensou em nuvens de algodão doce. Pensou em um abraço de mãe. Pensou em pular em uma montanha de travesseiros.\nDevagarinho, sua respiração ficou calma. As nuvens de algodão o levaram para o mundo dos sonhos, onde ele dormiu a noite toda.",
    moral: "Relaxar e pensar em coisas boas ajuda a descansar.",
    tags: ['dormir', 'sono', 'urso', 'cama'],
    image: OFFLINE_IMAGES.BEAR
  },
   {
    title: "Miguel e o Resgate do Gatinho",
    content: "Miguel estava brincando de super-herói no parque quando ouviu um 'Miau!' vindo do alto de uma árvore.\nEra um gatinho preto, preso no galho mais alto, com medo de descer.\nMiguel colocou sua capa vermelha e pensou: 'O que um herói faria?'. Ele não podia voar de verdade, mas era muito esperto.\nEle correu, pediu ajuda para um bombeiro que passava e, juntos, colocaram uma escada na árvore.\nO bombeiro subiu e trouxe o gatinho em segurança. Miguel aprendeu que heróis de verdade sabem pedir ajuda quando precisam.",
    moral: "A verdadeira força está na bondade e na cooperação.",
    tags: ['polícia', 'bombeiro', 'herói', 'gato'],
    image: OFFLINE_IMAGES.HERO
  }
];

const getRandomOfflineStory = (topic: string): StoryData & { image: string } => {
  // Try to find a relevant story
  const relevant = OFFLINE_STORIES.filter(s => 
    s.tags.some(tag => topic.toLowerCase().includes(tag)) || 
    s.title.toLowerCase().includes(topic.toLowerCase())
  );
  
  if (relevant.length > 0) {
    return relevant[Math.floor(Math.random() * relevant.length)];
  }
  // Fallback to random
  return OFFLINE_STORIES[Math.floor(Math.random() * OFFLINE_STORIES.length)];
};

// --- API SERVICES ---

// NOTE: In a production environment, never expose keys on the client.
// However, per instructions, we use process.env.API_KEY.
// For Veo (Video), the user must select their own key via the UI.

export const generateStoryText = async (topic: string): Promise<StoryData> => {
  // OFFLINE CHECK
  if (!navigator.onLine) {
    console.log("Offline mode detected. Serving local story.");
    const offlineStory = getRandomOfflineStory(topic);
    // Store image for the next call
    sessionStorage.setItem('last_offline_image', offlineStory.image);
    return {
      title: offlineStory.title,
      content: offlineStory.content,
      moral: offlineStory.moral
    };
  }

  if (!process.env.API_KEY) throw new Error("API Key missing");
  
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const prompt = `
    Crie uma história para uma criança de 5 anos chamada Miguel.
    O tema deve envolver: ${topic}.
    
    Interesses do Miguel: Numberblocks, LEGO, Super-heróis, Polícia/Bombeiros, Futebol.
    
    A história deve ser positiva, envolvente e um pouco mais longa (aproximadamente 300 palavras) para preencher a hora de dormir.
    Use parágrafos curtos.
    A moral deve ser clara e educativa.
    
    Retorne APENAS JSON.
  `;

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
        systemInstruction: "Você é um contador de histórias mágico e gentil. Use uma linguagem rica, mas acessível para crianças, com toques de magia e aventura.",
      },
    });

    const text = response.text;
    if (!text) throw new Error("Falha ao gerar história");
    
    // Clear offline image key if we successfully got online content
    sessionStorage.removeItem('last_offline_image');
    return JSON.parse(text) as StoryData;
  } catch (error) {
    console.error("API Error, falling back to offline content", error);
    const offlineStory = getRandomOfflineStory(topic);
    sessionStorage.setItem('last_offline_image', offlineStory.image);
    return {
      title: offlineStory.title,
      content: offlineStory.content,
      moral: offlineStory.moral
    };
  }
};

export const generateStoryImage = async (storyPrompt: string): Promise<string> => {
  // OFFLINE CHECK
  if (!navigator.onLine) {
    return sessionStorage.getItem('last_offline_image') || OFFLINE_IMAGES.BEAR;
  }
  
  // Also check if we just served an offline story (stored in session)
  const storedOfflineImage = sessionStorage.getItem('last_offline_image');
  if (storedOfflineImage) {
     return storedOfflineImage;
  }

  if (!process.env.API_KEY) throw new Error("API Key missing");

  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  try {
    // Using the efficient flash-image model
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [
          { text: `Ilustração infantil de livro de histórias, cores vibrantes, estilo 3d render fofo, alta qualidade: ${storyPrompt.substring(0, 300)}` }
        ]
      },
      config: {
        imageConfig: {
          aspectRatio: "1:1",
        }
      }
    });

    // Extract image
    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        return `data:image/png;base64,${part.inlineData.data}`;
      }
    }
    throw new Error("No image data");
  } catch (error) {
    console.error("Image generation failed, using fallback", error);
    return OFFLINE_IMAGES.BEAR; // Generic fallback
  }
};

// VEO Video Generation
export const generateStoryVideo = async (imageBase64: string, prompt: string): Promise<string> => {
  if (!navigator.onLine) throw new Error("Precisa de internet para criar vídeo!");

  // Check for User Selected API Key for Veo (Paid feature)
  if (window.aistudio && await window.aistudio.hasSelectedApiKey()) {
     // Proceed
  } else if (window.aistudio) {
     await window.aistudio.openSelectKey();
  } else {
     // Fallback if not running in an environment with aistudio helper
     if (!process.env.API_KEY) throw new Error("API Key needed");
  }

  // Always re-init AI with potentially new key from selection
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  // Clean base64 header if present
  const cleanBase64 = imageBase64.split(',')[1];

  let operation = await ai.models.generateVideos({
    model: 'veo-3.1-fast-generate-preview',
    prompt: `Cinematic pan, magical movement, kid friendly: ${prompt}`,
    image: {
      imageBytes: cleanBase64,
      mimeType: 'image/png',
    },
    config: {
      numberOfVideos: 1,
      resolution: '720p',
      aspectRatio: '1:1' // Matching image
    }
  });

  // Poll for completion
  while (!operation.done) {
    await new Promise(resolve => setTimeout(resolve, 5000)); // Check every 5s
    operation = await ai.operations.getVideosOperation({operation: operation});
  }

  const videoUri = operation.response?.generatedVideos?.[0]?.video?.uri;
  if (!videoUri) throw new Error("Falha ao gerar vídeo");

  // Fetch the actual bytes
  const videoResponse = await fetch(`${videoUri}&key=${process.env.API_KEY}`);
  const blob = await videoResponse.blob();
  return URL.createObjectURL(blob);
};