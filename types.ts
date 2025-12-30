
export enum AppRoute {
  WELCOME = '/welcome',
  LOGIN = '/login',
  REGISTER = '/register',
  PROFILE = '/profile-setup',
  HOME = '/',
  MATH = '/math',
  ART = '/art', 
  COLORING = '/coloring',
  CHALLENGE = '/challenge',
  WORD_SEARCH = '/challenge/word-search',
  PUZZLE = '/challenge/puzzle',
  SHADOW = '/challenge/shadow', // New Route
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
  id: string; // UUID from Supabase
  user_id?: string; // Parent ID
  name: string;
  age: number;
  gender: 'boy' | 'girl';
  hairColor: string; // Mapped to snake_case in DB manually if needed, or keeping camelCase in logic
  hairStyle: string;
  eyeColor: string;
  skinTone: string;
  avatarBase?: string; 
  photoUrl?: string; // New field for real photo
}

export interface DailyProgress {
  profileId?: string; // Link to profile
  date: string;
  mathCount: number;      // Target: 20
  wordLevel: number;      // Target: 4
  faithDone: boolean;     // Target: true
  mazesSolved: number;    // Target: 3
  wordSearchSolved: number; // Target: 3
  puzzlesSolved: number;  // Target: 3
  shadowSolved: number;   // Target: 5 (New)
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
