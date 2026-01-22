import AsyncStorage from "@react-native-async-storage/async-storage";

const KEYS = {
  BEST_SCORE: "flip_one_best_score",
  CURRENT_SCORE: "flip_one_current_score",
  POINTS: "flip_one_points",
  OWNED_SKINS: "flip_one_owned_skins",
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
};

export interface DailyMission {
  id: string;
  description: string;
  target: number;
  progress: number;
  reward: number;
  completed: boolean;
  claimed: boolean;
}

export interface GameState {
  bestScore: number;
  points: number;
  ownedSkins: string[];
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
}

const DEFAULT_SKINS = ["default"];
const DEFAULT_SKIN = "default";

function generateDailyMissions(): DailyMission[] {
  return [
    {
      id: "play_5",
      description: "Play 5 games",
      target: 5,
      progress: 0,
      reward: 50,
      completed: false,
      claimed: false,
    },
    {
      id: "score_20",
      description: "Score 20 points in one game",
      target: 20,
      progress: 0,
      reward: 100,
      completed: false,
      claimed: false,
    },
    {
      id: "flip_50",
      description: "Flip 50 times",
      target: 50,
      progress: 0,
      reward: 75,
      completed: false,
      claimed: false,
    },
  ];
}

export async function getGameState(): Promise<GameState> {
  try {
    const [
      bestScore,
      points,
      ownedSkins,
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
    ] = await Promise.all([
      AsyncStorage.getItem(KEYS.BEST_SCORE),
      AsyncStorage.getItem(KEYS.POINTS),
      AsyncStorage.getItem(KEYS.OWNED_SKINS),
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
    ]);

    const today = new Date().toDateString();
    let missions: DailyMission[];

    if (lastMissionDate !== today || !dailyMissions) {
      missions = generateDailyMissions();
      await AsyncStorage.setItem(KEYS.DAILY_MISSIONS, JSON.stringify(missions));
      await AsyncStorage.setItem(KEYS.LAST_MISSION_DATE, today);
    } else {
      missions = dailyMissions ? JSON.parse(dailyMissions) : generateDailyMissions();
    }

    let usedPowers: string[] = [];
    if (lastPowerDate === today && powersUsedToday) {
      usedPowers = JSON.parse(powersUsedToday);
    } else if (lastPowerDate !== today) {
      await AsyncStorage.setItem(KEYS.POWERS_USED_TODAY, JSON.stringify([]));
      await AsyncStorage.setItem(KEYS.LAST_POWER_DATE, today);
    }

    return {
      bestScore: bestScore ? parseInt(bestScore, 10) : 0,
      points: points ? parseInt(points, 10) : 0,
      ownedSkins: ownedSkins ? JSON.parse(ownedSkins) : DEFAULT_SKINS,
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
    };
  } catch (error) {
    console.error("Error loading game state:", error);
    return {
      bestScore: 0,
      points: 0,
      ownedSkins: DEFAULT_SKINS,
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

export async function saveOwnedSkins(skins: string[]): Promise<void> {
  try {
    await AsyncStorage.setItem(KEYS.OWNED_SKINS, JSON.stringify(skins));
  } catch (error) {
    console.error("Error saving owned skins:", error);
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
    const today = new Date().toDateString();
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
  missionId: string,
  progress: number
): Promise<DailyMission[]> {
  try {
    const missionsStr = await AsyncStorage.getItem(KEYS.DAILY_MISSIONS);
    if (!missionsStr) return [];

    const missions: DailyMission[] = JSON.parse(missionsStr);
    const updatedMissions = missions.map((m) => {
      if (m.id === missionId) {
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
