import { DailyProgress } from '../types';

const STORAGE_KEY = 'miguel_daily_progress';

const GOALS = {
  MATH: 30,
  WORDS_LEVEL: 4,
  FAITH: true,
  MAZES: 3
};

export const getDailyProgress = (): DailyProgress => {
  const today = new Date().toDateString();
  const stored = localStorage.getItem(STORAGE_KEY);
  
  if (stored) {
    const parsed = JSON.parse(stored) as DailyProgress;
    // Check if it's a new day
    if (parsed.date === today) {
      return parsed;
    }
  }

  // Reset for new day
  const newProgress: DailyProgress = {
    date: today,
    mathCount: 0,
    wordLevel: 1,
    faithDone: false,
    mazesSolved: 0,
    arcadeUnlocked: false
  };
  saveProgress(newProgress);
  return newProgress;
};

const saveProgress = (progress: DailyProgress) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
};

export const checkUnlock = (progress: DailyProgress): boolean => {
  if (progress.arcadeUnlocked) return true;

  const isUnlocked = 
    progress.mathCount >= GOALS.MATH &&
    progress.wordLevel >= GOALS.WORDS_LEVEL &&
    progress.faithDone === true &&
    progress.mazesSolved >= GOALS.MAZES;

  if (isUnlocked) {
    progress.arcadeUnlocked = true;
    saveProgress(progress);
  }
  
  return isUnlocked;
};

export const incrementMath = () => {
  const p = getDailyProgress();
  p.mathCount += 1;
  checkUnlock(p);
  saveProgress(p);
};

export const updateWordLevel = (level: number) => {
  const p = getDailyProgress();
  if (level > p.wordLevel) {
    p.wordLevel = level;
    checkUnlock(p);
    saveProgress(p);
  }
};

export const completeFaith = () => {
  const p = getDailyProgress();
  if (!p.faithDone) {
    p.faithDone = true;
    checkUnlock(p);
    saveProgress(p);
  }
};

export const incrementMaze = () => {
  const p = getDailyProgress();
  p.mazesSolved += 1;
  checkUnlock(p);
  saveProgress(p);
};

export const getGoals = () => GOALS;