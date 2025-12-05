import { Stack, useRouter } from 'expo-router';
import { View, Text, TextInput, ActivityIndicator } from 'react-native';
import { useEffect, useState } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuthStore } from '@/store/authStore';
import { RetroButton } from '@/components/RetroButton';
import { ScanlinesOverlay } from '@/components/ScanlinesOverlay';
import { playClickSound } from '@/utils/audio';
import { triggerHaptic } from '@/utils/haptics';

export default function LoginScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { setUser, loading, email, name } = useAuthStore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [emailInput, setEmailInput] = useState('');
  const [nameInput, setNameInput] = useState('');

  useEffect(() => {
    // If user is already set, redirect to home
    if (email && name && !loading) {
      router.replace('/');
    }
  }, [email, name, loading]);

  const handleSubmit = async () => {
    if (!emailInput.trim() || !nameInput.trim()) {
      setError('Email and name are required');
      triggerHaptic('error');
      return;
    }

    try {
      setError(null);
      setIsSubmitting(true);
      playClickSound();
      triggerHaptic('medium');

      await setUser(emailInput.trim(), nameInput.trim());
      
      triggerHaptic('success');
      console.log('[LoginScreen] ✅ User set successfully');
      
      // Redirect to home
      router.replace('/');
    } catch (err: any) {
      console.error('Set user error:', err);
      setError(err.message || 'Failed to set user');
      triggerHaptic('error');
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <View className="flex-1 bg-void-black items-center justify-center">
        <Text className="text-standard-green text-lg mb-4" style={{ fontFamily: 'PressStart2P' }}>
          INITIALIZING...
        </Text>
        <ActivityIndicator size="large" color="#00FF00" />
      </View>
    );
  }

  return (
    <View 
      className="flex-1 bg-void-black items-center justify-center px-8"
      style={{ paddingTop: insets.top, paddingBottom: insets.bottom }}
    >
      <Stack.Screen options={{ headerShown: false }} />
      <ScanlinesOverlay />
      
      {/* Logo/Title */}
      <View className="mb-12 items-center">
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
      </View>

      {/* Welcome Message */}
      <View className="mb-8 items-center">
        <Text 
          className="text-phosphor-bright text-lg text-center mb-4"
          style={{ fontFamily: 'PressStart2P' }}
        >
          WELCOME TO THE CORTEX
        </Text>
        <Text 
          className="text-shadow-green text-xs text-center leading-5"
          style={{ fontFamily: 'PressStart2P' }}
        >
          Enter your email and name to begin scanning artifacts.
        </Text>
      </View>

      {/* Email Input */}
      <View className="w-full mb-4">
        <Text className="text-shadow-green text-xs mb-2" style={{ fontFamily: 'PressStart2P' }}>
          EMAIL:
        </Text>
        <TextInput
          value={emailInput}
          onChangeText={setEmailInput}
          placeholder="your@email.com"
          placeholderTextColor="#008000"
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
          className="text-standard-green text-sm border-4 border-standard-green px-4 py-3 bg-void-black"
          style={{
            fontFamily: 'PressStart2P',
            color: '#00FF00',
          }}
        />
      </View>

      {/* Name Input */}
      <View className="w-full mb-6">
        <Text className="text-shadow-green text-xs mb-2" style={{ fontFamily: 'PressStart2P' }}>
          NAME:
        </Text>
        <TextInput
          value={nameInput}
          onChangeText={setNameInput}
          placeholder="YOUR NAME"
          placeholderTextColor="#008000"
          autoCapitalize="words"
          className="text-standard-green text-sm border-4 border-standard-green px-4 py-3 bg-void-black"
          style={{
            fontFamily: 'PressStart2P',
            color: '#00FF00',
          }}
        />
      </View>

      {/* Submit Button */}
      <View className="w-full mb-4">
        <RetroButton
          title={isSubmitting ? 'ENTERING...' : 'ENTER CORTEX'}
          onPress={handleSubmit}
          disabled={isSubmitting || !emailInput.trim() || !nameInput.trim()}
          loading={isSubmitting}
          style={{ width: '100%' }}
        />
      </View>

      {/* Error Message */}
      {error && (
        <View className="w-full mb-4 border-4 border-fatal-red p-4 bg-void-black">
          <Text 
            className="text-fatal-red text-xs text-center"
            style={{ fontFamily: 'PressStart2P' }}
          >
            ERROR: {error}
          </Text>
        </View>
      )}

      {/* Info */}
      <View className="mt-8 border-4 border-shadow-green p-4 bg-void-black">
        <Text 
          className="text-shadow-green text-xs text-center leading-4"
          style={{ fontFamily: 'PressStart2P' }}
        >
          All your scanned artifacts are synced to the cloud and accessible across devices.
        </Text>
      </View>
    </View>
  );
}
