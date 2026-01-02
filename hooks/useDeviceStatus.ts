import { useState, useEffect } from "react";
import { getDatabase, ref, onValue, update } from "firebase/database";
import { firebaseApp } from "../firebase/firebase";
import { DEVICE_CONFIG } from "../config/deviceConfig";
import { ConnectivityStatus } from "../types/device";

const db = getDatabase(firebaseApp);

export function useDeviceStatus() {
  const [status, setStatus] = useState<ConnectivityStatus | null>(null);
  const [isOnline, setIsOnline] = useState(false);

  useEffect(() => {
    const connRef = ref(db, `/devices/${DEVICE_CONFIG.ID}/connectivity`);

    const unsubscribe = onValue(connRef, async (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val() as ConnectivityStatus;
        const now = Math.floor(Date.now() / 1000);

        // Logic: Check if timestamp is too old
        const actuallyOnline =
          data.online &&
          now - data.lastSeen <= DEVICE_CONFIG.OFFLINE_THRESHOLD_SEC;

        // If stale, update Firebase to reflect reality
        if (!actuallyOnline && data.online) {
          await update(connRef, { online: false });
        }

        setStatus(data);
        setIsOnline(actuallyOnline);
      } else {
        setStatus(null);
        setIsOnline(false);
      }
    });

    return () => unsubscribe();
  }, []);

  return { status, isOnline };
}