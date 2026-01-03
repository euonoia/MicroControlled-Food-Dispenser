import { useEffect, useState } from "react";
import { getDatabase, ref, onValue, set, update } from "firebase/database";
import { firebaseApp } from "../firebase/firebase";
import { DEVICE_CONFIG } from "../config/deviceConfig";

const db = getDatabase(firebaseApp);
const BASE = `/devices/${DEVICE_CONFIG.ID}/schedule`;

export type ScheduleItem = {
  time: string;
  angle: number;
  active: boolean;
  lastRun?: string;
};

export function useSchedule() {
  const [enabled, setEnabled] = useState(false);
  const [items, setItems] = useState<Record<string, ScheduleItem>>({});

  useEffect(() => {
    const unsub = onValue(ref(db, BASE), snap => {
      if (!snap.exists()) return;

      const data = snap.val();
      setEnabled(!!data.enabled);
      setItems(data.items ?? {});
    });

    return () => unsub();
  }, []);

  const toggleSchedule = (value: boolean) =>
    update(ref(db, BASE), { enabled: value });

  const saveItem = (id: string, item: ScheduleItem) =>
    set(ref(db, `${BASE}/items/${id}`), item);

  return { enabled, items, toggleSchedule, saveItem };
}
