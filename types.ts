export enum AppRoute {
  HOME = '/',
  MATH = '/math',
  ART = '/art', // Free draw (Lousa)
  COLORING = '/coloring', // Coloring Book (Templates + Bucket)
  CHALLENGE = '/challenge',
  WORDS = '/words', // New Word Learning module
  STORY = '/story',
  FAITH = '/faith', // New Faith Corner
  ARCADE = '/arcade',
  GAME_MEMORY = '/arcade/memory',
  GAME_SNAKE = '/arcade/snake',
  GAME_SPACE = '/arcade/space',
  GAME_RACING = '/arcade/racing',
}

export interface StoryData {
  title: string;
  content: string;
  moral: string;
}

export interface DevotionalData {
  date: string;
  verse: string;
  reference: string;
  devotional: string; // Explanation for the child
  storyTitle: string;
  storyContent: string;
  prayer: string;
  imagePrompt?: string; // Prompt for the image generation
}

export interface MathBlock {
  id: string;
  value: number;
  color: string;
}

export enum GameState {
  IDLE,
  PLAYING,
  WON,
  GAME_OVER
}