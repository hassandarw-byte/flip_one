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

// Arcade-style Seashell component
function ArcadeShell({ size = 30, color = "#FF6B9D", rotation = 0, style }: any) {
  return (
    <View style={[{ width: size, height: size, transform: [{ rotate: `${rotation}deg` }] }, style]}>
      <View style={{
        width: size,
        height: size * 0.8,
        backgroundColor: color,
        borderTopLeftRadius: size,
        borderTopRightRadius: size,
        borderBottomLeftRadius: size * 0.3,
        borderBottomRightRadius: size * 0.3,
        borderWidth: 3,
        borderColor: "#FFFFFF",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 3,
        elevation: 5,
      }}>
        {/* Shell ridges */}
        <View style={{ position: 'absolute', top: size * 0.15, left: size * 0.2, width: 3, height: size * 0.5, backgroundColor: 'rgba(255,255,255,0.7)', borderRadius: 2 }} />
        <View style={{ position: 'absolute', top: size * 0.1, left: size * 0.4, width: 3, height: size * 0.55, backgroundColor: 'rgba(255,255,255,0.7)', borderRadius: 2 }} />
        <View style={{ position: 'absolute', top: size * 0.15, left: size * 0.6, width: 3, height: size * 0.5, backgroundColor: 'rgba(255,255,255,0.7)', borderRadius: 2 }} />
      </View>
    </View>
  );
}

// Arcade-style Starfish component
function ArcadeStarfish({ size = 35, color = "#FFD93D", rotation = 0, style }: any) {
  const armSize = size * 0.45;
  return (
    <View style={[{ width: size, height: size, alignItems: 'center', justifyContent: 'center', transform: [{ rotate: `${rotation}deg` }] }, style]}>
      <View style={{ width: size * 0.45, height: size * 0.45, backgroundColor: color, borderRadius: size * 0.12, borderWidth: 3, borderColor: "#FFFFFF", shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.3, shadowRadius: 3, elevation: 5 }} />
      {[0, 72, 144, 216, 288].map((angle, i) => (
        <View key={i} style={{
          position: 'absolute',
          width: armSize * 0.45,
          height: armSize,
          backgroundColor: color,
          borderRadius: armSize * 0.22,
          borderWidth: 3,
          borderColor: "#FFFFFF",
          transform: [{ rotate: `${angle}deg` }, { translateY: -armSize * 0.55 }],
        }} />
      ))}
    </View>
  );
}

// Arcade-style Crab component
function ArcadeCrab({ size = 40, style }: any) {
  return (
    <View style={[{ width: size, height: size * 0.7 }, style]}>
      {/* Body */}
      <View style={{
        width: size * 0.7,
        height: size * 0.5,
        backgroundColor: "#E53935",
        borderRadius: size * 0.25,
        alignSelf: 'center',
        marginTop: size * 0.15,
        borderWidth: 3,
        borderColor: "#FFFFFF",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 3,
        elevation: 5,
      }}>
        {/* Eyes */}
        <View style={{ position: 'absolute', top: -size * 0.12, left: size * 0.08, width: size * 0.15, height: size * 0.15, backgroundColor: "#000", borderRadius: size * 0.08, borderWidth: 2, borderColor: "#FFF" }} />
        <View style={{ position: 'absolute', top: -size * 0.12, right: size * 0.08, width: size * 0.15, height: size * 0.15, backgroundColor: "#000", borderRadius: size * 0.08, borderWidth: 2, borderColor: "#FFF" }} />
      </View>
      {/* Left Claw */}
      <View style={{ position: 'absolute', left: 0, top: size * 0.18, width: size * 0.28, height: size * 0.22, backgroundColor: "#EF5350", borderRadius: size * 0.11, borderWidth: 3, borderColor: "#FFF" }} />
      {/* Right Claw */}
      <View style={{ position: 'absolute', right: 0, top: size * 0.18, width: size * 0.28, height: size * 0.22, backgroundColor: "#EF5350", borderRadius: size * 0.11, borderWidth: 3, borderColor: "#FFF" }} />
    </View>
  );
}

// Arcade-style Sea Glass component
function ArcadeSeaGlass({ size = 25, color = "#4DD0E1", rotation = 0, style }: any) {
  return (
    <View style={[{
      width: size,
      height: size * 0.7,
      backgroundColor: color,
      borderRadius: size * 0.3,
      borderWidth: 3,
      borderColor: "#FFFFFF",
      transform: [{ rotate: `${rotation}deg` }],
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.3,
      shadowRadius: 3,
      elevation: 5,
    }, style]}>
      <View style={{ position: 'absolute', top: size * 0.08, left: size * 0.12, width: size * 0.35, height: size * 0.18, backgroundColor: 'rgba(255,255,255,0.7)', borderRadius: size * 0.1 }} />
    </View>
  );
}

// Arcade-style Coral component
function ArcadeCoral({ size = 35, color = "#FF6B9D", style }: any) {
  return (
    <View style={[{ width: size, height: size }, style]}>
      <View style={{ position: 'absolute', bottom: 0, left: size * 0.08, width: size * 0.24, height: size * 0.75, backgroundColor: color, borderRadius: size * 0.12, borderWidth: 3, borderColor: "#FFF", shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.3, shadowRadius: 3, elevation: 5 }} />
      <View style={{ position: 'absolute', bottom: 0, left: size * 0.35, width: size * 0.28, height: size * 0.95, backgroundColor: color, borderRadius: size * 0.14, borderWidth: 3, borderColor: "#FFF" }} />
      <View style={{ position: 'absolute', bottom: 0, right: size * 0.08, width: size * 0.24, height: size * 0.65, backgroundColor: color, borderRadius: size * 0.12, borderWidth: 3, borderColor: "#FFF" }} />
    </View>
  );
}

// Arcade-style Pebble component
function ArcadePebble({ size = 20, color = "#9C27B0", style }: any) {
  return (
    <View style={[{
      width: size,
      height: size * 0.7,
      backgroundColor: color,
      borderRadius: size * 0.35,
      borderWidth: 3,
      borderColor: "#FFFFFF",
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.3,
      shadowRadius: 3,
      elevation: 5,
    }, style]}>
      <View style={{ position: 'absolute', top: size * 0.08, left: size * 0.15, width: size * 0.3, height: size * 0.15, backgroundColor: 'rgba(255,255,255,0.6)', borderRadius: size * 0.1 }} />
    </View>
  );
}

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
        {/* Shells - many more */}
        <ArcadeShell size={48} color="#E91E63" rotation={-15} style={{ position: 'absolute', left: 15, top: 85 }} />
        <ArcadeShell size={38} color="#00BCD4" rotation={30} style={{ position: 'absolute', right: 20, top: 175 }} />
        <ArcadeShell size={42} color="#FFEB3B" rotation={-25} style={{ position: 'absolute', right: 10, bottom: 195 }} />
        <ArcadeShell size={35} color="#FF5722" rotation={20} style={{ position: 'absolute', left: width * 0.45, top: 55 }} />
        <ArcadeShell size={40} color="#9C27B0" rotation={-10} style={{ position: 'absolute', left: 70, bottom: 250 }} />
        <ArcadeShell size={32} color="#4CAF50" rotation={35} style={{ position: 'absolute', right: 60, bottom: 320 }} />
        
        {/* Starfish - many more */}
        <ArcadeStarfish size={55} color="#FFEB3B" rotation={15} style={{ position: 'absolute', left: 10, top: height * 0.33 }} />
        <ArcadeStarfish size={45} color="#FF5722" rotation={-20} style={{ position: 'absolute', right: 25, bottom: 275 }} />
        <ArcadeStarfish size={40} color="#E91E63" rotation={30} style={{ position: 'absolute', right: 70, top: 60 }} />
        <ArcadeStarfish size={35} color="#00BCD4" rotation={-35} style={{ position: 'absolute', left: 60, top: height * 0.52 }} />
        <ArcadeStarfish size={50} color="#9C27B0" rotation={10} style={{ position: 'absolute', right: 15, top: height * 0.55 }} />
        
        {/* Crabs - more */}
        <ArcadeCrab size={60} style={{ position: 'absolute', left: 15, bottom: 125 }} />
        <ArcadeCrab size={50} style={{ position: 'absolute', right: 20, bottom: 85 }} />
        <ArcadeCrab size={45} style={{ position: 'absolute', left: width * 0.5, top: height * 0.28 }} />
        
        {/* Coral - more */}
        <ArcadeCoral size={50} color="#E91E63" style={{ position: 'absolute', right: 10, top: 95 }} />
        <ArcadeCoral size={45} color="#9C27B0" style={{ position: 'absolute', left: width * 0.38, bottom: 85 }} />
        <ArcadeCoral size={40} color="#FF5722" style={{ position: 'absolute', left: 5, top: 150 }} />
        <ArcadeCoral size={35} color="#00BCD4" style={{ position: 'absolute', right: 55, top: height * 0.38 }} />
        <ArcadeCoral size={42} color="#4CAF50" style={{ position: 'absolute', left: 85, bottom: 90 }} />
        
        {/* Sea Glass - more */}
        <ArcadeSeaGlass size={32} color="#00BCD4" rotation={45} style={{ position: 'absolute', left: 55, top: 145 }} />
        <ArcadeSeaGlass size={28} color="#26C6DA" rotation={-30} style={{ position: 'absolute', right: 45, top: height * 0.43 }} />
        <ArcadeSeaGlass size={30} color="#00ACC1" rotation={15} style={{ position: 'absolute', left: 35, bottom: 215 }} />
        <ArcadeSeaGlass size={25} color="#4DD0E1" rotation={-45} style={{ position: 'absolute', right: 80, top: 120 }} />
        <ArcadeSeaGlass size={28} color="#80DEEA" rotation={20} style={{ position: 'absolute', left: width * 0.55, bottom: 170 }} />
        <ArcadeSeaGlass size={22} color="#B2EBF2" rotation={-15} style={{ position: 'absolute', left: 10, bottom: 280 }} />
        
        {/* Pebbles - many more */}
        <ArcadePebble size={26} color="#9C27B0" style={{ position: 'absolute', left: 75, top: 65 }} />
        <ArcadePebble size={22} color="#4CAF50" style={{ position: 'absolute', right: 65, top: 135 }} />
        <ArcadePebble size={28} color="#FF5722" style={{ position: 'absolute', left: 45, bottom: 165 }} />
        <ArcadePebble size={24} color="#2196F3" style={{ position: 'absolute', right: 35, bottom: 145 }} />
        <ArcadePebble size={20} color="#E91E63" style={{ position: 'absolute', left: 100, top: 200 }} />
        <ArcadePebble size={18} color="#FFEB3B" style={{ position: 'absolute', right: 95, top: height * 0.48 }} />
        <ArcadePebble size={25} color="#00BCD4" style={{ position: 'absolute', left: 25, top: height * 0.58 }} />
        <ArcadePebble size={22} color="#FF9800" style={{ position: 'absolute', right: 10, top: height * 0.62 }} />
        <ArcadePebble size={19} color="#8BC34A" style={{ position: 'absolute', left: width * 0.6, top: 100 }} />
        <ArcadePebble size={21} color="#673AB7" style={{ position: 'absolute', right: 50, bottom: 230 }} />
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
