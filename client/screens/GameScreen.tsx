import React, { useEffect, useState, useCallback, useRef } from "react";
import {
  View,
  StyleSheet,
  Pressable,
  Dimensions,
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
} from "react-native-reanimated";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useNavigation } from "@react-navigation/native";

import { ThemedText } from "@/components/ThemedText";
import { GameColors, Spacing, BorderRadius, SkinColors } from "@/constants/theme";
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
import { useNightMode } from "@/contexts/NightModeContext";

const { width, height } = Dimensions.get("window");

const PLAYER_SIZE = 32;
const TRACK_HEIGHT = 80;
const GAME_SPEED_BASE = 3;
const SPAWN_INTERVAL = 2000;
const DIFFICULTY_INCREASE_INTERVAL = 5;
const LEVEL_INCREASE_INTERVAL = 10;
const MIN_OBSTACLE_GAP = 150;

interface Obstacle {
  id: number;
  x: number;
  track: "top" | "bottom";
  type: "diamond" | "gem" | "crystal" | "star" | "heart";
  width: number;
  height: number;
  colors: [string, string];
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
  const playerGlow = useSharedValue(0.5);
  const scoreScale = useSharedValue(1);
  const sparkleOpacity = useSharedValue(0.4);

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
    const gameStartTime = Date.now();
    const GRACE_PERIOD = 1500;
    
    gameLoopRef.current = setInterval(() => {
      if (isGameOverRef.current) return;

      setObstacles((prev) => {
        const updated = prev
          .map((obs) => ({ ...obs, x: obs.x - gameSpeedRef.current }))
          .filter((obs) => obs.x > -50);

        if (Date.now() - gameStartTime < GRACE_PERIOD) {
          return updated;
        }

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

    setTimeout(() => {
      if (isGameOverRef.current) return;
      
      const obstacleTypes: Array<{ type: Obstacle["type"]; colors: [string, string] }> = [
        { type: "diamond", colors: [GameColors.candy1, GameColors.spikeGlow] },
        { type: "gem", colors: [GameColors.candy4, GameColors.primaryGlow] },
        { type: "crystal", colors: [GameColors.candy2, GameColors.platformGlow] },
        { type: "star", colors: [GameColors.candy5, GameColors.secondaryGlow] },
        { type: "heart", colors: [GameColors.candy1, "#FF9999"] },
      ];
      
      obstacleSpawnRef.current = setInterval(() => {
        if (isGameOverRef.current) return;
        
        const track: "top" | "bottom" = Math.random() > 0.5 ? "top" : "bottom";
        const obsConfig = obstacleTypes[Math.floor(Math.random() * obstacleTypes.length)];
        
        const newObstacle: Obstacle = {
          id: obstacleIdRef.current++,
          x: width + 50,
          track,
          type: obsConfig.type,
          colors: obsConfig.colors,
          width: 32,
          height: 32,
        };

        setObstacles((prev) => {
          const rightmostX = prev.reduce((max, obs) => Math.max(max, obs.x), 0);
          if (rightmostX > width - MIN_OBSTACLE_GAP) return prev;
          return [...prev, newObstacle];
        });
      }, SPAWN_INTERVAL);
    }, GRACE_PERIOD);

    scoreIntervalRef.current = setInterval(() => {
      if (isGameOverRef.current) return;
      
      setScore((prev) => {
        const newScore = prev + 1;
        if (newScore % LEVEL_INCREASE_INTERVAL === 0) {
          setLevel((prevLevel) => {
            const newLevel = prevLevel + 1;
            // Increase speed every 5 levels
            if (newLevel % 5 === 0) {
              gameSpeedRef.current = Math.min(gameSpeedRef.current + 0.5, 12);
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
    if (isGameOverRef.current) return;

    if (!isPlaying) {
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

    playerBounce.value = withSpring(-10, { damping: 8 }, () => {
      playerBounce.value = withSpring(0, { damping: 12 });
    });
  }, [isPlaying, gameState, worldRotation, playerBounce, startGame]);

  const worldAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${worldRotation.value}deg` }],
  }));

  const playerAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: playerBounce.value }],
  }));

  const playerGlowStyle = useAnimatedStyle(() => ({
    opacity: playerGlow.value,
  }));

  const scoreAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scoreScale.value }],
  }));

  const sparkleStyle = useAnimatedStyle(() => ({
    opacity: sparkleOpacity.value,
  }));

  const currentTrack = currentTrackRef.current;

  return (
    <Pressable style={styles.container} onPress={handleFlip} testID="game-area">
      <LinearGradient
        colors={backgroundGradient}
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

      <View style={[styles.bottomDecorations, { bottom: insets.bottom + Spacing.xl }]}>
        <View style={styles.decorationRow}>
          {Array.from({ length: 8 }).map((_, i) => (
            <Animated.View
              key={`deco-${i}`}
              style={[
                styles.decorationItem,
                sparkleStyle,
                {
                  backgroundColor: [
                    GameColors.candy1,
                    GameColors.candy2,
                    GameColors.candy3,
                    GameColors.candy4,
                    GameColors.candy5,
                    GameColors.primary,
                    GameColors.secondary,
                    GameColors.gold,
                  ][i % 8],
                },
              ]}
            />
          ))}
        </View>
        <View style={styles.wordPatternRow}>
          <ThemedText style={styles.wordPattern}>F</ThemedText>
          <View style={styles.wordDot} />
          <ThemedText style={styles.wordPattern}>L</ThemedText>
          <View style={styles.wordDot} />
          <ThemedText style={styles.wordPattern}>I</ThemedText>
          <View style={styles.wordDot} />
          <ThemedText style={styles.wordPattern}>P</ThemedText>
          <View style={styles.wordSpacer} />
          <ThemedText style={styles.wordPattern}>O</ThemedText>
          <View style={styles.wordDot} />
          <ThemedText style={styles.wordPattern}>N</ThemedText>
          <View style={styles.wordDot} />
          <ThemedText style={styles.wordPattern}>E</ThemedText>
        </View>
      </View>
    </Pressable>
  );
}

function ObstacleShape({ obstacle }: { obstacle: Obstacle }) {
  const { type, colors, width: w, height: h } = obstacle;

  switch (type) {
    case "diamond":
      return (
        <View style={[obstacleStyles.diamond, { width: w, height: h }]}>
          <LinearGradient
            colors={colors}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={[obstacleStyles.diamondInner, { width: w * 0.7, height: h * 0.7 }]}
          />
        </View>
      );
    case "gem":
      return (
        <LinearGradient
          colors={colors}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[obstacleStyles.gem, { width: w, height: h }]}
        >
          <View style={obstacleStyles.gemHighlight} />
        </LinearGradient>
      );
    case "crystal":
      return (
        <View style={obstacleStyles.crystalContainer}>
          <LinearGradient
            colors={colors}
            style={[obstacleStyles.crystal, { width: w * 0.4, height: h }]}
          />
          <LinearGradient
            colors={[colors[1], colors[0]]}
            style={[obstacleStyles.crystal, { width: w * 0.4, height: h * 0.7, marginLeft: -8 }]}
          />
        </View>
      );
    case "star":
      return (
        <LinearGradient
          colors={colors}
          style={[obstacleStyles.star, { width: w, height: h }]}
        >
          <View style={obstacleStyles.starCenter} />
        </LinearGradient>
      );
    case "heart":
      return (
        <View style={[obstacleStyles.heartContainer, { width: w, height: h }]}>
          <LinearGradient
            colors={colors}
            style={[obstacleStyles.heartLeft, { width: w * 0.55, height: h * 0.55 }]}
          />
          <LinearGradient
            colors={colors}
            style={[obstacleStyles.heartRight, { width: w * 0.55, height: h * 0.55 }]}
          />
          <LinearGradient
            colors={colors}
            style={[obstacleStyles.heartBottom, { width: w * 0.7, height: h * 0.7 }]}
          />
        </View>
      );
    default:
      return (
        <LinearGradient
          colors={colors}
          style={[obstacleStyles.gem, { width: w, height: h }]}
        />
      );
  }
}

const obstacleStyles = StyleSheet.create({
  diamond: {
    transform: [{ rotate: "45deg" }],
    justifyContent: "center",
    alignItems: "center",
  },
  diamondInner: {
    borderRadius: 4,
  },
  gem: {
    borderRadius: 8,
    justifyContent: "flex-start",
    alignItems: "flex-start",
    overflow: "hidden",
  },
  gemHighlight: {
    width: "40%",
    height: "40%",
    backgroundColor: "rgba(255,255,255,0.4)",
    borderRadius: 20,
    margin: 4,
  },
  crystalContainer: {
    flexDirection: "row",
    alignItems: "flex-end",
  },
  crystal: {
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
    borderBottomLeftRadius: 2,
    borderBottomRightRadius: 2,
  },
  star: {
    borderRadius: 6,
    transform: [{ rotate: "15deg" }],
    justifyContent: "center",
    alignItems: "center",
  },
  starCenter: {
    width: "50%",
    height: "50%",
    backgroundColor: "rgba(255,255,255,0.5)",
    borderRadius: 20,
  },
  heartContainer: {
    position: "relative",
    justifyContent: "center",
    alignItems: "center",
  },
  heartLeft: {
    position: "absolute",
    top: 0,
    left: 0,
    borderRadius: 50,
  },
  heartRight: {
    position: "absolute",
    top: 0,
    right: 0,
    borderRadius: 50,
  },
  heartBottom: {
    position: "absolute",
    bottom: 0,
    transform: [{ rotate: "45deg" }],
    borderRadius: 4,
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
    height: 5,
    borderRadius: 2,
  },
  trackLineBottom: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 5,
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
});
