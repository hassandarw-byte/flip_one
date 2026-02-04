import React, { useEffect, useMemo } from "react";
import { View, StyleSheet, Image, Dimensions } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  withSequence,
  withRepeat,
  withSpring,
  Easing,
  runOnJS,
  interpolate,
} from "react-native-reanimated";
import { GameColors, Spacing } from "@/constants/theme";
import { useNightMode } from "@/contexts/NightModeContext";

const { width, height } = Dimensions.get("window");

interface SplashScreenProps {
  onComplete: () => void;
}

interface Sparkle {
  x: number;
  y: number;
  size: number;
  color: string;
  delay: number;
}

export default function SplashScreen({ onComplete }: SplashScreenProps) {
  const { backgroundGradient } = useNightMode();
  
  const logoOpacity = useSharedValue(0);
  const logoScale = useSharedValue(0.5);
  const logoRotate = useSharedValue(-10);
  const glowOpacity = useSharedValue(0);
  const glowScale = useSharedValue(0.6);
  const glowRotate = useSharedValue(0);
  const sparkleOpacity = useSharedValue(0);
  const titleOpacity = useSharedValue(0);
  const titleTranslateY = useSharedValue(30);
  const ringScale1 = useSharedValue(0.3);
  const ringScale2 = useSharedValue(0.3);
  const ringOpacity = useSharedValue(0);

  const sparkles = useMemo<Sparkle[]>(() => 
    Array.from({ length: 50 }).map(() => ({
      x: Math.random() * width,
      y: Math.random() * height,
      size: Math.random() * 5 + 2,
      color: [GameColors.candy1, GameColors.candy2, GameColors.candy3, GameColors.candy4, GameColors.candy5, GameColors.gold][Math.floor(Math.random() * 6)],
      delay: Math.random() * 1000,
    })),
  []);

  useEffect(() => {
    logoOpacity.value = withTiming(1, { duration: 600, easing: Easing.out(Easing.cubic) });
    logoScale.value = withSpring(1, { damping: 12, stiffness: 100 });
    logoRotate.value = withDelay(100, withSpring(0, { damping: 15 }));
    
    glowOpacity.value = withDelay(
      200,
      withSequence(
        withTiming(0.9, { duration: 400 }),
        withRepeat(
          withSequence(
            withTiming(0.6, { duration: 800 }),
            withTiming(0.9, { duration: 800 })
          ),
          -1,
          true
        )
      )
    );
    
    glowScale.value = withDelay(
      200,
      withSpring(1, { damping: 10, stiffness: 80 })
    );

    glowRotate.value = withRepeat(
      withTiming(360, { duration: 8000, easing: Easing.linear }),
      -1,
      false
    );

    ringOpacity.value = withDelay(400, withTiming(0.7, { duration: 300 }));
    ringScale1.value = withDelay(
      400,
      withRepeat(
        withSequence(
          withTiming(1.5, { duration: 1500, easing: Easing.out(Easing.cubic) }),
          withTiming(0.3, { duration: 0 })
        ),
        -1,
        false
      )
    );
    ringScale2.value = withDelay(
      900,
      withRepeat(
        withSequence(
          withTiming(1.5, { duration: 1500, easing: Easing.out(Easing.cubic) }),
          withTiming(0.3, { duration: 0 })
        ),
        -1,
        false
      )
    );

    titleOpacity.value = withDelay(400, withTiming(1, { duration: 500 }));
    titleTranslateY.value = withDelay(400, withSpring(0, { damping: 15 }));

    sparkleOpacity.value = withDelay(
      300,
      withRepeat(
        withSequence(
          withTiming(1, { duration: 600 }),
          withTiming(0.4, { duration: 600 })
        ),
        -1,
        true
      )
    );

    const timer = setTimeout(() => {
      logoOpacity.value = withTiming(0, { duration: 300 });
      logoScale.value = withTiming(1.3, { duration: 300 });
      glowOpacity.value = withTiming(0, { duration: 300 });
      titleOpacity.value = withTiming(0, { duration: 300 }, () => {
        runOnJS(onComplete)();
      });
    }, 2800);

    return () => clearTimeout(timer);
  }, []);

  const logoAnimatedStyle = useAnimatedStyle(() => ({
    opacity: logoOpacity.value,
    transform: [
      { scale: logoScale.value },
      { rotate: `${logoRotate.value}deg` },
    ],
  }));

  const glowAnimatedStyle = useAnimatedStyle(() => ({
    opacity: glowOpacity.value,
    transform: [
      { scale: glowScale.value },
      { rotate: `${glowRotate.value}deg` },
    ],
  }));

  const sparkleStyle = useAnimatedStyle(() => ({
    opacity: sparkleOpacity.value,
  }));

  const titleAnimatedStyle = useAnimatedStyle(() => ({
    opacity: titleOpacity.value,
    transform: [{ translateY: titleTranslateY.value }],
  }));

  const ringStyle1 = useAnimatedStyle(() => ({
    opacity: interpolate(ringScale1.value, [0.3, 1, 1.5], [0.7, 0.3, 0]),
    transform: [{ scale: ringScale1.value }],
  }));

  const ringStyle2 = useAnimatedStyle(() => ({
    opacity: interpolate(ringScale2.value, [0.3, 1, 1.5], [0.7, 0.3, 0]),
    transform: [{ scale: ringScale2.value }],
  }));

  return (
    <LinearGradient
      colors={backgroundGradient}
      style={styles.container}
    >
      <View style={styles.sparklesContainer}>
        {sparkles.map((sparkle, i) => (
          <Animated.View
            key={i}
            style={[
              styles.sparkle,
              sparkleStyle,
              {
                left: sparkle.x,
                top: sparkle.y,
                width: sparkle.size,
                height: sparkle.size,
                backgroundColor: sparkle.color,
              },
            ]}
          />
        ))}
      </View>

      <Animated.View style={[styles.ring, ringStyle1]} />
      <Animated.View style={[styles.ring, styles.ring2, ringStyle2]} />

      <Animated.View style={[styles.glowContainer, glowAnimatedStyle]}>
        <LinearGradient
          colors={[GameColors.primary + "80", GameColors.candy5 + "60", "transparent"]}
          style={styles.glowGradient}
          start={{ x: 0.5, y: 0.5 }}
          end={{ x: 1, y: 1 }}
        />
        <View style={styles.glowCircle} />
        <View style={styles.glowCircle2} />
      </Animated.View>
      
      <Animated.View style={[styles.logoContainer, logoAnimatedStyle]}>
        <View style={styles.logoShadow} />
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
  ring: {
    display: "none",
  },
  ring2: {
    display: "none",
  },
  logoContainer: {
    alignItems: "center",
    justifyContent: "center",
    zIndex: 2,
  },
  logoShadow: {
    position: "absolute",
    width: 180,
    height: 180,
    borderRadius: 40,
    backgroundColor: "transparent",
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
  glowContainer: {
    position: "absolute",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1,
  },
  glowGradient: {
    display: "none",
  },
  glowCircle: {
    display: "none",
  },
  glowCircle2: {
    display: "none",
  },
  titleContainer: {
    marginTop: Spacing["3xl"],
    zIndex: 2,
    alignItems: "center",
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
