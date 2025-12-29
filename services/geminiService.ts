import { GoogleGenAI, Type, Modality } from "@google/genai";
import { StoryData, DevotionalData, ChildProfile } from '../types';

// --- OFFLINE CONTENT DATABASE ---
const OFFLINE_IMAGES = {
  SPACE: `data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400"><rect width="400" height="400" fill="%230f172a"/><circle cx="200" cy="200" r="160" fill="%231e293b"/><circle cx="50" cy="50" r="4" fill="white" opacity="0.8"/><circle cx="350" cy="350" r="4" fill="white" opacity="0.8"/><circle cx="100" cy="300" r="4" fill="white" opacity="0.8"/><text x="200" y="240" font-size="160" text-anchor="middle">🚀</text><text x="320" y="100" font-size="60" text-anchor="middle">⭐</text></svg>`,
  DINO: `data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400"><rect width="400" height="400" fill="%23ecfccb"/><circle cx="200" cy="200" r="160" fill="%23bef264"/><path d="M0 350 L400 350 L400 400 L0 400 Z" fill="%2365a30d"/><text x="200" y="240" font-size="180" text-anchor="middle">🦖</text><text x="320" y="120" font-size="80" text-anchor="middle">🌴</text></svg>`,
  CITY: `data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400"><rect width="400" height="400" fill="%23cbd5e1"/><rect x="50" y="150" width="100" height="250" fill="%2394a3b8"/><rect x="250" y="100" width="100" height="300" fill="%2364748b"/><text x="200" y="280" font-size="160" text-anchor="middle">🚓</text><text x="100" y="100" font-size="60" text-anchor="middle">🏙️</text></svg>`,
  SOCCER: `data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400"><rect width="400" height="400" fill="%234ade80"/><rect x="20" y="20" width="360" height="360" fill="none" stroke="white" stroke-width="8" opacity="0.6"/><circle cx="200" cy="200" r="60" fill="none" stroke="white" stroke-width="8" opacity="0.6"/><text x="200" y="250" font-size="180" text-anchor="middle">⚽</text></svg>`,
  LEGO: `data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400"><rect width="400" height="400" fill="%23fef3c7"/><rect x="100" y="100" width="200" height="200" rx="20" fill="%23ef4444"/><circle cx="150" cy="150" r="30" fill="%23b91c1c" opacity="0.3"/><circle cx="250" cy="150" r="30" fill="%23b91c1c" opacity="0.3"/><circle cx="150" cy="250" r="30" fill="%23b91c1c" opacity="0.3"/><circle cx="250" cy="250" r="30" fill="%23b91c1c" opacity="0.3"/><text x="200" y="240" font-size="120" text-anchor="middle">🏰</text></svg>`,
  SEA: `data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400"><rect width="400" height="400" fill="%23bae6fd"/><circle cx="200" cy="200" r="160" fill="%237dd3fc"/><text x="200" y="240" font-size="160" text-anchor="middle">🐙</text><text x="320" y="320" font-size="60" text-anchor="middle">🐟</text><text x="80" y="100" font-size="60" text-anchor="middle">🫧</text></svg>`,
  FOREST: `data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400"><rect width="400" height="400" fill="%23dcfce7"/><circle cx="200" cy="200" r="160" fill="%2386efac"/><text x="200" y="240" font-size="160" text-anchor="middle">🧺</text><text x="320" y="120" font-size="80" text-anchor="middle">🌳</text><text x="80" y="320" font-size="60" text-anchor="middle">🐜</text></svg>`,
  FIREMAN: `data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400"><rect width="400" height="400" fill="%23fee2e2"/><circle cx="200" cy="200" r="160" fill="%23fca5a5"/><text x="200" y="240" font-size="160" text-anchor="middle">🚒</text><text x="320" y="100" font-size="80" text-anchor="middle">🔥</text></svg>`,
  HERO: `data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400"><rect width="400" height="400" fill="%23dbeafe"/><path d="M200 20 L250 150 L380 150 L270 230 L320 380 L200 280 L80 380 L130 230 L20 150 L150 150 Z" fill="%2360a5fa" opacity="0.3"/><text x="200" y="240" font-size="160" text-anchor="middle">🦸</text><text x="320" y="80" font-size="60" text-anchor="middle">⚡</text></svg>`,
  NUMBERS: `data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400"><rect width="400" height="400" fill="%23f3f4f6"/><rect x="50" y="50" width="140" height="140" fill="%23f87171" rx="20"/><rect x="210" y="50" width="140" height="140" fill="%2360a5fa" rx="20"/><rect x="50" y="210" width="140" height="140" fill="%23facc15" rx="20"/><rect x="210" y="210" width="140" height="140" fill="%234ade80" rx="20"/><text x="200" y="260" font-size="120" text-anchor="middle">123</text></svg>`,
  PRAYER: `data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400"><rect width="400" height="400" fill="%23f0f9ff"/><circle cx="200" cy="200" r="150" fill="%23e0f2fe"/><path d="M200 100 L230 180 L310 180 L250 230 L270 310 L200 260 L130 310 L150 230 L90 180 L170 180 Z" fill="%23fde047" stroke="%23facc15" stroke-width="10"/><text x="200" y="350" font-size="60" text-anchor="middle">🙏</text></svg>`
};

const RAW_STORIES: Record<string, StoryData & { image: string }> = {
  "Polícia e Ladrão": {
    title: "O Policial Miguel e o Mistério dos Brinquedos",
    content: "Na cidade de Brinquelândia, tudo estava calmo, até que um mistério aconteceu: todos os carrinhos de corrida haviam sumido!\nO Policial Miguel, com seu uniforme azul brilhante e seu distintivo dourado, entrou em sua viatura super rápida. 'Nino-nino!', tocava a sirene enquanto ele patrulhava as ruas de tapete.\nEle encontrou pistas: marcas de pneus que levavam até debaixo da cama. Miguel ligou sua lanterna e entrou na caverna escura. Lá estava o 'Ladrão de Brinquedos' (que na verdade era o gato da família, o Sr. Bigodes) dormindo em cima de uma montanha de carrinhos.\nMiguel riu e conversou com o gato: 'Sr. Bigodes, devolver é o certo a fazer!'. O gato miou e empurrou os carrinhos de volta.\nO dia foi salvo! Miguel organizou o trânsito dos carrinhos e todos brincaram juntos em segurança.",
    moral: "Cuidar da nossa cidade e resolver problemas com calma faz de nós heróis.",
    image: OFFLINE_IMAGES.CITY
  },
  "Futebol de Robôs": {
    title: "A Grande Final: Robôs vs Aliens",
    content: "O estádio estava lotado de torcedores de metal e parafusos. Era a final da Copa Galáctica! De um lado, o time 'Raios de Aço', comandado pelo capitão Miguel. Do outro, os 'Aliens Saltitantes'.\nO juiz, um drone apitador, deu o início: Piuuu! A bola, que flutuava no ar, foi chutada pelo Robô Goleiro.\nMiguel controlava seu robô atacante com um controle remoto especial. Ele desviou de um alien verde, driblou um alien roxo e... Tibum! O robô tropeçou em uma peça solta.\nMas Miguel não desistiu. Ele consertou o robô rapidinho com sua chave de fenda mágica e voltou para o jogo. Faltando um minuto, Miguel apertou o botão turbo.\nO robô deu um chute de bicicleta, a bola brilhou como uma estrela e... GOOOL! Os robôs dançaram a dança do robô para comemorar.",
    moral: "Mesmo quando algo dá errado, consertar e tentar de novo nos leva à vitória.",
    image: OFFLINE_IMAGES.SOCCER
  },
  "Bombeiro Herói": {
    title: "O Resgate do Dragãozinho",
    content: "Miguel era o chefe dos bombeiros da Floresta Encantada. Seu caminhão vermelho era enorme e soltava bolhas de sabão em vez de fumaça.\nUm dia, o telefone tocou: 'Chefe Miguel! O bebê dragão espirrou fogo sem querer e prendeu a cauda na árvore mais alta!'.\nMiguel colocou seu capacete e correu para lá. O caminhão voou por cima do rio e chegou na montanha.\nO dragãozinho estava assustado. Miguel esticou a escada magica, que crescia, crescia e crescia até tocar as nuvens.\nCom muito cuidado, Miguel subiu. Ele não usou água para apagar o fogo, mas sim cócegas! Ele fez cócegas na barriga do dragão, que riu tanto que soltou a cauda da árvore.\nO dragão desceu no colo de Miguel e prometeu só espirrar fogo para acender velas de aniversário.",
    moral: "Ajudar quem está em apuros é a missão mais nobre de todas.",
    image: OFFLINE_IMAGES.FIREMAN
  },
  "Numberblocks na Praia": {
    title: "Uma Aventura Matemática no Mar",
    content: "O sol estava radiante na Praia dos Números. Miguel estava construindo um castelo de areia com seus amigos Numberblocks.\nO Número 1 achou uma concha linda. O Número 2 achou duas estrelas do mar. O Número 3 trouxe três baldes de água.\nDe repente, uma onda grande veio: Schuaaa! Ela queria derrubar o castelo.\n'Precisamos de uma barreira!', gritou Miguel. Ele chamou o Número 4, que se transformou em um quadrado forte e ficou na frente do castelo.\nA onda bateu no Número 4 e o castelo ficou seco! Todos comemoraram somando seus achados: 1 concha + 2 estrelas + 3 baldes = 6 tesouros da praia!\nEles aprenderam que, juntos, eles são sempre maiores e mais fortes.",
    moral: "Trabalhar em equipe soma nossas forças e multiplica a diversão.",
    image: OFFLINE_IMAGES.NUMBERS
  },
  "Castelo de LEGO": {
    title: "O Reino das Peças Coloridas",
    content: "No chão do quarto do Miguel, existia um reino que crescia a cada dia. Era o Reino de LEGOlândia.\nO Rei Miguel, com sua coroa de plástico amarelo, percebeu que o muro do castelo estava baixo. 'Cavaleiros, precisamos de mais peças vermelhas!', ordenou ele.\nOs cavaleiros procuraram na caixa mágica, mas só acharam peças azuis. 'O que faremos?', perguntou um soldado.\nMiguel teve uma ideia genial. 'Vamos fazer um castelo colorido!'. Eles misturaram azul com vermelho, amarelo com verde.\nO castelo ficou o mais bonito de todos, parecendo um arco-íris gigante. Um dragão de peças verdes veio visitar e achou tão bonito que decidiu ser o guardião do castelo, protegendo-o de pés descalços que poderiam pisar nas peças.",
    moral: "Usar a criatividade transforma o que temos em algo maravilhoso.",
    image: OFFLINE_IMAGES.LEGO
  },
  "Dinossauro Amigo": {
    title: "Dino, o Pescoçudo Prestativo",
    content: "Na Era dos Dinossauros, Miguel era um explorador que viajava no tempo. Ele conheceu Dino, um Braquiossauro com um pescoço muuuito comprido.\nDino estava triste porque seus amigos T-Rex brincavam de pega-pega, mas ele era muito grande e lento para correr.\nMiguel viu aquilo e disse: 'Dino, você tem um talento que ninguém mais tem!'.\nMiguel subiu nas costas de Dino e escorregou pelo seu pescoço como se fosse um tobogã. Foi muito divertido! Depois, Dino usou sua altura para pegar as frutas mais deliciosas no topo das árvores e dividir com todos.\nOs outros dinossauros perceberam que ter um amigo grande era a melhor coisa do mundo. Eles fizeram uma festa com frutas e escorregador!",
    moral: "Cada um de nós tem um talento único que serve para ajudar os amigos.",
    image: OFFLINE_IMAGES.DINO
  },
  "Viagem à Lua": {
    title: "Piquenique na Cratera Lunar",
    content: "3, 2, 1... Decolar! O foguete de papelão do Miguel tremeu e subiu, subiu, subiu até o céu ficar preto e cheio de pontinhos brilhantes.\nQuando pousaram na Lua, tudo era diferente. Miguel deu um passo e... Flutuuuou! Ele pulava e demorava para cair, como uma pena.\nEle encontrou um marciano verde que estava tentando comer um sanduíche, mas o queijo flutuava para longe. Miguel riu e ajudou o marciano a pegar o queijo com uma rede de caçar borboletas.\nComo agradecimento, o marciano mostrou a Miguel como a Terra é bonita vista de longe: uma bola azul e branca girando devagar.\nMiguel comeu seu lanche flutuante e voltou para casa, prometendo visitar seu novo amigo na próxima lua cheia.",
    moral: "O universo é cheio de amigos novos esperando para serem descobertos.",
    image: OFFLINE_IMAGES.SPACE
  },
  "Fundo do Mar": {
    title: "O Tubarão que Tinha Dor de Dente",
    content: "Miguel vestiu sua roupa de mergulho e pulou no mar azul. Glub, glub, glub! Ele viu peixinhos coloridos, uma tartaruga sábia e um polvo tocando bateria.\nMas, lá no fundo, ouviu um choro: 'Buááá!'. Era o Grande Tubarão Branco.\nTodos os peixes fugiram com medo, mas Miguel era corajoso. Ele nadou até o tubarão e perguntou: 'O que houve, Sr. Tubarão?'.\n'Tenho um dente doendo e não consigo comer alga!', disse o tubarão (que era vegetariano).\nMiguel olhou na boca gigante e viu uma pedrinha presa. Com cuidado, ele tirou a pedrinha. O tubarão sorriu aliviado e deu uma carona para Miguel em suas costas, nadando mais rápido que um torpedo por todo o oceano.",
    moral: "Ajudar os outros, mesmo quem parece assustador, cria grandes amizades.",
    image: OFFLINE_IMAGES.SEA
  },
  "Escola de Super-Heróis": {
    title: "O Super-Poder da Gentileza",
    content: "Era o primeiro dia de Miguel na Escola de Super-Heróis. Havia crianças que voavam, outras que ficavam invisíveis e algumas que levantavam carros com um dedo.\nMiguel ficou tímido. 'Eu não sei voar nem tenho super-força', pensou ele.\nNo recreio, o vilão 'Sr. Tristeza' apareceu e fez chover uma nuvem cinza sobre a escola. Os heróis fortes tentaram socar a nuvem, mas não adiantou. Os voadores tentaram soprar a nuvem, mas ela voltava.\nMiguel então se aproximou do Sr. Tristeza e ofereceu metade do seu biscoito de chocolate. 'Você quer ser meu amigo?', perguntou Miguel.\nO Sr. Tristeza parou de chorar, comeu o biscoito e sorriu. A nuvem cinza sumiu e o sol brilhou!\nO diretor da escola deu a Miguel a medalha de Ouro: ele tinha o poder mais forte de todos, a Gentileza.",
    moral: "A gentileza é o super-poder mais forte que existe para mudar o mundo.",
    image: OFFLINE_IMAGES.HERO
  },
  "Piquenique na Floresta": {
    title: "O Mistério da Cesta Desaparecida",
    content: "Miguel e sua família foram fazer um piquenique na floresta. Estenderam a toalha xadrez e colocaram bolo, suco e sanduíches.\nMiguel foi buscar sua bola e, quando voltou... Cadê o bolo? Só restavam farelos!\nEle pegou sua lupa de detetive e seguiu a trilha de farelos. Passou por baixo de uma samambaia, pulou um tronco caído e chegou a um formigueiro gigante.\nLá estavam as formigas, levando pedacinhos do bolo para a rainha. Miguel viu que elas trabalhavam muito duro e estavam com fome.\nEm vez de ficar bravo, Miguel deixou um pedaço de melancia para elas também. As formigas fizeram uma dança de agradecimento e Miguel aprendeu que a natureza compartilha tudo com quem observa com carinho.",
    moral: "Observar a natureza nos ensina a compartilhar e respeitar todos os seres.",
    image: OFFLINE_IMAGES.FOREST
  }
};

const GENERIC_BACKUP_STORY: StoryData & { image: string } = {
  title: "As Aventuras de Miguel",
  content: "Miguel é um menino muito curioso que adora descobrir coisas novas. Seja lendo um livro, brincando no parque ou desenhando, ele sempre encontra uma forma de se divertir.\nHoje, ele aprendeu que usar a imaginação é como ter uma chave mágica que abre portas para qualquer lugar do mundo. Ele pode ser um astronauta, um pirata ou um cientista, tudo isso sem sair do seu quarto.\nE você? O que quer imaginar hoje?",
  moral: "A imaginação é o brinquedo mais divertido que existe.",
  image: OFFLINE_IMAGES.HERO
};

// --- HELPER TO PERSONALIZE OFFLINE CONTENT ---
const personalizeText = (text: string, profile: ChildProfile) => {
  if (!text) return "";
  // Simple replacement of "Miguel" with child's name
  const regex = /Miguel/g;
  return text.replace(regex, profile.name);
}

export const getInstantStory = (topic: string, profile: ChildProfile): StoryData & { image: string } => {
  // Find raw story
  let rawStory = GENERIC_BACKUP_STORY;
  
  if (RAW_STORIES[topic]) {
    rawStory = RAW_STORIES[topic];
  } else {
    const normalizedTopic = topic.toLowerCase();
    const foundKey = Object.keys(RAW_STORIES).find(key => 
      key.toLowerCase().includes(normalizedTopic) || normalizedTopic.includes(key.toLowerCase())
    );
    if (foundKey) rawStory = RAW_STORIES[foundKey];
  }

  // Personalize
  return {
    title: personalizeText(rawStory.title, profile),
    content: personalizeText(rawStory.content, profile),
    moral: personalizeText(rawStory.moral, profile),
    image: rawStory.image
  };
};

// --- API SERVICES ---

export const generateStoryText = async (topic: string, profile: ChildProfile): Promise<StoryData> => {
  // If no key, fallback immediately
  if (!process.env.API_KEY) {
     const local = getInstantStory(topic, profile);
     sessionStorage.setItem('last_offline_image', local.image);
     return { title: local.title, content: local.content, moral: local.moral };
  }
  
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const prompt = `
    Crie uma história para uma criança chamada ${profile.name}.
    Idade: ${profile.age} anos.
    Gênero: ${profile.gender === 'boy' ? 'Menino' : 'Menina'}.
    O tema deve envolver: ${topic}.
    
    Interesses da criança: Numberblocks, LEGO, Super-heróis, Polícia/Bombeiros, Futebol.
    
    A história deve ser positiva, envolvente e um pouco mais longa (aproximadamente 300 palavras).
    Use parágrafos claros.
    A moral deve ser clara.
    
    Retorne APENAS JSON.
  `;

  // Helper to call API with error handling for 404
  const callModel = async (modelName: string) => {
    return await ai.models.generateContent({
      model: modelName,
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
  };

  try {
    let response;
    try {
      response = await callModel('gemini-3-flash-preview');
    } catch (e: any) {
      if (e.message?.includes('404') || e.status === 404) {
        response = await callModel('gemini-2.0-flash-exp');
      } else {
        throw e;
      }
    }

    const text = response.text;
    if (!text) throw new Error("Falha ao gerar história");
    
    sessionStorage.removeItem('last_offline_image');
    return JSON.parse(text) as StoryData;
  } catch (error) {
    console.error("API Error, falling back to offline content", error);
    const offlineStory = getInstantStory(topic, profile);
    sessionStorage.setItem('last_offline_image', offlineStory.image);
    return {
      title: offlineStory.title,
      content: offlineStory.content,
      moral: offlineStory.moral
    };
  }
};

// --- FAITH / DEVOTIONAL GENERATOR ---
export const generateDevotionalContent = async (profile: ChildProfile): Promise<DevotionalData> => {
  const today = new Date().toDateString();
  const stored = localStorage.getItem(`daily_devotional_${profile.name}`);
  
  // Offline Data customized
  const OFFLINE_DEVOTIONAL: DevotionalData = {
    date: today,
    verse: "O Senhor é o meu pastor; de nada terei falta.",
    reference: "Salmos 23:1",
    devotional: "Isso significa que Deus cuida de você como um pastor cuida de suas ovelhinhas. Ele garante que você tenha tudo o que precisa, como comida, família e amor. Você não precisa ter medo, porque Ele está sempre por perto!",
    storyTitle: `A Ovelhinha Perdida e ${profile.name}`,
    storyContent: `${profile.name} estava brincando de fazendinha. Havia muitas ovelhinhas, mas percebeu que a menorzinha sumiu! ${profile.name} procurou debaixo do sofá e achou. ${profile.name} ficou feliz, assim como Deus fica quando cuida da gente.`,
    prayer: "Querido Deus, obrigado por cuidar de mim. Amém.",
    imagePrompt: `A cute fluffy sheep hiding behind a pillow in a cozy child's room, soft lighting, pixar style, 3d render`
  };
  
  if (stored) {
    const parsed = JSON.parse(stored) as DevotionalData;
    if (parsed.date === today) {
      return parsed;
    }
  }

  if (!process.env.API_KEY) {
    return OFFLINE_DEVOTIONAL;
  }

  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const prompt = `
    Crie um devocional cristão diário para uma criança chamada ${profile.name}.
    Idade: ${profile.age} anos.
    
    Gere um objeto JSON com:
    1. 'verse': Um versículo bíblico curto e fácil de entender (NVI).
    2. 'reference': A referência bíblica (ex: Salmos 23:1).
    3. 'devotional': Uma explicação muito simples e carinhosa do versículo para uma criança.
    4. 'storyTitle': Título de uma história curta.
    5. 'storyContent': Uma história curta (aprox 150 palavras) onde ${profile.name} aplica o ensinamento do versículo no dia a dia.
    6. 'prayer': Uma oração curta de 2 frases para ${profile.name} repetir.
    7. 'imagePrompt': Um prompt em inglês para gerar uma imagem 3D estilo Pixar relacionada à história. PERSONAGEM: ${profile.age} year old ${profile.gender}, ${profile.hairColor} ${profile.hairStyle} hair, ${profile.eyeColor} eyes, ${profile.skinTone} skin.

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
    if (!text) throw new Error("Falha na API");
    
    const data = JSON.parse(text) as Omit<DevotionalData, 'date'>;
    const finalData: DevotionalData = { ...data, date: today };
    
    localStorage.setItem(`daily_devotional_${profile.name}`, JSON.stringify(finalData));
    
    return finalData;

  } catch (error) {
    console.error("Faith API Error", error);
    return OFFLINE_DEVOTIONAL;
  }
};

// --- AUDIO GENERATION (TTS) ---
export const generateDevotionalAudio = async (text: string): Promise<string | null> => {
  if (!process.env.API_KEY) return null;

  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-preview-tts',
      contents: { parts: [{ text: text }] },
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: 'Fenrir' },
          },
        },
      },
    });

    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        return part.inlineData.data;
      }
    }
    return null;
  } catch (error) {
    console.error("TTS Generation failed:", error);
    return null;
  }
};


export const generateStoryImage = async (storyPrompt: string, profile?: ChildProfile): Promise<string> => {
  const storedOfflineImage = sessionStorage.getItem('last_offline_image');
  if (storedOfflineImage) {
     return storedOfflineImage;
  }

  if (!process.env.API_KEY) return OFFLINE_IMAGES.HERO;

  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  try {
    // Inject Character Appearance into prompt if profile exists
    let characterDesc = "";
    if (profile) {
        characterDesc = `Main Character is a ${profile.age} year old cute ${profile.gender}, having ${profile.hairColor} ${profile.hairStyle} hair, ${profile.eyeColor} eyes, ${profile.skinTone} skin tone.`;
    }

    const prompt = `Masterpiece 3D render, cute styling, Pixar style, Disney animation style, 8k resolution, unreal engine 5 render, cinematic lighting, volumetric light, highly detailed 3D textures, vivid colors, peaceful, biblical or moral theme if applicable. ${characterDesc} Scene: ${storyPrompt.substring(0, 300)}`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [
          { text: prompt }
        ]
      },
      config: { imageConfig: { aspectRatio: "1:1" } }
    });

    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        return `data:image/png;base64,${part.inlineData.data}`;
      }
    }
    throw new Error("No image data");
  } catch (error) {
    return OFFLINE_IMAGES.HERO;
  }
};

export const generateStoryVideo = async (imageBase64: string, prompt: string): Promise<string> => {
  if (!navigator.onLine) throw new Error("Offline");

  if (window.aistudio && await window.aistudio.hasSelectedApiKey()) {
     // OK
  } else if (window.aistudio) {
     await window.aistudio.openSelectKey();
  } else {
     if (!process.env.API_KEY) throw new Error("No API Key");
  }

  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const cleanBase64 = imageBase64.split(',')[1];

  try {
    let operation = await ai.models.generateVideos({
      model: 'veo-3.1-fast-generate-preview',
      prompt: `Cinematic pan, magical movement, 3d animation style, kid friendly: ${prompt}`,
      image: { imageBytes: cleanBase64, mimeType: 'image/png' },
      config: { numberOfVideos: 1, resolution: '720p', aspectRatio: '1:1' }
    });

    while (!operation.done) {
      await new Promise(resolve => setTimeout(resolve, 5000));
      operation = await ai.operations.getVideosOperation({operation: operation});
    }

    const videoUri = operation.response?.generatedVideos?.[0]?.video?.uri;
    if (!videoUri) throw new Error("Falha na geração");

    const videoResponse = await fetch(`${videoUri}&key=${process.env.API_KEY}`);
    const blob = await videoResponse.blob();
    return URL.createObjectURL(blob);
  } catch (error: any) {
    if (error.message?.includes('404') || error.status === 404) {
      throw new Error("Vídeos indisponíveis neste dispositivo.");
    }
    throw error;
  }
};