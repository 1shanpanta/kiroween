import { View, Text, SafeAreaView, FlatList, TouchableOpacity, TextInput } from 'react-native';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { useFriendStore } from '@/store/friendStore';
import { useAuthStore } from '@/store/authStore';
import { RetroButton } from '@/components/RetroButton';

export default function Friends() {
  const router = useRouter();
  const { leaderboard, loadLeaderboard, addFriend } = useFriendStore();
  const { userId } = useAuthStore();
  const [friendId, setFriendId] = useState('');

  useEffect(() => {
    loadLeaderboard();
  }, []);

  const handleAddFriend = async () => {
    if (!userId || !friendId) return;
    await addFriend(userId, friendId);
    setFriendId('');
  };

  return (
    <SafeAreaView className="flex-1 bg-void-black">
      <View className="flex-1 px-4">
        <View className="py-4 gap-4">
          <Text
            style={{ fontFamily: 'PressStart2P' }}
            className="text-standard-green text-lg"
          >
            LEADERBOARD
          </Text>

          <View>
            <Text
              style={{ fontFamily: 'PressStart2P' }}
              className="text-phosphor-bright text-xs mb-2"
            >
              ADD FRIEND
            </Text>
            <View className="flex-row gap-2">
              <TextInput
                value={friendId}
                onChangeText={setFriendId}
                placeholder="USER ID"
                placeholderTextColor="#008000"
                style={{ fontFamily: 'PressStart2P' }}
                className="flex-1 bg-void-black border-4 border-standard-green text-standard-green px-4 py-3 text-xs"
              />
              <RetroButton onPress={handleAddFriend}>ADD</RetroButton>
            </View>
          </View>

          <RetroButton onPress={() => router.back()}>BACK</RetroButton>
        </View>

        <FlatList
          data={leaderboard}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ gap: 8, paddingBottom: 20 }}
          renderItem={({ item, index }) => (
            <TouchableOpacity
              onPress={() => router.push({ pathname: '/compare', params: { friendId: item.id } })}
              className="border-4 border-standard-green p-3 flex-row justify-between items-center"
            >
              <View className="flex-row items-center gap-3">
                <Text
                  style={{ fontFamily: 'PressStart2P' }}
                  className="text-phosphor-bright text-xs w-8"
                >
                  #{index + 1}
                </Text>
                <Text
                  style={{ fontFamily: 'PressStart2P' }}
                  className="text-standard-green text-xs"
                >
                  {item.username}
                </Text>
              </View>
              <Text
                style={{ fontFamily: 'PressStart2P' }}
                className="text-shadow-green text-xs"
              >
                {item.total_points} PTS
              </Text>
            </TouchableOpacity>
          )}
        />
      </View>
    </SafeAreaView>
  );
}
