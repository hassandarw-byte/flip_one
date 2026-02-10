import React, { useEffect, useState, useCallback, useRef } from "react";
import {
  View,
  StyleSheet,
  Pressable,
  Dimensions,
  TouchableOpacity,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  withRepeat,
  withSequence,
  Easing,
  runOnJS,
} from "react-native-reanimated";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useNavigation } from "@react-navigation/native";
import { Feather } from "@expo/vector-icons";
import Svg, { Path, Circle, Defs, LinearGradient as SvgLinearGradient, Stop, Rect, Line, Text as SvgText } from "react-native-svg";

import { ThemedText } from "@/components/ThemedText";
import { GameColors, Spacing, BorderRadius, SkinColors } from "@/constants/theme";
import {
  getGameState,
  saveBestScore,
  savePoints,
  incrementTotalFlips,
  incrementTotalGames,
  updateMissionProgress,
  usePower,
  checkAndUnlockAchievements,
  GameState,
} from "@/lib/storage";
import { 
  triggerFlipHaptic, 
  triggerFlipUpHaptic,
  triggerFlipDownHaptic,
  triggerGameOverHaptic, 
  triggerPowerUpHaptic, 
  triggerComboHaptic, 
  triggerExplosionHaptic,
  triggerDeathFreezeHaptic,
  triggerVictoryHaptic,
  triggerDeathHaptic,
  playFlipSound,
  playGameOverSound,
  playScoreSound,
  playPowerUpSound,
  playCollectSound,
  playThunderSound,
  playCarStartupSound,
  startGasPedalSound,
  stopGasPedalSound,
  initializeSounds,
} from "@/lib/sounds";
import { RootStackParamList } from "@/navigation/RootStackNavigator";
import { useNightMode } from "@/contexts/NightModeContext";

interface FlipParticle {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  opacity: number;
}

const POWER_COLORS = {
  freeze: { primary: "#00D4FF", secondary: "#0099CC", glow: "#00D4FF" },
  slow: { primary: "#FFB800", secondary: "#FF8C00", glow: "#FFB800" },
  shield: { primary: "#9B59B6", secondary: "#8E44AD", glow: "#9B59B6" },
  double: { primary: "#2ECC71", secondary: "#27AE60", glow: "#2ECC71" },
};

interface ActivePower {
  type: "freeze" | "slow" | "shield" | "double";
  expiresAt: number;
}

const { width, height } = Dimensions.get("window");

const PLAYER_SIZE = 32;
const TRACK_HEIGHT = 50;
const GAME_SPEED_BASE = 3;
const SPAWN_INTERVAL = 1500; // Balanced obstacle frequency
const DIFFICULTY_INCREASE_INTERVAL = 5;
const LEVEL_INCREASE_INTERVAL = 10;
const MIN_OBSTACLE_GAP = 150;

interface Obstacle {
  id: number;
  x: number;
  track: "top" | "bottom";
  type: "cone" | "barrel" | "rock";
  width: number;
  height: number;
  color: string;
}

interface Collectible {
  id: number;
  x: number;
  y: number;
  type: "heart" | "star";
  size: number;
  collected: boolean;
}

interface FloatingParticle {
  id: number;
  x: number;
  y: number;
  size: number;
  speed: number;
  color: string;
  opacity: number;
}

interface ExplosionParticle {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  opacity: number;
  life: number;
}

interface TrailParticle {
  id: number;
  x: number;
  y: number;
  size: number;
  opacity: number;
  color: string;
}

interface SeaCreature {
  id: number;
  x: number;
  y: number;
  type: "crab" | "fish" | "lobster";
  speed: number;
  direction: 1 | -1;
  stream: "top" | "bottom";
}

interface BackgroundStar {
  id: number;
  x: number;
  y: number;
  size: number;
  speed: number;
  opacity: number;
}

export default function GameScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { backgroundGradient, isNightMode } = useNightMode();
  
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [score, setScore] = useState(0);
  const [level, setLevel] = useState(1);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isGameOver, setIsGameOver] = useState(false);
  const [obstacles, setObstacles] = useState<Obstacle[]>([]);
  const [collectibles, setCollectibles] = useState<Collectible[]>([]);
  const [isReady, setIsReady] = useState(false);
  const [floatingParticles, setFloatingParticles] = useState<FloatingParticle[]>([]);
  const [explosionParticles, setExplosionParticles] = useState<ExplosionParticle[]>([]);
  const [availablePowers, setAvailablePowers] = useState<string[]>([]);
  const [activePowers, setActivePowers] = useState<ActivePower[]>([]);
  const [activePowerTypes, setActivePowerTypes] = useState<string[]>([]);
  const [combo, setCombo] = useState(0);
  const [showCombo, setShowCombo] = useState(false);
  const [backgroundLevel, setBackgroundLevel] = useState(0);
  const [flipParticles, setFlipParticles] = useState<FlipParticle[]>([]);
  const [deathFlashOpacity, setDeathFlashOpacity] = useState(0);
  const [showNearMissFrame, setShowNearMissFrame] = useState(false);
  const [trailParticles, setTrailParticles] = useState<TrailParticle[]>([]);
  const [backgroundStars, setBackgroundStars] = useState<BackgroundStar[]>([]);
  const [distance, setDistance] = useState(0);
  const [encourageMessage, setEncourageMessage] = useState<string | null>(null);
  const [collectExplosions, setCollectExplosions] = useState<{id: number, x: number, y: number, color: string}[]>([]);
  const [streak, setStreak] = useState(0);
  const [successfulFlips, setSuccessfulFlips] = useState(0);
  const [showSkyHero, setShowSkyHero] = useState(false);
  const [skyHeroX, setSkyHeroX] = useState(-100);
  const [showSwingHero, setShowSwingHero] = useState(false);
  const [swingHeroX, setSwingHeroX] = useState(width / 2);
  const [swingHeroY, setSwingHeroY] = useState(-100);
  const [swingHeroSwing, setSwingHeroSwing] = useState(0);
  const [showStarWarrior, setShowStarWarrior] = useState(false);
  const [starWarriorX, setStarWarriorX] = useState(-100);
  const [showShadowGlider, setShowShadowGlider] = useState(false);
  const [shadowGliderX, setShadowGliderX] = useState(width + 100);
  const [shadowGliderY, setShadowGliderY] = useState(height * 0.2);
  const [shadowGliderRopeY, setShadowGliderRopeY] = useState(0);
  const [showMightyJumper, setShowMightyJumper] = useState(false);
  const [mightyJumperX, setMightyJumperX] = useState(-80);
  const [mightyJumperY, setMightyJumperY] = useState(height * 0.7);
  const [mightyJumperPhase, setMightyJumperPhase] = useState(0);
  const [seaCreatures, setSeaCreatures] = useState<SeaCreature[]>([]);
  
  const currentTrackRef = useRef<"top" | "bottom">("bottom");
  const freezeActiveRef = useRef(false);
  const originalSpeedRef = useRef(GAME_SPEED_BASE);
  const hasShieldRef = useRef(false);
  const doublePointsRef = useRef(false);
  const gameSpeedRef = useRef(GAME_SPEED_BASE);
  const flipCountRef = useRef(0);
  const isGameOverRef = useRef(false);
  const obstacleIdRef = useRef(0);
  
  const gameLoopRef = useRef<NodeJS.Timeout | null>(null);
  const obstacleSpawnRef = useRef<NodeJS.Timeout | null>(null);
  const collectibleSpawnRef = useRef<NodeJS.Timeout | null>(null);
  const collectibleIdRef = useRef(0);
  const bonusPointsRef = useRef(0);
  const scoreIntervalRef = useRef<NodeJS.Timeout | null>(null);
  
  const playerX = width * 0.2;

  const worldRotation = useSharedValue(0);
  const playerBounce = useSharedValue(0);
  const playerGlow = useSharedValue(0.5);
  const scoreScale = useSharedValue(1);
  const sparkleOpacity = useSharedValue(0.4);
  const screenShakeX = useSharedValue(0);
  const screenShakeY = useSharedValue(0);
  const comboScale = useSharedValue(0);
  const comboOpacity = useSharedValue(0);
  const motionBlur = useSharedValue(0);
  const deathFreezeOpacity = useSharedValue(0);
  
  const comboTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastObstaclePassTime = useRef(0);
  const isDyingRef = useRef(false);
  const trailIntervalRef = useRef<NodeJS.Timeout | null>(null);
  
  const playerRotation = useSharedValue(0);
  const encourageScale = useSharedValue(0);
  const encourageOpacity = useSharedValue(0);
  const powerGlowPulse = useSharedValue(1);
  const wheelRotation = useSharedValue(0);
  const eyeSparkle = useSharedValue(1);
  
  const obstacleScale = useSharedValue(1);
  
  const DAY_GRADIENTS: [string, string][] = [
    ["#F5E6D3", "#E8D4C0"],  // Sandy beach
    ["#E8D4C0", "#DEC8B0"],  // Warm sand
    ["#F5E6D3", "#D4B896"],  // Light to dark sand
    ["#E8D4C0", "#C9B896"],  // Medium sand
    ["#DEC8B0", "#D4B896"],  // Deep sand
    ["#F5E6D3", "#DEC8B0"],  // Soft sand gradient
  ];
  
  const NIGHT_GRADIENTS: [string, string][] = [
    ["#0A0A0F", "#1A1A25"],
    ["#080810", "#151520"],
    ["#0C0C14", "#1C1C28"],
    ["#0A0A12", "#18181E"],
    ["#060608", "#12121A"],
    ["#0B0B10", "#1B1B22"],
  ];
  
  const BACKGROUND_GRADIENTS = isNightMode ? NIGHT_GRADIENTS : DAY_GRADIENTS;

  const trackTopY = height / 2 - TRACK_HEIGHT - 60;
  const trackBottomY = height / 2 + 60;

  useEffect(() => {
    loadGameState();
    startSparkleAnimation();
    initializeSounds();
    
    // Small delay then start game automatically
    const timer = setTimeout(() => {
      setIsReady(true);
    }, 500);
    
    return () => {
      clearTimeout(timer);
      cleanupGame();
    };
  }, []);
  
  useEffect(() => {
    if (isReady && !isPlaying && !isGameOver) {
      setIsPlaying(true);
      startGame();
    }
  }, [isReady]);

  const loadGameState = async () => {
    const state = await getGameState();
    setGameState(state);
    
    const today = new Date().toISOString().split("T")[0];
    const allPowers = ["freeze", "slow", "shield", "double"];
    const usedToday = state.powersUsedToday || [];
    const lastDate = state.lastPowerDate;
    
    if (lastDate !== today) {
      setAvailablePowers(allPowers);
    } else {
      const available = allPowers.filter(p => !usedToday.includes(p));
      setAvailablePowers(available);
    }
  };

  const getPlayerColors = (): [string, string, string] => {
    if (!gameState) return SkinColors.default;
    
    // Premium skin takes priority
    if (gameState.equippedPremiumSkin && SkinColors[gameState.equippedPremiumSkin]) {
      return SkinColors[gameState.equippedPremiumSkin];
    }
    
    // Regular skin
    if (gameState.equippedSkin && SkinColors[gameState.equippedSkin]) {
      return SkinColors[gameState.equippedSkin];
    }
    
    return SkinColors.default;
  };

  const createFlipParticles = useCallback(() => {
    const colors = ["#FFD700", "#FF6B6B", "#4ECDC4", "#FF9FF3", "#54E346"];
    const particles: FlipParticle[] = Array.from({ length: 8 }).map((_, i) => ({
      id: Date.now() + i,
      x: playerX + (Math.random() - 0.5) * 20,
      y: currentTrackRef.current === "top" ? trackTopY + TRACK_HEIGHT / 2 : trackBottomY + TRACK_HEIGHT / 2,
      vx: (Math.random() - 0.5) * 6,
      vy: (Math.random() - 0.5) * 6,
      size: Math.random() * 6 + 3,
      color: colors[Math.floor(Math.random() * colors.length)],
      opacity: 1,
    }));
    setFlipParticles(prev => [...prev, ...particles]);
    
    setTimeout(() => {
      setFlipParticles(prev => prev.filter(p => !particles.find(np => np.id === p.id)));
    }, 400);
  }, [playerX, trackTopY, trackBottomY]);

  const createExplosion = useCallback((x: number, y: number) => {
    const colors = ["#FFD700", "#FF6B6B", "#4ECDC4", "#FF9FF3", "#54E346", "#A66CFF"];
    const particles: ExplosionParticle[] = Array.from({ length: 12 }).map((_, i) => ({
      id: Date.now() + i,
      x,
      y,
      vx: (Math.random() - 0.5) * 8,
      vy: (Math.random() - 0.5) * 8,
      size: Math.random() * 8 + 4,
      color: colors[Math.floor(Math.random() * colors.length)],
      opacity: 1,
      life: 1,
    }));
    setExplosionParticles(prev => [...prev, ...particles]);
    
    if (gameState?.hapticsEnabled) {
      triggerExplosionHaptic(true);
    }
    
    setTimeout(() => {
      setExplosionParticles(prev => prev.filter(p => !particles.find(np => np.id === p.id)));
    }, 500);
  }, [gameState?.hapticsEnabled]);

  const triggerScreenShake = useCallback(() => {
    screenShakeX.value = withSequence(
      withTiming(8, { duration: 50 }),
      withTiming(-8, { duration: 50 }),
      withTiming(4, { duration: 50 }),
      withTiming(-4, { duration: 50 }),
      withTiming(0, { duration: 50 })
    );
    screenShakeY.value = withSequence(
      withTiming(-6, { duration: 50 }),
      withTiming(6, { duration: 50 }),
      withTiming(-3, { duration: 50 }),
      withTiming(3, { duration: 50 }),
      withTiming(0, { duration: 50 })
    );
  }, []);

  const triggerCollectExplosion = useCallback((x: number, y: number, type: "heart" | "star") => {
    const color = type === "heart" ? "#FF6B9D" : "#FFD700";
    const id = Date.now();
    setCollectExplosions(prev => [...prev, { id, x, y, color }]);
    setTimeout(() => {
      setCollectExplosions(prev => prev.filter(e => e.id !== id));
    }, 600);
  }, []);

  const showEncouragement = useCallback((message: string) => {
    setEncourageMessage(message);
    encourageScale.value = 0;
    encourageOpacity.value = 1;
    encourageScale.value = withSpring(1.2, { damping: 8 });
    setTimeout(() => {
      encourageOpacity.value = withTiming(0, { duration: 300 });
      setTimeout(() => setEncourageMessage(null), 300);
    }, 800);
  }, []);

  const incrementCombo = useCallback(() => {
    const now = Date.now();
    const timeSinceLastPass = now - lastObstaclePassTime.current;
    
    if (timeSinceLastPass < 2000) {
      setCombo(prev => {
        const newCombo = prev + 1;
        if (gameState?.hapticsEnabled && newCombo >= 2) {
          triggerComboHaptic(true, newCombo);
        }
        return newCombo;
      });
      setShowCombo(true);
      comboScale.value = withSequence(
        withSpring(1.3, { damping: 8 }),
        withSpring(1, { damping: 12 })
      );
      comboOpacity.value = withTiming(1, { duration: 100 });
    } else {
      setCombo(1);
      setShowCombo(true);
      comboScale.value = withSpring(1, { damping: 12 });
      comboOpacity.value = withTiming(1, { duration: 100 });
    }
    
    lastObstaclePassTime.current = now;
    
    if (comboTimeoutRef.current) {
      clearTimeout(comboTimeoutRef.current);
    }
    comboTimeoutRef.current = setTimeout(() => {
      comboOpacity.value = withTiming(0, { duration: 300 });
      setTimeout(() => {
        setShowCombo(false);
        setCombo(0);
      }, 300);
    }, 2000);
  }, []);

  const activatePower = useCallback(async (powerType: "freeze" | "slow" | "shield" | "double") => {
    if (!availablePowers.includes(powerType) || !isPlaying) return;
    
    // Save power usage to storage
    const canUse = await usePower(powerType);
    if (!canUse) return;
    
    setAvailablePowers(prev => prev.filter(p => p !== powerType));
    
    if (gameState?.hapticsEnabled) {
      const hapticMap: Record<string, 'freeze' | 'slowmo' | 'shield' | 'doublePoints'> = {
        freeze: 'freeze',
        slow: 'slowmo',
        shield: 'shield',
        double: 'doublePoints',
      };
      triggerPowerUpHaptic(true, hapticMap[powerType]);
    }
    
    // Play power-up sound
    if (gameState?.soundEnabled) {
      playPowerUpSound(true);
    }
    
    const now = Date.now();
    
    setActivePowerTypes(prev => [...prev, powerType]);
    
    // Start pulsing glow animation
    powerGlowPulse.value = withRepeat(
      withSequence(
        withTiming(1.5, { duration: 300 }),
        withTiming(1, { duration: 300 })
      ),
      -1,
      true
    );
    
    switch (powerType) {
      case "freeze":
        freezeActiveRef.current = true;
        setActivePowers(prev => [...prev, { type: "freeze", expiresAt: now + 3000 }]);
        setTimeout(() => {
          freezeActiveRef.current = false;
          setActivePowers(prev => prev.filter(p => p.type !== "freeze"));
          setActivePowerTypes(prev => prev.filter(p => p !== "freeze"));
          powerGlowPulse.value = 1;
        }, 3000);
        break;
        
      case "slow":
        originalSpeedRef.current = gameSpeedRef.current;
        gameSpeedRef.current = gameSpeedRef.current * 0.5;
        setActivePowers(prev => [...prev, { type: "slow", expiresAt: now + 5000 }]);
        setTimeout(() => {
          gameSpeedRef.current = originalSpeedRef.current;
          setActivePowers(prev => prev.filter(p => p.type !== "slow"));
          setActivePowerTypes(prev => prev.filter(p => p !== "slow"));
          powerGlowPulse.value = 1;
        }, 5000);
        break;
        
      case "shield":
        hasShieldRef.current = true;
        setActivePowers(prev => [...prev, { type: "shield", expiresAt: now + 60000 }]);
        // Shield glow stays until hit
        break;
        
      case "double":
        doublePointsRef.current = true;
        setActivePowers(prev => [...prev, { type: "double", expiresAt: now + 30000 }]);
        setTimeout(() => {
          doublePointsRef.current = false;
          setActivePowers(prev => prev.filter(p => p.type !== "double"));
          setActivePowerTypes(prev => prev.filter(p => p !== "double"));
          powerGlowPulse.value = 1;
        }, 30000);
        break;
    }
  }, [availablePowers, isPlaying, gameState?.hapticsEnabled, gameState?.soundEnabled]);

  const startSparkleAnimation = () => {
    sparkleOpacity.value = withRepeat(
      withSequence(
        withTiming(0.8, { duration: 1500 }),
        withTiming(0.3, { duration: 1500 })
      ),
      -1,
      true
    );
    
    playerGlow.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 800 }),
        withTiming(0.5, { duration: 800 })
      ),
      -1,
      true
    );
  };

  const cleanupGame = useCallback(() => {
    stopGasPedalSound();
    if (gameLoopRef.current) {
      clearInterval(gameLoopRef.current);
      gameLoopRef.current = null;
    }
    if (obstacleSpawnRef.current) {
      clearInterval(obstacleSpawnRef.current);
      obstacleSpawnRef.current = null;
    }
    if (collectibleSpawnRef.current) {
      clearInterval(collectibleSpawnRef.current);
      collectibleSpawnRef.current = null;
    }
    if (scoreIntervalRef.current) {
      clearInterval(scoreIntervalRef.current);
      scoreIntervalRef.current = null;
    }
    if (trailIntervalRef.current) {
      clearInterval(trailIntervalRef.current);
      trailIntervalRef.current = null;
    }
    setTrailParticles([]);
    setSuccessfulFlips(0);
    setShowSkyHero(false);
    setSkyHeroX(-100);
    setShowSwingHero(false);
    setSwingHeroX(width / 2);
    setSwingHeroY(-100);
    setSwingHeroSwing(0);
    setShowStarWarrior(false);
    setStarWarriorX(-100);
    setShowShadowGlider(false);
    setShadowGliderX(width + 100);
    setShadowGliderY(height * 0.2);
    setShadowGliderRopeY(0);
    setShowMightyJumper(false);
    setMightyJumperX(-80);
    setMightyJumperY(height * 0.7);
    setMightyJumperPhase(0);
  }, []);

  const handleGameOver = useCallback(async () => {
    if (isGameOverRef.current || isDyingRef.current) return;
    
    isDyingRef.current = true;
    
    stopGasPedalSound();
    
    // Slow motion effect before death
    const originalSpeed = gameSpeedRef.current;
    gameSpeedRef.current = originalSpeed * 0.2; // 80% slower
    
    // Play death sound with haptics
    if (gameState?.hapticsEnabled) {
      triggerDeathHaptic(true);
    }
    if (gameState?.soundEnabled) {
      playGameOverSound(true);
    }
    
    // Slow flash effect on collision - multiple pulses
    setShowNearMissFrame(true);
    setDeathFlashOpacity(0.8);
    
    setTimeout(() => {
      setDeathFlashOpacity(0.3);
    }, 150);
    
    setTimeout(() => {
      setDeathFlashOpacity(0.6);
    }, 300);
    
    setTimeout(() => {
      setDeathFlashOpacity(0);
    }, 500);
    
    // Longer slow motion before cleanup
    setTimeout(() => {
      cleanupGame();
    }, 300);
    
    setTimeout(async () => {
      setShowNearMissFrame(false);
      
      isGameOverRef.current = true;
      setIsGameOver(true);
      setIsPlaying(false);
      
      triggerScreenShake();

      if (gameState?.hapticsEnabled) {
        triggerGameOverHaptic(true);
      }

      await incrementTotalGames();
      await incrementTotalFlips(flipCountRef.current);
      
      const currentScore = score;
      
      if (gameState) {
        await updateMissionProgress("play", (gameState.totalGames || 0) + 1);
        await updateMissionProgress("flip", (gameState.totalFlips || 0) + flipCountRef.current);
        await updateMissionProgress("score", currentScore);
        const distanceTraveled = Math.floor(distance);
        await updateMissionProgress("distance", distanceTraveled);
        const currentLevel = Math.floor(currentScore / 10) + 1;
        await updateMissionProgress("level", currentLevel);
        await updateMissionProgress("collect", bonusPointsRef.current > 0 ? Math.floor(bonusPointsRef.current / 3) : 0);

        if (currentScore > gameState.bestScore) {
          await saveBestScore(currentScore);
        }

        const pointsEarned = Math.floor(currentScore / 2) + bonusPointsRef.current;
        await savePoints(gameState.points + pointsEarned);

        const updatedState: GameState = {
          ...gameState,
          totalGames: (gameState.totalGames || 0) + 1,
          totalFlips: (gameState.totalFlips || 0) + flipCountRef.current,
        };
        await checkAndUnlockAchievements(updatedState, currentScore, combo);
      }

      navigation.replace("GameOver", {
        score: currentScore,
        bestScore: gameState?.bestScore || 0,
        isNewBest: currentScore > (gameState?.bestScore || 0),
      });
    }, 200);
  }, [gameState, score, combo, navigation, cleanupGame]);

  const startGame = useCallback(() => {
    const gameStartTime = Date.now();
    const GRACE_PERIOD = 2000; // Extended grace period for stability
    
    // Reset critical refs at game start
    isGameOverRef.current = false;
    isDyingRef.current = false;
    currentTrackRef.current = "bottom";
    
    // Clear any leftover obstacles and collectibles from previous game
    setObstacles([]);
    setCollectibles([]);
    setDistance(0);
    bonusPointsRef.current = 0;
    
    // Initialize background stars
    const stars: BackgroundStar[] = Array.from({ length: 40 }).map((_, i) => ({
      id: i,
      x: Math.random() * width,
      y: Math.random() * height,
      size: Math.random() * 2 + 1,
      speed: Math.random() * 0.5 + 0.2,
      opacity: Math.random() * 0.6 + 0.2,
    }));
    setBackgroundStars(stars);
    
    // Initialize sea creatures in water streams
    const creatureTypes: ("crab" | "fish" | "lobster")[] = ["crab", "fish", "lobster"];
    const creatures: SeaCreature[] = [];
    // Top stream creatures (above top track)
    for (let i = 0; i < 8; i++) {
      creatures.push({
        id: i,
        x: Math.random() * width,
        y: trackTopY - 20 - Math.random() * 50,
        type: creatureTypes[i % 3],
        speed: 1.5 + Math.random() * 1.5,
        direction: Math.random() > 0.5 ? 1 : -1,
        stream: "top",
      });
    }
    // Bottom stream creatures (below bottom track)
    for (let i = 0; i < 8; i++) {
      creatures.push({
        id: i + 8,
        x: Math.random() * width,
        y: trackBottomY + TRACK_HEIGHT + 10 + Math.random() * 50,
        type: creatureTypes[i % 3],
        speed: 1.5 + Math.random() * 1.5,
        direction: Math.random() > 0.5 ? 1 : -1,
        stream: "bottom",
      });
    }
    setSeaCreatures(creatures);
    
    // Start obstacle pulse animation
    obstacleScale.value = withRepeat(
      withSequence(
        withTiming(1.08, { duration: 600, easing: Easing.inOut(Easing.ease) }),
        withTiming(1, { duration: 600, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      true
    );
    
    // Start wheel rotation animation (car-like movement)
    wheelRotation.value = withRepeat(
      withTiming(360, { duration: 300, easing: Easing.linear }),
      -1,
      false
    );
    
    // Start eye sparkle animation
    eyeSparkle.value = withRepeat(
      withSequence(
        withTiming(1.3, { duration: 400 }),
        withTiming(1, { duration: 400 })
      ),
      -1,
      true
    );
    
    // Play car startup sound at game start
    playCarStartupSound(gameState?.soundEnabled ?? false);
    
    // Start continuous gas pedal sound during gameplay
    startGasPedalSound(gameState?.soundEnabled ?? false);
    
    // Initialize floating distraction particles - more particles with vibrant colors
    const distractionColors = [
      "#FF6B6B", "#4ECDC4", "#FFE66D", "#95E1D3", "#F38181",
      "#AA96DA", "#FCBAD3", "#A8D8EA", "#FF9F43", "#00D2D3",
      "#5F27CD", "#10AC84", "#EE5A24", "#EA2027", "#FFC312",
    ];
    const initialParticles: FloatingParticle[] = Array.from({ length: 0 }).map((_, i) => ({
      id: i,
      x: Math.random() * width,
      y: trackTopY + TRACK_HEIGHT + Math.random() * (trackBottomY - trackTopY - TRACK_HEIGHT - 40) + 20,
      size: Math.random() * 16 + 8,
      speed: Math.random() * 2 + 0.5,
      color: distractionColors[Math.floor(Math.random() * distractionColors.length)],
      opacity: Math.random() * 0.5 + 0.3,
    }));
    setFloatingParticles(initialParticles);
    
    gameLoopRef.current = setInterval(() => {
      if (isGameOverRef.current) return;

      // Update floating particles
      setFloatingParticles((prev) =>
        prev.map((particle) => ({
          ...particle,
          x: particle.x - particle.speed > -20 ? particle.x - particle.speed : width + 20,
        }))
      );
      
      // Update background stars
      setBackgroundStars((prev) =>
        prev.map((star) => ({
          ...star,
          x: star.x - star.speed > -10 ? star.x - star.speed : width + 10,
        }))
      );
      
      // Update distance
      setDistance(d => d + gameSpeedRef.current * 0.1);
      
      // Update sea creatures positions
      setSeaCreatures((prev) =>
        prev.map((creature) => {
          let newX = creature.x + creature.speed * creature.direction;
          // Wrap around screen
          if (newX > width + 50) newX = -50;
          if (newX < -50) newX = width + 50;
          return { ...creature, x: newX };
        })
      );
      
      setSkyHeroX(prev => {
        if (prev > width + 100) {
          setShowSkyHero(false);
          return -100;
        }
        return prev + 3;
      });

      if (showSwingHero) {
        setSwingHeroSwing(prev => prev + 0.06);
        setSwingHeroY(prev => {
          const target = height * 0.35;
          if (prev < target) return prev + 4;
          return target + Math.sin(swingHeroSwing * 3) * 40;
        });
        setSwingHeroX(prev => {
          const swingAmount = Math.sin(swingHeroSwing) * 80;
          const newX = width * 0.5 + swingAmount;
          if (swingHeroSwing > Math.PI * 6) {
            setSwingHeroY(p => p + 8);
            if (swingHeroY > height + 100) {
              setShowSwingHero(false);
            }
          }
          return newX;
        });
      }

      if (showStarWarrior) {
        setStarWarriorX(prev => {
          if (prev > width + 100) {
            setShowStarWarrior(false);
            return -100;
          }
          return prev + 4;
        });
      }

      if (showShadowGlider) {
        setShadowGliderRopeY(prev => {
          if (prev < height * 0.5) return prev + 5;
          return prev;
        });
        setShadowGliderX(prev => {
          if (shadowGliderRopeY >= height * 0.5) {
            const newX = prev - 4;
            if (newX < -100) {
              setShowShadowGlider(false);
              return width + 100;
            }
            return newX;
          }
          return prev;
        });
        setShadowGliderY(prev => {
          if (shadowGliderRopeY < height * 0.5) {
            return height * 0.15 + shadowGliderRopeY;
          }
          return prev;
        });
      }

      if (showMightyJumper) {
        setMightyJumperPhase(prev => prev + 0.08);
        setMightyJumperX(prev => {
          const newX = prev + 5;
          if (newX > width + 100) {
            setShowMightyJumper(false);
            return -80;
          }
          return newX;
        });
        setMightyJumperY(prev => {
          const jumpHeight = Math.abs(Math.sin(mightyJumperPhase)) * 200;
          return height * 0.7 - jumpHeight;
        });
      }

      setObstacles((prev) => {
        if (freezeActiveRef.current) {
          return prev;
        }
        
        const updated = prev
          .map((obs) => ({ ...obs, x: obs.x - gameSpeedRef.current }));

        if (Date.now() - gameStartTime < GRACE_PERIOD) {
          return updated.filter((obs) => obs.x > -50);
        }

        const passedObstacles: Obstacle[] = [];
        const remainingObstacles: Obstacle[] = [];
        
        for (const obs of updated) {
          const playerLeft = playerX - PLAYER_SIZE / 2;
          const playerRight = playerX + PLAYER_SIZE / 2;
          const obstacleLeft = obs.x - obs.width / 2;
          const obstacleRight = obs.x + obs.width / 2;

          const horizontalCollision =
            playerRight > obstacleLeft + 5 && playerLeft < obstacleRight - 5;

          if (horizontalCollision && obs.track === currentTrackRef.current) {
            if (hasShieldRef.current) {
              hasShieldRef.current = false;
              setActivePowers(p => p.filter(pw => pw.type !== "shield"));
              setActivePowerTypes(p => p.filter(pt => pt !== "shield"));
              continue;
            }
            handleGameOver();
            return [];
          }
          
          if (obs.x < playerLeft - 20 && obs.x > playerLeft - 25) {
            passedObstacles.push(obs);
          }
          
          if (obs.x > -50) {
            remainingObstacles.push(obs);
          }
        }
        
        if (passedObstacles.length > 0) {
          passedObstacles.forEach(() => {
            runOnJS(incrementCombo)();
          });
        }

        return remainingObstacles;
      });
      
      // Move collectibles and check collection
      setCollectibles(prev => {
        if (freezeActiveRef.current) return prev;
        
        const playerLeft = playerX - PLAYER_SIZE / 2;
        const playerRight = playerX + PLAYER_SIZE / 2;
        const playerTop = currentTrackRef.current === "bottom" 
          ? trackBottomY - PLAYER_SIZE + 4 
          : trackTopY + TRACK_HEIGHT - 4;
        const playerBottom = playerTop + PLAYER_SIZE;
        
        return prev
          .map(c => ({ ...c, x: c.x - gameSpeedRef.current }))
          .filter(c => {
            if (c.collected || c.x < -50) return false;
            
            // Check if player collected this
            const colLeft = c.x - c.size / 2;
            const colRight = c.x + c.size / 2;
            const colTop = c.y;
            const colBottom = c.y + c.size;
            
            const horizontalCollision = playerRight > colLeft && playerLeft < colRight;
            const verticalCollision = playerBottom > colTop && playerTop < colBottom;
            
            if (horizontalCollision && verticalCollision) {
              // Collected!
              const pointsToAdd = c.type === "star" ? 5 : 3;
              bonusPointsRef.current += pointsToAdd;
              
              // Trigger collect explosion
              triggerCollectExplosion(c.x, c.y, c.type);
              
              // Update streak and show encouragement
              setStreak(prev => {
                const newStreak = prev + 1;
                if (newStreak === 3) showEncouragement("Nice!");
                if (newStreak === 5) showEncouragement("Amazing!");
                if (newStreak === 10) showEncouragement("GODLIKE!");
                return newStreak;
              });
              
              if (gameState?.soundEnabled) {
                playCollectSound(true);
              }
              if (gameState?.hapticsEnabled) {
                triggerVictoryHaptic(true);
              }
              return false;
            }
            
            return true;
          });
      });
    }, 16);

    setTimeout(() => {
      if (isGameOverRef.current) return;
      
      const obstacleTypes: Array<{ type: Obstacle["type"]; color: string }> = [
        { type: "cone", color: "#FF6600" },
        { type: "barrel", color: "#CC0000" },
        { type: "rock", color: "#666666" },
      ];
      
      obstacleSpawnRef.current = setInterval(() => {
        if (isGameOverRef.current) return;
        
        setScore(currentScore => {
          // Boss Level check - every 50 points
          // Smart patterns - alternating tracks
          let track: "top" | "bottom";
          if (currentScore >= 30 && Math.random() > 0.7) {
            // Pattern mode: alternating obstacles
            const lastObs = obstacles[obstacles.length - 1];
            track = lastObs?.track === "top" ? "bottom" : "top";
          } else {
            track = Math.random() > 0.5 ? "top" : "bottom";
          }
          
          const typeConfig = obstacleTypes[Math.floor(Math.random() * obstacleTypes.length)];
          const obstacleHeight = currentScore >= 20 ? 44 : 36;
          const obstacleWidth = currentScore >= 20 ? 44 : 36;
          const minGap = currentScore >= 40 ? 100 : MIN_OBSTACLE_GAP;
          
          const newObstacle: Obstacle = {
            id: obstacleIdRef.current++,
            x: width + 50,
            track,
            type: typeConfig.type,
            color: typeConfig.color,
            width: obstacleWidth,
            height: obstacleHeight,
          };

          setObstacles((prev) => {
            const rightmostX = prev.reduce((max, obs) => Math.max(max, obs.x), 0);
            if (rightmostX > width - minGap) return prev;
            return [...prev, newObstacle];
          });
          
          return currentScore;
        });
      }, SPAWN_INTERVAL);
      
      // Spawn collectibles (hearts and stars) between obstacles
      setTimeout(() => {
        collectibleSpawnRef.current = setInterval(() => {
          if (isGameOverRef.current) return;
          
          const collectibleTypes: Collectible["type"][] = ["heart", "star"];
          const type = collectibleTypes[Math.floor(Math.random() * collectibleTypes.length)];
          const collectibleSize = 28;
          
          // Find the last obstacle's track and spawn on the OPPOSITE track
          setObstacles(currentObstacles => {
            const recentObstacle = currentObstacles.length > 0 
              ? currentObstacles[currentObstacles.length - 1] 
              : null;
            
            // Spawn on opposite track from last obstacle (guaranteed safe)
            const isTopTrack = recentObstacle ? recentObstacle.track === "bottom" : Math.random() > 0.5;
            
            // Match player Y positions for collision detection
            const collectibleY = isTopTrack 
              ? trackTopY + TRACK_HEIGHT - 4 - collectibleSize / 2  // Top track
              : trackBottomY - PLAYER_SIZE + 4;                      // Bottom track
            
            const newCollectible: Collectible = {
              id: collectibleIdRef.current++,
              x: width + 150,  // Spawn far right to ensure spacing
              y: collectibleY,
              type,
              size: collectibleSize,
              collected: false,
            };
            
            setCollectibles(prev => [...prev, newCollectible]);
            
            return currentObstacles; // Don't modify obstacles
          });
        }, 5000);  // Every 5 seconds for better spacing
      }, 2500);  // Start offset from obstacles
    }, GRACE_PERIOD);

    scoreIntervalRef.current = setInterval(() => {
      if (isGameOverRef.current) return;
      
      setScore((prev) => {
        const comboMultiplier = combo > 3 ? 1 + (combo - 3) * 0.1 : 1;
        const baseIncrement = doublePointsRef.current ? 2 : 1;
        const increment = Math.floor(baseIncrement * comboMultiplier);
        const newScore = prev + increment;
        
        if (newScore % LEVEL_INCREASE_INTERVAL === 0) {
          setLevel((prevLevel) => {
            const newLevel = prevLevel + 1;
            if (newLevel % 5 === 0) {
              gameSpeedRef.current = Math.min(gameSpeedRef.current + 0.5, 12);
            }
            if (newLevel % 10 === 0) {
              setBackgroundLevel(bl => (bl + 1) % BACKGROUND_GRADIENTS.length);
            }
            return newLevel;
          });
        }
        scoreScale.value = withSpring(1.05, { damping: 15 }, () => {
          scoreScale.value = withSpring(1, { damping: 20 });
        });
        return newScore;
      });
    }, 600);
  }, [playerX, handleGameOver, scoreScale, obstacles]);

  const handleFlip = useCallback(() => {
    if (isGameOverRef.current || isDyingRef.current) return;

    if (!isPlaying) {
      return;
    }

    const newTrack = currentTrackRef.current === "bottom" ? "top" : "bottom";
    currentTrackRef.current = newTrack;
    flipCountRef.current += 1;
    
    setSuccessfulFlips(prev => {
      const newCount = prev + 1;
      if (newCount === 15 && !showSkyHero) {
        setShowSkyHero(true);
        setSkyHeroX(-100);
      }
      if (newCount === 20 && !showSwingHero) {
        setShowSwingHero(true);
        setSwingHeroX(width * 0.6);
        setSwingHeroY(-60);
        setSwingHeroSwing(0);
      }
      if (newCount === 25 && !showStarWarrior) {
        setShowStarWarrior(true);
        setStarWarriorX(-100);
      }
      if (newCount === 30 && !showShadowGlider) {
        setShowShadowGlider(true);
        setShadowGliderX(width + 80);
        setShadowGliderY(height * 0.15);
        setShadowGliderRopeY(0);
      }
      if (newCount === 35 && !showMightyJumper) {
        setShowMightyJumper(true);
        setMightyJumperX(-80);
        setMightyJumperY(height * 0.7);
        setMightyJumperPhase(0);
      }
      return newCount;
    });

    // Special 360 rotation with dramatic effect + thunder sound
    playerRotation.value = withSequence(
      withTiming(newTrack === "top" ? 720 : -720, { duration: 400, easing: Easing.out(Easing.back(1.5)) }),
      withTiming(0, { duration: 0 })
    );
    
    // Play thunder sound for dramatic flip effect
    if (gameState?.soundEnabled) {
      playThunderSound(true);
    }

    // Different sounds and haptics for up vs down flip
    if (gameState?.soundEnabled) {
      playFlipSound(true, newTrack === "top" ? "up" : "down");
    }
    if (gameState?.hapticsEnabled) {
      if (newTrack === "top") {
        triggerFlipUpHaptic(true);
      } else {
        triggerFlipDownHaptic(true);
      }
    }
    
    createFlipParticles();

    const flipSpeed = score >= 70 ? 100 : 150;
    
    worldRotation.value = withTiming(
      newTrack === "top" ? 180 : 0,
      { duration: flipSpeed, easing: Easing.out(Easing.cubic) }
    );

    playerBounce.value = withSpring(-10, { damping: 8 }, () => {
      playerBounce.value = withSpring(0, { damping: 12 });
    });
  }, [isPlaying, gameState, worldRotation, playerBounce, startGame, createFlipParticles, score]);

  const worldAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${worldRotation.value}deg` }],
  }));

  const playerAnimatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateY: playerBounce.value },
      { rotate: `${playerRotation.value - worldRotation.value}deg` },
    ],
  }));

  const playerGlowStyle = useAnimatedStyle(() => ({
    opacity: playerGlow.value,
  }));
  
  const powerGlowStyle = useAnimatedStyle(() => ({
    transform: [{ scale: powerGlowPulse.value }],
    opacity: activePowerTypes.length > 0 ? 0.8 : 0,
  }));
  
  const wheelAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${wheelRotation.value}deg` }],
  }));
  
  const wheelsContainerAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${-worldRotation.value}deg` }],
  }));
  
  const eyeSparkleStyle = useAnimatedStyle(() => ({
    transform: [{ scale: eyeSparkle.value }],
  }));
  
  const encourageAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: encourageScale.value }],
    opacity: encourageOpacity.value,
  }));
  
  const screenShakeStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: screenShakeX.value },
      { translateY: screenShakeY.value },
    ],
  }));
  
  const comboAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: comboScale.value }],
    opacity: comboOpacity.value,
  }));

  const scoreAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scoreScale.value }],
  }));

  const obstacleAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: obstacleScale.value }],
  }));

  const sparkleStyle = useAnimatedStyle(() => ({
    opacity: sparkleOpacity.value,
  }));

  const motionBlurStyle = useAnimatedStyle(() => ({
    opacity: motionBlur.value,
  }));

  useEffect(() => {
    if (gameSpeedRef.current >= 8) {
      motionBlur.value = withTiming(0.15, { duration: 300 });
    } else {
      motionBlur.value = withTiming(0, { duration: 300 });
    }
  }, [level]);

  const currentTrack = currentTrackRef.current;

  return (
    <View style={styles.container}>
    <Pressable style={StyleSheet.absoluteFill} onPress={handleFlip} testID="game-area">
      <Animated.View style={[StyleSheet.absoluteFill, screenShakeStyle]}>
        <LinearGradient
          colors={BACKGROUND_GRADIENTS[backgroundLevel]}
          style={StyleSheet.absoluteFill}
        />

      <View style={styles.sparklesContainer} pointerEvents="none">
        {Array.from({ length: 25 }).map((_, i) => (
          <Animated.View
            key={i}
            style={[
              styles.sparkle,
              sparkleStyle,
              {
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                width: Math.random() * 3 + 1,
                height: Math.random() * 3 + 1,
                backgroundColor: [GameColors.candy1, GameColors.candy2, GameColors.candy3, GameColors.candy4][Math.floor(Math.random() * 4)],
              },
            ]}
          />
        ))}
      </View>
      
      {backgroundStars.map((star) => (
        <View
          key={`star-${star.id}`}
          style={[
            styles.backgroundStar,
            {
              left: star.x,
              top: star.y,
              width: star.size,
              height: star.size,
              opacity: star.opacity,
            },
          ]}
        />
      ))}
      
      {/* Flame Phoenix flying after 15 successful flips */}
      {showSkyHero ? (
        <Animated.View 
          style={[
            styles.heroContainer,
            {
              left: skyHeroX,
              top: height * 0.3,
            }
          ]}
        >
          <View style={{ width: 44, height: 22, position: "relative" }}>
            {/* Body */}
            <View style={{ position: "absolute", top: 4, left: 10, width: 24, height: 14, backgroundColor: "#FF6D00", borderRadius: 7, shadowColor: "#FF6D00", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.8, shadowRadius: 6 }} />
            {/* Left wing (top) */}
            <View style={{ position: "absolute", top: -4, left: 0, width: 18, height: 10, backgroundColor: "#FF8F00", borderTopLeftRadius: 12, borderTopRightRadius: 4, transform: [{ rotate: "-15deg" }] }} />
            {/* Right wing (top) */}
            <View style={{ position: "absolute", top: -4, right: 0, width: 18, height: 10, backgroundColor: "#FF8F00", borderTopRightRadius: 12, borderTopLeftRadius: 4, transform: [{ rotate: "15deg" }] }} />
            {/* Left wing flame tip */}
            <View style={{ position: "absolute", top: -8, left: -2, width: 8, height: 6, backgroundColor: "#FFD54F", borderTopLeftRadius: 6, borderTopRightRadius: 2, transform: [{ rotate: "-20deg" }] }} />
            {/* Right wing flame tip */}
            <View style={{ position: "absolute", top: -8, right: -2, width: 8, height: 6, backgroundColor: "#FFD54F", borderTopRightRadius: 6, borderTopLeftRadius: 2, transform: [{ rotate: "20deg" }] }} />
            {/* Head */}
            <View style={{ position: "absolute", top: 0, left: 16, width: 12, height: 12, borderRadius: 6, backgroundColor: "#FFB300" }}>
              {/* Eye */}
              <View style={{ position: "absolute", top: 3, left: 3, width: 4, height: 3, borderRadius: 2, backgroundColor: "#FFFFFF" }}>
                <View style={{ position: "absolute", top: 0.5, left: 1.5, width: 2, height: 2, borderRadius: 1, backgroundColor: "#1A1A1A" }} />
              </View>
              {/* Beak */}
              <View style={{ position: "absolute", top: 5, right: -4, width: 6, height: 3, backgroundColor: "#FF3D00", borderTopRightRadius: 4, borderBottomRightRadius: 2 }} />
            </View>
            {/* Tail flames */}
            <View style={{ position: "absolute", bottom: 0, left: -4, width: 10, height: 5, backgroundColor: "#FF3D00", borderTopLeftRadius: 6, borderBottomLeftRadius: 3, transform: [{ rotate: "10deg" }] }} />
            <View style={{ position: "absolute", bottom: 4, left: -8, width: 8, height: 4, backgroundColor: "#FFD54F", borderTopLeftRadius: 4, borderBottomLeftRadius: 2, transform: [{ rotate: "5deg" }] }} />
            <View style={{ position: "absolute", bottom: -2, left: -2, width: 6, height: 3, backgroundColor: "#FFAB00", borderRadius: 2, transform: [{ rotate: "15deg" }] }} />
          </View>
        </Animated.View>
      ) : null}

      {/* Crystal Spider descending after 20 successful flips */}
      {showSwingHero ? (
        <View style={[styles.heroContainer, { left: swingHeroX - 18, top: swingHeroY }]}>
          <View style={{ position: "absolute", top: -swingHeroY, left: 18, width: 2, backgroundColor: "#C0C0C0", height: swingHeroY, zIndex: 90 }} />
          <View style={{ position: "absolute", top: -20, left: 8, width: 1, backgroundColor: "#C0C0C0", height: 25, transform: [{ rotate: "-30deg" }], zIndex: 90 }} />
          <View style={{ position: "absolute", top: -20, left: 28, width: 1, backgroundColor: "#C0C0C0", height: 25, transform: [{ rotate: "30deg" }], zIndex: 90 }} />
          <View style={{ width: 36, height: 22, backgroundColor: "#7B1FA2", borderRadius: 11, position: "relative" }}>
            <View style={{ position: "absolute", right: -6, top: 1, width: 14, height: 14, borderRadius: 7, backgroundColor: "#9C27B0", borderWidth: 1, borderColor: "#6A1B9A" }}>
              <View style={{ position: "absolute", top: 3, left: 1, width: 5, height: 4, borderRadius: 2, backgroundColor: "#E1BEE7" }}>
                <View style={{ position: "absolute", top: 1, left: 1.5, width: 2, height: 2, borderRadius: 1, backgroundColor: "#1A1A1A" }} />
              </View>
              <View style={{ position: "absolute", top: 3, right: 1, width: 5, height: 4, borderRadius: 2, backgroundColor: "#E1BEE7" }}>
                <View style={{ position: "absolute", top: 1, left: 1.5, width: 2, height: 2, borderRadius: 1, backgroundColor: "#1A1A1A" }} />
              </View>
            </View>
            <View style={{ position: "absolute", top: 8, left: 2, width: 8, height: 3, backgroundColor: "#CE93D8", borderRadius: 1 }} />
            <View style={{ position: "absolute", top: 12, left: 4, width: 6, height: 3, backgroundColor: "#CE93D8", borderRadius: 1 }} />
            <View style={{ position: "absolute", left: -10, top: 6, width: 12, height: 4, backgroundColor: "#7B1FA2", borderRadius: 2, transform: [{ rotate: "-20deg" }] }} />
            <View style={{ position: "absolute", left: -8, top: 12, width: 10, height: 4, backgroundColor: "#7B1FA2", borderRadius: 2, transform: [{ rotate: "15deg" }] }} />
            <View style={{ position: "absolute", right: -14, top: 6, width: 12, height: 4, backgroundColor: "#7B1FA2", borderRadius: 2, transform: [{ rotate: "20deg" }] }} />
            <View style={{ position: "absolute", right: -12, top: 12, width: 10, height: 4, backgroundColor: "#7B1FA2", borderRadius: 2, transform: [{ rotate: "-15deg" }] }} />
          </View>
        </View>
      ) : null}

      {/* Storm Cloud floating after 25 successful flips */}
      {showStarWarrior ? (
        <View style={[styles.heroContainer, { left: starWarriorX, top: height * 0.25 }]}>
          <View style={{ width: 44, height: 24, backgroundColor: "#546E7A", borderRadius: 12, position: "relative" }}>
            <View style={{ position: "absolute", top: -8, left: 6, width: 16, height: 16, borderRadius: 8, backgroundColor: "#607D8B" }} />
            <View style={{ position: "absolute", top: -12, left: 16, width: 20, height: 20, borderRadius: 10, backgroundColor: "#78909C" }} />
            <View style={{ position: "absolute", top: -4, right: 2, width: 12, height: 12, borderRadius: 6, backgroundColor: "#607D8B" }} />
            <View style={{ position: "absolute", top: 6, left: 10, width: 5, height: 5, borderRadius: 2.5, backgroundColor: "#FFFFFF" }}>
              <View style={{ position: "absolute", top: 1, left: 1.5, width: 2, height: 2, borderRadius: 1, backgroundColor: "#263238" }} />
            </View>
            <View style={{ position: "absolute", top: 6, left: 22, width: 5, height: 5, borderRadius: 2.5, backgroundColor: "#FFFFFF" }}>
              <View style={{ position: "absolute", top: 1, left: 1.5, width: 2, height: 2, borderRadius: 1, backgroundColor: "#263238" }} />
            </View>
            <View style={{ position: "absolute", bottom: -6, left: 10, width: 2, height: 8, backgroundColor: "#FFD54F", transform: [{ rotate: "-10deg" }] }} />
            <View style={{ position: "absolute", bottom: -8, left: 16, width: 2, height: 10, backgroundColor: "#FFD54F" }} />
            <View style={{ position: "absolute", bottom: -5, left: 22, width: 2, height: 7, backgroundColor: "#FFD54F", transform: [{ rotate: "10deg" }] }} />
          </View>
        </View>
      ) : null}

      {/* Moonlight Owl gliding after 30 successful flips */}
      {showShadowGlider ? (
        <View style={[styles.heroContainer, { left: shadowGliderX, top: shadowGliderY }]}>
          <View style={{ position: "absolute", top: -shadowGliderRopeY, left: 18, width: 0, height: 0, zIndex: 90 }} />
          <View style={{ width: 36, height: 24, backgroundColor: "#3E2723", borderRadius: 12, position: "relative" }}>
            <View style={{ position: "absolute", left: -14, top: 4, width: 18, height: 12, backgroundColor: "#4E342E", borderTopLeftRadius: 10, borderBottomLeftRadius: 4, transform: [{ rotate: "-5deg" }] }} />
            <View style={{ position: "absolute", right: -14, top: 4, width: 18, height: 12, backgroundColor: "#4E342E", borderTopRightRadius: 10, borderBottomRightRadius: 4, transform: [{ rotate: "5deg" }] }} />
            <View style={{ position: "absolute", right: -4, top: -6, width: 16, height: 16, borderRadius: 8, backgroundColor: "#5D4037" }}>
              <View style={{ position: "absolute", top: -4, left: -1, width: 7, height: 7, backgroundColor: "#3E2723", borderTopLeftRadius: 4, transform: [{ rotate: "-15deg" }] }} />
              <View style={{ position: "absolute", top: -4, right: -1, width: 7, height: 7, backgroundColor: "#3E2723", borderTopRightRadius: 4, transform: [{ rotate: "15deg" }] }} />
              <View style={{ position: "absolute", top: 4, left: 1, width: 6, height: 5, borderRadius: 3, backgroundColor: "#FFD54F" }}>
                <View style={{ position: "absolute", top: 1, left: 2, width: 2, height: 3, borderRadius: 1, backgroundColor: "#1A1A1A" }} />
              </View>
              <View style={{ position: "absolute", top: 4, right: 1, width: 6, height: 5, borderRadius: 3, backgroundColor: "#FFD54F" }}>
                <View style={{ position: "absolute", top: 1, left: 2, width: 2, height: 3, borderRadius: 1, backgroundColor: "#1A1A1A" }} />
              </View>
              <View style={{ position: "absolute", bottom: 1, left: 6, width: 4, height: 3, backgroundColor: "#FF8F00", borderRadius: 2 }} />
            </View>
            <View style={{ position: "absolute", bottom: -4, left: 10, width: 6, height: 6, backgroundColor: "#5D4037", borderRadius: 2 }} />
            <View style={{ position: "absolute", bottom: -4, right: 10, width: 6, height: 6, backgroundColor: "#5D4037", borderRadius: 2 }} />
          </View>
        </View>
      ) : null}

      {/* Rock Golem bouncing after 35 successful flips */}
      {showMightyJumper ? (
        <View style={[styles.heroContainer, { left: mightyJumperX, top: mightyJumperY }]}>
          {mightyJumperY < height * 0.65 ? (
            <View style={{ position: "absolute", bottom: -8, left: 10, width: 16, height: 8, backgroundColor: "rgba(0,0,0,0.2)", borderRadius: 8 }} />
          ) : null}
          <View style={{ width: 40, height: 30, backgroundColor: "#78909C", borderRadius: 6, position: "relative" }}>
            <View style={{ position: "absolute", top: -2, left: 4, right: 4, height: 6, backgroundColor: "#90A4AE", borderTopLeftRadius: 4, borderTopRightRadius: 4 }} />
            <View style={{ position: "absolute", right: -4, top: -6, width: 16, height: 16, borderRadius: 8, backgroundColor: "#90A4AE" }}>
              <View style={{ position: "absolute", top: 4, left: 2, width: 5, height: 4, borderRadius: 2, backgroundColor: "#B0BEC5" }}>
                <View style={{ position: "absolute", top: 1, left: 1.5, width: 2, height: 2, borderRadius: 1, backgroundColor: "#37474F" }} />
              </View>
              <View style={{ position: "absolute", top: 4, right: 2, width: 5, height: 4, borderRadius: 2, backgroundColor: "#B0BEC5" }}>
                <View style={{ position: "absolute", top: 1, left: 1.5, width: 2, height: 2, borderRadius: 1, backgroundColor: "#37474F" }} />
              </View>
              <View style={{ position: "absolute", bottom: 2, left: 5, width: 6, height: 2, borderRadius: 1, backgroundColor: "#546E7A" }} />
            </View>
            <View style={{ position: "absolute", left: -10, top: 6, width: 14, height: 10, backgroundColor: "#78909C", borderRadius: 4 }}>
              <View style={{ position: "absolute", left: -3, bottom: 0, width: 6, height: 6, borderRadius: 3, backgroundColor: "#90A4AE" }} />
            </View>
            <View style={{ position: "absolute", right: -10, top: 10, width: 14, height: 10, backgroundColor: "#78909C", borderRadius: 4 }}>
              <View style={{ position: "absolute", right: -3, bottom: 0, width: 6, height: 6, borderRadius: 3, backgroundColor: "#90A4AE" }} />
            </View>
            <View style={{ position: "absolute", bottom: -8, left: 6, width: 10, height: 10, backgroundColor: "#607D8B", borderBottomLeftRadius: 3, borderBottomRightRadius: 3 }} />
            <View style={{ position: "absolute", bottom: -8, right: 6, width: 10, height: 10, backgroundColor: "#607D8B", borderBottomLeftRadius: 3, borderBottomRightRadius: 3 }} />
            <View style={{ position: "absolute", top: 10, left: 8, width: 6, height: 4, backgroundColor: "#FF6D00", borderRadius: 2 }} />
            <View style={{ position: "absolute", top: 16, left: 14, width: 4, height: 3, backgroundColor: "#FF6D00", borderRadius: 1 }} />
          </View>
        </View>
      ) : null}

      <View style={[styles.scoreContainer, { top: insets.top + Spacing.lg }]}>
        <View style={[styles.hudBadge, { shadowColor: "#A66CFF" }]}>
          <LinearGradient
            colors={["#A66CFF", "#8B5CF6"]}
            style={styles.hudGradient}
          >
            <ThemedText style={styles.hudLabel}>LEVEL</ThemedText>
            <ThemedText style={styles.hudValue}>{level}</ThemedText>
          </LinearGradient>
        </View>
        
        <Animated.View style={[styles.hudBadge, { shadowColor: "#FFD93D" }, scoreAnimatedStyle]}>
          <LinearGradient
            colors={["#FFD93D", "#FFA726"]}
            style={styles.hudGradient}
          >
            <ThemedText style={styles.hudLabel}>SCORE</ThemedText>
            <ThemedText style={[styles.hudValue, { color: "#1A0A2E" }]}>{score}</ThemedText>
          </LinearGradient>
        </Animated.View>
        
        <View style={[styles.hudBadge, { shadowColor: "#FF6B9D" }]}>
          <LinearGradient
            colors={["#FF6B9D", "#FF4081"]}
            style={styles.hudGradient}
          >
            <ThemedText style={styles.hudLabel}>BEST</ThemedText>
            <ThemedText style={styles.hudValue}>{gameState?.bestScore || 0}</ThemedText>
          </LinearGradient>
        </View>
        
        <View style={[styles.hudBadge, { shadowColor: "#4ECDC4" }]}>
          <LinearGradient
            colors={["#4ECDC4", "#26A69A"]}
            style={styles.hudGradient}
          >
            <ThemedText style={styles.hudLabel}>DIST</ThemedText>
            <ThemedText style={styles.hudValue}>{Math.floor(distance)}m</ThemedText>
          </LinearGradient>
        </View>
      </View>

      <Animated.View style={[styles.gameWorld, worldAnimatedStyle]}>
        {/* Top Water Stream */}
        <View style={[styles.waterStream, { top: trackTopY - 80, height: 80 }]}>
          <LinearGradient
            colors={["#87CEEB", "#4FC3F7", "#29B6F6"]}
            style={styles.waterGradient}
          />
        </View>
        
        {/* Top Road/Track */}
        <View style={[styles.roadTrack, { top: trackTopY }]}>
          {/* Grass edge */}
          <View style={[styles.grassEdge, styles.grassTop]} />
          {/* Asphalt */}
          <View style={styles.asphaltSurface}>
            {/* White edge line */}
            <View style={[styles.roadEdgeLine, styles.roadEdgeTop]} />
            {/* Yellow center dashes */}
            <View style={styles.roadCenterContainer}>
              {Array.from({ length: 15 }).map((_, i) => (
                <View key={i} style={styles.roadCenterDash} />
              ))}
            </View>
            {/* White edge line */}
            <View style={[styles.roadEdgeLine, styles.roadEdgeBottom]} />
          </View>
          {/* Grass edge */}
          <View style={[styles.grassEdge, styles.grassBottom]} />
        </View>

        {/* Bottom Road/Track */}
        <View style={[styles.roadTrack, { top: trackBottomY }]}>
          {/* Grass edge */}
          <View style={[styles.grassEdge, styles.grassTop]} />
          {/* Asphalt */}
          <View style={styles.asphaltSurface}>
            {/* White edge line */}
            <View style={[styles.roadEdgeLine, styles.roadEdgeTop]} />
            {/* Yellow center dashes */}
            <View style={styles.roadCenterContainer}>
              {Array.from({ length: 15 }).map((_, i) => (
                <View key={i} style={styles.roadCenterDash} />
              ))}
            </View>
            {/* White edge line */}
            <View style={[styles.roadEdgeLine, styles.roadEdgeBottom]} />
          </View>
          {/* Grass edge */}
          <View style={[styles.grassEdge, styles.grassBottom]} />
        </View>

        {/* Bottom Water Stream */}
        <View style={[styles.waterStream, { top: trackBottomY + TRACK_HEIGHT, height: 80 }]}>
          <LinearGradient
            colors={["#29B6F6", "#4FC3F7", "#87CEEB"]}
            style={styles.waterGradient}
          />
        </View>

        {/* Sea Creatures in water streams */}
        {seaCreatures.map((creature) => (
          <View
            key={`creature-${creature.id}`}
            style={[
              styles.seaCreature,
              {
                left: creature.x,
                top: creature.y,
                transform: [{ scaleX: creature.direction }],
              },
            ]}
          >
            <SeaCreatureShape type={creature.type} />
          </View>
        ))}

        {floatingParticles.map((particle) => (
          <View
            key={`particle-${particle.id}`}
            style={[
              styles.floatingParticle,
              {
                left: particle.x,
                top: particle.y,
                width: particle.size,
                height: particle.size,
                backgroundColor: particle.color,
                opacity: particle.opacity,
                borderRadius: particle.size / 2,
              },
            ]}
          />
        ))}

        {/* Obstacles on tracks */}
        {obstacles.map((obs) => (
          <Animated.View
            key={`obs-${obs.id}`}
            style={[
              styles.obstacle,
              obstacleAnimatedStyle,
              {
                left: obs.x - obs.width / 2,
                top:
                  obs.track === "top"
                    ? trackTopY + TRACK_HEIGHT - obs.height
                    : trackBottomY,
              },
            ]}
          >
            <ObstacleShape obstacle={obs} track={obs.track} />
          </Animated.View>
        ))}

        {collectibles.map((col) => (
          <View
            key={`col-${col.id}`}
            style={[
              styles.collectible,
              {
                left: col.x - col.size / 2,
                top: col.y,
              },
            ]}
          >
            <CollectibleShape type={col.type} size={col.size} />
          </View>
        ))}

        <Animated.View
          style={[
            styles.playerContainer,
            playerAnimatedStyle,
            {
              left: playerX - PLAYER_SIZE / 2,
              top:
                currentTrack === "bottom"
                  ? trackBottomY - PLAYER_SIZE + 4
                  : trackTopY + TRACK_HEIGHT - 4,
            },
          ]}
        >
          <Animated.View style={[styles.playerGlow, playerGlowStyle]} />
          {/* Power active glow */}
          {activePowerTypes.length > 0 ? (
            <Animated.View style={[styles.powerActiveGlow, powerGlowStyle, {
              backgroundColor: activePowerTypes.includes("freeze") ? "#00D4FF" :
                              activePowerTypes.includes("shield") ? "#9B59B6" :
                              activePowerTypes.includes("slow") ? "#FFB800" :
                              "#2ECC71",
            }]} />
          ) : null}
          {/* Car body */}
          <LinearGradient
            colors={getPlayerColors()}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.player}
          >
            {/* Sparkling Eyes */}
            <View style={styles.eyesContainer}>
              <Animated.View style={[styles.eye, eyeSparkleStyle]}>
                <View style={styles.eyePupil} />
                <View style={styles.eyeSparkle} />
              </Animated.View>
              <Animated.View style={[styles.eye, eyeSparkleStyle]}>
                <View style={styles.eyePupil} />
                <View style={styles.eyeSparkle} />
              </Animated.View>
            </View>
          </LinearGradient>
          {/* Spinning Wheels - counter-rotate to stay at bottom */}
          <Animated.View style={[styles.wheelsContainer, wheelsContainerAnimatedStyle]}>
            <Animated.View style={[styles.wheel, wheelAnimatedStyle]}>
              <View style={styles.wheelSpoke} />
              <View style={[styles.wheelSpoke, { transform: [{ rotate: '90deg' }] }]} />
            </Animated.View>
            <Animated.View style={[styles.wheel, wheelAnimatedStyle]}>
              <View style={styles.wheelSpoke} />
              <View style={[styles.wheelSpoke, { transform: [{ rotate: '90deg' }] }]} />
            </Animated.View>
          </Animated.View>
        </Animated.View>
      </Animated.View>
      
      {explosionParticles.map((particle) => (
        <View
          key={particle.id}
          style={[
            styles.explosionParticle,
            {
              left: particle.x + particle.vx * 10,
              top: particle.y + particle.vy * 10,
              width: particle.size,
              height: particle.size,
              backgroundColor: particle.color,
              opacity: particle.opacity * 0.5,
            },
          ]}
        />
      ))}
      
      {showCombo && combo > 1 ? (
        <Animated.View style={[styles.comboContainer, comboAnimatedStyle]}>
          <LinearGradient
            colors={combo >= 5 ? ["#FFD700", "#FFA500"] : ["#A66CFF", "#FF9FF3"]}
            style={styles.comboBadge}
          >
            <ThemedText style={styles.comboText}>x{combo} COMBO!</ThemedText>
          </LinearGradient>
        </Animated.View>
      ) : null}

      {/* Collect Explosion Effects */}
      {collectExplosions.map((explosion) => (
        <View key={explosion.id} style={[styles.collectExplosion, { left: explosion.x - 25, top: explosion.y - 25 }]}>
          {Array.from({ length: 8 }).map((_, i) => (
            <Animated.View
              key={i}
              style={[
                styles.collectParticle,
                {
                  backgroundColor: explosion.color,
                  transform: [
                    { rotate: `${i * 45}deg` },
                    { translateY: -20 },
                  ],
                },
              ]}
            />
          ))}
        </View>
      ))}

      {/* Encouragement Message */}
      {encourageMessage ? (
        <Animated.View style={[styles.encourageContainer, encourageAnimatedStyle]}>
          <LinearGradient
            colors={["#FFD700", "#FFA500"]}
            style={styles.encourageBadge}
          >
            <ThemedText style={styles.encourageText}>{encourageMessage}</ThemedText>
          </LinearGradient>
        </Animated.View>
      ) : null}

      </Animated.View>
    </Pressable>

    <View style={[styles.powerButtonsContainer, { bottom: insets.bottom + Spacing.md }]}>
      <PowerButton 
        type="freeze" 
        icon="pause" 
        available={availablePowers.includes("freeze")}
        active={activePowerTypes.includes("freeze")}
        onPress={() => activatePower("freeze")}
      />
      <PowerButton 
        type="slow" 
        icon="clock" 
        available={availablePowers.includes("slow")}
        active={activePowerTypes.includes("slow")}
        onPress={() => activatePower("slow")}
      />
      <PowerButton 
        type="shield" 
        icon="shield" 
        available={availablePowers.includes("shield")}
        active={activePowerTypes.includes("shield")}
        onPress={() => activatePower("shield")}
      />
      <PowerButton 
        type="double" 
        icon="zap" 
        available={availablePowers.includes("double")}
        active={activePowerTypes.includes("double")}
        onPress={() => activatePower("double")}
      />
    </View>
    
    {flipParticles.map((particle) => (
      <View
        key={particle.id}
        style={[
          styles.flipParticle,
          {
            left: particle.x,
            top: particle.y,
            width: particle.size,
            height: particle.size,
            backgroundColor: particle.color,
            opacity: particle.opacity,
          },
        ]}
      />
    ))}
    
    <Animated.View 
      style={[
        styles.motionBlurOverlay,
        motionBlurStyle,
      ]} 
      pointerEvents="none"
    />
    
    {deathFlashOpacity > 0 ? (
      <View 
        style={[
          styles.deathFlashOverlay,
          { opacity: deathFlashOpacity },
        ]} 
        pointerEvents="none"
      />
    ) : null}
    </View>
  );
}

interface PowerButtonProps {
  type: "freeze" | "slow" | "shield" | "double";
  icon: keyof typeof Feather.glyphMap;
  available: boolean;
  active: boolean;
  onPress: () => void;
}

function PowerButton({ type, icon, available, active, onPress }: PowerButtonProps) {
  const colors = POWER_COLORS[type];
  const glowOpacity = useSharedValue(0.3);
  
  useEffect(() => {
    if (active) {
      glowOpacity.value = withRepeat(
        withSequence(
          withTiming(1, { duration: 500 }),
          withTiming(0.3, { duration: 500 })
        ),
        -1,
        true
      );
    } else {
      glowOpacity.value = 0.3;
    }
  }, [active]);
  
  const glowStyle = useAnimatedStyle(() => ({
    opacity: glowOpacity.value,
  }));
  
  const isDisabled = !available || active;
  
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={isDisabled}
      activeOpacity={0.8}
      style={[
        powerStyles.button,
        isDisabled && powerStyles.buttonDisabled,
      ]}
    >
      {available && !active ? (
        <Animated.View style={[powerStyles.glow, glowStyle, { backgroundColor: colors.glow }]} />
      ) : null}
      <LinearGradient
        colors={available ? [colors.primary, colors.secondary] : ["#444", "#333"]}
        style={powerStyles.gradient}
      >
        <Feather 
          name={icon} 
          size={16} 
          color={available ? "#FFFFFF" : "#666"} 
        />
      </LinearGradient>
      {active ? (
        <View style={[powerStyles.activeBadge, { backgroundColor: colors.primary }]}>
          <ThemedText style={powerStyles.activeBadgeText}>ON</ThemedText>
        </View>
      ) : null}
    </TouchableOpacity>
  );
}

const powerStyles = StyleSheet.create({
  button: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  glow: {
    position: "absolute",
    top: -4,
    left: -4,
    right: -4,
    bottom: -4,
    borderRadius: 26,
  },
  gradient: {
    width: 38,
    height: 38,
    borderRadius: 19,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "rgba(255,255,255,0.3)",
  },
  activeBadge: {
    position: "absolute",
    top: -3,
    right: -3,
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 6,
  },
  activeBadgeText: {
    fontSize: 7,
    fontWeight: "800",
    color: "#FFFFFF",
  },
});

function SeaCreatureShape({ type }: { type: "crab" | "fish" | "lobster" }) {
  const size = 35;
  
  switch (type) {
    case "crab":
      return (
        <Svg width={size} height={size} viewBox="0 0 100 100">
          {/* Crab body */}
          <Circle cx="50" cy="55" r="25" fill="#E57373" stroke="#C62828" strokeWidth={2} />
          {/* Eyes */}
          <Circle cx="40" cy="40" r="8" fill="#FFFFFF" />
          <Circle cx="60" cy="40" r="8" fill="#FFFFFF" />
          <Circle cx="40" cy="40" r="4" fill="#000000" />
          <Circle cx="60" cy="40" r="4" fill="#000000" />
          {/* Claws */}
          <Path d="M15 50 Q5 45, 10 35 Q15 25, 25 40" fill="#E57373" stroke="#C62828" strokeWidth={2} />
          <Path d="M85 50 Q95 45, 90 35 Q85 25, 75 40" fill="#E57373" stroke="#C62828" strokeWidth={2} />
          {/* Legs */}
          <Path d="M30 70 L20 85" stroke="#C62828" strokeWidth={3} />
          <Path d="M40 75 L35 90" stroke="#C62828" strokeWidth={3} />
          <Path d="M60 75 L65 90" stroke="#C62828" strokeWidth={3} />
          <Path d="M70 70 L80 85" stroke="#C62828" strokeWidth={3} />
        </Svg>
      );
    case "fish":
      return (
        <Svg width={size} height={size} viewBox="0 0 100 100">
          {/* Fish body */}
          <Path
            d="M80 50 Q60 25, 30 40 Q10 50, 30 60 Q60 75, 80 50 Z"
            fill="#64B5F6"
            stroke="#1976D2"
            strokeWidth={2}
          />
          {/* Tail */}
          <Path d="M15 50 L5 35 L5 65 Z" fill="#64B5F6" stroke="#1976D2" strokeWidth={2} />
          {/* Eye */}
          <Circle cx="65" cy="48" r="6" fill="#FFFFFF" />
          <Circle cx="66" cy="48" r="3" fill="#000000" />
          {/* Fins */}
          <Path d="M45 35 Q50 20, 55 35" fill="#42A5F5" stroke="#1976D2" strokeWidth={1} />
          <Path d="M45 65 Q50 80, 55 65" fill="#42A5F5" stroke="#1976D2" strokeWidth={1} />
        </Svg>
      );
    case "lobster":
      return (
        <Svg width={size} height={size} viewBox="0 0 100 100">
          {/* Lobster body */}
          <Rect x="35" y="35" width="30" height="45" rx="10" fill="#D32F2F" stroke="#B71C1C" strokeWidth={2} />
          {/* Head */}
          <Circle cx="50" cy="30" r="15" fill="#D32F2F" stroke="#B71C1C" strokeWidth={2} />
          {/* Eyes on stalks */}
          <Path d="M40 25 L35 15" stroke="#B71C1C" strokeWidth={3} />
          <Path d="M60 25 L65 15" stroke="#B71C1C" strokeWidth={3} />
          <Circle cx="35" cy="13" r="5" fill="#FFFFFF" />
          <Circle cx="65" cy="13" r="5" fill="#FFFFFF" />
          <Circle cx="35" cy="13" r="2" fill="#000000" />
          <Circle cx="65" cy="13" r="2" fill="#000000" />
          {/* Claws */}
          <Path d="M25 40 Q10 35, 15 25 Q20 15, 30 30" fill="#D32F2F" stroke="#B71C1C" strokeWidth={2} />
          <Path d="M75 40 Q90 35, 85 25 Q80 15, 70 30" fill="#D32F2F" stroke="#B71C1C" strokeWidth={2} />
          {/* Tail segments */}
          <Rect x="40" y="80" width="20" height="8" rx="3" fill="#D32F2F" stroke="#B71C1C" strokeWidth={1} />
          <Path d="M45 88 L40 98 L50 95 L60 98 L55 88" fill="#D32F2F" stroke="#B71C1C" strokeWidth={1} />
        </Svg>
      );
    default:
      return null;
  }
}

function ObstacleShape({ obstacle, track }: { obstacle: Obstacle; track: "top" | "bottom" }) {
  const { type, width: w, height: h } = obstacle;
  const size = Math.min(w, h) * 0.9;
  const strokeWidth = 2;
  const rotation = track === "top" ? "180deg" : "0deg";

  switch (type) {
    case "cone":
      // Traffic cone - orange with white stripes
      return (
        <View style={[suitStyles.container, { width: w, height: h, transform: [{ rotate: rotation }] }]}>
          <Svg width={size} height={size} viewBox="0 0 100 100">
            <Defs>
              <SvgLinearGradient id="coneGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <Stop offset="0%" stopColor="#FF6600" />
                <Stop offset="50%" stopColor="#FF8833" />
                <Stop offset="100%" stopColor="#FF6600" />
              </SvgLinearGradient>
            </Defs>
            {/* Cone body */}
            <Path
              d="M50 8 L80 85 L20 85 Z"
              fill="url(#coneGradient)"
              stroke="#CC4400"
              strokeWidth={strokeWidth}
            />
            {/* White stripes */}
            <Path d="M35 55 L65 55" stroke="#FFFFFF" strokeWidth="6" />
            <Path d="M30 70 L70 70" stroke="#FFFFFF" strokeWidth="6" />
            {/* Base */}
            <Rect x="15" y="85" width="70" height="10" rx="2" fill="#333333" stroke="#222222" strokeWidth={1} />
          </Svg>
        </View>
      );
    case "barrel":
      // Oil barrel - red with hazard symbol
      return (
        <View style={[suitStyles.container, { width: w, height: h }]}>
          <Svg width={size} height={size} viewBox="0 0 100 100">
            <Defs>
              <SvgLinearGradient id="barrelGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <Stop offset="0%" stopColor="#AA0000" />
                <Stop offset="30%" stopColor="#CC0000" />
                <Stop offset="70%" stopColor="#CC0000" />
                <Stop offset="100%" stopColor="#AA0000" />
              </SvgLinearGradient>
            </Defs>
            {/* Barrel body */}
            <Rect x="20" y="10" width="60" height="80" rx="8" fill="url(#barrelGradient)" stroke="#880000" strokeWidth={strokeWidth} />
            {/* Metal rings */}
            <Rect x="18" y="20" width="64" height="6" rx="2" fill="#444444" stroke="#333333" strokeWidth={1} />
            <Rect x="18" y="74" width="64" height="6" rx="2" fill="#444444" stroke="#333333" strokeWidth={1} />
            {/* Hazard symbol */}
            <Circle cx="50" cy="50" r="18" fill="#FFCC00" stroke="#000000" strokeWidth={1} />
            <Path d="M50 35 L60 55 L40 55 Z" fill="#000000" />
            <Circle cx="50" cy="62" r="3" fill="#000000" />
          </Svg>
        </View>
      );
    case "rock":
      // Large rock - gray boulder
      return (
        <View style={[suitStyles.container, { width: w, height: h }]}>
          <Svg width={size} height={size} viewBox="0 0 100 100">
            <Defs>
              <SvgLinearGradient id="rockGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <Stop offset="0%" stopColor="#888888" />
                <Stop offset="50%" stopColor="#666666" />
                <Stop offset="100%" stopColor="#444444" />
              </SvgLinearGradient>
            </Defs>
            {/* Main rock shape */}
            <Path
              d="M20 70 Q10 50, 25 35 Q35 15, 55 20 Q80 15, 85 40 Q95 60, 80 75 Q65 90, 45 85 Q20 85, 20 70 Z"
              fill="url(#rockGradient)"
              stroke="#333333"
              strokeWidth={strokeWidth}
            />
            {/* Rock details/cracks */}
            <Path d="M35 40 Q45 50, 40 60" stroke="#555555" strokeWidth="2" fill="none" />
            <Path d="M55 35 Q60 45, 65 50" stroke="#555555" strokeWidth="2" fill="none" />
            {/* Highlight */}
            <Circle cx="40" cy="35" r="8" fill="#999999" opacity="0.5" />
          </Svg>
        </View>
      );
    default:
      // Default to cone
      return (
        <View style={[suitStyles.container, { width: w, height: h }]}>
          <Svg width={size} height={size} viewBox="0 0 100 100">
            <Path
              d="M50 8 L80 85 L20 85 Z"
              fill="#FF6600"
              stroke="#CC4400"
              strokeWidth={strokeWidth}
            />
            <Rect x="15" y="85" width="70" height="10" rx="2" fill="#333333" />
          </Svg>
        </View>
      );
  }
}

function CollectibleShape({ type, size }: { type: Collectible["type"]; size: number }) {
  if (type === "heart") {
    return (
      <Svg width={size} height={size} viewBox="0 0 100 100">
        <Defs>
          <SvgLinearGradient id="heartGlow" x1="0%" y1="0%" x2="100%" y2="100%">
            <Stop offset="0%" stopColor="#FF6B9D" />
            <Stop offset="100%" stopColor="#FF1744" />
          </SvgLinearGradient>
        </Defs>
        <Path
          d="M50 88 C50 88 10 55 10 35 C10 15 30 10 50 30 C70 10 90 15 90 35 C90 55 50 88 50 88 Z"
          fill="url(#heartGlow)"
          stroke="#FFFFFF"
          strokeWidth="3"
        />
      </Svg>
    );
  }
  
  return (
    <Svg width={size} height={size} viewBox="0 0 100 100">
      <Defs>
        <SvgLinearGradient id="starGlow" x1="0%" y1="0%" x2="100%" y2="100%">
          <Stop offset="0%" stopColor="#FFD700" />
          <Stop offset="100%" stopColor="#FFA500" />
        </SvgLinearGradient>
      </Defs>
      <Path
        d="M50 5 L61 35 L95 35 L68 55 L79 90 L50 70 L21 90 L32 55 L5 35 L39 35 Z"
        fill="url(#starGlow)"
        stroke="#FFFFFF"
        strokeWidth="2"
      />
    </Svg>
  );
}

const suitStyles = StyleSheet.create({
  container: {
    justifyContent: "center",
    alignItems: "center",
  },
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: GameColors.background,
  },
  sparklesContainer: {
    position: "absolute",
    width: "100%",
    height: "100%",
    zIndex: 0,
  },
  sparkle: {
    position: "absolute",
    borderRadius: 10,
  },
  scoreContainer: {
    position: "absolute",
    left: Spacing.sm,
    right: Spacing.sm,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    zIndex: 10,
  },
  hudBadge: {
    flex: 1,
    marginHorizontal: 2,
    borderRadius: BorderRadius.sm,
    overflow: "hidden",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 4,
  },
  hudGradient: {
    paddingVertical: 2,
    paddingHorizontal: 3,
    borderRadius: BorderRadius.sm,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 28,
  },
  hudLabel: {
    fontSize: 11,
    fontWeight: "700",
    color: "rgba(255,255,255,0.95)",
    textAlign: "center",
    marginBottom: 1,
  },
  hudValue: {
    fontSize: 18,
    fontWeight: "800",
    color: "#FFFFFF",
    textAlign: "center",
  },
  gameWorld: {
    flex: 1,
    position: "relative",
  },
  track: {
    position: "absolute",
    left: 0,
    right: 0,
    height: TRACK_HEIGHT,
  },
  trackLineTop: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 8,
    borderRadius: 4,
    shadowColor: GameColors.platform,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 10,
    elevation: 5,
  },
  trackLineBottom: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 8,
    borderRadius: 4,
    shadowColor: GameColors.platform,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 10,
    elevation: 5,
  },
  roadTrack: {
    position: "absolute",
    left: 0,
    right: 0,
    height: TRACK_HEIGHT,
    overflow: "hidden",
  },
  waterStream: {
    position: "absolute",
    left: 0,
    right: 0,
    overflow: "hidden",
  },
  waterGradient: {
    flex: 1,
    opacity: 0.7,
  },
  seaCreature: {
    position: "absolute",
    width: 35,
    height: 35,
  },
  grassEdge: {
    position: "absolute",
    left: 0,
    right: 0,
    height: 8,
    backgroundColor: GameColors.grassGreen,
  },
  grassTop: {
    top: 0,
  },
  grassBottom: {
    bottom: 0,
  },
  asphaltSurface: {
    position: "absolute",
    top: 8,
    left: 0,
    right: 0,
    bottom: 8,
    backgroundColor: GameColors.roadAsphalt,
  },
  roadEdgeLine: {
    position: "absolute",
    left: 0,
    right: 0,
    height: 3,
    backgroundColor: GameColors.roadEdge,
  },
  roadEdgeTop: {
    top: 2,
  },
  roadEdgeBottom: {
    bottom: 2,
  },
  roadCenterContainer: {
    position: "absolute",
    top: "50%",
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "space-evenly",
    marginTop: -2,
  },
  roadCenterDash: {
    width: 20,
    height: 4,
    backgroundColor: "transparent",
    borderRadius: 2,
  },
  spikesContainer: {
    position: "absolute",
    bottom: 5,
    left: 0,
    right: 0,
    flexDirection: "row",
  },
  trackSpike: {
    width: 0,
    height: 0,
    borderLeftWidth: 7,
    borderRightWidth: 7,
    borderBottomWidth: 12,
    borderLeftColor: "transparent",
    borderRightColor: "transparent",
    marginHorizontal: 1,
  },
  playerContainer: {
    position: "absolute",
    width: PLAYER_SIZE,
    height: PLAYER_SIZE,
  },
  playerGlow: {
    position: "absolute",
    top: -2,
    left: -2,
    right: -2,
    bottom: -2,
    backgroundColor: "#000000",
    borderRadius: 7,
  },
  player: {
    width: PLAYER_SIZE,
    height: PLAYER_SIZE,
    borderRadius: 6,
  },
  obstacle: {
    position: "absolute",
  },
  collectible: {
    position: "absolute",
    shadowColor: "#FFD700",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 8,
  },
  floatingParticle: {
    position: "absolute",
    shadowColor: "#FFFFFF",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 4,
  },
  spikeObstacle: {
    width: 0,
    height: 0,
    borderLeftColor: "transparent",
    borderRightColor: "transparent",
  },
  blockObstacle: {
    borderRadius: 6,
  },
  bottomDecorations: {
    position: "absolute",
    left: 0,
    right: 0,
    alignItems: "center",
    zIndex: 5,
  },
  decorationRow: {
    flexDirection: "row",
    gap: Spacing.md,
    marginBottom: Spacing.sm,
  },
  decorationItem: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  wordPatternRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  wordPattern: {
    fontSize: 18,
    fontWeight: "800",
    color: "rgba(255,255,255,0.15)",
    letterSpacing: 2,
  },
  wordDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: "rgba(255,255,255,0.1)",
    marginHorizontal: Spacing.xs,
  },
  wordSpacer: {
    width: Spacing.lg,
  },
  powerButtonsContainer: {
    position: "absolute",
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: Spacing.lg,
    zIndex: 20,
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.xl,
  },
  explosionParticle: {
    position: "absolute",
    borderRadius: 50,
    zIndex: 15,
  },
  comboContainer: {
    position: "absolute",
    top: height * 0.22,
    left: 0,
    right: 0,
    alignItems: "center",
    zIndex: 25,
  },
  comboBadge: {
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.xl,
    shadowColor: "#FFD700",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 20,
  },
  comboText: {
    fontSize: 24,
    fontWeight: "900",
    color: "#1A1A1A",
  },
  collectExplosion: {
    position: "absolute",
    width: 50,
    height: 50,
    zIndex: 25,
  },
  powerActiveGlow: {
    position: "absolute",
    width: PLAYER_SIZE + 20,
    height: PLAYER_SIZE + 20,
    borderRadius: (PLAYER_SIZE + 20) / 2,
    left: -10,
    top: -10,
  },
  eyesContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    position: "absolute",
    top: 6,
    left: 0,
    right: 0,
  },
  eye: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#FFFFFF",
    marginHorizontal: 3,
    justifyContent: "center",
    alignItems: "center",
  },
  eyePupil: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: "#000000",
    position: "absolute",
  },
  eyeSparkle: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: "#FFFFFF",
    position: "absolute",
    top: 1,
    right: 1,
  },
  wheelsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    position: "absolute",
    bottom: -6,
    left: 2,
    right: 2,
  },
  wheel: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: "#333333",
    borderWidth: 2,
    borderColor: "#666666",
    justifyContent: "center",
    alignItems: "center",
  },
  wheelSpoke: {
    position: "absolute",
    width: 8,
    height: 2,
    backgroundColor: "#888888",
    borderRadius: 1,
  },
  heroContainer: {
    position: "absolute",
    zIndex: 100,
  },
  collectParticle: {
    position: "absolute",
    width: 8,
    height: 8,
    borderRadius: 4,
    left: 21,
    top: 21,
  },
  encourageContainer: {
    position: "absolute",
    top: height * 0.35,
    left: 0,
    right: 0,
    alignItems: "center",
    zIndex: 30,
  },
  encourageBadge: {
    paddingHorizontal: Spacing["2xl"],
    paddingVertical: Spacing.lg,
    borderRadius: BorderRadius.xl,
    shadowColor: "#FFD700",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 25,
  },
  encourageText: {
    fontSize: 32,
    fontWeight: "900",
    color: "#1A1A1A",
    letterSpacing: 2,
  },
  flipParticle: {
    position: "absolute",
    borderRadius: 50,
    zIndex: 20,
  },
  motionBlurOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(255,255,255,0.1)",
    zIndex: 5,
  },
  deathFlashOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "#FF0000",
    zIndex: 30,
  },
  backgroundStar: {
    position: "absolute",
    backgroundColor: "#FFFFFF",
    borderRadius: 50,
    zIndex: 1,
  },
  trailParticle: {
    position: "absolute",
    borderRadius: 50,
    zIndex: 8,
  },
});
