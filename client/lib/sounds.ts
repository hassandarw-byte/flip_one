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

export async function cleanupSounds(): Promise<void> {
  // Cleanup audio resources if any
}
