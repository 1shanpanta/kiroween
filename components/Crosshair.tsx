import { View } from 'react-native';

export function Crosshair() {
  return (
    <View className="absolute inset-0 items-center justify-center pointer-events-none">
      <View className="w-12 h-12">
        <View className="absolute top-0 left-1/2 w-0.5 h-4 bg-standard-green -ml-px" />
        <View className="absolute bottom-0 left-1/2 w-0.5 h-4 bg-standard-green -ml-px" />
        <View className="absolute left-0 top-1/2 h-0.5 w-4 bg-standard-green -mt-px" />
        <View className="absolute right-0 top-1/2 h-0.5 w-4 bg-standard-green -mt-px" />
        <View className="absolute inset-0 border-2 border-standard-green rounded-full" />
      </View>
    </View>
  );
}
