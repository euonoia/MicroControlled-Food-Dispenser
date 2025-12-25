import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Button, Modal, ActivityIndicator } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

const ESP32_IP = '192.168.1.24'; // update your ESP32 IP

export default function ServoControlScreen() {
  const [angle, setAngle] = useState(0); // start at 0° (CLOSE)
  const [weight, setWeight] = useState(0);
  const [connected, setConnected] = useState(false);
  const [modalVisible, setModalVisible] = useState(true);

  const sendAngle = async (value: number) => {
    setAngle(value);
    try {
      await axios.get(`http://${ESP32_IP}/servo?angle=${value}`);
    } catch (err) {
      console.log('Servo request failed', err);
    }
  };

  const tareScale = async () => {
    try {
      await axios.get(`http://${ESP32_IP}/tare`);
    } catch (err) {
      console.log('Tare failed', err);
    }
  };

  const fetchWeight = async () => {
    try {
      const res = await axios.get(`http://${ESP32_IP}/`);
      setWeight(res.data.weight);
      if (!connected) setConnected(true); // ESP32 is connected
    } catch {
      setConnected(false);
    }
  };

  useEffect(() => {
    const interval = setInterval(fetchWeight, 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    AsyncStorage.setItem('@servo_angle', angle.toString());
  }, [angle]);

  return (
    <View style={styles.container}>
      <Modal visible={!connected} transparent animationType="fade">
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <ActivityIndicator size="large" color="#1EB1FC" />
            <Text style={{ marginTop: 10 }}>
              {connected ? 'Connected!' : 'Connecting to ESP32...'}
            </Text>
          </View>
        </View>
      </Modal>

      <Text style={styles.title}>Food Dispenser Control</Text>

      <Text style={styles.text}>Weight: {weight.toFixed(2)} g</Text>
      <Text style={styles.text}>Servo Position: {angle}°</Text>

      <View style={styles.buttonRow}>
        <Button title="CLOSE (0°)" onPress={() => sendAngle(0)} />
        <Button title="DISPENSE (90°)" onPress={() => sendAngle(90)} />
      </View>

      <View style={{ marginTop: 20 }}>
        <Button title="TARE SCALE" onPress={tareScale} />
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
