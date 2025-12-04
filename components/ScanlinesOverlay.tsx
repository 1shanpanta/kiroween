import { View } from 'react-native';

export function ScanlinesOverlay() {
  return (
    <View className="absolute inset-0 pointer-events-none">
      {Array.from({ length: 50 }).map((_, i) => (
        <View
          key={i}
          className="h-px bg-standard-green opacity-10"
          style={{ marginTop: i === 0 ? 0 : 10 }}
        />
      ))}
    </View>
  );
}
