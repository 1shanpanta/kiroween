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
import { useChallengeStore } from '@/store/challengeStore';
import { useUserStore } from '@/store/userStore';

SplashScreen.preventAutoHideAsync();

export default function Layout() {
  const [loaded, error] = useFonts({
    'PressStart2P': PressStart2P_400Regular,
  });
  const { initialize, email, name, initialized, loading } = useAuthStore();
  const { checkAndRefreshDailyChallenges } = useChallengeStore();
  const { loadUserStats } = useUserStore();
  const segments = useSegments();
  const router = useRouter();

  // Initialize auth
  useEffect(() => {
    initialize();
  }, []);

  // Initialize challenges and user stats when auth is ready
  useEffect(() => {
    if (initialized && !loading && email && name) {
      checkAndRefreshDailyChallenges();
      loadUserStats();
    }
  }, [initialized, loading, email, name]);

  // Handle navigation based on auth state
  useEffect(() => {
    if (!initialized || loading) return;

    const inAuthGroup = segments[0] === 'login';
    const hasUser = email && name;

    if (!hasUser && !inAuthGroup) {
      // Redirect to login if no email/name
      router.replace('/login');
    } else if (hasUser && segments[0] === 'login') {
      // Redirect to home if user is set and on login page
      router.replace('/');
    }
  }, [email, name, segments, initialized, loading]);

  useEffect(() => {
    if (loaded || error) {
      SplashScreen.hideAsync();
    }
  }, [loaded, error]);

  // Disable font scaling globally
  useEffect(() => {
    if (Platform.OS !== 'web') {
      // Override Text component's defaultProps to disable font scaling
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
            contentStyle: { backgroundColor: '#000000' },
            headerStyle: { backgroundColor: '#000000' },
          }}
        />
      </GestureHandlerRootView>
    </SafeAreaProvider>
  );
}
