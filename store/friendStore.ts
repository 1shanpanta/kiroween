import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '@/utils/supabase';
import { useAuthStore } from './authStore';

const FRIENDS_STORAGE_KEY = '@pokedex_friends';
const PENDING_REQUESTS_STORAGE_KEY = '@pokedex_pending_requests';

export interface SearchedUser {
  id: string;
  username: string;
  email: string;
  total_points: number;
  friendship_status?: 'none' | 'pending' | 'accepted';
  friendship_id?: string;
  requester_id?: string;
}

export interface Friend {
  id: string;
  user_id: string;
  username: string;
  email: string;
  total_points: number;
  artifacts_count: number;
  total_rarity: number;
  friendship_id: string;
  isOnline?: boolean;
}

export interface PendingRequest {
  id: string;
  friendship_id: string;
  user_id: string;
  username: string;
  email: string;
  total_points: number;
  requester_id: string;
  is_incoming: boolean; // true if someone sent request to you, false if you sent request to them
}

interface FriendState {
  friends: Friend[];
  pendingRequests: PendingRequest[];
  searchResults: SearchedUser[];
  loading: boolean;
  searching: boolean;
  error: string | null;
  friendsSubscription: any | null;

  searchUsers: (query: string) => Promise<void>;
  sendFriendRequest: (friendId: string) => Promise<void>;
  acceptFriendRequest: (friendshipId: string) => Promise<void>;
  rejectFriendRequest: (friendshipId: string) => Promise<void>;
  loadFriends: () => Promise<void>;
  loadPendingRequests: () => Promise<void>;
  loadFromCache: () => Promise<void>;
  setupRealtimeSubscription: () => void;
  clearSearch: () => void;
}

export const useFriendStore = create<FriendState>((set, get) => ({
  friends: [],
  pendingRequests: [],
  searchResults: [],
  loading: false,
  searching: false,
  error: null,
  friendsSubscription: null,

  clearSearch: () => {
    set({ searchResults: [], error: null });
  },

  searchUsers: async (query: string) => {
    const userId = useAuthStore.getState().userId;
    if (!userId) {
      set({ error: 'Not logged in' });
      return;
    }

    if (!query.trim()) {
      set({ searchResults: [], error: null });
      return;
    }

    set({ searching: true, error: null });

    const trimmedQuery = query.trim();
    const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(trimmedQuery);

    let queryBuilder = supabase
      .from('users')
      .select('id, username, email, total_points')
      .neq('id', userId);

    if (isUUID) {
      queryBuilder = queryBuilder.eq('id', trimmedQuery);
    } else {
      queryBuilder = queryBuilder.ilike('username', `%${trimmedQuery}%`);
    }

    const { data: users, error } = await queryBuilder.limit(10);

    if (error) {
      console.error('[FriendStore] Error searching users:', error);
      set({ searching: false, error: error.message, searchResults: [] });
      return;
    }

    if (!users || users.length === 0) {
      set({ searching: false, searchResults: [], error: null });
      return;
    }

    const userIds = users.map(u => u.id);
    
    const { data: friendships, error: friendshipError } = await supabase
      .from('friendships')
      .select('id, user_id, friend_id, status')
      .or(`and(user_id.eq.${userId},friend_id.in.(${userIds.join(',')})),and(friend_id.eq.${userId},user_id.in.(${userIds.join(',')}))`);

    const friendshipMap = new Map<string, { id: string; status: string; requester_id: string }>();
    
    if (friendships && !friendshipError) {
      friendships.forEach(f => {
        const otherUserId = f.user_id === userId ? f.friend_id : f.user_id;
        friendshipMap.set(otherUserId, {
          id: f.id,
          status: f.status,
          requester_id: f.user_id,
        });
      });
    }

    const results: SearchedUser[] = users.map(user => {
      const friendship = friendshipMap.get(user.id);
      return {
        id: user.id,
        username: user.username,
        email: user.email,
        total_points: user.total_points || 0,
        friendship_status: friendship ? (friendship.status === 'accepted' ? 'accepted' : 'pending') : 'none',
        friendship_id: friendship?.id,
        requester_id: friendship?.requester_id,
      };
    });

    set({ searching: false, searchResults: results, error: null });
  },

  sendFriendRequest: async (friendId: string) => {
    const userId = useAuthStore.getState().userId;
    if (!userId) {
      set({ error: 'Not logged in' });
      return;
    }

    if (userId === friendId) {
      set({ error: 'Cannot add yourself as a friend' });
      return;
    }

    set({ loading: true, error: null });

    const { error } = await supabase
      .from('friendships')
      .insert({
        user_id: userId,
        friend_id: friendId,
        status: 'pending',
      });

    if (error) {
      console.error('[FriendStore] Error sending friend request:', error);
      if (error.code === '23505') {
        set({ error: 'Friend request already exists', loading: false });
      } else {
        set({ error: error.message, loading: false });
      }
      return;
    }

    await get().searchUsers(get().searchResults[0]?.username || '');
    set({ loading: false });
  },

  acceptFriendRequest: async (friendshipId: string) => {
    set({ loading: true, error: null });

    const { error } = await supabase
      .from('friendships')
      .update({ status: 'accepted' })
      .eq('id', friendshipId);

    if (error) {
      console.error('[FriendStore] Error accepting friend request:', error);
      set({ error: error.message, loading: false });
      return;
    }

    await get().loadPendingRequests();
    await get().loadFriends();
    set({ loading: false });
  },

  rejectFriendRequest: async (friendshipId: string) => {
    set({ loading: true, error: null });

    const { error } = await supabase
      .from('friendships')
      .delete()
      .eq('id', friendshipId);

    if (error) {
      console.error('[FriendStore] Error rejecting friend request:', error);
      set({ error: error.message, loading: false });
      return;
    }

    await get().loadPendingRequests();
    set({ loading: false });
  },

  loadFriends: async () => {
    const userId = useAuthStore.getState().userId;
    if (!userId) {
      set({ friends: [] });
      return;
    }

    set({ loading: true });

    const { data: friendships, error: friendshipError } = await supabase
      .from('friendships')
      .select('id, user_id, friend_id')
      .or(`user_id.eq.${userId},friend_id.eq.${userId}`)
      .eq('status', 'accepted');

    if (friendshipError) {
      console.error('[FriendStore] Error loading friendships:', friendshipError);
      set({ loading: false, friends: [] });
      return;
    }

    if (!friendships || friendships.length === 0) {
      set({ loading: false, friends: [] });
      return;
    }

    const friendIds = friendships.map(f => 
      f.user_id === userId ? f.friend_id : f.user_id
    );

    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('id, username, email, total_points')
      .in('id', friendIds);

    if (usersError) {
      console.error('[FriendStore] Error loading friend users:', usersError);
      set({ loading: false, friends: [] });
      return;
    }

    const { data: collections, error: collectionsError } = await supabase
      .from('collections')
      .select('user_id, rarity_index')
      .in('user_id', friendIds);

    const userStatsMap = new Map<string, { count: number; totalRarity: number }>();
    
    if (collections && !collectionsError) {
      collections.forEach(c => {
        const current = userStatsMap.get(c.user_id) || { count: 0, totalRarity: 0 };
        userStatsMap.set(c.user_id, {
          count: current.count + 1,
          totalRarity: current.totalRarity + (c.rarity_index || 0),
        });
      });
    }

    const friends: Friend[] = users.map(user => {
      const friendship = friendships.find(f => 
        (f.user_id === userId && f.friend_id === user.id) ||
        (f.friend_id === userId && f.user_id === user.id)
      );
      const stats = userStatsMap.get(user.id) || { count: 0, totalRarity: 0 };
      
      return {
        id: user.id,
        user_id: user.id,
        username: user.username,
        email: user.email,
        total_points: user.total_points || 0,
        artifacts_count: stats.count,
        total_rarity: stats.totalRarity,
        friendship_id: friendship?.id || '',
        isOnline: false,
      };
    });

    set({ loading: false, friends });
    
    // Cache locally for offline access
    await AsyncStorage.setItem(FRIENDS_STORAGE_KEY, JSON.stringify(friends));
    
    // Set up realtime subscription for friends' collections
    get().setupRealtimeSubscription();
  },

  loadPendingRequests: async () => {
    const userId = useAuthStore.getState().userId;
    if (!userId) {
      set({ pendingRequests: [] });
      return;
    }

    // Get incoming requests (where someone sent a request TO you)
    const { data: incomingFriendships, error: incomingError } = await supabase
      .from('friendships')
      .select('id, user_id, friend_id')
      .eq('friend_id', userId)
      .eq('status', 'pending');

    // Get outgoing requests (where you sent a request to someone)
    const { data: outgoingFriendships, error: outgoingError } = await supabase
      .from('friendships')
      .select('id, user_id, friend_id')
      .eq('user_id', userId)
      .eq('status', 'pending');

    if (incomingError || outgoingError) {
      console.error('[FriendStore] Error loading pending requests:', incomingError || outgoingError);
      set({ pendingRequests: [] });
      return;
    }

    const allFriendships = [
      ...(incomingFriendships || []).map(f => ({ ...f, is_incoming: true })),
      ...(outgoingFriendships || []).map(f => ({ ...f, is_incoming: false })),
    ];

    if (allFriendships.length === 0) {
      set({ pendingRequests: [] });
      return;
    }

    const userIds = allFriendships.map(f => f.is_incoming ? f.user_id : f.friend_id);

    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('id, username, email, total_points')
      .in('id', userIds);

    if (usersError) {
      console.error('[FriendStore] Error loading users:', usersError);
      set({ pendingRequests: [] });
      return;
    }

    const pendingRequests: PendingRequest[] = allFriendships.map(friendship => {
      const otherUserId = friendship.is_incoming ? friendship.user_id : friendship.friend_id;
      const user = users?.find(u => u.id === otherUserId);
      
      if (!user) return null;

      return {
        id: user.id,
        friendship_id: friendship.id,
        user_id: user.id,
        username: user.username,
        email: user.email,
        total_points: user.total_points || 0,
        requester_id: friendship.user_id,
        is_incoming: friendship.is_incoming,
      };
    }).filter((req): req is PendingRequest => req !== null);

    set({ pendingRequests });
    
    // Cache locally for offline access
    await AsyncStorage.setItem(PENDING_REQUESTS_STORAGE_KEY, JSON.stringify(pendingRequests));
  },

  loadFromCache: async () => {
    const friendsStored = await AsyncStorage.getItem(FRIENDS_STORAGE_KEY);
    if (friendsStored) {
      set({ friends: JSON.parse(friendsStored) });
    }
    
    const pendingStored = await AsyncStorage.getItem(PENDING_REQUESTS_STORAGE_KEY);
    if (pendingStored) {
      set({ pendingRequests: JSON.parse(pendingStored) });
    }
  },

  setupRealtimeSubscription: () => {
    const userId = useAuthStore.getState().userId;
    if (!userId) {
      console.log('[FriendStore] No userId, skipping subscription setup');
      return;
    }

    // Remove existing subscription
    const existingSub = get().friendsSubscription;
    if (existingSub) {
      console.log('[FriendStore] Removing existing subscription');
      supabase.removeChannel(existingSub);
    }

    // Always set up friendship subscription (even if no friends yet)
    const channel = supabase
      .channel('friends-updates')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'friendships',
          filter: `or(user_id.eq.${userId},friend_id.eq.${userId})`,
        },
        (payload) => {
          console.log('[FriendStore] Friendship updated:', payload.eventType);
          get().loadFriends();
          get().loadPendingRequests();
        }
      );

    // Get friend IDs for collections subscription
    const friendIds = get().friends.map(f => f.user_id || f.id);
    if (friendIds.length > 0) {
      console.log('[FriendStore] Setting up collections subscription for', friendIds.length, 'friends');
      channel.on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'collections',
          filter: `user_id=in.(${friendIds.join(',')})`,
        },
        (payload) => {
          console.log('[FriendStore] Friend collection updated:', payload.eventType);
          // Reload friends to update stats
          get().loadFriends();
        }
      );
    } else {
      console.log('[FriendStore] No friends yet, skipping collections subscription');
    }

    channel.subscribe();
    set({ friendsSubscription: channel });
    console.log('[FriendStore] Real-time subscription set up');
  },
}));

