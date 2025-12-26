import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Button, Alert } from 'react-native';
import { fetchSchedules, logCommand, canDispense } from '../../services/deviceService';
import { sendServo, tareScale, fetchWeight } from '../../services/esp32Service';
import { Schedule } from '../../types/device';

export default function ServoControlScreen() {
  const [weight, setWeight] = useState(0);
  const [angle, setAngle] = useState(0);
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [firstCheckDone, setFirstCheckDone] = useState(false);

  // Poll ESP32 weight every second
  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const w = await fetchWeight();
        setWeight(w);
      } catch {}
      setFirstCheckDone(true);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Poll Firestore schedules every minute
  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const sched = await fetchSchedules();
        setSchedules(sched);

        const now = new Date();
        const currentHHMM = `${String(now.getHours()).padStart(2,'0')}:${String(now.getMinutes()).padStart(2,'0')}`;

        for (let s of sched) {
          if (s.enabled && s.time === currentHHMM) {
            const allowed = await canDispense();
            if (!allowed) continue;

            // Move servo
            await sendServo(s.amount); // s.amount = 90 for dispense
            setAngle(s.amount);
            await logCommand('AUTO_DISPENSE', s.amount, weight);

            // Return servo to 0 after 3 seconds
            setTimeout(async () => {
              await sendServo(0);
              setAngle(0);
              await logCommand('AUTO_CLOSE', 0, weight);
            }, 3000);
          }
        }
      } catch (err) {
        console.error('Schedule check failed', err);
      }
    }, 60000); // every minute

    return () => clearInterval(interval);
  }, [weight]);

  const handleManualDispense = async () => {
    try {
      const allowed = await canDispense();
      if (!allowed) return Alert.alert('Cannot dispense', 'Food bowl already full or schedule blocked.');

      await sendServo(90);
      setAngle(90);
      await logCommand('MANUAL_DISPENSE', 90, weight);

      setTimeout(async () => {
        await sendServo(0);
        setAngle(0);
        await logCommand('MANUAL_CLOSE', 0, weight);
      }, 3000);
    } catch (err) {
      console.error(err);
    }
  };

  const handleTare = async () => {
    try {
      await tareScale();
      await logCommand('TARE_SCALE', undefined, weight);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Food Dispenser Control</Text>
      <Text style={styles.text}>Weight: {weight.toFixed(2)} g</Text>
      <Text style={styles.text}>Servo Position: {angle}°</Text>

      <View style={styles.buttonRow}>
        <Button title="CLOSE (0°)" onPress={() => sendServo(0).then(() => setAngle(0))} />
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
