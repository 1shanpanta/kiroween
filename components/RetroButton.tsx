import { TouchableOpacity, Text, Animated } from 'react-native';
import { useState, useRef } from 'react';
import { lightHaptic } from '@/utils/haptics';

interface Props {
  onPress: () => void;
  children: React.ReactNode;
  danger?: boolean;
  disabled?: boolean;
}

export function RetroButton({ onPress, children, danger = false, disabled = false }: Props) {
  const [pressed, setPressed] = useState(false);
  const translateY = useRef(new Animated.Value(0)).current;

  const handlePressIn = () => {
    setPressed(true);
    lightHaptic();
    Animated.timing(translateY, {
      toValue: 2,
      duration: 50,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    setPressed(false);
    Animated.timing(translateY, {
      toValue: 0,
      duration: 50,
      useNativeDriver: true,
    }).start();
  };

  return (
    <Animated.View style={{ transform: [{ translateY }] }}>
      <TouchableOpacity
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={disabled}
        className={`
          border-4 px-6 py-3
          ${pressed ? 'bg-standard-green' : 'bg-void-black'}
          ${danger ? 'border-fatal-red' : 'border-standard-green'}
          ${disabled ? 'opacity-50' : ''}
        `}
      >
        <Text
          style={{ fontFamily: 'PressStart2P' }}
          className={`
            text-center text-xs
            ${pressed ? 'text-void-black' : danger ? 'text-fatal-red' : 'text-standard-green'}
          `}
        >
          {children}
        </Text>
      </TouchableOpacity>
    </Animated.View>
  );
}
