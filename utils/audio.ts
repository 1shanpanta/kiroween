import { Audio } from 'expo-av';

let scanSound: Audio.Sound | null = null;
let saveSound: Audio.Sound | null = null;
let errorSound: Audio.Sound | null = null;

export async function initAudio() {
  await Audio.setAudioModeAsync({
    playsInSilentModeIOS: true,
  });
}

export async function playScanSound() {
  if (!scanSound) {
    const { sound } = await Audio.Sound.createAsync(
      require('@/assets/sounds/scan.mp3')
    );
    scanSound = sound;
  }
  await scanSound.replayAsync();
}

export async function playSaveSound() {
  if (!saveSound) {
    const { sound } = await Audio.Sound.createAsync(
      require('@/assets/sounds/save.mp3')
    );
    saveSound = sound;
  }
  await saveSound.replayAsync();
}

export async function playErrorSound() {
  if (!errorSound) {
    const { sound } = await Audio.Sound.createAsync(
      require('@/assets/sounds/error.mp3')
    );
    errorSound = sound;
  }
  await errorSound.replayAsync();
}
