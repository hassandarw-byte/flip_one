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

// Beach decoration images
const seashellImage = require("../../assets/images/beach/seashell-spiral.png");
const coralImage = require("../../assets/images/beach/coral-pieces.png");
const seaGlassImage = require("../../assets/images/beach/sea-glass.png");
const pebblesImage = require("../../assets/images/beach/polished-pebbles.png");
const crabImage = require("../../assets/images/beach/crab.png");

export default function SplashScreen({ onComplete }: SplashScreenProps) {
  const { backgroundGradient } = useNightMode();
  
  const logoOpacity = useSharedValue(0);
  const logoScale = useSharedValue(0.3);
  const titleOpacity = useSharedValue(0);
  const decorOpacity = useSharedValue(0);

  useEffect(() => {
    decorOpacity.value = withTiming(0.7, { duration: 500 });
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
        {/* Seashell - top left */}
        <Image source={seashellImage} style={[styles.decor, { left: 30, top: 100, width: 55, height: 55 }]} />
        {/* Coral - top right */}
        <Image source={coralImage} style={[styles.decor, { right: 25, top: 80, width: 60, height: 60 }]} />
        {/* Sea glass - bottom left */}
        <Image source={seaGlassImage} style={[styles.decor, { left: 20, bottom: 120, width: 50, height: 50 }]} />
        {/* Pebbles - bottom right */}
        <Image source={pebblesImage} style={[styles.decor, { right: 30, bottom: 100, width: 55, height: 55 }]} />
        {/* Crab - bottom center */}
        <Image source={crabImage} style={[styles.decor, { left: width * 0.4, bottom: 60, width: 70, height: 70 }]} />
        {/* Extra seashell - middle left */}
        <Image source={seashellImage} style={[styles.decor, { left: 15, top: height * 0.45, width: 40, height: 40, transform: [{ rotate: '-30deg' }] }]} />
        {/* Extra coral - middle right */}
        <Image source={coralImage} style={[styles.decor, { right: 20, top: height * 0.5, width: 45, height: 45 }]} />
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
  decor: {
    position: "absolute",
    resizeMode: "contain",
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
