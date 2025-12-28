export enum AppRoute {
  HOME = '/',
  MATH = '/math',
  ART = '/art', // Free draw (Lousa)
  COLORING = '/coloring', // Coloring Book (Templates + Bucket)
  CHALLENGE = '/challenge',
  WORDS = '/words', // New Word Learning module
  STORY = '/story',
}

export interface StoryData {
  title: string;
  content: string;
  moral: string;
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
}