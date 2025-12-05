import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '@/utils/supabase';
import { useAuthStore } from './authStore';
import { uploadImageToSupabase, deleteImageFromSupabase } from '@/utils/imageStorage';

export interface MythicCard {
  id?: string;
  mythic_name: string;
  original_object: string;
  rarity_index: number;
  rarityTier?: string; // Computed from rarity_index
  adjustedRarity?: number; // User-adjusted rarity
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

// Rarity tier helper function (Pokemon-style)
export function getRarityTier(rarityIndex: number): string {
  if (rarityIndex <= 20) return 'COMMON';
  if (rarityIndex <= 40) return 'RARE';
  if (rarityIndex <= 60) return 'EPIC';
  if (rarityIndex <= 80) return 'LEGENDARY';
  return 'MYTHIC';
}

export function getRarityTierColor(tier: string): string {
  switch (tier) {
    case 'COMMON': return '#008000'; // shadow-green
    case 'RARE': return '#00FF00'; // standard-green
    case 'EPIC': return '#CCFFCC'; // phosphor-bright
    case 'LEGENDARY': return '#FFFF00'; // yellow
    case 'MYTHIC': return '#FFFFFF'; // white
    default: return '#00FF00';
  }
}

interface ScanState {
  currentScan: MythicCard | null;
  savedCards: MythicCard[];
  wishlist: MythicCard[];
  demoMode: boolean;
  isProcessing: boolean;
  capturedImageUri: string | null;
  userName: string | null;
  syncSubscription: any | null;
  setCurrentScan: (scan: MythicCard | null) => void;
  setCapturedImage: (uri: string | null) => void;
  saveCard: (card: MythicCard) => Promise<boolean>;
  loadSavedCards: () => Promise<void>;
  syncToSupabase: () => Promise<void>;
  loadFromSupabase: () => Promise<void>;
  setupRealtimeSubscription: () => void;
  toggleDemoMode: () => void;
  setProcessing: (processing: boolean) => void;
  deleteCard: (id: string) => Promise<void>;
  getCardById: (id: string) => MythicCard | undefined;
  getCardCount: () => number;
  addToWishlist: (card: MythicCard) => Promise<void>;
  removeFromWishlist: (id: string) => Promise<void>;
  setUserName: (name: string) => Promise<void>;
  adjustCardRarity: (id: string, rarity: number) => Promise<void>;
  clearAllCards: () => Promise<void>;
}

const STORAGE_KEY = '@pokedex_saved_cards';
const WISHLIST_KEY = '@pokedex_wishlist';
const DEMO_MODE_KEY = '@pokedex_demo_mode';
const USER_NAME_KEY = '@pokedex_user_name';

export const useScanStore = create<ScanState>((set, get) => ({
  currentScan: null,
  savedCards: [],
  wishlist: [],
  demoMode: false,
  isProcessing: false,
  capturedImageUri: null,
  userName: null,
  syncSubscription: null,

  setCurrentScan: (scan) => set({ currentScan: scan }),

  setCapturedImage: (uri) => set({ capturedImageUri: uri }),

  setProcessing: (processing) => set({ isProcessing: processing }),

  saveCard: async (card) => {
    const userId = useAuthStore.getState().userId;
    
    if (!userId) {
      console.error('[ScanStore] Cannot save card: User not logged in');
      return false;
    }
    
    // Check for duplicates in Supabase
    const { data: existingCards } = await supabase
      .from('collections')
      .select('original_object')
      .eq('user_id', userId)
      .ilike('original_object', card.original_object);

    if (existingCards && existingCards.length > 0) {
      console.log('[ScanStore] Duplicate card detected in cloud:', card.original_object);
      return false; // Indicate failure/duplicate
    }

    const finalRarity = card.adjustedRarity ?? card.rarity_index;
    const cardWithId = { 
      ...card, 
      id: card.id || `card_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      rarityTier: getRarityTier(finalRarity),
    };
    
    try {
      // Upload image to Supabase Storage first
      let imageUrl = cardWithId.image_uri;
      if (cardWithId.image_uri && !cardWithId.image_uri.startsWith('http')) {
        console.log('[ScanStore] Uploading image to Supabase Storage...');
        const uploadedUrl = await uploadImageToSupabase(cardWithId.image_uri, userId);
        if (uploadedUrl) {
          imageUrl = uploadedUrl;
          console.log('[ScanStore] Image uploaded successfully');
        } else {
          console.warn('[ScanStore] Failed to upload image, using local URI');
        }
      }

      // Save to Supabase first (primary storage)
      const { data, error: supabaseError } = await supabase
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
          image_uri: imageUrl,
          weight_class: cardWithId.weight_class,
          estimated_weight: cardWithId.estimated_weight,
          dimensions: cardWithId.dimensions,
          timestamp: cardWithId.timestamp,
        })
        .select()
        .single();
      
      if (supabaseError) {
        console.error('[ScanStore] Failed to save card to Supabase:', supabaseError);
        throw supabaseError;
      }

      // Update local state with Supabase ID and uploaded image URL
      const cardWithSupabaseId = data ? {
        ...cardWithId,
        id: data.id,
        image_uri: imageUrl, // Use the uploaded URL
      } : cardWithId;

      const newCards = [...get().savedCards, cardWithSupabaseId];
      set({ savedCards: newCards });
      
      // Cache locally for offline access
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(newCards));
      
      return true; // Indicate success
    } catch (error) {
      console.error('[ScanStore] Failed to save card:', error);
      return false;
    }
  },

  deleteCard: async (id) => {
    const userId = useAuthStore.getState().userId;
    
    if (!userId) {
      console.error('[ScanStore] Cannot delete card: User not logged in');
      return;
    }
    
    const cardToDelete = get().savedCards.find(c => c.id === id);
    
    try {
      // Delete image from Supabase Storage if it exists
      if (cardToDelete?.image_uri) {
        await deleteImageFromSupabase(cardToDelete.image_uri);
      }

      // Delete from Supabase first (primary storage)
      if (cardToDelete?.timestamp) {
        const { error: deleteError } = await supabase
          .from('collections')
          .delete()
          .eq('user_id', userId)
          .eq('timestamp', cardToDelete.timestamp);
        
        if (deleteError) {
          console.error('[ScanStore] Failed to delete card from Supabase:', deleteError);
          throw deleteError;
        }
      } else if (cardToDelete?.id && cardToDelete.id.startsWith('card_')) {
        // Try to delete by ID if it's a Supabase UUID
        const { error: deleteError } = await supabase
          .from('collections')
          .delete()
          .eq('id', cardToDelete.id);
        
        if (deleteError) {
          console.error('[ScanStore] Failed to delete card from Supabase:', deleteError);
        }
      }
      
      // Update local state
      const newCards = get().savedCards.filter((card) => card.id !== id);
      set({ savedCards: newCards });
      
      // Update local cache
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(newCards));
    } catch (error) {
      console.error('[ScanStore] Failed to delete card:', error);
    }
  },

  getCardById: (id) => {
    return get().savedCards.find((card) => card.id === id);
  },

  getCardCount: () => {
    return get().savedCards.length;
  },

  addToWishlist: async (card) => {
    const currentWishlist = get().wishlist;
    if (currentWishlist.some(c => c.id === card.id)) return; // Already in wishlist
    
    const newWishlist = [...currentWishlist, card];
    set({ wishlist: newWishlist });
    try {
      await AsyncStorage.setItem(WISHLIST_KEY, JSON.stringify(newWishlist));
    } catch (error) {
      console.error('Failed to save wishlist:', error);
    }
  },

  removeFromWishlist: async (id) => {
    const newWishlist = get().wishlist.filter((card) => card.id !== id);
    set({ wishlist: newWishlist });
    try {
      await AsyncStorage.setItem(WISHLIST_KEY, JSON.stringify(newWishlist));
    } catch (error) {
      console.error('Failed to remove from wishlist:', error);
    }
  },

  loadSavedCards: async () => {
    const userId = useAuthStore.getState().userId;
    
    if (!userId) {
      console.log('[ScanStore] User not logged in, cannot load from Supabase');
      return;
    }
    
    try {
      // Load from Supabase (primary source)
      await get().loadFromSupabase();
      
      const wishlistStored = await AsyncStorage.getItem(WISHLIST_KEY);
      if (wishlistStored) {
        set({ wishlist: JSON.parse(wishlistStored) });
      }
      const demoModeStored = await AsyncStorage.getItem(DEMO_MODE_KEY);
      if (demoModeStored) {
        set({ demoMode: JSON.parse(demoModeStored) });
      }
      const userNameStored = await AsyncStorage.getItem(USER_NAME_KEY);
      if (userNameStored) {
        set({ userName: userNameStored });
      }
    } catch (error) {
      console.error('[ScanStore] Failed to load cards:', error);
      // Fallback to local cache if Supabase fails
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      if (stored) {
        const cards = JSON.parse(stored);
        const cardsWithTiers = cards.map((card: MythicCard) => ({
          ...card,
          rarityTier: card.rarityTier || getRarityTier(card.adjustedRarity ?? card.rarity_index),
        }));
        set({ savedCards: cardsWithTiers });
      }
    }
  },

  loadFromSupabase: async () => {
    const userId = useAuthStore.getState().userId;
    if (!userId) return;

    const { data, error } = await supabase
      .from('collections')
      .select('*')
      .eq('user_id', userId)
      .order('timestamp', { ascending: false });

    if (error) {
      console.error('[ScanStore] Failed to load from Supabase:', error);
      return;
    }

    if (data) {
      const cards: MythicCard[] = data.map((item: any) => {
        // Filter out invalid local file URIs (old cards that weren't uploaded)
        let imageUri = item.image_uri;
        if (imageUri && (imageUri.startsWith('file://') || imageUri.startsWith('content://'))) {
          console.warn('[ScanStore] Found old local URI, clearing:', imageUri.substring(0, 50));
          imageUri = null; // Clear invalid local URIs
        }
        
        return {
          id: item.id,
          mythic_name: item.mythic_name,
          original_object: item.original_object,
          rarity_index: item.rarity_index,
          adjustedRarity: item.adjusted_rarity,
          rarityTier: item.rarity_tier || getRarityTier(item.adjusted_rarity ?? item.rarity_index),
          element: item.element,
          flavor_text: item.flavor_text,
          image_uri: imageUri,
          weight_class: item.weight_class,
          estimated_weight: item.estimated_weight,
          dimensions: item.dimensions,
          timestamp: item.timestamp,
        };
      });

      const cardsWithTiers = cards.map((card: MythicCard) => ({
        ...card,
        rarityTier: card.rarityTier || getRarityTier(card.adjustedRarity ?? card.rarity_index),
      }));

      set({ savedCards: cardsWithTiers });
      
      // Also save to local storage for offline access
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(cardsWithTiers));
    }
  },

  syncToSupabase: async () => {
    const userId = useAuthStore.getState().userId;
    if (!userId) return;

    const { savedCards } = get();
    
    for (const card of savedCards) {
      if (!card.timestamp) continue;
      
      const { error } = await supabase
        .from('collections')
        .upsert({
          user_id: userId,
          mythic_name: card.mythic_name,
          original_object: card.original_object,
          rarity_index: card.rarity_index,
          adjusted_rarity: card.adjustedRarity,
          rarity_tier: card.rarityTier,
          element: card.element,
          flavor_text: card.flavor_text,
          image_uri: card.image_uri,
          weight_class: card.weight_class,
          estimated_weight: card.estimated_weight,
          dimensions: card.dimensions,
          timestamp: card.timestamp,
        }, {
          onConflict: 'user_id,timestamp',
        });

      if (error) {
        console.error('[ScanStore] Failed to sync card:', card.mythic_name, error);
      }
    }
  },

  setupRealtimeSubscription: () => {
    const userId = useAuthStore.getState().userId;
    if (!userId) return;

    // Remove existing subscription
    const existingSub = get().syncSubscription;
    if (existingSub) {
      supabase.removeChannel(existingSub);
    }

    // Set up new subscription
    const channel = supabase
      .channel('collections-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'collections',
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          console.log('[ScanStore] Realtime update:', payload.eventType);
          if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE') {
            get().loadFromSupabase();
          } else if (payload.eventType === 'DELETE') {
            get().loadFromSupabase();
          }
        }
      )
      .subscribe();

    set({ syncSubscription: channel });
  },

  setUserName: async (name: string) => {
    set({ userName: name });
    try {
      await AsyncStorage.setItem(USER_NAME_KEY, name);
    } catch (error) {
      console.error('Failed to save user name:', error);
    }
  },

  adjustCardRarity: async (id: string, rarity: number) => {
    const userId = useAuthStore.getState().userId;
    
    if (!userId) {
      console.error('[ScanStore] Cannot update rarity: User not logged in');
      return;
    }
    
    const cards = get().savedCards;
    const cardToUpdate = cards.find(c => c.id === id);
    
    if (!cardToUpdate) {
      console.error('[ScanStore] Card not found:', id);
      return;
    }
    
    try {
      // Update in Supabase first (primary storage)
      if (cardToUpdate.timestamp) {
        const { error } = await supabase
          .from('collections')
          .update({
            adjusted_rarity: rarity,
            rarity_tier: getRarityTier(rarity),
          })
          .eq('user_id', userId)
          .eq('timestamp', cardToUpdate.timestamp);
        
        if (error) {
          console.error('[ScanStore] Failed to update rarity in Supabase:', error);
          throw error;
        }
      }
      
      // Update local state
      const updatedCards = cards.map((card) => {
        if (card.id === id) {
          return {
            ...card,
            adjustedRarity: rarity,
            rarityTier: getRarityTier(rarity),
          };
        }
        return card;
      });
      set({ savedCards: updatedCards });
      
      // Update local cache
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updatedCards));
    } catch (error) {
      console.error('[ScanStore] Failed to update card rarity:', error);
    }
  },

  toggleDemoMode: async () => {
    const newMode = !get().demoMode;
    set({ demoMode: newMode });
    try {
      await AsyncStorage.setItem(DEMO_MODE_KEY, JSON.stringify(newMode));
    } catch (error) {
      console.error('Failed to save demo mode:', error);
    }
  },

  clearAllCards: async () => {
    const userId = useAuthStore.getState().userId;
    
    if (!userId) {
      console.error('[ScanStore] Cannot clear cards: User not logged in');
      return;
    }
    
    try {
      // Delete all from Supabase first (primary storage)
      const { error } = await supabase
        .from('collections')
        .delete()
        .eq('user_id', userId);
      
      if (error) {
        console.error('[ScanStore] Failed to clear cards from Supabase:', error);
        throw error;
      }
      
      // Update local state
      set({ savedCards: [] });
      
      // Clear local cache
      await AsyncStorage.removeItem(STORAGE_KEY);
    } catch (error) {
      console.error('[ScanStore] Failed to clear all cards:', error);
    }
  },
}));


