import React, { useEffect } from "react";
import { StyleSheet, View, ActivityIndicator, I18nManager } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import * as SplashScreen from "expo-splash-screen";
import {
  useFonts,
  Tajawal_400Regular,
  Tajawal_500Medium,
  Tajawal_700Bold,
  Tajawal_800ExtraBold,
} from "@expo-google-fonts/tajawal";

import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "@/lib/query-client";

import RootStackNavigator from "@/navigation/RootStackNavigator";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { NightModeProvider } from "@/contexts/NightModeContext";
import { initializeRevenueCat, SubscriptionProvider } from "@/lib/revenuecat";

I18nManager.allowRTL(false);
I18nManager.forceRTL(false);

initializeRevenueCat();

SplashScreen.preventAutoHideAsync();

export default function App() {
  const [fontsLoaded, fontError] = useFonts({
    Tajawal_400Regular,
    Tajawal_500Medium,
    Tajawal_700Bold,
    Tajawal_800ExtraBold,
  });

  useEffect(() => {
    if (fontsLoaded || fontError) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  if (!fontsLoaded && !fontError) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color="#4CAF50" />
      </View>
    );
  }

  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <SubscriptionProvider>
          <NightModeProvider>
            <SafeAreaProvider>
              <GestureHandlerRootView style={styles.root}>
                <NavigationContainer>
                  <RootStackNavigator />
                </NavigationContainer>
                <StatusBar style="light" />
              </GestureHandlerRootView>
            </SafeAreaProvider>
          </NightModeProvider>
        </SubscriptionProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  loading: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F5E6D3",
  },
});
