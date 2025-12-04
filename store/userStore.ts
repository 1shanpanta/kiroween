import { create } from 'zustand';
import { supabase } from '@/utils/supabase';

interface UserStats {
  total_points: number;
  total_scans: number;
  mythic_count: number;
}

interface UserState {
  stats: UserStats;
  loadStats: (userId: string) => Promise<void>;
}

export const useUserStore = create<UserState>((set) => ({
  stats: {
    total_points: 0,
    total_scans: 0,
    mythic_count: 0,
  },

  loadStats: async (userId: string) => {
    const { data: user } = await supabase
      .from('users')
      .select('total_points')
      .eq('id', userId)
      .single();

    const { count: totalScans } = await supabase
      .from('collections')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId);

    const { count: mythicCount } = await supabase
      .from('collections')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('rarity_tier', 'MYTHIC');

    set({
      stats: {
        total_points: user?.total_points || 0,
        total_scans: totalScans || 0,
        mythic_count: mythicCount || 0,
      },
    });
  },
}));
