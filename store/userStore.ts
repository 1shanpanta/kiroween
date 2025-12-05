import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '@/utils/supabase';
import { useAuthStore } from './authStore';

interface UserState {
  totalPoints: number;
  completedChallengesCount: number;
  
  addPoints: (points: number) => Promise<void>;
  getTotalPoints: () => number;
  loadUserStats: () => Promise<void>;
  resetStats: () => Promise<void>;
  setCompletedChallengesCount: (count: number) => Promise<void>;
}

const POINTS_STORAGE_KEY = '@pokedex_user_points';
const COMPLETED_CHALLENGES_KEY = '@pokedex_completed_challenges_count';

const DEFAULT_STATE = {
  totalPoints: 0,
  completedChallengesCount: 0,
};

export const useUserStore = create<UserState>((set, get) => ({
  ...DEFAULT_STATE,

  addPoints: async (points: number) => {
    const newTotal = get().totalPoints + points;
    set({ totalPoints: newTotal });
    await AsyncStorage.setItem(POINTS_STORAGE_KEY, JSON.stringify(newTotal));
  },

  getTotalPoints: () => {
    return get().totalPoints;
  },

  loadUserStats: async () => {
    const userId = useAuthStore.getState().userId;
    
    if (userId) {
      const { data, error } = await supabase
        .from('users')
        .select('total_points')
        .eq('id', userId)
        .single();
      
      if (!error && data) {
        const points = data.total_points || 0;
        set({ totalPoints: points });
        await AsyncStorage.setItem(POINTS_STORAGE_KEY, JSON.stringify(points));
        
        const { data: completedData } = await supabase
          .from('user_challenges')
          .select('id', { count: 'exact' })
          .eq('user_id', userId);
        
        if (completedData) {
          const count = completedData.length || 0;
          set({ completedChallengesCount: count });
          await AsyncStorage.setItem(COMPLETED_CHALLENGES_KEY, JSON.stringify(count));
        }
        return;
      }
    }
    
    const storedPoints = await AsyncStorage.getItem(POINTS_STORAGE_KEY);
    const storedCount = await AsyncStorage.getItem(COMPLETED_CHALLENGES_KEY);
    
    if (storedPoints) {
      const points = parseInt(JSON.parse(storedPoints), 10) || 0;
      set({ totalPoints: points });
    }
    
    if (storedCount) {
      const count = parseInt(JSON.parse(storedCount), 10) || 0;
      set({ completedChallengesCount: count });
    }
  },

  resetStats: async () => {
    set(DEFAULT_STATE);
    await AsyncStorage.removeItem(POINTS_STORAGE_KEY);
    await AsyncStorage.removeItem(COMPLETED_CHALLENGES_KEY);
  },

  setCompletedChallengesCount: async (count: number) => {
    set({ completedChallengesCount: count });
    await AsyncStorage.setItem(COMPLETED_CHALLENGES_KEY, JSON.stringify(count));
  },
}));

useUserStore.getState().loadUserStats();
