import React, { useState } from "react";
import { reloadAppAsync } from "expo";
import {
  StyleSheet,
  View,
  Pressable,
  ScrollView,
  Text,
  Modal,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Feather } from "@expo/vector-icons";
import { ThemedText } from "@/components/ThemedText";
import { GameColors, Spacing, BorderRadius, Fonts } from "@/constants/theme";

export type ErrorFallbackProps = {
  error: Error;
  resetError: () => void;
};

export function ErrorFallback({ error, resetError }: ErrorFallbackProps) {
  const [isModalVisible, setIsModalVisible] = useState(false);

  const handleRestart = async () => {
    try {
      await reloadAppAsync();
    } catch (restartError) {
      console.error("Failed to restart app:", restartError);
      resetError();
    }
  };

  const formatErrorDetails = (): string => {
    let details = `Error: ${error.message}\n\n`;
    if (error.stack) {
      details += `Stack Trace:\n${error.stack}`;
    }
    return details;
  };

  return (
    <LinearGradient
      colors={[GameColors.backgroundGradientStart, GameColors.backgroundGradientEnd]}
      style={styles.container}
    >
      {__DEV__ ? (
        <Pressable
          onPress={() => setIsModalVisible(true)}
          style={({ pressed }) => [
            styles.topButton,
            { opacity: pressed ? 0.8 : 1 },
          ]}
        >
          <LinearGradient
            colors={[GameColors.danger, GameColors.dangerGlow]}
            style={styles.topButtonGradient}
          >
            <Feather name="alert-circle" size={20} color="#FFFFFF" />
          </LinearGradient>
        </Pressable>
      ) : null}

      <View style={styles.content}>
        <LinearGradient
          colors={[GameColors.primary, GameColors.primaryGlow]}
          style={styles.iconContainer}
        >
          <Feather name="rotate-ccw" size={48} color="#FFFFFF" />
        </LinearGradient>

        <ThemedText type="h1" style={styles.title}>
          Oops! Flip One crashed
        </ThemedText>

        <ThemedText type="body" style={styles.message}>
          Something went wrong. Tap below to restart and flip again!
        </ThemedText>

        <Pressable
          onPress={handleRestart}
          style={({ pressed }) => [
            styles.button,
            { transform: [{ scale: pressed ? 0.98 : 1 }] },
          ]}
        >
          <LinearGradient
            colors={[GameColors.player, GameColors.playerGlow]}
            style={styles.buttonGradient}
          >
            <Feather name="refresh-cw" size={20} color={GameColors.background} />
            <Text style={styles.buttonText}>Flip Back In</Text>
          </LinearGradient>
        </Pressable>
      </View>

      {__DEV__ ? (
        <Modal
          visible={isModalVisible}
          animationType="slide"
          transparent={true}
          onRequestClose={() => setIsModalVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <LinearGradient
              colors={[GameColors.surfaceLight, GameColors.surface]}
              style={styles.modalContainer}
            >
              <View style={styles.modalHeader}>
                <ThemedText type="h2" style={styles.modalTitle}>
                  Error Details
                </ThemedText>
                <Pressable
                  onPress={() => setIsModalVisible(false)}
                  style={({ pressed }) => [
                    styles.closeButton,
                    { opacity: pressed ? 0.6 : 1 },
                  ]}
                >
                  <Feather name="x" size={24} color={GameColors.textPrimary} />
                </Pressable>
              </View>

              <ScrollView
                style={styles.modalScrollView}
                contentContainerStyle={styles.modalScrollContent}
                showsVerticalScrollIndicator
              >
                <View style={styles.errorContainer}>
                  <Text style={styles.errorText} selectable>
                    {formatErrorDetails()}
                  </Text>
                </View>
              </ScrollView>
            </LinearGradient>
          </View>
        </Modal>
      ) : null}
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
    padding: Spacing["2xl"],
  },
  content: {
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.lg,
    width: "100%",
    maxWidth: 600,
  },
  iconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: Spacing.lg,
  },
  title: {
    textAlign: "center",
    lineHeight: 40,
    color: GameColors.textPrimary,
  },
  message: {
    textAlign: "center",
    opacity: 0.7,
    lineHeight: 24,
    color: GameColors.textSecondary,
  },
  topButton: {
    position: "absolute",
    top: Spacing["2xl"] + Spacing.lg,
    right: Spacing.lg,
    zIndex: 10,
  },
  topButtonGradient: {
    width: 44,
    height: 44,
    borderRadius: BorderRadius.md,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  button: {
    borderRadius: BorderRadius.lg,
    overflow: "hidden",
    shadowColor: GameColors.player,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 15,
    elevation: 10,
  },
  buttonGradient: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
    paddingVertical: Spacing.lg,
    paddingHorizontal: Spacing["2xl"],
    minWidth: 200,
    justifyContent: "center",
  },
  buttonText: {
    fontWeight: "700",
    textAlign: "center",
    fontSize: 16,
    color: GameColors.background,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(26, 10, 46, 0.9)",
    justifyContent: "flex-end",
  },
  modalContainer: {
    width: "100%",
    height: "90%",
    borderTopLeftRadius: BorderRadius.lg,
    borderTopRightRadius: BorderRadius.lg,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.1)",
  },
  modalTitle: {
    fontWeight: "600",
    color: GameColors.textPrimary,
  },
  closeButton: {
    padding: Spacing.xs,
  },
  modalScrollView: {
    flex: 1,
  },
  modalScrollContent: {
    padding: Spacing.lg,
  },
  errorContainer: {
    width: "100%",
    borderRadius: BorderRadius.md,
    overflow: "hidden",
    padding: Spacing.lg,
    backgroundColor: GameColors.background,
  },
  errorText: {
    fontSize: 12,
    lineHeight: 18,
    width: "100%",
    color: GameColors.textSecondary,
    fontFamily: Fonts?.mono || "monospace",
  },
});
