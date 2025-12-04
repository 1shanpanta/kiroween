import { View, Text, SafeAreaView, ScrollView, Image } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { useScanStore } from '@/store/scanStore';
import { RetroButton } from '@/components/RetroButton';
import { RetroModal } from '@/components/RetroModal';
import { getRarityTierColor } from '@/utils/gemini';

export default function Details() {
  const router = useRouter();
  const { cardId } = useLocalSearchParams<{ cardId: string }>();
  const { cards, deleteCard } = useScanStore();
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const card = cards.find(c => c.id === cardId);

  if (!card) return null;

  const handleDelete = async () => {
    await deleteCard(cardId);
    setShowDeleteModal(false);
    router.back();
  };

  return (
    <SafeAreaView className="flex-1 bg-void-black">
      <ScrollView className="flex-1 px-4">
        <View className="py-6 gap-4">
          <RetroButton onPress={() => router.back()}>BACK</RetroButton>

          <Image
            source={{ uri: card.image_uri }}
            className="w-full h-80 border-4 border-standard-green"
            resizeMode="cover"
          />

          <View className="border-4 border-standard-green p-4">
            <Text
              style={{ fontFamily: 'PressStart2P', color: getRarityTierColor(card.rarity_tier) }}
              className="text-xl mb-3"
            >
              {card.mythic_name}
            </Text>

            <Text
              style={{ fontFamily: 'PressStart2P' }}
              className="text-phosphor-bright text-sm mb-4"
            >
              {card.original_object}
            </Text>

            <View className="gap-2 mb-4">
              <Text style={{ fontFamily: 'PressStart2P' }} className="text-shadow-green text-xs">
                RARITY: {card.rarity_tier} ({card.rarity_index})
              </Text>
              <Text style={{ fontFamily: 'PressStart2P' }} className="text-shadow-green text-xs">
                ELEMENT: {card.element}
              </Text>
              <Text style={{ fontFamily: 'PressStart2P' }} className="text-shadow-green text-xs">
                WEIGHT: {card.weight_class} ({card.estimated_weight})
              </Text>
              <Text style={{ fontFamily: 'PressStart2P' }} className="text-shadow-green text-xs">
                SIZE: {card.dimensions}
              </Text>
            </View>

            <Text
              style={{ fontFamily: 'PressStart2P' }}
              className="text-standard-green text-xs leading-5"
            >
              {card.flavor_text}
            </Text>
          </View>

          <RetroButton onPress={() => setShowDeleteModal(true)} danger>
            DELETE ARTIFACT
          </RetroButton>
        </View>
      </ScrollView>

      <RetroModal
        visible={showDeleteModal}
        title="DELETE ARTIFACT"
        message="This action cannot be undone. Proceed?"
        onConfirm={handleDelete}
        onCancel={() => setShowDeleteModal(false)}
      />
    </SafeAreaView>
  );
}
