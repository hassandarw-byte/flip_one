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
import Svg, { Path, Circle, Defs, LinearGradient as SvgLinearGradient, Stop } from "react-native-svg";
import { Spacing } from "@/constants/theme";
import { useNightMode } from "@/contexts/NightModeContext";

const { width, height } = Dimensions.get("window");

interface SplashScreenProps {
  onComplete: () => void;
}

function ArcadeShell({ size = 30, color = "#FF6B9D", rotation = 0, style }: any) {
  return (
    <View style={[{ width: size, height: size, transform: [{ rotate: `${rotation}deg` }] }, style]}>
      <Svg width={size} height={size} viewBox="0 0 100 100">
        <Defs>
          <SvgLinearGradient id="shellGradientSplash" x1="0%" y1="0%" x2="100%" y2="100%">
            <Stop offset="0%" stopColor={color} />
            <Stop offset="100%" stopColor="#C2185B" />
          </SvgLinearGradient>
        </Defs>
        <Path
          d="M50 10 Q80 20, 85 50 Q85 80, 50 90 Q15 80, 15 50 Q20 20, 50 10 Z"
          fill="url(#shellGradientSplash)"
          stroke="#FFFFFF"
          strokeWidth={2}
        />
        <Path d="M50 15 Q50 50, 50 85" stroke="rgba(255,255,255,0.5)" strokeWidth={2} fill="none" />
        <Path d="M30 25 Q40 50, 35 80" stroke="rgba(255,255,255,0.4)" strokeWidth={2} fill="none" />
        <Path d="M70 25 Q60 50, 65 80" stroke="rgba(255,255,255,0.4)" strokeWidth={2} fill="none" />
      </Svg>
    </View>
  );
}

function ArcadeStarfish({ size = 35, color = "#FFD93D", rotation = 0, style }: any) {
  return (
    <View style={[{ width: size, height: size, transform: [{ rotate: `${rotation}deg` }] }, style]}>
      <Svg width={size} height={size} viewBox="0 0 100 100">
        <Defs>
          <SvgLinearGradient id="starfishGradientSplash" x1="0%" y1="0%" x2="100%" y2="100%">
            <Stop offset="0%" stopColor={color} />
            <Stop offset="100%" stopColor="#FF9800" />
          </SvgLinearGradient>
        </Defs>
        <Path
          d="M50 5 L58 35 L90 35 L65 55 L75 90 L50 70 L25 90 L35 55 L10 35 L42 35 Z"
          fill="url(#starfishGradientSplash)"
          stroke="#FFFFFF"
          strokeWidth={2}
        />
        <Circle cx="50" cy="50" r="8" fill="#FF5722" />
        <Circle cx="35" cy="40" r="3" fill="rgba(255,255,255,0.5)" />
        <Circle cx="65" cy="40" r="3" fill="rgba(255,255,255,0.5)" />
        <Circle cx="40" cy="60" r="3" fill="rgba(255,255,255,0.5)" />
        <Circle cx="60" cy="60" r="3" fill="rgba(255,255,255,0.5)" />
      </Svg>
    </View>
  );
}

function ArcadeCrab({ size = 40, style }: any) {
  return (
    <View style={[{ width: size, height: size }, style]}>
      <Svg width={size} height={size} viewBox="0 0 100 100">
        <Circle cx="50" cy="55" r="25" fill="#E57373" stroke="#C62828" strokeWidth={2} />
        <Circle cx="40" cy="40" r="8" fill="#FFFFFF" />
        <Circle cx="60" cy="40" r="8" fill="#FFFFFF" />
        <Circle cx="40" cy="40" r="4" fill="#000000" />
        <Circle cx="60" cy="40" r="4" fill="#000000" />
        <Path d="M15 50 Q5 45, 10 35 Q15 25, 25 40" fill="#E57373" stroke="#C62828" strokeWidth={2} />
        <Path d="M85 50 Q95 45, 90 35 Q85 25, 75 40" fill="#E57373" stroke="#C62828" strokeWidth={2} />
        <Path d="M30 70 L20 85" stroke="#C62828" strokeWidth={3} />
        <Path d="M40 75 L35 90" stroke="#C62828" strokeWidth={3} />
        <Path d="M60 75 L65 90" stroke="#C62828" strokeWidth={3} />
        <Path d="M70 70 L80 85" stroke="#C62828" strokeWidth={3} />
      </Svg>
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
  const { backgroundGradient, textColor, textSecondaryColor } = useNightMode();
  
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
        <Animated.Text style={[styles.titleText, { color: textColor }]}>FLIP ONE</Animated.Text>
        <Animated.Text style={[styles.subtitleText, { color: textSecondaryColor }]}>Flip the world. Stay alive.</Animated.Text>
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
    marginTop: -40,
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
    marginTop: Spacing.xl + 20,
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
    marginTop: Spacing.xs,
    letterSpacing: 4,
  },
});
