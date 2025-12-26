export interface Device {
  currentWeight: number;
  online: boolean;
  lastCommand: string;
  lastUpdated: any;
  schedules?: { time: string; amount: number; enabled: boolean }[];
}
