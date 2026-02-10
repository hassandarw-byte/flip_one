import React from "react";
import { View, StyleSheet } from "react-native";
import { Feather } from "@expo/vector-icons";
import { ThemedText } from "@/components/ThemedText";
import { Spacing, BorderRadius } from "@/constants/theme";

interface PointsBadgeProps {
  points: number;
}

export default function PointsBadge({ points }: PointsBadgeProps) {
  return (
    <View style={styles.container}>
      <View style={styles.badge}>
        <Feather name="star" size={16} color="#FFD700" />
        <ThemedText style={styles.text}>{points}</ThemedText>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    top: 0,
    right: Spacing.xl,
    zIndex: 10,
  },
  badge: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.xs,
    backgroundColor: "#000000",
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.lg,
    minWidth: 80,
  },
  text: {
    fontSize: 16,
    fontWeight: "800",
    color: "#FFD700",
    textAlign: "center",
  },
});
