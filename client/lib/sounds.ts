import * as Haptics from "expo-haptics";
import { createAudioPlayer, AudioPlayer, setAudioModeAsync } from "expo-audio";

let flipUpPlayer: AudioPlayer | null = null;
let flipDownPlayer: AudioPlayer | null = null;
let gameOverPlayer: AudioPlayer | null = null;
let scorePlayer: AudioPlayer | null = null;
let sirenPlayer: AudioPlayer | null = null;
let powerUpPlayer: AudioPlayer | null = null;

const FLIP_UP_SOUND_URI = "https://assets.mixkit.co/active_storage/sfx/2568/2568-preview.mp3";
const FLIP_DOWN_SOUND_URI = "https://assets.mixkit.co/active_storage/sfx/2571/2571-preview.mp3";
const GAME_OVER_SOUND_URI = "https://assets.mixkit.co/active_storage/sfx/2656/2656-preview.mp3";
const SCORE_SOUND_URI = "https://assets.mixkit.co/active_storage/sfx/2000/2000-preview.mp3";
const TENSION_SOUND_URI = "https://assets.mixkit.co/active_storage/sfx/2574/2574-preview.mp3";
const POWER_UP_SOUND_URI = "https://assets.mixkit.co/active_storage/sfx/1435/1435-preview.mp3";

let soundsLoaded = false;
let heartbeatInterval: ReturnType<typeof setInterval> | null = null;

export async function initializeSounds(): Promise<void> {
  if (soundsLoaded) return;
  
  try {
    await setAudioModeAsync({
      playsInSilentMode: true,
    });
    
    flipUpPlayer = createAudioPlayer({ uri: FLIP_UP_SOUND_URI });
    flipDownPlayer = createAudioPlayer({ uri: FLIP_DOWN_SOUND_URI });
    gameOverPlayer = createAudioPlayer({ uri: GAME_OVER_SOUND_URI });
    scorePlayer = createAudioPlayer({ uri: SCORE_SOUND_URI });
    sirenPlayer = createAudioPlayer({ uri: TENSION_SOUND_URI });
    powerUpPlayer = createAudioPlayer({ uri: POWER_UP_SOUND_URI });
    
    soundsLoaded = true;
  } catch (error) {
    console.log("Failed to load sounds:", error);
  }
}

export async function playFlipUpSound(soundEnabled: boolean): Promise<void> {
  if (!soundEnabled) return;
  
  try {
    if (flipUpPlayer) {
      flipUpPlayer.seekTo(0);
      flipUpPlayer.play();
    }
  } catch (error) {
    // Sound not available
  }
}

export async function playFlipDownSound(soundEnabled: boolean): Promise<void> {
  if (!soundEnabled) return;
  
  try {
    if (flipDownPlayer) {
      flipDownPlayer.seekTo(0);
      flipDownPlayer.play();
    }
  } catch (error) {
    // Sound not available
  }
}

export async function playFlipSound(soundEnabled: boolean, direction: "up" | "down" = "up"): Promise<void> {
  if (direction === "up") {
    await playFlipUpSound(soundEnabled);
  } else {
    await playFlipDownSound(soundEnabled);
  }
}

export async function playGameOverSound(soundEnabled: boolean): Promise<void> {
  if (!soundEnabled) return;
  
  try {
    if (gameOverPlayer) {
      gameOverPlayer.seekTo(0);
      gameOverPlayer.play();
    }
  } catch (error) {
    // Sound not available
  }
}

export async function playScoreSound(soundEnabled: boolean): Promise<void> {
  if (!soundEnabled) return;
  
  try {
    if (scorePlayer) {
      scorePlayer.seekTo(0);
      scorePlayer.play();
    }
  } catch (error) {
    // Sound not available
  }
}

export async function playPowerUpSound(soundEnabled: boolean): Promise<void> {
  if (!soundEnabled) return;
  
  try {
    if (powerUpPlayer) {
      powerUpPlayer.seekTo(0);
      powerUpPlayer.play();
    }
  } catch (error) {
    // Sound not available
  }
}

export function startHeartbeat(soundEnabled: boolean): void {
  if (!soundEnabled) return;
  stopHeartbeat();
  
  const playTension = () => {
    try {
      if (sirenPlayer) {
        sirenPlayer.volume = 0.15;
        sirenPlayer.seekTo(0);
        sirenPlayer.play();
      }
    } catch (error) {
      // Sound not available
    }
  };
  
  playTension();
  heartbeatInterval = setInterval(playTension, 1500);
}

export function stopHeartbeat(): void {
  if (heartbeatInterval) {
    clearInterval(heartbeatInterval);
    heartbeatInterval = null;
  }
}

export async function triggerFlipHaptic(hapticsEnabled: boolean): Promise<void> {
  if (!hapticsEnabled) return;
  
  try {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  } catch (error) {
    // Haptics may not be available
  }
}

export async function triggerFlipUpHaptic(hapticsEnabled: boolean): Promise<void> {
  if (!hapticsEnabled) return;
  
  try {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setTimeout(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light), 40);
  } catch (error) {
    // Haptics may not be available
  }
}

export async function triggerFlipDownHaptic(hapticsEnabled: boolean): Promise<void> {
  if (!hapticsEnabled) return;
  
  try {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
  } catch (error) {
    // Haptics may not be available
  }
}

export async function triggerVictoryHaptic(hapticsEnabled: boolean): Promise<void> {
  if (!hapticsEnabled) return;
  
  try {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  } catch (error) {
    // Haptics may not be available
  }
}

export async function triggerDeathHaptic(hapticsEnabled: boolean): Promise<void> {
  if (!hapticsEnabled) return;
  
  try {
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    setTimeout(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy), 100);
    setTimeout(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium), 200);
  } catch (error) {
    // Haptics may not be available
  }
}

export async function triggerTapHaptic(hapticsEnabled: boolean): Promise<void> {
  if (!hapticsEnabled) return;
  
  try {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  } catch (error) {
    // Haptics may not be available
  }
}

export async function triggerGameOverHaptic(hapticsEnabled: boolean): Promise<void> {
  if (!hapticsEnabled) return;
  
  try {
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
  } catch (error) {
    // Haptics may not be available
  }
}

export async function triggerSuccessHaptic(hapticsEnabled: boolean): Promise<void> {
  if (!hapticsEnabled) return;
  
  try {
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  } catch (error) {
    // Haptics may not be available
  }
}

export async function triggerPowerUpHaptic(hapticsEnabled: boolean, powerType: 'freeze' | 'slowmo' | 'shield' | 'doublePoints'): Promise<void> {
  if (!hapticsEnabled) return;
  
  try {
    switch (powerType) {
      case 'freeze':
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
        setTimeout(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light), 100);
        break;
      case 'slowmo':
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        setTimeout(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light), 150);
        setTimeout(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light), 300);
        break;
      case 'shield':
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        break;
      case 'doublePoints':
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        setTimeout(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium), 80);
        break;
    }
  } catch (error) {
    // Haptics may not be available
  }
}

export async function triggerComboHaptic(hapticsEnabled: boolean, comboCount: number): Promise<void> {
  if (!hapticsEnabled) return;
  
  try {
    const intensity = comboCount >= 5 ? Haptics.ImpactFeedbackStyle.Heavy : 
                      comboCount >= 3 ? Haptics.ImpactFeedbackStyle.Medium : 
                      Haptics.ImpactFeedbackStyle.Light;
    await Haptics.impactAsync(intensity);
  } catch (error) {
    // Haptics may not be available
  }
}

export async function triggerExplosionHaptic(hapticsEnabled: boolean): Promise<void> {
  if (!hapticsEnabled) return;
  
  try {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    setTimeout(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium), 50);
    setTimeout(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light), 100);
  } catch (error) {
    // Haptics may not be available
  }
}

export async function triggerDeathFreezeHaptic(hapticsEnabled: boolean): Promise<void> {
  if (!hapticsEnabled) return;
  
  try {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    await new Promise(resolve => setTimeout(resolve, 50));
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
  } catch (error) {
    // Haptics may not be available
  }
}

export async function triggerMovementHaptic(hapticsEnabled: boolean): Promise<void> {
  if (!hapticsEnabled) return;
  
  try {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Soft);
  } catch (error) {
    // Haptics may not be available
  }
}

export async function cleanupSounds(): Promise<void> {
  stopHeartbeat();
  
  try {
    if (flipUpPlayer) flipUpPlayer.release();
    if (flipDownPlayer) flipDownPlayer.release();
    if (gameOverPlayer) gameOverPlayer.release();
    if (scorePlayer) scorePlayer.release();
    if (sirenPlayer) sirenPlayer.release();
    if (powerUpPlayer) powerUpPlayer.release();
    
    flipUpPlayer = null;
    flipDownPlayer = null;
    gameOverPlayer = null;
    scorePlayer = null;
    sirenPlayer = null;
    powerUpPlayer = null;
    soundsLoaded = false;
  } catch (error) {
    // Cleanup failed
  }
}
