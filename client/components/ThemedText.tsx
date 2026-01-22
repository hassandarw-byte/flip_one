import { Text, type TextProps, StyleSheet } from "react-native";

import { useTheme } from "@/hooks/useTheme";
import { Typography } from "@/constants/theme";

const fontStyles = StyleSheet.create({
  regular: {
    fontFamily: "Tajawal_400Regular",
  },
  medium: {
    fontFamily: "Tajawal_500Medium",
  },
  bold: {
    fontFamily: "Tajawal_700Bold",
  },
  extraBold: {
    fontFamily: "Tajawal_800ExtraBold",
  },
});

export type ThemedTextProps = TextProps & {
  lightColor?: string;
  darkColor?: string;
  type?: "h1" | "h2" | "h3" | "h4" | "body" | "small" | "link";
};

export function ThemedText({
  style,
  lightColor,
  darkColor,
  type = "body",
  ...rest
}: ThemedTextProps) {
  const { theme, isDark } = useTheme();

  const getColor = () => {
    if (isDark && darkColor) {
      return darkColor;
    }

    if (!isDark && lightColor) {
      return lightColor;
    }

    if (type === "link") {
      return theme.link;
    }

    return theme.text;
  };

  const getTypeStyle = () => {
    switch (type) {
      case "h1":
        return Typography.h1;
      case "h2":
        return Typography.h2;
      case "h3":
        return Typography.h3;
      case "h4":
        return Typography.h4;
      case "body":
        return Typography.body;
      case "small":
        return Typography.small;
      case "link":
        return Typography.link;
      default:
        return Typography.body;
    }
  };

  const getFontFamily = () => {
    switch (type) {
      case "h1":
      case "h2":
        return fontStyles.extraBold;
      case "h3":
      case "h4":
        return fontStyles.bold;
      case "body":
      case "link":
        return fontStyles.medium;
      case "small":
        return fontStyles.regular;
      default:
        return fontStyles.medium;
    }
  };

  return (
    <Text style={[{ color: getColor() }, getTypeStyle(), getFontFamily(), style]} {...rest} />
  );
}
