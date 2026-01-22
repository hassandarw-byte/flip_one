import { Platform } from "react-native";

const IS_DEVELOPMENT_BUILD = false;

const AD_UNIT_IDS = {
  REWARDED: Platform.select({
    android: "ca-app-pub-4988944368021582/3254576966",
    default: "ca-app-pub-4988944368021582/3254576966",
  }),
  INTERSTITIAL: Platform.select({
    android: "ca-app-pub-4988944368021582/2200693201",
    default: "ca-app-pub-4988944368021582/2200693201",
  }),
  BANNER: Platform.select({
    android: "ca-app-pub-4988944368021582/9664250251",
    default: "ca-app-pub-4988944368021582/9664250251",
  }),
};

const TEST_AD_UNIT_IDS = {
  REWARDED: Platform.select({
    android: "ca-app-pub-3940256099942544/5224354917",
    default: "ca-app-pub-3940256099942544/5224354917",
  }),
  INTERSTITIAL: Platform.select({
    android: "ca-app-pub-3940256099942544/1033173712",
    default: "ca-app-pub-3940256099942544/1033173712",
  }),
  BANNER: Platform.select({
    android: "ca-app-pub-3940256099942544/6300978111",
    default: "ca-app-pub-3940256099942544/6300978111",
  }),
};

export const getAdUnitId = (type: "REWARDED" | "INTERSTITIAL" | "BANNER") => {
  if (__DEV__) {
    return TEST_AD_UNIT_IDS[type];
  }
  return AD_UNIT_IDS[type];
};

let rewardedAd: any = null;
let interstitialAd: any = null;

export const initializeAds = async () => {
  if (!IS_DEVELOPMENT_BUILD) {
    console.log("AdMob: Running in Expo Go - ads disabled");
    return;
  }

  try {
    const mobileAds = require("react-native-google-mobile-ads").default;
    await mobileAds().initialize();
    console.log("AdMob initialized successfully");
  } catch (error) {
    console.log("AdMob initialization failed:", error);
  }
};

export const loadRewardedAd = async (): Promise<boolean> => {
  if (!IS_DEVELOPMENT_BUILD) {
    console.log("AdMob: Simulating rewarded ad load");
    return true;
  }

  try {
    const { RewardedAd, RewardedAdEventType, AdEventType } = require("react-native-google-mobile-ads");
    
    return new Promise((resolve) => {
      rewardedAd = RewardedAd.createForAdRequest(getAdUnitId("REWARDED"), {
        requestNonPersonalizedAdsOnly: true,
      });

      const unsubscribeLoaded = rewardedAd.addAdEventListener(
        RewardedAdEventType.LOADED,
        () => {
          unsubscribeLoaded();
          resolve(true);
        }
      );

      const unsubscribeError = rewardedAd.addAdEventListener(
        AdEventType.ERROR,
        (error: any) => {
          unsubscribeError();
          console.log("Rewarded ad failed to load:", error);
          resolve(false);
        }
      );

      rewardedAd.load();
    });
  } catch (error) {
    console.log("Failed to load rewarded ad:", error);
    return false;
  }
};

export const showRewardedAd = async (): Promise<boolean> => {
  if (!IS_DEVELOPMENT_BUILD) {
    console.log("AdMob: Simulating rewarded ad show");
    return new Promise((resolve) => {
      setTimeout(() => resolve(true), 2000);
    });
  }

  if (!rewardedAd) {
    const loaded = await loadRewardedAd();
    if (!loaded) return false;
  }

  try {
    const { RewardedAdEventType, AdEventType } = require("react-native-google-mobile-ads");
    
    return new Promise((resolve) => {
      const unsubscribeEarned = rewardedAd.addAdEventListener(
        RewardedAdEventType.EARNED_REWARD,
        () => {
          unsubscribeEarned();
          rewardedAd = null;
          resolve(true);
        }
      );

      const unsubscribeClosed = rewardedAd.addAdEventListener(
        AdEventType.CLOSED,
        () => {
          unsubscribeClosed();
          rewardedAd = null;
        }
      );

      rewardedAd.show();
    });
  } catch (error) {
    console.log("Failed to show rewarded ad:", error);
    return false;
  }
};

export const loadInterstitialAd = async (): Promise<boolean> => {
  if (!IS_DEVELOPMENT_BUILD) {
    console.log("AdMob: Simulating interstitial ad load");
    return true;
  }

  try {
    const { InterstitialAd, AdEventType } = require("react-native-google-mobile-ads");
    
    return new Promise((resolve) => {
      interstitialAd = InterstitialAd.createForAdRequest(getAdUnitId("INTERSTITIAL"), {
        requestNonPersonalizedAdsOnly: true,
      });

      const unsubscribeLoaded = interstitialAd.addAdEventListener(
        AdEventType.LOADED,
        () => {
          unsubscribeLoaded();
          resolve(true);
        }
      );

      const unsubscribeError = interstitialAd.addAdEventListener(
        AdEventType.ERROR,
        (error: any) => {
          unsubscribeError();
          console.log("Interstitial ad failed to load:", error);
          resolve(false);
        }
      );

      interstitialAd.load();
    });
  } catch (error) {
    console.log("Failed to load interstitial ad:", error);
    return false;
  }
};

export const showInterstitialAd = async (): Promise<boolean> => {
  if (!IS_DEVELOPMENT_BUILD) {
    console.log("AdMob: Simulating interstitial ad show");
    return new Promise((resolve) => {
      setTimeout(() => resolve(true), 1500);
    });
  }

  if (!interstitialAd) {
    const loaded = await loadInterstitialAd();
    if (!loaded) return false;
  }

  try {
    const { AdEventType } = require("react-native-google-mobile-ads");
    
    return new Promise((resolve) => {
      const unsubscribeClosed = interstitialAd.addAdEventListener(
        AdEventType.CLOSED,
        () => {
          unsubscribeClosed();
          interstitialAd = null;
          resolve(true);
        }
      );

      interstitialAd.show();
    });
  } catch (error) {
    console.log("Failed to show interstitial ad:", error);
    return false;
  }
};
