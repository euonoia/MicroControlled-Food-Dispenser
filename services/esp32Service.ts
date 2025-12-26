import axios from 'axios';

const ESP32_IP = '192.168.1.8'; // replace with your ESP32 IP
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
 * Push schedule to ESP32
 * hour, minute = schedule time (HH, MM)
 * angle = servo angle / amount of food
 */
export const pushSchedule = async (hour: string, minute: string, angle: number) => {
  try {
    await axios.get(`${BASE_URL}/addSchedule?hour=${hour}&minute=${minute}&angle=${angle}`);
    console.log(`Schedule pushed to ESP32: ${hour}:${minute} Angle: ${angle}`);
  } catch (err) {
    console.error('ESP32 push schedule failed:', err);
    throw err;
  }
};
