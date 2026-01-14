import { Stack } from "expo-router";

export default function OnboardingLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      {/* Screens inside onboarding */}
      <Stack.Screen name="index" />        {/* Welcome screen */}
      <Stack.Screen name="provisioning" /> {/* ESP32 Wi-Fi setup */}
    </Stack>
  );
}
