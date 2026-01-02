export type ConnectivityStatus = {
  online: boolean;
  lastSeen: number; // Unix timestamp
  ip?: string;
};