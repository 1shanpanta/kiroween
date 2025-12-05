import { Stack, useRouter } from 'expo-router';
import { View, Text, Alert, TouchableOpacity } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { useState, useRef, useEffect } from 'react';
import { Crosshair } from '@/components/Crosshair';
import { VignetteOverlay } from '@/components/VignetteOverlay';
import { ScanlinesOverlay } from '@/components/ScanlinesOverlay';
import { useScanStore } from '@/store/scanStore';
import { playClickSound, playChargeSound, initializeAudio } from '@/utils/audio';
import { triggerHaptic } from '@/utils/haptics';
import { RetroButton } from '@/components/RetroButton';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function CameraScreen() {
  const [permission, requestPermission] = useCameraPermissions();
  const [facing] = useState<'back' | 'front'>('back');
  const [cooldown, setCooldown] = useState(0);
  const [isReady, setIsReady] = useState(false);
  const cameraRef = useRef<CameraView>(null);
  const router = useRouter();
  const { setCapturedImage } = useScanStore();
  const insets = useSafeAreaInsets();

  useEffect(() => {
    initializeAudio();
  }, []);

  if (!permission) {
    return <View />;
  }

  if (!permission.granted) {
    return (
      <View className="flex-1 bg-void-black items-center justify-center p-8">
        <Text className="text-standard-green text-center mb-4" style={{ fontFamily: 'PressStart2P' }}>
          CAMERA PERMISSION REQUIRED
        </Text>
        <Text className="text-shadow-green text-center mb-8" style={{ fontFamily: 'PressStart2P', fontSize: 10 }}>
          This device requires camera access to scan artifacts.
        </Text>
        <RetroButton 
          title="GRANT PERMISSION" 
          onPress={requestPermission} 
        />
      </View>
    );
  }

  const handleCapture = async () => {
    if (cooldown > 0 || !cameraRef.current) return;

    try {
      await playChargeSound();
      await triggerHaptic('medium');
      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.7,
        base64: false,
      });

      if (photo?.uri) {
        setCapturedImage(photo.uri);
        await playClickSound();
        await triggerHaptic('success');
        
        // Start cooldown
        setCooldown(3);
        const interval = setInterval(() => {
          setCooldown((prev) => {
            if (prev <= 1) {
              clearInterval(interval);
              return 0;
            }
            return prev - 1;
          });
        }, 1000);

        // Navigate to processing
        router.push('/processing');
      }
    } catch (error) {
      console.error('Capture error:', error);
      triggerHaptic('error');
      Alert.alert('Error', 'Failed to capture image');
    }
  };

  const handleBack = () => {
    playClickSound();
    triggerHaptic('light');
    router.back();
  };

  return (
    <View className="flex-1 bg-void-black">
      <Stack.Screen
        options={{
          title: 'SCANNER',
          headerTitleAlign: 'center',
          headerStyle: { backgroundColor: '#000000' },
          headerTintColor: '#8bac0f',
          headerTitleStyle: { fontFamily: 'PressStart2P' },
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
      <View className="flex-1 relative">
        {!isReady && (
          <View className="absolute inset-0 bg-void-black items-center justify-center z-10">
            <Text className="text-standard-green mb-4" style={{ fontFamily: 'PressStart2P' }}>
              INITIALIZING SCANNER...
            </Text>
            <Text className="text-shadow-green text-xs" style={{ fontFamily: 'PressStart2P' }}>
              Activating camera feed
            </Text>
          </View>
        )}
        
        <CameraView
          ref={cameraRef}
          style={{ flex: 1, width: '100%', height: '100%' }}
          facing={facing}
          mode="picture"
          onCameraReady={() => {
            console.log('✅ Camera ready - live preview active');
            setIsReady(true);
          }}
          onMountError={(error) => {
            console.error('❌ Camera mount error:', error);
            Alert.alert('Camera Error', 'Failed to start camera preview. Please restart the app.');
          }}
        />
        
        {isReady && (
          <>
            {/* Green HUD Border */}
            <View
              className="absolute inset-4 border-4"
              style={{ borderColor: '#8bac0f', pointerEvents: 'none' }}
            />

            {/* Crosshair */}
            <Crosshair />

            {/* Vignette */}
            <VignetteOverlay />

            {/* Scanlines */}
            <ScanlinesOverlay />
          </>
        )}

        {/* Capture Button */}
        <View 
          className="absolute left-0 right-0 items-center px-8"
          style={{ bottom: insets.bottom + 32 }}
        >
          <RetroButton
            onPress={handleCapture}
            disabled={cooldown > 0}
            title={cooldown > 0 ? `RECHARGING... (${cooldown}s)` : 'CAPTURE'}
            style={{ width: '100%' }}
            variant={cooldown > 0 ? 'secondary' : 'primary'}
          />
        </View>
      </View>
    </View>
  );
}

