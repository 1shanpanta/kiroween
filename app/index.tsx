import { View, Text, SafeAreaView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { useAuthStore } from '@/store/authStore';
import { RetroButton } from '@/components/RetroButton';

export default function Home() {
  const router = useRouter();
  const { userId, isLoading, loadUser } = useAuthStore();
  const [tapCount, setTapCount] = useState(0);
  const [demoMode, setDemoMode] = useState(false);

  useEffect(() => {
    loadUser();
  }, []);

  useEffect(() => {
    if (!isLoading && !userId) {
      router.replace('/login');
    }
  }, [isLoading, userId]);

  const handleLogoTap = () => {
    const newCount = tapCount + 1;
    setTapCount(newCount);
    if (newCount === 5) {
      setDemoMode(true);
      setTapCount(0);
    }
  };

  if (isLoading) return null;

  return (
    <SafeAreaView className="flex-1 bg-void-black">
      <View className="flex-1 px-4 justify-center items-center gap-6">
        <TouchableOpacity onPress={handleLogoTap}>
          <Text
            style={{ fontFamily: 'PressStart2P' }}
            className="text-standard-green text-2xl text-center mb-8"
          >
            KIROWEEN
          </Text>
        </TouchableOpacity>

        {demoMode && (
          <Text
            style={{ fontFamily: 'PressStart2P' }}
            className="text-phosphor-bright text-xs mb-4"
          >
            DEMO MODE
          </Text>
        )}

        <View className="w-full gap-4">
          <RetroButton onPress={() => router.push('/camera')}>
            SCAN ARTIFACT
          </RetroButton>
          <RetroButton onPress={() => router.push('/collection')}>
            COLLECTION
          </RetroButton>
          <RetroButton onPress={() => router.push('/challenges')}>
            CHALLENGES
          </RetroButton>
          <RetroButton onPress={() => router.push('/friends')}>
            FRIENDS
          </RetroButton>
        </View>
      </View>
    </SafeAreaView>
  );
}
