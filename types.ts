
export enum AppRoute {
  WELCOME = '/welcome',
  LOGIN = '/login',
  REGISTER = '/register',
  PROFILE = '/profile-setup',
  HOME = '/',
  MATH = '/math',
  ART = '/art', 
  COLORING = '/coloring',
  CHALLENGE_HUB = '/challenge-hub',
  CHALLENGE = '/challenge', 
  WORD_SEARCH = '/challenge/word-search',
  PUZZLE = '/challenge/puzzle',
  SHADOW = '/challenge/shadow',
  WORDS = '/words',
  STORY = '/story',
  FAITH = '/faith',
  ARCADE = '/arcade',
  GAME_MEMORY = '/arcade/memory',
  GAME_SNAKE = '/arcade/snake',
  GAME_SPACE = '/arcade/space',
  GAME_RACING = '/arcade/racing',
  GAME_BLOCKS = '/arcade/blocks',
}

export interface ChildProfile {
  id: string;
  user_id?: string;
  name: string;
  age: number;
  gender: 'boy' | 'girl';
  hairColor: string;
  hairStyle: string;
  eyeColor: string;
  skinTone: string;
  avatarBase?: string; 
  photoUrl?: string;
}

export interface DailyProgress {
  profileId?: string;
  date: string;
  mathCount: number;
  wordLevel: number;
  faithDone: boolean;
  mazesSolved: number;
  wordSearchSolved: number;
  puzzlesSolved: number;
  shadowSolved: number;
  // Added missing property used in progressService.ts
  memorySolved: number;
  arcadeUnlocked: boolean;
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
