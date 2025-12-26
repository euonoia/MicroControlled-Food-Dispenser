import React, { useEffect, useState } from 'react';
import { View, Text, Button, FlatList, TextInput, StyleSheet, Alert } from 'react-native';
import { Schedule as ScheduleType } from '../../types/device';
import { fetchSchedules, addSchedule, toggleSchedule } from '../../services/deviceService';
import { sendServo } from '../../services/esp32Service';

export default function Schedule() {
  const [schedules, setSchedules] = useState<ScheduleType[]>([]);
  const [timeInput, setTimeInput] = useState('');
  const [amountInput, setAmountInput] = useState('90');

  const loadSchedules = async () => {
    try {
      const sched = await fetchSchedules();
      setSchedules(sched);
    } catch (err) {
      console.error(err);
      Alert.alert('Error', 'Failed to load schedules');
    }
  };

  useEffect(() => { loadSchedules(); }, []);

  const handleAdd = async () => {
    if (!timeInput.match(/^\d{2}:\d{2}$/)) {
      return Alert.alert('Error', 'Enter HH:MM');
    }

    try {
      await addSchedule(timeInput, parseInt(amountInput));
      Alert.alert('Success', 'Schedule added and pushed to ESP32');

      setTimeInput('');
      setAmountInput('90');
      loadSchedules();
    } catch (err) {
      console.error(err);
      Alert.alert('Error', 'Failed to add schedule');
    }
  };

  const handleToggle = async (id: string, enabled: boolean) => {
    try {
      await toggleSchedule(id, !enabled);
      loadSchedules();
    } catch (err) {
      console.error(err);
      Alert.alert('Error', 'Failed to toggle schedule');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Schedule Feeding</Text>

      <View style={styles.row}>
        <TextInput
          value={timeInput}
          onChangeText={setTimeInput}
          placeholder="HH:MM"
          style={styles.input}
        />
        <TextInput
          value={amountInput}
          onChangeText={setAmountInput}
          placeholder="Amount"
          keyboardType="numeric"
          style={styles.input}
        />
        <Button title="Add" onPress={handleAdd} />
      </View>

      <FlatList
        data={schedules}
        keyExtractor={item => item.id!}
        renderItem={({ item }) => (
          <View style={styles.scheduleRow}>
            <Text>{item.time} - {item.amount}° - {item.enabled ? 'Active' : 'Disabled'}</Text>
            <Button title={item.enabled ? 'Disable' : 'Enable'} onPress={() => handleToggle(item.id!, item.enabled)} />
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
