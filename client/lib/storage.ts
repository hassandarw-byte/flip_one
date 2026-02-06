import AsyncStorage from "@react-native-async-storage/async-storage";

const KEYS = {
  BEST_SCORE: "flip_one_best_score",
  CURRENT_SCORE: "flip_one_current_score",
  POINTS: "flip_one_points",
  OWNED_SKINS: "flip_one_owned_skins",
  OWNED_PREMIUM_SKINS: "flip_one_owned_premium_skins",
  EQUIPPED_SKIN: "flip_one_equipped_skin",
  EQUIPPED_PREMIUM_SKIN: "flip_one_equipped_premium_skin",
  SOUND_ENABLED: "flip_one_sound_enabled",
  HAPTICS_ENABLED: "flip_one_haptics_enabled",
  DAILY_MISSIONS: "flip_one_daily_missions",
  LAST_MISSION_DATE: "flip_one_last_mission_date",
  ADS_REMOVED: "flip_one_ads_removed",
  NIGHT_MODE: "flip_one_night_mode",
  TOTAL_FLIPS: "flip_one_total_flips",
  TOTAL_GAMES: "flip_one_total_games",
  POWERS_USED_TODAY: "flip_one_powers_used_today",
  LAST_POWER_DATE: "flip_one_last_power_date",
  DEVICE_ID: "flip_one_device_id",
  USERNAME: "flip_one_username",
  DAILY_STREAK: "flip_one_daily_streak",
  LAST_PLAY_DATE: "flip_one_last_play_date",
  LAST_WHEEL_SPIN_DATE: "flip_one_last_wheel_spin_date",
  ACHIEVEMENTS: "flip_one_achievements",
  LAST_FREE_REVIVE_DATE: "flip_one_last_free_revive_date",
  DAILY_CHALLENGE: "flip_one_daily_challenge",
  LAST_DAILY_CHALLENGE_DATE: "flip_one_last_daily_challenge_date",
};

export interface DailyMission {
  id: string;
  type: "play" | "score" | "flip" | "distance" | "collect" | "level";
  description: string;
  target: number;
  progress: number;
  reward: number;
  completed: boolean;
  claimed: boolean;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  reward: number;
  unlocked: boolean;
  unlockedAt?: string;
}

export interface DailyChallenge {
  id: string;
  description: string;
  type: "no_power" | "high_score" | "distance" | "fever" | "collect";
  target: number;
  reward: number;
  completed: boolean;
  claimed: boolean;
}

export interface GameState {
  bestScore: number;
  points: number;
  ownedSkins: string[];
  ownedPremiumSkins: string[];
  equippedSkin: string;
  equippedPremiumSkin: string | null;
  soundEnabled: boolean;
  hapticsEnabled: boolean;
  dailyMissions: DailyMission[];
  adsRemoved: boolean;
  nightMode: boolean;
  totalFlips: number;
  totalGames: number;
  powersUsedToday: string[];
  lastPowerDate: string;
  dailyStreak: number;
  lastPlayDate: string;
  lastWheelSpinDate: string;
  achievements: Achievement[];
  lastFreeReviveDate: string;
  dailyChallenge: DailyChallenge | null;
  lastDailyChallengeDate: string;
}

const DEFAULT_SKINS = ["default"];
const DEFAULT_SKIN = "default";

function generateDefaultAchievements(): Achievement[] {
  return [
    { id: "first_game", title: "First Steps", description: "Play your first game", icon: "play", reward: 25, unlocked: false },
    { id: "score_50", title: "Beginner", description: "Score 50 points in one game", icon: "star", reward: 100, unlocked: false },
    { id: "score_100", title: "Pro Player", description: "Score 100 points in one game", icon: "award", reward: 250, unlocked: false },
    { id: "games_10", title: "Hooked", description: "Play 10 games", icon: "refresh-cw", reward: 75, unlocked: false },
    { id: "games_50", title: "Addicted", description: "Play 50 games", icon: "zap", reward: 200, unlocked: false },
    { id: "flips_100", title: "Flipper", description: "Flip 100 times", icon: "rotate-cw", reward: 50, unlocked: false },
    { id: "flips_500", title: "Flip Legend", description: "Flip 500 times", icon: "heart", reward: 150, unlocked: false },
    { id: "streak_3", title: "Regular", description: "Play 3 days in a row", icon: "calendar", reward: 100, unlocked: false },
    { id: "streak_7", title: "Devoted", description: "Play 7 days in a row", icon: "gift", reward: 300, unlocked: false },
    { id: "combo_5", title: "Combo Master", description: "Achieve a x5 combo", icon: "trending-up", reward: 75, unlocked: false },
  ];
}

const MISSION_POOL: Omit<DailyMission, "progress" | "completed" | "claimed">[] = [
  { id: "play_3", type: "play", description: "Play 3 games", target: 3, reward: 30 },
  { id: "play_5", type: "play", description: "Play 5 games", target: 5, reward: 50 },
  { id: "play_10", type: "play", description: "Play 10 games", target: 10, reward: 100 },
  { id: "play_15", type: "play", description: "Play 15 games", target: 15, reward: 150 },

  { id: "score_10", type: "score", description: "Score 10 points in one game", target: 10, reward: 50 },
  { id: "score_20", type: "score", description: "Score 20 points in one game", target: 20, reward: 100 },
  { id: "score_30", type: "score", description: "Score 30 points in one game", target: 30, reward: 150 },
  { id: "score_50", type: "score", description: "Score 50 points in one game", target: 50, reward: 250 },

  { id: "flip_20", type: "flip", description: "Flip 20 times", target: 20, reward: 30 },
  { id: "flip_50", type: "flip", description: "Flip 50 times", target: 50, reward: 75 },
  { id: "flip_100", type: "flip", description: "Flip 100 times", target: 100, reward: 125 },
  { id: "flip_200", type: "flip", description: "Flip 200 times", target: 200, reward: 200 },

  { id: "distance_500", type: "distance", description: "Travel 500m in one game", target: 500, reward: 40 },
  { id: "distance_1000", type: "distance", description: "Travel 1000m in one game", target: 1000, reward: 80 },
  { id: "distance_2000", type: "distance", description: "Travel 2000m in one game", target: 2000, reward: 150 },
  { id: "distance_3000", type: "distance", description: "Travel 3000m in one game", target: 3000, reward: 250 },

  { id: "collect_5", type: "collect", description: "Collect 5 items", target: 5, reward: 60 },
  { id: "collect_10", type: "collect", description: "Collect 10 items", target: 10, reward: 120 },

  { id: "level_3", type: "level", description: "Reach level 3 in one game", target: 3, reward: 50 },
  { id: "level_5", type: "level", description: "Reach level 5 in one game", target: 5, reward: 100 },
  { id: "level_8", type: "level", description: "Reach level 8 in one game", target: 8, reward: 175 },
];

function seededRandom(seed: number): () => number {
  let s = seed;
  return () => {
    s = (s * 16807 + 0) % 2147483647;
    return s / 2147483647;
  };
}

function generateDailyMissions(): DailyMission[] {
  const today = new Date().toISOString().split("T")[0];
  const seed = today.split("-").join("").length > 0
    ? parseInt(today.replace(/-/g, ""), 10)
    : Date.now();
  const rng = seededRandom(seed);

  const types: DailyMission["type"][] = ["play", "score", "flip", "distance", "collect", "level"];
  const selectedTypes: DailyMission["type"][] = [];

  const shuffledTypes = [...types].sort(() => rng() - 0.5);
  for (let i = 0; i < 4; i++) {
    selectedTypes.push(shuffledTypes[i]);
  }

  const missions: DailyMission[] = [];
  for (const type of selectedTypes) {
    const candidates = MISSION_POOL.filter((m) => m.type === type);
    const pick = candidates[Math.floor(rng() * candidates.length)];
    missions.push({
      ...pick,
      progress: 0,
      completed: false,
      claimed: false,
    });
  }

  return missions;
}

export async function getGameState(): Promise<GameState> {
  try {
    const [
      bestScore,
      points,
      ownedSkins,
      ownedPremiumSkins,
      equippedSkin,
      equippedPremiumSkin,
      soundEnabled,
      hapticsEnabled,
      dailyMissions,
      lastMissionDate,
      adsRemoved,
      nightMode,
      totalFlips,
      totalGames,
      powersUsedToday,
      lastPowerDate,
      dailyStreak,
      lastPlayDate,
      lastWheelSpinDate,
      achievements,
    ] = await Promise.all([
      AsyncStorage.getItem(KEYS.BEST_SCORE),
      AsyncStorage.getItem(KEYS.POINTS),
      AsyncStorage.getItem(KEYS.OWNED_SKINS),
      AsyncStorage.getItem(KEYS.OWNED_PREMIUM_SKINS),
      AsyncStorage.getItem(KEYS.EQUIPPED_SKIN),
      AsyncStorage.getItem(KEYS.EQUIPPED_PREMIUM_SKIN),
      AsyncStorage.getItem(KEYS.SOUND_ENABLED),
      AsyncStorage.getItem(KEYS.HAPTICS_ENABLED),
      AsyncStorage.getItem(KEYS.DAILY_MISSIONS),
      AsyncStorage.getItem(KEYS.LAST_MISSION_DATE),
      AsyncStorage.getItem(KEYS.ADS_REMOVED),
      AsyncStorage.getItem(KEYS.NIGHT_MODE),
      AsyncStorage.getItem(KEYS.TOTAL_FLIPS),
      AsyncStorage.getItem(KEYS.TOTAL_GAMES),
      AsyncStorage.getItem(KEYS.POWERS_USED_TODAY),
      AsyncStorage.getItem(KEYS.LAST_POWER_DATE),
      AsyncStorage.getItem(KEYS.DAILY_STREAK),
      AsyncStorage.getItem(KEYS.LAST_PLAY_DATE),
      AsyncStorage.getItem(KEYS.LAST_WHEEL_SPIN_DATE),
      AsyncStorage.getItem(KEYS.ACHIEVEMENTS),
    ]);

    const today = new Date().toISOString().split("T")[0]; // Use ISO format for consistency
    let missions: DailyMission[];

    if (lastMissionDate !== today || !dailyMissions) {
      missions = generateDailyMissions();
      await AsyncStorage.setItem(KEYS.DAILY_MISSIONS, JSON.stringify(missions));
      await AsyncStorage.setItem(KEYS.LAST_MISSION_DATE, today);
    } else {
      const parsed = dailyMissions ? JSON.parse(dailyMissions) : null;
      if (parsed && parsed.length > 0 && parsed[0].type) {
        missions = parsed;
      } else {
        missions = generateDailyMissions();
        await AsyncStorage.setItem(KEYS.DAILY_MISSIONS, JSON.stringify(missions));
        await AsyncStorage.setItem(KEYS.LAST_MISSION_DATE, today);
      }
    }

    let usedPowers: string[] = [];
    if (lastPowerDate === today && powersUsedToday) {
      usedPowers = JSON.parse(powersUsedToday);
    } else if (lastPowerDate !== today) {
      await AsyncStorage.setItem(KEYS.POWERS_USED_TODAY, JSON.stringify([]));
      await AsyncStorage.setItem(KEYS.LAST_POWER_DATE, today);
    }

    let currentAchievements: Achievement[] = achievements 
      ? JSON.parse(achievements) 
      : generateDefaultAchievements();

    return {
      bestScore: bestScore ? parseInt(bestScore, 10) : 0,
      points: points ? parseInt(points, 10) : 0,
      ownedSkins: ownedSkins ? JSON.parse(ownedSkins) : DEFAULT_SKINS,
      ownedPremiumSkins: ownedPremiumSkins ? JSON.parse(ownedPremiumSkins) : [],
      equippedSkin: equippedSkin || DEFAULT_SKIN,
      equippedPremiumSkin: equippedPremiumSkin || null,
      soundEnabled: soundEnabled !== "false",
      hapticsEnabled: hapticsEnabled !== "false",
      dailyMissions: missions,
      adsRemoved: adsRemoved === "true",
      nightMode: nightMode === "true",
      totalFlips: totalFlips ? parseInt(totalFlips, 10) : 0,
      totalGames: totalGames ? parseInt(totalGames, 10) : 0,
      powersUsedToday: usedPowers,
      lastPowerDate: lastPowerDate || "",
      dailyStreak: dailyStreak ? parseInt(dailyStreak, 10) : 0,
      lastPlayDate: lastPlayDate || "",
      lastWheelSpinDate: lastWheelSpinDate || "",
      achievements: currentAchievements,
      lastFreeReviveDate: "",
      dailyChallenge: null,
      lastDailyChallengeDate: "",
    };
  } catch (error) {
    console.error("Error loading game state:", error);
    return {
      bestScore: 0,
      points: 0,
      ownedSkins: DEFAULT_SKINS,
      ownedPremiumSkins: [],
      equippedSkin: DEFAULT_SKIN,
      equippedPremiumSkin: null,
      soundEnabled: true,
      hapticsEnabled: true,
      dailyMissions: generateDailyMissions(),
      adsRemoved: false,
      nightMode: false,
      totalFlips: 0,
      totalGames: 0,
      powersUsedToday: [],
      lastPowerDate: "",
      dailyStreak: 0,
      lastPlayDate: "",
      lastWheelSpinDate: "",
      achievements: generateDefaultAchievements(),
      lastFreeReviveDate: "",
      dailyChallenge: null,
      lastDailyChallengeDate: "",
    };
  }
}

export async function saveBestScore(score: number): Promise<void> {
  try {
    await AsyncStorage.setItem(KEYS.BEST_SCORE, score.toString());
  } catch (error) {
    console.error("Error saving best score:", error);
  }
}

export async function savePoints(points: number): Promise<void> {
  try {
    await AsyncStorage.setItem(KEYS.POINTS, points.toString());
  } catch (error) {
    console.error("Error saving points:", error);
  }
}

export async function saveSoundEnabled(enabled: boolean): Promise<void> {
  try {
    await AsyncStorage.setItem(KEYS.SOUND_ENABLED, enabled.toString());
  } catch (error) {
    console.error("Error saving sound setting:", error);
  }
}

export async function saveHapticsEnabled(enabled: boolean): Promise<void> {
  try {
    await AsyncStorage.setItem(KEYS.HAPTICS_ENABLED, enabled.toString());
  } catch (error) {
    console.error("Error saving haptics setting:", error);
  }
}

export async function saveNightModeEnabled(enabled: boolean): Promise<void> {
  try {
    await AsyncStorage.setItem(KEYS.NIGHT_MODE, enabled.toString());
  } catch (error) {
    console.error("Error saving night mode setting:", error);
  }
}

export async function saveAdsRemoved(removed: boolean): Promise<void> {
  try {
    await AsyncStorage.setItem(KEYS.ADS_REMOVED, removed.toString());
  } catch (error) {
    console.error("Error saving ads removed setting:", error);
  }
}

export async function saveOwnedSkins(skins: string[]): Promise<void> {
  try {
    await AsyncStorage.setItem(KEYS.OWNED_SKINS, JSON.stringify(skins));
  } catch (error) {
    console.error("Error saving owned skins:", error);
  }
}

export async function saveOwnedPremiumSkins(skins: string[]): Promise<void> {
  try {
    await AsyncStorage.setItem(KEYS.OWNED_PREMIUM_SKINS, JSON.stringify(skins));
  } catch (error) {
    console.error("Error saving owned premium skins:", error);
  }
}

export async function saveEquippedSkin(skin: string): Promise<void> {
  try {
    await AsyncStorage.setItem(KEYS.EQUIPPED_SKIN, skin);
  } catch (error) {
    console.error("Error saving equipped skin:", error);
  }
}

export async function saveEquippedPremiumSkin(skin: string | null): Promise<void> {
  try {
    if (skin === null) {
      await AsyncStorage.removeItem(KEYS.EQUIPPED_PREMIUM_SKIN);
    } else {
      await AsyncStorage.setItem(KEYS.EQUIPPED_PREMIUM_SKIN, skin);
    }
  } catch (error) {
    console.error("Error saving equipped premium skin:", error);
  }
}

export async function usePower(powerId: string): Promise<boolean> {
  try {
    const today = new Date().toISOString().split("T")[0]; // Use ISO format for consistency
    const lastDate = await AsyncStorage.getItem(KEYS.LAST_POWER_DATE);
    let usedPowers: string[] = [];

    if (lastDate === today) {
      const powersStr = await AsyncStorage.getItem(KEYS.POWERS_USED_TODAY);
      usedPowers = powersStr ? JSON.parse(powersStr) : [];
    }

    if (usedPowers.includes(powerId)) {
      return false;
    }

    usedPowers.push(powerId);
    await AsyncStorage.setItem(KEYS.POWERS_USED_TODAY, JSON.stringify(usedPowers));
    await AsyncStorage.setItem(KEYS.LAST_POWER_DATE, today);
    return true;
  } catch (error) {
    console.error("Error using power:", error);
    return false;
  }
}

export async function saveDailyMissions(missions: DailyMission[]): Promise<void> {
  try {
    await AsyncStorage.setItem(KEYS.DAILY_MISSIONS, JSON.stringify(missions));
  } catch (error) {
    console.error("Error saving daily missions:", error);
  }
}

export async function incrementTotalFlips(count: number): Promise<number> {
  try {
    const current = await AsyncStorage.getItem(KEYS.TOTAL_FLIPS);
    const newTotal = (current ? parseInt(current, 10) : 0) + count;
    await AsyncStorage.setItem(KEYS.TOTAL_FLIPS, newTotal.toString());
    return newTotal;
  } catch (error) {
    console.error("Error incrementing total flips:", error);
    return count;
  }
}

export async function incrementTotalGames(): Promise<number> {
  try {
    const current = await AsyncStorage.getItem(KEYS.TOTAL_GAMES);
    const newTotal = (current ? parseInt(current, 10) : 0) + 1;
    await AsyncStorage.setItem(KEYS.TOTAL_GAMES, newTotal.toString());
    return newTotal;
  } catch (error) {
    console.error("Error incrementing total games:", error);
    return 1;
  }
}

export async function updateMissionProgress(
  missionType: DailyMission["type"],
  progress: number
): Promise<DailyMission[]> {
  try {
    const missionsStr = await AsyncStorage.getItem(KEYS.DAILY_MISSIONS);
    if (!missionsStr) return [];

    const missions: DailyMission[] = JSON.parse(missionsStr);
    const updatedMissions = missions.map((m) => {
      if (m.type === missionType) {
        const newProgress = Math.min(progress, m.target);
        return {
          ...m,
          progress: newProgress,
          completed: newProgress >= m.target,
        };
      }
      return m;
    });

    await AsyncStorage.setItem(KEYS.DAILY_MISSIONS, JSON.stringify(updatedMissions));
    return updatedMissions;
  } catch (error) {
    console.error("Error updating mission progress:", error);
    return [];
  }
}

export async function claimMissionReward(missionId: string): Promise<number> {
  try {
    const missionsStr = await AsyncStorage.getItem(KEYS.DAILY_MISSIONS);
    const pointsStr = await AsyncStorage.getItem(KEYS.POINTS);
    
    if (!missionsStr) return 0;

    const missions: DailyMission[] = JSON.parse(missionsStr);
    let rewardAmount = 0;

    const updatedMissions = missions.map((m) => {
      if (m.id === missionId && m.completed && !m.claimed) {
        rewardAmount = m.reward;
        return { ...m, claimed: true };
      }
      return m;
    });

    if (rewardAmount > 0) {
      const currentPoints = pointsStr ? parseInt(pointsStr, 10) : 0;
      const newPoints = currentPoints + rewardAmount;
      await AsyncStorage.setItem(KEYS.POINTS, newPoints.toString());
      await AsyncStorage.setItem(KEYS.DAILY_MISSIONS, JSON.stringify(updatedMissions));
    }

    return rewardAmount;
  } catch (error) {
    console.error("Error claiming mission reward:", error);
    return 0;
  }
}

export async function getDeviceId(): Promise<string> {
  try {
    let deviceId = await AsyncStorage.getItem(KEYS.DEVICE_ID);
    if (!deviceId) {
      deviceId = `device_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      await AsyncStorage.setItem(KEYS.DEVICE_ID, deviceId);
    }
    return deviceId;
  } catch (error) {
    console.error("Error getting device ID:", error);
    return `device_${Date.now()}`;
  }
}

export async function getUsername(): Promise<string> {
  try {
    const username = await AsyncStorage.getItem(KEYS.USERNAME);
    return username || "Player";
  } catch (error) {
    console.error("Error getting username:", error);
    return "Player";
  }
}

export async function setUsername(username: string): Promise<void> {
  try {
    await AsyncStorage.setItem(KEYS.USERNAME, username);
  } catch (error) {
    console.error("Error setting username:", error);
  }
}

export async function updateDailyStreak(): Promise<{ streak: number; bonusPoints: number }> {
  try {
    const today = new Date().toDateString();
    const yesterday = new Date(Date.now() - 86400000).toDateString();
    
    const lastPlayDate = await AsyncStorage.getItem(KEYS.LAST_PLAY_DATE);
    let currentStreak = parseInt(await AsyncStorage.getItem(KEYS.DAILY_STREAK) || "0", 10);
    let bonusPoints = 0;
    
    if (lastPlayDate === today) {
      return { streak: currentStreak, bonusPoints: 0 };
    }
    
    if (lastPlayDate === yesterday) {
      currentStreak += 1;
      bonusPoints = Math.min(currentStreak * 10, 100);
    } else if (lastPlayDate !== today) {
      currentStreak = 1;
      bonusPoints = 10;
    }
    
    await AsyncStorage.setItem(KEYS.DAILY_STREAK, currentStreak.toString());
    await AsyncStorage.setItem(KEYS.LAST_PLAY_DATE, today);
    
    if (bonusPoints > 0) {
      const points = parseInt(await AsyncStorage.getItem(KEYS.POINTS) || "0", 10);
      await AsyncStorage.setItem(KEYS.POINTS, (points + bonusPoints).toString());
    }
    
    return { streak: currentStreak, bonusPoints };
  } catch (error) {
    console.error("Error updating daily streak:", error);
    return { streak: 0, bonusPoints: 0 };
  }
}

export async function canSpinWheel(): Promise<boolean> {
  try {
    const today = new Date().toISOString().split("T")[0];
    const lastSpinDate = await AsyncStorage.getItem(KEYS.LAST_WHEEL_SPIN_DATE);
    return lastSpinDate !== today;
  } catch (error) {
    return false;
  }
}

export async function spinWheel(segmentIndex?: number): Promise<{ reward: number; type: "points" | "power" | "skin" }> {
  try {
    const today = new Date().toISOString().split("T")[0];
    await AsyncStorage.setItem(KEYS.LAST_WHEEL_SPIN_DATE, today);
    
    const wheelSegments = [
      { label: "25", type: "points" as const },
      { label: "PWR", type: "power" as const },
      { label: "50", type: "points" as const },
      { label: "PWR", type: "power" as const },
      { label: "75", type: "points" as const },
      { label: "PWR", type: "power" as const },
      { label: "100", type: "points" as const },
      { label: "150", type: "points" as const },
    ];
    
    const selectedIndex = segmentIndex !== undefined ? segmentIndex : Math.floor(Math.random() * wheelSegments.length);
    const segment = wheelSegments[selectedIndex];
    
    let reward: number;
    let type: "points" | "power" | "skin";
    
    if (segment.type === "power") {
      reward = 1;
      type = "power";
    } else {
      reward = parseInt(segment.label, 10);
      type = "points";
      const points = parseInt(await AsyncStorage.getItem(KEYS.POINTS) || "0", 10);
      await AsyncStorage.setItem(KEYS.POINTS, (points + reward).toString());
    }
    
    return { reward, type };
  } catch (error) {
    console.error("Error spinning wheel:", error);
    return { reward: 25, type: "points" };
  }
}

export async function unlockAchievement(achievementId: string): Promise<{ unlocked: boolean; reward: number }> {
  try {
    const achievementsData = await AsyncStorage.getItem(KEYS.ACHIEVEMENTS);
    let achievements: Achievement[] = achievementsData 
      ? JSON.parse(achievementsData) 
      : generateDefaultAchievements();
    
    const achievement = achievements.find(a => a.id === achievementId);
    
    if (!achievement || achievement.unlocked) {
      return { unlocked: false, reward: 0 };
    }
    
    achievement.unlocked = true;
    achievement.unlockedAt = new Date().toISOString();
    
    await AsyncStorage.setItem(KEYS.ACHIEVEMENTS, JSON.stringify(achievements));
    
    const points = parseInt(await AsyncStorage.getItem(KEYS.POINTS) || "0", 10);
    await AsyncStorage.setItem(KEYS.POINTS, (points + achievement.reward).toString());
    
    return { unlocked: true, reward: achievement.reward };
  } catch (error) {
    console.error("Error unlocking achievement:", error);
    return { unlocked: false, reward: 0 };
  }
}

export async function checkAndUnlockAchievements(gameState: GameState, score: number, combo: number): Promise<string[]> {
  const unlockedIds: string[] = [];
  
  try {
    if (gameState.totalGames === 0) {
      const result = await unlockAchievement("first_game");
      if (result.unlocked) unlockedIds.push("first_game");
    }
    
    if (score >= 50) {
      const result = await unlockAchievement("score_50");
      if (result.unlocked) unlockedIds.push("score_50");
    }
    
    if (score >= 100) {
      const result = await unlockAchievement("score_100");
      if (result.unlocked) unlockedIds.push("score_100");
    }
    
    if (gameState.totalGames >= 10) {
      const result = await unlockAchievement("games_10");
      if (result.unlocked) unlockedIds.push("games_10");
    }
    
    if (gameState.totalGames >= 50) {
      const result = await unlockAchievement("games_50");
      if (result.unlocked) unlockedIds.push("games_50");
    }
    
    if (gameState.totalFlips >= 100) {
      const result = await unlockAchievement("flips_100");
      if (result.unlocked) unlockedIds.push("flips_100");
    }
    
    if (gameState.totalFlips >= 500) {
      const result = await unlockAchievement("flips_500");
      if (result.unlocked) unlockedIds.push("flips_500");
    }
    
    if (gameState.dailyStreak >= 3) {
      const result = await unlockAchievement("streak_3");
      if (result.unlocked) unlockedIds.push("streak_3");
    }
    
    if (gameState.dailyStreak >= 7) {
      const result = await unlockAchievement("streak_7");
      if (result.unlocked) unlockedIds.push("streak_7");
    }
    
    if (combo >= 5) {
      const result = await unlockAchievement("combo_5");
      if (result.unlocked) unlockedIds.push("combo_5");
    }
  } catch (error) {
    console.error("Error checking achievements:", error);
  }
  
  return unlockedIds;
}

export async function canUseFreeRevive(): Promise<boolean> {
  try {
    const today = new Date().toISOString().split("T")[0];
    const lastReviveDate = await AsyncStorage.getItem(KEYS.LAST_FREE_REVIVE_DATE);
    return lastReviveDate !== today;
  } catch (error) {
    console.error("Error checking free revive:", error);
    return false;
  }
}

export async function useFreeRevive(): Promise<boolean> {
  try {
    const canUse = await canUseFreeRevive();
    if (!canUse) return false;
    
    const today = new Date().toISOString().split("T")[0];
    await AsyncStorage.setItem(KEYS.LAST_FREE_REVIVE_DATE, today);
    return true;
  } catch (error) {
    console.error("Error using free revive:", error);
    return false;
  }
}

function generateDailyChallenge(): DailyChallenge {
  const challenges: DailyChallenge[] = [
    { id: "no_power", description: "Score 30+ without using powers", type: "no_power", target: 30, reward: 100, completed: false, claimed: false },
    { id: "high_score", description: "Score 50 points in one game", type: "high_score", target: 50, reward: 150, completed: false, claimed: false },
    { id: "distance", description: "Travel 500 meters total", type: "distance", target: 500, reward: 75, completed: false, claimed: false },
    { id: "fever", description: "Activate Fever Mode 2 times", type: "fever", target: 2, reward: 125, completed: false, claimed: false },
    { id: "collect", description: "Collect 10 items", type: "collect", target: 10, reward: 100, completed: false, claimed: false },
  ];
  return challenges[Math.floor(Math.random() * challenges.length)];
}

export async function getDailyChallenge(): Promise<DailyChallenge> {
  try {
    const today = new Date().toISOString().split("T")[0];
    const lastDate = await AsyncStorage.getItem(KEYS.LAST_DAILY_CHALLENGE_DATE);
    const storedChallenge = await AsyncStorage.getItem(KEYS.DAILY_CHALLENGE);
    
    if (lastDate === today && storedChallenge) {
      return JSON.parse(storedChallenge);
    }
    
    const newChallenge = generateDailyChallenge();
    await AsyncStorage.setItem(KEYS.DAILY_CHALLENGE, JSON.stringify(newChallenge));
    await AsyncStorage.setItem(KEYS.LAST_DAILY_CHALLENGE_DATE, today);
    return newChallenge;
  } catch (error) {
    console.error("Error getting daily challenge:", error);
    return generateDailyChallenge();
  }
}

export async function updateDailyChallenge(progress: number): Promise<DailyChallenge | null> {
  try {
    const challenge = await getDailyChallenge();
    if (challenge.completed) return challenge;
    
    if (progress >= challenge.target) {
      challenge.completed = true;
    }
    
    await AsyncStorage.setItem(KEYS.DAILY_CHALLENGE, JSON.stringify(challenge));
    return challenge;
  } catch (error) {
    console.error("Error updating daily challenge:", error);
    return null;
  }
}

export async function claimDailyChallengeReward(): Promise<number> {
  try {
    const challenge = await getDailyChallenge();
    if (!challenge.completed || challenge.claimed) return 0;
    
    challenge.claimed = true;
    await AsyncStorage.setItem(KEYS.DAILY_CHALLENGE, JSON.stringify(challenge));
    
    const currentPoints = await AsyncStorage.getItem(KEYS.POINTS);
    const newPoints = (currentPoints ? parseInt(currentPoints, 10) : 0) + challenge.reward;
    await AsyncStorage.setItem(KEYS.POINTS, newPoints.toString());
    
    return challenge.reward;
  } catch (error) {
    console.error("Error claiming daily challenge reward:", error);
    return 0;
  }
}
