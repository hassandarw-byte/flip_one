import { Platform } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

const IS_DEVELOPMENT_BUILD = false;

export const PRODUCT_IDS = {
  REMOVE_ADS: "com.flipone.remove_ads",
  SHADOW_KNIGHT: "com.flipone.skin.dark_knight",
  WEB_SPINNER: "com.flipone.skin.web_hero",
  FOREST_TITAN: "com.flipone.skin.green_giant",
  STEEL_GUARDIAN: "com.flipone.skin.iron_armor",
  FROST_QUEEN: "com.flipone.skin.ice_queen",
  KAWAII_CAT: "com.flipone.skin.kawaii_cat",
  STAR_COMMANDER: "com.flipone.skin.captain_star",
  POINTS_100: "com.flipone.points.100",
  POINTS_500: "com.flipone.points.500",
  POINTS_1000: "com.flipone.points.1000",
};

export interface Product {
  productId: string;
  title: string;
  description: string;
  price: string;
  priceAmount: number;
  currency: string;
}

export interface PurchaseResult {
  success: boolean;
  productId?: string;
  transactionId?: string;
  error?: string;
}

const PURCHASED_PRODUCTS_KEY = "flip_one_purchased_products";

let purchaseConnection: any = null;
let products: Product[] = [];

export const initializePurchases = async (): Promise<boolean> => {
  if (!IS_DEVELOPMENT_BUILD) {
    console.log("IAP: Running in Expo Go - purchases disabled");
    return true;
  }

  try {
    const InAppPurchases = require("expo-in-app-purchases");
    
    await InAppPurchases.connectAsync();
    purchaseConnection = InAppPurchases;

    InAppPurchases.setPurchaseListener(({ responseCode, results, errorCode }: any) => {
      if (responseCode === InAppPurchases.IAPResponseCode.OK) {
        results.forEach((purchase: any) => {
          if (!purchase.acknowledged) {
            InAppPurchases.finishTransactionAsync(purchase, true);
          }
        });
      }
    });

    console.log("IAP initialized successfully");
    return true;
  } catch (error) {
    console.log("IAP initialization failed:", error);
    return false;
  }
};

export const getProducts = async (): Promise<Product[]> => {
  if (!IS_DEVELOPMENT_BUILD) {
    return getMockProducts();
  }

  try {
    const InAppPurchases = require("expo-in-app-purchases");
    
    const { responseCode, results } = await InAppPurchases.getProductsAsync(
      Object.values(PRODUCT_IDS)
    );

    if (responseCode === InAppPurchases.IAPResponseCode.OK && results) {
      products = results.map((product: any) => ({
        productId: product.productId,
        title: product.title,
        description: product.description,
        price: product.price,
        priceAmount: product.priceAmountMicros / 1000000,
        currency: product.priceCurrencyCode,
      }));
      return products;
    }

    return [];
  } catch (error) {
    console.log("Failed to get products:", error);
    return getMockProducts();
  }
};

export const purchaseProduct = async (productId: string): Promise<PurchaseResult> => {
  if (!IS_DEVELOPMENT_BUILD) {
    console.log("IAP: Simulating purchase for", productId);
    await savePurchasedProduct(productId);
    return {
      success: true,
      productId,
      transactionId: `mock_${Date.now()}`,
    };
  }

  try {
    const InAppPurchases = require("expo-in-app-purchases");
    
    await InAppPurchases.purchaseItemAsync(productId);
    
    await savePurchasedProduct(productId);
    
    return {
      success: true,
      productId,
    };
  } catch (error: any) {
    console.log("Purchase failed:", error);
    return {
      success: false,
      error: error.message || "Purchase failed",
    };
  }
};

export const restorePurchases = async (): Promise<string[]> => {
  if (!IS_DEVELOPMENT_BUILD) {
    console.log("IAP: Simulating restore purchases");
    return await getPurchasedProducts();
  }

  try {
    const InAppPurchases = require("expo-in-app-purchases");
    
    const { responseCode, results } = await InAppPurchases.getPurchaseHistoryAsync();
    
    if (responseCode === InAppPurchases.IAPResponseCode.OK && results) {
      const purchasedIds = results.map((purchase: any) => purchase.productId);
      
      for (const productId of purchasedIds) {
        await savePurchasedProduct(productId);
      }
      
      return purchasedIds;
    }
    
    return [];
  } catch (error) {
    console.log("Failed to restore purchases:", error);
    return [];
  }
};

export const disconnectPurchases = async (): Promise<void> => {
  if (!IS_DEVELOPMENT_BUILD || !purchaseConnection) return;

  try {
    const InAppPurchases = require("expo-in-app-purchases");
    await InAppPurchases.disconnectAsync();
    purchaseConnection = null;
  } catch (error) {
    console.log("Failed to disconnect IAP:", error);
  }
};

export const savePurchasedProduct = async (productId: string): Promise<void> => {
  try {
    const purchased = await getPurchasedProducts();
    if (!purchased.includes(productId)) {
      purchased.push(productId);
      await AsyncStorage.setItem(PURCHASED_PRODUCTS_KEY, JSON.stringify(purchased));
    }
  } catch (error) {
    console.log("Failed to save purchased product:", error);
  }
};

export const getPurchasedProducts = async (): Promise<string[]> => {
  try {
    const data = await AsyncStorage.getItem(PURCHASED_PRODUCTS_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.log("Failed to get purchased products:", error);
    return [];
  }
};

export const hasProduct = async (productId: string): Promise<boolean> => {
  const purchased = await getPurchasedProducts();
  return purchased.includes(productId);
};

export const hasRemovedAds = async (): Promise<boolean> => {
  return await hasProduct(PRODUCT_IDS.REMOVE_ADS);
};

const getMockProducts = (): Product[] => [
  {
    productId: PRODUCT_IDS.REMOVE_ADS,
    title: "Remove Ads",
    description: "Remove all ads permanently",
    price: "$0.99",
    priceAmount: 0.99,
    currency: "USD",
  },
  {
    productId: PRODUCT_IDS.SHADOW_KNIGHT,
    title: "Shadow Knight",
    description: "Dark purple/gray themed character",
    price: "$0.99",
    priceAmount: 0.99,
    currency: "USD",
  },
  {
    productId: PRODUCT_IDS.WEB_SPINNER,
    title: "Web Spinner",
    description: "Red/blue themed character",
    price: "$0.99",
    priceAmount: 0.99,
    currency: "USD",
  },
  {
    productId: PRODUCT_IDS.FOREST_TITAN,
    title: "Forest Titan",
    description: "Forest green themed character",
    price: "$0.99",
    priceAmount: 0.99,
    currency: "USD",
  },
  {
    productId: PRODUCT_IDS.STEEL_GUARDIAN,
    title: "Steel Guardian",
    description: "Red/gold themed character",
    price: "$0.99",
    priceAmount: 0.99,
    currency: "USD",
  },
  {
    productId: PRODUCT_IDS.FROST_QUEEN,
    title: "Frost Queen",
    description: "Cyan/blue themed character",
    price: "$0.99",
    priceAmount: 0.99,
    currency: "USD",
  },
  {
    productId: PRODUCT_IDS.KAWAII_CAT,
    title: "Kawaii Cat",
    description: "Pink themed character",
    price: "$0.99",
    priceAmount: 0.99,
    currency: "USD",
  },
  {
    productId: PRODUCT_IDS.STAR_COMMANDER,
    title: "Star Commander",
    description: "Navy/red themed character",
    price: "$0.99",
    priceAmount: 0.99,
    currency: "USD",
  },
  {
    productId: PRODUCT_IDS.POINTS_100,
    title: "100 Points",
    description: "Get 100 points",
    price: "$0.99",
    priceAmount: 0.99,
    currency: "USD",
  },
  {
    productId: PRODUCT_IDS.POINTS_500,
    title: "500 Points",
    description: "Get 500 points",
    price: "$3.99",
    priceAmount: 3.99,
    currency: "USD",
  },
  {
    productId: PRODUCT_IDS.POINTS_1000,
    title: "1000 Points",
    description: "Get 1000 points",
    price: "$6.99",
    priceAmount: 6.99,
    currency: "USD",
  },
];
