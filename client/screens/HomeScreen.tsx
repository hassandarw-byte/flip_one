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

import Svg, { Path, Ellipse, Text as SvgText, Circle, Defs, LinearGradient as SvgLinearGradient, Stop, Rect } from "react-native-svg";
import { ThemedText } from "@/components/ThemedText";
import { GameColors, Spacing, BorderRadius } from "@/constants/theme";
import { getGameState, GameState, savePoints } from "@/lib/storage";
import { RootStackParamList } from "@/navigation/RootStackNavigator";
import { useNightMode } from "@/contexts/NightModeContext";
import BannerAd from "@/components/BannerAd";

const { width, height } = Dimensions.get("window");

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);
const AnimatedLinearGradient = Animated.createAnimatedComponent(LinearGradient);

// Arcade-style Seashell component
function ArcadeShell({ size = 30, color = "#FF6B9D", rotation = 0, style }: any) {
  return (
    <View style={[{ width: size, height: size, transform: [{ rotate: `${rotation}deg` }] }, style]}>
      <Svg width={size} height={size} viewBox="0 0 100 100">
        <Defs>
          <SvgLinearGradient id="shellGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <Stop offset="0%" stopColor={color} />
            <Stop offset="100%" stopColor="#C2185B" />
          </SvgLinearGradient>
        </Defs>
        <Path
          d="M50 10 Q80 20, 85 50 Q85 80, 50 90 Q15 80, 15 50 Q20 20, 50 10 Z"
          fill="url(#shellGradient)"
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
          <SvgLinearGradient id="starfishGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <Stop offset="0%" stopColor={color} />
            <Stop offset="100%" stopColor="#FF9800" />
          </SvgLinearGradient>
        </Defs>
        <Path
          d="M50 5 L58 35 L90 35 L65 55 L75 90 L50 70 L25 90 L35 55 L10 35 L42 35 Z"
          fill="url(#starfishGradient)"
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

function ArcadeFish({ size = 40, color = "#29B6F6", style }: any) {
  const colorMap: Record<string, { dark: string; light: string }> = {
    "#29B6F6": { dark: "#0277BD", light: "#B3E5FC" },
    "#64B5F6": { dark: "#1565C0", light: "#BBDEFB" },
    "#FF7043": { dark: "#BF360C", light: "#FFCCBC" },
    "#4DD0E1": { dark: "#00838F", light: "#B2EBF2" },
    "#FF6B9D": { dark: "#AD1457", light: "#FCE4EC" },
  };
  const darkColor = (colorMap[color] || { dark: "#0277BD", light: "#B3E5FC" }).dark;
  const lightColor = (colorMap[color] || { dark: "#0277BD", light: "#B3E5FC" }).light;
  return (
    <View style={[{ width: size, height: size }, style]}>
      <Svg width={size} height={size} viewBox="0 0 100 100">
        <Defs>
          <SvgLinearGradient id={`fishG${color}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <Stop offset="0%" stopColor={lightColor} />
            <Stop offset="60%" stopColor={color} />
            <Stop offset="100%" stopColor={darkColor} />
          </SvgLinearGradient>
          <SvgLinearGradient id={`fishT${color}`} x1="100%" y1="0%" x2="0%" y2="100%">
            <Stop offset="0%" stopColor={color} />
            <Stop offset="100%" stopColor={darkColor} />
          </SvgLinearGradient>
        </Defs>
        {/* Tail fan */}
        <Path d="M18 50 L2 28 L10 50 L2 72 Z" fill={`url(#fishT${color})`} stroke={darkColor} strokeWidth={1} />
        {/* Body */}
        <Path d="M82 50 Q65 20, 25 36 Q8 50, 25 64 Q65 80, 82 50 Z" fill={`url(#fishG${color})`} stroke={darkColor} strokeWidth={1.5} />
        {/* Belly highlight */}
        <Path d="M75 50 Q58 65, 32 61 Q18 57, 25 64 Q65 80, 75 50 Z" fill="rgba(255,255,255,0.25)" />
        {/* Dorsal fin */}
        <Path d="M46 32 Q56 14, 66 28" fill={color} stroke={darkColor} strokeWidth={1.5} />
        {/* Scale pattern */}
        <Path d="M52 36 Q58 40, 52 44" stroke="rgba(255,255,255,0.4)" strokeWidth={1.5} fill="none" />
        <Path d="M63 38 Q69 42, 63 46" stroke="rgba(255,255,255,0.4)" strokeWidth={1.5} fill="none" />
        <Path d="M48 46 Q54 50, 48 54" stroke="rgba(255,255,255,0.3)" strokeWidth={1.5} fill="none" />
        {/* Top shine line */}
        <Path d="M32 33 Q55 24, 74 34" stroke="rgba(255,255,255,0.6)" strokeWidth={2.5} fill="none" strokeLinecap="round" />
        {/* Eye */}
        <Circle cx="68" cy="45" r="9" fill="#FFFFFF" />
        <Circle cx="67" cy="45" r="6" fill="#1A237E" />
        <Circle cx="65" cy="43" r="2.5" fill="#FFFFFF" />
        <Circle cx="70" cy="47" r="1" fill="rgba(255,255,255,0.5)" />
        {/* Smile */}
        <Path d="M80 50 Q83 52, 80 54" stroke={darkColor} strokeWidth={2} fill="none" strokeLinecap="round" />
        {/* Bubble */}
        <Circle cx="86" cy="42" r="3" fill="none" stroke="rgba(255,255,255,0.6)" strokeWidth={1.5} />
        <Circle cx="92" cy="36" r="2" fill="none" stroke="rgba(255,255,255,0.5)" strokeWidth={1} />
      </Svg>
    </View>
  );
}

function ArcadeCrab({ size = 40, style }: any) {
  return (
    <View style={[{ width: size, height: size }, style]}>
      <Svg width={size} height={size} viewBox="0 0 100 100">
        <Defs>
          <SvgLinearGradient id="homeCrabBody" x1="10%" y1="0%" x2="90%" y2="100%">
            <Stop offset="0%" stopColor="#FF8A65" />
            <Stop offset="100%" stopColor="#D32F2F" />
          </SvgLinearGradient>
          <SvgLinearGradient id="homeCrabShine" x1="0%" y1="0%" x2="60%" y2="60%">
            <Stop offset="0%" stopColor="rgba(255,255,255,0.55)" />
            <Stop offset="100%" stopColor="rgba(255,255,255,0)" />
          </SvgLinearGradient>
        </Defs>
        {/* Legs */}
        <Path d="M28 68 Q20 78, 14 90" stroke="#C62828" strokeWidth={2.5} fill="none" strokeLinecap="round" />
        <Path d="M37 73 Q30 86, 26 96" stroke="#C62828" strokeWidth={2.5} fill="none" strokeLinecap="round" />
        <Path d="M63 73 Q70 86, 74 96" stroke="#C62828" strokeWidth={2.5} fill="none" strokeLinecap="round" />
        <Path d="M72 68 Q80 78, 86 90" stroke="#C62828" strokeWidth={2.5} fill="none" strokeLinecap="round" />
        {/* Left claw */}
        <Path d="M14 54 Q2 44, 8 28 Q14 16, 28 36 Q20 44, 22 54" fill="url(#homeCrabBody)" stroke="#B71C1C" strokeWidth={1.5} />
        <Circle cx="8" cy="24" r="6" fill="#FF7043" stroke="#B71C1C" strokeWidth={1} />
        {/* Right claw */}
        <Path d="M86 54 Q98 44, 92 28 Q86 16, 72 36 Q80 44, 78 54" fill="url(#homeCrabBody)" stroke="#B71C1C" strokeWidth={1.5} />
        <Circle cx="92" cy="24" r="6" fill="#FF7043" stroke="#B71C1C" strokeWidth={1} />
        {/* Main body */}
        <Path d="M20 58 Q20 28, 50 26 Q80 28, 80 58 Q80 82, 50 84 Q20 82, 20 58 Z" fill="url(#homeCrabBody)" stroke="#B71C1C" strokeWidth={2} />
        {/* Shine */}
        <Path d="M28 34 Q50 26, 72 34 Q65 28, 50 26 Q35 26, 28 34 Z" fill="url(#homeCrabShine)" />
        {/* Eyes on stalks */}
        <Path d="M35 30 L28 16" stroke="#B71C1C" strokeWidth={3} strokeLinecap="round" />
        <Path d="M65 30 L72 16" stroke="#B71C1C" strokeWidth={3} strokeLinecap="round" />
        <Circle cx="27" cy="13" r="8" fill="#FFFFFF" stroke="#B71C1C" strokeWidth={1.5} />
        <Circle cx="73" cy="13" r="8" fill="#FFFFFF" stroke="#B71C1C" strokeWidth={1.5} />
        <Circle cx="26" cy="12" r="5" fill="#1A237E" />
        <Circle cx="72" cy="12" r="5" fill="#1A237E" />
        <Circle cx="24" cy="10" r="2" fill="#FFFFFF" />
        <Circle cx="70" cy="10" r="2" fill="#FFFFFF" />
        {/* Rosy cheeks */}
        <Circle cx="34" cy="62" r="7" fill="rgba(255,100,100,0.25)" />
        <Circle cx="66" cy="62" r="7" fill="rgba(255,100,100,0.25)" />
        {/* Smile */}
        <Path d="M36 68 Q50 76, 64 68" stroke="#B71C1C" strokeWidth={2.5} fill="none" strokeLinecap="round" />
        {/* Belly segments */}
        <Path d="M32 56 Q50 62, 68 56" stroke="#FF8A65" strokeWidth={1.5} fill="none" />
      </Svg>
    </View>
  );
}

function ArcadeLobster({ size = 40, style }: any) {
  return (
    <View style={[{ width: size, height: size }, style]}>
      <Svg width={size} height={size} viewBox="0 0 100 100">
        <Defs>
          <SvgLinearGradient id="homeLobsterG" x1="0%" y1="0%" x2="100%" y2="100%">
            <Stop offset="0%" stopColor="#FF5252" />
            <Stop offset="100%" stopColor="#C62828" />
          </SvgLinearGradient>
        </Defs>
        {/* Antennae */}
        <Path d="M38 18 Q25 5, 15 2" stroke="#C62828" strokeWidth={1.5} fill="none" strokeLinecap="round" />
        <Path d="M62 18 Q75 5, 85 2" stroke="#C62828" strokeWidth={1.5} fill="none" strokeLinecap="round" />
        {/* Claws */}
        <Path d="M20 44 Q6 36, 10 22 Q14 10, 26 28 Q20 36, 22 44" fill="url(#homeLobsterG)" stroke="#B71C1C" strokeWidth={1.5} />
        <Circle cx="10" cy="18" r="6" fill="#FF5252" stroke="#B71C1C" strokeWidth={1} />
        <Path d="M80 44 Q94 36, 90 22 Q86 10, 74 28 Q80 36, 78 44" fill="url(#homeLobsterG)" stroke="#B71C1C" strokeWidth={1.5} />
        <Circle cx="90" cy="18" r="6" fill="#FF5252" stroke="#B71C1C" strokeWidth={1} />
        {/* Legs */}
        <Path d="M30 68 Q22 78, 18 88" stroke="#C62828" strokeWidth={2} fill="none" strokeLinecap="round" />
        <Path d="M38 72 Q32 84, 30 93" stroke="#C62828" strokeWidth={2} fill="none" strokeLinecap="round" />
        <Path d="M62 72 Q68 84, 70 93" stroke="#C62828" strokeWidth={2} fill="none" strokeLinecap="round" />
        <Path d="M70 68 Q78 78, 82 88" stroke="#C62828" strokeWidth={2} fill="none" strokeLinecap="round" />
        {/* Body */}
        <Path d="M25 48 Q25 28, 50 26 Q75 28, 75 48 Q75 60, 50 62 Q25 60, 25 48 Z" fill="url(#homeLobsterG)" stroke="#B71C1C" strokeWidth={2} />
        <Path d="M28 60 Q28 72, 50 74 Q72 72, 72 60" fill="url(#homeLobsterG)" stroke="#B71C1C" strokeWidth={1.5} />
        <Path d="M30 72 Q30 82, 50 84 Q70 82, 70 72" fill="url(#homeLobsterG)" stroke="#B71C1C" strokeWidth={1.5} />
        <Path d="M36 84 L30 96 L50 90 L70 96 L64 84" fill="url(#homeLobsterG)" stroke="#B71C1C" strokeWidth={1.5} />
        <Path d="M32 32 Q50 26, 68 32 Q62 28, 50 26 Q38 26, 32 32 Z" fill="rgba(255,255,255,0.3)" />
        <Path d="M26 56 Q50 60, 74 56" stroke="#B71C1C" strokeWidth={1} fill="none" />
        {/* Eyes */}
        <Path d="M38 28 L32 16" stroke="#B71C1C" strokeWidth={2.5} strokeLinecap="round" />
        <Path d="M62 28 L68 16" stroke="#B71C1C" strokeWidth={2.5} strokeLinecap="round" />
        <Circle cx="32" cy="13" r="6" fill="#FFFFFF" stroke="#B71C1C" strokeWidth={1} />
        <Circle cx="68" cy="13" r="6" fill="#FFFFFF" stroke="#B71C1C" strokeWidth={1} />
        <Circle cx="31" cy="12" r="3.5" fill="#1A237E" />
        <Circle cx="67" cy="12" r="3.5" fill="#1A237E" />
        <Circle cx="30" cy="11" r="1.5" fill="#FFFFFF" />
        <Circle cx="66" cy="11" r="1.5" fill="#FFFFFF" />
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

function ArcadeJellyfish({ size = 40, color = "#CE93D8", style }: any) {
  const darkColor = "#7B1FA2";
  return (
    <View style={[{ width: size, height: size * 1.3 }, style]}>
      <Svg width={size} height={size * 1.3} viewBox="0 0 100 130">
        <Defs>
          <SvgLinearGradient id={`jellyG${color}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <Stop offset="0%" stopColor="rgba(255,255,255,0.8)" />
            <Stop offset="40%" stopColor={color} />
            <Stop offset="100%" stopColor={darkColor} />
          </SvgLinearGradient>
          <SvgLinearGradient id={`jellyCapG${color}`} x1="0%" y1="0%" x2="50%" y2="100%">
            <Stop offset="0%" stopColor="rgba(255,255,255,0.5)" />
            <Stop offset="100%" stopColor="rgba(255,255,255,0)" />
          </SvgLinearGradient>
        </Defs>
        {/* Tentacles */}
        <Path d="M28 62 Q20 80, 25 100 Q22 115, 28 128" stroke={color} strokeWidth={3} fill="none" strokeLinecap="round" opacity={0.7} />
        <Path d="M40 65 Q38 85, 42 105 Q40 118, 44 128" stroke={color} strokeWidth={3} fill="none" strokeLinecap="round" opacity={0.7} />
        <Path d="M60 65 Q62 85, 58 105 Q60 118, 56 128" stroke={color} strokeWidth={3} fill="none" strokeLinecap="round" opacity={0.7} />
        <Path d="M72 62 Q80 80, 75 100 Q78 115, 72 128" stroke={color} strokeWidth={3} fill="none" strokeLinecap="round" opacity={0.7} />
        {/* Inner frilly tentacles */}
        <Path d="M48 64 Q44 80, 48 95" stroke="rgba(255,255,255,0.5)" strokeWidth={2} fill="none" strokeLinecap="round" />
        <Path d="M52 64 Q56 80, 52 95" stroke="rgba(255,255,255,0.5)" strokeWidth={2} fill="none" strokeLinecap="round" />
        {/* Bell cap */}
        <Path d="M18 48 Q18 15, 50 12 Q82 15, 82 48 Q82 65, 50 68 Q18 65, 18 48 Z" fill={`url(#jellyG${color})`} stroke={darkColor} strokeWidth={1.5} />
        {/* Inner shine highlight */}
        <Path d="M28 24 Q50 16, 72 24 Q60 16, 50 14 Q40 14, 28 24 Z" fill={`url(#jellyCapG${color})`} />
        {/* Inner pattern */}
        <Path d="M30 42 Q50 50, 70 42" stroke="rgba(255,255,255,0.35)" strokeWidth={2} fill="none" />
        <Path d="M34 52 Q50 60, 66 52" stroke="rgba(255,255,255,0.25)" strokeWidth={1.5} fill="none" />
        {/* Eyes */}
        <Circle cx="38" cy="38" r="6" fill="#FFFFFF" />
        <Circle cx="62" cy="38" r="6" fill="#FFFFFF" />
        <Circle cx="37" cy="38" r="3.5" fill="#4A148C" />
        <Circle cx="61" cy="38" r="3.5" fill="#4A148C" />
        <Circle cx="36" cy="37" r="1.5" fill="#FFFFFF" />
        <Circle cx="60" cy="37" r="1.5" fill="#FFFFFF" />
        {/* Little smile */}
        <Path d="M42 52 Q50 57, 58 52" stroke={darkColor} strokeWidth={2} fill="none" strokeLinecap="round" />
      </Svg>
    </View>
  );
}

function ArcadeTurtle({ size = 45, style }: any) {
  return (
    <View style={[{ width: size * 1.2, height: size }, style]}>
      <Svg width={size * 1.2} height={size} viewBox="0 0 120 100">
        <Defs>
          <SvgLinearGradient id="turtleShell" x1="0%" y1="0%" x2="100%" y2="100%">
            <Stop offset="0%" stopColor="#81C784" />
            <Stop offset="100%" stopColor="#2E7D32" />
          </SvgLinearGradient>
          <SvgLinearGradient id="turtleSkin" x1="0%" y1="0%" x2="100%" y2="100%">
            <Stop offset="0%" stopColor="#A5D6A7" />
            <Stop offset="100%" stopColor="#388E3C" />
          </SvgLinearGradient>
        </Defs>
        {/* Flippers */}
        <Path d="M22 46 Q6 38, 2 26 Q8 22, 20 34" fill="url(#turtleSkin)" stroke="#2E7D32" strokeWidth={1.5} />
        <Path d="M98 46 Q114 38, 118 26 Q112 22, 100 34" fill="url(#turtleSkin)" stroke="#2E7D32" strokeWidth={1.5} />
        <Path d="M30 72 Q18 84, 14 95 Q22 96, 34 82" fill="url(#turtleSkin)" stroke="#2E7D32" strokeWidth={1.5} />
        <Path d="M90 72 Q102 84, 106 95 Q98 96, 86 82" fill="url(#turtleSkin)" stroke="#2E7D32" strokeWidth={1.5} />
        {/* Shell base */}
        <Path d="M22 50 Q22 22, 60 18 Q98 22, 98 50 Q98 80, 60 84 Q22 80, 22 50 Z" fill="url(#turtleShell)" stroke="#1B5E20" strokeWidth={2} />
        {/* Shell hexagon pattern */}
        <Path d="M60 28 L72 36 L72 52 L60 60 L48 52 L48 36 Z" fill="rgba(255,255,255,0.15)" stroke="#1B5E20" strokeWidth={1} />
        <Path d="M35 38 L44 44 L44 56 L35 62 L26 56 L26 44 Z" fill="rgba(255,255,255,0.1)" stroke="#1B5E20" strokeWidth={1} />
        <Path d="M85 38 L94 44 L94 56 L85 62 L76 56 L76 44 Z" fill="rgba(255,255,255,0.1)" stroke="#1B5E20" strokeWidth={1} />
        <Path d="M60 60 L69 66 L69 76 L60 80 L51 76 L51 66 Z" fill="rgba(255,255,255,0.1)" stroke="#1B5E20" strokeWidth={1} />
        {/* Shell shine */}
        <Path d="M36 24 Q60 18, 84 24 Q70 18, 60 18 Q50 18, 36 24 Z" fill="rgba(255,255,255,0.3)" />
        {/* Head */}
        <Ellipse cx="60" cy="14" rx="14" ry="10" fill="url(#turtleSkin)" stroke="#2E7D32" strokeWidth={1.5} />
        {/* Eyes */}
        <Circle cx="53" cy="11" r="5" fill="#FFFFFF" />
        <Circle cx="67" cy="11" r="5" fill="#FFFFFF" />
        <Circle cx="52" cy="10" r="3" fill="#1B5E20" />
        <Circle cx="66" cy="10" r="3" fill="#1B5E20" />
        <Circle cx="51" cy="9" r="1.2" fill="#FFFFFF" />
        <Circle cx="65" cy="9" r="1.2" fill="#FFFFFF" />
        {/* Smile */}
        <Path d="M54 17 Q60 21, 66 17" stroke="#2E7D32" strokeWidth={1.5} fill="none" strokeLinecap="round" />
        {/* Tail */}
        <Path d="M60 84 Q63 92, 60 96 Q57 92, 60 84" fill="url(#turtleSkin)" stroke="#2E7D32" strokeWidth={1} />
      </Svg>
    </View>
  );
}

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { backgroundGradient, textColor } = useNightMode();
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
  
  // Moving fish
  const fish1X = useSharedValue(-60);
  const fish2X = useSharedValue(width + 60);
  const fish3X = useSharedValue(-60);
  
  // Moving starfish (floating)
  const star1Y = useSharedValue(0);
  const star2Y = useSharedValue(0);
  
  // Moving shells (drifting)
  const shell1X = useSharedValue(-60);
  const shell2X = useSharedValue(width + 60);

  // Jellyfish bobbing
  const jelly1Y = useSharedValue(0);
  const jelly2Y = useSharedValue(0);

  // Turtle swimming
  const turtle1X = useSharedValue(-80);
  const turtle2X = useSharedValue(width + 80);

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
        withTiming(-60, { duration: 1 })
      ),
      -1,
      false
    );
    
    crab2X.value = withRepeat(
      withSequence(
        withTiming(-60, { duration: 5000, easing: Easing.linear }),
        withTiming(width + 60, { duration: 1 })
      ),
      -1,
      false
    );
    
    crab3X.value = withDelay(2000, withRepeat(
      withSequence(
        withTiming(width + 60, { duration: 7000, easing: Easing.linear }),
        withTiming(-60, { duration: 1 })
      ),
      -1,
      false
    ));
    
    crab4X.value = withDelay(1500, withRepeat(
      withSequence(
        withTiming(-60, { duration: 5500, easing: Easing.linear }),
        withTiming(width + 60, { duration: 1 })
      ),
      -1,
      false
    ));
    
    // Animate fish swimming
    fish1X.value = withRepeat(
      withSequence(
        withTiming(width + 60, { duration: 4000, easing: Easing.linear }),
        withTiming(-60, { duration: 1 })
      ),
      -1,
      false
    );
    
    fish2X.value = withDelay(1000, withRepeat(
      withSequence(
        withTiming(-60, { duration: 3500, easing: Easing.linear }),
        withTiming(width + 60, { duration: 1 })
      ),
      -1,
      false
    ));
    
    fish3X.value = withDelay(2000, withRepeat(
      withSequence(
        withTiming(width + 60, { duration: 5000, easing: Easing.linear }),
        withTiming(-60, { duration: 1 })
      ),
      -1,
      false
    ));
    
    // Animate starfish floating up and down
    star1Y.value = withRepeat(
      withSequence(
        withTiming(15, { duration: 2000, easing: Easing.inOut(Easing.ease) }),
        withTiming(-15, { duration: 2000, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      true
    );
    
    star2Y.value = withDelay(1000, withRepeat(
      withSequence(
        withTiming(-12, { duration: 1800, easing: Easing.inOut(Easing.ease) }),
        withTiming(12, { duration: 1800, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      true
    ));
    
    // Animate shells drifting
    shell1X.value = withRepeat(
      withSequence(
        withTiming(width + 60, { duration: 8000, easing: Easing.linear }),
        withTiming(-60, { duration: 1 })
      ),
      -1,
      false
    );
    
    shell2X.value = withDelay(4000, withRepeat(
      withSequence(
        withTiming(-60, { duration: 9000, easing: Easing.linear }),
        withTiming(width + 60, { duration: 1 })
      ),
      -1,
      false
    ));

    // Jellyfish gentle bob
    jelly1Y.value = withRepeat(
      withSequence(
        withTiming(-18, { duration: 2200, easing: Easing.inOut(Easing.ease) }),
        withTiming(18, { duration: 2200, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      true
    );
    jelly2Y.value = withDelay(1100, withRepeat(
      withSequence(
        withTiming(14, { duration: 2500, easing: Easing.inOut(Easing.ease) }),
        withTiming(-14, { duration: 2500, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      true
    ));

    // Turtle swimming
    turtle1X.value = withRepeat(
      withSequence(
        withTiming(width + 80, { duration: 9000, easing: Easing.linear }),
        withTiming(-80, { duration: 1 })
      ),
      -1,
      false
    );
    turtle2X.value = withDelay(4500, withRepeat(
      withSequence(
        withTiming(-80, { duration: 7500, easing: Easing.linear }),
        withTiming(width + 80, { duration: 1 })
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
  
  // Animated styles for moving fish
  const fish1Style = useAnimatedStyle(() => ({
    transform: [{ translateX: fish1X.value }],
  }));
  
  const fish2Style = useAnimatedStyle(() => ({
    transform: [{ translateX: fish2X.value }, { scaleX: -1 }],
  }));
  
  const fish3Style = useAnimatedStyle(() => ({
    transform: [{ translateX: fish3X.value }],
  }));
  
  // Animated styles for floating starfish
  const star1Style = useAnimatedStyle(() => ({
    transform: [{ translateY: star1Y.value }],
  }));
  
  const star2Style = useAnimatedStyle(() => ({
    transform: [{ translateY: star2Y.value }],
  }));
  
  // Animated styles for drifting shells
  const shell1Style = useAnimatedStyle(() => ({
    transform: [{ translateX: shell1X.value }],
  }));
  
  const shell2Style = useAnimatedStyle(() => ({
    transform: [{ translateX: shell2X.value }, { scaleX: -1 }],
  }));

  // Animated styles for jellyfish
  const jelly1Style = useAnimatedStyle(() => ({
    transform: [{ translateY: jelly1Y.value }],
  }));
  const jelly2Style = useAnimatedStyle(() => ({
    transform: [{ translateY: jelly2Y.value }],
  }));

  // Animated styles for turtles
  const turtle1Style = useAnimatedStyle(() => ({
    transform: [{ translateX: turtle1X.value }],
  }));
  const turtle2Style = useAnimatedStyle(() => ({
    transform: [{ translateX: turtle2X.value }, { scaleX: -1 }],
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
      const playStoreUrl = "https://play.google.com/store/apps/details?id=com.flipone.app";
      const message = `🎮 Flip One - Can you beat my score?\n\n⚡ Flip gravity, dodge obstacles & survive as long as you can!\n\n👉 Download free: ${playStoreUrl}`;

      await Share.share(
        Platform.OS === "ios"
          ? { title: "Flip One", message, url: playStoreUrl }
          : { title: "Flip One", message }
      );
    } catch (error) {
      console.log("Share error:", error);
    }
  };

  return (
    <LinearGradient
      colors={backgroundGradient}
      style={[styles.container, { paddingTop: insets.top + Spacing.xl }]}
    >
      {/* Moving sea creatures - crabs, fish, starfish, shells */}
      
      {/* Crabs at top and bottom edges */}
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
      
      {/* Fish swimming across screen */}
      <Animated.View style={[styles.movingCrab, { top: 130 }, fish1Style]}>
        <ArcadeFish size={40} color="#64B5F6" />
      </Animated.View>
      <Animated.View style={[styles.movingCrab, { top: 160 }, fish2Style]}>
        <ArcadeFish size={35} color="#FF7043" />
      </Animated.View>
      <Animated.View style={[styles.movingCrab, { bottom: 130 }, fish3Style]}>
        <ArcadeFish size={38} color="#4DD0E1" />
      </Animated.View>
      
      {/* Starfish floating at corners */}
      <Animated.View style={[styles.floatingDecor, { top: 70, left: 20 }, star1Style]}>
        <ArcadeStarfish size={40} color="#FFD93D" rotation={15} />
      </Animated.View>
      <Animated.View style={[styles.floatingDecor, { top: 90, right: 25 }, star2Style]}>
        <ArcadeStarfish size={35} color="#FF5722" rotation={-10} />
      </Animated.View>
      
      {/* Shells drifting slowly */}
      <Animated.View style={[styles.movingCrab, { bottom: 280 }, shell1Style]}>
        <ArcadeShell size={32} color="#E91E63" rotation={10} />
      </Animated.View>
      <Animated.View style={[styles.movingCrab, { top: 200 }, shell2Style]}>
        <ArcadeShell size={28} color="#9C27B0" rotation={-15} />
      </Animated.View>

      {/* Jellyfish bobbing at corners */}
      <Animated.View style={[styles.floatingDecor, { top: 140, left: 8 }, jelly1Style]}>
        <ArcadeJellyfish size={38} color="#CE93D8" />
      </Animated.View>
      <Animated.View style={[styles.floatingDecor, { top: 250, right: 8 }, jelly2Style]}>
        <ArcadeJellyfish size={32} color="#80DEEA" />
      </Animated.View>

      {/* Turtles swimming */}
      <Animated.View style={[styles.movingCrab, { top: 76 }, turtle1Style]}>
        <ArcadeTurtle size={42} />
      </Animated.View>
      <Animated.View style={[styles.movingCrab, { bottom: 310 }, turtle2Style]}>
        <ArcadeTurtle size={36} />
      </Animated.View>

      {/* Stats section without logo */}
      <View style={styles.statsSection}>
        <LinearGradient
          colors={[GameColors.surfaceGlass, "rgba(255,255,255,0.05)"]}
          style={styles.statsRow}
        >
          <View style={styles.statItem}>
            <View style={[styles.statIconContainer, { backgroundColor: "#FFD700" + "50" }]}>
              <Feather name="award" size={18} color={textColor} />
            </View>
            <ThemedText style={[styles.statLabel, { color: textColor }]}>BEST</ThemedText>
            <ThemedText style={[styles.statValue, { color: textColor }]}>{gameState?.bestScore || 0}</ThemedText>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <View style={[styles.statIconContainer, { backgroundColor: "#FFD700" + "50" }]}>
              <Feather name="star" size={18} color={textColor} />
            </View>
            <ThemedText style={[styles.statLabel, { color: textColor }]}>POINTS</ThemedText>
            <ThemedText style={[styles.statValue, { color: textColor }]}>
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
            <Svg width={110} height={94} viewBox="0 0 140 120">
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
                fontSize="28"
                fontWeight="900"
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
            seaCreature="fish"
            label="Wheel"
            onPress={() => navigation.navigate("LuckyWheel")}
            colors={["#FFD700", "#FFC107"]}
            iconColor="#9C27B0"
            labelColor={textColor}
          />
          <MenuButton
            seaCreature="seahorse"
            label="Settings"
            onPress={() => navigation.navigate("Settings")}
            colors={["#4CAF50", "#388E3C"]}
            iconColor="#1A1A1A"
            labelColor={textColor}
          />
          <MenuButton
            seaCreature="starfish"
            label="Achievements"
            onPress={() => navigation.navigate("Achievements")}
            colors={["#FF1493", "#E91E8C"]}
            iconColor="#2196F3"
            labelColor={textColor}
          />
        </View>
        
        <View style={styles.menuRow}>
          <MenuButton
            seaCreature="turtle"
            label="Ranks"
            onPress={() => navigation.navigate("Leaderboard")}
            colors={["#1A1A1A", "#000000"]}
            iconColor="#4CAF50"
            labelColor={textColor}
          />
          <MenuButton
            seaCreature="shell"
            label="Shop"
            onPress={() => navigation.navigate("Shop")}
            colors={["#9C27B0", "#7B1FA2"]}
            iconColor="#FFD700"
            labelColor={textColor}
          />
          <MenuButton
            seaCreature="jellyfish"
            label="Missions"
            onPress={() => navigation.navigate("Missions")}
            colors={["#2196F3", "#1976D2"]}
            iconColor="#FF1493"
            labelColor={textColor}
            badge={gameState?.dailyMissions.filter((m) => m.completed && !m.claimed).length}
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
            <Feather name="share-2" size={18} color={textColor} />
            <ThemedText style={[styles.shareButtonText, { color: textColor }]}>Share with Friends</ThemedText>
          </LinearGradient>
        </Pressable>

        <BannerAd style={{ marginTop: Spacing.sm }} />
      </Animated.View>
    </LinearGradient>
  );
}

// Sea Creature Button Icons - SVG-based Clear designs
function SeahorseIcon({ size = 24, color = "#FFFFFF" }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 100 100">
      {/* Head */}
      <Ellipse cx="50" cy="22" rx="18" ry="14" fill={color} stroke="rgba(0,0,0,0.4)" strokeWidth={2} />
      {/* Snout */}
      <Path d="M32 22 L18 20 L20 25 L32 24" fill={color} stroke="rgba(0,0,0,0.4)" strokeWidth={2} />
      {/* Eye */}
      <Circle cx="45" cy="20" r="5" fill="#FFFFFF" />
      <Circle cx="44" cy="19" r="2.5" fill="#000000" />
      {/* Crown/Crest */}
      <Path d="M55 10 Q60 5, 58 12 Q65 8, 62 15 Q68 12, 64 18" fill={color} stroke="rgba(0,0,0,0.3)" strokeWidth={1.5} />
      {/* Curved Body */}
      <Path
        d="M50 35 Q65 45, 60 60 Q55 75, 45 80 Q35 85, 38 75 Q42 65, 48 55 Q52 48, 50 35"
        fill={color}
        stroke="rgba(0,0,0,0.4)"
        strokeWidth={2}
      />
      {/* Belly segments */}
      <Path d="M48 42 Q42 44, 48 46" stroke="rgba(0,0,0,0.25)" strokeWidth={1.5} fill="none" />
      <Path d="M52 50 Q45 52, 50 55" stroke="rgba(0,0,0,0.25)" strokeWidth={1.5} fill="none" />
      <Path d="M50 60 Q43 62, 46 66" stroke="rgba(0,0,0,0.25)" strokeWidth={1.5} fill="none" />
      {/* Curled Tail */}
      <Path
        d="M38 75 Q30 80, 35 88 Q42 95, 50 90 Q55 85, 50 82 Q45 80, 42 83"
        fill="none"
        stroke={color}
        strokeWidth={6}
      />
      <Path
        d="M38 75 Q30 80, 35 88 Q42 95, 50 90 Q55 85, 50 82 Q45 80, 42 83"
        fill="none"
        stroke="rgba(0,0,0,0.3)"
        strokeWidth={2}
      />
      {/* Dorsal Fin */}
      <Path d="M62 50 Q72 45, 70 55 Q72 62, 62 58" fill={color} stroke="rgba(0,0,0,0.3)" strokeWidth={1.5} />
    </Svg>
  );
}

function FishIcon({ size = 24, color = "#FFFFFF" }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 100 100">
      <Path
        d="M80 50 Q60 25, 30 40 Q10 50, 30 60 Q60 75, 80 50 Z"
        fill={color}
        stroke="rgba(0,0,0,0.3)"
        strokeWidth={3}
      />
      <Path d="M15 50 L5 35 L5 65 Z" fill={color} stroke="rgba(0,0,0,0.3)" strokeWidth={2} />
      <Circle cx="65" cy="48" r="6" fill="#FFFFFF" />
      <Circle cx="66" cy="48" r="3" fill="#000000" />
      <Path d="M45 35 Q50 20, 55 35" fill={color} stroke="rgba(0,0,0,0.2)" strokeWidth={2} />
    </Svg>
  );
}

function TurtleIcon({ size = 24, color = "#FFFFFF" }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 100 100">
      <Ellipse cx="50" cy="50" rx="30" ry="25" fill={color} stroke="rgba(0,0,0,0.3)" strokeWidth={3} />
      <Path d="M50 30 L50 70" stroke="rgba(0,0,0,0.2)" strokeWidth={2} />
      <Path d="M25 50 L75 50" stroke="rgba(0,0,0,0.2)" strokeWidth={2} />
      <Ellipse cx="20" cy="45" rx="12" ry="8" fill={color} stroke="rgba(0,0,0,0.3)" strokeWidth={2} />
      <Circle cx="16" cy="43" r="3" fill="#000000" />
      <Ellipse cx="25" cy="72" rx="10" ry="6" fill={color} stroke="rgba(0,0,0,0.2)" strokeWidth={2} />
      <Ellipse cx="75" cy="72" rx="10" ry="6" fill={color} stroke="rgba(0,0,0,0.2)" strokeWidth={2} />
      <Ellipse cx="30" cy="30" rx="8" ry="5" fill={color} stroke="rgba(0,0,0,0.2)" strokeWidth={2} />
      <Ellipse cx="70" cy="30" rx="8" ry="5" fill={color} stroke="rgba(0,0,0,0.2)" strokeWidth={2} />
      <Path d="M80 50 L90 50" stroke={color} strokeWidth={5} />
    </Svg>
  );
}

function ShellButtonIcon({ size = 24, color = "#FFFFFF" }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 100 100">
      <Path
        d="M50 10 Q80 20, 85 50 Q85 80, 50 90 Q15 80, 15 50 Q20 20, 50 10 Z"
        fill={color}
        stroke="rgba(0,0,0,0.3)"
        strokeWidth={3}
      />
      <Path d="M50 15 Q50 50, 50 85" stroke="rgba(0,0,0,0.2)" strokeWidth={2} fill="none" />
      <Path d="M30 25 Q40 50, 35 80" stroke="rgba(0,0,0,0.15)" strokeWidth={2} fill="none" />
      <Path d="M70 25 Q60 50, 65 80" stroke="rgba(0,0,0,0.15)" strokeWidth={2} fill="none" />
    </Svg>
  );
}

function CrabButtonIcon({ size = 24, color = "#FFFFFF" }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 100 100">
      <Circle cx="50" cy="55" r="25" fill={color} stroke="rgba(0,0,0,0.3)" strokeWidth={3} />
      <Circle cx="40" cy="50" r="6" fill="#FFFFFF" />
      <Circle cx="60" cy="50" r="6" fill="#FFFFFF" />
      <Circle cx="40" cy="50" r="3" fill="#000000" />
      <Circle cx="60" cy="50" r="3" fill="#000000" />
      <Path d="M15 50 Q5 45, 10 35 Q15 25, 25 40" fill={color} stroke="rgba(0,0,0,0.3)" strokeWidth={2} />
      <Path d="M85 50 Q95 45, 90 35 Q85 25, 75 40" fill={color} stroke="rgba(0,0,0,0.3)" strokeWidth={2} />
      <Path d="M30 75 L20 90" stroke="rgba(0,0,0,0.3)" strokeWidth={3} />
      <Path d="M40 78 L35 93" stroke="rgba(0,0,0,0.3)" strokeWidth={3} />
      <Path d="M60 78 L65 93" stroke="rgba(0,0,0,0.3)" strokeWidth={3} />
      <Path d="M70 75 L80 90" stroke="rgba(0,0,0,0.3)" strokeWidth={3} />
    </Svg>
  );
}

function JellyfishIcon({ size = 24, color = "#FFFFFF" }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 100 100">
      <Path
        d="M20 45 Q20 15, 50 15 Q80 15, 80 45 Q80 55, 50 55 Q20 55, 20 45 Z"
        fill={color}
        stroke="rgba(0,0,0,0.3)"
        strokeWidth={3}
      />
      <Circle cx="35" cy="35" r="5" fill="#FFFFFF" />
      <Circle cx="65" cy="35" r="5" fill="#FFFFFF" />
      <Circle cx="35" cy="35" r="2" fill="#000000" />
      <Circle cx="65" cy="35" r="2" fill="#000000" />
      <Path d="M30 55 Q25 70, 30 85" stroke={color} strokeWidth={4} fill="none" />
      <Path d="M42 55 Q47 75, 42 90" stroke={color} strokeWidth={4} fill="none" />
      <Path d="M58 55 Q53 75, 58 90" stroke={color} strokeWidth={4} fill="none" />
      <Path d="M70 55 Q75 70, 70 85" stroke={color} strokeWidth={4} fill="none" />
    </Svg>
  );
}

function StarfishButtonIcon({ size = 24, color = "#FFFFFF" }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 100 100">
      <Path
        d="M50 5 L58 35 L90 35 L65 55 L75 90 L50 70 L25 90 L35 55 L10 35 L42 35 Z"
        fill={color}
        stroke="rgba(0,0,0,0.3)"
        strokeWidth={3}
      />
      <Circle cx="50" cy="50" r="8" fill="rgba(0,0,0,0.15)" />
      <Circle cx="35" cy="40" r="3" fill="rgba(255,255,255,0.5)" />
      <Circle cx="65" cy="40" r="3" fill="rgba(255,255,255,0.5)" />
    </Svg>
  );
}

type SeaCreatureType = 'seahorse' | 'fish' | 'turtle' | 'shell' | 'crab' | 'starfish' | 'jellyfish';

interface MenuButtonProps {
  seaCreature: SeaCreatureType;
  label: string;
  onPress: () => void;
  colors: readonly [string, string, ...string[]];
  badge?: number;
  iconColor?: string;
  labelColor?: string;
}

function MenuButton({ seaCreature, label, onPress, colors, badge, iconColor = "#FFFFFF", labelColor = "#000000" }: MenuButtonProps) {
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
          {seaCreature === 'seahorse' ? <SeahorseIcon size={34} color={iconColor} /> : null}
          {seaCreature === 'fish' ? <FishIcon size={34} color={iconColor} /> : null}
          {seaCreature === 'turtle' ? <TurtleIcon size={34} color={iconColor} /> : null}
          {seaCreature === 'shell' ? <ShellButtonIcon size={34} color={iconColor} /> : null}
          {seaCreature === 'crab' ? <CrabButtonIcon size={34} color={iconColor} /> : null}
          {seaCreature === 'starfish' ? <StarfishButtonIcon size={34} color={iconColor} /> : null}
          {seaCreature === 'jellyfish' ? <JellyfishIcon size={34} color={iconColor} /> : null}
          {badge && badge > 0 ? (
            <View style={styles.badge}>
              <ThemedText style={styles.badgeText}>{badge}</ThemedText>
            </View>
          ) : null}
        </LinearGradient>
      </View>
      <ThemedText numberOfLines={1} style={[styles.menuButtonLabel, { color: labelColor }]}>{label}</ThemedText>
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
  floatingDecor: {
    position: "absolute",
    zIndex: 1,
  },
  statsSection: {
    alignItems: "center",
    paddingTop: Spacing.sm,
    marginBottom: Spacing.xs,
  },
  titleText: {
    fontSize: 36,
    fontFamily: "Tajawal_800ExtraBold",
    color: "#000000",
    letterSpacing: 6,
  },
  titleUnderline: {
    width: 100,
    height: 4,
    backgroundColor: "#9C27B0",
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
    color: "#000000",
    letterSpacing: 1,
    marginTop: Spacing.xs,
    fontWeight: "600",
  },
  statValue: {
    fontSize: 24,
    fontWeight: "800",
    color: "#000000",
  },
  statDivider: {
    width: 1,
    height: 50,
    backgroundColor: "rgba(255,255,255,0.2)",
  },
  centerSection: {
    justifyContent: "center",
    alignItems: "center",
    marginTop: Spacing.md,
    marginBottom: Spacing.md,
    paddingVertical: Spacing.sm,
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
    paddingTop: Spacing.md,
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
    fontSize: 12,
    color: "#000000",
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
    color: "#000000",
    fontWeight: "600",
  },
});
