import React, { useState, useEffect } from "react";
import { View, StyleSheet } from "react-native";
import { Feather } from "@expo/vector-icons";
import { ThemedText } from "@/components/ThemedText";
import { BorderRadius } from "@/constants/theme";
import { getGameState } from "@/lib/storage";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native";

interface PointsBadgeProps {
  points?: number;
}

export default function PointsBadge({ points: propPoints }: PointsBadgeProps) {
  const [localPoints, setLocalPoints] = useState(0);
  const navigation = useNavigation();

  const reload = () => {
    AsyncStorage.getItem("flip_one_points").then((val) => {
      setLocalPoints(val ? parseInt(val, 10) : 0);
    });
  };

  useEffect(() => {
    if (propPoints === undefined) {
      reload();
      const unsubscribe = navigation.addListener("focus", reload);
      return unsubscribe;
    }
  }, [propPoints, navigation]);

  const displayPoints = propPoints !== undefined ? propPoints : localPoints;

  return (
    <View style={styles.badge}>
      <Feather name="star" size={14} color="#FFD700" />
      <ThemedText style={styles.text}>{displayPoints}</ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
    backgroundColor: "#000000",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: BorderRadius.md,
  },
  text: {
    fontSize: 16,
    fontWeight: "800",
    color: "#FFD700",
    textAlign: "center",
    lineHeight: 16,
    includeFontPadding: false,
  },
});
