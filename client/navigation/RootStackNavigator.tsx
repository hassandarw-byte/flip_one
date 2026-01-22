import React, { useState, useEffect } from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { useFonts, Tajawal_400Regular, Tajawal_700Bold } from "@expo-google-fonts/tajawal";
import * as SplashScreenExpo from "expo-splash-screen";

import { useScreenOptions } from "@/hooks/useScreenOptions";
import { GameColors } from "@/constants/theme";

import SplashScreen from "@/screens/SplashScreen";
import HomeScreen from "@/screens/HomeScreen";
import GameScreen from "@/screens/GameScreen";
import GameOverScreen from "@/screens/GameOverScreen";
import ShopScreen from "@/screens/ShopScreen";
import MissionsScreen from "@/screens/MissionsScreen";
import LeaderboardScreen from "@/screens/LeaderboardScreen";
import SettingsScreen from "@/screens/SettingsScreen";

SplashScreenExpo.preventAutoHideAsync();

export type RootStackParamList = {
  Splash: undefined;
  Home: undefined;
  Game: undefined;
  GameOver: {
    score: number;
    bestScore: number;
    isNewBest: boolean;
  };
  Shop: undefined;
  Missions: undefined;
  Leaderboard: undefined;
  Settings: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function RootStackNavigator() {
  const screenOptions = useScreenOptions();
  const [showSplash, setShowSplash] = useState(true);
  
  const [fontsLoaded, fontError] = useFonts({
    Tajawal_400Regular,
    Tajawal_700Bold,
  });

  useEffect(() => {
    if (fontsLoaded || fontError) {
      SplashScreenExpo.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  if (!fontsLoaded && !fontError) {
    return null;
  }

  if (showSplash) {
    return <SplashScreen onComplete={() => setShowSplash(false)} />;
  }

  return (
    <Stack.Navigator
      screenOptions={{
        ...screenOptions,
        headerStyle: {
          backgroundColor: GameColors.background,
        },
        headerTintColor: GameColors.textPrimary,
        contentStyle: {
          backgroundColor: GameColors.background,
        },
      }}
    >
      <Stack.Screen
        name="Home"
        component={HomeScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="Game"
        component={GameScreen}
        options={{
          headerShown: false,
          animation: "fade",
          gestureEnabled: false,
        }}
      />
      <Stack.Screen
        name="GameOver"
        component={GameOverScreen}
        options={{
          headerShown: false,
          animation: "fade",
          presentation: "transparentModal",
          gestureEnabled: false,
        }}
      />
      <Stack.Screen
        name="Shop"
        component={ShopScreen}
        options={{
          headerTitle: "Shop",
          headerTransparent: true,
        }}
      />
      <Stack.Screen
        name="Missions"
        component={MissionsScreen}
        options={{
          headerTitle: "Daily Missions",
          headerTransparent: true,
        }}
      />
      <Stack.Screen
        name="Leaderboard"
        component={LeaderboardScreen}
        options={{
          headerTitle: "Leaderboard",
          headerTransparent: true,
        }}
      />
      <Stack.Screen
        name="Settings"
        component={SettingsScreen}
        options={{
          headerTitle: "Settings",
          headerTransparent: true,
        }}
      />
    </Stack.Navigator>
  );
}
