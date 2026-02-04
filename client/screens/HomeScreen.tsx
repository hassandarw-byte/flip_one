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

// Beach decoration images
const BEACH_DECORATIONS = [
  { image: require("../../assets/images/beach/seashell-spiral.png"), size: 45 },
  { image: require("../../assets/images/beach/coral-pieces.png"), size: 50 },
  { image: require("../../assets/images/beach/sea-glass.png"), size: 40 },
  { image: require("../../assets/images/beach/polished-pebbles.png"), size: 45 },
  { image: require("../../assets/images/beach/crab.png"), size: 55 },
];

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
      const appLink = "Download Flip One from HHD Apps!";
      const message = `Check out Flip One - the addictive gravity-flipping game! Flip the world. Stay alive. Download now!\n\n${appLink}`;
      
      await Share.share({
        message,
        title: "Flip One",
        url: appLink,
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
      <Animated.View style={[styles.beachDecorContainer, sparkleStyle]}>
        {/* Seashell - top left */}
        <Image source={BEACH_DECORATIONS[0].image} style={[styles.beachDecor, { left: 20, top: 80, width: 50, height: 50 }]} />
        {/* Coral - top right */}
        <Image source={BEACH_DECORATIONS[1].image} style={[styles.beachDecor, { right: 15, top: 120, width: 55, height: 55 }]} />
        {/* Sea glass - middle left */}
        <Image source={BEACH_DECORATIONS[2].image} style={[styles.beachDecor, { left: 10, top: height * 0.4, width: 45, height: 45 }]} />
        {/* Pebbles - middle right */}
        <Image source={BEACH_DECORATIONS[3].image} style={[styles.beachDecor, { right: 20, top: height * 0.35, width: 50, height: 50 }]} />
        {/* Crab - bottom left */}
        <Image source={BEACH_DECORATIONS[4].image} style={[styles.beachDecor, { left: 25, bottom: 150, width: 60, height: 60 }]} />
        {/* Extra seashell - bottom right */}
        <Image source={BEACH_DECORATIONS[0].image} style={[styles.beachDecor, { right: 30, bottom: 180, width: 40, height: 40, transform: [{ rotate: '45deg' }] }]} />
        {/* Extra coral - bottom center */}
        <Image source={BEACH_DECORATIONS[1].image} style={[styles.beachDecor, { left: width * 0.4, bottom: 100, width: 45, height: 45 }]} />
        {/* Extra sea glass - top center */}
        <Image source={BEACH_DECORATIONS[2].image} style={[styles.beachDecor, { left: width * 0.35, top: 60, width: 35, height: 35 }]} />
      </Animated.View>

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
              colors={["#4CAF50", "#2E7D32"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.playButtonGradient}
            >
              <Feather name="play" size={24} color="#FFFFFF" style={styles.playIcon} />
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
            colors={["#FF6B9D", "#C44569"]}
          />
          <MenuButton
            icon="target"
            label="Missions"
            onPress={() => navigation.navigate("Missions")}
            colors={["#4ECDC4", "#26A69A"]}
            badge={gameState?.dailyMissions.filter((m) => m.completed && !m.claimed).length}
          />
          <MenuButton
            icon="award"
            label="Ranks"
            onPress={() => navigation.navigate("Leaderboard")}
            colors={["#FFD93D", "#F4A020"]}
          />
        </View>
        
        <View style={styles.menuRow}>
          <MenuButton
            icon="gift"
            label="Wheel"
            onPress={() => navigation.navigate("LuckyWheel")}
            colors={["#FF9F43", "#E67E22"]}
          />
          <MenuButton
            icon="star"
            label="Awards"
            onPress={() => navigation.navigate("Achievements")}
            colors={["#A66CFF", "#7B4FD0"]}
          />
          <MenuButton
            icon="settings"
            label="Settings"
            onPress={() => navigation.navigate("Settings")}
            colors={["#74B9FF", "#4A90D9"]}
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
          <Feather name={icon} size={22} color="#FFFFFF" />
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
  beachDecorContainer: {
    position: "absolute",
    width: "100%",
    height: "100%",
    zIndex: 0,
  },
  beachDecor: {
    position: "absolute",
    resizeMode: "contain",
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
    backgroundColor: "transparent",
  },
  logoWrapper: {
    width: 140,
    height: 140,
    borderRadius: 36,
    overflow: "hidden",
    elevation: 4,
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
    color: "#1A1A1A",
    letterSpacing: 6,
  },
  titleUnderline: {
    width: 100,
    height: 4,
    backgroundColor: "#FFD700",
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
    borderWidth: 2,
    borderColor: "rgba(255,255,255,0.4)",
    backgroundColor: "rgba(255,255,255,0.2)",
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
    color: "#333333",
    letterSpacing: 1,
    marginTop: Spacing.xs,
    fontWeight: "600",
  },
  statValue: {
    fontSize: 24,
    fontWeight: "800",
    color: "#1A1A1A",
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
    marginTop: Spacing.xl,
    paddingTop: Spacing.lg,
  },
  playButtonContainer: {
    position: "relative",
    alignItems: "center",
    justifyContent: "center",
  },
  playButtonGlow: {
    display: "none",
  },
  playButton: {
    width: width * 0.4,
    height: 44,
    borderRadius: BorderRadius.md,
    overflow: "hidden",
    elevation: 4,
  },
  playButtonGradient: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: Spacing.xs,
  },
  playIcon: {
    marginRight: 2,
  },
  playButtonText: {
    fontSize: 22,
    fontWeight: "900",
    color: "#FFFFFF",
    letterSpacing: 3,
    textAlign: "center",
  },
  menuGrid: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.lg,
    marginTop: Spacing.sm,
  },
  menuRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: Spacing.sm,
    paddingHorizontal: Spacing.sm,
  },
  menuButton: {
    alignItems: "center",
    width: (width - Spacing.xl * 2) / 4,
  },
  menuButtonWrapper: {
    position: "relative",
    alignItems: "center",
    justifyContent: "center",
  },
  menuButtonGlow: {
    display: "none",
  },
  menuButtonIcon: {
    width: 38,
    height: 38,
    borderRadius: BorderRadius.sm,
    justifyContent: "center",
    alignItems: "center",
    elevation: 4,
  },
  menuButtonLabel: {
    fontSize: 10,
    color: "#1A1A1A",
    marginTop: 4,
    fontWeight: "700",
    textAlign: "center",
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
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    borderRadius: BorderRadius.lg,
  },
  shareButtonText: {
    fontSize: 14,
    color: "#1A1A1A",
    fontWeight: "600",
  },
});
