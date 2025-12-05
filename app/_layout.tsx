import '../global.css';

import { useFonts } from 'expo-font';
import { Stack, useRouter, useSegments } from 'expo-router';
import React, { useEffect } from 'react';
import { Platform, Text } from 'react-native';
import * as SplashScreen from 'expo-splash-screen';
import { PressStart2P_400Regular } from '@expo-google-fonts/press-start-2p';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useAuthStore } from '@/store/authStore';

SplashScreen.preventAutoHideAsync();

export default function Layout() {
  const [loaded, error] = useFonts({
    'PressStart2P': PressStart2P_400Regular,
  });
  const { initialize, email, name, loading } = useAuthStore();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    initialize();
  }, []);

  useEffect(() => {
    if (loading) return;

    const inAuthGroup = segments[0] === 'login';
    const hasUser = email && name;

    if (!hasUser && !inAuthGroup) {
      router.replace('/login');
    } else if (hasUser && segments[0] === 'login') {
      router.replace('/');
    }
  }, [email, name, segments, loading]);

  useEffect(() => {
    if (loaded || error) {
      SplashScreen.hideAsync();
    }
  }, [loaded, error]);

  useEffect(() => {
    if (Platform.OS !== 'web') {
      const OriginalText = Text as any;
      if (OriginalText.defaultProps) {
        OriginalText.defaultProps.allowFontScaling = false;
      } else {
        OriginalText.defaultProps = { allowFontScaling: false };
      }
    }
  }, []);

  if (!loaded && !error) {
    return null;
  }

  return (
    <SafeAreaProvider>
      <GestureHandlerRootView className="flex-1 bg-void-black">
        <Stack
          screenOptions={{
            headerShown: false,
          }}
        />
      </GestureHandlerRootView>
    </SafeAreaProvider>
  );
}
