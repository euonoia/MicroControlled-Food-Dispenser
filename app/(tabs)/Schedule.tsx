import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, Button, FlatList, Alert, StyleSheet } from 'react-native';
import { fetchSchedules, addSchedule, updateSchedule, deleteSchedule } from '../../services/esp32Service';

export default function ScheduleScreen() {
  const [schedules, setSchedules] = useState<any[]>([]);
  const [hour, setHour] = useState('');
  const [minute, setMinute] = useState('');
  const [angle, setAngle] = useState('90');

  const loadSchedules = async () => {
    setSchedules(await fetchSchedules());
  };

  useEffect(() => { loadSchedules(); }, []);

  const handleAdd = async () => {
    const h = parseInt(hour), m = parseInt(minute), a = parseInt(angle);
    if (isNaN(h) || isNaN(m) || isNaN(a)) return Alert.alert('Invalid input');
    await addSchedule(h, m, a);
    loadSchedules();
  };

  const handleToggle = async (id: string, enabled: boolean) => {
    await updateSchedule(id, { enabled: !enabled });
    loadSchedules();
  };

  const handleDelete = async (id: string) => {
    Alert.alert('Delete?', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: async () => { await deleteSchedule(id); loadSchedules(); } },
    ]);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Feeding Schedule</Text>

      <View style={styles.row}>
        <TextInput value={hour} onChangeText={setHour} placeholder="HH" keyboardType="numeric" style={styles.input} />
        <TextInput value={minute} onChangeText={setMinute} placeholder="MM" keyboardType="numeric" style={styles.input} />
        <TextInput value={angle} onChangeText={setAngle} placeholder="Angle" keyboardType="numeric" style={styles.input} />
        <Button title="Add" onPress={handleAdd} />
      </View>

      <FlatList
        data={schedules}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <View style={styles.scheduleRow}>
            <Text>{item.timeHour}:{item.timeMinute} - {item.amount}° - {item.enabled ? 'Active' : 'Disabled'}</Text>
            <View style={{ flexDirection: 'row', gap: 5 }}>
              <Button title={item.enabled ? 'Disable' : 'Enable'} onPress={() => handleToggle(item.id, item.enabled)} />
              <Button title="Delete" color="red" onPress={() => handleDelete(item.id)} />
            </View>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  title: { fontSize: 24, marginBottom: 10 },
  row: { flexDirection: 'row', gap: 5, marginBottom: 10 },
  input: { borderWidth: 1, padding: 5, width: 50 },
  scheduleRow: { flexDirection: 'row', justifyContent: 'space-between', marginVertical: 5, alignItems: 'center' },
});
