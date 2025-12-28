import { GoogleGenAI, Type } from "@google/genai";
import { StoryData } from '../types';

// NOTE: In a production environment, never expose keys on the client.
// However, per instructions, we use process.env.API_KEY.
// For Veo (Video), the user must select their own key via the UI.

export const generateStoryText = async (topic: string): Promise<StoryData> => {
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
  
  return JSON.parse(text) as StoryData;
};

export const generateStoryImage = async (storyPrompt: string): Promise<string> => {
  if (!process.env.API_KEY) throw new Error("API Key missing");

  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  // Using the efficient flash-image model
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash-image',
    contents: {
      parts: [
        { text: `Ilustração infantil de livro de histórias, cores vibrantes, estilo 3d render fofo, alta qualidade: ${storyPrompt}` }
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
  
  throw new Error("Não foi possível gerar a imagem");
};

// VEO Video Generation
export const generateStoryVideo = async (imageBase64: string, prompt: string): Promise<string> => {
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