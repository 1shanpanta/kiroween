import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '@/utils/supabase';

interface AuthState {
  userId: string | null;
  email: string | null;
  username: string | null;
  isLoading: boolean;
  setUser: (email: string, username: string) => Promise<void>;
  loadUser: () => Promise<void>;
  logout: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  userId: null,
  email: null,
  username: null,
  isLoading: true,

  setUser: async (email: string, username: string) => {
    const { data, error } = await supabase
      .from('users')
      .upsert({ email, username }, { onConflict: 'email' })
      .select()
      .single();

    if (!error && data) {
      await AsyncStorage.setItem('userId', data.id);
      await AsyncStorage.setItem('email', email);
      await AsyncStorage.setItem('username', username);
      set({ userId: data.id, email, username });
    }
  },

  loadUser: async () => {
    const userId = await AsyncStorage.getItem('userId');
    const email = await AsyncStorage.getItem('email');
    const username = await AsyncStorage.getItem('username');
    set({ userId, email, username, isLoading: false });
  },

  logout: async () => {
    await AsyncStorage.multiRemove(['userId', 'email', 'username']);
    set({ userId: null, email: null, username: null });
  },
}));
