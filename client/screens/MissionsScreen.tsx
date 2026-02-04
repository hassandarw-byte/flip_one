import React, { useEffect, useState } from "react";
import {
  View,
  StyleSheet,
  FlatList,
  Pressable,
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
  claimMissionReward,
  DailyMission,
  GameState,
} from "@/lib/storage";
import { useNightMode } from "@/contexts/NightModeContext";

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export default function MissionsScreen() {
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const { backgroundGradient } = useNightMode();
  const [gameState, setGameState] = useState<GameState | null>(null);

  useEffect(() => {
    loadGameState();
  }, []);

  const loadGameState = async () => {
    const state = await getGameState();
    setGameState(state);
  };

  const handleClaimReward = async (missionId: string) => {
    const reward = await claimMissionReward(missionId);
    if (reward > 0) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      loadGameState();
    }
  };

  const renderMissionItem = ({
    item,
    index,
  }: {
    item: DailyMission;
    index: number;
  }) => (
    <Animated.View entering={FadeInDown.delay(index * 100).springify()}>
      <MissionCard mission={item} onClaim={() => handleClaimReward(item.id)} />
    </Animated.View>
  );

  const allClaimed = gameState?.dailyMissions.every((m) => m.claimed);

  return (
    <LinearGradient
      colors={backgroundGradient}
      style={[styles.container, { paddingTop: headerHeight + Spacing.lg }]}
    >
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <LinearGradient
            colors={[GameColors.success, GameColors.successGlow]}
            style={styles.titleIcon}
          >
            <Feather name="calendar" size={20} color="#FFFFFF" />
          </LinearGradient>
          <View>
            <ThemedText style={styles.title}>Missions</ThemedText>
            <ThemedText style={styles.subtitle}>
              Complete missions to earn points
            </ThemedText>
          </View>
        </View>
      </View>

      <FlatList
        data={gameState?.dailyMissions || []}
        renderItem={renderMissionItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={[
          styles.listContent,
          { paddingBottom: insets.bottom + Spacing.xl },
        ]}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <LinearGradient
              colors={[GameColors.success, GameColors.successGlow]}
              style={styles.emptyIcon}
            >
              <Feather name="check-circle" size={48} color="#FFFFFF" />
            </LinearGradient>
            <ThemedText style={styles.emptyTitle}>All Done!</ThemedText>
            <ThemedText style={styles.emptyText}>
              Come back tomorrow for new missions
            </ThemedText>
          </View>
        }
      />

      {allClaimed ? (
        <LinearGradient
          colors={[GameColors.surface, GameColors.surfaceLight]}
          style={[styles.allDoneContainer, { paddingBottom: insets.bottom + Spacing.lg }]}
        >
          <Feather name="check-circle" size={32} color={GameColors.success} />
          <ThemedText style={styles.allDoneText}>
            All missions completed!
          </ThemedText>
        </LinearGradient>
      ) : null}
    </LinearGradient>
  );
}

interface MissionCardProps {
  mission: DailyMission;
  onClaim: () => void;
}

function MissionCard({ mission, onClaim }: MissionCardProps) {
  const scale = useSharedValue(1);
  const progress = mission.progress / mission.target;

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <Animated.View style={[styles.missionCard, animatedStyle]}>
      <LinearGradient
        colors={[GameColors.surfaceLight, GameColors.surface]}
        style={styles.missionCardGradient}
      >
        <View style={styles.missionContent}>
          <View style={styles.missionInfo}>
            <ThemedText style={styles.missionDescription}>
              {mission.description}
            </ThemedText>
            <View style={styles.progressContainer}>
              <View style={styles.progressBar}>
                <LinearGradient
                  colors={[GameColors.primary, GameColors.primaryGlow]}
                  style={[styles.progressFill, { width: `${Math.min(progress * 100, 100)}%` }]}
                />
              </View>
              <ThemedText style={styles.progressText}>
                {mission.progress}/{mission.target}
              </ThemedText>
            </View>
          </View>

          <View style={styles.rewardSection}>
            <LinearGradient
              colors={[GameColors.gold + "30", GameColors.gold + "15"]}
              style={styles.rewardBadge}
            >
              <Feather name="star" size={14} color={GameColors.gold} />
              <ThemedText style={styles.rewardText}>{mission.reward}</ThemedText>
            </LinearGradient>

            {mission.completed && !mission.claimed ? (
              <AnimatedPressable
                style={styles.claimButton}
                onPress={onClaim}
                onPressIn={() => {
                  scale.value = withSpring(0.98, { damping: 15 });
                }}
                onPressOut={() => {
                  scale.value = withSpring(1, { damping: 10 });
                }}
                testID={`button-claim-${mission.id}`}
              >
                <LinearGradient
                  colors={[GameColors.success, GameColors.successGlow]}
                  style={styles.claimButtonGradient}
                >
                  <ThemedText style={styles.claimButtonText}>Claim</ThemedText>
                </LinearGradient>
              </AnimatedPressable>
            ) : mission.claimed ? (
              <View style={styles.claimedBadge}>
                <Feather name="check" size={16} color={GameColors.success} />
              </View>
            ) : null}
          </View>
        </View>
      </LinearGradient>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: Spacing.xl,
    marginBottom: Spacing.xl,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
  },
  titleIcon: {
    width: 44,
    height: 44,
    borderRadius: BorderRadius.md,
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: GameColors.textPrimary,
  },
  subtitle: {
    fontSize: 13,
    color: GameColors.textMuted,
    marginTop: 2,
  },
  listContent: {
    paddingHorizontal: Spacing.xl,
  },
  missionCard: {
    borderRadius: BorderRadius.lg,
    overflow: "hidden",
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
  },
  missionCardGradient: {
    padding: Spacing.lg,
  },
  missionContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  missionInfo: {
    flex: 1,
    marginRight: Spacing.lg,
  },
  missionDescription: {
    fontSize: 15,
    fontWeight: "600",
    color: GameColors.textPrimary,
    marginBottom: Spacing.md,
  },
  progressContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
  },
  progressBar: {
    flex: 1,
    height: 8,
    backgroundColor: "rgba(255,255,255,0.1)",
    borderRadius: 4,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: 4,
  },
  progressText: {
    fontSize: 12,
    color: GameColors.textMuted,
    minWidth: 40,
    fontWeight: "600",
  },
  rewardSection: {
    alignItems: "center",
    gap: Spacing.sm,
  },
  rewardBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.xs,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    borderColor: GameColors.gold + "40",
  },
  rewardText: {
    fontSize: 14,
    fontWeight: "700",
    color: GameColors.gold,
  },
  claimButton: {
    borderRadius: BorderRadius.md,
    overflow: "hidden",
  },
  claimButtonGradient: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
  },
  claimButtonText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  claimedBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: GameColors.success + "25",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: GameColors.success + "40",
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingTop: Spacing["5xl"],
  },
  emptyIcon: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: GameColors.textPrimary,
    marginTop: Spacing.xl,
  },
  emptyText: {
    fontSize: 16,
    color: GameColors.textMuted,
    marginTop: Spacing.sm,
  },
  allDoneContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding: Spacing.xl,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: "rgba(255,255,255,0.1)",
  },
  allDoneText: {
    fontSize: 16,
    fontWeight: "600",
    color: GameColors.success,
  },
});
