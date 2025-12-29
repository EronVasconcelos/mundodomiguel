export enum AppRoute {
  WELCOME = '/welcome',
  PROFILE = '/profile-setup',
  HOME = '/',
  MATH = '/math',
  ART = '/art', 
  COLORING = '/coloring',
  CHALLENGE = '/challenge',
  WORDS = '/words',
  STORY = '/story',
  FAITH = '/faith',
  ARCADE = '/arcade',
  GAME_MEMORY = '/arcade/memory',
  GAME_SNAKE = '/arcade/snake',
  GAME_SPACE = '/arcade/space',
  GAME_RACING = '/arcade/racing',
}

export interface ChildProfile {
  name: string;
  age: number;
  gender: 'boy' | 'girl';
  hairColor: string;
  hairStyle: string;
  eyeColor: string;
  skinTone: string;
  avatarBase?: string; // Base64 or URL of the avatar created/selected
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
  devotional: string; 
  storyTitle: string;
  storyContent: string;
  prayer: string;
  imagePrompt?: string;
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