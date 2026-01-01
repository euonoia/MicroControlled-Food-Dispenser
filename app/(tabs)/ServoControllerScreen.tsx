import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  Button,
  Modal,
  ActivityIndicator,
  StyleSheet,
  Alert
} from "react-native";

import { moveServo } from "../../services/esp32Service";
import { getDatabase, ref, onValue, get } from "firebase/database";
import { firebaseApp } from "../../firebase/firebase";

const db = getDatabase(firebaseApp);
const DEVICE_ID = "feeder_001";

/* =========================
   Types
   ========================= */
type ConnectivityStatus = {
  online: boolean;
  lastSeen: number;
  ip?: string;
};

export default function ServoController() {
  const [modalVisible, setModalVisible] = useState(false);
  const [connectivity, setConnectivity] =
    useState<ConnectivityStatus | null>(null);

  /* =========================
     Listen to ESP32 connectivity
     ========================= */
  useEffect(() => {
    const connRef = ref(
      db,
      `/devices/${DEVICE_ID}/connectivity`
    );

    const unsubscribe = onValue(connRef, (snapshot) => {
      if (snapshot.exists()) {
        setConnectivity(snapshot.val());
      } else {
        setConnectivity(null);
      }
    });

    return () => unsubscribe();
  }, []);

  /* =========================
     Wait for servo idle
     (with timeout safety)
     ========================= */
  const waitForIdle = (timeoutMs = 10000) => {
    return new Promise<void>((resolve, reject) => {
      const servoRef = ref(db, `/devices/${DEVICE_ID}/servo`);

      let unsub: (() => void) | null = null;

      const timeout = setTimeout(() => {
        if (unsub) unsub();
        reject(new Error("Servo timeout"));
      }, timeoutMs);

      unsub = onValue(servoRef, (snapshot) => {
        const data = snapshot.val();
        if (!data) return;

        if (data.status === "idle") {
          clearTimeout(timeout);
          if (unsub) unsub();
          resolve();
        }
      });
    });
  };

  /* =========================
     Handle servo move
     ========================= */
  const handleMove = async (angle: number) => {
    /* 1️⃣ Connectivity validation */
    if (
      !connectivity ||
      !connectivity.online ||
      Date.now() - connectivity.lastSeen > 15000
    ) {
      Alert.alert(
        "Device Offline",
        "ESP32 is not connected. Please check power and Wi-Fi."
      );
      return;
    }

    const servoRef = ref(db, `/devices/${DEVICE_ID}/servo`);

    /* 2️⃣ Read current servo state */
    const snapshot = await get(servoRef);
    const servoState = snapshot.val();

    /* 3️⃣ Prevent duplicate angle request */
    if (servoState?.targetAngle === angle) {
      Alert.alert(
        "Action Not Allowed",
        `Servo is already at ${angle}°`
      );
      return;
    }

    /* 4️⃣ Execute command with UI lock */
    setModalVisible(true);

    try {
      await moveServo(angle);
      await waitForIdle();
    } catch (err) {
      Alert.alert(
        "Operation Failed",
        "ESP32 did not respond. Please try again."
      );
    } finally {
      setModalVisible(false);
    }
  };

  /* =========================
     UI
     ========================= */
  return (
    <View style={styles.container}>
      <Text style={styles.title}>ESP32 Feeder</Text>

      <Button
        title="Dispense 0°"
        onPress={() => handleMove(0)}
      />
      <View style={{ height: 10 }} />
      <Button
        title="Dispense 90°"
        onPress={() => handleMove(90)}
      />

      {/* Blocking modal */}
      <Modal
        transparent
        visible={modalVisible}
        animationType="fade"
      >
        <View style={styles.modalBackground}>
          <View style={styles.modalContent}>
            <ActivityIndicator size="large" />
            <Text style={{ marginTop: 15 }}>
              Please wait, servo moving…
            </Text>
          </View>
        </View>
      </Modal>
    </View>
  );
}

/* =========================
   Styles
   ========================= */
const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center"
  },
  title: {
    fontSize: 24,
    marginBottom: 20
  },
  modalBackground: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.4)"
  },
  modalContent: {
    width: 250,
    padding: 20,
    backgroundColor: "white",
    borderRadius: 10,
    alignItems: "center"
  }
});
