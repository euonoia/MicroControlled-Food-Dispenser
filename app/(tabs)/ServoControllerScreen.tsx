import React, { useState } from "react";
import { View, Text, StyleSheet, Alert, SafeAreaView } from "react-native";

// Imports from our new structure
import { useDeviceStatus } from "../../hooks/useDeviceStatus";
import { moveServo } from "../../services/esp32Service";
import { DEVICE_CONFIG } from "../../config/deviceConfig";
import ConnectionBadge from "../../components/ConnectionBadge";
import FeedButton from "../../components/FeedButton";

export default function FeederDashboard() {
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
    } catch (error) {
      Alert.alert("Error", "Failed to dispense food.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Text style={styles.headerTitle}>Pet Feeder 3000</Text>

        {/* 1. Status Section */}
        <ConnectionBadge 
          online={isOnline} 
          lastSeen={status?.lastSeen} 
        />

        {/* 2. Controls Section */}
        <View style={styles.controlsContainer}>
          <Text style={styles.sectionLabel}>Select Portion:</Text>
          
          <FeedButton
            title="Small Portion (0°)"
            onPress={() => handleFeed(DEVICE_CONFIG.PORTIONS.SMALL)}
            isLoading={loading}
            disabled={!isOnline}
          />
          
          <FeedButton
            title="Large Portion (90°)"
            onPress={() => handleFeed(DEVICE_CONFIG.PORTIONS.LARGE)}
            isLoading={loading}
            disabled={!isOnline}
          />
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#f7fafc" },
  container: { flex: 1, padding: 20, alignItems: "center" },
  headerTitle: { fontSize: 28, fontWeight: "bold", color: "#2d3748", marginBottom: 30, marginTop: 10 },
  controlsContainer: { width: "100%", alignItems: "center", marginTop: 40 },
  sectionLabel: { fontSize: 16, color: "#718096", marginBottom: 15 },
});