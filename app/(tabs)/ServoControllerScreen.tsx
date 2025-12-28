import React, { useEffect, useState } from 'react';
import { View, Text, Button, StyleSheet, Alert } from 'react-native';
import { fetchWeight, dispenseServo, tareScale } from '../../services/esp32Service';

export default function ServoController() {
  const [weight, setWeight] = useState<number>(0);
  const [angle, setAngle] = useState<number>(0);

  useEffect(() => {
    const interval = setInterval(async () => {
      const w = await fetchWeight();
      setWeight(w);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleTare = async () => {
    await tareScale();
    Alert.alert('Scale tared');
  };

  const handleDispense = async (dispAngle: number) => {
    await dispenseServo(dispAngle);
    setAngle(dispAngle);

    setTimeout(async () => {
      await dispenseServo(0);
      setAngle(0);
    }, 3000); // match ESP32 dispenseDuration
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>ESP32 Feeder</Text>
      <Text>Weight: {weight.toFixed(1)} g</Text>
      <Text>Servo Angle: {angle}°</Text>

      <View style={{ marginTop: 20, gap: 10 }}>
        <Button title="Tare Scale" onPress={handleTare} />
        <Button title="Dispense 90°" onPress={() => handleDispense(90)} />
        <Button title="Dispense 45°" onPress={() => handleDispense(45)} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  title: { fontSize: 24, marginBottom: 20 },
});
