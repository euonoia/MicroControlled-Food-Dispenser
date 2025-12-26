import axios from 'axios';

export const ESP32_IP = '192.168.1.8'; // replace with your ESP32 IP
const BASE_URL = `http://${ESP32_IP}`;

/**
 * Send servo command
 */
export const sendServo = async (angle: number) => {
  try {
    await axios.get(`${BASE_URL}/servo?angle=${angle}`);
    console.log('Servo command sent:', angle);
  } catch (err) {
    console.error('ESP32 servo request failed:', err);
    throw err;
  }
};

/**
 * Tare the scale
 */
export const tareScale = async () => {
  try {
    await axios.get(`${BASE_URL}/tare`);
    console.log('Tare command sent');
  } catch (err) {
    console.error('ESP32 tare request failed:', err);
    throw err;
  }
};

/**
 * Fetch current weight
 */
export const fetchWeight = async (): Promise<number> => {
  try {
    const res = await axios.get(BASE_URL);
    return res.data.weight ?? 0;
  } catch (err) {
    console.error('ESP32 fetch weight failed:', err);
    return 0;
  }
};

/**
 * Push a new schedule to ESP32
 * id = Firestore document ID
 * hour, minute = schedule time (HH, MM)
 * angle = servo angle / amount of food
 */
export const pushSchedule = async (id: string, hour: string, minute: string, angle: number) => {
  try {
    await axios.get(`${BASE_URL}/addSchedule?id=${id}&hour=${hour}&minute=${minute}&angle=${angle}`);
    console.log(`Schedule pushed to ESP32: ${hour}:${minute} Angle: ${angle} ID: ${id}`);
  } catch (err) {
    console.error('ESP32 push schedule failed:', err);
    throw err;
  }
};

/**
 * Toggle schedule on ESP32
 * enabled = true / false
 */
export const toggleScheduleESP = async (id: string, enabled: boolean) => {
  try {
    await axios.get(`${BASE_URL}/toggleSchedule?id=${id}&enabled=${enabled ? 1 : 0}`);
    console.log(`Schedule ${id} toggled on ESP32: ${enabled}`);
  } catch (err) {
    console.error('ESP32 toggle schedule failed:', err);
    throw err;
  }
};

/**
 * Delete schedule on ESP32
 */
export const deleteScheduleESP = async (id: string) => {
  try {
    await axios.get(`${BASE_URL}/deleteSchedule?id=${id}`);
    console.log(`Schedule ${id} deleted on ESP32`);
  } catch (err) {
    console.error('ESP32 delete schedule failed:', err);
    throw err;
  }
};
