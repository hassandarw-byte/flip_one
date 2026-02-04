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

import Svg, { Path, Ellipse, Text as SvgText } from "react-native-svg";
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
  const buttonsOpacity = useSharedValue(0);
  const sparkleOpacity = useSharedValue(0.3);
  
  // Moving crabs
  const crab1X = useSharedValue(-60);
  const crab2X = useSharedValue(width + 60);
  const crab3X = useSharedValue(-60);
  const crab4X = useSharedValue(width + 60);

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
    buttonsOpacity.value = withDelay(300, withTiming(1, { duration: 600 }));
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

    // Animate crabs moving horizontally
    crab1X.value = withRepeat(
      withSequence(
        withTiming(width + 60, { duration: 6000, easing: Easing.linear }),
        withTiming(-60, { duration: 0 })
      ),
      -1,
      false
    );
    
    crab2X.value = withRepeat(
      withSequence(
        withTiming(-60, { duration: 5000, easing: Easing.linear }),
        withTiming(width + 60, { duration: 0 })
      ),
      -1,
      false
    );
    
    crab3X.value = withDelay(2000, withRepeat(
      withSequence(
        withTiming(width + 60, { duration: 7000, easing: Easing.linear }),
        withTiming(-60, { duration: 0 })
      ),
      -1,
      false
    ));
    
    crab4X.value = withDelay(1500, withRepeat(
      withSequence(
        withTiming(-60, { duration: 5500, easing: Easing.linear }),
        withTiming(width + 60, { duration: 0 })
      ),
      -1,
      false
    ));
  };

  // Animated styles for moving crabs
  const crab1Style = useAnimatedStyle(() => ({
    transform: [{ translateX: crab1X.value }],
  }));
  
  const crab2Style = useAnimatedStyle(() => ({
    transform: [{ translateX: crab2X.value }, { scaleX: -1 }],
  }));
  
  const crab3Style = useAnimatedStyle(() => ({
    transform: [{ translateX: crab3X.value }],
  }));
  
  const crab4Style = useAnimatedStyle(() => ({
    transform: [{ translateX: crab4X.value }, { scaleX: -1 }],
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
      {/* Moving crabs only - 4 crabs moving horizontally at edges */}
      <Animated.View style={[styles.movingCrab, { top: 50 }, crab1Style]}>
        <ArcadeCrab size={45} />
      </Animated.View>
      <Animated.View style={[styles.movingCrab, { top: 100 }, crab2Style]}>
        <ArcadeCrab size={40} />
      </Animated.View>
      <Animated.View style={[styles.movingCrab, { bottom: 180 }, crab3Style]}>
        <ArcadeCrab size={42} />
      </Animated.View>
      <Animated.View style={[styles.movingCrab, { bottom: 230 }, crab4Style]}>
        <ArcadeCrab size={38} />
      </Animated.View>

      {/* Stats section without logo */}
      <View style={styles.statsSection}>
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
      </View>

      <Animated.View style={[styles.centerSection, buttonsAnimatedStyle]}>
        <View style={styles.playButtonContainer}>
          <AnimatedPressable
            style={[styles.playButton, playButtonAnimatedStyle]}
            onPress={handlePlayPress}
            onPressIn={handlePressIn}
            onPressOut={handlePressOut}
            testID="button-play"
          >
            <Svg width={140} height={120} viewBox="0 0 140 120">
              {/* Shell body - fan shape */}
              <Path
                d="M70 110 
                   Q20 80, 10 40 
                   Q5 20, 20 10 
                   Q40 0, 70 5 
                   Q100 0, 120 10 
                   Q135 20, 130 40 
                   Q120 80, 70 110 Z"
                fill="#FFCCBB"
                stroke="#E8A090"
                strokeWidth={3}
              />
              {/* Shell ridges */}
              <Path d="M70 110 Q55 70, 35 20" stroke="#E8A090" strokeWidth={2} fill="none" />
              <Path d="M70 110 Q60 65, 52 15" stroke="#E8A090" strokeWidth={2} fill="none" />
              <Path d="M70 110 Q70 60, 70 10" stroke="#E8A090" strokeWidth={2} fill="none" />
              <Path d="M70 110 Q80 65, 88 15" stroke="#E8A090" strokeWidth={2} fill="none" />
              <Path d="M70 110 Q85 70, 105 20" stroke="#E8A090" strokeWidth={2} fill="none" />
              {/* Shell base */}
              <Ellipse cx="70" cy="108" rx="25" ry="8" fill="#E8A090" />
              {/* PLAY text */}
              <SvgText
                x="70"
                y="70"
                fontSize="22"
                fontWeight="bold"
                fill="#1A1A1A"
                textAnchor="middle"
                fontFamily="Tajawal_700Bold"
              >PLAY</SvgText>
            </Svg>
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
            seaCreature="shell"
            label="Shop"
            onPress={() => navigation.navigate("Shop")}
            colors={["#9C27B0", "#7B1FA2"]}
          />
          <MenuButton
            seaCreature="fish"
            label="Missions"
            onPress={() => navigation.navigate("Missions")}
            colors={["#2196F3", "#1976D2"]}
            badge={gameState?.dailyMissions.filter((m) => m.completed && !m.claimed).length}
          />
          <MenuButton
            seaCreature="turtle"
            label="Ranks"
            onPress={() => navigation.navigate("Leaderboard")}
            colors={["#1A1A1A", "#000000"]}
          />
        </View>
        
        <View style={styles.menuRow}>
          <MenuButton
            seaCreature="seahorse"
            label="Wheel"
            onPress={() => navigation.navigate("LuckyWheel")}
            colors={["#2196F3", "#1565C0"]}
          />
          <MenuButton
            seaCreature="starfish"
            label="Awards"
            onPress={() => navigation.navigate("Achievements")}
            colors={["#9C27B0", "#6A1B9A"]}
          />
          <MenuButton
            seaCreature="crab"
            label="Settings"
            onPress={() => navigation.navigate("Settings")}
            colors={["#1A1A1A", "#000000"]}
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

// Sea Creature Button Icons - Clear and Bold designs
function SeahorseIcon({ size = 24, color = "#FFFFFF" }: { size?: number; color?: string }) {
  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      {/* Seahorse - simplified clear shape */}
      <View style={{
        width: size * 0.45,
        height: size * 0.75,
        backgroundColor: color,
        borderRadius: size * 0.2,
        borderTopLeftRadius: size * 0.35,
        borderTopRightRadius: size * 0.15,
      }}>
        {/* Head bump */}
        <View style={{
          position: 'absolute',
          top: -size * 0.1,
          left: size * 0.02,
          width: size * 0.3,
          height: size * 0.22,
          backgroundColor: color,
          borderRadius: size * 0.12,
        }} />
        {/* Snout */}
        <View style={{
          position: 'absolute',
          top: size * 0.02,
          left: -size * 0.18,
          width: size * 0.22,
          height: size * 0.1,
          backgroundColor: color,
          borderRadius: size * 0.05,
        }} />
        {/* Curly tail */}
        <View style={{
          position: 'absolute',
          bottom: -size * 0.12,
          right: -size * 0.05,
          width: size * 0.22,
          height: size * 0.22,
          borderWidth: size * 0.07,
          borderColor: color,
          borderRadius: size * 0.11,
          backgroundColor: 'transparent',
          borderTopColor: 'transparent',
          borderLeftColor: 'transparent',
        }} />
        {/* Dorsal fin */}
        <View style={{
          position: 'absolute',
          top: size * 0.15,
          right: -size * 0.08,
          width: size * 0.12,
          height: size * 0.25,
          backgroundColor: color,
          borderRadius: size * 0.06,
          transform: [{ rotate: '15deg' }],
        }} />
      </View>
    </View>
  );
}

function FishIcon({ size = 24, color = "#FFFFFF" }: { size?: number; color?: string }) {
  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      {/* Fish body - clear oval shape */}
      <View style={{
        width: size * 0.7,
        height: size * 0.45,
        backgroundColor: color,
        borderRadius: size * 0.22,
        borderTopLeftRadius: size * 0.15,
        borderBottomLeftRadius: size * 0.15,
      }}>
        {/* Tail - big and clear */}
        <View style={{
          position: 'absolute',
          right: -size * 0.2,
          top: -size * 0.02,
          width: 0,
          height: 0,
          borderLeftWidth: size * 0.25,
          borderLeftColor: color,
          borderTopWidth: size * 0.25,
          borderTopColor: 'transparent',
          borderBottomWidth: size * 0.25,
          borderBottomColor: 'transparent',
        }} />
        {/* Top fin - larger */}
        <View style={{
          position: 'absolute',
          top: -size * 0.15,
          left: size * 0.2,
          width: 0,
          height: 0,
          borderBottomWidth: size * 0.18,
          borderBottomColor: color,
          borderLeftWidth: size * 0.1,
          borderLeftColor: 'transparent',
          borderRightWidth: size * 0.1,
          borderRightColor: 'transparent',
        }} />
        {/* Bottom fin */}
        <View style={{
          position: 'absolute',
          bottom: -size * 0.1,
          left: size * 0.25,
          width: 0,
          height: 0,
          borderTopWidth: size * 0.12,
          borderTopColor: color,
          borderLeftWidth: size * 0.06,
          borderLeftColor: 'transparent',
          borderRightWidth: size * 0.06,
          borderRightColor: 'transparent',
        }} />
      </View>
    </View>
  );
}

function TurtleIcon({ size = 24, color = "#FFFFFF" }: { size?: number; color?: string }) {
  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      {/* Shell - dome shaped */}
      <View style={{
        width: size * 0.6,
        height: size * 0.45,
        backgroundColor: color,
        borderRadius: size * 0.3,
        borderTopLeftRadius: size * 0.35,
        borderTopRightRadius: size * 0.35,
      }}>
        {/* Shell pattern - hexagon lines */}
        <View style={{
          position: 'absolute',
          top: size * 0.08,
          left: size * 0.12,
          width: size * 0.36,
          height: size * 0.28,
          borderWidth: 2,
          borderColor: 'rgba(0,0,0,0.25)',
          borderRadius: size * 0.14,
        }} />
      </View>
      {/* Head - rounder */}
      <View style={{
        position: 'absolute',
        left: size * 0.02,
        top: size * 0.32,
        width: size * 0.22,
        height: size * 0.18,
        backgroundColor: color,
        borderRadius: size * 0.09,
      }} />
      {/* Front left flipper */}
      <View style={{
        position: 'absolute',
        left: size * 0.08,
        top: size * 0.52,
        width: size * 0.2,
        height: size * 0.12,
        backgroundColor: color,
        borderRadius: size * 0.06,
        transform: [{ rotate: '-35deg' }],
      }} />
      {/* Front right flipper */}
      <View style={{
        position: 'absolute',
        right: size * 0.08,
        top: size * 0.52,
        width: size * 0.2,
        height: size * 0.12,
        backgroundColor: color,
        borderRadius: size * 0.06,
        transform: [{ rotate: '35deg' }],
      }} />
      {/* Tail */}
      <View style={{
        position: 'absolute',
        right: size * 0.05,
        top: size * 0.38,
        width: size * 0.12,
        height: size * 0.08,
        backgroundColor: color,
        borderRadius: size * 0.04,
      }} />
    </View>
  );
}

function ShellButtonIcon({ size = 24, color = "#FFFFFF" }: { size?: number; color?: string }) {
  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      {/* Scallop shell - fan shaped */}
      <View style={{
        width: size * 0.85,
        height: size * 0.7,
        backgroundColor: color,
        borderTopLeftRadius: size * 0.45,
        borderTopRightRadius: size * 0.45,
        borderBottomLeftRadius: size * 0.12,
        borderBottomRightRadius: size * 0.12,
      }}>
        {/* Shell ridges - radiating lines */}
        <View style={{ position: 'absolute', top: size * 0.08, left: size * 0.1, width: 3, height: size * 0.5, backgroundColor: 'rgba(0,0,0,0.15)', borderRadius: 1.5, transform: [{ rotate: '-15deg' }] }} />
        <View style={{ position: 'absolute', top: size * 0.05, left: size * 0.25, width: 3, height: size * 0.55, backgroundColor: 'rgba(0,0,0,0.15)', borderRadius: 1.5, transform: [{ rotate: '-5deg' }] }} />
        <View style={{ position: 'absolute', top: size * 0.04, left: size * 0.4, width: 3, height: size * 0.58, backgroundColor: 'rgba(0,0,0,0.15)', borderRadius: 1.5 }} />
        <View style={{ position: 'absolute', top: size * 0.05, right: size * 0.25, width: 3, height: size * 0.55, backgroundColor: 'rgba(0,0,0,0.15)', borderRadius: 1.5, transform: [{ rotate: '5deg' }] }} />
        <View style={{ position: 'absolute', top: size * 0.08, right: size * 0.1, width: 3, height: size * 0.5, backgroundColor: 'rgba(0,0,0,0.15)', borderRadius: 1.5, transform: [{ rotate: '15deg' }] }} />
      </View>
      {/* Shell hinge at bottom */}
      <View style={{
        position: 'absolute',
        bottom: size * 0.08,
        width: size * 0.2,
        height: size * 0.1,
        backgroundColor: color,
        borderRadius: size * 0.05,
      }} />
    </View>
  );
}

function CrabButtonIcon({ size = 24, color = "#FFFFFF" }: { size?: number; color?: string }) {
  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      {/* Body - wider oval */}
      <View style={{
        width: size * 0.55,
        height: size * 0.35,
        backgroundColor: color,
        borderRadius: size * 0.18,
        marginTop: size * 0.1,
      }}>
        {/* Eye stalks */}
        <View style={{
          position: 'absolute',
          top: -size * 0.12,
          left: size * 0.08,
          width: size * 0.08,
          height: size * 0.15,
          backgroundColor: color,
          borderRadius: size * 0.04,
        }} />
        <View style={{
          position: 'absolute',
          top: -size * 0.12,
          right: size * 0.08,
          width: size * 0.08,
          height: size * 0.15,
          backgroundColor: color,
          borderRadius: size * 0.04,
        }} />
      </View>
      {/* Big left claw */}
      <View style={{
        position: 'absolute',
        left: 0,
        top: size * 0.3,
        width: size * 0.3,
        height: size * 0.18,
        backgroundColor: color,
        borderRadius: size * 0.09,
        transform: [{ rotate: '-25deg' }],
      }} />
      {/* Big right claw */}
      <View style={{
        position: 'absolute',
        right: 0,
        top: size * 0.3,
        width: size * 0.3,
        height: size * 0.18,
        backgroundColor: color,
        borderRadius: size * 0.09,
        transform: [{ rotate: '25deg' }],
      }} />
      {/* Legs - 3 on each side */}
      <View style={{ position: 'absolute', left: size * 0.12, bottom: size * 0.08, width: size * 0.15, height: size * 0.06, backgroundColor: color, borderRadius: size * 0.03, transform: [{ rotate: '-45deg' }] }} />
      <View style={{ position: 'absolute', right: size * 0.12, bottom: size * 0.08, width: size * 0.15, height: size * 0.06, backgroundColor: color, borderRadius: size * 0.03, transform: [{ rotate: '45deg' }] }} />
    </View>
  );
}

function StarfishButtonIcon({ size = 24, color = "#FFFFFF" }: { size?: number; color?: string }) {
  const armLength = size * 0.38;
  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      {/* Center - larger */}
      <View style={{ width: size * 0.35, height: size * 0.35, backgroundColor: color, borderRadius: size * 0.12 }} />
      {/* 5 Arms - thicker and tapered */}
      {[0, 72, 144, 216, 288].map((angle, i) => (
        <View key={i} style={{
          position: 'absolute',
          width: size * 0.18,
          height: armLength,
          backgroundColor: color,
          borderTopLeftRadius: size * 0.09,
          borderTopRightRadius: size * 0.09,
          borderBottomLeftRadius: size * 0.04,
          borderBottomRightRadius: size * 0.04,
          transform: [{ rotate: `${angle}deg` }, { translateY: -armLength * 0.45 }],
        }} />
      ))}
    </View>
  );
}

type SeaCreatureType = 'seahorse' | 'fish' | 'turtle' | 'shell' | 'crab' | 'starfish';

interface MenuButtonProps {
  seaCreature: SeaCreatureType;
  label: string;
  onPress: () => void;
  colors: readonly [string, string, ...string[]];
  badge?: number;
}

function MenuButton({ seaCreature, label, onPress, colors, badge }: MenuButtonProps) {
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
          {seaCreature === 'seahorse' ? <SeahorseIcon size={26} color="#FFFFFF" /> : null}
          {seaCreature === 'fish' ? <FishIcon size={26} color="#FFFFFF" /> : null}
          {seaCreature === 'turtle' ? <TurtleIcon size={26} color="#FFFFFF" /> : null}
          {seaCreature === 'shell' ? <ShellButtonIcon size={26} color="#FFFFFF" /> : null}
          {seaCreature === 'crab' ? <CrabButtonIcon size={26} color="#FFFFFF" /> : null}
          {seaCreature === 'starfish' ? <StarfishButtonIcon size={26} color="#FFFFFF" /> : null}
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
  movingCrab: {
    position: "absolute",
    zIndex: 1,
  },
  statsSection: {
    alignItems: "center",
    paddingTop: Spacing["2xl"],
  },
  titleText: {
    fontSize: 36,
    fontFamily: "Tajawal_800ExtraBold",
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
    width: 120,
    height: 120,
    alignItems: "center",
    justifyContent: "center",
  },
  shellImage: {
    width: 120,
    height: 120,
  },
  playIconOverlay: {
    position: "absolute",
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "rgba(255,255,255,0.85)",
    justifyContent: "center",
    alignItems: "center",
    elevation: 4,
  },
  playIcon: {
    marginLeft: 4,
  },
  playButtonText: {
    fontSize: 14,
    fontWeight: "900",
    color: "#FFFFFF",
    letterSpacing: 2,
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
    width: 50,
    height: 50,
    borderRadius: BorderRadius.md,
    justifyContent: "center",
    alignItems: "center",
    elevation: 4,
  },
  menuButtonLabel: {
    fontSize: 14,
    color: "#1A1A1A",
    marginTop: 6,
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
