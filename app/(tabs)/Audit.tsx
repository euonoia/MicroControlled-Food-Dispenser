// app/(tabs)/Audit.tsx
import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, RefreshControl, StyleSheet, ListRenderItem } from 'react-native';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { db } from '../../firebase/firebase';
import { AuditLog } from '../../types/device';

const DEVICE_ID = 'feeder_001';

const Audit = () => {
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  const fetchAuditLogs = async () => {
    setLoading(true);
    try {
      const auditRef = collection(db, 'devices', DEVICE_ID, 'audit');
      const q = query(auditRef, orderBy('timestamp', 'desc'));
      const snapshot = await getDocs(q);

      const logs: AuditLog[] = snapshot.docs.map(doc => ({
        id: doc.id,
        ...(doc.data() as AuditLog),
      }));

      setAuditLogs(logs);
    } catch (error) {
      console.error('Failed to fetch audit logs:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAuditLogs();
  }, []);

const renderItem: ListRenderItem<AuditLog> = ({ item }) => (
  <View style={styles.logItem}>
    <Text style={styles.timestamp}>{new Date(item.timestamp).toLocaleString()}</Text>

    {item.command && (
      <Text style={styles.command}>
        {item.command.startsWith('AUTO_') ? 'Automatic' : 'Manual'} Command: {item.command.replace('_', ' ')}
      </Text>
    )}

    {item.message && <Text style={styles.message}>{item.message}</Text>}

    {item.angle !== undefined && <Text>Angle: {item.angle}°</Text>}

    <Text>Weight: {item.weight != null ? item.weight.toFixed(2) + ' g' : '-'}</Text>
  </View>
);

  return (
    <View style={styles.container}>
      <FlatList<AuditLog>
        data={auditLogs}
        keyExtractor={item => item.id ?? item.timestamp}
        renderItem={renderItem}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={fetchAuditLogs} />}
        ListEmptyComponent={
          <Text style={styles.empty}>
            {loading ? 'Loading audit logs...' : 'No audit logs found.'}
          </Text>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9f9f9', padding: 16 },
  logItem: {
    backgroundColor: '#fff',
    padding: 12,
    marginBottom: 12,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  timestamp: { fontSize: 12, color: '#666' },
  command: { fontWeight: 'bold', marginTop: 4 },
  message: { fontStyle: 'italic', marginTop: 4, color: '#d9534f' },
  empty: { textAlign: 'center', marginTop: 20, color: '#999' },
});

export default Audit;
