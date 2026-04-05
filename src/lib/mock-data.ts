import { User, SystemState, ChatMessage, ActivityLog } from './types';

export const mockUsers: User[] = [
  {
    id: '1', username: 'alex_dev', status: 'active', voiceAccess: 'approved',
    voiceUnlimited: false, usageToday: 12, dailyLimit: 30,
    accessExpiry: new Date(Date.now() + 2 * 60 * 60 * 1000 + 15 * 60 * 1000),
    requestTime: null, ip: '192.168.1.101', blockedIp: false,
    lastSeen: new Date(Date.now() - 2 * 60 * 1000), joinedAt: new Date(Date.now() - 7 * 86400000),
  },
  {
    id: '2', username: 'sara_music', status: 'active', voiceAccess: 'pending',
    voiceUnlimited: false, usageToday: 3, dailyLimit: 15,
    accessExpiry: null,
    requestTime: new Date(Date.now() - 20 * 60 * 1000), ip: '192.168.1.102', blockedIp: false,
    lastSeen: new Date(Date.now() - 5 * 60 * 1000), joinedAt: new Date(Date.now() - 3 * 86400000),
  },
  {
    id: '3', username: 'john_q', status: 'blocked', voiceAccess: 'none',
    voiceUnlimited: false, usageToday: 0, dailyLimit: 15,
    accessExpiry: null, requestTime: null, ip: '10.0.0.55', blockedIp: true,
    lastSeen: new Date(Date.now() - 48 * 3600000), joinedAt: new Date(Date.now() - 14 * 86400000),
  },
  {
    id: '4', username: 'maya_writes', status: 'active', voiceAccess: 'approved',
    voiceUnlimited: true, usageToday: 45, dailyLimit: 30,
    accessExpiry: null, requestTime: null, ip: '192.168.1.200', blockedIp: false,
    lastSeen: new Date(), joinedAt: new Date(Date.now() - 10 * 86400000),
  },
  {
    id: '5', username: 'ravi_k', status: 'active', voiceAccess: 'expired',
    voiceUnlimited: false, usageToday: 8, dailyLimit: 20,
    accessExpiry: new Date(Date.now() - 60 * 60 * 1000),
    requestTime: null, ip: '172.16.0.12', blockedIp: false,
    lastSeen: new Date(Date.now() - 30 * 60 * 1000), joinedAt: new Date(Date.now() - 5 * 86400000),
  },
  {
    id: '6', username: 'noor_ai', status: 'active', voiceAccess: 'pending',
    voiceUnlimited: false, usageToday: 1, dailyLimit: 10,
    accessExpiry: null,
    requestTime: new Date(Date.now() - 5 * 60 * 1000), ip: '192.168.1.150', blockedIp: false,
    lastSeen: new Date(Date.now() - 1 * 60 * 1000), joinedAt: new Date(Date.now() - 1 * 86400000),
  },
];

export const defaultSystemState: SystemState = {
  maintenanceMode: false,
  maintenanceMessage: "We're under maintenance. We'll come back stronger.",
  aiEnabled: true,
  voiceEnabled: true,
};

export const mockChatMessages: ChatMessage[] = [
  { id: '1', sender: 'ai', text: 'Hey! I\'m periperi AI. How can I help you today?', timestamp: new Date(Date.now() - 5 * 60 * 1000), reactions: [], status: 'read' },
  { id: '2', sender: 'user', text: 'Tell me something interesting about space.', timestamp: new Date(Date.now() - 4 * 60 * 1000), reactions: [], status: 'read' },
  { id: '3', sender: 'ai', text: 'A day on Venus is longer than a year on Venus! It takes 243 Earth days to rotate once, but only 225 Earth days to orbit the Sun. 🪐', timestamp: new Date(Date.now() - 3 * 60 * 1000), reactions: ['🔥'], status: 'read' },
];

export const mockActivityLogs: ActivityLog[] = [
  { id: '1', action: 'Approved voice access', target: 'alex_dev', timestamp: new Date(Date.now() - 30 * 60 * 1000), type: 'success' },
  { id: '2', action: 'Blocked user', target: 'john_q', timestamp: new Date(Date.now() - 2 * 3600000), type: 'danger' },
  { id: '3', action: 'Enabled maintenance mode', target: 'System', timestamp: new Date(Date.now() - 5 * 3600000), type: 'warning' },
  { id: '4', action: 'Disabled maintenance mode', target: 'System', timestamp: new Date(Date.now() - 4.5 * 3600000), type: 'info' },
  { id: '5', action: 'Added +5 minutes', target: 'sara_music', timestamp: new Date(Date.now() - 1 * 3600000), type: 'info' },
  { id: '6', action: 'Rejected voice request', target: 'ravi_k', timestamp: new Date(Date.now() - 6 * 3600000), type: 'danger' },
];
