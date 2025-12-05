import { Stack, useRouter } from 'expo-router';
import { View, Text, FlatList, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useChallengeStore, Challenge } from '@/store/challengeStore';
import { RetroButton } from '@/components/RetroButton';
import { ScanlinesOverlay } from '@/components/ScanlinesOverlay';
import { useEffect, useState } from 'react';
import { playClickSound } from '@/utils/audio';
import { triggerHaptic } from '@/utils/haptics';

export default function ChallengesScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { challenges, loadChallenges, setupRealtimeSubscription } = useChallengeStore();
  const [timeUntilReset, setTimeUntilReset] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initChallenges = async () => {
      setLoading(true);
      await loadChallenges();
      setLoading(false);
      // Set up real-time subscription after loading
      setupRealtimeSubscription();
    };
    initChallenges();

    return () => {
      // Clean up subscription
      const sub = useChallengeStore.getState().challengeSubscription;
      if (sub) {
        const { supabase } = require('@/utils/supabase');
        supabase.removeChannel(sub);
      }
    };
  }, []);

  useEffect(() => {
    // Calculate time until midnight
    const updateCountdown = () => {
      const now = new Date();
      const tomorrow = new Date(now);
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(0, 0, 0, 0);
      
      const diff = tomorrow.getTime() - now.getTime();
      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);
      
      setTimeUntilReset(`${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`);
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);

    return () => clearInterval(interval);
  }, []);

  const renderChallenge = ({ item }: { item: Challenge }) => (
    <TouchableOpacity
      onPress={() => {
        playClickSound();
        triggerHaptic('light');
        router.push(`/challenge-details?id=${item.id}`);
      }}
      activeOpacity={0.8}
    >
      <View className={`border-4 p-4 mb-4 bg-void-black ${item.completed ? 'border-phosphor-bright' : 'border-standard-green'}`}>
      <View className="flex-row justify-between items-start mb-2">
        <View className="flex-1 mr-2">
          <Text className={`${item.completed ? 'text-phosphor-bright' : 'text-standard-green'} text-lg leading-6`} style={{ fontFamily: 'PressStart2P' }}>
            {item.title}
          </Text>
        </View>
        <View className={`px-2 py-1 ${item.completed ? 'bg-phosphor-bright' : 'bg-standard-green'}`}>
          <Text className="text-void-black text-xs" style={{ fontFamily: 'PressStart2P' }}>
            {item.rewardPoints} PTS
          </Text>
        </View>
      </View>
      
      <Text className="text-shadow-green text-xs mb-4 leading-4" style={{ fontFamily: 'PressStart2P' }}>
        {item.description}
      </Text>

      <View className="flex-row justify-between items-center">
        <View className="flex-row items-center">
          <Text className="text-shadow-green text-xs mr-2" style={{ fontFamily: 'PressStart2P' }}>
            STATUS:
          </Text>
          <Text className={`${item.completed ? 'text-phosphor-bright' : 'text-standard-green'} text-xs`} style={{ fontFamily: 'PressStart2P' }}>
            {item.completed ? 'COMPLETED' : 'ACTIVE'}
          </Text>
        </View>
        
        {item.participants.length > 0 && (
          <Text className="text-shadow-green text-xs" style={{ fontFamily: 'PressStart2P' }}>
            {item.participants.length} RIVALS
          </Text>
        )}
      </View>
    </View>
    </TouchableOpacity>
  );

  const handleBack = () => {
    playClickSound();
    triggerHaptic('light');
    router.back();
  };

  return (
    <View className="flex-1 bg-void-black" style={{ paddingTop: insets.top, paddingBottom: insets.bottom }}>
      <Stack.Screen 
        options={{
          title: 'DAILY BOUNTIES',
          headerTitleAlign: 'center',
          headerStyle: { backgroundColor: '#000000' },
          headerTintColor: '#00FF00',
          headerTitleStyle: { fontFamily: 'PressStart2P', fontSize: 12 },
          headerLeft: () => (
            <TouchableOpacity
              onPress={handleBack}
              className="ml-4 px-3 py-2"
            >
              <Text className="text-standard-green text-sm" style={{ fontFamily: 'PressStart2P' }}>
                ←
              </Text>
            </TouchableOpacity>
          ),
        }} 
      />
      <ScanlinesOverlay />
      
      {/* Header Section - matching other tabs */}
      <View className="px-4 py-4 border-b-4 border-standard-green bg-void-black">
        <Text className="text-shadow-green text-xs text-center mb-1" style={{ fontFamily: 'PressStart2P' }}>
          RESET IN: {timeUntilReset}
        </Text>
      </View>

      {loading ? (
        <View className="flex-1 items-center justify-center">
          <Text className="text-shadow-green text-xs" style={{ fontFamily: 'PressStart2P' }}>
            LOADING BOUNTIES...
          </Text>
        </View>
      ) : challenges.length === 0 ? (
        <View className="flex-1 items-center justify-center p-8">
          <Text className="text-shadow-green text-sm text-center mb-4" style={{ fontFamily: 'PressStart2P' }}>
            NO BOUNTIES AVAILABLE
          </Text>
          <Text className="text-shadow-green text-xs text-center" style={{ fontFamily: 'PressStart2P' }}>
            Check back later for new challenges
          </Text>
        </View>
      ) : (
        <FlatList
          data={challenges}
          renderItem={renderChallenge}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ padding: 16 }}
        />
      )}

      <View className="p-4 border-t-4 border-standard-green">
        <RetroButton title="BACK TO BASE" onPress={handleBack} variant="secondary" />
      </View>
    </View>
  );
}
