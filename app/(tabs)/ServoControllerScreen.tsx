import React, { useEffect, useState, useRef } from 'react';
import { View, Text, StyleSheet, Button, Alert } from 'react-native';
import { fetchSchedules, logAudit } from '../../services/deviceService';
import { sendServo, tareScale, fetchWeight } from '../../services/esp32Service';
import { Schedule } from '../../types/device';

export default function ServoControlScreen() {
  const [weight, setWeight] = useState<number>(0);
  const [angle, setAngle] = useState<number>(0);

  // Keeps track of which schedules have already executed this minute
  const lastExecutedRef = useRef<Record<string, string>>({});

  // Poll ESP32 weight every second
  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const w = await fetchWeight();
        setWeight(w);
      } catch (err) {
        console.error('Fetch weight failed', err);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  // Automatic dispense every minute based on schedule
  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const schedules = await fetchSchedules();
        const now = new Date();
        const currentHHMM = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

        for (const s of schedules) {
          // Ensure schedule has an ID
          if (!s.id) continue;

          const lastExecutedTime = lastExecutedRef.current[s.id];

          // Execute only if schedule matches current time and hasn't run yet
          if (s.enabled && s.time === currentHHMM && lastExecutedTime !== currentHHMM) {
            lastExecutedRef.current[s.id] = currentHHMM;

            // Automatic dispense
            await sendServo(s.amount);
            setAngle(s.amount);

            const currentWeight = await fetchWeight();
            await logAudit('AUTO_DISPENSE', s.amount, currentWeight);

            // Return servo to 0 after 3 seconds
            setTimeout(async () => {
              await sendServo(0);
              setAngle(0);
              const weightAfter = await fetchWeight();
              await logAudit('AUTO_CLOSE', 0, weightAfter);
            }, 3000);
          }
        }
      } catch (err) {
        console.error('Schedule check failed', err);
      }
    }, 1000); // Check every second to catch minute change

    return () => clearInterval(interval);
  }, []);

  const handleManualDispense = async () => {
    try {
      await sendServo(90);
      setAngle(90);

      const currentWeight = await fetchWeight();
      await logAudit('MANUAL_DISPENSE', 90, currentWeight);

      setTimeout(async () => {
        await sendServo(0);
        setAngle(0);
        const weightAfter = await fetchWeight();
        await logAudit('MANUAL_CLOSE', 0, weightAfter);
      }, 3000);
    } catch (err) {
      console.error(err);
      Alert.alert('Error', 'Failed to move servo manually.');
    }
  };

  const handleClose = async () => {
    try {
      await sendServo(0);
      setAngle(0);
      const currentWeight = await fetchWeight();
      await logAudit('MANUAL_CLOSE', 0, currentWeight);
    } catch (err) {
      console.error(err);
      Alert.alert('Error', 'Failed to close servo.');
    }
  };

  const handleTare = async () => {
    try {
      await tareScale();
      const currentWeight = await fetchWeight();
      await logAudit('TARE_SCALE', undefined, currentWeight);
    } catch (err) {
      console.error(err);
      Alert.alert('Error', 'Failed to tare scale.');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Food Dispenser Control</Text>
      <Text style={styles.text}>Weight: {weight.toFixed(2)} g</Text>
      <Text style={styles.text}>Servo Position: {angle}°</Text>

      <View style={styles.buttonRow}>
        <Button title="CLOSE (0°)" onPress={handleClose} />
        <Button title="DISPENSE (90°)" onPress={handleManualDispense} />
      </View>

      <View style={{ marginTop: 20 }}>
        <Button title="TARE SCALE" onPress={handleTare} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  title: { fontSize: 26, marginBottom: 20 },
  text: { fontSize: 20, marginVertical: 10 },
  buttonRow: { flexDirection: 'row', justifyContent: 'space-between', width: 280, marginTop: 20 },
});
