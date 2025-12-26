import React, { useEffect, useState, useRef } from 'react';
import { View, Text, StyleSheet, Alert, Button} from 'react-native';
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

  // Automatic dispense based on schedule
  useEffect(() => {
    const runScheduleCheck = async () => {
      try {
        const schedules = await fetchSchedules();
        const now = new Date();
        const currentHHMM = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

        for (const s of schedules) {
          if (!s.id || !s.enabled) continue;

          // Only execute once per schedule per minute
          if (!lastExecutedRef.current[s.id] && s.time === currentHHMM) {
            lastExecutedRef.current[s.id] = currentHHMM;

            try {
              // Open servo
              await sendServo(s.amount);
              setAngle(s.amount);
              const wOpen = await fetchWeight();
              await logAudit('AUTO_DISPENSE', s.amount, wOpen);

              // Close servo after 3 seconds
              await delay(3000);
              await sendServo(0);
              setAngle(0);
              const wClose = await fetchWeight();
              await logAudit('AUTO_CLOSE', 0, wClose);
            } catch (servoErr) {
              console.error('Servo operation failed:', servoErr);
              await logAudit('ERROR', 0, weight, `Servo operation failed: ${servoErr}`);
            }
          }
        }

        // Reset executed flags if minute changed
        Object.keys(lastExecutedRef.current).forEach(id => {
          if (lastExecutedRef.current[id] !== currentHHMM) delete lastExecutedRef.current[id];
        });
      } catch (err) {
        console.error('Schedule check failed', err);
        await logAudit('ERROR', 0, weight, `Schedule check failed: ${err}`);
      }
    };

    // Run immediately and then every 5 seconds
    runScheduleCheck();
    const interval = setInterval(runScheduleCheck, 5000);
    return () => clearInterval(interval);
  }, [weight]);

  // Tare scale
  const handleTare = async () => {
    try {
      await tareScale();
      const w = await fetchWeight();
      await logAudit('TARE_SCALE', undefined, w);
    } catch (err) {
      console.error(err);
      Alert.alert('Error', 'Failed to tare scale.');
      await logAudit('ERROR', 0, weight, `Tare scale failed: ${err}`);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Automatic Food Dispenser</Text>
      <Text style={styles.text}>Current Weight: {weight.toFixed(2)} g</Text>
      <Text style={styles.text}>Servo Position: {angle}°</Text>

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
});
