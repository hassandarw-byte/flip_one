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
  color: string;
  price: number;
  isPremium?: boolean;
}

const SKINS: SkinItem[] = [
  { id: "default", name: "Classic", color: GameColors.player, price: 0 },
  { id: "cyan", name: "Neon Cyan", color: GameColors.primary, price: 100 },
  { id: "purple", name: "Royal Purple", color: GameColors.secondary, price: 150 },
  { id: "green", name: "Toxic Green", color: GameColors.success, price: 150 },
  { id: "pink", name: "Hot Pink", color: "#FF4D8D", price: 200 },
  { id: "gold", name: "Golden", color: GameColors.gold, price: 300 },
  { id: "blue", name: "Electric Blue", color: "#3A86FF", price: 400 },
  { id: "rainbow", name: "Rainbow", color: "#FF0000", price: 0, isPremium: true },
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

    if (skin.isPremium) {
      return;
    }

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
    <View
      style={[
        styles.container,
        { paddingTop: headerHeight + Spacing.lg },
      ]}
    >
      <View style={styles.header}>
        <View style={styles.pointsContainer}>
          <Feather name="star" size={20} color={GameColors.gold} />
          <ThemedText style={styles.pointsText}>
            {gameState?.points || 0}
          </ThemedText>
        </View>
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
    </View>
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
      <ThemedText
        style={[styles.tabText, isActive && styles.tabTextActive]}
      >
        {label}
      </ThemedText>
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
        scale.value = withSpring(1, { damping: 15 });
      }}
      testID={`skin-${skin.id}`}
    >
      <View style={[styles.skinPreview, { backgroundColor: skin.color }]}>
        {isEquipped ? (
          <View style={styles.equippedBadge}>
            <Feather name="check" size={16} color={GameColors.textPrimary} />
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
        <View
          style={[
            styles.priceTag,
            !canAfford && !skin.isPremium && styles.priceTagDisabled,
          ]}
        >
          {skin.isPremium ? (
            <>
              <Feather name="dollar-sign" size={14} color={GameColors.gold} />
              <ThemedText style={styles.priceText}>0.99</ThemedText>
            </>
          ) : (
            <>
              <Feather name="star" size={14} color={GameColors.gold} />
              <ThemedText style={styles.priceText}>{skin.price}</ThemedText>
            </>
          )}
        </View>
      )}
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: GameColors.background,
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
    backgroundColor: GameColors.surface,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
    gap: Spacing.sm,
  },
  pointsText: {
    fontSize: 18,
    fontWeight: "700",
    color: GameColors.gold,
  },
  tabs: {
    flexDirection: "row",
    paddingHorizontal: Spacing.xl,
    marginBottom: Spacing.xl,
    gap: Spacing.sm,
  },
  tab: {
    flex: 1,
    paddingVertical: Spacing.md,
    alignItems: "center",
    borderRadius: BorderRadius.lg,
    backgroundColor: GameColors.surface,
  },
  tabActive: {
    backgroundColor: GameColors.primary,
  },
  tabText: {
    fontSize: 16,
    fontWeight: "600",
    color: GameColors.textSecondary,
  },
  tabTextActive: {
    color: GameColors.background,
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
    backgroundColor: GameColors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    alignItems: "center",
    borderWidth: 2,
    borderColor: "transparent",
  },
  skinCardEquipped: {
    borderColor: GameColors.primary,
  },
  skinPreview: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginBottom: Spacing.md,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  equippedBadge: {
    position: "absolute",
    top: -8,
    right: -8,
    backgroundColor: GameColors.success,
    borderRadius: 12,
    width: 24,
    height: 24,
    justifyContent: "center",
    alignItems: "center",
  },
  skinName: {
    fontSize: 14,
    fontWeight: "600",
    color: GameColors.textPrimary,
    marginBottom: Spacing.sm,
  },
  ownedBadge: {
    backgroundColor: GameColors.success + "20",
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.full,
  },
  ownedText: {
    fontSize: 12,
    color: GameColors.success,
    fontWeight: "600",
  },
  priceTag: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.xs,
    backgroundColor: GameColors.gold + "20",
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.full,
  },
  priceTagDisabled: {
    opacity: 0.5,
  },
  priceText: {
    fontSize: 14,
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
