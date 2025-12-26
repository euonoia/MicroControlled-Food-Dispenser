import React, { useEffect, useState, useRef } from 'react';
import { View, Text, StyleSheet, Button, Alert } from 'react-native';
import { fetchSchedules, logAudit } from '../../services/deviceService';
import { sendServo, tareScale, fetchWeight } from '../../services/esp32Service';
import { Schedule } from '../../types/device';

export default function ServoControlScreen() {
  const [weight, setWeight] = useState<number>(0);
  const [angle, setAngle] = useState<number>(0);
  const lastExecutedRef = useRef<Record<string, string>>({});

  const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

  // Poll weight every second
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

  // Optimized automatic dispense at exact minute
  useEffect(() => {
    const runScheduleCheck = async () => {
      try {
        const schedules = await fetchSchedules();
        const now = new Date();
        const currentHHMM = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

        for (const s of schedules) {
          if (!s.id || !s.enabled) continue;

          if (!lastExecutedRef.current[s.id] && s.time === currentHHMM) {
            lastExecutedRef.current[s.id] = currentHHMM;

            // Open servo
            await sendServo(s.amount);
            setAngle(s.amount);
            const w1 = await fetchWeight();
            await logAudit('AUTO_DISPENSE', s.amount, w1);

            // Close servo after 3s
            (async () => {
              await delay(3000);
              await sendServo(0);
              setAngle(0);
              const w2 = await fetchWeight();
              await logAudit('AUTO_CLOSE', 0, w2);
            })();
          }
        }

        // Reset lastExecutedRef if minute has changed
        Object.keys(lastExecutedRef.current).forEach(id => {
          if (lastExecutedRef.current[id] !== currentHHMM) {
            delete lastExecutedRef.current[id];
          }
        });

      } catch (err) {
        console.error('Schedule check failed', err);
      }
    };

    // Run check immediately and then every 5 seconds
    runScheduleCheck();
    const interval = setInterval(runScheduleCheck, 5000);
    return () => clearInterval(interval);
  }, []);

  // Manual dispense
  const handleManualDispense = async () => {
    try {
      await sendServo(90);
      setAngle(90);
      const w1 = await fetchWeight();
      await logAudit('MANUAL_DISPENSE', 90, w1);

      (async () => {
        await delay(3000);
        await sendServo(0);
        setAngle(0);
        const w2 = await fetchWeight();
        await logAudit('MANUAL_CLOSE', 0, w2);
      })();
    } catch (err) {
      console.error(err);
      Alert.alert('Error', 'Failed to move servo manually.');
    }
  };

  const handleClose = async () => {
    try {
      await sendServo(0);
      setAngle(0);
      const w = await fetchWeight();
      await logAudit('MANUAL_CLOSE', 0, w);
    } catch (err) {
      console.error(err);
      Alert.alert('Error', 'Failed to close servo.');
    }
  };

  const handleTare = async () => {
    try {
      await tareScale();
      const w = await fetchWeight();
      await logAudit('TARE_SCALE', undefined, w);
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
