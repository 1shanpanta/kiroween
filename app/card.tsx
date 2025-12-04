import { View, Text, SafeAreaView, Image, ScrollView } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useScanStore } from '@/store/scanStore';
import { useAuthStore } from '@/store/authStore';
import { RetroButton } from '@/components/RetroButton';
import { getRarityTierColor } from '@/utils/gemini';
import { uploadImage } from '@/utils/imageStorage';
import { successHaptic } from '@/utils/haptics';

export default function Card() {
  const router = useRouter();
  const { imageUri } = useLocalSearchParams<{ imageUri: string }>();
  const { currentCard, saveCard } = useScanStore();
  const { userId } = useAuthStore();

  if (!currentCard) return null;

  const handleSave = async () => {
    if (!userId) return;
    
    const uploadedUri = await uploadImage(imageUri, userId);
    await saveCard(currentCard, uploadedUri, userId);
    successHaptic();
    router.push('/collection');
  };

  return (
    <SafeAreaView className="flex-1 bg-void-black">
      <ScrollView className="flex-1 px-4">
        <View className="py-6 gap-4">
          <Image
            source={{ uri: imageUri }}
            className="w-full h-64 border-4 border-standard-green"
            resizeMode="cover"
          />

          <View className="border-4 border-standard-green p-4">
            <Text
              style={{ fontFamily: 'PressStart2P', color: getRarityTierColor(currentCard.rarity_tier) }}
              className="text-lg mb-2"
            >
              {currentCard.mythic_name}
            </Text>

            <Text
              style={{ fontFamily: 'PressStart2P' }}
              className="text-phosphor-bright text-xs mb-4"
            >
              {currentCard.original_object}
            </Text>

            <View className="gap-2 mb-4">
              <Text style={{ fontFamily: 'PressStart2P' }} className="text-shadow-green text-xs">
                RARITY: {currentCard.rarity_tier} ({currentCard.rarity_index})
              </Text>
              <Text style={{ fontFamily: 'PressStart2P' }} className="text-shadow-green text-xs">
                ELEMENT: {currentCard.element}
              </Text>
              <Text style={{ fontFamily: 'PressStart2P' }} className="text-shadow-green text-xs">
                WEIGHT: {currentCard.weight_class}
              </Text>
            </View>

            <Text
              style={{ fontFamily: 'PressStart2P' }}
              className="text-standard-green text-xs leading-5"
            >
              {currentCard.flavor_text}
            </Text>
          </View>

          <View className="gap-3">
            <RetroButton onPress={handleSave}>SAVE TO COLLECTION</RetroButton>
            <RetroButton onPress={() => router.back()} danger>DISCARD</RetroButton>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
