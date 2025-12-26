import { doc, setDoc, collection, addDoc, getDoc, getDocs, deleteDoc } from 'firebase/firestore';
import { db } from '../firebase/firebase';
import { Schedule, AuditLog } from '../types/device';
import { pushSchedule, toggleScheduleESP, deleteScheduleESP } from './esp32Service';

const DEVICE_ID = 'feeder_001';

export const ensureFeederExists = async (): Promise<void> => {
  const ref = doc(db, 'devices', DEVICE_ID);
  const snapshot = await getDoc(ref);

  if (!snapshot.exists()) {
    await setDoc(ref, {
      currentWeight: 0,
      online: true,
      lastCommand: null,
      angle: null,
      weight: null,
      history: [],
      emptyHistory: [],
    });

    await setDoc(doc(ref, 'schedules', 'meta'), { createdAt: new Date().toISOString() });
    await setDoc(doc(ref, 'audit', 'meta'), { createdAt: new Date().toISOString() });
  }
};

export const fetchSchedules = async (): Promise<Schedule[]> => {
  await ensureFeederExists();
  const schedulesRef = collection(doc(db, 'devices', DEVICE_ID), 'schedules');
  const snapshot = await getDocs(schedulesRef);

  return snapshot.docs
    .filter(doc => doc.id !== 'meta')
    .map(doc => ({ id: doc.id, ...(doc.data() as Schedule) }));
};

export const addSchedule = async (time: string, amount: number): Promise<void> => {
  await ensureFeederExists();
  const schedulesRef = collection(doc(db, 'devices', DEVICE_ID), 'schedules');
  const docRef = await addDoc(schedulesRef, { time, amount, enabled: true } as Schedule);

  try {
    const [hh, mm] = time.split(':');
    await pushSchedule(docRef.id, hh, mm, amount);
    console.log('Schedule pushed to ESP32');
  } catch (err) {
    console.error('Failed to push schedule to ESP32:', err);
  }
};

export const toggleSchedule = async (id: string, enabled: boolean): Promise<void> => {
  const scheduleRef = doc(doc(db, 'devices', DEVICE_ID), `schedules/${id}`);
  await setDoc(scheduleRef, { enabled }, { merge: true });

  try {
    await toggleScheduleESP(id, enabled);
  } catch (err) {
    console.error('Failed to toggle schedule on ESP32:', err);
  }
};

export const deleteSchedule = async (id: string): Promise<void> => {
  const scheduleRef = doc(doc(db, 'devices', DEVICE_ID), `schedules/${id}`);
  await deleteDoc(scheduleRef);

  try {
    await deleteScheduleESP(id);
  } catch (err) {
    console.error('Failed to delete schedule on ESP32:', err);
  }
};

export const logAudit = async (
  command: string,
  angle?: number,
  weight?: number,
  message?: string
): Promise<void> => {
  await ensureFeederExists();
  const feederRef = doc(db, 'devices', DEVICE_ID);
  const auditRef = collection(feederRef, 'audit');

  try {
    await addDoc(auditRef, {
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
