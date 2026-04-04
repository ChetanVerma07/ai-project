import React, { createContext, useContext, useState, useCallback } from 'react';
import { User, SystemState, ChatMessage, VoiceAccessState, MicState, ActivityLog } from '@/lib/types';
import { mockUsers, defaultSystemState, mockChatMessages, mockActivityLogs } from '@/lib/mock-data';
import { toast } from 'sonner';

interface AppContextType {
  // Auth
  currentUser: string | null;
  isAdmin: boolean;
  adminLoggedIn: boolean;
  setCurrentUser: (u: string | null) => void;
  setAdminLoggedIn: (v: boolean) => void;

  // Users
  users: User[];
  updateUser: (id: string, updates: Partial<User>) => void;
  deleteUser: (id: string) => void;

  // System
  systemState: SystemState;
  setSystemState: React.Dispatch<React.SetStateAction<SystemState>>;

  // Chat
  messages: ChatMessage[];
  addMessage: (text: string, sender: 'user' | 'ai') => void;
  toggleReaction: (msgId: string, emoji: string) => void;
  isAiThinking: boolean;

  // Voice
  userVoiceState: VoiceAccessState;
  setUserVoiceState: (s: VoiceAccessState) => void;
  micState: MicState;
  setMicState: (s: MicState) => void;

  // Activity
  activityLogs: ActivityLog[];
  addActivityLog: (action: string, target: string, type: ActivityLog['type']) => void;
}

const AppContext = createContext<AppContextType | null>(null);

export const useApp = () => {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be inside AppProvider');
  return ctx;
};

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<string | null>(
    () => localStorage.getItem('chatUsername')
  );
  const [adminLoggedIn, setAdminLoggedIn] = useState(false);
  const [users, setUsers] = useState<User[]>(mockUsers);
  const [systemState, setSystemState] = useState<SystemState>(defaultSystemState);
  const [messages, setMessages] = useState<ChatMessage[]>(mockChatMessages);
  const [isAiThinking, setIsAiThinking] = useState(false);
  const [userVoiceState, setUserVoiceState] = useState<VoiceAccessState>('none');
  const [micState, setMicState] = useState<MicState>('idle');
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>(mockActivityLogs);

  const updateUser = useCallback((id: string, updates: Partial<User>) => {
    setUsers(prev => prev.map(u => u.id === id ? { ...u, ...updates } : u));
  }, []);

  const deleteUser = useCallback((id: string) => {
    setUsers(prev => prev.filter(u => u.id !== id));
    toast.success('User deleted');
  }, []);

  const addMessage = useCallback((text: string, sender: 'user' | 'ai') => {
    const msg: ChatMessage = {
      id: Date.now().toString(),
      sender,
      text,
      timestamp: new Date(),
      reactions: [],
      status: 'sent',
    };
    setMessages(prev => [...prev, msg]);

    // Simulate delivery
    if (sender === 'user') {
      setTimeout(() => {
        setMessages(prev => prev.map(m => m.id === msg.id ? { ...m, status: 'delivered' as const } : m));
      }, 500);

      setIsAiThinking(true);
      setTimeout(() => {
        const aiMsg: ChatMessage = {
          id: (Date.now() + 1).toString(),
          sender: 'ai',
          text: getAiResponse(text),
          timestamp: new Date(),
          reactions: [],
          status: 'read',
        };
        setMessages(prev => {
          const updated = prev.map(m => m.id === msg.id ? { ...m, status: 'read' as const } : m);
          return [...updated, aiMsg];
        });
        setIsAiThinking(false);
      }, 1500 + Math.random() * 1000);
    }
  }, []);

  const toggleReaction = useCallback((msgId: string, emoji: string) => {
    setMessages(prev => prev.map(m => {
      if (m.id !== msgId) return m;
      const has = m.reactions.includes(emoji);
      return { ...m, reactions: has ? m.reactions.filter(r => r !== emoji) : [...m.reactions, emoji] };
    }));
  }, []);

  const addActivityLog = useCallback((action: string, target: string, type: ActivityLog['type']) => {
    setActivityLogs(prev => [{
      id: Date.now().toString(), action, target, timestamp: new Date(), type
    }, ...prev]);
  }, []);

  const handleSetCurrentUser = useCallback((u: string | null) => {
    setCurrentUser(u);
    if (u) localStorage.setItem('chatUsername', u);
    else localStorage.removeItem('chatUsername');
  }, []);

  return (
    <AppContext.Provider value={{
      currentUser, isAdmin: adminLoggedIn, adminLoggedIn,
      setCurrentUser: handleSetCurrentUser, setAdminLoggedIn,
      users, updateUser, deleteUser,
      systemState, setSystemState,
      messages, addMessage, toggleReaction, isAiThinking,
      userVoiceState, setUserVoiceState,
      micState, setMicState,
      activityLogs, addActivityLog,
    }}>
      {children}
    </AppContext.Provider>
  );
};

const thinkingTexts = [
  "Thinking deeply...",
  "Processing your thoughts...",
  "Analyzing...",
  "Generating insight...",
  "Crafting a response...",
];

export const getRandomThinkingText = () => thinkingTexts[Math.floor(Math.random() * thinkingTexts.length)];

function getAiResponse(input: string): string {
  const lower = input.toLowerCase();
  if (lower.includes('hello') || lower.includes('hi') || lower.includes('hey')) {
    return "Hey jarvis AI there! 👋 Great to see you. What's on your mind today?";
  }
  if (lower.includes('shaurya') || lower.includes('hellow')) {
    return "hiiee, Kaise hoo??, dinner kra? kitne bje kra? kya khaya? aur din me kya kya kara? sab batao mujhe, me aati hu room theek krke";
  }
  if (lower.includes('joke')) {
    return "Why do programmers prefer dark mode? Because light attracts bugs! 🐛😄";
  }
  const responses = [
    "That's a great question! Let me think about that for a moment... I'd say the answer lies in perspective. 🤔",
    "Interesting! Here's what I think — every challenge is an opportunity in disguise. 🚀",
    "I love that you asked! The short answer is yes, but the long answer involves quantum physics and pizza. 🍕",
    "You know what's fascinating about that? It connects to so many different fields of study. 📚",
    "Great point! I've been processing similar ideas, and I think we're onto something here. 💡",
    "That reminds me of an interesting concept — the butterfly effect. Small actions, massive outcomes. 🦋",
  ];
  return responses[Math.floor(Math.random() * responses.length)];
}
