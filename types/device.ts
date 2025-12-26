export interface Schedule {
  id?: string;       // Firestore doc ID
  time: string;      // HH:MM format
  amount: number;    // Servo angle / feeding amount
  enabled: boolean;
}
export interface AuditLog {
  id?: string;        // Firestore doc ID
  timestamp: string;  // ISO string
  command?: string;   // e.g., 'AUTO_DISPENSE', 'MANUAL_DISPENSE', 'TARE_SCALE'
  angle?: number | null;
  weight?: number | null;
  message?: string;   // optional messages, e.g., "Food bowl empty"
}
export interface Device {
  currentWeight: number;
  online: boolean;
  lastCommand: string | null;
  angle: number | null;
  weight: number | null;
  history: AuditLog[];       // Array of previous commands
  emptyHistory: AuditLog[];  // Array of empty food logs
  lastUpdated?: any;         // Firestore timestamp or JS Date
  schedules?: Schedule[];    // Optional convenience field
}

