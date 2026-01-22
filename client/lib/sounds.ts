import * as Haptics from "expo-haptics";

export async function playFlipSound(soundEnabled: boolean): Promise<void> {
  // Sound implementation would go here with actual audio files
  // For MVP, we rely on haptic feedback
}

export async function playGameOverSound(soundEnabled: boolean): Promise<void> {
  // Sound implementation would go here with actual audio files
  // For MVP, we rely on haptic feedback
}

export async function triggerFlipHaptic(hapticsEnabled: boolean): Promise<void> {
  if (!hapticsEnabled) return;
  
  try {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
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

export async function cleanupSounds(): Promise<void> {
  // Cleanup audio resources if any
}
