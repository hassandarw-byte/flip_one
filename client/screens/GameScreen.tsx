import React, { useEffect, useState, useCallback, useRef } from "react";
import {
  View,
  StyleSheet,
  Pressable,
  Dimensions,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  Easing,
} from "react-native-reanimated";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useNavigation } from "@react-navigation/native";

import { ThemedText } from "@/components/ThemedText";
import { GameColors, Spacing } from "@/constants/theme";
import {
  getGameState,
  saveBestScore,
  savePoints,
  incrementTotalFlips,
  incrementTotalGames,
  updateMissionProgress,
  GameState,
} from "@/lib/storage";
import { triggerFlipHaptic, triggerGameOverHaptic } from "@/lib/sounds";
import { RootStackParamList } from "@/navigation/RootStackNavigator";

const { width, height } = Dimensions.get("window");

const PLAYER_SIZE = 30;
const TRACK_HEIGHT = 80;
const GAME_SPEED_BASE = 3;
const SPAWN_INTERVAL = 2000;
const DIFFICULTY_INCREASE_INTERVAL = 5;
const MIN_OBSTACLE_GAP = 150;

interface Obstacle {
  id: number;
  x: number;
  track: "top" | "bottom";
  type: "spike" | "block";
  width: number;
  height: number;
}

export default function GameScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [score, setScore] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isGameOver, setIsGameOver] = useState(false);
  const [obstacles, setObstacles] = useState<Obstacle[]>([]);
  
  const currentTrackRef = useRef<"top" | "bottom">("bottom");
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
  const scoreScale = useSharedValue(1);

  const trackTopY = height / 2 - TRACK_HEIGHT - 30;
  const trackBottomY = height / 2 + 30;

  useEffect(() => {
    loadGameState();
    return () => {
      cleanupGame();
    };
  }, []);

  const loadGameState = async () => {
    const state = await getGameState();
    setGameState(state);
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
    if (isGameOverRef.current) return;
    
    isGameOverRef.current = true;
    setIsGameOver(true);
    setIsPlaying(false);
    cleanupGame();

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
  }, [gameState, score, navigation, cleanupGame]);

  const startGame = useCallback(() => {
    gameLoopRef.current = setInterval(() => {
      if (isGameOverRef.current) return;

      setObstacles((prev) => {
        const updated = prev
          .map((obs) => ({ ...obs, x: obs.x - gameSpeedRef.current }))
          .filter((obs) => obs.x > -50);

        for (const obs of updated) {
          const playerLeft = playerX - PLAYER_SIZE / 2;
          const playerRight = playerX + PLAYER_SIZE / 2;
          const obstacleLeft = obs.x - obs.width / 2;
          const obstacleRight = obs.x + obs.width / 2;

          const horizontalCollision =
            playerRight > obstacleLeft + 5 && playerLeft < obstacleRight - 5;

          if (horizontalCollision && obs.track === currentTrackRef.current) {
            handleGameOver();
            return [];
          }
        }

        return updated;
      });
    }, 16);

    obstacleSpawnRef.current = setInterval(() => {
      if (isGameOverRef.current) return;
      
      const track: "top" | "bottom" = Math.random() > 0.5 ? "top" : "bottom";
      const type = Math.random() > 0.6 ? "spike" : "block";
      
      const newObstacle: Obstacle = {
        id: obstacleIdRef.current++,
        x: width + 50,
        track,
        type,
        width: type === "spike" ? 25 : 35,
        height: type === "spike" ? 25 : 20,
      };

      setObstacles((prev) => {
        const rightmostX = prev.reduce((max, obs) => Math.max(max, obs.x), 0);
        if (rightmostX > width - MIN_OBSTACLE_GAP) return prev;
        return [...prev, newObstacle];
      });
    }, SPAWN_INTERVAL);

    scoreIntervalRef.current = setInterval(() => {
      if (isGameOverRef.current) return;
      
      setScore((prev) => {
        const newScore = prev + 1;
        if (newScore % DIFFICULTY_INCREASE_INTERVAL === 0) {
          gameSpeedRef.current = Math.min(gameSpeedRef.current + 0.3, 10);
        }
        scoreScale.value = withSpring(1.2, { damping: 10 }, () => {
          scoreScale.value = withSpring(1, { damping: 15 });
        });
        return newScore;
      });
    }, 600);
  }, [playerX, handleGameOver, scoreScale]);

  const handleFlip = useCallback(() => {
    if (isGameOverRef.current) return;

    if (!isPlaying) {
      setIsPlaying(true);
      setIsGameOver(false);
      isGameOverRef.current = false;
      setScore(0);
      setObstacles([]);
      currentTrackRef.current = "bottom";
      gameSpeedRef.current = GAME_SPEED_BASE;
      flipCountRef.current = 0;
      worldRotation.value = 0;
      
      setTimeout(() => {
        startGame();
      }, 100);
      return;
    }

    const newTrack = currentTrackRef.current === "bottom" ? "top" : "bottom";
    currentTrackRef.current = newTrack;
    flipCountRef.current += 1;

    if (gameState?.hapticsEnabled) {
      triggerFlipHaptic(true);
    }

    worldRotation.value = withTiming(
      newTrack === "top" ? 180 : 0,
      { duration: 150, easing: Easing.out(Easing.cubic) }
    );

    playerBounce.value = withSpring(-8, { damping: 8 }, () => {
      playerBounce.value = withSpring(0, { damping: 12 });
    });
  }, [isPlaying, gameState, worldRotation, playerBounce, startGame]);

  const worldAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${worldRotation.value}deg` }],
  }));

  const playerAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: playerBounce.value }],
  }));

  const scoreAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scoreScale.value }],
  }));

  const currentTrack = currentTrackRef.current;

  return (
    <Pressable style={styles.container} onPress={handleFlip} testID="game-area">
      <View style={styles.starsContainer}>
        {Array.from({ length: 50 }).map((_, i) => (
          <View
            key={i}
            style={[
              styles.star,
              {
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                opacity: Math.random() * 0.4 + 0.1,
                width: Math.random() * 2 + 1,
                height: Math.random() * 2 + 1,
              },
            ]}
          />
        ))}
      </View>

      <View style={[styles.scoreContainer, { top: insets.top + Spacing.lg }]}>
        <Animated.View style={scoreAnimatedStyle}>
          <ThemedText style={styles.scoreText}>{score}</ThemedText>
        </Animated.View>
        <ThemedText style={styles.bestScoreText}>
          BEST: {gameState?.bestScore || 0}
        </ThemedText>
      </View>

      <Animated.View style={[styles.gameWorld, worldAnimatedStyle]}>
        <View style={[styles.track, { top: trackTopY }]}>
          <View style={[styles.trackLine, { backgroundColor: GameColors.spike }]} />
          <View style={styles.spikesContainer}>
            {Array.from({ length: 25 }).map((_, i) => (
              <View key={i} style={[styles.trackSpike, { borderBottomColor: GameColors.spike }]} />
            ))}
          </View>
        </View>

        <View style={[styles.track, { top: trackBottomY }]}>
          <View style={[styles.trackLineBottom, { backgroundColor: GameColors.platform }]} />
        </View>

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
                width: obs.type === "spike" ? 0 : obs.width,
                height: obs.type === "spike" ? 0 : obs.height,
                backgroundColor: obs.type === "block" ? GameColors.platform : "transparent",
                borderRadius: obs.type === "block" ? 4 : 0,
                borderLeftWidth: obs.type === "spike" ? obs.width / 2 : 0,
                borderRightWidth: obs.type === "spike" ? obs.width / 2 : 0,
                borderBottomWidth: obs.type === "spike" ? obs.height : 0,
                borderLeftColor: "transparent",
                borderRightColor: "transparent",
                borderBottomColor: obs.type === "spike" ? GameColors.spike : "transparent",
                transform: obs.type === "spike" && obs.track === "top" ? [{ rotate: "180deg" }] : [],
              },
            ]}
          />
        ))}

        <Animated.View
          style={[
            styles.player,
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
          <View style={styles.playerGlow} />
        </Animated.View>
      </Animated.View>

      {!isPlaying ? (
        <View style={styles.tapToStartContainer}>
          <ThemedText style={styles.tapToStartText}>TAP TO START</ThemedText>
          <ThemedText style={styles.instructionText}>
            Tap to flip gravity and avoid obstacles
          </ThemedText>
        </View>
      ) : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: GameColors.background,
  },
  starsContainer: {
    position: "absolute",
    width: "100%",
    height: "100%",
    zIndex: 0,
  },
  star: {
    position: "absolute",
    backgroundColor: "#FFFFFF",
    borderRadius: 10,
  },
  scoreContainer: {
    position: "absolute",
    right: Spacing.xl,
    alignItems: "flex-end",
    zIndex: 10,
  },
  scoreText: {
    fontSize: 48,
    fontWeight: "800",
    color: GameColors.textPrimary,
    textShadowColor: GameColors.primary,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 15,
  },
  bestScoreText: {
    fontSize: 14,
    color: GameColors.textMuted,
    letterSpacing: 2,
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
  trackLine: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 4,
  },
  trackLineBottom: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 4,
  },
  spikesContainer: {
    position: "absolute",
    bottom: 4,
    left: 0,
    right: 0,
    flexDirection: "row",
  },
  trackSpike: {
    width: 0,
    height: 0,
    borderLeftWidth: 6,
    borderRightWidth: 6,
    borderBottomWidth: 10,
    borderLeftColor: "transparent",
    borderRightColor: "transparent",
    marginHorizontal: 2,
  },
  player: {
    position: "absolute",
    width: PLAYER_SIZE,
    height: PLAYER_SIZE,
    backgroundColor: GameColors.player,
    borderRadius: 4,
  },
  playerGlow: {
    position: "absolute",
    top: -6,
    left: -6,
    right: -6,
    bottom: -6,
    backgroundColor: GameColors.player,
    borderRadius: 8,
    opacity: 0.3,
  },
  obstacle: {
    position: "absolute",
  },
  tapToStartContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(11, 15, 26, 0.7)",
  },
  tapToStartText: {
    fontSize: 32,
    fontWeight: "800",
    color: GameColors.primary,
    letterSpacing: 4,
    textShadowColor: GameColors.primary,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 20,
  },
  instructionText: {
    fontSize: 16,
    color: GameColors.textSecondary,
    marginTop: Spacing.lg,
    textAlign: "center",
    paddingHorizontal: Spacing.xl,
  },
});
