export type VoiceAccessState = 'none' | 'pending' | 'approved' | 'expired' | 'denied';

export interface User {
  id: string;
  username: string;
  status: 'active' | 'blocked';
  voiceAccess: VoiceAccessState;
  voiceUnlimited: boolean;
  usageToday: number;
  dailyLimit: number;
  accessExpiry: Date | null;
  requestTime: Date | null;
  ip: string;
  blockedIp: boolean;
  lastSeen: Date;
  joinedAt: Date;
}

export interface SystemState {
  maintenanceMode: boolean;
  maintenanceMessage: string;
  aiEnabled: boolean;
  voiceEnabled: boolean;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  timestamp: Date;
  reactions: string[];
  status: 'sent' | 'delivered' | 'read';
}

export interface ActivityLog {
  id: string;
  action: string;
  target: string;
  timestamp: Date;
  type: 'info' | 'success' | 'warning' | 'danger';
}

export type MicState = 'idle' | 'recording' | 'processing';
