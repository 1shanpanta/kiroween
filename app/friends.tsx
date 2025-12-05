import { Stack, useRouter, useFocusEffect } from 'expo-router';
import { View, Text, FlatList, TouchableOpacity, TextInput, ScrollView, ActivityIndicator } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useEffect, useState, useCallback, useRef } from 'react';
import { useFriendStore, Friend as FriendType, PendingRequest, SearchedUser } from '@/store/friendStore';
import { useAuthStore } from '@/store/authStore';
import { RetroButton } from '@/components/RetroButton';
import { ScanlinesOverlay } from '@/components/ScanlinesOverlay';
import { copyToClipboard } from '@/utils/clipboard';
import { playClickSound } from '@/utils/audio';
import { triggerHaptic } from '@/utils/haptics';

export default function FriendsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { userId } = useAuthStore();
  const {
    friends,
    pendingRequests,
    searchResults,
    loading,
    searching,
    error,
    searchUsers,
    sendFriendRequest,
    acceptFriendRequest,
    rejectFriendRequest,
    loadFriends,
    loadPendingRequests,
    clearSearch,
    setupRealtimeSubscription,
  } = useFriendStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'friends' | 'pending'>('friends');
  const searchTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const init = async () => {
      await loadFriends();
      await loadPendingRequests();
      // Set up real-time subscriptions after loading
      setupRealtimeSubscription();
    };
    
    init();

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
      // Clean up subscription
      const sub = useFriendStore.getState().friendsSubscription;
      if (sub) {
        const { supabase } = require('@/utils/supabase');
        supabase.removeChannel(sub);
      }
    };
  }, []);

  // Refresh when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      loadFriends();
      loadPendingRequests();
      setupRealtimeSubscription();
    }, [loadFriends, loadPendingRequests, setupRealtimeSubscription])
  );

  const handleSearchChange = useCallback((text: string) => {
    setSearchQuery(text);
    
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    if (!text.trim()) {
      clearSearch();
      return;
    }

    const timeout = setTimeout(() => {
      searchUsers(text);
    }, 500);
    
    searchTimeoutRef.current = timeout;
  }, [searchUsers, clearSearch]);

  const handleCopyUserId = async () => {
    if (userId) {
      await copyToClipboard(userId);
      triggerHaptic('medium');
    }
  };

  const handleSendRequest = async (friendId: string) => {
    triggerHaptic('medium');
    await sendFriendRequest(friendId);
    await loadPendingRequests();
  };

  const handleAcceptRequest = async (friendshipId: string) => {
    triggerHaptic('medium');
    await acceptFriendRequest(friendshipId);
  };

  const handleRejectRequest = async (friendshipId: string) => {
    triggerHaptic('medium');
    await rejectFriendRequest(friendshipId);
  };

  const renderFriend = ({ item }: { item: FriendType }) => (
    <View className="border-4 border-standard-green p-4 mb-4 bg-void-black">
      <View className="flex-row justify-between items-center mb-2">
        <View className="flex-row items-center">
          <Text className="text-2xl mr-2">👤</Text>
          <Text className="text-standard-green text-lg" style={{ fontFamily: 'PressStart2P' }}>
            {item.username}
          </Text>
        </View>
        <View className={`w-3 h-3 rounded-full ${item.isOnline ? 'bg-standard-green' : 'bg-shadow-green'}`} />
      </View>
      
      <View className="flex-row justify-between items-center mb-4">
        <Text className="text-shadow-green text-xs" style={{ fontFamily: 'PressStart2P' }}>
          SCORE: {item.total_rarity || 0}
        </Text>
        <Text className="text-shadow-green text-xs" style={{ fontFamily: 'PressStart2P' }}>
          ARTIFACTS: {item.artifacts_count || 0}
        </Text>
      </View>

      <View className="flex-row space-x-2">
        <TouchableOpacity 
          onPress={() => router.push({ pathname: '/compare', params: { friendId: item.user_id || item.id } })}
          className="flex-1 border-2 border-standard-green p-2 items-center"
        >
          <Text className="text-standard-green text-xs" style={{ fontFamily: 'PressStart2P' }}>
            COMPARE
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          className="flex-1 border-2 border-shadow-green p-2 items-center"
          disabled
        >
          <Text className="text-shadow-green text-xs" style={{ fontFamily: 'PressStart2P' }}>
            PROFILE
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderPendingRequest = ({ item }: { item: PendingRequest }) => {
    const isIncoming = item.is_incoming !== false;
    
    return (
      <View className={`border-4 ${isIncoming ? 'border-shadow-green' : 'border-standard-green'} p-4 mb-4 bg-void-black`}>
        <View className="flex-row justify-between items-center mb-2">
          <View className="flex-row items-center flex-1">
            <Text className="text-2xl mr-2">👤</Text>
            <View className="flex-1">
              <Text className="text-standard-green text-lg" style={{ fontFamily: 'PressStart2P' }}>
                {item.username}
              </Text>
              {!isIncoming && (
                <Text className="text-shadow-green text-xs mt-1" style={{ fontFamily: 'PressStart2P' }}>
                  WAITING FOR RESPONSE...
                </Text>
              )}
            </View>
          </View>
        </View>
        
        <View className="mb-4">
          <Text className="text-shadow-green text-xs" style={{ fontFamily: 'PressStart2P' }}>
            SCORE: {item.total_points}
          </Text>
        </View>

        {isIncoming ? (
          <View className="flex-row space-x-2">
            <TouchableOpacity 
              onPress={() => handleAcceptRequest(item.friendship_id)}
              className="flex-1 border-2 border-standard-green p-2 items-center bg-void-black"
              disabled={loading}
            >
              <Text className="text-standard-green text-xs" style={{ fontFamily: 'PressStart2P' }}>
                ACCEPT
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              onPress={() => handleRejectRequest(item.friendship_id)}
              className="flex-1 border-2 border-fatal-red p-2 items-center bg-void-black"
              disabled={loading}
            >
              <Text className="text-fatal-red text-xs" style={{ fontFamily: 'PressStart2P' }}>
                REJECT
              </Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View className="border-2 border-shadow-green p-2 items-center">
            <Text className="text-shadow-green text-xs" style={{ fontFamily: 'PressStart2P' }}>
              REQUEST SENT
            </Text>
          </View>
        )}
      </View>
    );
  };

  const renderSearchResult = ({ item }: { item: SearchedUser }) => {
    const getActionButton = () => {
      if (item.friendship_status === 'accepted') {
        return (
          <TouchableOpacity 
            className="flex-1 border-2 border-shadow-green p-2 items-center"
            disabled
          >
            <Text className="text-shadow-green text-xs" style={{ fontFamily: 'PressStart2P' }}>
              FRIENDS
            </Text>
          </TouchableOpacity>
        );
      }
      
      if (item.friendship_status === 'pending') {
        return (
          <TouchableOpacity 
            className="flex-1 border-2 border-shadow-green p-2 items-center"
            disabled
          >
            <Text className="text-shadow-green text-xs" style={{ fontFamily: 'PressStart2P' }}>
              PENDING
            </Text>
          </TouchableOpacity>
        );
      }

      return (
        <TouchableOpacity 
          onPress={() => handleSendRequest(item.id)}
          className="flex-1 border-2 border-standard-green p-2 items-center"
          disabled={loading}
        >
          <Text className="text-standard-green text-xs" style={{ fontFamily: 'PressStart2P' }}>
            SEND REQUEST
          </Text>
        </TouchableOpacity>
      );
    };

    return (
      <View className="border-4 border-standard-green p-4 mb-4 bg-void-black">
        <View className="flex-row justify-between items-center mb-2">
          <View className="flex-row items-center flex-1">
            <Text className="text-2xl mr-2">👤</Text>
            <View className="flex-1">
              <Text className="text-standard-green text-lg" style={{ fontFamily: 'PressStart2P' }}>
                {item.username}
              </Text>
              <TouchableOpacity 
                onPress={() => copyToClipboard(item.id)}
                className="mt-1"
              >
                <Text className="text-shadow-green text-xs" style={{ fontFamily: 'PressStart2P' }}>
                  ID: {item.id.substring(0, 8)}...
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
        
        <View className="mb-4">
          <Text className="text-shadow-green text-xs" style={{ fontFamily: 'PressStart2P' }}>
            SCORE: {item.total_points}
          </Text>
        </View>

        {getActionButton()}
      </View>
    );
  };

  const handleBack = () => {
    playClickSound();
    triggerHaptic('light');
    router.back();
  };

  return (
    <View className="flex-1 bg-void-black" style={{ paddingTop: insets.top }}>
      <Stack.Screen 
        options={{
          title: 'FRIENDS',
          headerTitleAlign: 'center',
          headerStyle: { backgroundColor: '#000000' },
          headerTintColor: '#8bac0f',
          headerTitleStyle: { fontFamily: 'PressStart2P', fontSize: 12 },
          headerLeft: () => (
            <TouchableOpacity
              onPress={handleBack}
              className="ml-4 px-3 py-2"
            >
              <Text className="text-standard-green text-sm" style={{ fontFamily: 'PressStart2P' }}>
                ←
              </Text>
            </TouchableOpacity>
          ),
        }} 
      />
      <ScanlinesOverlay />
      
      {/* Fixed Header Section */}
      <View className="px-4 py-4 border-b-4 border-standard-green bg-void-black" style={{ marginTop: 0 }}>
        <Text className="text-shadow-green text-xs text-center mb-4" style={{ fontFamily: 'PressStart2P' }}>
          NETWORK STATUS
        </Text>

        {/* User ID Display */}
        {userId && (
          <View className="mb-4">
            <Text className="text-shadow-green text-xs mb-2" style={{ fontFamily: 'PressStart2P' }}>
              YOUR ID:
            </Text>
            <TouchableOpacity 
              onPress={handleCopyUserId}
              className="border-2 border-standard-green p-2 bg-void-black flex-row items-center justify-between"
            >
              <Text className="text-standard-green text-xs flex-1" style={{ fontFamily: 'PressStart2P' }} numberOfLines={1}>
                {userId}
              </Text>
              <Text className="text-standard-green text-xs ml-2" style={{ fontFamily: 'PressStart2P' }}>
                COPY
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Search Input */}
        <View className="mb-4">
          <Text className="text-shadow-green text-xs mb-2" style={{ fontFamily: 'PressStart2P' }}>
            SEARCH:
          </Text>
          <TextInput
            value={searchQuery}
            onChangeText={handleSearchChange}
            placeholder="Username or ID"
            placeholderTextColor="#008000"
            autoCapitalize="none"
            autoCorrect={false}
            className="text-standard-green text-sm border-4 border-standard-green px-4 py-3 bg-void-black"
            style={{
              fontFamily: 'PressStart2P',
              color: '#00FF00',
            }}
          />
          {searching && (
            <View className="mt-2 items-center">
              <ActivityIndicator size="small" color="#00FF00" />
            </View>
          )}
          {error && (
            <View className="mt-2 border-2 border-fatal-red p-2">
              <Text className="text-fatal-red text-xs text-center" style={{ fontFamily: 'PressStart2P' }}>
                {error}
              </Text>
            </View>
          )}
        </View>

        {/* Search Results */}
        {searchResults.length > 0 && (
          <View className="mb-4 max-h-64">
            <Text className="text-shadow-green text-xs mb-2" style={{ fontFamily: 'PressStart2P' }}>
              RESULTS:
            </Text>
            <ScrollView 
              nestedScrollEnabled
              showsVerticalScrollIndicator={true}
              className="max-h-64"
            >
              {searchResults.map((result) => (
                <View key={result.id}>
                  {renderSearchResult({ item: result })}
                </View>
              ))}
            </ScrollView>
          </View>
        )}

        {/* Tabs */}
        <View className="flex-row mb-2">
          <TouchableOpacity
            onPress={() => {
              setActiveTab('friends');
              triggerHaptic('light');
            }}
            className={`flex-1 border-4 p-2 mr-2 ${activeTab === 'friends' ? 'border-standard-green bg-void-black' : 'border-shadow-green bg-void-black'}`}
          >
            <Text 
              className={`text-center text-xs ${activeTab === 'friends' ? 'text-standard-green' : 'text-shadow-green'}`}
              style={{ fontFamily: 'PressStart2P' }}
            >
              FRIENDS ({friends.length})
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => {
              setActiveTab('pending');
              triggerHaptic('light');
            }}
            className={`flex-1 border-4 p-2 ${activeTab === 'pending' ? 'border-standard-green bg-void-black' : 'border-shadow-green bg-void-black'}`}
          >
            <Text 
              className={`text-center text-xs ${activeTab === 'pending' ? 'text-standard-green' : 'text-shadow-green'}`}
              style={{ fontFamily: 'PressStart2P' }}
            >
              PENDING ({pendingRequests.filter(r => r.is_incoming !== false).length})
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Scrollable Content */}
      <ScrollView 
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 20 }}
        showsVerticalScrollIndicator={true}
      >
        {activeTab === 'friends' ? (
          <View className="px-4 pt-4">
            {loading && friends.length === 0 ? (
              <View className="items-center py-8">
                <ActivityIndicator size="large" color="#00FF00" />
                <Text className="text-shadow-green text-xs mt-4" style={{ fontFamily: 'PressStart2P' }}>
                  LOADING...
                </Text>
              </View>
            ) : friends.length === 0 ? (
              <View className="border-4 border-shadow-green p-4">
                <Text className="text-shadow-green text-xs text-center" style={{ fontFamily: 'PressStart2P' }}>
                  NO FRIENDS YET
                </Text>
                <Text className="text-shadow-green text-xs text-center mt-2" style={{ fontFamily: 'PressStart2P' }}>
                  SEARCH FOR FRIENDS ABOVE
                </Text>
              </View>
            ) : (
              friends.sort((a, b) => (b.total_rarity || 0) - (a.total_rarity || 0)).map((friend) => (
                <View key={friend.user_id || friend.id}>
                  {renderFriend({ item: friend })}
                </View>
              ))
            )}
          </View>
        ) : (
          <View className="px-4 pt-4">
            {loading && pendingRequests.length === 0 ? (
              <View className="items-center py-8">
                <ActivityIndicator size="large" color="#00FF00" />
                <Text className="text-shadow-green text-xs mt-4" style={{ fontFamily: 'PressStart2P' }}>
                  LOADING...
                </Text>
              </View>
            ) : pendingRequests.length === 0 ? (
              <View className="border-4 border-shadow-green p-4">
                <Text className="text-shadow-green text-xs text-center" style={{ fontFamily: 'PressStart2P' }}>
                  NO PENDING REQUESTS
                </Text>
              </View>
            ) : (
              pendingRequests.map((request) => (
                <View key={request.friendship_id}>
                  {renderPendingRequest({ item: request })}
                </View>
              ))
            )}
          </View>
        )}
      </ScrollView>

      {/* Fixed Bottom Button */}
      <View className="p-4 bg-void-black border-t-4 border-standard-green" style={{ paddingBottom: insets.bottom }}>
        <RetroButton title="BACK TO BASE" onPress={() => router.back()} variant="secondary" />
      </View>
    </View>
  );
}
