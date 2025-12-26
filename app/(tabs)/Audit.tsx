import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import { db } from '../../firebase/firebase';
import { doc, onSnapshot } from 'firebase/firestore';

export default function Audit() {
  const [history, setHistory] = useState<any[]>([]);
  const [emptyHistory, setEmptyHistory] = useState<any[]>([]);
  const DEVICE_ID = 'feeder_001';

  useEffect(() => {
    const unsubscribe = onSnapshot(doc(db, 'devices', DEVICE_ID), snapshot => {
      const data = snapshot.data();
      if (data) {
        setHistory(data.history ?? []);
        setEmptyHistory(data.emptyHistory ?? []);
      }
    });

    return () => unsubscribe();
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Dispense History</Text>
      <FlatList
        data={history}
        keyExtractor={(item, idx) => idx.toString()}
        renderItem={({ item }) => (
          <Text>{new Date(item.timestamp?.seconds * 1000).toLocaleString()} - {item.command} - {item.angle ?? '-'}°</Text>
        )}
      />

      <Text style={[styles.title, { marginTop: 20 }]}>Empty Bowl Logs</Text>
      <FlatList
        data={emptyHistory}
        keyExtractor={(item, idx) => idx.toString()}
        renderItem={({ item }) => (
          <Text>{new Date(item.timestamp?.seconds * 1000).toLocaleString()} - {item.message}</Text>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  title: { fontSize: 22, marginBottom: 10 },
});
