import { View, Text, SafeAreaView, FlatList, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { useEffect } from 'react';
import { useChallengeStore } from '@/store/challengeStore';
import { RetroButton } from '@/components/RetroButton';

export default function Challenges() {
  const router = useRouter();
  const { challenges, completedChallenges, loadChallenges } = useChallengeStore();

  useEffect(() => {
    loadChallenges();
  }, []);

  return (
    <SafeAreaView className="flex-1 bg-void-black">
      <View className="flex-1 px-4">
        <View className="py-4">
          <Text
            style={{ fontFamily: 'PressStart2P' }}
            className="text-standard-green text-lg mb-4"
          >
            DAILY BOUNTIES
          </Text>
          <RetroButton onPress={() => router.back()}>BACK</RetroButton>
        </View>

        {challenges.length === 0 ? (
          <View className="flex-1 items-center justify-center">
            <Text
              style={{ fontFamily: 'PressStart2P' }}
              className="text-shadow-green text-xs text-center"
            >
              NO ACTIVE BOUNTIES
            </Text>
          </View>
        ) : (
          <FlatList
            data={challenges}
            keyExtractor={(item) => item.id}
            contentContainerStyle={{ gap: 12, paddingBottom: 20 }}
            renderItem={({ item }) => {
              const isCompleted = completedChallenges.includes(item.id);
              return (
                <TouchableOpacity
                  onPress={() => router.push({ pathname: '/challenge-details', params: { challengeId: item.id } })}
                  className={`border-4 p-4 ${isCompleted ? 'border-shadow-green' : 'border-standard-green'}`}
                >
                  <Text
                    style={{ fontFamily: 'PressStart2P' }}
                    className={`text-sm mb-2 ${isCompleted ? 'text-shadow-green' : 'text-standard-green'}`}
                  >
                    {item.title}
                  </Text>
                  <Text
                    style={{ fontFamily: 'PressStart2P' }}
                    className="text-phosphor-bright text-xs mb-3"
                  >
                    {item.description}
                  </Text>
                  <Text
                    style={{ fontFamily: 'PressStart2P' }}
                    className="text-shadow-green text-xs"
                  >
                    REWARD: {item.reward_points} PTS
                  </Text>
                  {isCompleted && (
                    <Text
                      style={{ fontFamily: 'PressStart2P' }}
                      className="text-shadow-green text-xs mt-2"
                    >
                      [COMPLETED]
                    </Text>
                  )}
                </TouchableOpacity>
              );
            }}
          />
        )}
      </View>
    </SafeAreaView>
  );
}
