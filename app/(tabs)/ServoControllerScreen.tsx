import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  Button,
  Modal,
  ActivityIndicator,
  StyleSheet,
  Alert,
} from "react-native";

import { getDatabase, ref, onValue, set, update } from "firebase/database";
import { firebaseApp } from "../../firebase/firebase";
import { moveServo } from "../../services/esp32Service";

const db = getDatabase(firebaseApp);
const DEVICE_ID = "feeder_001";

type ConnectivityStatus = {
  online: boolean;
  lastSeen: number;
  ip?: string;
};

export default function ServoController() {
  const [modalVisible, setModalVisible] = useState(false);
  const [connectivity, setConnectivity] =
    useState<ConnectivityStatus | null>(null);

  // Time in seconds to consider the device offline
  const OFFLINE_THRESHOLD = 20;

  useEffect(() => {
    const connRef = ref(db, `/devices/${DEVICE_ID}/connectivity`);

    const unsub = onValue(connRef, async (snap) => {
      if (snap.exists()) {
        const data = snap.val() as ConnectivityStatus;
        const now = Math.floor(Date.now() / 1000);

        // Check if lastSeen is older than threshold
        let isOnline = data.online && now - data.lastSeen <= OFFLINE_THRESHOLD;

        // If the device exceeded threshold and still online, mark it offline in Firebase
        if (!isOnline && data.online) {
          await update(connRef, { online: false });
          isOnline = false;
        }

        setConnectivity({ ...data, online: isOnline });
      } else {
        setConnectivity(null);
      }
    });

    return unsub;
  }, []);

  const handleMove = async (angle: number) => {
    if (!connectivity?.online) {
      Alert.alert("Device Offline", "ESP32 is not connected.");
      return;
    }

    const now = Math.floor(Date.now() / 1000);
    if (now - connectivity.lastSeen > OFFLINE_THRESHOLD) {
      Alert.alert("Device Timeout", "ESP32 stopped responding.");
      return;
    }

    setModalVisible(true);

    try {
      await moveServo(angle);
    } catch (err) {
      Alert.alert("Error", "Servo command failed.");
    } finally {
      setModalVisible(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>ESP32 Feeder</Text>

      <Text>
        Status: {connectivity?.online ? "🟢 Online" : "🔴 Offline"}
      </Text>

      {connectivity && (
        <Text>Last Seen: {new Date(connectivity.lastSeen * 1000).toLocaleTimeString()}</Text>
      )}

      <View style={{ height: 20 }} />

      <Button title="Dispense 0°" onPress={() => handleMove(0)} />
      <View style={{ height: 10 }} />
      <Button title="Dispense 90°" onPress={() => handleMove(90)} />

      <Modal transparent visible={modalVisible}>
        <View style={styles.modalBackground}>
          <View style={styles.modalContent}>
            <ActivityIndicator size="large" />
            <Text>Moving servo…</Text>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center" },
  title: { fontSize: 24, marginBottom: 20 },
  modalBackground: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "white",
    padding: 20,
    borderRadius: 10,
  },
});
