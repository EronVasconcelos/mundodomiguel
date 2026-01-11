
import { DailyProgress } from '../types';
import { supabase } from './supabase';

const STORAGE_KEY_PREFIX = 'miguel_daily_progress_';

const GOALS = {
  MATH: 20,
  WORDS_LEVEL: 4,
  FAITH: true,
  MAZES: 3,
  WORD_SEARCH: 3,
  PUZZLES: 3,
  SHADOW: 5 // New Goal
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
        // Fix: Property names in DailyProgress interface are camelCase (wordSearchSolved, puzzlesSolved, shadowSolved)
        word_search_solved: progress.wordSearchSolved,
        puzzles_solved: progress.puzzlesSolved,
        shadow_solved: progress.shadowSolved,
        arcade_unlocked: true // Forçamos true no banco também
      }, { onConflict: 'profile_id, date' });

    if (error) console.error("Error syncing progress:", error.message);
  } catch (e) {
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
    if (parsed.date === today && parsed.profileId === profileId) {
      // Forçamos o desbloqueio mesmo em dados recuperados
      parsed.arcadeUnlocked = true;
      if (typeof parsed.wordSearchSolved === 'undefined') parsed.wordSearchSolved = 0;
      if (typeof parsed.puzzlesSolved === 'undefined') parsed.puzzlesSolved = 0;
      if (typeof parsed.shadowSolved === 'undefined') parsed.shadowSolved = 0;
      return parsed;
    }
  }

  const newProgress: DailyProgress = {
    profileId,
    date: today,
    mathCount: 0,
    wordLevel: 1,
    faithDone: false,
    mazesSolved: 0,
    wordSearchSolved: 0,
    puzzlesSolved: 0,
    shadowSolved: 0,
    arcadeUnlocked: true // Arcade sempre livre por padrão
  };
  
  localStorage.setItem(key, JSON.stringify(newProgress));
  return newProgress;
};

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
            wordSearchSolved: data.word_search_solved || 0,
            puzzlesSolved: data.puzzles_solved || 0,
            shadowSolved: data.shadow_solved || 0,
            arcadeUnlocked: true, // Forçamos true na recuperação remota
            profileId: data.profile_id
        };
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
  progress.profileId = profileId; 
  progress.arcadeUnlocked = true; // Garantia extra no salvamento
  const key = `${STORAGE_KEY_PREFIX}${profileId}`;
  localStorage.setItem(key, JSON.stringify(progress));
  syncToSupabase(progress);
};

export const checkUnlock = (progress: DailyProgress): boolean => {
  // Otimização Sênior: Retorno imediato sem necessidade de cálculos complexos
  return true;
};

export const incrementMath = (): boolean => {
  const p = getDailyProgress();
  if (p.mathCount < GOALS.MATH) {
    p.mathCount += 1;
    saveProgress(p);
    if (p.mathCount === GOALS.MATH) return true;
  }
  return false;
};

export const incrementWordSearch = (): boolean => {
  const p = getDailyProgress();
  const current = p.wordSearchSolved || 0;
  
  if (current < GOALS.WORD_SEARCH) {
    p.wordSearchSolved = current + 1;
    saveProgress(p);
    if (p.wordSearchSolved === GOALS.WORD_SEARCH) return true;
  }
  return false;
};

export const incrementPuzzle = (): boolean => {
  const p = getDailyProgress();
  const current = p.puzzlesSolved || 0;
  
  if (current < GOALS.PUZZLES) {
    p.puzzlesSolved = current + 1;
    saveProgress(p);
    if (p.puzzlesSolved === GOALS.PUZZLES) return true;
  }
  return false;
};

export const incrementShadow = (): boolean => {
  const p = getDailyProgress();
  const current = p.shadowSolved || 0;
  
  if (current < GOALS.SHADOW) {
    p.shadowSolved = current + 1;
    saveProgress(p);
    if (p.shadowSolved === GOALS.SHADOW) return true;
  }
  return false;
};

export const updateWordLevel = (level: number): boolean => {
  const p = getDailyProgress();
  if (level > p.wordLevel) {
    p.wordLevel = level;
    saveProgress(p);
    if (p.wordLevel === GOALS.WORDS_LEVEL) return true;
  }
  return false;
};

export const completeFaith = (): boolean => {
  const p = getDailyProgress();
  if (!p.faithDone) {
    p.faithDone = true;
    saveProgress(p);
    return true;
  }
  return false;
};

export const incrementMaze = (): boolean => {
  const p = getDailyProgress();
  if (p.mazesSolved < GOALS.MAZES) {
    p.mazesSolved += 1;
    saveProgress(p);
    if (p.mazesSolved === GOALS.MAZES) return true;
  }
  return false;
};

export const getGoals = () => GOALS;
