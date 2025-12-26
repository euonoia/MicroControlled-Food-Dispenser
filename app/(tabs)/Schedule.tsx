import React, { useEffect, useState } from 'react';
import { View, Text, Button, FlatList, TextInput, StyleSheet, Alert } from 'react-native';
import { fetchSchedules, logCommand } from '../../services/deviceService';
import { doc, updateDoc, arrayUnion } from 'firebase/firestore';
import { db } from '../../firebase/firebase';

export default function Schedule() {
  const [schedules, setSchedules] = useState<{ time: string; amount: number; enabled: boolean }[]>([]);
  const [timeInput, setTimeInput] = useState('');
  const [amountInput, setAmountInput] = useState('90');

  const DEVICE_ID = 'feeder_001';

  useEffect(() => {
    const loadSchedules = async () => {
      const sched = await fetchSchedules();
      setSchedules(sched);
    };
    loadSchedules();
  }, []);

  const addSchedule = async () => {
    if (!timeInput) return Alert.alert('Error', 'Enter time in HH:MM format');

    const newSchedule = { time: timeInput, amount: parseInt(amountInput), enabled: true };
    setSchedules([...schedules, newSchedule]);

    const ref = doc(db, 'devices', DEVICE_ID);
    await updateDoc(ref, { schedules: arrayUnion(newSchedule) });
    await logCommand('ADD_SCHEDULE', newSchedule.amount, 0);
    setTimeInput('');
  };

  const toggleSchedule = async (index: number) => {
    const updated = [...schedules];
    updated[index].enabled = !updated[index].enabled;
    setSchedules(updated);

    const ref = doc(db, 'devices', DEVICE_ID);
    await updateDoc(ref, { schedules: updated });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Schedule Feeding</Text>
      <View style={styles.row}>
        <TextInput
          placeholder="HH:MM"
          value={timeInput}
          onChangeText={setTimeInput}
          style={styles.input}
        />
        <TextInput
          placeholder="Amount"
          value={amountInput}
          onChangeText={setAmountInput}
          keyboardType="numeric"
          style={styles.input}
        />
        <Button title="Add" onPress={addSchedule} />
      </View>

      <FlatList
        data={schedules}
        keyExtractor={(item, idx) => idx.toString()}
        renderItem={({ item, index }) => (
          <View style={styles.scheduleRow}>
            <Text>{item.time} - {item.amount}° - {item.enabled ? 'Active' : 'Disabled'}</Text>
            <Button title={item.enabled ? 'Disable' : 'Enable'} onPress={() => toggleSchedule(index)} />
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  title: { fontSize: 24, marginBottom: 10 },
  row: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  input: { borderWidth: 1, flex: 1, marginRight: 5, padding: 5 },
  scheduleRow: { flexDirection: 'row', justifyContent: 'space-between', marginVertical: 5 },
});
