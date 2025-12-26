import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Button, Modal, ActivityIndicator, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { sendServo, tareScale, fetchWeight } from '../../services/esp32Service';
import { logCommand, canDispense } from '../../services/deviceService';

export default function ServoControlScreen() {
  const [angle, setAngle] = useState(0);
  const [weight, setWeight] = useState(0);
  const [connected, setConnected] = useState(false);
  const [firstCheckDone, setFirstCheckDone] = useState(false);

  // Poll ESP32 weight every second
  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const w = await fetchWeight();
        setWeight(w);
        setConnected(true);
      } catch {
        setConnected(false);
      }
      setFirstCheckDone(true);
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  // Persist last angle locally
  useEffect(() => {
    AsyncStorage.setItem('@servo_angle', angle.toString());
  }, [angle]);

  const handleServo = async (value: number) => {
    try {
      const allowed = await canDispense();
      if (!allowed) {
        Alert.alert('Cannot dispense', 'Food already present or schedule not active.');
        return;
      }

      setAngle(value);
      await sendServo(value);
      await logCommand('SET_SERVO', value, weight);
    } catch (err) {
      console.error('Servo command failed:', err);
    }
  };

  const handleTare = async () => {
    try {
      await tareScale();
      await logCommand('TARE_SCALE', undefined, weight);
    } catch (err) {
      console.error('Tare command failed:', err);
    }
  };

  return (
    <View style={styles.container}>
      <Modal visible={!connected && firstCheckDone} transparent animationType="fade">
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <ActivityIndicator size="large" color="#1EB1FC" />
            <Text style={{ marginTop: 10 }}>
              {connected ? 'Connected!' : 'Connecting to feeder...'}
            </Text>
          </View>
        </View>
      </Modal>

      <Text style={styles.title}>Food Dispenser Control</Text>
      <Text style={styles.text}>Weight: {weight.toFixed(2)} g</Text>
      <Text style={styles.text}>Servo Position: {angle}°</Text>

      <View style={styles.buttonRow}>
        <Button title="CLOSE (0°)" onPress={() => handleServo(0)} />
        <Button title="DISPENSE (90°)" onPress={() => handleServo(90)} />
      </View>

      <View style={{ marginTop: 20 }}>
        <Button title="TARE SCALE" onPress={handleTare} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  title: { fontSize: 26, marginBottom: 20 },
  text: { fontSize: 20, marginVertical: 10 },
  buttonRow: { flexDirection: 'row', justifyContent: 'space-between', width: 280, marginTop: 20 },
  modalContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#00000088' },
  modalContent: { padding: 20, backgroundColor: 'white', borderRadius: 10, alignItems: 'center' },
});
