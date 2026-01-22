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

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export default function MissionsScreen() {
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
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
    <View
      style={[
        styles.container,
        { paddingTop: headerHeight + Spacing.lg },
      ]}
    >
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <Feather name="calendar" size={24} color={GameColors.primary} />
          <ThemedText style={styles.title}>Daily Missions</ThemedText>
        </View>
        <ThemedText style={styles.subtitle}>
          Complete missions to earn points
        </ThemedText>
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
            <Feather name="check-circle" size={64} color={GameColors.success} />
            <ThemedText style={styles.emptyTitle}>All Done!</ThemedText>
            <ThemedText style={styles.emptyText}>
              Come back tomorrow for new missions
            </ThemedText>
          </View>
        }
      />

      {allClaimed ? (
        <View style={[styles.allDoneContainer, { paddingBottom: insets.bottom + Spacing.lg }]}>
          <Feather name="check-circle" size={48} color={GameColors.success} />
          <ThemedText style={styles.allDoneText}>
            All missions completed!
          </ThemedText>
        </View>
      ) : null}
    </View>
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
      <View style={styles.missionContent}>
        <View style={styles.missionInfo}>
          <ThemedText style={styles.missionDescription}>
            {mission.description}
          </ThemedText>
          <View style={styles.progressContainer}>
            <View style={styles.progressBar}>
              <View
                style={[
                  styles.progressFill,
                  { width: `${Math.min(progress * 100, 100)}%` },
                ]}
              />
            </View>
            <ThemedText style={styles.progressText}>
              {mission.progress}/{mission.target}
            </ThemedText>
          </View>
        </View>

        <View style={styles.rewardSection}>
          <View style={styles.rewardBadge}>
            <Feather name="star" size={14} color={GameColors.gold} />
            <ThemedText style={styles.rewardText}>{mission.reward}</ThemedText>
          </View>

          {mission.completed && !mission.claimed ? (
            <AnimatedPressable
              style={styles.claimButton}
              onPress={onClaim}
              onPressIn={() => {
                scale.value = withSpring(0.98, { damping: 15 });
              }}
              onPressOut={() => {
                scale.value = withSpring(1, { damping: 15 });
              }}
              testID={`button-claim-${mission.id}`}
            >
              <ThemedText style={styles.claimButtonText}>Claim</ThemedText>
            </AnimatedPressable>
          ) : mission.claimed ? (
            <View style={styles.claimedBadge}>
              <Feather name="check" size={16} color={GameColors.success} />
            </View>
          ) : null}
        </View>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: GameColors.background,
  },
  header: {
    paddingHorizontal: Spacing.xl,
    marginBottom: Spacing.xl,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
    marginBottom: Spacing.sm,
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: GameColors.textPrimary,
  },
  subtitle: {
    fontSize: 14,
    color: GameColors.textMuted,
  },
  listContent: {
    paddingHorizontal: Spacing.xl,
  },
  missionCard: {
    backgroundColor: GameColors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    marginBottom: Spacing.md,
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
    fontSize: 16,
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
    backgroundColor: GameColors.background,
    borderRadius: 4,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: GameColors.primary,
    borderRadius: 4,
  },
  progressText: {
    fontSize: 12,
    color: GameColors.textMuted,
    minWidth: 40,
  },
  rewardSection: {
    alignItems: "center",
    gap: Spacing.sm,
  },
  rewardBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.xs,
    backgroundColor: GameColors.gold + "20",
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.full,
  },
  rewardText: {
    fontSize: 14,
    fontWeight: "700",
    color: GameColors.gold,
  },
  claimButton: {
    backgroundColor: GameColors.success,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.md,
  },
  claimButtonText: {
    fontSize: 14,
    fontWeight: "700",
    color: GameColors.background,
  },
  claimedBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: GameColors.success + "20",
    justifyContent: "center",
    alignItems: "center",
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingTop: Spacing["5xl"],
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
    backgroundColor: GameColors.surface,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.md,
  },
  allDoneText: {
    fontSize: 16,
    fontWeight: "600",
    color: GameColors.success,
  },
});
