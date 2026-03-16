import React, { createContext, useContext } from "react";
import { Platform } from "react-native";
import Purchases from "react-native-purchases";
import { useMutation, useQuery } from "@tanstack/react-query";
import Constants from "expo-constants";

const REVENUECAT_TEST_API_KEY = process.env.EXPO_PUBLIC_REVENUECAT_TEST_API_KEY;
const REVENUECAT_IOS_API_KEY = process.env.EXPO_PUBLIC_REVENUECAT_IOS_API_KEY;
const REVENUECAT_ANDROID_API_KEY = process.env.EXPO_PUBLIC_REVENUECAT_ANDROID_API_KEY;

export const REVENUECAT_ENTITLEMENT_NO_ADS = "no_ads";

// Package lookup keys (from seed script)
export const PACKAGE_REMOVE_ADS = "$rc_lifetime";
export const PACKAGE_STARTER_PACK = "starter_pack";
export const PACKAGE_MEGA_PACK = "mega_pack";

function getRevenueCatApiKey(): string {
  if (!REVENUECAT_TEST_API_KEY || !REVENUECAT_IOS_API_KEY || !REVENUECAT_ANDROID_API_KEY) {
    throw new Error("RevenueCat Public API Keys not found");
  }

  if (__DEV__ || Platform.OS === "web" || Constants.executionEnvironment === "storeClient") {
    return REVENUECAT_TEST_API_KEY;
  }

  if (Platform.OS === "ios") return REVENUECAT_IOS_API_KEY;
  if (Platform.OS === "android") return REVENUECAT_ANDROID_API_KEY;

  return REVENUECAT_TEST_API_KEY;
}

export function initializeRevenueCat() {
  try {
    const apiKey = getRevenueCatApiKey();
    Purchases.setLogLevel(Purchases.LOG_LEVEL.DEBUG);
    Purchases.configure({ apiKey });
    console.log("RevenueCat configured successfully");
  } catch (err) {
    console.warn("RevenueCat init skipped:", err);
  }
}

function useSubscriptionContext() {
  const customerInfoQuery = useQuery({
    queryKey: ["revenuecat", "customer-info"],
    queryFn: async () => {
      const info = await Purchases.getCustomerInfo();
      return info;
    },
    staleTime: 60 * 1000,
    retry: false,
  });

  const offeringsQuery = useQuery({
    queryKey: ["revenuecat", "offerings"],
    queryFn: async () => {
      const offerings = await Purchases.getOfferings();
      return offerings;
    },
    staleTime: 300 * 1000,
    retry: false,
  });

  const purchaseMutation = useMutation({
    mutationFn: async (packageToPurchase: any) => {
      const { customerInfo } = await Purchases.purchasePackage(packageToPurchase);
      return customerInfo;
    },
    onSuccess: () => customerInfoQuery.refetch(),
  });

  const restoreMutation = useMutation({
    mutationFn: async () => {
      return Purchases.restorePurchases();
    },
    onSuccess: () => customerInfoQuery.refetch(),
  });

  const isAdsRemoved =
    customerInfoQuery.data?.entitlements.active?.[REVENUECAT_ENTITLEMENT_NO_ADS] !== undefined;

  const currentOffering = offeringsQuery.data?.current;

  const removeAdsPackage = currentOffering?.availablePackages.find(
    (p) => p.identifier === PACKAGE_REMOVE_ADS
  );
  const starterPackPackage = currentOffering?.availablePackages.find(
    (p) => p.identifier === PACKAGE_STARTER_PACK
  );
  const megaPackPackage = currentOffering?.availablePackages.find(
    (p) => p.identifier === PACKAGE_MEGA_PACK
  );

  return {
    customerInfo: customerInfoQuery.data,
    offerings: offeringsQuery.data,
    isAdsRemoved,
    isLoading: customerInfoQuery.isLoading || offeringsQuery.isLoading,
    isOfferingsLoading: offeringsQuery.isLoading,
    removeAdsPackage,
    starterPackPackage,
    megaPackPackage,
    purchase: purchaseMutation.mutateAsync,
    restore: restoreMutation.mutateAsync,
    isPurchasing: purchaseMutation.isPending,
    isRestoring: restoreMutation.isPending,
    purchaseError: purchaseMutation.error,
    restoreError: restoreMutation.error,
    refetchCustomerInfo: customerInfoQuery.refetch,
  };
}

type SubscriptionContextValue = ReturnType<typeof useSubscriptionContext>;
const Context = createContext<SubscriptionContextValue | null>(null);

export function SubscriptionProvider({ children }: { children: React.ReactNode }) {
  const value = useSubscriptionContext();
  return <Context.Provider value={value}>{children}</Context.Provider>;
}

export function useSubscription() {
  const ctx = useContext(Context);
  if (!ctx) {
    throw new Error("useSubscription must be used within a SubscriptionProvider");
  }
  return ctx;
}
