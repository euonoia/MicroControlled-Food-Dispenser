import { getDatabase, ref, set } from "firebase/database";
import { firebaseApp } from "../firebase/firebase";

const db = getDatabase(firebaseApp);
const DEVICE_ID = "feeder_001";

export const moveServo = async (angle: number) => {
  if (angle < 0 || angle > 180) return;

  await set(
    ref(db, `/devices/${DEVICE_ID}/servo`),
    {
      targetAngle: angle,
      status: "moving",
      updatedAt: Date.now()
    }
  );
};
