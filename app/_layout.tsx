import { Stack, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { View, ActivityIndicator, StyleSheet, Alert } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import WifiManager from "react-native-wifi-reborn";
import { useTheme } from "../theme/useTheme";

export default function OnboardingLayout() {
  const theme = useTheme();
  const router = useRouter();
  const [provisioning, setProvisioning] = useState(true);

  useEffect(() => {
    const startProvisioning = async () => {
      try {
        // Example: scan for available networks (optional)
        const networks = await WifiManager.reScanAndLoadWifiList();
        console.log("Available networks:", networks);

        // For demo: connect to a hardcoded ESP32 AP SSID
        const ssid = "ESP32_FEEDER";
        const password = "12345678";

        await WifiManager.connectToProtectedSSID(ssid, password, false, false);
        console.log("Connected to Wi-Fi:", ssid);

        // Save onboarding completion flag
        await AsyncStorage.setItem("hasStarted", "true");

        // Redirect to main tabs
        router.replace("/(tabs)");
      } catch (err) {
        console.error("Provisioning failed:", err);
        Alert.alert(
          "Wi-Fi Connection Failed",
          "Could not connect to device Wi-Fi. Please try again."
        );
      } finally {
        setProvisioning(false);
      }
    };

    startProvisioning();
  }, []);

  // Loading / provisioning state
  if (provisioning) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: theme.background }]}>
        <ActivityIndicator size="large" color={theme.primary} />
      </View>
    );
  }

  // fallback in case provisioning fails
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
    </Stack>
  );
}

const styles = StyleSheet.create({
  loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
});
