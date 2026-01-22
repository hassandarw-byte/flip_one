import React, { useEffect, useState } from "react";
import {
  View,
  StyleSheet,
  Image,
  Pressable,
  Dimensions,
  Share,
  Platform,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withDelay,
  withTiming,
  withRepeat,
  withSequence,
  Easing,
} from "react-native-reanimated";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useNavigation } from "@react-navigation/native";

import { ThemedText } from "@/components/ThemedText";
import { GameColors, Spacing, BorderRadius } from "@/constants/theme";
import { getGameState, GameState } from "@/lib/storage";
import { RootStackParamList } from "@/navigation/RootStackNavigator";
import { useNightMode } from "@/contexts/NightModeContext";

const { width, height } = Dimensions.get("window");

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);
const AnimatedLinearGradient = Animated.createAnimatedComponent(LinearGradient);

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { backgroundGradient } = useNightMode();
  const [gameState, setGameState] = useState<GameState | null>(null);

  const playButtonScale = useSharedValue(1);
  const playButtonGlow = useSharedValue(0.6);
  const logoOpacity = useSharedValue(0);
  const logoTranslateY = useSharedValue(-30);
  const logoRotate = useSharedValue(0);
  const buttonsOpacity = useSharedValue(0);
  const sparkleOpacity = useSharedValue(0.3);

  useEffect(() => {
    loadGameState();
    animateEntrance();
    startContinuousAnimations();
  }, []);

  const loadGameState = async () => {
    const state = await getGameState();
    setGameState(state);
  };

  const animateEntrance = () => {
    logoOpacity.value = withDelay(100, withTiming(1, { duration: 800 }));
    logoTranslateY.value = withDelay(100, withSpring(0, { damping: 12, stiffness: 100 }));
    buttonsOpacity.value = withDelay(500, withTiming(1, { duration: 600 }));
  };

  const startContinuousAnimations = () => {
    playButtonGlow.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 1500, easing: Easing.inOut(Easing.ease) }),
        withTiming(0.6, { duration: 1500, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      true
    );
    
    sparkleOpacity.value = withRepeat(
      withSequence(
        withTiming(0.8, { duration: 2000 }),
        withTiming(0.3, { duration: 2000 })
      ),
      -1,
      true
    );

    logoRotate.value = withRepeat(
      withSequence(
        withTiming(3, { duration: 2000, easing: Easing.inOut(Easing.ease) }),
        withTiming(-3, { duration: 2000, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      true
    );
  };

  const logoAnimatedStyle = useAnimatedStyle(() => ({
    opacity: logoOpacity.value,
    transform: [
      { translateY: logoTranslateY.value },
      { rotate: `${logoRotate.value}deg` },
    ],
  }));

  const buttonsAnimatedStyle = useAnimatedStyle(() => ({
    opacity: buttonsOpacity.value,
  }));

  const playButtonAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: playButtonScale.value }],
  }));

  const playButtonGlowStyle = useAnimatedStyle(() => ({
    opacity: playButtonGlow.value,
  }));

  const sparkleStyle = useAnimatedStyle(() => ({
    opacity: sparkleOpacity.value,
  }));

  const handlePlayPress = () => {
    navigation.navigate("Game");
  };

  const handlePressIn = () => {
    playButtonScale.value = withSpring(0.92, { damping: 15 });
  };

  const handlePressOut = () => {
    playButtonScale.value = withSpring(1, { damping: 10, stiffness: 200 });
  };

  const handleShare = async () => {
    try {
      const message = Platform.OS === 'ios' 
        ? "Check out Flip One - the addictive gravity-flipping game! Flip the world. Stay alive."
        : "Check out Flip One - the addictive gravity-flipping game! Flip the world. Stay alive. Download now!";
      
      await Share.share({
        message,
        title: "Flip One",
      });
    } catch (error) {
      console.log("Share error:", error);
    }
  };

  return (
    <LinearGradient
      colors={backgroundGradient}
      style={[styles.container, { paddingTop: insets.top + Spacing.xl }]}
    >
      <View style={styles.sparklesContainer}>
        {Array.from({ length: 30 }).map((_, i) => (
          <Animated.View
            key={i}
            style={[
              styles.sparkle,
              sparkleStyle,
              {
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                width: Math.random() * 4 + 2,
                height: Math.random() * 4 + 2,
                backgroundColor: [GameColors.candy1, GameColors.candy2, GameColors.candy3, GameColors.candy4, GameColors.candy5][Math.floor(Math.random() * 5)],
              },
            ]}
          />
        ))}
      </View>

      <Animated.View style={[styles.logoSection, logoAnimatedStyle]}>
        <View style={styles.logoContainer}>
          <View style={styles.logoShadow} />
          <View style={styles.logoWrapper}>
            <Image
              source={require("../../assets/images/icon.png")}
              style={styles.logo}
              resizeMode="cover"
            />
          </View>
        </View>

        <View style={styles.titleContainer}>
          <ThemedText style={styles.titleText}>FLIP ONE</ThemedText>
          <View style={styles.titleUnderline} />
        </View>
        
        <LinearGradient
          colors={[GameColors.surfaceGlass, "rgba(255,255,255,0.05)"]}
          style={styles.statsRow}
        >
          <View style={styles.statItem}>
            <View style={styles.statIconContainer}>
              <Feather name="award" size={18} color={GameColors.gold} />
            </View>
            <ThemedText style={styles.statLabel}>BEST</ThemedText>
            <ThemedText style={styles.statValue}>{gameState?.bestScore || 0}</ThemedText>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <View style={[styles.statIconContainer, { backgroundColor: GameColors.primary + "30" }]}>
              <Feather name="star" size={18} color={GameColors.gold} />
            </View>
            <ThemedText style={styles.statLabel}>POINTS</ThemedText>
            <ThemedText style={[styles.statValue, { color: GameColors.gold }]}>
              {gameState?.points || 0}
            </ThemedText>
          </View>
        </LinearGradient>
      </Animated.View>

      <Animated.View style={[styles.centerSection, buttonsAnimatedStyle]}>
        <View style={styles.playButtonContainer}>
          <Animated.View style={[styles.playButtonGlow, playButtonGlowStyle]} />
          <AnimatedPressable
            style={[styles.playButton, playButtonAnimatedStyle]}
            onPress={handlePlayPress}
            onPressIn={handlePressIn}
            onPressOut={handlePressOut}
            testID="button-play"
          >
            <LinearGradient
              colors={[GameColors.candy3, GameColors.player, "#E6B800"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.playButtonGradient}
            >
              <Feather name="play" size={32} color={GameColors.background} style={styles.playIcon} />
              <ThemedText style={styles.playButtonText}>PLAY</ThemedText>
            </LinearGradient>
          </AnimatedPressable>
        </View>
      </Animated.View>

      <Animated.View
        style={[
          styles.menuGrid,
          { paddingBottom: insets.bottom + Spacing.xl },
          buttonsAnimatedStyle,
        ]}
      >
        <View style={styles.menuRow}>
          <MenuButton
            icon="shopping-bag"
            label="Shop"
            onPress={() => navigation.navigate("Shop")}
            colors={[GameColors.candy4, GameColors.primaryGlow]}
          />
          <MenuButton
            icon="target"
            label="Missions"
            onPress={() => navigation.navigate("Missions")}
            colors={[GameColors.candy6, GameColors.successGlow]}
            badge={gameState?.dailyMissions.filter((m) => m.completed && !m.claimed).length}
          />
          <MenuButton
            icon="award"
            label="Ranks"
            onPress={() => navigation.navigate("Leaderboard")}
            colors={[GameColors.gold, GameColors.goldGlow]}
          />
          <MenuButton
            icon="settings"
            label="Settings"
            onPress={() => navigation.navigate("Settings")}
            colors={[GameColors.candy5, GameColors.secondaryGlow]}
          />
        </View>
        
        <View style={styles.secondaryMenuRow}>
          <MenuButton
            icon="gift"
            label="Wheel"
            onPress={() => navigation.navigate("LuckyWheel")}
            colors={["#FF9F43", "#F39C12"]}
          />
          <MenuButton
            icon="star"
            label="Awards"
            onPress={() => navigation.navigate("Achievements")}
            colors={["#9B59B6", "#8E44AD"]}
          />
        </View>

        <Pressable
          style={styles.shareButton}
          onPress={handleShare}
          testID="button-share"
        >
          <LinearGradient
            colors={["rgba(255,255,255,0.1)", "rgba(255,255,255,0.05)"]}
            style={styles.shareButtonGradient}
          >
            <Feather name="share-2" size={18} color={GameColors.textSecondary} />
            <ThemedText style={styles.shareButtonText}>Share with Friends</ThemedText>
          </LinearGradient>
        </Pressable>
      </Animated.View>
    </LinearGradient>
  );
}

interface MenuButtonProps {
  icon: keyof typeof Feather.glyphMap;
  label: string;
  onPress: () => void;
  colors: readonly [string, string, ...string[]];
  badge?: number;
}

function MenuButton({ icon, label, onPress, colors, badge }: MenuButtonProps) {
  const scale = useSharedValue(1);
  const glowOpacity = useSharedValue(0.3);
  const shimmerPosition = useSharedValue(-100);

  useEffect(() => {
    glowOpacity.value = withRepeat(
      withSequence(
        withTiming(0.6, { duration: 1500, easing: Easing.inOut(Easing.ease) }),
        withTiming(0.3, { duration: 1500, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      true
    );
    shimmerPosition.value = withRepeat(
      withDelay(Math.random() * 3000,
        withTiming(100, { duration: 1500, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      false
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const glowStyle = useAnimatedStyle(() => ({
    opacity: glowOpacity.value,
  }));

  return (
    <AnimatedPressable
      style={[styles.menuButton, animatedStyle]}
      onPress={onPress}
      onPressIn={() => {
        scale.value = withSpring(0.9, { damping: 15 });
      }}
      onPressOut={() => {
        scale.value = withSpring(1, { damping: 10 });
      }}
      testID={`button-${label.toLowerCase()}`}
    >
      <View style={styles.menuButtonWrapper}>
        <Animated.View style={[styles.menuButtonGlow, glowStyle, { backgroundColor: colors[0] }]} />
        <LinearGradient
          colors={colors}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.menuButtonIcon}
        >
          <Feather name={icon} size={24} color="#FFFFFF" />
          {badge && badge > 0 ? (
            <View style={styles.badge}>
              <ThemedText style={styles.badgeText}>{badge}</ThemedText>
            </View>
          ) : null}
        </LinearGradient>
      </View>
      <ThemedText style={styles.menuButtonLabel}>{label}</ThemedText>
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
  logoSection: {
    alignItems: "center",
    paddingTop: Spacing["2xl"],
  },
  logoContainer: {
    alignItems: "center",
    justifyContent: "center",
  },
  logoShadow: {
    position: "absolute",
    width: 160,
    height: 160,
    borderRadius: 40,
    backgroundColor: GameColors.primary,
    shadowColor: GameColors.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 50,
    opacity: 0.4,
  },
  logoWrapper: {
    width: 140,
    height: 140,
    borderRadius: 36,
    overflow: "hidden",
    shadowColor: GameColors.gold,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 20,
  },
  logo: {
    width: 140,
    height: 140,
  },
  titleContainer: {
    alignItems: "center",
    marginTop: Spacing.lg,
  },
  titleText: {
    fontSize: 36,
    fontWeight: "900",
    color: GameColors.textPrimary,
    letterSpacing: 6,
    textShadowColor: GameColors.primary,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 20,
  },
  titleUnderline: {
    width: 100,
    height: 4,
    backgroundColor: GameColors.primary,
    borderRadius: 2,
    marginTop: Spacing.sm,
  },
  statsRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: Spacing.xl,
    paddingHorizontal: Spacing["3xl"],
    paddingVertical: Spacing.lg,
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
  },
  statItem: {
    alignItems: "center",
    paddingHorizontal: Spacing.xl,
  },
  statIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: GameColors.gold + "20",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: Spacing.xs,
  },
  statLabel: {
    fontSize: 11,
    color: GameColors.textMuted,
    letterSpacing: 1,
    marginTop: Spacing.xs,
  },
  statValue: {
    fontSize: 24,
    fontWeight: "800",
    color: GameColors.textPrimary,
  },
  statDivider: {
    width: 1,
    height: 50,
    backgroundColor: "rgba(255,255,255,0.2)",
  },
  centerSection: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  playButtonContainer: {
    position: "relative",
    alignItems: "center",
    justifyContent: "center",
  },
  playButtonGlow: {
    position: "absolute",
    width: width * 0.7,
    height: 100,
    backgroundColor: GameColors.player,
    borderRadius: BorderRadius.xl,
    shadowColor: GameColors.player,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 40,
  },
  playButton: {
    width: width * 0.65,
    height: 80,
    borderRadius: BorderRadius.xl,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 15,
    elevation: 15,
  },
  playButtonGradient: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: Spacing.md,
  },
  playIcon: {
    marginRight: Spacing.xs,
  },
  playButtonText: {
    fontSize: 28,
    fontWeight: "900",
    color: GameColors.background,
    letterSpacing: 4,
  },
  menuGrid: {
    paddingHorizontal: Spacing.xl,
  },
  menuRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: Spacing.xl,
  },
  secondaryMenuRow: {
    flexDirection: "row",
    justifyContent: "center",
    gap: Spacing.xl,
    marginBottom: Spacing.xl,
  },
  menuButton: {
    alignItems: "center",
    width: (width - Spacing.xl * 2 - Spacing.lg * 3) / 4,
  },
  menuButtonWrapper: {
    position: "relative",
    alignItems: "center",
    justifyContent: "center",
  },
  menuButtonGlow: {
    position: "absolute",
    width: 70,
    height: 70,
    borderRadius: 35,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 15,
  },
  menuButtonIcon: {
    width: 60,
    height: 60,
    borderRadius: BorderRadius.lg,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  menuButtonLabel: {
    fontSize: 12,
    color: GameColors.textSecondary,
    marginTop: Spacing.sm,
    fontWeight: "600",
  },
  badge: {
    position: "absolute",
    top: -6,
    right: -6,
    backgroundColor: GameColors.danger,
    borderRadius: 12,
    minWidth: 22,
    height: 22,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 6,
    borderWidth: 2,
    borderColor: GameColors.background,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: "800",
    color: GameColors.textPrimary,
  },
  shareButton: {
    overflow: "hidden",
    borderRadius: BorderRadius.lg,
  },
  shareButtonGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: Spacing.md,
    gap: Spacing.sm,
  },
  shareButtonText: {
    fontSize: 14,
    color: GameColors.textSecondary,
    fontWeight: "500",
  },
});
