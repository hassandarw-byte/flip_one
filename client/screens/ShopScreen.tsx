import React, { useEffect, useState } from "react";
import {
  View,
  StyleSheet,
  FlatList,
  Pressable,
  Dimensions,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHeaderHeight } from "@react-navigation/elements";
import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  FadeInDown,
} from "react-native-reanimated";
import * as Haptics from "expo-haptics";

import { ThemedText } from "@/components/ThemedText";
import { GameColors, Spacing, BorderRadius } from "@/constants/theme";
import {
  getGameState,
  savePoints,
  saveOwnedSkins,
  saveEquippedSkin,
  GameState,
} from "@/lib/storage";

const { width } = Dimensions.get("window");
const CARD_WIDTH = (width - Spacing.xl * 2 - Spacing.md) / 2;

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

interface SkinItem {
  id: string;
  name: string;
  colors: string[];
  price: number;
  isPremium?: boolean;
}

const SKINS: SkinItem[] = [
  { id: "default", name: "Golden", colors: [GameColors.player, GameColors.playerGlow], price: 0 },
  { id: "purple", name: "Royal Purple", colors: [GameColors.candy4, GameColors.primaryGlow], price: 100 },
  { id: "teal", name: "Ocean Teal", colors: [GameColors.candy2, GameColors.platformGlow], price: 150 },
  { id: "pink", name: "Cotton Candy", colors: [GameColors.candy5, GameColors.secondaryGlow], price: 150 },
  { id: "red", name: "Cherry Red", colors: [GameColors.candy1, GameColors.spikeGlow], price: 200 },
  { id: "green", name: "Lime Fresh", colors: [GameColors.candy6, GameColors.successGlow], price: 250 },
  { id: "gold", name: "Premium Gold", colors: ["#FFD700", "#B8860B"], price: 400 },
  { id: "rainbow", name: "Rainbow", colors: ["#FF6B6B", "#4ECDC4", "#FFD93D"], price: 0, isPremium: true },
];

export default function ShopScreen() {
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [activeTab, setActiveTab] = useState<"skins" | "premium">("skins");

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

  const filteredSkins = SKINS.filter((s) =>
    activeTab === "premium" ? s.isPremium : !s.isPremium
  );

  return (
    <LinearGradient
      colors={[GameColors.backgroundGradientStart, GameColors.backgroundGradientEnd]}
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
      </View>

      <FlatList
        data={filteredSkins}
        renderItem={renderSkinItem}
        keyExtractor={(item) => item.id}
        numColumns={2}
        columnWrapperStyle={styles.row}
        contentContainerStyle={[
          styles.listContent,
          { paddingBottom: insets.bottom + Spacing.xl },
        ]}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Feather name="package" size={48} color={GameColors.textMuted} />
            <ThemedText style={styles.emptyText}>
              No items available
            </ThemedText>
          </View>
        }
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
          <View style={[styles.priceTag, !canAfford && !skin.isPremium && styles.priceTagDisabled]}>
            {skin.isPremium ? (
              <>
                <Feather name="dollar-sign" size={12} color={GameColors.gold} />
                <ThemedText style={styles.priceText}>0.99</ThemedText>
              </>
            ) : (
              <>
                <Feather name="star" size={12} color={GameColors.gold} />
                <ThemedText style={styles.priceText}>{skin.price}</ThemedText>
              </>
            )}
          </View>
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
    fontSize: 16,
    fontWeight: "600",
    color: GameColors.textSecondary,
    textAlign: "center",
    paddingVertical: Spacing.md,
  },
  tabTextActive: {
    fontSize: 16,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  listContent: {
    paddingHorizontal: Spacing.xl,
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
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
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
  },
  ownedBadge: {
    backgroundColor: GameColors.success + "25",
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    borderColor: GameColors.success + "40",
  },
  ownedText: {
    fontSize: 11,
    color: GameColors.success,
    fontWeight: "700",
  },
  priceTag: {
    flexDirection: "row",
    alignItems: "center",
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
  emptyContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingTop: Spacing["5xl"],
  },
  emptyText: {
    fontSize: 16,
    color: GameColors.textMuted,
    marginTop: Spacing.lg,
  },
});
