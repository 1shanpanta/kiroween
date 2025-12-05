import { Stack, useRouter } from 'expo-router';
import { View, Text, Image, TouchableOpacity, ScrollView, RefreshControl, FlatList, Dimensions } from 'react-native';
import { useEffect, useState } from 'react';
import { useScanStore, getRarityTier, getRarityTierColor } from '@/store/scanStore';
import { useAuthStore } from '@/store/authStore';
import { playClickSound } from '@/utils/audio';
import { triggerHaptic } from '@/utils/haptics';
import { GestureDetector, Gesture } from 'react-native-gesture-handler';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { RetroModal } from '@/components/RetroModal';
import { supabase } from '@/utils/supabase';

const { width } = Dimensions.get('window');
const CARD_SIZE = (width - 48) / 2; // 2 columns with padding

export default function CollectionScreen() {
  const router = useRouter();
  const { savedCards, loadSavedCards, getCardCount, clearAllCards } = useScanStore();
  const { userId } = useAuthStore();
  const [refreshing, setRefreshing] = useState(false);
  const [showClearModal, setShowClearModal] = useState(false);
  const insets = useSafeAreaInsets();

  useEffect(() => {
    loadSavedCards();

    // Set up realtime subscription for own collections
    if (userId) {
      const channel = supabase
        .channel('my-collections-changes')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'collections',
            filter: `user_id=eq.${userId}`,
          },
          () => {
            console.log('[Collection] Collection updated, reloading...');
            loadSavedCards();
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [userId]);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadSavedCards();
    setRefreshing(false);
  };

  const handleCardPress = (cardId: string) => {
    playClickSound();
    triggerHaptic('light');
    router.push(`/details?id=${cardId}`);
  };

  // Swipe-to-delete gesture handler
  const handleSwipeDelete = async (cardId: string) => {
    triggerHaptic('medium');
    // Delete functionality is handled in details screen
    // This is here for future swipe-to-delete in collection
  };

  const handleClearAll = async () => {
    await clearAllCards();
    setShowClearModal(false);
    triggerHaptic('success');
  };

  const handleBack = () => {
    playClickSound();
    triggerHaptic('light');
    router.back();
  };

  const renderCard = ({ item }: { item: typeof savedCards[0] }) => {
    return (
      <TouchableOpacity
        onPress={() => handleCardPress(item.id!)}
        className="mb-4 border-4 border-standard-green"
        style={{ 
          width: CARD_SIZE,
          marginRight: 16,
        }}>
        {item.image_uri ? (
          <Image
            source={{ uri: item.image_uri }}
            style={{ width: CARD_SIZE - 8, height: CARD_SIZE - 8, resizeMode: 'cover' }}
            onError={(error) => {
              console.error('[Collection] Failed to load card image:', item.image_uri?.substring(0, 50), error.nativeEvent?.error);
            }}
            defaultSource={require('@/assets/icon.png')}
          />
        ) : (
          <View 
            className="bg-shadow-green items-center justify-center"
            style={{ width: CARD_SIZE - 8, height: CARD_SIZE - 8 }}>
            <Text className="text-standard-green text-xs text-center px-2" style={{ fontFamily: 'PressStart2P' }}>
              NO IMAGE
            </Text>
          </View>
        )}
        <View className="p-2 bg-void-black border-t-4 border-standard-green">
          <Text 
            className="text-phosphor-bright text-xs" 
            numberOfLines={1}
            style={{ fontFamily: 'PressStart2P' }}>
            {item.mythic_name.toUpperCase()}
          </Text>
          <Text 
            className="text-shadow-green text-xs mt-1" 
            numberOfLines={1}
            style={{ fontFamily: 'PressStart2P', fontSize: 8 }}>
            {item.element}
          </Text>
          {(() => {
            const finalRarity = item.adjustedRarity ?? item.rarity_index;
            const tier = item.rarityTier || getRarityTier(finalRarity);
            const tierColor = getRarityTierColor(tier);
            return (
              <Text 
                className="text-xs mt-1" 
                style={{ 
                  fontFamily: 'PressStart2P', 
                  fontSize: 8,
                  color: tierColor,
                }}>
                {tier} ({finalRarity}/100)
              </Text>
            );
          })()}
        </View>
      </TouchableOpacity>
    );
  };

  if (savedCards.length === 0) {
    return (
      <View className="flex-1 bg-void-black">
        <Stack.Screen
          options={{
            title: 'CORTEX',
            headerStyle: { backgroundColor: '#000000' },
            headerTintColor: '#00FF00',
            headerTitleStyle: { fontFamily: 'PressStart2P' },
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
        <RetroModal
          visible={showClearModal}
          title="CLEAR ALL RECORDS"
          message="Are you sure you want to clear all cortex records? This action cannot be undone."
          confirmText="CLEAR ALL"
          cancelText="CANCEL"
          variant="danger"
          onConfirm={handleClearAll}
          onCancel={() => {
            triggerHaptic('light');
            setShowClearModal(false);
          }}
        />
        <ScrollView
          className="flex-1"
          contentContainerClassName="flex-1 items-center justify-center p-8"
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#00FF00" />
          }>
          <Text className="text-phosphor-bright text-xl text-center mb-4" style={{ fontFamily: 'PressStart2P' }}>
            CORTEX EMPTY
          </Text>
          <Text className="text-shadow-green text-xs text-center mb-8" style={{ fontFamily: 'PressStart2P' }}>
            No artifacts have been scanned and saved to your cortex yet.
          </Text>
          <TouchableOpacity
            onPress={() => router.push('/camera')}
            className="bg-phosphor-bright px-6 py-3 border-4 border-standard-green">
            <Text className="text-void-black" style={{ fontFamily: 'PressStart2P', fontSize: 10 }}>
              INITIATE SCAN
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-void-black">
      <Stack.Screen
        options={{
          title: `CORTEX (${getCardCount()})`,
          headerTitleAlign: 'center',
          headerStyle: { backgroundColor: '#000000' },
          headerTintColor: '#00FF00',
          headerTitleStyle: { fontFamily: 'PressStart2P', fontSize: 10 },
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
          headerRight: () => (
            savedCards.length > 0 ? (
              <TouchableOpacity
                onPress={() => {
                  triggerHaptic('medium');
                  setShowClearModal(true);
                }}
                className="mr-4"
              >
                <Text className="text-fatal-red text-xl">🗑️</Text>
              </TouchableOpacity>
            ) : null
          ),
        }}
      />
      <RetroModal
        visible={showClearModal}
        title="CLEAR ALL RECORDS"
        message="Are you sure you want to clear all cortex records? This action cannot be undone."
        confirmText="CLEAR ALL"
        cancelText="CANCEL"
        variant="danger"
        onConfirm={handleClearAll}
        onCancel={() => {
          triggerHaptic('light');
          setShowClearModal(false);
        }}
      />
      <FlatList
        data={savedCards}
        renderItem={renderCard}
        keyExtractor={(item) => item.id || item.timestamp.toString()}
        numColumns={2}
        contentContainerStyle={{ padding: 16, paddingBottom: insets.bottom + 16 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#00FF00" />
        }
        ListHeaderComponent={
          <View className="mb-4 pb-4 border-b-4 border-standard-green">
            <Text className="text-phosphor-bright text-lg text-center" style={{ fontFamily: 'PressStart2P' }}>
              ARTIFACT COLLECTION
            </Text>
            <Text className="text-shadow-green text-xs text-center mt-2" style={{ fontFamily: 'PressStart2P' }}>
              {getCardCount()} ARTIFACTS SCANNED
            </Text>
          </View>
        }
      />
    </View>
  );
}

