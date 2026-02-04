import React, { useEffect, useMemo } from "react";
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

interface Shell {
  x: number;
  y: number;
  size: number;
  color: string;
  rotation: number;
}

export default function SplashScreen({ onComplete }: SplashScreenProps) {
  const { backgroundGradient } = useNightMode();
  
  const logoOpacity = useSharedValue(0);
  const logoScale = useSharedValue(0.3);
  const titleOpacity = useSharedValue(0);
  const shellsOpacity = useSharedValue(0.3);

  const shells = useMemo<Shell[]>(() => 
    Array.from({ length: 10 }).map(() => ({
      x: Math.random() * width,
      y: Math.random() * height,
      size: 15 + Math.random() * 25,
      color: ["#00BCD4", "#26C6DA", "#4DD0E1", "#00ACC1"][Math.floor(Math.random() * 4)],
      rotation: Math.random() * 360,
    })),
  []);

  useEffect(() => {
    logoOpacity.value = withTiming(1, { duration: 400, easing: Easing.out(Easing.cubic) });
    
    logoScale.value = withSequence(
      withTiming(1.15, { duration: 600, easing: Easing.out(Easing.cubic) }),
      withTiming(1, { duration: 400, easing: Easing.inOut(Easing.cubic) })
    );

    titleOpacity.value = withTiming(1, { duration: 400, easing: Easing.out(Easing.cubic) });
    shellsOpacity.value = withTiming(0.6, { duration: 600 });

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

  const shellsStyle = useAnimatedStyle(() => ({
    opacity: shellsOpacity.value,
  }));

  return (
    <LinearGradient
      colors={backgroundGradient}
      style={styles.container}
    >
      <Animated.View style={[styles.shellsContainer, shellsStyle]}>
        {shells.map((shell, i) => (
          <View
            key={i}
            style={[
              styles.shell,
              {
                left: shell.x,
                top: shell.y,
                width: shell.size,
                height: shell.size * 0.8,
                backgroundColor: shell.color,
                transform: [{ rotate: `${shell.rotation}deg` }],
              },
            ]}
          />
        ))}
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
  shellsContainer: {
    position: "absolute",
    width: "100%",
    height: "100%",
    zIndex: 0,
  },
  shell: {
    position: "absolute",
    borderTopLeftRadius: 50,
    borderTopRightRadius: 50,
    borderBottomLeftRadius: 10,
    borderBottomRightRadius: 10,
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
