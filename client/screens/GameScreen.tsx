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
  triggerMovementHaptic,
  playFlipSound,
  playGameOverSound,
  playScoreSound,
  playPowerUpSound,
  playCollectSound,
  playCarEngineSound,
  playThunderSound,
  playCarStartupSound,
  startGasPedalSound,
  stopGasPedalSound,
  initializeSounds,
  startHeartbeat,
  stopHeartbeat,
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
  type: "lightning" | "danger" | "skull";
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
  const [showSuperman, setShowSuperman] = useState(false);
  const [supermanX, setSupermanX] = useState(-100);
  
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
  const lastMovementHapticRef = useRef(0);
  const trailIntervalRef = useRef<NodeJS.Timeout | null>(null);
  
  const playerRotation = useSharedValue(0);
  const encourageScale = useSharedValue(0);
  const encourageOpacity = useSharedValue(0);
  const powerGlowPulse = useSharedValue(1);
  const wheelRotation = useSharedValue(0);
  const eyeSparkle = useSharedValue(1);
  
  const obstacleScale = useSharedValue(1);
  
  const DAY_GRADIENTS: [string, string][] = [
    ["#1A0A2E", "#2D1B4E"],
    ["#0D1B2A", "#1B263B"],
    ["#2C1654", "#3D2066"],
    ["#1A1A2E", "#16213E"],
    ["#0F0F23", "#1A1A3E"],
    ["#2E1A4A", "#3D1B5E"],
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
    stopHeartbeat();
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
    setShowSuperman(false);
    setSupermanX(-100);
  }, []);

  const handleGameOver = useCallback(async () => {
    if (isGameOverRef.current || isDyingRef.current) return;
    
    isDyingRef.current = true;
    
    // Stop heartbeat and gas pedal sounds
    stopHeartbeat();
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
        await updateMissionProgress("play_5", (gameState.totalGames || 0) + 1);
        await updateMissionProgress("flip_50", (gameState.totalFlips || 0) + flipCountRef.current);
        
        if (currentScore >= 20) {
          await updateMissionProgress("score_20", currentScore);
        }

        if (currentScore > gameState.bestScore) {
          await saveBestScore(currentScore);
        }

        const pointsEarned = Math.floor(currentScore / 2) + bonusPointsRef.current;
        await savePoints(gameState.points + pointsEarned);
      }

      navigation.replace("GameOver", {
        score: currentScore,
        bestScore: gameState?.bestScore || 0,
        isNewBest: currentScore > (gameState?.bestScore || 0),
      });
    }, 200);
  }, [gameState, score, navigation, cleanupGame]);

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
    const initialParticles: FloatingParticle[] = Array.from({ length: 20 }).map((_, i) => ({
      id: i,
      x: Math.random() * width,
      y: trackTopY + TRACK_HEIGHT + Math.random() * (trackBottomY - trackTopY - TRACK_HEIGHT - 40) + 20,
      size: Math.random() * 16 + 8,
      speed: Math.random() * 2 + 0.5,
      color: distractionColors[Math.floor(Math.random() * distractionColors.length)],
      opacity: Math.random() * 0.5 + 0.3,
    }));
    setFloatingParticles(initialParticles);
    
    // Start heartbeat sound for tension
    if (gameState?.soundEnabled) {
      startHeartbeat(true);
    }
    
    gameLoopRef.current = setInterval(() => {
      if (isGameOverRef.current) return;

      // Movement haptic - deep sound every 400ms while playing
      const now = Date.now();
      if (gameState?.hapticsEnabled && now - lastMovementHapticRef.current > 400) {
        lastMovementHapticRef.current = now;
        triggerMovementHaptic(true);
      }

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
      
      // Update superman position (flies across screen slowly)
      setSupermanX(prev => {
        if (prev > width + 100) {
          setShowSuperman(false);
          return -100;
        }
        return prev + 3;
      });

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
          passedObstacles.forEach(obs => {
            const obsY = obs.track === "top" ? trackTopY + TRACK_HEIGHT / 2 : trackBottomY + TRACK_HEIGHT / 2;
            runOnJS(createExplosion)(obs.x, obsY);
            runOnJS(incrementCombo)();
          });
          // Victory sound and haptic when avoiding obstacles
          if (gameState?.soundEnabled) {
            playScoreSound(true);
          }
          if (gameState?.hapticsEnabled) {
            triggerVictoryHaptic(true);
          }
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
        { type: "lightning", color: "#FFD700" },
        { type: "danger", color: "#FF4444" },
        { type: "skull", color: "#8B0000" },
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
    
    // Track successful flips for superman trigger
    setSuccessfulFlips(prev => {
      const newCount = prev + 1;
      // Trigger superman after 15 successful flips
      if (newCount === 15 && !showSuperman) {
        setShowSuperman(true);
        setSupermanX(-100);
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
      { rotate: `${playerRotation.value}deg` },
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

      <View style={styles.sparklesContainer}>
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
      
      {/* Superman flying after 15 successful flips */}
      {showSuperman ? (
        <Animated.View 
          style={[
            styles.supermanContainer,
            {
              left: supermanX,
              top: height * 0.3,
            }
          ]}
        >
          <View style={styles.supermanBody}>
            <View style={styles.supermanCape} />
            <View style={styles.supermanBelt} />
            <View style={styles.supermanHead}>
              <View style={styles.supermanHair} />
              <View style={styles.supermanEyeLeft} />
              <View style={styles.supermanEyeRight} />
            </View>
            <View style={styles.supermanArm}>
              <View style={styles.supermanFist} />
            </View>
            <View style={styles.supermanLogo} />
          </View>
        </Animated.View>
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

        {obstacles.map((obs) => (
          <View
            key={obs.id}
            style={[
              styles.obstacle,
              {
                left: obs.x - obs.width / 2,
                top:
                  obs.track === "top"
                    ? trackTopY + TRACK_HEIGHT
                    : trackBottomY - obs.height,
              },
            ]}
          >
            <ObstacleShape obstacle={obs} track={obs.track} />
          </View>
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

    <View style={[styles.powerButtonsContainer, { bottom: insets.bottom + Spacing["2xl"] }]}>
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

function ObstacleShape({ obstacle, track }: { obstacle: Obstacle; track: "top" | "bottom" }) {
  const { type, color, width: w, height: h } = obstacle;
  const size = Math.min(w, h) * 0.9;
  const strokeWidth = 2;
  const rotation = track === "top" ? "180deg" : "0deg";

  switch (type) {
    case "lightning":
      return (
        <View style={[suitStyles.container, { width: w, height: h }]}>
          <Svg width={size} height={size} viewBox="0 0 100 100">
            <Defs>
              <SvgLinearGradient id="lightningGlow" x1="0%" y1="0%" x2="100%" y2="100%">
                <Stop offset="0%" stopColor="#FFD700" />
                <Stop offset="100%" stopColor="#FFA500" />
              </SvgLinearGradient>
            </Defs>
            <Path
              d="M55 5 L25 45 L45 45 L35 95 L75 50 L52 50 L65 5 Z"
              fill="url(#lightningGlow)"
              stroke="#FFFFFF"
              strokeWidth={strokeWidth}
            />
          </Svg>
        </View>
      );
    case "danger":
      return (
        <View style={[suitStyles.container, { width: w, height: h, transform: [{ rotate: rotation }] }]}>
          <Svg width={size} height={size} viewBox="0 0 100 100">
            <Path
              d="M50 8 L95 85 L5 85 Z"
              fill={color}
              stroke="#FFFFFF"
              strokeWidth={strokeWidth}
            />
            <SvgText
              x="50"
              y="72"
              fontSize="40"
              fontWeight="bold"
              fill="#FFFFFF"
              textAnchor="middle"
            >!</SvgText>
          </Svg>
        </View>
      );
    case "skull":
      return (
        <View style={[suitStyles.container, { width: w, height: h }]}>
          <Svg width={size} height={size} viewBox="0 0 100 100">
            <Defs>
              <SvgLinearGradient id="skullGlow" x1="0%" y1="0%" x2="100%" y2="100%">
                <Stop offset="0%" stopColor="#4A0000" />
                <Stop offset="100%" stopColor="#8B0000" />
              </SvgLinearGradient>
            </Defs>
            <Circle cx="50" cy="40" r="35" fill="url(#skullGlow)" stroke="#FFFFFF" strokeWidth={strokeWidth} />
            <Circle cx="35" cy="35" r="8" fill="#000000" />
            <Circle cx="65" cy="35" r="8" fill="#000000" />
            <Path d="M40 55 L45 65 L50 55 L55 65 L60 55" stroke="#000000" strokeWidth="3" fill="none" />
            <Rect x="35" y="70" width="30" height="20" fill="url(#skullGlow)" stroke="#FFFFFF" strokeWidth={strokeWidth} />
            <Line x1="42" y1="70" x2="42" y2="90" stroke="#000000" strokeWidth="2" />
            <Line x1="50" y1="70" x2="50" y2="90" stroke="#000000" strokeWidth="2" />
            <Line x1="58" y1="70" x2="58" y2="90" stroke="#000000" strokeWidth="2" />
          </Svg>
        </View>
      );
    default:
      return (
        <View style={[suitStyles.container, { width: w, height: h }]}>
          <Svg width={size} height={size} viewBox="0 0 100 100">
            <Path
              d="M55 5 L25 45 L45 45 L35 95 L75 50 L52 50 L65 5 Z"
              fill="#FFD700"
              stroke="#FFFFFF"
              strokeWidth={strokeWidth}
            />
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
    backgroundColor: GameColors.roadLine,
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
    top: -4,
    left: -4,
    right: -4,
    bottom: -4,
    backgroundColor: GameColors.player,
    borderRadius: 8,
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
    color: "#FFFFFF",
    textShadowColor: "rgba(0,0,0,0.5)",
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 4,
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
  supermanContainer: {
    position: "absolute",
    zIndex: 100,
  },
  supermanBody: {
    width: 36,
    height: 20,
    backgroundColor: "#0066CC",
    borderRadius: 10,
    position: "relative",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  supermanCape: {
    position: "absolute",
    left: -12,
    top: 2,
    width: 16,
    height: 18,
    backgroundColor: "#CC0000",
    borderTopLeftRadius: 8,
    borderBottomLeftRadius: 10,
    shadowColor: "#CC0000",
    shadowOffset: { width: -2, height: 2 },
    shadowOpacity: 0.5,
    shadowRadius: 4,
  },
  supermanBelt: {
    position: "absolute",
    bottom: 4,
    left: 4,
    right: 8,
    height: 3,
    backgroundColor: "#FFD700",
    borderRadius: 1,
  },
  supermanHead: {
    position: "absolute",
    right: -8,
    top: 0,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: "#FFCC99",
    borderWidth: 1,
    borderColor: "#E5B98A",
  },
  supermanHair: {
    position: "absolute",
    top: -2,
    left: 2,
    right: 2,
    height: 6,
    backgroundColor: "#1A1A1A",
    borderTopLeftRadius: 6,
    borderTopRightRadius: 6,
  },
  supermanEyeLeft: {
    position: "absolute",
    top: 4,
    left: 2,
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: "#0066CC",
  },
  supermanEyeRight: {
    position: "absolute",
    top: 4,
    right: 2,
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: "#0066CC",
  },
  supermanArm: {
    position: "absolute",
    right: -18,
    top: 5,
    width: 18,
    height: 7,
    backgroundColor: "#0066CC",
    borderRadius: 3,
  },
  supermanFist: {
    position: "absolute",
    right: -4,
    top: 0,
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: "#FFCC99",
    borderWidth: 1,
    borderColor: "#E5B98A",
  },
  supermanLogo: {
    position: "absolute",
    top: 3,
    left: 12,
    width: 8,
    height: 6,
    backgroundColor: "#FFD700",
    borderRadius: 2,
    borderWidth: 1,
    borderColor: "#CC0000",
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
    color: "#FFFFFF",
    textShadowColor: "rgba(0,0,0,0.5)",
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 4,
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
