import { Platform } from "react-native";

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

let MobileAds: any = null;
let RewardedAd: any = null;
let InterstitialAd: any = null;
let AdEventType: any = null;
let RewardedAdEventType: any = null;

let adsInitialized = false;
let adMobAvailable = false;

try {
  const admob = require("react-native-google-mobile-ads");
  MobileAds = admob.default;
  RewardedAd = admob.RewardedAd;
  InterstitialAd = admob.InterstitialAd;
  AdEventType = admob.AdEventType;
  RewardedAdEventType = admob.RewardedAdEventType;
  adMobAvailable = true;
} catch (e) {
  adMobAvailable = false;
}

export const isAdMobAvailable = () => adMobAvailable;

export const getAdUnitId = (type: "REWARDED" | "INTERSTITIAL" | "BANNER") => {
  return AD_UNIT_IDS[type];
};

let rewardedAd: any = null;
let interstitialAd: any = null;

export const initializeAds = async () => {
  if (!adMobAvailable || adsInitialized) return;
  try {
    await MobileAds().initialize();
    adsInitialized = true;
    console.log("AdMob: Initialized successfully");
  } catch (error) {
    console.log("AdMob: Failed to initialize", error);
  }
};

export const loadRewardedAd = async (): Promise<boolean> => {
  if (!adMobAvailable) {
    console.log("AdMob: Not available, simulating rewarded ad load");
    return true;
  }

  return new Promise((resolve) => {
    try {
      const adUnitId = AD_UNIT_IDS.REWARDED!;
      rewardedAd = RewardedAd.createForAdRequest(adUnitId);

      const loadHandler = rewardedAd.addAdEventListener(
        RewardedAdEventType.LOADED,
        () => {
          loadHandler();
          resolve(true);
        }
      );

      const errorHandler = rewardedAd.addAdEventListener(
        AdEventType.ERROR,
        (error: any) => {
          console.log("AdMob: Rewarded ad failed to load", error);
          errorHandler();
          resolve(false);
        }
      );

      rewardedAd.load();
    } catch (error) {
      console.log("AdMob: Error loading rewarded ad", error);
      resolve(false);
    }
  });
};

export const showRewardedAd = async (): Promise<boolean> => {
  if (!adMobAvailable) {
    console.log("AdMob: Not available, simulating rewarded ad show");
    return new Promise((resolve) => {
      setTimeout(() => resolve(true), 2000);
    });
  }

  if (!rewardedAd) return false;

  return new Promise((resolve) => {
    try {
      const earnedHandler = rewardedAd.addAdEventListener(
        RewardedAdEventType.EARNED_REWARD,
        () => {
          earnedHandler();
          resolve(true);
        }
      );

      const closeHandler = rewardedAd.addAdEventListener(
        AdEventType.CLOSED,
        () => {
          closeHandler();
        }
      );

      const errorHandler = rewardedAd.addAdEventListener(
        AdEventType.ERROR,
        (error: any) => {
          console.log("AdMob: Rewarded ad error", error);
          errorHandler();
          resolve(false);
        }
      );

      rewardedAd.show();
    } catch (error) {
      console.log("AdMob: Error showing rewarded ad", error);
      resolve(false);
    }
  });
};

export const loadInterstitialAd = async (): Promise<boolean> => {
  if (!adMobAvailable) {
    console.log("AdMob: Not available, simulating interstitial ad load");
    return true;
  }

  return new Promise((resolve) => {
    try {
      const adUnitId = AD_UNIT_IDS.INTERSTITIAL!;
      interstitialAd = InterstitialAd.createForAdRequest(adUnitId);

      const loadHandler = interstitialAd.addAdEventListener(
        AdEventType.LOADED,
        () => {
          loadHandler();
          resolve(true);
        }
      );

      const errorHandler = interstitialAd.addAdEventListener(
        AdEventType.ERROR,
        (error: any) => {
          console.log("AdMob: Interstitial ad failed to load", error);
          errorHandler();
          resolve(false);
        }
      );

      interstitialAd.load();
    } catch (error) {
      console.log("AdMob: Error loading interstitial ad", error);
      resolve(false);
    }
  });
};

export const showInterstitialAd = async (): Promise<boolean> => {
  if (!adMobAvailable) {
    console.log("AdMob: Not available, simulating interstitial ad show");
    return new Promise((resolve) => {
      setTimeout(() => resolve(true), 1500);
    });
  }

  if (!interstitialAd) return false;

  return new Promise((resolve) => {
    try {
      const closeHandler = interstitialAd.addAdEventListener(
        AdEventType.CLOSED,
        () => {
          closeHandler();
          resolve(true);
        }
      );

      const errorHandler = interstitialAd.addAdEventListener(
        AdEventType.ERROR,
        (error: any) => {
          console.log("AdMob: Interstitial ad error", error);
          errorHandler();
          resolve(false);
        }
      );

      interstitialAd.show();
    } catch (error) {
      console.log("AdMob: Error showing interstitial ad", error);
      resolve(false);
    }
  });
};
