import React, { useEffect, useState } from "react";
import {
  View,
  StyleSheet,
  FlatList,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHeaderHeight } from "@react-navigation/elements";
import { Feather } from "@expo/vector-icons";
import Animated, { FadeInDown } from "react-native-reanimated";

import { ThemedText } from "@/components/ThemedText";
import { GameColors, Spacing, BorderRadius } from "@/constants/theme";
import { getGameState, GameState } from "@/lib/storage";

interface LeaderboardEntry {
  rank: number;
  username: string;
  score: number;
  isCurrentUser?: boolean;
}

const MOCK_LEADERBOARD: LeaderboardEntry[] = [
  { rank: 1, username: "ProGamer99", score: 156 },
  { rank: 2, username: "FlipMaster", score: 142 },
  { rank: 3, username: "GravityKing", score: 128 },
  { rank: 4, username: "SpeedRunner", score: 115 },
  { rank: 5, username: "NoobSlayer", score: 98 },
  { rank: 6, username: "ArcadeHero", score: 87 },
  { rank: 7, username: "GameWizard", score: 76 },
  { rank: 8, username: "PixelNinja", score: 65 },
  { rank: 9, username: "RetroGamer", score: 54 },
  { rank: 10, username: "CasualPro", score: 43 },
];

export default function LeaderboardScreen() {
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const state = await getGameState();
    setGameState(state);

    const entries = [...MOCK_LEADERBOARD];
    const userScore = state.bestScore;

    if (userScore > 0) {
      const userEntry: LeaderboardEntry = {
        rank: 0,
        username: "You",
        score: userScore,
        isCurrentUser: true,
      };

      let inserted = false;
      for (let i = 0; i < entries.length; i++) {
        if (userScore > entries[i].score) {
          entries.splice(i, 0, userEntry);
          inserted = true;
          break;
        }
      }

      if (!inserted && userScore > 0) {
        entries.push(userEntry);
      }

      entries.forEach((entry, index) => {
        entry.rank = index + 1;
      });
    }

    setLeaderboard(entries.slice(0, 20));
  };

  const renderItem = ({
    item,
    index,
  }: {
    item: LeaderboardEntry;
    index: number;
  }) => (
    <Animated.View entering={FadeInDown.delay(index * 50).springify()}>
      <LeaderboardRow entry={item} />
    </Animated.View>
  );

  const userRank = leaderboard.find((e) => e.isCurrentUser)?.rank;

  return (
    <View
      style={[
        styles.container,
        { paddingTop: headerHeight + Spacing.lg },
      ]}
    >
      {userRank ? (
        <View style={styles.userRankCard}>
          <View style={styles.userRankInfo}>
            <View style={styles.userRankBadge}>
              <ThemedText style={styles.userRankNumber}>#{userRank}</ThemedText>
            </View>
            <View>
              <ThemedText style={styles.userRankLabel}>Your Rank</ThemedText>
              <ThemedText style={styles.userScore}>
                Best Score: {gameState?.bestScore || 0}
              </ThemedText>
            </View>
          </View>
          <Feather name="trending-up" size={24} color={GameColors.success} />
        </View>
      ) : (
        <View style={styles.noRankCard}>
          <Feather name="play" size={24} color={GameColors.primary} />
          <ThemedText style={styles.noRankText}>
            Play a game to get on the leaderboard!
          </ThemedText>
        </View>
      )}

      <View style={styles.header}>
        <ThemedText style={styles.headerTitle}>Global Rankings</ThemedText>
      </View>

      <FlatList
        data={leaderboard}
        renderItem={renderItem}
        keyExtractor={(item) => `${item.rank}-${item.username}`}
        contentContainerStyle={[
          styles.listContent,
          { paddingBottom: insets.bottom + Spacing.xl },
        ]}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Feather name="users" size={48} color={GameColors.textMuted} />
            <ThemedText style={styles.emptyText}>
              No rankings yet
            </ThemedText>
          </View>
        }
      />
    </View>
  );
}

interface LeaderboardRowProps {
  entry: LeaderboardEntry;
}

function LeaderboardRow({ entry }: LeaderboardRowProps) {
  const getRankColor = () => {
    switch (entry.rank) {
      case 1:
        return GameColors.gold;
      case 2:
        return "#C0C0C0";
      case 3:
        return "#CD7F32";
      default:
        return GameColors.textMuted;
    }
  };

  const getRankIcon = () => {
    if (entry.rank <= 3) {
      return <Feather name="award" size={20} color={getRankColor()} />;
    }
    return null;
  };

  return (
    <View
      style={[
        styles.row,
        entry.isCurrentUser && styles.rowCurrentUser,
      ]}
    >
      <View style={styles.rankContainer}>
        {getRankIcon()}
        <ThemedText style={[styles.rankText, { color: getRankColor() }]}>
          {entry.rank}
        </ThemedText>
      </View>

      <View style={styles.userInfo}>
        <View
          style={[
            styles.avatar,
            entry.isCurrentUser && { backgroundColor: GameColors.primary },
          ]}
        >
          <Feather
            name="user"
            size={16}
            color={entry.isCurrentUser ? GameColors.background : GameColors.textSecondary}
          />
        </View>
        <ThemedText
          style={[
            styles.username,
            entry.isCurrentUser && styles.usernameCurrentUser,
          ]}
        >
          {entry.username}
        </ThemedText>
        {entry.isCurrentUser ? (
          <View style={styles.youBadge}>
            <ThemedText style={styles.youBadgeText}>You</ThemedText>
          </View>
        ) : null}
      </View>

      <ThemedText style={styles.scoreText}>{entry.score}</ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: GameColors.background,
  },
  userRankCard: {
    marginHorizontal: Spacing.xl,
    backgroundColor: GameColors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: Spacing.xl,
    borderWidth: 1,
    borderColor: GameColors.primary + "40",
  },
  userRankInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
  },
  userRankBadge: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: GameColors.primary,
    justifyContent: "center",
    alignItems: "center",
  },
  userRankNumber: {
    fontSize: 16,
    fontWeight: "800",
    color: GameColors.background,
  },
  userRankLabel: {
    fontSize: 14,
    color: GameColors.textMuted,
  },
  userScore: {
    fontSize: 16,
    fontWeight: "600",
    color: GameColors.textPrimary,
  },
  noRankCard: {
    marginHorizontal: Spacing.xl,
    backgroundColor: GameColors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.xl,
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
    marginBottom: Spacing.xl,
  },
  noRankText: {
    fontSize: 14,
    color: GameColors.textSecondary,
    flex: 1,
  },
  header: {
    paddingHorizontal: Spacing.xl,
    marginBottom: Spacing.lg,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: GameColors.textPrimary,
  },
  listContent: {
    paddingHorizontal: Spacing.xl,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: GameColors.surface,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
  },
  rowCurrentUser: {
    borderWidth: 1,
    borderColor: GameColors.primary,
    backgroundColor: GameColors.primary + "10",
  },
  rankContainer: {
    width: 50,
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.xs,
  },
  rankText: {
    fontSize: 16,
    fontWeight: "700",
  },
  userInfo: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: GameColors.surfaceLight,
    justifyContent: "center",
    alignItems: "center",
  },
  username: {
    fontSize: 14,
    color: GameColors.textPrimary,
  },
  usernameCurrentUser: {
    fontWeight: "600",
    color: GameColors.primary,
  },
  youBadge: {
    backgroundColor: GameColors.primary + "20",
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: BorderRadius.xs,
  },
  youBadgeText: {
    fontSize: 10,
    fontWeight: "600",
    color: GameColors.primary,
  },
  scoreText: {
    fontSize: 18,
    fontWeight: "700",
    color: GameColors.textPrimary,
  },
  emptyContainer: {
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
