import React, { useEffect } from "react";
import { View, StyleSheet, Image, Dimensions } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSequence,
  withDelay,
  Easing,
  runOnJS,
  ReduceMotion,
} from "react-native-reanimated";
import { Spacing } from "@/constants/theme";
import { useNightMode } from "@/contexts/NightModeContext";

const { width, height } = Dimensions.get("window");

interface SplashScreenProps {
  onComplete: () => void;
}

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
        <View style={{ position: 'absolute', top: -size * 0.12, left: size * 0.08, width: size * 0.15, height: size * 0.15, backgroundColor: "#000", borderRadius: size * 0.08, borderWidth: 2, borderColor: "#FFF" }} />
        <View style={{ position: 'absolute', top: -size * 0.12, right: size * 0.08, width: size * 0.15, height: size * 0.15, backgroundColor: "#000", borderRadius: size * 0.08, borderWidth: 2, borderColor: "#FFF" }} />
      </View>
      <View style={{ position: 'absolute', left: 0, top: size * 0.18, width: size * 0.28, height: size * 0.22, backgroundColor: "#EF5350", borderRadius: size * 0.11, borderWidth: 3, borderColor: "#FFF" }} />
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

export default function SplashScreen({ onComplete }: SplashScreenProps) {
  const { backgroundGradient } = useNightMode();
  
  const logoOpacity = useSharedValue(0);
  const logoScale = useSharedValue(0.15);
  const titleOpacity = useSharedValue(0);
  const decorOpacity = useSharedValue(0);

  useEffect(() => {
    // Decorations fade in slowly
    decorOpacity.value = withTiming(1, { duration: 1200, reduceMotion: ReduceMotion.Never });
    
    // Logo appears very slowly and gradually
    logoOpacity.value = withTiming(1, { duration: 1500, easing: Easing.out(Easing.cubic), reduceMotion: ReduceMotion.Never });
    
    // Logo: starts very small (0.15) -> grows slowly to 1.3 over 2.5s -> shrinks slightly to 1.0 over 1s and settles
    logoScale.value = withSequence(
      withTiming(1.3, { duration: 2500, easing: Easing.out(Easing.cubic), reduceMotion: ReduceMotion.Never }),
      withTiming(1.0, { duration: 1000, easing: Easing.out(Easing.cubic), reduceMotion: ReduceMotion.Never })
    );

    // Title appears after logo is more visible
    titleOpacity.value = withDelay(1200, withTiming(1, { duration: 1500, easing: Easing.out(Easing.cubic), reduceMotion: ReduceMotion.Never }));

    // Transition to home after 4.5 seconds total
    const timer = setTimeout(() => {
      logoOpacity.value = withTiming(0, { duration: 500, reduceMotion: ReduceMotion.Never });
      titleOpacity.value = withTiming(0, { duration: 500, reduceMotion: ReduceMotion.Never }, () => {
        runOnJS(onComplete)();
      });
    }, 4500);

    return () => clearTimeout(timer);
  }, []);

  const logoAnimatedStyle = useAnimatedStyle(() => ({
    opacity: logoOpacity.value,
    transform: [{ scale: logoScale.value }],
  }));

  const titleAnimatedStyle = useAnimatedStyle(() => ({
    opacity: titleOpacity.value,
  }));

  const decorStyle = useAnimatedStyle(() => ({
    opacity: decorOpacity.value,
  }));

  // Sand beach gradient colors
  const sandGradient: readonly [string, string, ...string[]] = ["#F5DEB3", "#DEB887", "#D2B48C"];

  return (
    <LinearGradient
      colors={sandGradient}
      style={styles.container}
    >
      <Animated.View style={[styles.decorContainer, decorStyle]}>
        {/* Decorations scattered at edges - keeping center clear for logo */}
        
        {/* Top edge */}
        <ArcadeShell size={45} color="#E91E63" rotation={-20} style={{ position: 'absolute', left: 15, top: 40 }} />
        <ArcadePebble size={22} color="#9C27B0" style={{ position: 'absolute', left: 75, top: 65 }} />
        <ArcadeSeaGlass size={24} color="#26C6DA" rotation={-30} style={{ position: 'absolute', left: 130, top: 35 }} />
        <ArcadeStarfish size={40} color="#FF5722" rotation={25} style={{ position: 'absolute', right: 20, top: 50 }} />
        <ArcadeSeaGlass size={28} color="#00BCD4" rotation={40} style={{ position: 'absolute', right: 85, top: 40 }} />
        <ArcadePebble size={18} color="#FFEB3B" style={{ position: 'absolute', right: 140, top: 55 }} />
        
        {/* Left edge */}
        <ArcadeCoral size={38} color="#9C27B0" style={{ position: 'absolute', left: 10, top: 120 }} />
        <ArcadePebble size={20} color="#4CAF50" style={{ position: 'absolute', left: 55, top: 160 }} />
        <ArcadeShell size={32} color="#00BCD4" rotation={30} style={{ position: 'absolute', left: 8, top: 210 }} />
        <ArcadeSeaGlass size={22} color="#80DEEA" rotation={-20} style={{ position: 'absolute', left: 45, top: 260 }} />
        <ArcadePebble size={16} color="#FF5722" style={{ position: 'absolute', left: 20, bottom: 220 }} />
        <ArcadeStarfish size={35} color="#FFEB3B" rotation={-10} style={{ position: 'absolute', left: 5, bottom: 170 }} />
        
        {/* Right edge */}
        <ArcadeShell size={36} color="#FF5722" rotation={-15} style={{ position: 'absolute', right: 12, top: 115 }} />
        <ArcadePebble size={19} color="#E91E63" style={{ position: 'absolute', right: 60, top: 150 }} />
        <ArcadeCoral size={35} color="#4CAF50" style={{ position: 'absolute', right: 8, top: 200 }} />
        <ArcadeSeaGlass size={20} color="#4DD0E1" rotation={25} style={{ position: 'absolute', right: 50, top: 250 }} />
        <ArcadePebble size={17} color="#9C27B0" style={{ position: 'absolute', right: 15, bottom: 210 }} />
        <ArcadeShell size={30} color="#FFEB3B" rotation={20} style={{ position: 'absolute', right: 55, bottom: 180 }} />
        
        {/* Bottom edge */}
        <ArcadeCrab size={55} style={{ position: 'absolute', left: 20, bottom: 70 }} />
        <ArcadeShell size={35} color="#FFEB3B" rotation={15} style={{ position: 'absolute', left: 90, bottom: 55 }} />
        <ArcadePebble size={20} color="#4CAF50" style={{ position: 'absolute', left: 140, bottom: 75 }} />
        <ArcadeSeaGlass size={26} color="#00BCD4" rotation={-35} style={{ position: 'absolute', left: 180, bottom: 45 }} />
        <ArcadeStarfish size={50} color="#FFEB3B" rotation={-15} style={{ position: 'absolute', right: 25, bottom: 60 }} />
        <ArcadeCoral size={40} color="#E91E63" style={{ position: 'absolute', right: 95, bottom: 45 }} />
        <ArcadePebble size={18} color="#2196F3" style={{ position: 'absolute', right: 55, bottom: 85 }} />
        <ArcadeCrab size={42} style={{ position: 'absolute', right: 150, bottom: 50 }} />
        
        {/* Extra scattered pebbles */}
        <ArcadePebble size={14} color="#673AB7" style={{ position: 'absolute', left: 100, top: 100 }} />
        <ArcadePebble size={15} color="#FF9800" style={{ position: 'absolute', right: 110, top: 95 }} />
        <ArcadePebble size={13} color="#00ACC1" style={{ position: 'absolute', left: 85, bottom: 130 }} />
        <ArcadePebble size={16} color="#8BC34A" style={{ position: 'absolute', right: 100, bottom: 125 }} />
      </Animated.View>

      <Animated.View style={[styles.logoContainer, logoAnimatedStyle]}>
        <View style={styles.logoWrapper}>
          <Image
            source={require("../../assets/images/icon.png")}
            style={styles.logo}
            resizeMode="cover"
          />
        </View>
      </Animated.View>

      <Animated.View style={[styles.titleContainer, titleAnimatedStyle]}>
        <Animated.Text style={styles.titleText}>FLIP ONE</Animated.Text>
        <Animated.Text style={styles.subtitleText}>Flip the world. Stay alive.</Animated.Text>
      </Animated.View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  decorContainer: {
    position: "absolute",
    width: "100%",
    height: "100%",
    zIndex: 0,
  },
  logoContainer: {
    alignItems: "center",
    justifyContent: "center",
    zIndex: 2,
  },
  logoWrapper: {
    width: 160,
    height: 160,
    borderRadius: 36,
    overflow: "hidden",
    elevation: 4,
  },
  logo: {
    width: 160,
    height: 160,
  },
  titleContainer: {
    marginTop: Spacing["3xl"],
    alignItems: "center",
    zIndex: 2,
  },
  titleText: {
    fontSize: 36,
    fontFamily: "Tajawal_800ExtraBold",
    color: "#1A1A1A",
    letterSpacing: 10,
  },
  subtitleText: {
    fontSize: 14,
    fontFamily: "Tajawal_500Medium",
    color: "#333333",
    marginTop: Spacing.sm,
    letterSpacing: 4,
  },
});
