import { Modal, View, Text, TouchableOpacity } from 'react-native';
import { RetroButton } from './RetroButton';

interface Props {
  visible: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel?: () => void;
}

export function RetroModal({ visible, title, message, onConfirm, onCancel }: Props) {
  return (
    <Modal visible={visible} transparent animationType="fade">
      <View className="flex-1 bg-void-black/90 items-center justify-center px-4">
        <View className="bg-void-black border-4 border-standard-green p-6 w-full max-w-sm">
          <Text
            style={{ fontFamily: 'PressStart2P' }}
            className="text-standard-green text-sm mb-4"
          >
            {title}
          </Text>
          <Text
            style={{ fontFamily: 'PressStart2P' }}
            className="text-phosphor-bright text-xs mb-6"
          >
            {message}
          </Text>
          <View className="gap-3">
            <RetroButton onPress={onConfirm}>CONFIRM</RetroButton>
            {onCancel && (
              <RetroButton onPress={onCancel} danger>
                CANCEL
              </RetroButton>
            )}
          </View>
        </View>
      </View>
    </Modal>
  );
}
