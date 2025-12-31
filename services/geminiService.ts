
import { GoogleGenAI, Type, Modality } from "@google/genai";
import { StoryData, DevotionalData, ChildProfile } from '../types';

// --- DADOS DE FALLBACK (OFFLINE/MOCK) ---
const STATIC_STORY_IMAGE = "https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?q=80&w=1000&auto=format&fit=crop"; 
const STATIC_DEVOTIONAL_IMAGE = "https://images.unsplash.com/photo-1491841550275-ad7854e35ca6?q=80&w=1000&auto=format&fit=crop"; 

// --- BIBLIOTECA ESTÁTICA (LIVRO KIDS) ---
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
    content: "Numa fazenda, nasceu um patinho diferente dos outros. Ele era grande e cinzento, e todos o chamavam de 'Patinho Feio'. Triste, ele fugiu e passou o inverno sozinho e com frio.\n\nQuando a primavera chegou, ele viu lindos cisnes no lago e foi até eles, esperando ser rejeitado. Mas, ao olhar seu reflexo na água, teve uma surpresa: ele não era um pato, mas sim um belo cisne! Ele agora tinha amigos e era muito feliz.",
    moral: "A verdadeira beleza está dentro de nós e leva tempo para florescer. Não julgue pelas aparências."
  },
  {
    title: "Chapeuzinho Vermelho",
    content: "Chapeuzinho Vermelho foi levar doces para a vovozinha. No caminho, encontrou o Lobo Mau, que a enganou e chegou primeiro na casa da vovó.\n\nO Lobo se vestiu com as roupas da vovó. Quando Chapeuzinho chegou, estranhou: 'Que orelhas grandes, vovó!'. 'São para te ouvir melhor', disse o Lobo. Quando o Lobo tentou pegar Chapeuzinho, um caçador que passava por ali ouviu os gritos, entrou na casa e salvou a vovó e a netinha.",
    moral: "Devemos ter cuidado com estranhos e obedecer aos conselhos dos nossos pais."
  },
  {
    title: "O Leão e o Ratinho",
    content: "Um leão dormia quando um ratinho começou a correr em cima dele. O leão acordou bravo e prendeu o ratinho. 'Por favor, me solte!', pediu o ratinho. 'Um dia poderei ajudá-lo'. O leão riu, mas o soltou.\n\nTempos depois, o leão caiu numa rede de caçadores. Ele rugiu alto, e o ratinho ouviu. O pequeno rato roeu as cordas da rede até soltar o grande leão. O leão aprendeu uma grande lição.",
    moral: "Nenhum ato de gentileza é em vão, e tamanho não é documento."
  },
  {
    title: "João e o Pé de Feijão",
    content: "João trocou sua vaquinha por feijões mágicos. Sua mãe ficou brava e jogou os feijões fora. No dia seguinte, um pé de feijão gigante cresceu até o céu!\n\nJoão subiu e encontrou um castelo de um gigante mal-humorado que tinha uma galinha que botava ovos de ouro. João pegou a galinha para ajudar sua família pobre, desceu correndo e cortou o pé de feijão. O gigante não conseguiu descer, e João e sua mãe viveram felizes.",
    moral: "Coragem e criatividade podem nos ajudar a superar grandes dificuldades."
  },
  {
    title: "A Cigarra e a Formiga",
    content: "No verão, a Cigarra só cantava, enquanto a Formiga trabalhava carregando folhas para o inverno. 'Por que trabalha tanto?', perguntava a Cigarra. 'Venha cantar comigo!'. A Formiga continuou seu trabalho.\n\nQuando o inverno chegou, a Cigarra estava com frio e fome. Ela bateu na porta da Formiga pedindo ajuda. A Formiga a acolheu, deu sopa quentinha, mas ensinou: 'Houve tempo de cantar, mas também é preciso trabalhar para garantir o futuro'.",
    moral: "É preciso equilibrar diversão com responsabilidade e preparar-se para o futuro."
  },
  {
    title: "Pinóquio",
    content: "Gepeto, um carpinteiro, fez um boneco de madeira chamado Pinóquio e desejou que ele fosse um menino de verdade. A Fada Azul deu vida ao boneco, mas disse que ele precisava ser bravo, verdadeiro e generoso.\n\nToda vez que Pinóquio mentia, seu nariz crescia! Ele se meteu em muitas confusões e até foi engolido por uma baleia ao tentar salvar Gepeto. Por provar seu amor e coragem, a Fada o transformou em um menino de verdade.",
    moral: "A mentira tem perna curta. O amor e a verdade nos tornam reais."
  },
  {
    title: "O Menino que Gritava Lobo",
    content: "Um pastorzinho cuidava de ovelhas e, para se divertir, gritava: 'Socorro! O Lobo!'. Os camponeses corriam para ajudar, e ele ria, dizendo que era mentira.\n\nUm dia, um lobo apareceu de verdade. O menino gritou desesperado: 'Lobo! Lobo!'. Mas ninguém veio, pois acharam que era outra mentira. O menino aprendeu a lição da pior maneira.",
    moral: "Ninguém acredita num mentiroso, mesmo quando ele diz a verdade."
  },
  {
    title: "Cinderela",
    content: "Cinderela era uma jovem bondosa tratada como empregada pela madrasta. Um dia, houve um baile no castelo. Sua Fada Madrinha apareceu e transformou uma abóbora em carruagem e seus trapos em um lindo vestido, mas avisou: 'O feitiço acaba à meia-noite'.\n\nNo baile, o Príncipe se apaixonou por ela. À meia-noite, Cinderela fugiu e perdeu seu sapatinho de cristal. O Príncipe procurou a dona do sapato pelo reino todo, até encontrar Cinderela e se casarem.",
    moral: "A bondade e a esperança são recompensadas, não importa quão difícil seja a situação."
  }
];

const FALLBACK_STORY: StoryData = STATIC_STORIES[0];

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

// --- ACESSO ROBUSTO À CHAVE ---
const getApiKey = () => {
  // A chave de API DEVE ser obtida EXCLUSIVAMENTE da variável de ambiente process.env.API_KEY.
  // NENHUMA UI ou lógica de armazenamento local (localStorage) para a chave de API é permitida.
  try {
    if (typeof process !== 'undefined' && process.env && process.env.API_KEY) {
      return process.env.API_KEY;
    }
  } catch (e) {
    console.warn("process.env não está disponível no ambiente. A chave de API pode não ser carregada.", e);
  }
  return '';
};

// Verifica se a IA está disponível para uso
export const isAIAvailable = (): boolean => {
    return !!getApiKey();
};

export const generateStoryText = async (topic: string, profile: ChildProfile): Promise<StoryData> => {
  const apiKey = getApiKey();
  
  if (!apiKey) {
    throw new Error("IA Indisponível");
  }
  
  const ai = new GoogleGenAI({ apiKey });
  const prompt = `Você é um contador de histórias mágico. Crie uma história infantil muito curta, cativante e educativa para ${profile.name}, uma criança de ${profile.age} anos. 
  Tema: ${topic}.
  A história deve ter começo, meio e fim claros.
  Retorne APENAS um JSON estrito com as chaves: "title", "content", "moral". Sem formatação markdown.`;

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
    
    if (response.text) {
        return JSON.parse(response.text) as StoryData;
    }
    throw new Error("Resposta vazia da IA");
  } catch (error) {
    console.error("Erro AI Texto:", error);
    throw error;
  }
};

export const generateDevotionalContent = async (profile: ChildProfile): Promise<DevotionalData> => {
  const apiKey = getApiKey();
  
  if (!apiKey) {
      return FALLBACK_DEVOTIONAL;
  }

  const ai = new GoogleGenAI({ apiKey });
  const prompt = `Crie um devocional cristão curto e simples para uma criança de ${profile.age} anos chamada ${profile.name}.
  Retorne JSON estrito: verse (versículo), reference (referência), devotional (explicação simples), storyTitle (titulo historia), storyContent (historia biblica curta), prayer (oração), imagePrompt (descrição VISUAL APENAS da cena, sem textos).`;

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

export const generateDevotionalAudio = async (text: string, gender: 'boy' | 'girl' = 'boy'): Promise<string | null> => {
  const apiKey = getApiKey();
  if (!apiKey) return null;

  const voiceName = gender === 'girl' ? 'Kore' : 'Fenrir';

  const ai = new GoogleGenAI({ apiKey });
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-preview-tts',
      contents: { parts: [{ text: text }] },
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: { 
          voiceConfig: { prebuiltVoiceConfig: { voiceName: voiceName } } 
        },
      },
    });
    return response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data || null;
  } catch (error) { 
    console.error("Erro AI Audio:", error);
    return null; 
  }
};

export const generateStoryImage = async (storyPrompt: string, profile?: ChildProfile): Promise<string | null> => {
  const apiKey = getApiKey();
  if (!apiKey) return null;

  const ai = new GoogleGenAI({ apiKey });
  
  const charDesc = profile ? `a cute ${profile.age} year old ${profile.gender} with ${profile.hairColor} hair and ${profile.skinTone} skin` : "a cute child";
  
  // Prompt refinado para estilo 3D Pixar
  const enhancedPrompt = `
  Disney Pixar animation style, 3D render.
  Subject: ${charDesc}.
  Scene: ${storyPrompt.substring(0, 250)}.
  Style: Cute, magical, vibrant colors, soft cinematic lighting, volumetric light, masterpiece, high detail.
  Negative prompt: text, watermark, letters, signature, typography, blurry, distorted, low quality, ugly.
  IMPORTANT: NO TEXT IN IMAGE.
  `;

  try {
    // 1. TENTATIVA PRINCIPAL: Imagen 3 (Melhor para geração de imagem pura)
    // O modelo Imagen é especializado em imagens e geralmente respeita melhor o estilo solicitado.
    const response = await ai.models.generateImages({
      model: 'imagen-3.0-generate-001', 
      prompt: enhancedPrompt,
      config: {
        numberOfImages: 1,
        aspectRatio: '1:1',
        outputMimeType: 'image/jpeg',
      },
    });

    if (response.generatedImages?.[0]?.image?.imageBytes) {
      return `data:image/jpeg;base64,${response.generatedImages[0].image.imageBytes}`;
    }
  } catch (imagenError) {
    console.warn("Imagen 3 falhou, tentando fallback Gemini...", imagenError);

    // 2. FALLBACK: Gemini 2.5 Flash Image (Multimodal)
    // Caso a chave não tenha acesso ao Imagen ou ocorra erro, usamos o Gemini.
    try {
        const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: { parts: [{ text: enhancedPrompt }] },
        config: { 
            imageConfig: { aspectRatio: "1:1" } 
        }
        });
        
        // Varredura robusta para encontrar a parte da imagem na resposta
        if (response.candidates?.[0]?.content?.parts) {
            for (const part of response.candidates[0].content.parts) {
                if (part.inlineData && part.inlineData.data) {
                    return `data:image/png;base64,${part.inlineData.data}`;
                }
            }
        }
    } catch (geminiError) {
        console.error("Erro fatal na geração de imagem (ambos modelos falharam):", geminiError);
    }
  }
  
  return null;
};

// Exports for UI Fallbacks
export const getFallbackStoryImage = () => STATIC_STORY_IMAGE;
export const getFallbackDevotionalImage = () => STATIC_DEVOTIONAL_IMAGE;
