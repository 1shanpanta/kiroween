import { View, Text, TextInput, SafeAreaView } from 'react-native';
import { useState } from 'react';
import { useRouter } from 'expo-router';
import { useAuthStore } from '@/store/authStore';
import { RetroButton } from '@/components/RetroButton';

export default function Login() {
  const router = useRouter();
  const { setUser } = useAuthStore();
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');

  const handleLogin = async () => {
    if (!email || !username) return;
    await setUser(email, username);
    router.replace('/');
  };

  return (
    <SafeAreaView className="flex-1 bg-void-black">
      <View className="flex-1 px-4 justify-center">
        <Text
          style={{ fontFamily: 'PressStart2P' }}
          className="text-standard-green text-xl text-center mb-8"
        >
          IDENTIFY
        </Text>

        <View className="gap-4">
          <View>
            <Text
              style={{ fontFamily: 'PressStart2P' }}
              className="text-phosphor-bright text-xs mb-2"
            >
              EMAIL
            </Text>
            <TextInput
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              style={{ fontFamily: 'PressStart2P' }}
              className="bg-void-black border-4 border-standard-green text-standard-green px-4 py-3 text-xs"
            />
          </View>

          <View>
            <Text
              style={{ fontFamily: 'PressStart2P' }}
              className="text-phosphor-bright text-xs mb-2"
            >
              USERNAME
            </Text>
            <TextInput
              value={username}
              onChangeText={setUsername}
              autoCapitalize="none"
              style={{ fontFamily: 'PressStart2P' }}
              className="bg-void-black border-4 border-standard-green text-standard-green px-4 py-3 text-xs"
            />
          </View>

          <RetroButton onPress={handleLogin} disabled={!email || !username}>
            ENTER
          </RetroButton>
        </View>
      </View>
    </SafeAreaView>
  );
}
