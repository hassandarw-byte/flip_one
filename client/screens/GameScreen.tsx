import React, { useEffect, useState, useCallback, useRef } from "react";
import {
  View,
  StyleSheet,
  Pressable,
  Dimensions,
  Platform,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  runOnJS,
  Easing,
} from "react-native-reanimated";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useNavigation, useRoute } from "@react-navigation/native";

import { ThemedText } from "@/components/ThemedText";
import { GameColors, Spacing, BorderRadius } from "@/constants/theme";
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
const OBSTACLE_WIDTH = 30;
const GAME_SPEED_BASE = 4;
const SPAWN_INTERVAL = 1500;
const DIFFICULTY_INCREASE_INTERVAL = 5;

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
  const route = useRoute();
  
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [score, setScore] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isGameOver, setIsGameOver] = useState(false);
  const [currentTrack, setCurrentTrack] = useState<"top" | "bottom">("bottom");
  const [obstacles, setObstacles] = useState<Obstacle[]>([]);
  const [gameSpeed, setGameSpeed] = useState(GAME_SPEED_BASE);
  const [flipCount, setFlipCount] = useState(0);
  
  const gameLoopRef = useRef<NodeJS.Timeout | null>(null);
  const obstacleSpawnRef = useRef<NodeJS.Timeout | null>(null);
  const scoreIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const obstacleIdRef = useRef(0);
  const playerX = width * 0.2;

  const worldRotation = useSharedValue(0);
  const playerBounce = useSharedValue(0);
  const scoreScale = useSharedValue(1);

  useEffect(() => {
    loadGameState();
    return () => {
      cleanupGame();
    };
  }, []);

  useEffect(() => {
    if (!isPlaying || isGameOver) return;
    startGame();
    return () => cleanupGame();
  }, [isPlaying, isGameOver]);

  const loadGameState = async () => {
    const state = await getGameState();
    setGameState(state);
  };

  const startGame = () => {
    gameLoopRef.current = setInterval(updateGame, 16);
    obstacleSpawnRef.current = setInterval(spawnObstacle, SPAWN_INTERVAL);
    scoreIntervalRef.current = setInterval(() => {
      setScore((prev) => {
        const newScore = prev + 1;
        if (newScore % DIFFICULTY_INCREASE_INTERVAL === 0) {
          setGameSpeed((s) => Math.min(s + 0.5, 12));
        }
        scoreScale.value = withSpring(1.2, { damping: 10 }, () => {
          scoreScale.value = withSpring(1, { damping: 15 });
        });
        return newScore;
      });
    }, 500);
  };

  const cleanupGame = () => {
    if (gameLoopRef.current) clearInterval(gameLoopRef.current);
    if (obstacleSpawnRef.current) clearInterval(obstacleSpawnRef.current);
    if (scoreIntervalRef.current) clearInterval(scoreIntervalRef.current);
  };

  const spawnObstacle = () => {
    const track = Math.random() > 0.5 ? "top" : "bottom";
    const type = Math.random() > 0.5 ? "spike" : "block";
    
    const newObstacle: Obstacle = {
      id: obstacleIdRef.current++,
      x: width + OBSTACLE_WIDTH,
      track,
      type,
      width: type === "spike" ? 20 : 40,
      height: type === "spike" ? 30 : 25,
    };

    setObstacles((prev) => [...prev, newObstacle]);
  };

  const updateGame = () => {
    setObstacles((prev) => {
      const updated = prev
        .map((obs) => ({ ...obs, x: obs.x - gameSpeed }))
        .filter((obs) => obs.x > -OBSTACLE_WIDTH);

      for (const obs of updated) {
        if (checkCollision(obs)) {
          handleGameOver();
          return [];
        }
      }

      return updated;
    });
  };

  const checkCollision = (obstacle: Obstacle): boolean => {
    const playerLeft = playerX - PLAYER_SIZE / 2;
    const playerRight = playerX + PLAYER_SIZE / 2;
    const obstacleLeft = obstacle.x - obstacle.width / 2;
    const obstacleRight = obstacle.x + obstacle.width / 2;

    const horizontalCollision =
      playerRight > obstacleLeft && playerLeft < obstacleRight;

    if (!horizontalCollision) return false;

    return obstacle.track === currentTrack;
  };

  const handleGameOver = async () => {
    setIsGameOver(true);
    setIsPlaying(false);
    cleanupGame();

    if (gameState?.hapticsEnabled) {
      triggerGameOverHaptic(true);
    }

    await incrementTotalGames();
    await incrementTotalFlips(flipCount);
    
    if (gameState) {
      await updateMissionProgress("play_5", (gameState.totalGames || 0) + 1);
      await updateMissionProgress("flip_50", (gameState.totalFlips || 0) + flipCount);
      
      if (score >= 20) {
        await updateMissionProgress("score_20", score);
      }

      if (score > gameState.bestScore) {
        await saveBestScore(score);
      }

      const pointsEarned = Math.floor(score / 2);
      await savePoints(gameState.points + pointsEarned);
    }

    navigation.replace("GameOver", {
      score,
      bestScore: gameState?.bestScore || 0,
      isNewBest: score > (gameState?.bestScore || 0),
    });
  };

  const handleFlip = useCallback(() => {
    if (!isPlaying || isGameOver) {
      setIsPlaying(true);
      setIsGameOver(false);
      setScore(0);
      setObstacles([]);
      setGameSpeed(GAME_SPEED_BASE);
      setFlipCount(0);
      setCurrentTrack("bottom");
      worldRotation.value = 0;
      return;
    }

    const newTrack = currentTrack === "bottom" ? "top" : "bottom";
    setCurrentTrack(newTrack);
    setFlipCount((prev) => prev + 1);

    if (gameState?.hapticsEnabled) {
      triggerFlipHaptic(true);
    }

    worldRotation.value = withTiming(
      newTrack === "top" ? 180 : 0,
      { duration: 200, easing: Easing.out(Easing.cubic) }
    );

    playerBounce.value = withSpring(-10, { damping: 5 }, () => {
      playerBounce.value = withSpring(0, { damping: 10 });
    });
  }, [isPlaying, isGameOver, currentTrack, gameState]);

  const worldAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${worldRotation.value}deg` }],
  }));

  const playerAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: playerBounce.value }],
  }));

  const scoreAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scoreScale.value }],
  }));

  const trackTopY = height / 2 - TRACK_HEIGHT - 20;
  const trackBottomY = height / 2 + 20;

  return (
    <Pressable style={styles.container} onPress={handleFlip} testID="game-area">
      <View style={styles.starsContainer}>
        {Array.from({ length: 40 }).map((_, i) => (
          <View
            key={i}
            style={[
              styles.star,
              {
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                opacity: Math.random() * 0.5 + 0.1,
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
        <View style={[styles.track, styles.trackTop, { top: trackTopY }]}>
          <View style={[styles.trackLine, { backgroundColor: GameColors.trackTop }]} />
          <View style={styles.spikesContainer}>
            {Array.from({ length: 20 }).map((_, i) => (
              <View key={i} style={[styles.trackSpike, { borderBottomColor: GameColors.trackTop }]} />
            ))}
          </View>
        </View>

        <View style={[styles.track, styles.trackBottom, { top: trackBottomY }]}>
          <View style={[styles.trackLine, { backgroundColor: GameColors.trackBottom }]} />
        </View>

        {obstacles.map((obs) => (
          <View
            key={obs.id}
            style={[
              styles.obstacle,
              obs.type === "spike" ? styles.spikeObstacle : styles.blockObstacle,
              {
                left: obs.x - obs.width / 2,
                top:
                  obs.track === "top"
                    ? trackTopY + TRACK_HEIGHT - obs.height
                    : trackBottomY,
                width: obs.width,
                height: obs.height,
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
                  ? trackBottomY - PLAYER_SIZE
                  : trackTopY + TRACK_HEIGHT,
            },
          ]}
        />
      </Animated.View>

      {!isPlaying ? (
        <View style={styles.tapToStartContainer}>
          <ThemedText style={styles.tapToStartText}>TAP TO START</ThemedText>
          <ThemedText style={styles.instructionText}>
            Tap to flip gravity
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
    textShadowRadius: 10,
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
  trackTop: {},
  trackBottom: {},
  trackLine: {
    position: "absolute",
    bottom: 0,
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
    borderLeftWidth: 8,
    borderRightWidth: 8,
    borderBottomWidth: 12,
    borderLeftColor: "transparent",
    borderRightColor: "transparent",
    marginHorizontal: 4,
  },
  player: {
    position: "absolute",
    width: PLAYER_SIZE,
    height: PLAYER_SIZE,
    backgroundColor: GameColors.player,
    borderRadius: 4,
    shadowColor: GameColors.player,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 10,
  },
  obstacle: {
    position: "absolute",
  },
  spikeObstacle: {
    width: 0,
    height: 0,
    backgroundColor: "transparent",
    borderLeftWidth: 10,
    borderRightWidth: 10,
    borderBottomWidth: 30,
    borderLeftColor: "transparent",
    borderRightColor: "transparent",
    borderBottomColor: GameColors.obstacle,
  },
  blockObstacle: {
    backgroundColor: GameColors.obstacle,
    borderRadius: 4,
  },
  tapToStartContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
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
  },
});
