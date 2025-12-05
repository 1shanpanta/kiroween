import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { MythicCard } from './scanStore';
import { useUserStore } from './userStore';
import { supabase } from '@/utils/supabase';
import { useAuthStore } from './authStore';

export interface Challenge {
  id: string;
  title: string;
  description: string;
  targetWord: string; // The word to match in 'original_object' or 'mythic_name'
  rewardPoints: number;
  isActive: boolean;
  completed: boolean;
  participants: string[]; // Friend IDs
  dailyDate?: string; // YYYY-MM-DD format
  expiresAt?: string; // ISO timestamp
}

interface ChallengeTemplate {
  title: string;
  description: string;
  targetWord: string;
  rewardPoints: number;
}

// Challenge pool - 30 challenge templates
const CHALLENGE_POOL: ChallengeTemplate[] = [
  { title: 'THE HYDRATION QUEST', description: 'Find a container of liquid (Bottle, Mug, Cup).', targetWord: 'bottle,mug,cup,glass,liquid', rewardPoints: 100 },
  { title: 'TECH ARCHAEOLOGY', description: 'Scan an ancient input device (Keyboard, Mouse, Controller).', targetWord: 'keyboard,mouse,controller,gamepad', rewardPoints: 150 },
  { title: 'TEXTUAL EVIDENCE', description: 'Capture a physical data storage medium (Book, Notebook, Paper).', targetWord: 'book,notebook,paper,journal', rewardPoints: 80 },
  { title: 'PLASTIC HUNTER', description: 'Find an object made of plastic.', targetWord: 'plastic,bottle,container,bag', rewardPoints: 60 },
  { title: 'METAL DETECTOR', description: 'Scan something metallic (Spoon, Key, Coin).', targetWord: 'metal,spoon,key,coin,aluminum', rewardPoints: 120 },
  { title: 'GLASS COLLECTOR', description: 'Find a glass object (Window, Bottle, Jar).', targetWord: 'glass,bottle,jar,window,mirror', rewardPoints: 90 },
  { title: 'WOODEN ARTIFACT', description: 'Capture an item made of wood.', targetWord: 'wood,wooden,table,chair,desk', rewardPoints: 70 },
  { title: 'FABRIC FINDER', description: 'Scan a fabric or textile item.', targetWord: 'fabric,cloth,cloth,shirt,pants,towel', rewardPoints: 65 },
  { title: 'STONE AGE', description: 'Find something made of stone or ceramic.', targetWord: 'stone,ceramic,rock,pottery,vase', rewardPoints: 85 },
  { title: 'ELECTRONIC DISCOVERY', description: 'Scan an electronic device.', targetWord: 'electronic,phone,tablet,computer,device', rewardPoints: 140 },
  { title: 'ORGANIC MATTER', description: 'Find something organic or natural.', targetWord: 'organic,plant,leaf,fruit,vegetable', rewardPoints: 75 },
  { title: 'COMMON FIND', description: 'Capture a common rarity artifact (Rarity 0-20).', targetWord: '', rewardPoints: 50 },
  { title: 'RARE DISCOVERY', description: 'Find a rare artifact (Rarity 21-40).', targetWord: '', rewardPoints: 100 },
  { title: 'EPIC QUEST', description: 'Scan an epic rarity artifact (Rarity 41-60).', targetWord: '', rewardPoints: 150 },
  { title: 'LEGENDARY HUNT', description: 'Capture a legendary artifact (Rarity 61-80).', targetWord: '', rewardPoints: 200 },
  { title: 'MYTHIC CHALLENGE', description: 'Find a mythic rarity artifact (Rarity 81-100).', targetWord: '', rewardPoints: 250 },
  { title: 'PLASTIC ELEMENT', description: 'Scan an artifact with PLASTIC element.', targetWord: '', rewardPoints: 80 },
  { title: 'METAL ELEMENT', description: 'Find an artifact with METAL element.', targetWord: '', rewardPoints: 90 },
  { title: 'GLASS ELEMENT', description: 'Capture an artifact with GLASS element.', targetWord: '', rewardPoints: 85 },
  { title: 'PAPER ELEMENT', description: 'Scan an artifact with PAPER element.', targetWord: '', rewardPoints: 70 },
  { title: 'WOOD ELEMENT', description: 'Find an artifact with WOOD element.', targetWord: '', rewardPoints: 75 },
  { title: 'FABRIC ELEMENT', description: 'Capture an artifact with FABRIC element.', targetWord: '', rewardPoints: 65 },
  { title: 'STONE ELEMENT', description: 'Scan an artifact with STONE element.', targetWord: '', rewardPoints: 80 },
  { title: 'CERAMIC ELEMENT', description: 'Find an artifact with CERAMIC element.', targetWord: '', rewardPoints: 85 },
  { title: 'ELECTRONICS ELEMENT', description: 'Capture an artifact with ELECTRONICS element.', targetWord: '', rewardPoints: 120 },
  { title: 'ORGANIC ELEMENT', description: 'Scan an artifact with ORGANIC element.', targetWord: '', rewardPoints: 70 },
  { title: 'VOID MATTER', description: 'Find an artifact with VOID_MATTER element.', targetWord: '', rewardPoints: 180 },
  { title: 'BIO SLUDGE', description: 'Capture an artifact with BIO_SLUDGE element.', targetWord: '', rewardPoints: 160 },
  { title: 'ANCIENT TECH', description: 'Scan an artifact with ANCIENT_TECH element.', targetWord: '', rewardPoints: 200 },
  { title: 'NEON DECAY', description: 'Find an artifact with NEON_DECAY element.', targetWord: '', rewardPoints: 170 },
];

const CHALLENGE_STORAGE_KEY = '@pokedex_challenges';
const LAST_REFRESH_DATE_KEY = '@pokedex_last_challenge_refresh';

// Simple seeded random number generator
function seededRandom(seed: string): () => number {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    const char = seed.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  let value = Math.abs(hash);
  
  return () => {
    value = (value * 9301 + 49297) % 233280;
    return value / 233280;
  };
}

// Get today's date string in YYYY-MM-DD format
function getTodayDateString(): string {
  const today = new Date();
  return today.toISOString().split('T')[0];
}

// Get end of day timestamp
function getEndOfDayTimestamp(): string {
  const today = new Date();
  today.setHours(23, 59, 59, 999);
  return today.toISOString();
}

// Generate daily challenges using date-based seed
function generateDailyChallenges(dateString: string): Challenge[] {
  const random = seededRandom(dateString);
  const pool = [...CHALLENGE_POOL];
  const selected: Challenge[] = [];
  const count = 3 + Math.floor(random() * 3); // 3-5 challenges per day
  
  for (let i = 0; i < count && pool.length > 0; i++) {
    const index = Math.floor(random() * pool.length);
    const template = pool.splice(index, 1)[0];
    
    selected.push({
      id: `daily_${dateString}_${i}`,
      title: template.title,
      description: template.description,
      targetWord: template.targetWord,
      rewardPoints: template.rewardPoints,
      isActive: true,
      completed: false,
      participants: [],
      dailyDate: dateString,
      expiresAt: getEndOfDayTimestamp(),
    });
  }
  
  return selected;
}

interface ChallengeState {
  challenges: Challenge[];
  activeChallengeId: string | null;
  challengeSubscription: any | null;
  addChallenge: (challenge: Challenge) => Promise<void>;
  completeChallenge: (challengeId: string) => Promise<void>;
  checkChallengeCompletion: (card: MythicCard) => string | null;
  loadChallenges: () => Promise<void>;
  getChallengeById: (id: string) => Challenge | undefined;
  checkAndRefreshDailyChallenges: () => Promise<void>;
  getDailyChallenges: (date: Date) => Challenge[];
  setupRealtimeSubscription: () => void;
}

export const useChallengeStore = create<ChallengeState>((set, get) => ({
  challenges: [],
  activeChallengeId: null,
  challengeSubscription: null,

  getDailyChallenges: (date: Date) => {
    const dateString = date.toISOString().split('T')[0];
    return get().challenges.filter(c => c.dailyDate === dateString);
  },

  checkAndRefreshDailyChallenges: async () => {
    const today = getTodayDateString();
    const lastRefresh = await AsyncStorage.getItem(LAST_REFRESH_DATE_KEY);
    
    // Check if we have challenges for today in local storage
    if (lastRefresh === today) {
      const stored = await AsyncStorage.getItem(CHALLENGE_STORAGE_KEY);
      if (stored) {
        const storedChallenges = JSON.parse(stored);
        // Verify they're for today
        if (storedChallenges.length > 0 && storedChallenges[0].dailyDate === today) {
          console.log('[ChallengeStore] Using cached challenges for today');
          set({ challenges: storedChallenges });
          return;
        }
      }
    }
    
    console.log('[ChallengeStore] Checking daily challenges for:', today);
    
    const userId = useAuthStore.getState().userId;
    let challengesToUse: Challenge[] = [];
    
    // Try to load from Supabase first (if user is logged in)
    if (userId) {
      const { data: supabaseChallenges, error } = await supabase
        .from('challenges')
        .select('*')
        .eq('daily_date', today);
      
      if (!error && supabaseChallenges && supabaseChallenges.length > 0) {
        console.log('[ChallengeStore] Loaded', supabaseChallenges.length, 'challenges from Supabase');
        challengesToUse = supabaseChallenges.map((item: any) => ({
          id: item.id,
          title: item.title,
          description: item.description,
          targetWord: item.target_word || '',
          rewardPoints: item.reward_points,
          isActive: item.is_active !== false,
          completed: false, // Reset daily
          participants: [],
          dailyDate: item.daily_date,
          expiresAt: item.expires_at,
        }));
      }
    }
    
    // If no challenges from Supabase, generate new ones
    if (challengesToUse.length === 0) {
      console.log('[ChallengeStore] Generating new daily challenges');
      challengesToUse = generateDailyChallenges(today);
      
      // Try to save to Supabase if user is logged in (but don't fail if it doesn't work)
      if (userId) {
        const challengesToInsert = challengesToUse.map(c => ({
          title: c.title,
          description: c.description,
          target_word: c.targetWord,
          reward_points: c.rewardPoints,
          is_active: true,
          daily_date: c.dailyDate,
          expires_at: c.expiresAt,
        }));
        
        const { error: insertError } = await supabase
          .from('challenges')
          .insert(challengesToInsert);
        
        if (insertError) {
          console.error('[ChallengeStore] Failed to insert challenges to Supabase:', insertError);
          console.log('[ChallengeStore] Continuing with local challenges');
        } else {
          console.log('[ChallengeStore] Saved', challengesToInsert.length, 'challenges to Supabase');
        }
        
        // Try to delete old challenges (don't fail if this doesn't work)
        await supabase
          .from('challenges')
          .delete()
          .lt('daily_date', today);
      }
    }
    
    console.log('[ChallengeStore] Setting', challengesToUse.length, 'challenges');
    set({ challenges: challengesToUse });
    await AsyncStorage.setItem(CHALLENGE_STORAGE_KEY, JSON.stringify(challengesToUse));
    await AsyncStorage.setItem(LAST_REFRESH_DATE_KEY, today);
  },

  loadChallenges: async () => {
    await get().checkAndRefreshDailyChallenges();
  },

  addChallenge: async (challenge) => {
    const newChallenges = [...get().challenges, challenge];
    set({ challenges: newChallenges });
    await AsyncStorage.setItem(CHALLENGE_STORAGE_KEY, JSON.stringify(newChallenges));
  },

  completeChallenge: async (challengeId) => {
    const { challenges } = get();
    const challenge = challenges.find(c => c.id === challengeId);
    
    // Only award points if challenge exists and isn't already completed
    if (challenge && !challenge.completed) {
      // Award points
      await useUserStore.getState().addPoints(challenge.rewardPoints);
      
      // Update completed challenges count
      const currentCount = useUserStore.getState().completedChallengesCount;
      await useUserStore.getState().setCompletedChallengesCount(currentCount + 1);
      
      // Save completion to Supabase if user is logged in
      const userId = useAuthStore.getState().userId;
      if (userId) {
        await supabase
          .from('user_challenges')
          .insert({
            user_id: userId,
            challenge_id: challengeId,
            points_earned: challenge.rewardPoints,
          });
      }
    }
    
    const updatedChallenges = challenges.map(c => 
      c.id === challengeId ? { ...c, completed: true } : c
    );
    set({ challenges: updatedChallenges });
    await AsyncStorage.setItem(CHALLENGE_STORAGE_KEY, JSON.stringify(updatedChallenges));
  },

  checkChallengeCompletion: (card: MythicCard) => {
    const { challenges } = get();
    const today = getTodayDateString();
    const activeChallenges = challenges.filter(c => 
      c.isActive && 
      !c.completed && 
      c.dailyDate === today
    );
    
    for (const challenge of activeChallenges) {
      // Check if it's a rarity-based challenge
      if (!challenge.targetWord && challenge.title.includes('RARITY')) {
        const finalRarity = card.adjustedRarity !== undefined ? card.adjustedRarity : card.rarity_index;
        if (challenge.title.includes('COMMON') && finalRarity >= 0 && finalRarity <= 20) {
          return challenge.id;
        }
        if (challenge.title.includes('RARE') && finalRarity >= 21 && finalRarity <= 40) {
          return challenge.id;
        }
        if (challenge.title.includes('EPIC') && finalRarity >= 41 && finalRarity <= 60) {
          return challenge.id;
        }
        if (challenge.title.includes('LEGENDARY') && finalRarity >= 61 && finalRarity <= 80) {
          return challenge.id;
        }
        if (challenge.title.includes('MYTHIC') && finalRarity >= 81 && finalRarity <= 100) {
          return challenge.id;
        }
      }
      
      // Check if it's an element-based challenge
      if (!challenge.targetWord && challenge.title.includes('ELEMENT')) {
        const titleParts = challenge.title.split(' ');
        const elementName = titleParts[0].toUpperCase();
        
        // Handle special multi-word elements
        if (elementName === 'VOID' && card.element === 'VOID_MATTER') return challenge.id;
        if (elementName === 'BIO' && card.element === 'BIO_SLUDGE') return challenge.id;
        if (elementName === 'ANCIENT' && card.element === 'ANCIENT_TECH') return challenge.id;
        if (elementName === 'NEON' && card.element === 'NEON_DECAY') return challenge.id;
        if (elementName === 'CURSED' && card.element === 'CURSED_DATA') return challenge.id;
        
        // Handle standard single-word elements
        if (card.element === elementName) return challenge.id;
      }
      
      // Check target words
      if (challenge.targetWord) {
        const targets = challenge.targetWord.toLowerCase().split(',');
        const objectName = card.original_object.toLowerCase();
        const mythicName = card.mythic_name.toLowerCase();
        
        const isMatch = targets.some(target => 
          objectName.includes(target.trim()) || mythicName.includes(target.trim())
        );

        if (isMatch) {
          return challenge.id;
        }
      }
    }
    return null;
  },

  getChallengeById: (id: string) => {
    return get().challenges.find(c => c.id === id);
  },

  setupRealtimeSubscription: () => {
    const userId = useAuthStore.getState().userId;
    if (!userId) {
      console.log('[ChallengeStore] No userId, skipping subscription setup');
      return;
    }

    // Remove existing subscription
    const existingSub = get().challengeSubscription;
    if (existingSub) {
      console.log('[ChallengeStore] Removing existing subscription');
      supabase.removeChannel(existingSub);
    }

    const today = getTodayDateString();

    // Set up subscription for new challenges
    const channel = supabase
      .channel('challenges-updates')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'challenges',
          filter: `daily_date=eq.${today}`,
        },
        (payload) => {
          console.log('[ChallengeStore] Challenge updated:', payload.eventType);
          // Reload challenges when they change
          get().loadChallenges();
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'user_challenges',
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          console.log('[ChallengeStore] User challenge completion updated:', payload.eventType);
          // Reload challenges to update completion status
          get().loadChallenges();
        }
      )
      .subscribe();

    set({ challengeSubscription: channel });
    console.log('[ChallengeStore] Real-time subscription set up');
  },
}));
