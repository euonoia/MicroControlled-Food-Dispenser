import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme } from "../../theme/useTheme";
import { useDeviceStatus } from "../../app-example/hooks/useDeviceStatus";
import { moveServo } from "../../services/esp32Service";
import { DEVICE_CONFIG } from "../../config/deviceConfig";

import ConnectionBadge from "../../app-example/components/ConnectionBadge";
import FeedButton from "../../app-example/components/FeedButton";

export default function IndexScreen() {
  const theme = useTheme();
  const { status, isOnline } = useDeviceStatus();
  const [loading, setLoading] = useState(false);

  const handleFeed = async (angle: number) => {
    if (!isOnline) {
      Alert.alert("Offline", "Cannot feed while device is offline.");
      return;
    }

    setLoading(true);
    try {
      await moveServo(angle);
      Alert.alert("Success", "Yummy! Food dispensed.");
    } catch {
      Alert.alert("Error", "Failed to dispense food.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView
      style={[
        styles.safeArea,
        { backgroundColor: theme.background },
      ]}
    >
      <View style={styles.container}>
        <Text
          style={[
            styles.headerTitle,
            { color: theme.text },
          ]}
        >
          Pet Feeder 3000
        </Text>

        {/* STATUS */}
        <ConnectionBadge
          online={isOnline}
          lastSeen={status?.lastSeen}
        />

        {/* CONTROLS */}
        <View style={styles.controlsContainer}>
          <Text
            style={[
              styles.sectionLabel,
              { color: theme.muted },
            ]}
          >
            Select Portion
          </Text>

          <FeedButton
            title="Small Portion"
            onPress={() =>
              handleFeed(DEVICE_CONFIG.PORTIONS.SMALL)
            }
            isLoading={loading}
            disabled={!isOnline}
          />

          <FeedButton
            title="Large Portion"
            onPress={() =>
              handleFeed(DEVICE_CONFIG.PORTIONS.LARGE)
            }
            isLoading={loading}
            disabled={!isOnline}
          />
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
    padding: 20,
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "700",
    marginBottom: 30,
    marginTop: 10,
  },
  controlsContainer: {
    width: "100%",
    alignItems: "center",
    marginTop: 40,
  },
  sectionLabel: {
    fontSize: 16,
    marginBottom: 15,
    fontWeight: "500",
  },
});
