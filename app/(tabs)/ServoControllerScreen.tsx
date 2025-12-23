import React, { useState } from 'react';
import { View, Text, StyleSheet, Button } from 'react-native';
import Slider from '@react-native-community/slider';
import axios from 'axios';

export default function ServoControlScreen() {
  const [angle, setAngle] = useState(90);
  const ESP32_IP = '192.168.1.24'; // Replace with your ESP32 IP

  const sendAngle = async (value: number) => {
    setAngle(value);
    try {
      await axios.get(`http://${ESP32_IP}/servo?angle=${value}`);
    } catch (error) {
      console.log('Failed to send angle:', error);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.text}>Servo Angle: {angle}</Text>

      {/* Slider Control */}
      <Slider
        style={{ width: 300, height: 40 }}
        minimumValue={0}
        maximumValue={180}
        step={1}
        value={angle}
        onValueChange={sendAngle}
        minimumTrackTintColor="#1EB1FC"
        maximumTrackTintColor="#000000"
      />

      {/* Preset Buttons */}
      <View style={styles.buttonRow}>
        <Button title="0°" onPress={() => sendAngle(0)} />
        <Button title="90°" onPress={() => sendAngle(90)} />
        <Button title="180°" onPress={() => sendAngle(180)} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  text: { fontSize: 24, marginBottom: 20 },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: 300,
    marginTop: 20,
  },
});
