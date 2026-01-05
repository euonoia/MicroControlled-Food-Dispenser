// app/_layout.tsx
import { Stack } from "expo-router";
import { useEffect, useState } from "react";
import { View, ActivityIndicator, StyleSheet } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useTheme } from "../theme/useTheme";

export default function RootLayout() {
  const theme = useTheme();
  const [hasStarted, setHasStarted] = useState<boolean | null>(null);

  useEffect(() => {
    const check = async () => {
      const value = await AsyncStorage.getItem("hasStarted");
      setHasStarted(value === "true");
    };
    check();
  }, []);

  // Loading state
  if (hasStarted === null) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: theme.background }]}>
        <ActivityIndicator size="large" color={theme.primary} />
      </View>
    );
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      {hasStarted ? (
        <Stack.Screen name="(tabs)" />         // first-time tabs user
      ) : (
        <Stack.Screen name="(onboarding)" />   // first-time onboarding
      )}
    </Stack>
  );
}

const styles = StyleSheet.create({
  loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
});
