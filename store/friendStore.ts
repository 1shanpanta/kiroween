import { create } from 'zustand';
import { supabase } from '@/utils/supabase';

interface Friend {
  id: string;
  username: string;
  total_points: number;
}

interface FriendState {
  friends: Friend[];
  leaderboard: Friend[];
  loadFriends: (userId: string) => Promise<void>;
  loadLeaderboard: () => Promise<void>;
  addFriend: (userId: string, friendId: string) => Promise<void>;
}

export const useFriendStore = create<FriendState>((set) => ({
  friends: [],
  leaderboard: [],

  loadFriends: async (userId: string) => {
    const { data } = await supabase
      .from('friendships')
      .select('friend_id, users!friendships_friend_id_fkey(id, username, total_points)')
      .eq('user_id', userId)
      .eq('status', 'accepted');

    if (data) {
      const friends = data.map(f => f.users).filter(Boolean);
      set({ friends });
    }
  },

  loadLeaderboard: async () => {
    const { data } = await supabase
      .from('users')
      .select('id, username, total_points')
      .order('total_points', { ascending: false })
      .limit(50);

    if (data) set({ leaderboard: data });
  },

  addFriend: async (userId: string, friendId: string) => {
    await supabase.from('friendships').insert({
      user_id: userId,
      friend_id: friendId,
      status: 'accepted',
    });
  },
}));
