import React, { useEffect, useState } from "react";
import {
  View,
  StyleSheet,
  FlatList,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHeaderHeight } from "@react-navigation/elements";
import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
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
    <LinearGradient
      colors={[GameColors.backgroundGradientStart, GameColors.backgroundGradientEnd]}
      style={[styles.container, { paddingTop: headerHeight + Spacing.lg }]}
    >
      {userRank ? (
        <LinearGradient
          colors={[GameColors.surfaceLight, GameColors.surface]}
          style={styles.userRankCard}
        >
          <View style={styles.userRankInfo}>
            <LinearGradient
              colors={[GameColors.primary, GameColors.primaryGlow]}
              style={styles.userRankBadge}
            >
              <ThemedText style={styles.userRankNumber}>#{userRank}</ThemedText>
            </LinearGradient>
            <View>
              <ThemedText style={styles.userRankLabel}>Your Rank</ThemedText>
              <ThemedText style={styles.userScore}>
                Best Score: {gameState?.bestScore || 0}
              </ThemedText>
            </View>
          </View>
          <Feather name="trending-up" size={24} color={GameColors.success} />
        </LinearGradient>
      ) : (
        <LinearGradient
          colors={[GameColors.surfaceLight, GameColors.surface]}
          style={styles.noRankCard}
        >
          <Feather name="play" size={24} color={GameColors.primary} />
          <ThemedText style={styles.noRankText}>
            Play a game to get on the leaderboard!
          </ThemedText>
        </LinearGradient>
      )}

      <View style={styles.header}>
        <LinearGradient
          colors={[GameColors.gold, GameColors.goldGlow]}
          style={styles.headerIcon}
        >
          <Feather name="award" size={18} color={GameColors.background} />
        </LinearGradient>
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
    </LinearGradient>
  );
}

interface LeaderboardRowProps {
  entry: LeaderboardEntry;
}

function LeaderboardRow({ entry }: LeaderboardRowProps) {
  const getRankColors = (): string[] => {
    switch (entry.rank) {
      case 1:
        return ["#FFD700", "#B8860B"];
      case 2:
        return ["#C0C0C0", "#A0A0A0"];
      case 3:
        return ["#CD7F32", "#8B4513"];
      default:
        return [GameColors.surface, GameColors.surfaceLight];
    }
  };

  const getRankIcon = () => {
    if (entry.rank <= 3) {
      return <Feather name="award" size={18} color="#FFFFFF" />;
    }
    return (
      <ThemedText style={styles.rankNumber}>{entry.rank}</ThemedText>
    );
  };

  return (
    <LinearGradient
      colors={entry.isCurrentUser ? [GameColors.primary + "30", GameColors.primary + "15"] : [GameColors.surfaceLight, GameColors.surface]}
      style={[styles.row, entry.isCurrentUser && styles.rowCurrentUser]}
    >
      <View style={styles.rankContainer}>
        {entry.rank <= 3 ? (
          <LinearGradient
            colors={getRankColors()}
            style={styles.rankBadge}
          >
            {getRankIcon()}
          </LinearGradient>
        ) : (
          <View style={[styles.rankBadge, { backgroundColor: GameColors.surface }]}>
            {getRankIcon()}
          </View>
        )}
      </View>

      <View style={styles.userInfo}>
        <LinearGradient
          colors={entry.isCurrentUser ? [GameColors.primary, GameColors.primaryGlow] : [GameColors.surfaceGlass, GameColors.surfaceGlass]}
          style={styles.avatar}
        >
          <Feather
            name="user"
            size={14}
            color={entry.isCurrentUser ? "#FFFFFF" : GameColors.textSecondary}
          />
        </LinearGradient>
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

      <LinearGradient
        colors={[GameColors.gold + "30", GameColors.gold + "15"]}
        style={styles.scoreBadge}
      >
        <ThemedText style={styles.scoreText}>{entry.score}</ThemedText>
      </LinearGradient>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  userRankCard: {
    marginHorizontal: Spacing.xl,
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
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
  },
  userRankNumber: {
    fontSize: 16,
    fontWeight: "900",
    color: "#FFFFFF",
  },
  userRankLabel: {
    fontSize: 13,
    color: GameColors.textMuted,
  },
  userScore: {
    fontSize: 16,
    fontWeight: "600",
    color: GameColors.textPrimary,
  },
  noRankCard: {
    marginHorizontal: Spacing.xl,
    borderRadius: BorderRadius.lg,
    padding: Spacing.xl,
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
    marginBottom: Spacing.xl,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
  },
  noRankText: {
    fontSize: 14,
    color: GameColors.textSecondary,
    flex: 1,
  },
  header: {
    paddingHorizontal: Spacing.xl,
    marginBottom: Spacing.lg,
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
  },
  headerIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
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
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.05)",
  },
  rowCurrentUser: {
    borderColor: GameColors.primary + "50",
  },
  rankContainer: {
    width: 44,
    marginRight: Spacing.sm,
  },
  rankBadge: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
  },
  rankNumber: {
    fontSize: 14,
    fontWeight: "700",
    color: GameColors.textMuted,
  },
  userInfo: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
  },
  avatar: {
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: "center",
    alignItems: "center",
  },
  username: {
    fontSize: 14,
    color: GameColors.textPrimary,
    fontWeight: "500",
  },
  usernameCurrentUser: {
    fontWeight: "700",
    color: GameColors.primary,
  },
  youBadge: {
    backgroundColor: GameColors.primary + "25",
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: BorderRadius.xs,
    borderWidth: 1,
    borderColor: GameColors.primary + "40",
  },
  youBadgeText: {
    fontSize: 10,
    fontWeight: "700",
    color: GameColors.primary,
  },
  scoreBadge: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    borderColor: GameColors.gold + "40",
  },
  scoreText: {
    fontSize: 16,
    fontWeight: "800",
    color: GameColors.gold,
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
