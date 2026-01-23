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
import Svg, { Path } from "react-native-svg";

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
  playTapSound,
  playFlipSound,
  playGameOverSound,
  playNearMissSound,
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
const TRACK_HEIGHT = 80;
const GAME_SPEED_BASE = 3;
const SPAWN_INTERVAL = 1200; // More frequent obstacles
const DIFFICULTY_INCREASE_INTERVAL = 5;
const LEVEL_INCREASE_INTERVAL = 10;
const MIN_OBSTACLE_GAP = 150;

interface Obstacle {
  id: number;
  x: number;
  track: "top" | "bottom";
  type: "spade" | "diamond" | "heart" | "club";
  width: number;
  height: number;
  color: string;
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

export default function GameScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { backgroundGradient } = useNightMode();
  
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [score, setScore] = useState(0);
  const [level, setLevel] = useState(1);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isGameOver, setIsGameOver] = useState(false);
  const [obstacles, setObstacles] = useState<Obstacle[]>([]);
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
  
  const BACKGROUND_GRADIENTS: [string, string][] = [
    ["#1A0A2E", "#2D1B4E"],
    ["#0D1B2A", "#1B263B"],
    ["#2C1654", "#3D2066"],
    ["#1A1A2E", "#16213E"],
    ["#0F0F23", "#1A1A3E"],
    ["#2E1A4A", "#3D1B5E"],
  ];

  const trackTopY = height / 2 - TRACK_HEIGHT - 30;
  const trackBottomY = height / 2 + 30;

  useEffect(() => {
    loadGameState();
    startSparkleAnimation();
    
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
    
    const now = Date.now();
    
    setActivePowerTypes(prev => [...prev, powerType]);
    
    switch (powerType) {
      case "freeze":
        freezeActiveRef.current = true;
        setActivePowers(prev => [...prev, { type: "freeze", expiresAt: now + 3000 }]);
        setTimeout(() => {
          freezeActiveRef.current = false;
          setActivePowers(prev => prev.filter(p => p.type !== "freeze"));
          setActivePowerTypes(prev => prev.filter(p => p !== "freeze"));
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
        }, 5000);
        break;
        
      case "shield":
        hasShieldRef.current = true;
        setActivePowers(prev => [...prev, { type: "shield", expiresAt: now + 60000 }]);
        break;
        
      case "double":
        doublePointsRef.current = true;
        setActivePowers(prev => [...prev, { type: "double", expiresAt: now + 30000 }]);
        setTimeout(() => {
          doublePointsRef.current = false;
          setActivePowers(prev => prev.filter(p => p.type !== "double"));
          setActivePowerTypes(prev => prev.filter(p => p !== "double"));
        }, 30000);
        break;
    }
  }, [availablePowers, isPlaying, gameState?.hapticsEnabled]);

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
    if (gameLoopRef.current) {
      clearInterval(gameLoopRef.current);
      gameLoopRef.current = null;
    }
    if (obstacleSpawnRef.current) {
      clearInterval(obstacleSpawnRef.current);
      obstacleSpawnRef.current = null;
    }
    if (scoreIntervalRef.current) {
      clearInterval(scoreIntervalRef.current);
      scoreIntervalRef.current = null;
    }
  }, []);

  const handleGameOver = useCallback(async () => {
    if (isGameOverRef.current || isDyingRef.current) return;
    
    isDyingRef.current = true;
    
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
    
    setShowNearMissFrame(true);
    setDeathFlashOpacity(0.6);
    
    setTimeout(() => {
      setDeathFlashOpacity(0);
    }, 80);
    
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

        const pointsEarned = Math.floor(currentScore / 2);
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
    const GRACE_PERIOD = 1500;
    
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
    
    gameLoopRef.current = setInterval(() => {
      if (isGameOverRef.current) return;

      // Update floating particles
      setFloatingParticles((prev) =>
        prev.map((particle) => ({
          ...particle,
          x: particle.x - particle.speed > -20 ? particle.x - particle.speed : width + 20,
        }))
      );

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
          // Victory sound when avoiding obstacles
          if (gameState?.hapticsEnabled) {
            triggerVictoryHaptic(true);
          }
        }

        return remainingObstacles;
      });
    }, 16);

    setTimeout(() => {
      if (isGameOverRef.current) return;
      
      const cardSuits: Array<{ type: Obstacle["type"]; color: string }> = [
        { type: "spade", color: "#1A1A2E" },
        { type: "diamond", color: "#E63946" },
        { type: "heart", color: "#E63946" },
        { type: "club", color: "#1A1A2E" },
      ];
      
      obstacleSpawnRef.current = setInterval(() => {
        if (isGameOverRef.current) return;
        
        const track: "top" | "bottom" = Math.random() > 0.5 ? "top" : "bottom";
        const suitConfig = cardSuits[Math.floor(Math.random() * cardSuits.length)];
        
        setScore(currentScore => {
          const obstacleHeight = currentScore >= 20 ? 44 : 36;
          const obstacleWidth = currentScore >= 20 ? 44 : 36;
          
          const minGap = currentScore >= 40 ? 100 : MIN_OBSTACLE_GAP;
          
          const newObstacle: Obstacle = {
            id: obstacleIdRef.current++,
            x: width + 50,
            track,
            type: suitConfig.type,
            color: suitConfig.color,
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
        scoreScale.value = withSpring(1.08, { damping: 12 }, () => {
          scoreScale.value = withSpring(1, { damping: 15 });
        });
        return newScore;
      });
    }, 600);
  }, [playerX, handleGameOver, scoreScale]);

  const handleFlip = useCallback(() => {
    if (isGameOverRef.current || isDyingRef.current) return;

    if (!isPlaying) {
      return;
    }

    const newTrack = currentTrackRef.current === "bottom" ? "top" : "bottom";
    currentTrackRef.current = newTrack;
    flipCountRef.current += 1;

    // Different sounds for up vs down flip
    if (gameState?.soundEnabled || gameState?.hapticsEnabled) {
      if (newTrack === "top") {
        triggerFlipUpHaptic(gameState?.hapticsEnabled ?? false);
      } else {
        triggerFlipDownHaptic(gameState?.hapticsEnabled ?? false);
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
    transform: [{ translateY: playerBounce.value }],
  }));

  const playerGlowStyle = useAnimatedStyle(() => ({
    opacity: playerGlow.value,
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

      <View style={[styles.scoreContainer, { top: insets.top + Spacing.lg }]}>
        <View style={styles.levelBadge}>
          <LinearGradient
            colors={[GameColors.primary, GameColors.primaryGlow]}
            style={styles.levelGradient}
          >
            <ThemedText style={styles.levelText}>LVL {level}</ThemedText>
          </LinearGradient>
        </View>
        
        <Animated.View style={[styles.scoreBadge, scoreAnimatedStyle]}>
          <LinearGradient
            colors={[GameColors.gold, GameColors.goldGlow]}
            style={styles.scoreGradient}
          >
            <ThemedText style={styles.scoreText}>{score}</ThemedText>
          </LinearGradient>
        </Animated.View>
        
        <View style={styles.bestScoreBadge}>
          <ThemedText style={styles.bestScoreLabel}>BEST</ThemedText>
          <ThemedText style={styles.bestScoreText}>{gameState?.bestScore || 0}</ThemedText>
        </View>
        
        <View style={styles.pointsBadge}>
          <LinearGradient
            colors={[GameColors.success, GameColors.successGlow]}
            style={styles.pointsGradient}
          >
            <ThemedText style={styles.pointsText}>{gameState?.points || 0}</ThemedText>
          </LinearGradient>
        </View>
      </View>

      <Animated.View style={[styles.gameWorld, worldAnimatedStyle]}>
        <View style={[styles.track, { top: trackTopY }]}>
          <LinearGradient
            colors={[GameColors.spike, GameColors.spikeGlow]}
            style={styles.trackLineTop}
          />
          <View style={styles.spikesContainer}>
            {Array.from({ length: 25 }).map((_, i) => (
              <View key={i} style={[styles.trackSpike, { borderBottomColor: GameColors.spike }]} />
            ))}
          </View>
        </View>

        <View style={[styles.track, { top: trackBottomY }]}>
          <LinearGradient
            colors={[GameColors.platform, GameColors.platformGlow]}
            style={styles.trackLineBottom}
          />
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
                    ? trackTopY + TRACK_HEIGHT - obs.height - 4
                    : trackBottomY + 4,
              },
            ]}
          >
            <ObstacleShape obstacle={obs} />
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
          <LinearGradient
            colors={getPlayerColors()}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.player}
          />
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
          size={20} 
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
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  glow: {
    position: "absolute",
    top: -6,
    left: -6,
    right: -6,
    bottom: -6,
    borderRadius: 34,
  },
  gradient: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "rgba(255,255,255,0.3)",
  },
  activeBadge: {
    position: "absolute",
    top: -4,
    right: -4,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  activeBadgeText: {
    fontSize: 8,
    fontWeight: "800",
    color: "#FFFFFF",
  },
});

function ObstacleShape({ obstacle }: { obstacle: Obstacle }) {
  const { type, color, width: w, height: h } = obstacle;
  const size = Math.min(w, h) * 0.85;
  const strokeWidth = 2;

  switch (type) {
    case "spade":
      return (
        <View style={[suitStyles.container, { width: w, height: h }]}>
          <Svg width={size} height={size} viewBox="0 0 100 100">
            <Path
              d="M50 5 C50 5 10 35 10 55 C10 70 22 80 35 75 L35 78 C35 78 30 85 28 92 L72 92 C70 85 65 78 65 78 L65 75 C78 80 90 70 90 55 C90 35 50 5 50 5 Z"
              fill={color}
              stroke="#FFFFFF"
              strokeWidth={strokeWidth}
            />
          </Svg>
        </View>
      );
    case "diamond":
      return (
        <View style={[suitStyles.container, { width: w, height: h }]}>
          <Svg width={size} height={size} viewBox="0 0 100 100">
            <Path
              d="M50 5 L90 50 L50 95 L10 50 Z"
              fill={color}
              stroke="#FFFFFF"
              strokeWidth={strokeWidth}
            />
          </Svg>
        </View>
      );
    case "heart":
      return (
        <View style={[suitStyles.container, { width: w, height: h }]}>
          <Svg width={size} height={size} viewBox="0 0 100 100">
            <Path
              d="M50 88 C50 88 10 55 10 35 C10 15 30 10 50 30 C70 10 90 15 90 35 C90 55 50 88 50 88 Z"
              fill={color}
              stroke="#FFFFFF"
              strokeWidth={strokeWidth}
            />
          </Svg>
        </View>
      );
    case "club":
      return (
        <View style={[suitStyles.container, { width: w, height: h }]}>
          <Svg width={size} height={size} viewBox="0 0 100 100">
            <Path
              d="M50 10 C35 10 25 20 25 33 C25 43 32 50 42 52 C35 55 30 62 30 95 L70 95 C70 62 65 55 58 52 C68 50 75 43 75 33 C75 20 65 10 50 10 Z M25 55 C12 55 5 65 5 75 C5 88 18 92 30 88 C28 82 27 70 28 58 C25 56 23 55 25 55 Z M75 55 C77 55 75 56 72 58 C73 70 72 82 70 88 C82 92 95 88 95 75 C95 65 88 55 75 55 Z"
              fill={color}
              stroke="#FFFFFF"
              strokeWidth={strokeWidth}
            />
          </Svg>
        </View>
      );
    default:
      return (
        <View style={[suitStyles.container, { width: w, height: h }]}>
          <Svg width={size} height={size} viewBox="0 0 100 100">
            <Path
              d="M50 5 L90 50 L50 95 L10 50 Z"
              fill={color}
              stroke="#FFFFFF"
              strokeWidth={strokeWidth}
            />
          </Svg>
        </View>
      );
  }
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
    left: Spacing.lg,
    right: Spacing.lg,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    zIndex: 10,
  },
  levelBadge: {
    borderRadius: BorderRadius.md,
    overflow: "hidden",
    shadowColor: GameColors.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
  },
  levelGradient: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.md,
  },
  levelText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#FFFFFF",
    textAlign: "center",
  },
  scoreBadge: {
    borderRadius: BorderRadius.lg,
    overflow: "hidden",
    shadowColor: GameColors.gold,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 15,
  },
  scoreGradient: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.lg,
  },
  scoreText: {
    fontSize: 32,
    fontWeight: "900",
    color: GameColors.background,
  },
  bestScoreBadge: {
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.1)",
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.md,
  },
  bestScoreLabel: {
    fontSize: 8,
    color: GameColors.textMuted,
    fontWeight: "600",
  },
  bestScoreText: {
    fontSize: 14,
    color: GameColors.textPrimary,
    fontWeight: "700",
  },
  pointsBadge: {
    borderRadius: BorderRadius.md,
    overflow: "hidden",
    shadowColor: GameColors.success,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
  },
  pointsGradient: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.md,
  },
  pointsText: {
    fontSize: 14,
    fontWeight: "700",
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
  },
  explosionParticle: {
    position: "absolute",
    borderRadius: 50,
    zIndex: 15,
  },
  comboContainer: {
    position: "absolute",
    top: height * 0.35,
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
});
