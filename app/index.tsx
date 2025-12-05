import { Stack, useRouter } from 'expo-router';
import { View, Text, Pressable } from 'react-native';
import { useState } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { RetroButton } from '@/components/RetroButton';
import { ScanlinesOverlay } from '@/components/ScanlinesOverlay';

export default function Home() {
  const router = useRouter();
  const [logoTaps, setLogoTaps] = useState(0);
  const [demoMode, setDemoMode] = useState(false);
  const insets = useSafeAreaInsets();

  const handleLogoTap = () => {
    const newTaps = logoTaps + 1;
    setLogoTaps(newTaps);
    if (newTaps >= 5) {
      setDemoMode(!demoMode);
      setLogoTaps(0);
    }
    setTimeout(() => setLogoTaps(0), 2000);
  };

  return (
    <View 
      className="flex-1 bg-void-black items-center justify-center px-8"
      style={{ paddingBottom: insets.bottom + 20, paddingTop: insets.top }}>
      <Stack.Screen options={{ headerShown: false }} />
      <ScanlinesOverlay />
      
      <Pressable onPress={handleLogoTap} className="mb-12">
        <Text
          className="text-standard-green text-3xl text-center mb-2"
          style={{ fontFamily: 'PressStart2P' }}>
          PROJECT:
        </Text>
        <Text
          className="text-standard-green text-4xl text-center"
          style={{ fontFamily: 'PressStart2P' }}>
          POKÉDEX
        </Text>
        {demoMode && (
          <Text className="text-phosphor-bright text-xs mt-4 text-center" style={{ fontFamily: 'PressStart2P' }}>
            [ DEMO MODE ]
          </Text>
        )}
      </Pressable>

      <View className="w-full items-center gap-6">
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
  );
}
