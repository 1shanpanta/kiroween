import { create } from 'zustand';
import { supabase } from '@/utils/supabase';
import { MythicCard } from '@/utils/gemini';

interface ScanState {
  cards: MythicCard[];
  currentCard: MythicCard | null;
  isProcessing: boolean;
  setCurrentCard: (card: MythicCard | null) => void;
  setProcessing: (processing: boolean) => void;
  saveCard: (card: MythicCard, imageUri: string, userId: string) => Promise<void>;
  loadCards: (userId: string) => Promise<void>;
  deleteCard: (cardId: string) => Promise<void>;
}

export const useScanStore = create<ScanState>((set, get) => ({
  cards: [],
  currentCard: null,
  isProcessing: false,

  setCurrentCard: (card) => set({ currentCard: card }),
  setProcessing: (processing) => set({ isProcessing: processing }),

  saveCard: async (card: MythicCard, imageUri: string, userId: string) => {
    const { data, error } = await supabase
      .from('collections')
      .insert({
        user_id: userId,
        mythic_name: card.mythic_name,
        original_object: card.original_object,
        rarity_index: card.rarity_index,
        rarity_tier: card.rarity_tier,
        element: card.element,
        flavor_text: card.flavor_text,
        image_uri: imageUri,
        weight_class: card.weight_class,
        estimated_weight: card.estimated_weight,
        dimensions: card.dimensions,
        timestamp: Date.now(),
      })
      .select()
      .single();

    if (!error && data) {
      set({ cards: [data, ...get().cards] });
    }
  },

  loadCards: async (userId: string) => {
    const { data } = await supabase
      .from('collections')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (data) set({ cards: data });
  },

  deleteCard: async (cardId: string) => {
    await supabase.from('collections').delete().eq('id', cardId);
    set({ cards: get().cards.filter(c => c.id !== cardId) });
  },
}));
