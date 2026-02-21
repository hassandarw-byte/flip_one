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

export const isAdMobAvailable = () => false;

export const getAdUnitId = (type: "REWARDED" | "INTERSTITIAL" | "BANNER") => {
  if (__DEV__) {
    return TEST_AD_UNIT_IDS[type];
  }
  return AD_UNIT_IDS[type];
};

let rewardedAd: any = null;
let interstitialAd: any = null;

export const initializeAds = async () => {
  console.log("AdMob: Not available in this build");
  return;
};

export const loadRewardedAd = async (): Promise<boolean> => {
  console.log("AdMob: Simulating rewarded ad load");
  return true;
};

export const showRewardedAd = async (): Promise<boolean> => {
  console.log("AdMob: Simulating rewarded ad show");
  return new Promise((resolve) => {
    setTimeout(() => resolve(true), 2000);
  });
};

export const loadInterstitialAd = async (): Promise<boolean> => {
  console.log("AdMob: Simulating interstitial ad load");
  return true;
};

export const showInterstitialAd = async (): Promise<boolean> => {
  console.log("AdMob: Simulating interstitial ad show");
  return new Promise((resolve) => {
    setTimeout(() => resolve(true), 1500);
  });
};
