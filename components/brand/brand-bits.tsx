import React from "react";
import { StyleSheet, Text, View, type ViewStyle, type TextStyle } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import MaskedView from "@react-native-masked-view/masked-view";

import { brandGradient } from "@/theme.config";

/**
 * Wordmark with "OneVox" and "Mobile" centered below it.
 */
export function OneVoxWordmark({ size = 28, subtitle }: { size?: number; subtitle?: string }) {
  return (
    <View style={styles.wordmarkWrap}>
      <View style={styles.row}>
        <Text style={[styles.word, { fontSize: size }]}>One</Text>
        <Text style={[styles.vox, { fontSize: size }]}>Vox</Text>
      </View>
      <Text style={[styles.mobileText, { fontSize: Math.round(size * 0.52) }]}>Mobile</Text>
      {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
    </View>
  );
}

/**
 * Text painted with the brand gradient using a mask.
 */
export function GradientText({ text, style }: { text: string; style?: TextStyle }) {
  return (
    <MaskedView maskElement={<Text style={[style, { backgroundColor: "transparent" }]}>{text}</Text>}>
      <LinearGradient
        colors={brandGradient as [string, string, ...string[]]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
      >
        <Text style={[style, { opacity: 0 }]}>{text}</Text>
      </LinearGradient>
    </MaskedView>
  );
}

/**
 * A view wrapped with a gradient border (used for highlighted cards/inputs).
 */
export function GradientBorder({
  children,
  borderWidth = 1.5,
  radius = 20,
  style,
  active = true,
}: {
  children: React.ReactNode;
  borderWidth?: number;
  radius?: number;
  style?: ViewStyle;
  active?: boolean;
}) {
  if (!active) {
    return (
      <View style={[{ borderRadius: radius, borderWidth, borderColor: "#22354F" }, style]}>{children}</View>
    );
  }
  return (
    <LinearGradient
      colors={brandGradient as [string, string, ...string[]]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={[{ borderRadius: radius, padding: borderWidth }, style]}
    >
      <View style={{ borderRadius: radius - borderWidth, backgroundColor: "#101F38", overflow: "hidden" }}>
        {children}
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  wordmarkWrap: {
    alignItems: "center",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  word: {
    color: "#FFFFFF",
    fontWeight: "800",
  },
  vox: {
    color: "#34D8A0",
    fontWeight: "800",
  },
  mobileText: {
    color: "#C7CEDB",
    fontWeight: "500",
    marginTop: -3,
  },
  subtitle: {
    color: "#8A9BB5",
    fontSize: 13,
    marginTop: 2,
    letterSpacing: 1,
  },
});
