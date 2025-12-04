import { LinearGradient } from 'expo-linear-gradient';

export function VignetteOverlay() {
  return (
    <LinearGradient
      colors={['rgba(0,0,0,0.8)', 'transparent', 'rgba(0,0,0,0.8)']}
      className="absolute inset-0 pointer-events-none"
    />
  );
}
