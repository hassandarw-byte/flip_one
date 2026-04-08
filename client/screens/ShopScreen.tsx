import React, { useEffect, useState } from "react";
import {
  View,
  StyleSheet,
  FlatList,
  Pressable,
  Dimensions,
  ScrollView,
  Image,
  ImageSourcePropType,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHeaderHeight } from "@react-navigation/elements";
import { useNavigation } from "@react-navigation/native";
import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withRepeat,
  withSequence,
  withTiming,
  FadeInDown,
} from "react-native-reanimated";
import * as Haptics from "expo-haptics";

import { ThemedText } from "@/components/ThemedText";
import AdModal from "@/components/AdModal";
import PointsBadge from "@/components/PointsBadge";
import { GameColors, Spacing, BorderRadius } from "@/constants/theme";
import {
  getGameState,
  savePoints,
  saveOwnedSkins,
  saveOwnedPremiumSkins,
  saveEquippedSkin,
  saveEquippedPremiumSkin,
  usePower,
  GameState,
} from "@/lib/storage";
import { useNightMode } from "@/contexts/NightModeContext";
import { useSubscription, PACKAGE_REMOVE_ADS, PACKAGE_STARTER_PACK, PACKAGE_MEGA_PACK } from "@/lib/revenuecat";

const { width } = Dimensions.get("window");
const CARD_WIDTH = (width - Spacing.xl * 2 - Spacing.md) / 2;

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

interface SkinItem {
  id: string;
  name: string;
  colors: readonly [string, string, ...string[]];
  price: number;
  isPremium?: boolean;
  icon?: string;
  image?: ImageSourcePropType;
}

interface PowerItem {
  id: string;
  name: string;
  description: string;
  icon: keyof typeof Feather.glyphMap;
  colors: readonly [string, string, ...string[]];
  type: "ad" | "premium";
}

const SKINS: SkinItem[] = [
  { id: "default", name: "Golden", colors: [GameColors.player, GameColors.playerGlow], price: 0 },
  { id: "purple", name: "Royal Purple", colors: [GameColors.candy4, GameColors.primaryGlow], price: 100 },
  { id: "teal", name: "Ocean Teal", colors: [GameColors.candy2, GameColors.platformGlow], price: 150 },
  { id: "pink", name: "Cotton Candy", colors: [GameColors.candy5, GameColors.secondaryGlow], price: 150 },
  { id: "red", name: "Cherry Red", colors: [GameColors.candy1, GameColors.spikeGlow], price: 200 },
  { id: "green", name: "Lime Fresh", colors: [GameColors.candy6, GameColors.successGlow], price: 250 },
  { id: "gold", name: "Premium Gold", colors: ["#FFD700", "#B8860B"], price: 400 },
];

const PREMIUM_SKINS: SkinItem[] = [
  { id: "shadow_ninja", name: "Shadow Ninja", colors: ["#1a1a2e", "#2d1b69"], price: 1000, isPremium: true, icon: "shield", image: require("@/assets/images/shadow-ninja.png") },
  { id: "web_crawler", name: "Web Crawler", colors: ["#e67e22", "#f39c12"], price: 1500, isPremium: true, icon: "target", image: require("@/assets/images/web-crawler.png") },
  { id: "forest_spirit", name: "Forest Spirit", colors: ["#2d6a4f", "#40916c"], price: 2000, isPremium: true, icon: "zap", image: require("@/assets/images/forest-spirit.png") },
  { id: "steel_bot", name: "Steel Bot", colors: ["#b0bec5", "#ffd60a"], price: 2500, isPremium: true, icon: "cpu", image: require("@/assets/images/steel-bot.png") },
  { id: "speed_bird", name: "Speed Bird", colors: ["#1E90FF", "#4169E1"], price: 3000, isPremium: true, icon: "zap", image: require("@/assets/images/speed-bird.png") },
  { id: "cozy_bunny", name: "Cozy Bunny", colors: ["#8B4513", "#D2691E"], price: 3500, isPremium: true, icon: "smile", image: require("@/assets/images/cozy-bunny.png") },
  { id: "golden_firefly", name: "Golden Firefly", colors: ["#DC143C", "#FFD700"], price: 4000, isPremium: true, icon: "zap", image: require("@/assets/images/golden-firefly.png") },
  { id: "frost_fox", name: "Frost Fox", colors: ["#90e0ef", "#48cae4"], price: 4500, isPremium: true, icon: "star", image: require("@/assets/images/frost-fox.png") },
  { id: "sweet_kitty", name: "Sweet Kitty", colors: ["#FF69B4", "#FF1493"], price: 5000, isPremium: true, icon: "heart", image: require("@/assets/images/sweet-kitty.png") },
  { id: "purple_imp", name: "Purple Imp", colors: ["#9370DB", "#8B008B"], price: 5500, isPremium: true, icon: "zap", image: require("@/assets/images/purple-imp.png") },
  { id: "sky_eagle", name: "Sky Eagle", colors: ["#0057B8", "#FFD700"], price: 6000, isPremium: true, icon: "shield", image: require("@/assets/images/sky-eagle.png") },
  { id: "kawaii_cat", name: "Kawaii Cat", colors: ["#ffb6c1", "#ff69b4"], price: 6500, isPremium: true, icon: "heart", image: require("@/assets/images/kawaii-cat.png") },
  { id: "star_hamster", name: "Star Hamster", colors: ["#002855", "#bf0a30"], price: 7000, isPremium: true, icon: "award", image: require("@/assets/images/star-hamster.png") },
];

const SPECIAL_POWERS: PowerItem[] = [
  { 
    id: "pause_time", 
    name: "Freeze Time", 
    description: "Pause obstacles for 3 seconds",
    icon: "pause-circle",
    colors: [GameColors.candy2, GameColors.platformGlow],
    type: "ad"
  },
  { 
    id: "slow_motion", 
    name: "Slow Motion", 
    description: "Slow down speed by 50%",
    icon: "clock",
    colors: [GameColors.candy4, GameColors.primaryGlow],
    type: "ad"
  },
  { 
    id: "shield", 
    name: "Shield", 
    description: "Survive one collision",
    icon: "shield",
    colors: [GameColors.candy1, GameColors.spikeGlow],
    type: "ad"
  },
  { 
    id: "double_points", 
    name: "Double Points", 
    description: "2x points for 30 seconds",
    icon: "trending-up",
    colors: [GameColors.gold, GameColors.goldGlow],
    type: "ad"
  },
];

export default function ShopScreen() {
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const navigation = useNavigation();
  const { backgroundGradient, textColor, textSecondaryColor, textMutedColor } = useNightMode();
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [activeTab, setActiveTab] = useState<"skins" | "premium" | "powers" | "store">("skins");
  const [adModalVisible, setAdModalVisible] = useState(false);
  const [selectedPower, setSelectedPower] = useState<PowerItem | null>(null);
  const [purchaseMessage, setPurchaseMessage] = useState<string | null>(null);

  const {
    isAdsRemoved,
    removeAdsPackage,
    starterPackPackage,
    megaPackPackage,
    purchase,
    restore,
    isPurchasing,
    isRestoring,
    isOfferingsLoading,
  } = useSubscription();

  const loadGameState = async () => {
    const state = await getGameState();
    setGameState(state);
  };

  useEffect(() => {
    loadGameState();
  }, []);

  useEffect(() => {
    const unsubscribe = navigation.addListener("focus", () => {
      loadGameState();
    });
    return unsubscribe;
  }, [navigation]);

  const handlePurchase = async (skin: SkinItem) => {
    if (!gameState) return;

    if (skin.isPremium) return;

    if (gameState.ownedSkins.includes(skin.id)) {
      await saveEquippedSkin(skin.id);
      setGameState({ ...gameState, equippedSkin: skin.id });
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      return;
    }

    if (gameState.points >= skin.price) {
      const newPoints = gameState.points - skin.price;
      const newOwnedSkins = [...gameState.ownedSkins, skin.id];
      
      await savePoints(newPoints);
      await saveOwnedSkins(newOwnedSkins);
      await saveEquippedSkin(skin.id);
      
      setGameState({
        ...gameState,
        points: newPoints,
        ownedSkins: newOwnedSkins,
        equippedSkin: skin.id,
      });
      navigation.setOptions({ headerRight: () => <PointsBadge points={newPoints} /> });
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } else {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }
  };

  const handlePremiumSkinSelect = async (skin: SkinItem) => {
    if (!gameState) return;

    const isOwned = gameState.ownedPremiumSkins.includes(skin.id);

    if (isOwned) {
      const newPremiumSkin = gameState.equippedPremiumSkin === skin.id ? null : skin.id;
      await saveEquippedPremiumSkin(newPremiumSkin);
      setGameState({ ...gameState, equippedPremiumSkin: newPremiumSkin });
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      return;
    }

    if (gameState.points >= skin.price) {
      const newPoints = gameState.points - skin.price;
      const newOwnedPremiumSkins = [...gameState.ownedPremiumSkins, skin.id];
      
      await savePoints(newPoints);
      await saveOwnedPremiumSkins(newOwnedPremiumSkins);
      await saveEquippedPremiumSkin(skin.id);
      
      setGameState({
        ...gameState,
        points: newPoints,
        ownedPremiumSkins: newOwnedPremiumSkins,
        equippedPremiumSkin: skin.id,
      });
      navigation.setOptions({ headerRight: () => <PointsBadge points={newPoints} /> });
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } else {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }
  };

  const handleWatchAd = (power: PowerItem) => {
    if (!gameState) return;
    
    if (gameState.powersUsedToday.includes(power.id)) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      return;
    }

    setSelectedPower(power);
    setAdModalVisible(true);
  };

  const handleAdComplete = async () => {
    if (!gameState || !selectedPower) return;

    const success = await usePower(selectedPower.id);
    if (success) {
      setGameState({
        ...gameState,
        powersUsedToday: [...gameState.powersUsedToday, selectedPower.id],
      });
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
    setSelectedPower(null);
  };

  const handleBuyRemoveAds = async () => {
    if (!removeAdsPackage) return;
    try {
      await purchase(removeAdsPackage);
      setPurchaseMessage("Ads removed! Enjoy ad-free gameplay.");
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (e: any) {
      if (!e?.userCancelled) {
        setPurchaseMessage("Purchase failed. Please try again.");
      }
    }
  };

  const handleBuyPointsPack = async (pkg: any, pointsAmount: number) => {
    try {
      await purchase(pkg);
      if (gameState) {
        const newPoints = (gameState.points || 0) + pointsAmount;
        await savePoints(newPoints);
        setGameState({ ...gameState, points: newPoints });
      }
      setPurchaseMessage(`${pointsAmount} points added!`);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (e: any) {
      if (!e?.userCancelled) {
        setPurchaseMessage("Purchase failed. Please try again.");
      }
    }
  };

  const handleRestore = async () => {
    try {
      await restore();
      setPurchaseMessage("Purchases restored!");
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch {
      setPurchaseMessage("Restore failed. Please try again.");
    }
  };

  const renderSkinItem = ({ item, index }: { item: SkinItem; index: number }) => {
    const isOwned = gameState?.ownedSkins.includes(item.id);
    const isEquipped = gameState?.equippedSkin === item.id;
    const canAfford = (gameState?.points || 0) >= item.price;

    return (
      <Animated.View entering={FadeInDown.delay(index * 50).springify()}>
        <SkinCard
          skin={item}
          isOwned={isOwned || false}
          isEquipped={isEquipped || false}
          canAfford={canAfford}
          onPress={() => handlePurchase(item)}
          textColor={textColor}
        />
      </Animated.View>
    );
  };

  const renderPremiumItem = ({ item, index }: { item: SkinItem; index: number }) => {
    const isOwned = gameState?.ownedPremiumSkins.includes(item.id) || false;
    const isEquipped = gameState?.equippedPremiumSkin === item.id;
    const canAfford = (gameState?.points || 0) >= item.price;
    return (
      <Animated.View entering={FadeInDown.delay(index * 50).springify()}>
        <PremiumSkinCard 
          skin={item} 
          isOwned={isOwned}
          isEquipped={isEquipped || false}
          canAfford={canAfford}
          onPress={() => handlePremiumSkinSelect(item)}
          textColor={textColor}
        />
      </Animated.View>
    );
  };

  return (
    <LinearGradient
      colors={backgroundGradient}
      style={[styles.container, { paddingTop: headerHeight + Spacing.lg }]}
    >
      {purchaseMessage ? (
        <Pressable
          style={styles.purchaseMessageBanner}
          onPress={() => setPurchaseMessage(null)}
        >
          <LinearGradient
            colors={[GameColors.success, GameColors.successGlow]}
            style={styles.purchaseMessageGradient}
          >
            <Feather name="check-circle" size={16} color="#FFFFFF" />
            <ThemedText style={styles.purchaseMessageText}>{purchaseMessage}</ThemedText>
          </LinearGradient>
        </Pressable>
      ) : null}

      <View style={styles.tabs}>
        <TabButton
          label="Skins"
          isActive={activeTab === "skins"}
          onPress={() => setActiveTab("skins")}
          textSecondaryColor={textSecondaryColor}
        />
        <TabButton
          label="Premium"
          isActive={activeTab === "premium"}
          onPress={() => setActiveTab("premium")}
          textSecondaryColor={textSecondaryColor}
        />
        <TabButton
          label="Powers"
          isActive={activeTab === "powers"}
          onPress={() => setActiveTab("powers")}
          textSecondaryColor={textSecondaryColor}
        />
        <TabButton
          label="Store"
          isActive={activeTab === "store"}
          onPress={() => setActiveTab("store")}
          textSecondaryColor={textSecondaryColor}
        />
      </View>

      {activeTab === "skins" ? (
        <FlatList
          data={SKINS}
          renderItem={renderSkinItem}
          keyExtractor={(item) => item.id}
          numColumns={2}
          columnWrapperStyle={styles.row}
          contentContainerStyle={[
            styles.listContent,
            { paddingBottom: insets.bottom + Spacing.xl },
          ]}
          showsVerticalScrollIndicator={false}
        />
      ) : activeTab === "premium" ? (
        <FlatList
          data={PREMIUM_SKINS}
          renderItem={renderPremiumItem}
          keyExtractor={(item) => item.id}
          numColumns={2}
          columnWrapperStyle={styles.row}
          contentContainerStyle={[
            styles.listContent,
            { paddingBottom: insets.bottom + Spacing.xl },
          ]}
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={
            <View style={styles.premiumHeader}>
              <ThemedText style={[styles.premiumTitle, { color: textColor }]}>Character Skins</ThemedText>
              <ThemedText style={[styles.premiumSubtitle, { color: textMutedColor }]}>
                Unlock exclusive character designs
              </ThemedText>
            </View>
          }
        />
      ) : activeTab === "powers" ? (
        <ScrollView
          contentContainerStyle={[
            styles.powersContent,
            { paddingBottom: insets.bottom + Spacing.xl },
          ]}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.premiumHeader}>
            <ThemedText style={[styles.premiumTitle, { color: textColor }]}>Special Powers</ThemedText>
            <ThemedText style={[styles.premiumSubtitle, { color: textMutedColor }]}>
              Watch ads to unlock game-changing abilities
            </ThemedText>
          </View>
          {SPECIAL_POWERS.map((power, index) => (
            <Animated.View key={power.id} entering={FadeInDown.delay(index * 80).springify()}>
              <PowerCard 
                power={power} 
                usedToday={gameState?.powersUsedToday.includes(power.id) || false}
                onWatchAd={() => handleWatchAd(power)}
                textColor={textColor}
                textMutedColor={textMutedColor}
              />
            </Animated.View>
          ))}
        </ScrollView>
      ) : (
        <ScrollView
          contentContainerStyle={[
            styles.powersContent,
            { paddingBottom: insets.bottom + Spacing.xl },
          ]}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.premiumHeader}>
            <ThemedText style={[styles.premiumTitle, { color: textColor }]}>In-App Store</ThemedText>
            <ThemedText style={[styles.premiumSubtitle, { color: textMutedColor }]}>
              Support the game & unlock more
            </ThemedText>
          </View>

          {/* Remove Ads */}
          <Animated.View entering={FadeInDown.delay(0).springify()} style={styles.iapCard}>
            <LinearGradient
              colors={[GameColors.surfaceLight, GameColors.surface]}
              style={styles.iapCardGradient}
            >
              <LinearGradient
                colors={["#FF5722", "#FF8A65"]}
                style={styles.iapIcon}
              >
                <Feather name="shield-off" size={28} color="#FFFFFF" />
              </LinearGradient>
              <View style={styles.iapInfo}>
                <ThemedText style={[styles.iapTitle, { color: textColor }]}>Remove Ads</ThemedText>
                <ThemedText style={[styles.iapDesc, { color: textMutedColor }]}>
                  Play without any ads, forever
                </ThemedText>
              </View>
              {isAdsRemoved ? (
                <View style={styles.iapOwnedBadge}>
                  <Feather name="check" size={14} color="#FFFFFF" />
                  <ThemedText style={styles.iapOwnedText}>Active</ThemedText>
                </View>
              ) : (
                <Pressable
                  style={[styles.iapBuyButton, isPurchasing && { opacity: 0.6 }]}
                  onPress={handleBuyRemoveAds}
                  disabled={isPurchasing || isOfferingsLoading}
                  testID="button-buy-remove-ads"
                >
                  <LinearGradient
                    colors={["#FF5722", "#FF8A65"]}
                    style={styles.iapBuyGradient}
                  >
                    <ThemedText style={styles.iapBuyText}>
                      {isOfferingsLoading ? "..." : removeAdsPackage?.product.priceString ?? "$0.99"}
                    </ThemedText>
                  </LinearGradient>
                </Pressable>
              )}
            </LinearGradient>
          </Animated.View>

          {/* Starter Pack */}
          <Animated.View entering={FadeInDown.delay(80).springify()} style={styles.iapCard}>
            <LinearGradient
              colors={[GameColors.surfaceLight, GameColors.surface]}
              style={styles.iapCardGradient}
            >
              <LinearGradient
                colors={[GameColors.candy4, GameColors.primaryGlow]}
                style={styles.iapIcon}
              >
                <Feather name="star" size={28} color="#FFFFFF" />
              </LinearGradient>
              <View style={styles.iapInfo}>
                <ThemedText style={[styles.iapTitle, { color: textColor }]}>Starter Pack</ThemedText>
                <ThemedText style={[styles.iapDesc, { color: textMutedColor }]}>
                  Get 500 points instantly
                </ThemedText>
              </View>
              <Pressable
                style={[styles.iapBuyButton, isPurchasing && { opacity: 0.6 }]}
                onPress={() => starterPackPackage && handleBuyPointsPack(starterPackPackage, 500)}
                disabled={isPurchasing || isOfferingsLoading || !starterPackPackage}
                testID="button-buy-starter-pack"
              >
                <LinearGradient
                  colors={[GameColors.candy4, GameColors.primaryGlow]}
                  style={styles.iapBuyGradient}
                >
                  <ThemedText style={styles.iapBuyText}>
                    {isOfferingsLoading ? "..." : starterPackPackage?.product.priceString ?? "$0.99"}
                  </ThemedText>
                </LinearGradient>
              </Pressable>
            </LinearGradient>
          </Animated.View>

          {/* Mega Pack */}
          <Animated.View entering={FadeInDown.delay(160).springify()} style={styles.iapCard}>
            <LinearGradient
              colors={[GameColors.surfaceLight, GameColors.surface]}
              style={styles.iapCardGradient}
            >
              <LinearGradient
                colors={[GameColors.gold, GameColors.goldGlow]}
                style={styles.iapIcon}
              >
                <Feather name="zap" size={28} color="#FFFFFF" />
              </LinearGradient>
              <View style={styles.iapInfo}>
                <ThemedText style={[styles.iapTitle, { color: textColor }]}>Mega Pack</ThemedText>
                <ThemedText style={[styles.iapDesc, { color: textMutedColor }]}>
                  Get 1500 points instantly
                </ThemedText>
              </View>
              <Pressable
                style={[styles.iapBuyButton, isPurchasing && { opacity: 0.6 }]}
                onPress={() => megaPackPackage && handleBuyPointsPack(megaPackPackage, 1500)}
                disabled={isPurchasing || isOfferingsLoading || !megaPackPackage}
                testID="button-buy-mega-pack"
              >
                <LinearGradient
                  colors={[GameColors.gold, GameColors.goldGlow]}
                  style={styles.iapBuyGradient}
                >
                  <ThemedText style={styles.iapBuyText}>
                    {isOfferingsLoading ? "..." : megaPackPackage?.product.priceString ?? "$2.99"}
                  </ThemedText>
                </LinearGradient>
              </Pressable>
            </LinearGradient>
          </Animated.View>

          {/* Restore Purchases */}
          <Pressable
            style={[styles.restoreButton, isRestoring && { opacity: 0.6 }]}
            onPress={handleRestore}
            disabled={isRestoring}
            testID="button-restore-purchases"
          >
            <ThemedText style={[styles.restoreText, { color: textMutedColor }]}>
              {isRestoring ? "Restoring..." : "Restore Purchases"}
            </ThemedText>
          </Pressable>
        </ScrollView>
      )}

      <AdModal
        visible={adModalVisible}
        onClose={() => setAdModalVisible(false)}
        onComplete={handleAdComplete}
        rewardName={selectedPower?.name || "Power"}
      />
    </LinearGradient>
  );
}

interface TabButtonProps {
  label: string;
  isActive: boolean;
  onPress: () => void;
  textSecondaryColor: string;
}

function TabButton({ label, isActive, onPress, textSecondaryColor }: TabButtonProps) {
  return (
    <Pressable
      style={[styles.tab, isActive && styles.tabActive]}
      onPress={onPress}
    >
      {isActive ? (
        <LinearGradient
          colors={[GameColors.primary, GameColors.primaryGlow]}
          style={styles.tabGradient}
        >
          <ThemedText style={styles.tabTextActive}>{label}</ThemedText>
        </LinearGradient>
      ) : (
        <ThemedText style={[styles.tabText, { color: textSecondaryColor }]}>{label}</ThemedText>
      )}
    </Pressable>
  );
}

interface SkinCardProps {
  skin: SkinItem;
  isOwned: boolean;
  isEquipped: boolean;
  canAfford: boolean;
  onPress: () => void;
  textColor: string;
}

function SkinCard({
  skin,
  isOwned,
  isEquipped,
  canAfford,
  onPress,
  textColor,
}: SkinCardProps) {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <AnimatedPressable
      style={[styles.skinCard, isEquipped && styles.skinCardEquipped, animatedStyle]}
      onPress={onPress}
      onPressIn={() => {
        scale.value = withSpring(0.95, { damping: 15 });
      }}
      onPressOut={() => {
        scale.value = withSpring(1, { damping: 10 });
      }}
      testID={`skin-${skin.id}`}
    >
      <LinearGradient
        colors={[GameColors.surfaceLight, GameColors.surface]}
        style={styles.skinCardGradient}
      >
        <View style={styles.skinPreviewContainer}>
          <LinearGradient
            colors={skin.colors}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.skinPreview}
          />
          {isEquipped ? (
            <View style={styles.equippedBadge}>
              <Feather name="check" size={14} color="#FFFFFF" />
            </View>
          ) : null}
        </View>

        <ThemedText style={[styles.skinName, { color: textColor }]}>{skin.name}</ThemedText>

        {isOwned ? (
          <View style={styles.ownedBadge}>
            <ThemedText style={styles.ownedText}>
              {isEquipped ? "Equipped" : "Owned"}
            </ThemedText>
          </View>
        ) : (
          <View style={[styles.priceTag, !canAfford && styles.priceTagDisabled]}>
            <Feather name="star" size={12} color="#FFD700" />
            <ThemedText style={styles.priceText}>{skin.price}</ThemedText>
          </View>
        )}
      </LinearGradient>
    </AnimatedPressable>
  );
}

interface PremiumSkinCardProps {
  skin: SkinItem;
  isOwned: boolean;
  isEquipped: boolean;
  canAfford: boolean;
  onPress: () => void;
  textColor: string;
}

function PremiumSkinCard({ skin, isOwned, isEquipped, canAfford, onPress, textColor }: PremiumSkinCardProps) {
  const scale = useSharedValue(1);
  const glow = useSharedValue(0.5);

  useEffect(() => {
    glow.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 1000 }),
        withTiming(0.5, { duration: 1000 })
      ),
      -1,
      true
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const glowStyle = useAnimatedStyle(() => ({
    opacity: glow.value,
  }));

  return (
    <AnimatedPressable
      style={[styles.skinCard, isEquipped && styles.skinCardEquipped, animatedStyle]}
      onPress={onPress}
      onPressIn={() => {
        scale.value = withSpring(0.95, { damping: 15 });
      }}
      onPressOut={() => {
        scale.value = withSpring(1, { damping: 10 });
      }}
      testID={`premium-skin-${skin.id}`}
    >
      <LinearGradient
        colors={[GameColors.surfaceLight, GameColors.surface]}
        style={styles.skinCardGradient}
      >
        <View style={styles.skinPreviewContainer}>
          <Animated.View style={[styles.premiumGlow, glowStyle]}>
            <LinearGradient
              colors={[...skin.colors, "transparent"]}
              style={styles.premiumGlowGradient}
            />
          </Animated.View>
          {skin.image ? (
            <View style={styles.characterImageContainer}>
              <Image source={skin.image} style={styles.characterImage} />
            </View>
          ) : (
            <LinearGradient
              colors={skin.colors}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.skinPreview}
            >
              {skin.icon ? (
                <Feather name={skin.icon as any} size={24} color="#FFFFFF" />
              ) : null}
            </LinearGradient>
          )}
          {isEquipped ? (
            <View style={styles.equippedBadge}>
              <Feather name="check" size={14} color="#FFFFFF" />
            </View>
          ) : null}
        </View>

        <ThemedText style={[styles.skinName, { color: textColor }]}>{skin.name}</ThemedText>

        {isEquipped ? (
          <View style={styles.ownedBadge}>
            <ThemedText style={styles.ownedText}>Equipped</ThemedText>
          </View>
        ) : isOwned ? (
          <LinearGradient
            colors={[GameColors.success, GameColors.successGlow]}
            style={styles.premiumPriceTag}
          >
            <Feather name="check" size={12} color="#FFFFFF" />
            <ThemedText style={styles.premiumPriceText}>Select</ThemedText>
          </LinearGradient>
        ) : (
          <View
            style={[styles.premiumPriceTag, !canAfford && { opacity: 0.5 }]}
          >
            <Feather name="star" size={12} color="#FFD700" />
            <ThemedText style={styles.premiumPriceText}>{skin.price}</ThemedText>
          </View>
        )}
      </LinearGradient>
    </AnimatedPressable>
  );
}

interface PowerCardProps {
  power: PowerItem;
  usedToday: boolean;
  onWatchAd: () => void;
  textColor: string;
  textMutedColor: string;
}

function PowerCard({ power, usedToday, onWatchAd, textColor, textMutedColor }: PowerCardProps) {
  const scale = useSharedValue(1);
  const glow = useSharedValue(0.5);

  useEffect(() => {
    glow.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 1200 }),
        withTiming(0.5, { duration: 1200 })
      ),
      -1,
      true
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <AnimatedPressable
      style={[styles.powerCard, animatedStyle, usedToday && styles.powerCardUsed]}
      onPress={onWatchAd}
      disabled={usedToday}
      onPressIn={() => {
        scale.value = withSpring(0.98, { damping: 15 });
      }}
      onPressOut={() => {
        scale.value = withSpring(1, { damping: 10 });
      }}
      testID={`power-${power.id}`}
    >
      <LinearGradient
        colors={[GameColors.surfaceLight, GameColors.surface]}
        style={styles.powerCardGradient}
      >
        <LinearGradient
          colors={usedToday ? [GameColors.textMuted, GameColors.textMuted] : power.colors}
          style={styles.powerIcon}
        >
          <Feather name={power.icon} size={24} color="#FFFFFF" />
        </LinearGradient>
        
        <View style={styles.powerInfo}>
          <ThemedText style={[styles.powerName, { color: textColor }]}>{power.name}</ThemedText>
          <ThemedText style={[styles.powerDescription, { color: textMutedColor }]}>{power.description}</ThemedText>
        </View>

        {usedToday ? (
          <View style={styles.usedTodayBadge}>
            <Feather name="check-circle" size={14} color={GameColors.textMuted} />
            <ThemedText style={styles.usedTodayText}>Used</ThemedText>
          </View>
        ) : (
          <LinearGradient
            colors={[GameColors.success, GameColors.successGlow]}
            style={styles.watchAdButton}
          >
            <Feather name="play" size={14} color="#FFFFFF" />
            <ThemedText style={styles.watchAdText}>Watch</ThemedText>
          </LinearGradient>
        )}
      </LinearGradient>
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  tabs: {
    flexDirection: "row",
    paddingHorizontal: Spacing.xl,
    marginBottom: Spacing.xl,
    gap: Spacing.sm,
  },
  tab: {
    flex: 1,
    borderRadius: BorderRadius.lg,
    overflow: "hidden",
    backgroundColor: GameColors.surface,
  },
  tabActive: {
    backgroundColor: "transparent",
  },
  tabGradient: {
    paddingVertical: Spacing.md,
    alignItems: "center",
  },
  tabText: {
    fontSize: 14,
    fontWeight: "600",
    color: GameColors.textSecondary,
    textAlign: "center",
    paddingVertical: Spacing.md,
  },
  tabTextActive: {
    fontSize: 14,
    fontWeight: "700",
    color: "#FFFFFF",
    textAlign: "center",
  },
  listContent: {
    paddingHorizontal: Spacing.xl,
  },
  powersContent: {
    paddingHorizontal: Spacing.xl,
  },
  premiumHeader: {
    marginBottom: Spacing.xl,
    alignItems: "center",
  },
  premiumTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: GameColors.textPrimary,
  },
  premiumSubtitle: {
    fontSize: 14,
    color: GameColors.textMuted,
    marginTop: Spacing.xs,
  },
  row: {
    justifyContent: "space-between",
    marginBottom: Spacing.md,
  },
  skinCard: {
    width: CARD_WIDTH,
    borderRadius: BorderRadius.lg,
    overflow: "hidden",
    borderWidth: 2,
    borderColor: "transparent",
  },
  skinCardEquipped: {
    borderColor: GameColors.primary,
  },
  skinCardGradient: {
    padding: Spacing.lg,
    alignItems: "center",
  },
  skinPreviewContainer: {
    position: "relative",
    marginBottom: Spacing.md,
  },
  skinPreview: {
    width: 56,
    height: 56,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  characterImageContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    overflow: "hidden",
    backgroundColor: GameColors.surface,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: GameColors.gold + "40",
  },
  characterImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
  },
  premiumGlow: {
    position: "absolute",
    top: -8,
    left: -8,
    right: -8,
    bottom: -8,
    borderRadius: 18,
    overflow: "hidden",
  },
  premiumGlowGradient: {
    flex: 1,
    borderRadius: 18,
  },
  equippedBadge: {
    position: "absolute",
    top: -6,
    right: -6,
    backgroundColor: GameColors.success,
    borderRadius: 12,
    width: 22,
    height: 22,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: GameColors.surface,
  },
  skinName: {
    fontSize: 14,
    fontWeight: "600",
    color: GameColors.textPrimary,
    marginBottom: Spacing.sm,
    textAlign: "center",
  },
  ownedBadge: {
    backgroundColor: GameColors.success + "25",
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    borderColor: GameColors.success + "40",
    alignItems: "center",
    justifyContent: "center",
  },
  ownedText: {
    fontSize: 11,
    color: GameColors.success,
    fontWeight: "700",
    textAlign: "center",
  },
  priceTag: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.xs,
    backgroundColor: "#1A1A1A",
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    borderColor: "#000000",
  },
  priceTagDisabled: {
    opacity: 0.5,
  },
  priceText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#FFD700",
    textAlign: "center",
    lineHeight: 14,
    includeFontPadding: false,
  },
  premiumPriceTag: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.xs,
    backgroundColor: "#1A1A1A",
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    borderColor: "#000000",
  },
  premiumPriceText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#FFD700",
    textAlign: "center",
    lineHeight: 14,
    includeFontPadding: false,
  },
  powerCard: {
    marginBottom: Spacing.md,
    borderRadius: BorderRadius.lg,
    overflow: "hidden",
  },
  powerCardGradient: {
    flexDirection: "row",
    alignItems: "center",
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
    borderRadius: BorderRadius.lg,
  },
  powerIcon: {
    width: 50,
    height: 50,
    borderRadius: BorderRadius.md,
    justifyContent: "center",
    alignItems: "center",
    marginRight: Spacing.lg,
  },
  powerInfo: {
    flex: 1,
  },
  powerName: {
    fontSize: 16,
    fontWeight: "700",
    color: GameColors.textPrimary,
  },
  powerDescription: {
    fontSize: 12,
    color: GameColors.textMuted,
    marginTop: 2,
  },
  watchAdButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.xs,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.md,
  },
  watchAdText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#FFFFFF",
    textAlign: "center",
  },
  powerCardUsed: {
    opacity: 0.6,
  },
  usedTodayBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.xs,
    backgroundColor: GameColors.textMuted + "25",
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.md,
  },
  usedTodayText: {
    fontSize: 13,
    fontWeight: "600",
    textAlign: "center",
    opacity: 0.7,
  },
  purchaseMessageBanner: {
    marginHorizontal: Spacing.xl,
    marginBottom: Spacing.md,
    borderRadius: BorderRadius.lg,
    overflow: "hidden",
  },
  purchaseMessageGradient: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
  },
  purchaseMessageText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  iapCard: {
    marginBottom: Spacing.md,
    borderRadius: BorderRadius.xl,
    overflow: "hidden",
  },
  iapCardGradient: {
    flexDirection: "row",
    alignItems: "center",
    padding: Spacing.lg,
    gap: Spacing.md,
  },
  iapIcon: {
    width: 56,
    height: 56,
    borderRadius: BorderRadius.lg,
    justifyContent: "center",
    alignItems: "center",
  },
  iapInfo: {
    flex: 1,
  },
  iapTitle: {
    fontSize: 16,
    fontWeight: "800",
    marginBottom: 2,
  },
  iapDesc: {
    fontSize: 12,
  },
  iapBuyButton: {
    borderRadius: BorderRadius.lg,
    overflow: "hidden",
  },
  iapBuyGradient: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    alignItems: "center",
    minWidth: 70,
  },
  iapBuyText: {
    fontSize: 14,
    fontWeight: "800",
    color: "#FFFFFF",
  },
  iapOwnedBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.xs,
    backgroundColor: GameColors.success,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.lg,
  },
  iapOwnedText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  restoreButton: {
    alignItems: "center",
    paddingVertical: Spacing.xl,
  },
  restoreText: {
    fontSize: 13,
    textDecorationLine: "underline",
  },
});
