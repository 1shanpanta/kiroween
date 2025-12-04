import { View, Text, SafeAreaView, ScrollView, Image } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { supabase } from '@/utils/supabase';
import { useAuthStore } from '@/store/authStore';
import { RetroButton } from '@/components/RetroButton';
import { getRarityTierColor } from '@/utils/gemini';

export default function Compare() {
  const router = useRouter();
  const { friendId } = useLocalSearchParams<{ friendId: string }>();
  const { userId } = useAuthStore();
  const [myCard, setMyCard] = useState<any>(null);
  const [friendCard, setFriendCard] = useState<any>(null);

  useEffect(() => {
    loadTopCards();
  }, []);

  const loadTopCards = async () => {
    const { data: myTop } = await supabase
      .from('collections')
      .select('*')
      .eq('user_id', userId)
      .order('rarity_index', { ascending: false })
      .limit(1)
      .single();

    const { data: friendTop } = await supabase
      .from('collections')
      .select('*')
      .eq('user_id', friendId)
      .order('rarity_index', { ascending: false })
      .limit(1)
      .single();

    setMyCard(myTop);
    setFriendCard(friendTop);
  };

  return (
    <SafeAreaView className="flex-1 bg-void-black">
      <ScrollView className="flex-1 px-4">
        <View className="py-6 gap-4">
          <RetroButton onPress={() => router.back()}>BACK</RetroButton>

          <Text
            style={{ fontFamily: 'PressStart2P' }}
            className="text-standard-green text-lg text-center"
          >
            TOP ARTIFACTS
          </Text>

          {myCard && (
            <View className="border-4 border-standard-green p-4">
              <Text
                style={{ fontFamily: 'PressStart2P' }}
                className="text-phosphor-bright text-xs mb-2"
              >
                YOUR TOP
              </Text>
              <Image
                source={{ uri: myCard.image_uri }}
                className="w-full h-48 mb-2"
                resizeMode="cover"
              />
              <Text
                style={{ fontFamily: 'PressStart2P', color: getRarityTierColor(myCard.rarity_tier) }}
                className="text-sm"
              >
                {myCard.mythic_name}
              </Text>
              <Text
                style={{ fontFamily: 'PressStart2P' }}
                className="text-shadow-green text-xs mt-2"
              >
                RARITY: {myCard.rarity_index}
              </Text>
            </View>
          )}

          {friendCard && (
            <View className="border-4 border-standard-green p-4">
              <Text
                style={{ fontFamily: 'PressStart2P' }}
                className="text-phosphor-bright text-xs mb-2"
              >
                FRIEND TOP
              </Text>
              <Image
                source={{ uri: friendCard.image_uri }}
                className="w-full h-48 mb-2"
                resizeMode="cover"
              />
              <Text
                style={{ fontFamily: 'PressStart2P', color: getRarityTierColor(friendCard.rarity_tier) }}
                className="text-sm"
              >
                {friendCard.mythic_name}
              </Text>
              <Text
                style={{ fontFamily: 'PressStart2P' }}
                className="text-shadow-green text-xs mt-2"
              >
                RARITY: {friendCard.rarity_index}
              </Text>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
