import { View, SafeAreaView } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { useRouter } from 'expo-router';
import { useRef } from 'react';
import { RetroButton } from '@/components/RetroButton';
import { Crosshair } from '@/components/Crosshair';
import { ScanlinesOverlay } from '@/components/ScanlinesOverlay';
import { VignetteOverlay } from '@/components/VignetteOverlay';
import { useScanStore } from '@/store/scanStore';
import { mediumHaptic } from '@/utils/haptics';

export default function Camera() {
  const router = useRouter();
  const cameraRef = useRef<CameraView>(null);
  const [permission, requestPermission] = useCameraPermissions();
  const { setProcessing } = useScanStore();

  if (!permission) return null;

  if (!permission.granted) {
    return (
      <SafeAreaView className="flex-1 bg-void-black">
        <View className="flex-1 px-4 justify-center">
          <RetroButton onPress={requestPermission}>
            GRANT CAMERA ACCESS
          </RetroButton>
        </View>
      </SafeAreaView>
    );
  }

  const handleCapture = async () => {
    if (!cameraRef.current) return;
    
    mediumHaptic();
    const photo = await cameraRef.current.takePictureAsync({ base64: true });
    
    if (photo) {
      setProcessing(true);
      router.push({
        pathname: '/processing',
        params: { imageUri: photo.uri, imageBase64: photo.base64 },
      });
    }
  };

  return (
    <View className="flex-1 bg-void-black">
      <CameraView ref={cameraRef} className="flex-1" facing="back">
        <Crosshair />
        <ScanlinesOverlay />
        <VignetteOverlay />
        
        <SafeAreaView className="flex-1">
          <View className="flex-1 justify-end pb-8 px-4">
            <View className="flex-row gap-4">
              <View className="flex-1">
                <RetroButton onPress={() => router.back()} danger>
                  CANCEL
                </RetroButton>
              </View>
              <View className="flex-1">
                <RetroButton onPress={handleCapture}>
                  SCAN
                </RetroButton>
              </View>
            </View>
          </View>
        </SafeAreaView>
      </CameraView>
    </View>
  );
}
