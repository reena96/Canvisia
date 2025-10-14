// User Types
export interface User {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  color: string; // For cursor color
}

export interface CursorPosition {
  x: number;
  y: number;
  userId: string;
  userName: string;
  color: string;
  timestamp: number;
}

export interface Presence {
  userId: string;
  userName: string;
  color: string;
  isActive: boolean;
  lastSeen: Date | string;
}

export interface AuthState {
  user: User | null;
  loading: boolean;
}
