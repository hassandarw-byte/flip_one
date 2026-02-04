import React, { useEffect } from "react";
import { View, StyleSheet, Image, Dimensions } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSequence,
  Easing,
  runOnJS,
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
        borderWidth: 2,
        borderColor: "#FFFFFF",
      }}>
        <View style={{ position: 'absolute', top: size * 0.15, left: size * 0.2, width: 2, height: size * 0.5, backgroundColor: 'rgba(255,255,255,0.5)', borderRadius: 1 }} />
        <View style={{ position: 'absolute', top: size * 0.1, left: size * 0.4, width: 2, height: size * 0.55, backgroundColor: 'rgba(255,255,255,0.5)', borderRadius: 1 }} />
        <View style={{ position: 'absolute', top: size * 0.15, left: size * 0.6, width: 2, height: size * 0.5, backgroundColor: 'rgba(255,255,255,0.5)', borderRadius: 1 }} />
      </View>
    </View>
  );
}

// Arcade-style Starfish component
function ArcadeStarfish({ size = 35, color = "#FFD93D", rotation = 0, style }: any) {
  const armSize = size * 0.4;
  return (
    <View style={[{ width: size, height: size, alignItems: 'center', justifyContent: 'center', transform: [{ rotate: `${rotation}deg` }] }, style]}>
      <View style={{ width: size * 0.4, height: size * 0.4, backgroundColor: color, borderRadius: size * 0.1, borderWidth: 2, borderColor: "#FFFFFF" }} />
      {[0, 72, 144, 216, 288].map((angle, i) => (
        <View key={i} style={{
          position: 'absolute',
          width: armSize * 0.4,
          height: armSize,
          backgroundColor: color,
          borderRadius: armSize * 0.2,
          borderWidth: 2,
          borderColor: "#FFFFFF",
          transform: [{ rotate: `${angle}deg` }, { translateY: -armSize * 0.6 }],
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
        backgroundColor: "#FF5722",
        borderRadius: size * 0.25,
        alignSelf: 'center',
        marginTop: size * 0.15,
        borderWidth: 2,
        borderColor: "#FFFFFF",
      }}>
        <View style={{ position: 'absolute', top: -size * 0.1, left: size * 0.1, width: size * 0.12, height: size * 0.12, backgroundColor: "#000", borderRadius: size * 0.06, borderWidth: 1, borderColor: "#FFF" }} />
        <View style={{ position: 'absolute', top: -size * 0.1, right: size * 0.1, width: size * 0.12, height: size * 0.12, backgroundColor: "#000", borderRadius: size * 0.06, borderWidth: 1, borderColor: "#FFF" }} />
      </View>
      <View style={{ position: 'absolute', left: 0, top: size * 0.2, width: size * 0.25, height: size * 0.2, backgroundColor: "#FF7043", borderRadius: size * 0.1, borderWidth: 2, borderColor: "#FFF" }} />
      <View style={{ position: 'absolute', right: 0, top: size * 0.2, width: size * 0.25, height: size * 0.2, backgroundColor: "#FF7043", borderRadius: size * 0.1, borderWidth: 2, borderColor: "#FFF" }} />
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
      borderWidth: 2,
      borderColor: "#FFFFFF",
      transform: [{ rotate: `${rotation}deg` }],
      opacity: 0.9,
    }, style]}>
      <View style={{ position: 'absolute', top: size * 0.1, left: size * 0.15, width: size * 0.3, height: size * 0.15, backgroundColor: 'rgba(255,255,255,0.5)', borderRadius: size * 0.1 }} />
    </View>
  );
}

// Arcade-style Coral component
function ArcadeCoral({ size = 35, color = "#FF6B9D", style }: any) {
  return (
    <View style={[{ width: size, height: size }, style]}>
      <View style={{ position: 'absolute', bottom: 0, left: size * 0.1, width: size * 0.2, height: size * 0.7, backgroundColor: color, borderRadius: size * 0.1, borderWidth: 2, borderColor: "#FFF" }} />
      <View style={{ position: 'absolute', bottom: 0, left: size * 0.35, width: size * 0.25, height: size * 0.9, backgroundColor: color, borderRadius: size * 0.12, borderWidth: 2, borderColor: "#FFF" }} />
      <View style={{ position: 'absolute', bottom: 0, right: size * 0.1, width: size * 0.2, height: size * 0.6, backgroundColor: color, borderRadius: size * 0.1, borderWidth: 2, borderColor: "#FFF" }} />
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
      borderWidth: 2,
      borderColor: "#FFFFFF",
    }, style]}>
      <View style={{ position: 'absolute', top: size * 0.1, left: size * 0.2, width: size * 0.25, height: size * 0.12, backgroundColor: 'rgba(255,255,255,0.4)', borderRadius: size * 0.1 }} />
    </View>
  );
}

export default function SplashScreen({ onComplete }: SplashScreenProps) {
  const { backgroundGradient } = useNightMode();
  
  const logoOpacity = useSharedValue(0);
  const logoScale = useSharedValue(0.3);
  const titleOpacity = useSharedValue(0);
  const decorOpacity = useSharedValue(0);

  useEffect(() => {
    decorOpacity.value = withTiming(1, { duration: 500 });
    logoOpacity.value = withTiming(1, { duration: 400, easing: Easing.out(Easing.cubic) });
    
    logoScale.value = withSequence(
      withTiming(1.15, { duration: 600, easing: Easing.out(Easing.cubic) }),
      withTiming(1, { duration: 400, easing: Easing.inOut(Easing.cubic) })
    );

    titleOpacity.value = withTiming(1, { duration: 400, easing: Easing.out(Easing.cubic) });

    const timer = setTimeout(() => {
      logoOpacity.value = withTiming(0, { duration: 300 });
      titleOpacity.value = withTiming(0, { duration: 300 }, () => {
        runOnJS(onComplete)();
      });
    }, 2000);

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

  return (
    <LinearGradient
      colors={backgroundGradient}
      style={styles.container}
    >
      <Animated.View style={[styles.decorContainer, decorStyle]}>
        {/* Shells */}
        <ArcadeShell size={40} color="#FF6B9D" rotation={-20} style={{ position: 'absolute', left: 25, top: 100 }} />
        <ArcadeShell size={30} color="#4DD0E1" rotation={25} style={{ position: 'absolute', right: 30, top: 150 }} />
        
        {/* Starfish */}
        <ArcadeStarfish size={45} color="#FFD93D" rotation={10} style={{ position: 'absolute', left: 20, bottom: 180 }} />
        <ArcadeStarfish size={35} color="#FF9800" rotation={-15} style={{ position: 'absolute', right: 25, bottom: 220 }} />
        
        {/* Crab */}
        <ArcadeCrab size={55} style={{ position: 'absolute', left: width * 0.38, bottom: 80 }} />
        
        {/* Coral */}
        <ArcadeCoral size={45} color="#FF6B9D" style={{ position: 'absolute', right: 20, top: 90 }} />
        <ArcadeCoral size={35} color="#E91E63" style={{ position: 'absolute', left: 15, top: height * 0.4 }} />
        
        {/* Sea Glass */}
        <ArcadeSeaGlass size={28} color="#4DD0E1" rotation={40} style={{ position: 'absolute', left: 70, top: 70 }} />
        <ArcadeSeaGlass size={22} color="#26C6DA" rotation={-25} style={{ position: 'absolute', right: 60, top: height * 0.35 }} />
        
        {/* Pebbles */}
        <ArcadePebble size={20} color="#9C27B0" style={{ position: 'absolute', left: 90, top: 130 }} />
        <ArcadePebble size={16} color="#4CAF50" style={{ position: 'absolute', right: 80, top: 200 }} />
        <ArcadePebble size={18} color="#2196F3" style={{ position: 'absolute', right: 50, bottom: 150 }} />
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
    fontWeight: "900",
    color: "#1A1A1A",
    letterSpacing: 10,
  },
  subtitleText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333333",
    marginTop: Spacing.sm,
    letterSpacing: 4,
  },
});
