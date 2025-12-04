import { View, Text, SafeAreaView, FlatList, TouchableOpacity, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { useEffect } from 'react';
import { useScanStore } from '@/store/scanStore';
import { useAuthStore } from '@/store/authStore';
import { RetroButton } from '@/components/RetroButton';
import { getRarityTierColor } from '@/utils/gemini';

export default function Collection() {
  const router = useRouter();
  const { cards, loadCards } = useScanStore();
  const { userId } = useAuthStore();

  useEffect(() => {
    if (userId) loadCards(userId);
  }, [userId]);

  return (
    <SafeAreaView className="flex-1 bg-void-black">
      <View className="flex-1 px-4">
        <View className="py-4">
          <Text
            style={{ fontFamily: 'PressStart2P' }}
            className="text-standard-green text-lg mb-4"
          >
            COLLECTION
          </Text>
          <RetroButton onPress={() => router.back()}>BACK</RetroButton>
        </View>

        {cards.length === 0 ? (
          <View className="flex-1 items-center justify-center">
            <Text
              style={{ fontFamily: 'PressStart2P' }}
              className="text-shadow-green text-xs text-center"
            >
              NO ARTIFACTS SCANNED
            </Text>
          </View>
        ) : (
          <FlatList
            data={cards}
            numColumns={2}
            keyExtractor={(item) => item.id}
            columnWrapperStyle={{ gap: 12 }}
            contentContainerStyle={{ gap: 12, paddingBottom: 20 }}
            renderItem={({ item }) => (
              <TouchableOpacity
                onPress={() => router.push({ pathname: '/details', params: { cardId: item.id } })}
                className="flex-1 border-4 border-standard-green p-2"
              >
                <Image
                  source={{ uri: item.image_uri }}
                  className="w-full h-32 mb-2"
                  resizeMode="cover"
                />
                <Text
                  style={{ fontFamily: 'PressStart2P', color: getRarityTierColor(item.rarity_tier) }}
                  className="text-xs"
                  numberOfLines={2}
                >
                  {item.mythic_name}
                </Text>
              </TouchableOpacity>
            )}
          />
        )}
      </View>
    </SafeAreaView>
  );
}
