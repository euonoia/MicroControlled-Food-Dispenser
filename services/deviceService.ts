import { doc, setDoc, arrayUnion, getDoc } from 'firebase/firestore';
import { db } from '../firebase/firebase';

const DEVICE_ID = 'feeder_001';

/**
 * Log any command sent to the device (manual or automatic)
 */
export const logCommand = async (command: string, angle?: number, weight?: number) => {
  const ref = doc(db, 'devices', DEVICE_ID);

  // Update main fields (creates doc if missing)
  await setDoc(ref, {
    lastCommand: command,
    angle: angle ?? null,
    weight: weight ?? null,
    online: true,
  }, { merge: true });

  // Add history entry safely
  await setDoc(ref, {
    history: arrayUnion({
      timestamp: new Date().toISOString(),
      command,
      angle: angle ?? null,
      weight: weight ?? null,
    }),
  }, { merge: true });
};

/**
 * Check if dispensing is allowed:
 * - Food bowl must be empty (weight < maxWeight)
 * - Schedule must be active if applicable
 */
export const canDispense = async (maxWeight = 20) => {
  const ref = doc(db, 'devices', DEVICE_ID);
  const snapshot = await getDoc(ref);
  if (!snapshot.exists()) return false;

  const data = snapshot.data();
  const currentWeight = data?.currentWeight ?? 0;

  // Block if food is still present
  if (currentWeight >= maxWeight) return false;

  // Check if schedule is active (optional: matches current HH:MM)
  const schedules = data?.schedules ?? [];
  const now = new Date();
  const currentHHMM = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

  return schedules.some((s: any) => s.enabled && s.time === currentHHMM);
};

/**
 * Fetch all schedules from Firestore
 */
export const fetchSchedules = async () => {
  const ref = doc(db, 'devices', DEVICE_ID);
  const snapshot = await getDoc(ref);
  if (!snapshot.exists()) return [];

  return snapshot.data()?.schedules ?? [];
};

/**
 * Log empty food if weight is zero
 */
export const logEmptyFood = async () => {
  const ref = doc(db, 'devices', DEVICE_ID);
  const snapshot = await getDoc(ref);
  const currentWeight = snapshot.data()?.currentWeight ?? 0;

  // Only log if truly empty
  if (currentWeight === 0) {
    await setDoc(ref, {
      emptyHistory: arrayUnion({
        timestamp: new Date().toISOString(),
        message: 'Food bowl empty',
      }),
    }, { merge: true });
  }
};

/**
 * Update the current weight (called from ESP32 polling)
 */
export const updateWeight = async (weight: number) => {
  const ref = doc(db, 'devices', DEVICE_ID);
  await setDoc(ref, {
    currentWeight: weight,
    online: true,
  }, { merge: true });
};
