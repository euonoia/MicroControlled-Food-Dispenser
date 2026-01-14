import { useEffect, useState } from "react";
import { View, ActivityIndicator, Alert, StyleSheet, Text, Button } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import WifiManager from "react-native-wifi-reborn";
import { useRouter } from "expo-router";
import { useTheme } from "../../theme/useTheme";

export default function ProvisioningScreen() {
  const theme = useTheme();
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  const connectESP32 = async () => {
    try {
      // Scan for available networks (optional)
      const networks = await WifiManager.reScanAndLoadWifiList();
      console.log("Available networks:", networks);

      // Connect to ESP32 access point
      const ssid = "ESP32_FEEDER";
      const password = "12345678";

      await WifiManager.connectToProtectedSSID(ssid, password, false, false);
      console.log("Connected to ESP32 Wi-Fi:", ssid);

      // Mark onboarding as complete
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
      setLoading(false);
    }
  };

  useEffect(() => {
    connectESP32();
  }, []);

  if (loading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: theme.background }]}>
        <ActivityIndicator size="large" color={theme.primary} />
        <Text style={{ color: theme.muted, marginTop: 12 }}>Connecting to ESP32...</Text>
      </View>
    );
  }

  return (
    <View style={[styles.loadingContainer, { backgroundColor: theme.background }]}>
      <Text style={{ color: theme.muted }}>Provisioning failed. Please try again.</Text>
      <Button title="Retry" onPress={connectESP32} color={theme.secondary} />
    </View>
  );
}

const styles = StyleSheet.create({
  loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center", padding: 24 },
});
