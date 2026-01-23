import * as Haptics from "expo-haptics";

export async function playTapSound(soundEnabled: boolean): Promise<void> {
  if (!soundEnabled) return;
  
  try {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  } catch (error) {
    // Haptics not available
  }
}

export async function playFlipSound(soundEnabled: boolean): Promise<void> {
  if (!soundEnabled) return;
  
  try {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  } catch (error) {
    // Haptics not available
  }
}

export async function playGameOverSound(soundEnabled: boolean): Promise<void> {
  if (!soundEnabled) return;
  
  try {
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
  } catch (error) {
    // Haptics not available
  }
}

export async function playNearMissSound(soundEnabled: boolean): Promise<void> {
  if (!soundEnabled) return;
  
  try {
    await Haptics.selectionAsync();
  } catch (error) {
    // Haptics not available
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
    // Lighter, faster feel for flipping up
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setTimeout(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light), 40);
  } catch (error) {
    // Haptics may not be available
  }
}

export async function triggerFlipDownHaptic(hapticsEnabled: boolean): Promise<void> {
  if (!hapticsEnabled) return;
  
  try {
    // Heavier feel for flipping down (gravity pull)
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
  } catch (error) {
    // Haptics may not be available
  }
}

export async function triggerVictoryHaptic(hapticsEnabled: boolean): Promise<void> {
  if (!hapticsEnabled) return;
  
  try {
    // Quick celebration tap when avoiding obstacle
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  } catch (error) {
    // Haptics may not be available
  }
}

export async function triggerDeathHaptic(hapticsEnabled: boolean): Promise<void> {
  if (!hapticsEnabled) return;
  
  try {
    // Strong rumble for death/collision
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
    // Deep, subtle vibration for player movement
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Soft);
  } catch (error) {
    // Haptics may not be available
  }
}

export async function cleanupSounds(): Promise<void> {
  // No cleanup needed for haptics
}
