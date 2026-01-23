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
  { id: "dark_knight", name: "Dark Knight", colors: ["#1a1a2e", "#16213e"], price: 1000, isPremium: true, icon: "shield", image: require("@/assets/images/dark-knight.png") },
  { id: "web_hero", name: "Web Hero", colors: ["#e63946", "#1d3557"], price: 1500, isPremium: true, icon: "target", image: require("@/assets/images/web-hero.png") },
  { id: "green_giant", name: "Green Giant", colors: ["#2d6a4f", "#40916c"], price: 2000, isPremium: true, icon: "zap", image: require("@/assets/images/green-giant.png") },
  { id: "iron_armor", name: "Iron Armor", colors: ["#c1121f", "#ffd60a"], price: 2500, isPremium: true, icon: "cpu", image: require("@/assets/images/iron-armor.png") },
  { id: "sonic", name: "Sonic", colors: ["#1E90FF", "#4169E1"], price: 3000, isPremium: true, icon: "zap", image: require("@/assets/images/sonic.jpg") },
  { id: "cozy_bunny", name: "Cozy Bunny", colors: ["#8B4513", "#D2691E"], price: 3500, isPremium: true, icon: "smile", image: require("@/assets/images/cozy-bunny.webp") },
  { id: "flash", name: "Flash", colors: ["#DC143C", "#FFD700"], price: 4000, isPremium: true, icon: "zap", image: require("@/assets/images/flash.jpg") },
  { id: "ice_queen", name: "Ice Queen", colors: ["#90e0ef", "#48cae4"], price: 4500, isPremium: true, icon: "star", image: require("@/assets/images/ice-queen.png") },
  { id: "sweet_kitty", name: "Sweet Kitty", colors: ["#FF69B4", "#FF1493"], price: 5000, isPremium: true, icon: "heart", image: require("@/assets/images/sweet-kitty.png") },
  { id: "purple_devil", name: "Purple Devil", colors: ["#9370DB", "#8B008B"], price: 5500, isPremium: true, icon: "zap", image: require("@/assets/images/purple-devil.jpg") },
  { id: "superman", name: "Superman", colors: ["#0057B8", "#DC143C"], price: 6000, isPremium: true, icon: "shield", image: require("@/assets/images/superman.png") },
  { id: "kawaii_cat", name: "Kawaii Cat", colors: ["#ffb6c1", "#ff69b4"], price: 6500, isPremium: true, icon: "heart", image: require("@/assets/images/kawaii-cat.png") },
  { id: "captain_star", name: "Captain Star", colors: ["#002855", "#bf0a30"], price: 7000, isPremium: true, icon: "award", image: require("@/assets/images/captain-star.png") },
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
  const { backgroundGradient } = useNightMode();
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [activeTab, setActiveTab] = useState<"skins" | "premium" | "powers">("skins");
  const [adModalVisible, setAdModalVisible] = useState(false);
  const [selectedPower, setSelectedPower] = useState<PowerItem | null>(null);

  useEffect(() => {
    loadGameState();
  }, []);

  const loadGameState = async () => {
    const state = await getGameState();
    setGameState(state);
  };

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
        />
      </Animated.View>
    );
  };

  return (
    <LinearGradient
      colors={backgroundGradient}
      style={[styles.container, { paddingTop: headerHeight + Spacing.lg }]}
    >
      <View style={styles.header}>
        <LinearGradient
          colors={[GameColors.gold, GameColors.goldGlow]}
          style={styles.pointsContainer}
        >
          <Feather name="star" size={18} color={GameColors.background} />
          <ThemedText style={styles.pointsText}>
            {gameState?.points || 0}
          </ThemedText>
        </LinearGradient>
      </View>

      <View style={styles.tabs}>
        <TabButton
          label="Skins"
          isActive={activeTab === "skins"}
          onPress={() => setActiveTab("skins")}
        />
        <TabButton
          label="Premium"
          isActive={activeTab === "premium"}
          onPress={() => setActiveTab("premium")}
        />
        <TabButton
          label="Powers"
          isActive={activeTab === "powers"}
          onPress={() => setActiveTab("powers")}
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
              <ThemedText style={styles.premiumTitle}>Character Skins</ThemedText>
              <ThemedText style={styles.premiumSubtitle}>
                Unlock exclusive character designs
              </ThemedText>
            </View>
          }
        />
      ) : (
        <ScrollView
          contentContainerStyle={[
            styles.powersContent,
            { paddingBottom: insets.bottom + Spacing.xl },
          ]}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.premiumHeader}>
            <ThemedText style={styles.premiumTitle}>Special Powers</ThemedText>
            <ThemedText style={styles.premiumSubtitle}>
              Watch ads to unlock game-changing abilities
            </ThemedText>
          </View>
          {SPECIAL_POWERS.map((power, index) => (
            <Animated.View key={power.id} entering={FadeInDown.delay(index * 80).springify()}>
              <PowerCard 
                power={power} 
                usedToday={gameState?.powersUsedToday.includes(power.id) || false}
                onWatchAd={() => handleWatchAd(power)} 
              />
            </Animated.View>
          ))}
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
}

function TabButton({ label, isActive, onPress }: TabButtonProps) {
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
        <ThemedText style={styles.tabText}>{label}</ThemedText>
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
}

function SkinCard({
  skin,
  isOwned,
  isEquipped,
  canAfford,
  onPress,
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

        <ThemedText style={styles.skinName}>{skin.name}</ThemedText>

        {isOwned ? (
          <View style={styles.ownedBadge}>
            <ThemedText style={styles.ownedText}>
              {isEquipped ? "Equipped" : "Owned"}
            </ThemedText>
          </View>
        ) : (
          <View style={[styles.priceTag, !canAfford && styles.priceTagDisabled]}>
            <Feather name="star" size={12} color={GameColors.gold} />
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
}

function PremiumSkinCard({ skin, isOwned, isEquipped, canAfford, onPress }: PremiumSkinCardProps) {
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

        <ThemedText style={styles.skinName}>{skin.name}</ThemedText>

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
          <LinearGradient
            colors={canAfford ? [GameColors.gold, GameColors.goldGlow] : ["#666", "#444"]}
            style={styles.premiumPriceTag}
          >
            <Feather name="star" size={12} color={canAfford ? GameColors.background : "#999"} />
            <ThemedText style={[styles.premiumPriceText, !canAfford && { color: "#999" }]}>{skin.price}</ThemedText>
          </LinearGradient>
        )}
      </LinearGradient>
    </AnimatedPressable>
  );
}

interface PowerCardProps {
  power: PowerItem;
  usedToday: boolean;
  onWatchAd: () => void;
}

function PowerCard({ power, usedToday, onWatchAd }: PowerCardProps) {
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
          <ThemedText style={styles.powerName}>{power.name}</ThemedText>
          <ThemedText style={styles.powerDescription}>{power.description}</ThemedText>
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
  header: {
    flexDirection: "row",
    justifyContent: "flex-end",
    paddingHorizontal: Spacing.xl,
    marginBottom: Spacing.lg,
  },
  pointsContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
    gap: Spacing.sm,
  },
  pointsText: {
    fontSize: 18,
    fontWeight: "800",
    color: GameColors.background,
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
  },
  priceTag: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.xs,
    backgroundColor: GameColors.gold + "20",
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    borderColor: GameColors.gold + "40",
  },
  priceTagDisabled: {
    opacity: 0.5,
  },
  priceText: {
    fontSize: 13,
    fontWeight: "700",
    color: GameColors.gold,
  },
  premiumPriceTag: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.xs,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.full,
  },
  premiumPriceText: {
    fontSize: 12,
    fontWeight: "700",
    color: GameColors.background,
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
    color: GameColors.textMuted,
  },
});
