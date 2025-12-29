import React, { useState, useEffect } from "react";
import { View, Text, Button, Modal, ActivityIndicator, StyleSheet } from "react-native";
import { moveServo } from "../../services/esp32Service";
import { getDatabase, ref, onValue } from "firebase/database";
import { firebaseApp } from "../../firebase/firebase";
import { Alert } from "react-native";


const db = getDatabase(firebaseApp);
const DEVICE_ID = "feeder_001";

export default function ServoController() {
  const [modalVisible, setModalVisible] = useState(false);

  const waitForIdle = (angle: number) => {
    return new Promise<void>((resolve) => {
      const servoRef = ref(db, `/devices/${DEVICE_ID}/servo`);

      const unsubscribe = onValue(servoRef, (snapshot) => {
        const data = snapshot.val();
        if (!data) return;

        // When servo becomes idle, resolve
        if (data.status === "idle") {
          unsubscribe(); // stop listening
          resolve();
        }
      });
    });
  };

 const handleMove = async (angle: number) => {
  const servoRef = ref(db, `/devices/${DEVICE_ID}/servo`);
  
  // Read current servo state
  const snapshot = await new Promise<any>((resolve) => {
    onValue(servoRef, (snap) => {
      resolve(snap.val());
    }, { onlyOnce: true });
  });

  if (snapshot?.targetAngle === angle) {
    // Show error alert
    Alert.alert(
      "Action Not Allowed",
      `Servo is already at ${angle}°`,
      [{ text: "OK" }]
    );
    return; // Don't send command
  }

  // Show modal and send command
  setModalVisible(true);
  try {
    await moveServo(angle);
    await waitForIdle(angle);
  } catch (err) {
    Alert.alert("Error", "Failed to move servo. Please try again.");
  } finally {
    setModalVisible(false);
  }
};


  return (
    <View style={{ flex:1, justifyContent:"center", alignItems:"center" }}>
      <Text style={{ fontSize:24, marginBottom:20 }}>ESP32 Feeder</Text>

      <Button title="Dispense 0°" onPress={() => handleMove(0)} />
      <Button title="Dispense 90°" onPress={() => handleMove(90)} />

      {/* Modal */}
      <Modal transparent={true} visible={modalVisible} animationType="fade">
        <View style={styles.modalBackground}>
          <View style={styles.modalContent}>
            <ActivityIndicator size="large" color="#0000ff" />
            <Text style={{ marginTop: 15 }}>Please wait, servo moving...</Text>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  modalBackground: {
    flex:1,
    justifyContent:"center",
    alignItems:"center",
    backgroundColor:"rgba(0,0,0,0.4)"
  },
  modalContent: {
    width:250,
    padding:20,
    backgroundColor:"white",
    borderRadius:10,
    alignItems:"center"
  }
});
