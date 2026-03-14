import React from "react";
import { View, StyleSheet, Platform } from "react-native";
import { Spacing, BorderRadius } from "@/constants/theme";
import { isAdMobAvailable, getAdUnitId } from "@/lib/ads";

interface BannerAdProps {
  style?: any;
}

let BannerAdComponent: any = null;
let BannerAdSize: any = null;

try {
  const admob = require("react-native-google-mobile-ads");
  BannerAdComponent = admob.BannerAd;
  BannerAdSize = admob.BannerAdSize;
} catch {}

export default function BannerAd({ style }: BannerAdProps) {
  if (isAdMobAvailable() && BannerAdComponent && BannerAdSize) {
    const adUnitId = getAdUnitId("BANNER")!;
    return (
      <View style={[styles.container, style]}>
        <BannerAdComponent
          unitId={adUnitId}
          size={BannerAdSize.BANNER}
          requestOptions={{ requestNonPersonalizedAdsOnly: false }}
        />
      </View>
    );
  }

  return null;
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    marginHorizontal: Spacing.lg,
    minHeight: 50,
  },
});
