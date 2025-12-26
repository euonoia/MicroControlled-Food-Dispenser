import React, { useEffect, useState } from 'react';
import { View, Text, Button, FlatList, TextInput, StyleSheet, Alert, Modal, ActivityIndicator } from 'react-native';
import { Schedule as ScheduleType } from '../../types/device';
import { fetchSchedules, addSchedule, toggleSchedule, deleteSchedule } from '../../services/deviceService';

export default function Schedule() {
  const [schedules, setSchedules] = useState<ScheduleType[]>([]);
  const [timeInput, setTimeInput] = useState('');
  const [amountInput, setAmountInput] = useState('90');
  const [loading, setLoading] = useState(false); // Loading state

  const loadSchedules = async () => {
    setLoading(true);
    try {
      const sched = await fetchSchedules();
      setSchedules(sched);
    } catch (err) {
      console.error(err);
      Alert.alert('Error', 'Failed to load schedules');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadSchedules(); }, []);

  const handleAdd = async () => {
    if (!timeInput.match(/^\d{2}:\d{2}$/)) {
      return Alert.alert('Error', 'Enter HH:MM');
    }

    setLoading(true);
    try {
      await addSchedule(timeInput, parseInt(amountInput));
      Alert.alert('Success', 'Schedule added and pushed to ESP32');
      setTimeInput('');
      setAmountInput('90');
      await loadSchedules();
    } catch (err) {
      console.error(err);
      Alert.alert('Error', 'Failed to add schedule');
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = async (id: string, enabled: boolean) => {
    setLoading(true);
    try {
      await toggleSchedule(id, !enabled);
      await loadSchedules();
    } catch (err) {
      console.error(err);
      Alert.alert('Error', 'Failed to toggle schedule');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    Alert.alert(
      'Delete Schedule',
      'Are you sure you want to delete this schedule?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete', style: 'destructive', onPress: async () => {
            setLoading(true);
            try {
              await deleteSchedule(id);
              await loadSchedules();
            } catch (err) {
              console.error(err);
              Alert.alert('Error', 'Failed to delete schedule');
            } finally {
              setLoading(false);
            }
          }
        }
      ]
    );
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
            <View style={{ flexDirection: 'row', gap: 5 }}>
              <Button
                title={item.enabled ? 'Disable' : 'Enable'}
                onPress={() => handleToggle(item.id!, item.enabled)}
              />
              <Button
                title="Delete"
                color="red"
                onPress={() => handleDelete(item.id!)}
              />
            </View>
          </View>
        )}
      />

      {/* Loading Modal */}
      <Modal transparent={true} animationType="fade" visible={loading}>
        <View style={styles.modalBackground}>
          <View style={styles.modalContainer}>
            <ActivityIndicator size="large" color="#0000ff" />
            <Text style={{ marginTop: 10 }}>Loading...</Text>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  title: { fontSize: 24, marginBottom: 10 },
  row: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  input: { borderWidth: 1, flex: 1, marginRight: 5, padding: 5 },
  scheduleRow: { flexDirection: 'row', justifyContent: 'space-between', marginVertical: 5, alignItems: 'center' },
  modalBackground: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
  },
});
