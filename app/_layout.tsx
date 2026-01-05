// root _layout.tsx
import { Stack } from "expo-router";
import { useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function RootLayout() {
  const [hasStarted, setHasStarted] = useState<boolean | null>(null);

  useEffect(() => {
    const check = async () => {
      const value = await AsyncStorage.getItem("hasStarted");
      setHasStarted(value === "true");
    };
    check();
  }, []);

  if (hasStarted === null) return null; // still loading

  return (
    <Stack screenOptions={{ headerShown: false }}>
      {hasStarted ? (
        <Stack.Screen name="(tabs)" />
      ) : (
        <Stack.Screen name="(onboarding)" />
      )}
    </Stack>
  );
}
