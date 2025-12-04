import { create } from 'zustand';
import { supabase } from '@/utils/supabase';

interface Challenge {
  id: string;
  title: string;
  description: string;
  target_word: string;
  reward_points: number;
  is_active: boolean;
  daily_date: string;
  expires_at: string;
}

interface ChallengeState {
  challenges: Challenge[];
  completedChallenges: string[];
  loadChallenges: () => Promise<void>;
  completeChallenge: (challengeId: string, userId: string) => Promise<void>;
}

export const useChallengeStore = create<ChallengeState>((set, get) => ({
  challenges: [],
  completedChallenges: [],

  loadChallenges: async () => {
    const { data } = await supabase
      .from('challenges')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    if (data) set({ challenges: data });
  },

  completeChallenge: async (challengeId: string, userId: string) => {
    const challenge = get().challenges.find(c => c.id === challengeId);
    if (!challenge) return;

    await supabase.from('user_challenges').insert({
      user_id: userId,
      challenge_id: challengeId,
      points_earned: challenge.reward_points,
    });

    await supabase.rpc('increment_user_points', {
      user_id: userId,
      points: challenge.reward_points,
    });

    set({ completedChallenges: [...get().completedChallenges, challengeId] });
  },
}));
