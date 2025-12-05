import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '@/utils/supabase';
import { useAuthStore } from './authStore';

export interface MythicCard {
  id?: string;
  mythic_name: string;
  original_object: string;
  rarity_index: number;
  rarityTier?: string;
  adjustedRarity?: number;
  element: 
    | 'PLASTIC' | 'METAL' | 'GLASS' | 'PAPER' | 'WOOD' | 'FABRIC' 
    | 'STONE' | 'CERAMIC' | 'ELECTRONICS' | 'ORGANIC'
    | 'VOID_MATTER' | 'BIO_SLUDGE' | 'ANCIENT_TECH' | 'NEON_DECAY' | 'CURSED_DATA';
  flavor_text: string;
  weight_class?: 'LIGHT' | 'MEDIUM' | 'HEAVY' | 'IMMENSE';
  estimated_weight?: string;
  dimensions?: string;
  image_uri: string;
  timestamp: number;
}

export function getRarityTier(rarityIndex: number): string {
  if (rarityIndex <= 20) return 'COMMON';
  if (rarityIndex <= 40) return 'RARE';
  if (rarityIndex <= 60) return 'EPIC';
  if (rarityIndex <= 80) return 'LEGENDARY';
  return 'MYTHIC';
}

export function getRarityTierColor(tier: string): string {
  switch (tier) {
    case 'COMMON': return '#008000';
    case 'RARE': return '#00FF00';
    case 'EPIC': return '#CCFFCC';
    case 'LEGENDARY': return '#FFFF00';
    case 'MYTHIC': return '#FFFFFF';
    default: return '#00FF00';
  }
}

interface ScanState {
  currentScan: MythicCard | null;
  savedCards: MythicCard[];
  demoMode: boolean;
  isProcessing: boolean;
  capturedImageUri: string | null;
  setCurrentScan: (scan: MythicCard | null) => void;
  setCapturedImage: (uri: string | null) => void;
  saveCard: (card: MythicCard) => Promise<boolean>;
  loadSavedCards: () => Promise<void>;
  toggleDemoMode: () => void;
  setProcessing: (processing: boolean) => void;
  deleteCard: (id: string) => Promise<void>;
  getCardById: (id: string) => MythicCard | undefined;
  getCardCount: () => number;
}

const STORAGE_KEY = '@pokedex_saved_cards';
const DEMO_MODE_KEY = '@pokedex_demo_mode';

export const useScanStore = create<ScanState>((set, get) => ({
  currentScan: null,
  savedCards: [],
  demoMode: false,
  isProcessing: false,
  capturedImageUri: null,

  setCurrentScan: (scan) => set({ currentScan: scan }),
  setCapturedImage: (uri) => set({ capturedImageUri: uri }),
  setProcessing: (processing) => set({ isProcessing: processing }),

  saveCard: async (card) => {
    const userId = useAuthStore.getState().userId;
    
    if (!userId) {
      return false;
    }
    
    const finalRarity = card.adjustedRarity ?? card.rarity_index;
    const cardWithId = { 
      ...card, 
      id: card.id || `card_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      rarityTier: getRarityTier(finalRarity),
    };
    
    const { data, error } = await supabase
      .from('collections')
      .insert({
        user_id: userId,
        mythic_name: cardWithId.mythic_name,
        original_object: cardWithId.original_object,
        rarity_index: cardWithId.rarity_index,
        adjusted_rarity: cardWithId.adjustedRarity,
        rarity_tier: cardWithId.rarityTier,
        element: cardWithId.element,
        flavor_text: cardWithId.flavor_text,
        image_uri: cardWithId.image_uri,
        weight_class: cardWithId.weight_class,
        estimated_weight: cardWithId.estimated_weight,
        dimensions: cardWithId.dimensions,
        timestamp: cardWithId.timestamp,
      })
      .select()
      .single();
    
    if (error) return false;

    const cardWithSupabaseId = data ? { ...cardWithId, id: data.id } : cardWithId;
    const newCards = [...get().savedCards, cardWithSupabaseId];
    set({ savedCards: newCards });
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(newCards));
    
    return true;
  },

  deleteCard: async (id) => {
    const userId = useAuthStore.getState().userId;
    if (!userId) return;
    
    const cardToDelete = get().savedCards.find(c => c.id === id);
    
    if (cardToDelete?.id) {
      await supabase
        .from('collections')
        .delete()
        .eq('id', cardToDelete.id);
    }
    
    const newCards = get().savedCards.filter((card) => card.id !== id);
    set({ savedCards: newCards });
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(newCards));
  },

  getCardById: (id) => {
    return get().savedCards.find((card) => card.id === id);
  },

  getCardCount: () => {
    return get().savedCards.length;
  },

  loadSavedCards: async () => {
    const userId = useAuthStore.getState().userId;
    
    if (!userId) return;
    
    const { data, error } = await supabase
      .from('collections')
      .select('*')
      .eq('user_id', userId)
      .order('timestamp', { ascending: false });

    if (error) return;

    if (data) {
      const cards: MythicCard[] = data.map((item: any) => ({
        id: item.id,
        mythic_name: item.mythic_name,
        original_object: item.original_object,
        rarity_index: item.rarity_index,
        adjustedRarity: item.adjusted_rarity,
        rarityTier: item.rarity_tier || getRarityTier(item.adjusted_rarity ?? item.rarity_index),
        element: item.element,
        flavor_text: item.flavor_text,
        image_uri: item.image_uri,
        weight_class: item.weight_class,
        estimated_weight: item.estimated_weight,
        dimensions: item.dimensions,
        timestamp: item.timestamp,
      }));

      set({ savedCards: cards });
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(cards));
    }
    
    const demoModeStored = await AsyncStorage.getItem(DEMO_MODE_KEY);
    if (demoModeStored) {
      set({ demoMode: JSON.parse(demoModeStored) });
    }
  },

  toggleDemoMode: async () => {
    const newMode = !get().demoMode;
    set({ demoMode: newMode });
    await AsyncStorage.setItem(DEMO_MODE_KEY, JSON.stringify(newMode));
  },
}));
