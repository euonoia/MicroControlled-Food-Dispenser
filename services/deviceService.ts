import { doc, setDoc, collection, addDoc, getDoc, getDocs } from 'firebase/firestore';
import { db } from '../firebase/firebase';
import { Device, Schedule, AuditLog } from '../types/device';
import { pushSchedule } from './esp32Service';

const DEVICE_ID = 'feeder_001';

/**
 * Ensure feeder exists
 */
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

    // Initialize subcollections
    await setDoc(doc(ref, 'schedules', 'meta'), { createdAt: new Date().toISOString() });
    await setDoc(doc(ref, 'audit', 'meta'), { createdAt: new Date().toISOString() });
  }
};

/**
 * Log a command (manual or automatic)
 */
export const logCommand = async (command: string, angle?: number, weight?: number): Promise<void> => {
  await ensureFeederExists();

  const feederRef = doc(db, 'devices', DEVICE_ID);

  // Update main fields
  await setDoc(
    feederRef,
    {
      lastCommand: command,
      angle: angle ?? null,
      weight: weight ?? null,
      online: true,
    },
    { merge: true }
  );

  // Add to audit subcollection
  const auditRef = collection(feederRef, 'audit');
  await addDoc(auditRef, {
    timestamp: new Date().toISOString(),
    command,
    angle: angle ?? null,
    weight: weight ?? null,
  } as AuditLog);
};

/**
 * Update weight
 */
export const updateWeight = async (weight: number): Promise<void> => {
  await ensureFeederExists();
  const feederRef = doc(db, 'devices', DEVICE_ID);

  await setDoc(
    feederRef,
    { currentWeight: weight, online: true },
    { merge: true }
  );
};

/**
 * Log empty food
 */
export const logEmptyFood = async (): Promise<void> => {
  await ensureFeederExists();
  const feederRef = doc(db, 'devices', DEVICE_ID);
  const snapshot = await getDoc(feederRef);
  const currentWeight = snapshot.data()?.currentWeight ?? 0;

  if (currentWeight === 0) {
    const auditRef = collection(feederRef, 'audit');
    await addDoc(auditRef, {
      timestamp: new Date().toISOString(),
      message: 'Food bowl empty',
    } as AuditLog);
  }
};

/**
 * Fetch schedules
 */
export const fetchSchedules = async (): Promise<Schedule[]> => {
  await ensureFeederExists();
  const schedulesRef = collection(doc(db, 'devices', DEVICE_ID), 'schedules');
  const snapshot = await getDocs(schedulesRef);

  return snapshot.docs
    .filter(doc => doc.id !== 'meta')
    .map(doc => ({ id: doc.id, ...(doc.data() as Schedule) }));
};

/**
 * Add a new schedule
 */
export const addSchedule = async (time: string, amount: number): Promise<void> => {
  await ensureFeederExists();

  // 1. Add to Firestore
  const schedulesRef = collection(doc(db, 'devices', DEVICE_ID), 'schedules');
  const docRef = await addDoc(schedulesRef, { time, amount, enabled: true } as Schedule);

  // 2. Push to ESP32 using esp32Service
  try {
    const [hh, mm] = time.split(':');
    await pushSchedule(hh, mm, amount);
    console.log('Schedule sent to ESP32 via esp32Service');
  } catch (err) {
    console.error('Failed to push schedule to ESP32:', err);
  }
};

/**
 * Toggle schedule enabled/disabled
 */
export const toggleSchedule = async (id: string, enabled: boolean): Promise<void> => {
  const scheduleRef = doc(doc(db, 'devices', DEVICE_ID), `schedules/${id}`);
  await setDoc(scheduleRef, { enabled }, { merge: true });
};

/**
 * Check if dispensing is allowed
 */
export const canDispense = async (maxWeight = 20): Promise<boolean> => {
  await ensureFeederExists();
  const feederRef = doc(db, 'devices', DEVICE_ID);
  const snapshot = await getDoc(feederRef);

  if (!snapshot.exists()) return false;

  const data = snapshot.data() as Device;
  if (data.currentWeight >= maxWeight) return false;

  const schedulesSnapshot = await fetchSchedules();
  const now = new Date();
  const currentHHMM = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

  return schedulesSnapshot.some(s => s.enabled && s.time === currentHHMM);
};
