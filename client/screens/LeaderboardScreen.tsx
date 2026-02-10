import React, { useEffect, useState } from "react";
import {
  View,
  StyleSheet,
  FlatList,
  TextInput,
  Pressable,
  ActivityIndicator,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHeaderHeight } from "@react-navigation/elements";
import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import Animated, { FadeInDown } from "react-native-reanimated";

import { ThemedText } from "@/components/ThemedText";
import { GameColors, Spacing, BorderRadius } from "@/constants/theme";
import { getGameState, GameState, getDeviceId, getUsername, setUsername } from "@/lib/storage";
import { useNightMode } from "@/contexts/NightModeContext";
import { getApiUrl } from "@/lib/query-client";

interface LeaderboardEntry {
  rank: number;
  username: string;
  score: number;
  isCurrentUser?: boolean;
  deviceId?: string;
}

export default function LeaderboardScreen() {
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const { backgroundGradient } = useNightMode();
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentDeviceId, setCurrentDeviceId] = useState<string>("");
  const [username, setUsernameState] = useState<string>("Player");
  const [isEditingName, setIsEditingName] = useState(false);
  const [tempName, setTempName] = useState("");

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const state = await getGameState();
      setGameState(state);
      
      const deviceId = await getDeviceId();
      setCurrentDeviceId(deviceId);
      
      const storedUsername = await getUsername();
      setUsernameState(storedUsername);

      const baseUrl = getApiUrl();
      const response = await fetch(`${baseUrl}api/leaderboard`);
      
      if (response.ok) {
        const data = await response.json();
        const entries: LeaderboardEntry[] = data.map((entry: any, index: number) => ({
          rank: index + 1,
          username: entry.username,
          score: entry.score,
          deviceId: entry.deviceId,
          isCurrentUser: entry.deviceId === deviceId,
        }));
        
        const hasUserEntry = entries.some(e => e.deviceId === deviceId);
        if (!hasUserEntry && state.bestScore > 0) {
          await submitScore(deviceId, storedUsername, state.bestScore);
          await loadData();
          return;
        }
        
        setLeaderboard(entries.slice(0, 100));
      } else {
        setLeaderboard([]);
      }
    } catch (error) {
      console.error("Error loading leaderboard:", error);
      setLeaderboard([]);
    } finally {
      setLoading(false);
    }
  };

  const submitScore = async (deviceId: string, name: string, score: number) => {
    try {
      const baseUrl = getApiUrl();
      await fetch(`${baseUrl}api/leaderboard`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: name, score, deviceId }),
      });
    } catch (error) {
      console.error("Error submitting score:", error);
    }
  };

  const handleSaveName = async () => {
    if (tempName.trim()) {
      await setUsername(tempName.trim());
      setUsernameState(tempName.trim());
      if (gameState && gameState.bestScore > 0) {
        await submitScore(currentDeviceId, tempName.trim(), gameState.bestScore);
        await loadData();
      }
    }
    setIsEditingName(false);
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

  if (loading) {
    return (
      <LinearGradient colors={backgroundGradient} style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={GameColors.primary} />
          <ThemedText style={styles.loadingText}>Loading Rankings...</ThemedText>
        </View>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient
      colors={backgroundGradient}
      style={styles.container}
    >
      <View
        style={[
          styles.content,
          { paddingTop: headerHeight + Spacing.md, paddingBottom: insets.bottom },
        ]}
      >
        <View style={styles.headerCard}>
          <LinearGradient
            colors={[GameColors.surfaceLight, GameColors.surface]}
            style={styles.headerCardGradient}
          >
            <View style={styles.userSection}>
              {isEditingName ? (
                <View style={styles.editNameContainer}>
                  <TextInput
                    style={styles.nameInput}
                    value={tempName}
                    onChangeText={setTempName}
                    placeholder="Enter your name"
                    placeholderTextColor={GameColors.textSecondary}
                    maxLength={20}
                    autoFocus
                  />
                  <Pressable style={styles.saveButton} onPress={handleSaveName}>
                    <Feather name="check" size={20} color={GameColors.success} />
                  </Pressable>
                </View>
              ) : (
                <Pressable 
                  style={styles.nameRow}
                  onPress={() => {
                    setTempName(username);
                    setIsEditingName(true);
                  }}
                >
                  <ThemedText style={styles.userName}>{username}</ThemedText>
                  <Feather name="edit-2" size={14} color={GameColors.textSecondary} />
                </Pressable>
              )}
              
              <View style={styles.userStats}>
                <View style={styles.statBox}>
                  <LinearGradient
                    colors={[GameColors.gold, GameColors.goldGlow]}
                    style={styles.statIconBg}
                  >
                    <Feather name="award" size={16} color="#FFF" />
                  </LinearGradient>
                  <View>
                    <ThemedText style={styles.statLabel}>Your Best</ThemedText>
                    <ThemedText style={styles.statValue}>
                      {gameState?.bestScore || 0}
                    </ThemedText>
                  </View>
                </View>
                
                <View style={styles.statBox}>
                  <LinearGradient
                    colors={[GameColors.primary, GameColors.primaryGlow]}
                    style={styles.statIconBg}
                  >
                    <Feather name="hash" size={16} color="#FFF" />
                  </LinearGradient>
                  <View>
                    <ThemedText style={styles.statLabel}>Your Rank</ThemedText>
                    <ThemedText style={styles.statValue}>
                      {userRank ? `#${userRank}` : "-"}
                    </ThemedText>
                  </View>
                </View>
              </View>
            </View>
          </LinearGradient>
        </View>

        <View style={styles.listHeader}>
          <ThemedText style={styles.listHeaderText}>Global Rankings</ThemedText>
          <View style={styles.totalPlayers}>
            <Feather name="users" size={14} color={GameColors.textSecondary} />
            <ThemedText style={styles.totalPlayersText}>
              {leaderboard.length} Players
            </ThemedText>
          </View>
        </View>

        {leaderboard.length === 0 ? (
          <View style={styles.emptyState}>
            <Feather name="award" size={48} color={GameColors.textSecondary} />
            <ThemedText style={styles.emptyText}>No rankings yet!</ThemedText>
            <ThemedText style={styles.emptySubtext}>Be the first to set a high score</ThemedText>
          </View>
        ) : (
          <FlatList
            data={leaderboard}
            renderItem={renderItem}
            keyExtractor={(item) => `${item.rank}-${item.username}`}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.listContent}
          />
        )}
      </View>
    </LinearGradient>
  );
}

interface LeaderboardRowProps {
  entry: LeaderboardEntry;
}

function LeaderboardRow({ entry }: LeaderboardRowProps) {
  const isTop3 = entry.rank <= 3;
  const getMedalColor = () => {
    switch (entry.rank) {
      case 1:
        return GameColors.gold;
      case 2:
        return "#C0C0C0";
      case 3:
        return "#CD7F32";
      default:
        return GameColors.textSecondary;
    }
  };

  return (
    <LinearGradient
      colors={
        entry.isCurrentUser
          ? [GameColors.primaryGlow + "40", GameColors.primary + "20"]
          : [GameColors.surfaceLight, GameColors.surface]
      }
      style={[styles.row, entry.isCurrentUser && styles.currentUserRow]}
    >
      <View style={styles.rankContainer}>
        {isTop3 ? (
          <LinearGradient
            colors={
              entry.rank === 1
                ? [GameColors.gold, GameColors.goldGlow]
                : entry.rank === 2
                ? ["#E8E8E8", "#A0A0A0"]
                : ["#D4A574", "#8B6914"]
            }
            style={styles.medalBadge}
          >
            <ThemedText style={styles.medalText}>{entry.rank}</ThemedText>
          </LinearGradient>
        ) : (
          <ThemedText style={styles.rankText}>#{entry.rank}</ThemedText>
        )}
      </View>

      <View style={styles.nameContainer}>
        <ThemedText
          style={[
            styles.entryName,
            entry.isCurrentUser && styles.currentUserName,
          ]}
        >
          {entry.username}
          {entry.isCurrentUser && " (You)"}
        </ThemedText>
      </View>

      <View style={styles.scoreContainer}>
        <LinearGradient
          colors={
            isTop3
              ? [getMedalColor(), getMedalColor() + "80"]
              : [GameColors.surface, GameColors.surfaceLight]
          }
          style={styles.scoreBadge}
        >
          <ThemedText
            style={[styles.scoreText, isTop3 && styles.topScoreText]}
          >
            {entry.score}
          </ThemedText>
        </LinearGradient>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: Spacing.lg,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: Spacing.lg,
    color: GameColors.textSecondary,
    fontSize: 16,
  },
  headerCard: {
    marginBottom: Spacing.lg,
    borderRadius: BorderRadius.xl,
    overflow: "hidden",
  },
  headerCardGradient: {
    padding: Spacing.lg,
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
  },
  userSection: {
    alignItems: "center",
  },
  nameRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  userName: {
    fontSize: 20,
    fontWeight: "700",
    color: GameColors.textPrimary,
  },
  editNameContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  nameInput: {
    flex: 1,
    backgroundColor: GameColors.surface,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    color: GameColors.textPrimary,
    fontSize: 16,
    borderWidth: 1,
    borderColor: GameColors.primary,
    textAlign: "center",
  },
  saveButton: {
    padding: Spacing.sm,
    backgroundColor: GameColors.surface,
    borderRadius: BorderRadius.md,
  },
  userStats: {
    flexDirection: "row",
    gap: Spacing.xl,
  },
  statBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
  },
  statIconBg: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
  },
  statLabel: {
    fontSize: 11,
    color: GameColors.textSecondary,
    textTransform: "uppercase",
  },
  statValue: {
    fontSize: 18,
    fontWeight: "700",
    color: GameColors.textPrimary,
  },
  listHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Spacing.md,
  },
  listHeaderText: {
    fontSize: 18,
    fontWeight: "700",
    color: GameColors.textPrimary,
  },
  totalPlayers: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.xs,
  },
  totalPlayersText: {
    fontSize: 12,
    color: GameColors.textSecondary,
  },
  listContent: {
    paddingBottom: Spacing.xl,
  },
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: Spacing["3xl"],
  },
  emptyText: {
    fontSize: 18,
    fontWeight: "600",
    color: GameColors.textPrimary,
    marginTop: Spacing.lg,
  },
  emptySubtext: {
    fontSize: 14,
    color: GameColors.textSecondary,
    marginTop: Spacing.sm,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.md,
    marginBottom: Spacing.sm,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
  },
  currentUserRow: {
    borderColor: GameColors.primary,
    borderWidth: 2,
  },
  rankContainer: {
    width: 50,
    alignItems: "center",
  },
  medalBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  medalText: {
    fontSize: 14,
    fontWeight: "800",
    color: "#FFF",
  },
  rankText: {
    fontSize: 14,
    fontWeight: "600",
    color: GameColors.textSecondary,
  },
  nameContainer: {
    flex: 1,
    paddingHorizontal: Spacing.sm,
  },
  entryName: {
    fontSize: 16,
    fontWeight: "600",
    color: GameColors.textPrimary,
  },
  currentUserName: {
    color: GameColors.primary,
  },
  scoreContainer: {
    alignItems: "flex-end",
  },
  scoreBadge: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.md,
  },
  scoreText: {
    fontSize: 16,
    fontWeight: "700",
    color: GameColors.textPrimary,
  },
  topScoreText: {
    color: "#FFF",
  },
});
