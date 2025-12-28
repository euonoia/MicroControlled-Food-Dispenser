import database from '@react-native-firebase/database';
import { Schedule, AuditLog } from '../types/device';
import { pushSchedule, toggleScheduleESP, deleteScheduleESP } from './esp32Service';

const DEVICE_ID = 'feeder_001';
const DEVICE_PATH = `/devices/${DEVICE_ID}`;

// Ensure feeder exists in Realtime Database
export const ensureFeederExists = async (): Promise<void> => {
  const snapshot = await database().ref(DEVICE_PATH).once('value');

  if (!snapshot.exists()) {
    await database().ref(DEVICE_PATH).set({
      currentWeight: 0,
      online: true,
      lastCommand: null,
      angle: null,
      weight: null,
    });

    // Meta nodes for schedules and audit logs
    await database().ref(`${DEVICE_PATH}/schedules/meta`).set({ createdAt: new Date().toISOString() });
    await database().ref(`${DEVICE_PATH}/audit/meta`).set({ createdAt: new Date().toISOString() });
  }
};

// Fetch all schedules from RTDB
export const fetchSchedules = async (): Promise<Schedule[]> => {
  await ensureFeederExists();
  const snapshot = await database().ref(`${DEVICE_PATH}/schedules`).once('value');
  const data = snapshot.val() ?? {};

  return Object.keys(data)
    .filter(key => key !== 'meta')
    .map(key => ({ id: key, ...data[key] }));
};

// Add new schedule
export const addSchedule = async (time: string, amount: number): Promise<void> => {
  await ensureFeederExists();
  const schedulesRef = database().ref(`${DEVICE_PATH}/schedules`);
  const newRef = schedulesRef.push();
  const [hh, mm] = time.split(':');

  await newRef.set({ timeHour: parseInt(hh), timeMinute: parseInt(mm), amount, enabled: true });

  try {
    await pushSchedule(newRef.key!, hh, mm, amount);
    console.log('Schedule pushed to ESP32');
  } catch (err) {
    console.error('Failed to push schedule to ESP32:', err);
  }
};

// Toggle schedule
export const toggleSchedule = async (id: string, enabled: boolean): Promise<void> => {
  await database().ref(`${DEVICE_PATH}/schedules/${id}`).update({ enabled });

  try {
    await toggleScheduleESP(id, enabled);
  } catch (err) {
    console.error('Failed to toggle schedule on ESP32:', err);
  }
};

// Delete schedule
export const deleteSchedule = async (id: string): Promise<void> => {
  await database().ref(`${DEVICE_PATH}/schedules/${id}`).remove();

  try {
    await deleteScheduleESP(id);
  } catch (err) {
    console.error('Failed to delete schedule on ESP32:', err);
  }
};

// Log audit events
export const logAudit = async (
  command: string,
  angle?: number,
  weight?: number,
  message?: string
): Promise<void> => {
  await ensureFeederExists();
  const auditRef = database().ref(`${DEVICE_PATH}/audit`);
  try {
    await auditRef.push({
      timestamp: new Date().toISOString(),
      command,
      angle: angle ?? null,
      weight: weight ?? null,
      message: message ?? null,
    } as AuditLog);
    console.log('Audit logged:', command);
  } catch (err) {
    console.error('Failed to log audit:', err);
  }
};
