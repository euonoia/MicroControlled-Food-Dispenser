import axios from 'axios';

const ESP32_IP = '192.168.1.8'; // replace with your ESP32 IP
const BASE_URL = `http://${ESP32_IP}`;

export const sendServo = async (angle: number) => {
  try {
    await axios.get(`${BASE_URL}/servo?angle=${angle}`);
    console.log('Servo command sent:', angle);
  } catch (err) {
    console.error('ESP32 servo request failed:', err);
    throw err;
  }
};

export const tareScale = async () => {
  try {
    await axios.get(`${BASE_URL}/tare`);
    console.log('Tare command sent');
  } catch (err) {
    console.error('ESP32 tare request failed:', err);
    throw err;
  }
};

export const fetchWeight = async (): Promise<number> => {
  try {
    const res = await axios.get(BASE_URL);
    return res.data.weight ?? 0;
  } catch (err) {
    console.error('ESP32 fetch weight failed:', err);
    return 0;
  }
};
