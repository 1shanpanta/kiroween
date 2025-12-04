import { View, Text, SafeAreaView, ActivityIndicator } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useEffect } from 'react';
import { classifyArtifact } from '@/utils/gemini';
import { useScanStore } from '@/store/scanStore';

export default function Processing() {
  const router = useRouter();
  const { imageUri, imageBase64 } = useLocalSearchParams<{ imageUri: string; imageBase64: string }>();
  const { setCurrentCard, setProcessing } = useScanStore();

  useEffect(() => {
    processImage();
  }, []);

  const processImage = async () => {
    const card = await classifyArtifact(imageBase64);
    setCurrentCard(card);
    setProcessing(false);
    router.replace({
      pathname: '/card',
      params: { imageUri },
    });
  };

  return (
    <SafeAreaView className="flex-1 bg-void-black">
      <View className="flex-1 items-center justify-center px-4">
        <ActivityIndicator size="large" color="#00FF00" />
        <Text
          style={{ fontFamily: 'PressStart2P' }}
          className="text-standard-green text-xs mt-6 text-center"
        >
          ANALYZING ARTIFACT...
        </Text>
      </View>
    </SafeAreaView>
  );
}
