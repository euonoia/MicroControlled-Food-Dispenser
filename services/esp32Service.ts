// esp32Service.ts
import { getDatabase, ref, set, push, remove, get, update } from "firebase/database";
import { firebaseApp } from "../firebase/firebase"; // your initialized Firebase app

const db = getDatabase(firebaseApp);
const DEVICE_ID = 'feeder_001';
const DEVICE_PATH = `/devices/${DEVICE_ID}`;

// Fetch current weight
export const fetchWeight = async (): Promise<number> => {
  try {
    const snapshot = await get(ref(db, `${DEVICE_PATH}/currentWeight`));
    return snapshot.exists() ? snapshot.val() : 0;
  } catch (err) {
    console.error('Failed to fetch weight:', err);
    return 0;
  }
};

// Manual servo dispense
export const dispenseServo = async (angle: number) => {
  try {
    await set(ref(db, `${DEVICE_PATH}/lastCommand`), { type: 'DISPENSE', angle, timestamp: Date.now() });
  } catch (err) {
    console.error('Failed to send dispense command:', err);
  }
};

// Tare the scale manually
export const tareScale = async () => {
  try {
    await set(ref(db, `${DEVICE_PATH}/lastCommand`), { type: 'TARE', timestamp: Date.now() });
  } catch (err) {
    console.error('Failed to tare scale:', err);
  }
};

// Fetch feeding schedules
export const fetchSchedules = async () => {
  try {
    const snapshot = await get(ref(db, `${DEVICE_PATH}/schedules`));
    const data = snapshot.exists() ? snapshot.val() : {};
    return Object.keys(data)
      .filter(key => key !== 'meta')
      .map(key => ({ id: key, ...data[key] }));
  } catch (err) {
    console.error('Failed to fetch schedules:', err);
    return [];
  }
};

// Update a schedule
export const updateSchedule = async (id: string, updates: any) => {
  try {
    await update(ref(db, `${DEVICE_PATH}/schedules/${id}`), updates);
  } catch (err) {
    console.error('Failed to update schedule:', err);
  }
};

// Add new schedule
export const addSchedule = async (timeHour: number, timeMinute: number, amount: number) => {
  try {
    const newRef = push(ref(db, `${DEVICE_PATH}/schedules`));
    await set(newRef, { timeHour, timeMinute, amount, enabled: true });
    return newRef.key;
  } catch (err) {
    console.error('Failed to add schedule:', err);
  }
};

// Delete schedule
export const deleteSchedule = async (id: string) => {
  try {
    await remove(ref(db, `${DEVICE_PATH}/schedules/${id}`));
  } catch (err) {
    console.error('Failed to delete schedule:', err);
  }
};

// ===== NEW FUNCTIONS REQUIRED BY deviceService =====

// Push schedule to ESP32
export const pushSchedule = async (id: string, hh: string | number, mm: string | number, amount: number) => {
  try {
    await set(ref(db, `${DEVICE_PATH}/schedules/${id}/espCommand`), {
      type: 'ADD',
      hour: parseInt(hh as string),
      minute: parseInt(mm as string),
      amount,
      timestamp: Date.now(),
    });
  } catch (err) {
    console.error('Failed to push schedule to ESP32:', err);
  }
};

// Toggle schedule on ESP32
export const toggleScheduleESP = async (id: string, enabled: boolean) => {
  try {
    await set(ref(db, `${DEVICE_PATH}/schedules/${id}/espCommand`), {
      type: 'TOGGLE',
      enabled,
      timestamp: Date.now(),
    });
  } catch (err) {
    console.error('Failed to toggle schedule on ESP32:', err);
  }
};

// Delete schedule on ESP32
export const deleteScheduleESP = async (id: string) => {
  try {
    await set(ref(db, `${DEVICE_PATH}/schedules/${id}/espCommand`), {
      type: 'DELETE',
      timestamp: Date.now(),
    });
  } catch (err) {
    console.error('Failed to delete schedule on ESP32:', err);
  }
};
