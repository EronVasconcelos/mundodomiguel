import { DailyProgress } from '../types';
import { supabase } from './supabase';

const STORAGE_KEY_PREFIX = 'miguel_daily_progress_';

const GOALS = {
  MATH: 30,
  WORDS_LEVEL: 4,
  FAITH: true,
  MAZES: 3
};

// Helper to get active profile ID
const getActiveProfileId = () => {
  return localStorage.getItem('active_profile_id') || 'guest';
};

// Helper to sync to Supabase (Fire and Forget)
const syncToSupabase = async (progress: DailyProgress) => {
  const profileId = getActiveProfileId();
  if (profileId === 'guest' || !profileId) return;

  try {
    const { error } = await supabase
      .from('daily_progress')
      .upsert({
        profile_id: profileId,
        date: progress.date,
        math_count: progress.mathCount,
        word_level: progress.wordLevel,
        faith_done: progress.faithDone,
        mazes_solved: progress.mazesSolved,
        arcade_unlocked: progress.arcadeUnlocked
      }, { onConflict: 'profile_id, date' });

    if (error) console.error("Error syncing progress:", error.message);
  } catch (e) {
    // Silent fail for sync
    console.warn("Sync failed (offline or misconfigured)");
  }
};

export const getDailyProgress = (): DailyProgress => {
  const today = new Date().toDateString();
  const profileId = getActiveProfileId();
  const key = `${STORAGE_KEY_PREFIX}${profileId}`;
  
  const stored = localStorage.getItem(key);
  
  if (stored) {
    const parsed = JSON.parse(stored) as DailyProgress;
    // Check if it's a new day
    if (parsed.date === today) {
      return parsed;
    }
  }

  // Reset for new day
  const newProgress: DailyProgress = {
    profileId,
    date: today,
    mathCount: 0,
    wordLevel: 1,
    faithDone: false,
    mazesSolved: 0,
    arcadeUnlocked: false
  };
  
  localStorage.setItem(key, JSON.stringify(newProgress));
  // We don't sync empty new day immediately to avoid spam, wait for first action
  return newProgress;
};

// Function called by Home.tsx to fetch latest from cloud on load
export const fetchRemoteProgress = async (): Promise<DailyProgress | null> => {
  const profileId = getActiveProfileId();
  if (profileId === 'guest') return null;
  
  const today = new Date().toDateString();

  try {
    const { data, error } = await supabase
        .from('daily_progress')
        .select('*')
        .eq('profile_id', profileId)
        .eq('date', today)
        .single();

    if (error) return null;

    if (data) {
        const remoteProgress: DailyProgress = {
            date: data.date,
            mathCount: data.math_count,
            wordLevel: data.word_level,
            faithDone: data.faith_done,
            mazesSolved: data.mazes_solved,
            arcadeUnlocked: data.arcade_unlocked,
            profileId: data.profile_id
        };
        // Update local storage to match cloud
        const key = `${STORAGE_KEY_PREFIX}${profileId}`;
        localStorage.setItem(key, JSON.stringify(remoteProgress));
        return remoteProgress;
    }
  } catch (e) {
      console.warn("Fetch remote progress failed", e);
  }
  return null;
};

const saveProgress = (progress: DailyProgress) => {
  const profileId = getActiveProfileId();
  const key = `${STORAGE_KEY_PREFIX}${profileId}`;
  localStorage.setItem(key, JSON.stringify(progress));
  syncToSupabase(progress);
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