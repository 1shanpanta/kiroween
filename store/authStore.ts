import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '@/utils/supabase';

const EMAIL_STORAGE_KEY = '@pokedex_user_email';
const NAME_STORAGE_KEY = '@pokedex_user_name';
const USER_ID_STORAGE_KEY = '@pokedex_user_id';

interface AuthState {
  email: string | null;
  name: string | null;
  userId: string | null;
  loading: boolean;
  initialized: boolean;
  
  initialize: () => Promise<void>;
  setUser: (email: string, name: string) => Promise<void>;
  signOut: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  email: null,
  name: null,
  userId: null,
  loading: true,
  initialized: false,

  initialize: async () => {
    const storedEmail = await AsyncStorage.getItem(EMAIL_STORAGE_KEY);
    const storedName = await AsyncStorage.getItem(NAME_STORAGE_KEY);
    const storedUserId = await AsyncStorage.getItem(USER_ID_STORAGE_KEY);

    if (storedEmail && storedName) {
      set({
        email: storedEmail,
        name: storedName,
        userId: storedUserId,
        loading: false,
        initialized: true,
      });
    } else {
      set({
        loading: false,
        initialized: true,
      });
    }
  },

  setUser: async (email: string, name: string) => {
    if (!email.trim() || !name.trim()) {
      throw new Error('Email and name are required');
    }

    const { data, error } = await supabase
      .from('users')
      .upsert(
        {
          email: email.trim().toLowerCase(),
          username: name.trim(),
          updated_at: new Date().toISOString(),
        },
        {
          onConflict: 'email',
        }
      )
      .select()
      .single();

    if (error) throw error;
    if (!data) throw new Error('Failed to create/update user');

    const userId = data.id;

    await AsyncStorage.setItem(EMAIL_STORAGE_KEY, email.trim().toLowerCase());
    await AsyncStorage.setItem(NAME_STORAGE_KEY, name.trim());
    await AsyncStorage.setItem(USER_ID_STORAGE_KEY, userId);

    set({
      email: email.trim().toLowerCase(),
      name: name.trim(),
      userId: userId,
    });
  },

  signOut: async () => {
    await AsyncStorage.removeItem(EMAIL_STORAGE_KEY);
    await AsyncStorage.removeItem(NAME_STORAGE_KEY);
    await AsyncStorage.removeItem(USER_ID_STORAGE_KEY);

    set({
      email: null,
      name: null,
      userId: null,
    });
  },
}));
