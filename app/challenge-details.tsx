import { View, Text, SafeAreaView, ScrollView } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { useChallengeStore } from '@/store/challengeStore';
import { useAuthStore } from '@/store/authStore';
import { RetroButton } from '@/components/RetroButton';
import { BountyClaimedModal } from '@/components/BountyClaimedModal';

export default function ChallengeDetails() {
  const router = useRouter();
  const { challengeId } = useLocalSearchParams<{ challengeId: string }>();
  const { challenges, completedChallenges, completeChallenge } = useChallengeStore();
  const { userId } = useAuthStore();
  const [showClaimedModal, setShowClaimedModal] = useState(false);

  const challenge = challenges.find(c => c.id === challengeId);
  const isCompleted = completedChallenges.includes(challengeId);

  if (!challenge) return null;

  const handleComplete = async () => {
    if (!userId) return;
    await completeChallenge(challengeId, userId);
    setShowClaimedModal(true);
  };

  return (
    <SafeAreaView className="flex-1 bg-void-black">
      <ScrollView className="flex-1 px-4">
        <View className="py-6 gap-4">
          <RetroButton onPress={() => router.back()}>BACK</RetroButton>

          <View className="border-4 border-standard-green p-4">
            <Text
              style={{ fontFamily: 'PressStart2P' }}
              className="text-standard-green text-lg mb-4"
            >
              {challenge.title}
            </Text>

            <Text
              style={{ fontFamily: 'PressStart2P' }}
              className="text-phosphor-bright text-xs mb-6 leading-5"
            >
              {challenge.description}
            </Text>

            <View className="gap-2 mb-4">
              <Text style={{ fontFamily: 'PressStart2P' }} className="text-shadow-green text-xs">
                TARGET: {challenge.target_word}
              </Text>
              <Text style={{ fontFamily: 'PressStart2P' }} className="text-shadow-green text-xs">
                REWARD: {challenge.reward_points} POINTS
              </Text>
              <Text style={{ fontFamily: 'PressStart2P' }} className="text-shadow-green text-xs">
                EXPIRES: {new Date(challenge.expires_at).toLocaleDateString()}
              </Text>
            </View>

            {isCompleted && (
              <Text
                style={{ fontFamily: 'PressStart2P' }}
                className="text-shadow-green text-xs"
              >
                [COMPLETED]
              </Text>
            )}
          </View>

          {!isCompleted && (
            <RetroButton onPress={handleComplete}>
              CLAIM BOUNTY
            </RetroButton>
          )}
        </View>
      </ScrollView>

      <BountyClaimedModal
        visible={showClaimedModal}
        points={challenge.reward_points}
        onClose={() => {
          setShowClaimedModal(false);
          router.back();
        }}
      />
    </SafeAreaView>
  );
}
