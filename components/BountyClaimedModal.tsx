import { Modal, View, Text } from 'react-native';
import { RetroButton } from './RetroButton';

interface Props {
  visible: boolean;
  points: number;
  onClose: () => void;
}

export function BountyClaimedModal({ visible, points, onClose }: Props) {
  return (
    <Modal visible={visible} transparent animationType="fade">
      <View className="flex-1 bg-void-black/90 items-center justify-center px-4">
        <View className="bg-void-black border-4 border-standard-green p-6 w-full max-w-sm">
          <Text
            style={{ fontFamily: 'PressStart2P' }}
            className="text-standard-green text-base mb-4 text-center"
          >
            BOUNTY CLAIMED
          </Text>
          <Text
            style={{ fontFamily: 'PressStart2P' }}
            className="text-phosphor-bright text-2xl mb-6 text-center"
          >
            +{points}
          </Text>
          <RetroButton onPress={onClose}>CONTINUE</RetroButton>
        </View>
      </View>
    </Modal>
  );
}
