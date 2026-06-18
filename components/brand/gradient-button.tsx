import React from "react";
import { ActivityIndicator, Platform, Pressable, StyleSheet, Text, View, type ViewStyle } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import * as Haptics from "expo-haptics";

import { brandGradient } from "@/theme.config";

type GradientButtonProps = {
  label?: string;
  onPress?: () => void;
  disabled?: boolean;
  loading?: boolean;
  icon?: React.ReactNode;
  style?: ViewStyle;
  height?: number;
  rounded?: number;
  textStyle?: object;
};

/**
 * Primary call-to-action button using the OneVox green->cyan gradient.
 */
export function GradientButton({
  label,
  onPress,
  disabled,
  loading,
  icon,
  style,
  height = 60,
  rounded = 16,
  textStyle,
}: GradientButtonProps) {
  const handlePress = () => {
    if (disabled || loading) return;
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    onPress?.();
  };

  return (
    <Pressable
      onPress={handlePress}
      disabled={disabled || loading}
      style={({ pressed }) => [
        { borderRadius: rounded, overflow: "hidden" },
        (disabled || loading) && { opacity: 0.5 },
        pressed && !disabled && !loading && { transform: [{ scale: 0.98 }] },
        style,
      ]}
    >
      <LinearGradient
        colors={brandGradient as [string, string, ...string[]]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.gradient, { height, borderRadius: rounded }]}
      >
        {loading ? (
          <ActivityIndicator color="#0A1628" />
        ) : (
          <View style={styles.content}>
            {icon}
            {label ? <Text style={[styles.label, textStyle]}>{label}</Text> : null}
          </View>
        )}
      </LinearGradient>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  gradient: {
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 20,
  },
  content: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
  },
  label: {
    color: "#0A1628",
    fontSize: 18,
    fontWeight: "700",
  },
});
