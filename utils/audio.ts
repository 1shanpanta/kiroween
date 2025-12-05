import { Audio } from 'expo-av';
import { Platform } from 'react-native';

// Audio sound instances - these will be loaded on first use
let clickSound: Audio.Sound | null = null;
let chargeSound: Audio.Sound | null = null;
let typewriterSound: Audio.Sound | null = null;
let dialupSound: Audio.Sound | null = null;

// Simple beep using Web Audio API for web/macOS
function playWebBeep(frequency: number, duration: number, volume: number = 0.3) {
  if (Platform.OS === 'web' && typeof window !== 'undefined') {
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.frequency.value = frequency;
      oscillator.type = 'sine';
      gainNode.gain.setValueAtTime(volume, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration / 1000);
      
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + duration / 1000);
      return true;
    } catch (error) {
      console.error('[Audio] Web Audio API failed:', error);
      return false;
    }
  }
  return false;
}

export async function initializeAudio() {
  try {
    if (Platform.OS === 'ios') {
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
        playsInSilentModeIOS: true,
      });
    } else {
      // For other platforms, just set basic audio mode
      await Audio.setAudioModeAsync({
        playsInSilentModeIOS: true,
      });
    }
  } catch (error) {
    console.error('[Audio] Failed to initialize audio:', error);
  }
}

export async function playClickSound() {
  // Try Web Audio API first for web/macOS
  if (playWebBeep(800, 50, 0.3)) return;
  
  try {
    if (clickSound) {
      await clickSound.replayAsync();
      return;
    }
    
    const { sound } = await Audio.Sound.createAsync(
      { uri: 'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBTGH0fPTgjMGHm7A7+OZURAJR6Hh8sFwJgUwgM/z2Yk4CB1svO3mn00QDE+n4fC2YxwGOJLX8sx5LAUkd8fw3ZBACBRdtOnrqFUUCkaf4PK+bCEFMYfR89OCMwYebsDv45lREAlHoeHywXAmBTCAz/PZiTgIHWy87eafTRAMT6fh8LZjHAY4ktfy' },
      { shouldPlay: true, volume: 0.3 }
    );
    clickSound = sound;
  } catch (error) {
    console.error('[Audio] Failed to play click sound:', error);
  }
}

export async function playChargeSound() {
  // Try Web Audio API first for web/macOS
  if (playWebBeep(600, 150, 0.4)) return;
  
  try {
    if (chargeSound) {
      await chargeSound.replayAsync();
      return;
    }
    
    const { sound } = await Audio.Sound.createAsync(
      { uri: 'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBTGH0fPTgjMGHm7A7+OZURAJR6Hh8sFwJgUwgM/z2Yk4CB1svO3mn00QDE+n4fC2YxwGOJLX8sx5LAUkd8fw3ZBACBRdtOnrqFUUCkaf4PK+bCEFMYfR89OCMwYebsDv45lREAlHoeHywXAmBTCAz/PZiTgIHWy87eafTRAMT6fh8LZjHAY4ktfy' },
      { shouldPlay: true, volume: 0.4 }
    );
    chargeSound = sound;
  } catch (error) {
    console.error('[Audio] Failed to play charge sound:', error);
  }
}

export async function playTypewriterSound() {
  // Try Web Audio API first for web/macOS
  if (playWebBeep(1000, 30, 0.1)) return;
  
  try {
    if (typewriterSound) {
      await typewriterSound.setPositionAsync(0);
      await typewriterSound.playAsync();
      return;
    }
    
    const { sound } = await Audio.Sound.createAsync(
      { uri: 'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBTGH0fPTgjMGHm7A7+OZURAJR6Hh8sFwJgUwgM/z2Yk4CB1svO3mn00QDE+n4fC2YxwGOJLX8sx5LAUkd8fw3ZBACBRdtOnrqFUUCkaf4PK+bCEFMYfR89OCMwYebsDv45lREAlHoeHywXAmBTCAz/PZiTgIHWy87eafTRAMT6fh8LZjHAY4ktfy' },
      { shouldPlay: false, volume: 0.1 }
    );
    typewriterSound = sound;
    await sound.playAsync();
  } catch (error) {
    console.error('[Audio] Failed to play typewriter sound:', error);
  }
}

export async function playDialupSound() {
  // Use Web Audio API for web (looping)
  if (Platform.OS === 'web' && typeof window !== 'undefined') {
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.frequency.value = 400;
      oscillator.type = 'sine';
      gainNode.gain.value = 0.2;
      
      oscillator.start(audioContext.currentTime);
      // Store reference for stopping
      (window as any).__dialupOscillator = oscillator;
      return;
    } catch (error) {
      console.error('[Audio] Web Audio API failed:', error);
    }
  }
  
  try {
    if (dialupSound) {
      await dialupSound.setIsLoopingAsync(true);
      await dialupSound.playAsync();
      return;
    }
    
    const { sound } = await Audio.Sound.createAsync(
      { uri: 'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBTGH0fPTgjMGHm7A7+OZURAJR6Hh8sFwJgUwgM/z2Yk4CB1svO3mn00QDE+n4fC2YxwGOJLX8sx5LAUkd8fw3ZBACBRdtOnrqFUUCkaf4PK+bCEFMYfR89OCMwYebsDv45lREAlHoeHywXAmBTCAz/PZiTgIHWy87eafTRAMTgy' },
      { shouldPlay: false, volume: 0.2, isLooping: true }
    );
    dialupSound = sound;
    await sound.playAsync();
  } catch (error) {
    console.error('[Audio] Failed to play dialup sound:', error);
  }
}

export async function stopDialupSound() {
  try {
    // Stop Web Audio API sound for web
    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      const oscillator = (window as any).__dialupOscillator;
      if (oscillator) {
        oscillator.stop();
        (window as any).__dialupOscillator = null;
      }
      return;
    }
    
    if (dialupSound) {
      await dialupSound.stopAsync();
    }
  } catch (error) {
    console.error('[Audio] Failed to stop dialup sound:', error);
  }
}


