import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence, useMotionValue, useTransform } from 'framer-motion';
import { useApp, getRandomThinkingText } from '@/context/AppContext';
import { useNavigate } from 'react-router-dom';
import {
  Send, Mic, MicOff, Loader2, Clock, ShieldAlert,
  AlertTriangle, Wrench, Volume2, ArrowLeft, LogOut,
  Check, CheckCheck, Smile, Copy, Search, X, Sparkles
} from 'lucide-react';
import { toast } from 'sonner';

const REACTION_EMOJIS = ['👍', '❤️', '😂', '🔥', '🤔', '👏'];

const Chat = () => {
  const {
    currentUser, messages, addMessage, toggleReaction, isAiThinking,
    systemState, userVoiceState, setUserVoiceState,
    micState, setMicState, setCurrentUser
  } = useApp();
  const navigate = useNavigate();
  const [input, setInput] = useState('');
  const [thinkingText, setThinkingText] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [reactionMsgId, setReactionMsgId] = useState<string | null>(null);
  const [sendRipple, setSendRipple] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { if (!currentUser) navigate('/'); }, [currentUser, navigate]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isAiThinking]);

  useEffect(() => {
    if (isAiThinking) {
      setThinkingText(getRandomThinkingText());
      const interval = setInterval(() => setThinkingText(getRandomThinkingText()), 2000);
      return () => clearInterval(interval);
    }
  }, [isAiThinking]);

  const handleSend = () => {
    const trimmed = input.trim();
    if (!trimmed || !systemState.aiEnabled) return;
    setSendRipple(true);
    setTimeout(() => setSendRipple(false), 400);
    addMessage(trimmed, 'user');
    setInput('');
    inputRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); }
  };

  const handleVoiceRequest = () => { setUserVoiceState('pending'); toast.success('Voice access requested'); };

  const handleMicToggle = () => {
    if (micState === 'idle') {
      setMicState('recording');
      toast('Recording...', { icon: '🎤' });
      setTimeout(() => {
        setMicState('processing');
        setTimeout(() => { setMicState('idle'); addMessage('(Voice message transcribed)', 'user'); }, 1500);
      }, 2000);
    } else if (micState === 'recording') {
      setMicState('processing');
      setTimeout(() => setMicState('idle'), 1000);
    }
  };

  const handleLogout = () => { setCurrentUser(null); navigate('/'); };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard');
  };

  const formatTime = (date: Date) => new Date(date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  const filteredMessages = searchQuery
    ? messages.filter(m => m.text.toLowerCase().includes(searchQuery.toLowerCase()))
    : messages;

  if (systemState.maintenanceMode) {
    return <FullOverlay icon={<Wrench className="w-12 h-12 text-warning" />} title="We're under maintenance" message={systemState.maintenanceMessage} />;
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex flex-col h-screen bg-background relative"
    >
      {/* Subtle background gradient */}
      <div className="absolute inset-0 pointer-events-none z-0">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/[0.03] rounded-full blur-[100px]" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-accent/[0.03] rounded-full blur-[100px]" />
      </div>

      {/* Header */}
      <motion.header
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="glass-strong border-b border-border/30 px-4 sm:px-6 h-14 flex items-center justify-between shrink-0 relative z-10"
      >
        <div className="flex items-center gap-2.5">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate('/')}
            className="h-8 w-8 rounded-lg bg-secondary/80 flex items-center justify-center hover:bg-secondary transition-colors"
          >
            <ArrowLeft className="w-4 h-4 text-foreground" />
          </motion.button>
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-primary" />
            <span className="text-lg font-bold text-gradient">jarvis AI</span>
          </div>
          <motion.span
            className="w-2 h-2 rounded-full bg-success"
            animate={{ scale: [1, 1.3, 1], opacity: [1, 0.7, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
        </div>
        <div className="flex items-center gap-2">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowSearch(!showSearch)}
            className={`h-8 w-8 rounded-lg flex items-center justify-center transition-all ${showSearch ? 'bg-primary/15 text-primary' : 'bg-secondary/80 text-muted-foreground hover:bg-secondary'}`}
          >
            {showSearch ? <X className="w-4 h-4" /> : <Search className="w-4 h-4" />}
          </motion.button>
          <span className="text-sm text-muted-foreground hidden sm:flex items-center gap-1.5">
            <span className="w-6 h-6 rounded-md bg-primary/10 flex items-center justify-center text-primary text-xs font-bold">
              {currentUser?.[0]?.toUpperCase()}
            </span>
            <span className="text-foreground font-medium">{currentUser}</span>
          </span>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleLogout}
            className="h-8 w-8 rounded-lg bg-secondary/80 flex items-center justify-center hover:bg-destructive/15 hover:text-destructive transition-all"
            title="Logout"
          >
            <LogOut className="w-4 h-4" />
          </motion.button>
        </div>
      </motion.header>

      {/* Search Bar */}
      <AnimatePresence>
        {showSearch && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden border-b border-border/30 relative z-10"
          >
            <div className="px-4 py-2 glass">
              <div className="relative max-w-xl mx-auto">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                <input
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder="Search messages..."
                  className="w-full h-9 pl-9 pr-3 rounded-lg bg-secondary/80 border border-border/50 text-foreground text-sm placeholder:text-muted-foreground/60 focus:outline-none focus:ring-1 focus:ring-primary/40"
                  autoFocus
                />
              </div>
              {searchQuery && (
                <p className="text-[10px] text-muted-foreground mt-1 text-center">{filteredMessages.length} result(s)</p>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Banners */}
      <AnimatePresence>
        {!systemState.aiEnabled && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="bg-warning/10 border-b border-warning/20 px-4 py-2 text-center relative z-10"
          >
            <p className="text-sm text-warning flex items-center justify-center gap-2">
              <AlertTriangle className="w-4 h-4" /> AI is temporarily unavailable
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {!systemState.voiceEnabled && userVoiceState === 'approved' && (
        <div className="bg-muted/50 border-b border-border/30 px-4 py-1.5 text-center relative z-10">
          <p className="text-xs text-muted-foreground flex items-center justify-center gap-1">
            <Volume2 className="w-3 h-3" /> Voice is currently unavailable system-wide
          </p>
        </div>
      )}

      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-4 space-y-1 relative z-10">
        {/* Welcome message area */}
        {filteredMessages.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center h-full text-center gap-4"
          >
            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 3, repeat: Infinity }}
              className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/15 to-accent/15 flex items-center justify-center"
            >
              <Sparkles className="w-8 h-8 text-primary" />
            </motion.div>
            <p className="text-muted-foreground text-sm">Start a conversation with jarvis AI</p>
          </motion.div>
        )}

        <AnimatePresence initial={false}>
          {filteredMessages.map((msg, i) => {
            const showTime = i === 0 || (new Date(msg.timestamp).getTime() - new Date(filteredMessages[i - 1].timestamp).getTime() > 5 * 60 * 1000);
            const isUser = msg.sender === 'user';
            return (
              <React.Fragment key={msg.id}>
                {showTime && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex justify-center my-4"
                  >
                    <span className="text-[10px] text-muted-foreground/60 bg-secondary/60 backdrop-blur-sm px-3 py-1 rounded-full border border-border/30">
                      {formatTime(msg.timestamp)}
                    </span>
                  </motion.div>
                )}
                <motion.div
                  initial={{ opacity: 0, y: 15, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                  className={`flex ${isUser ? 'justify-end' : 'justify-start'} group mb-1.5`}
                >
                  <div className="relative max-w-[80%] sm:max-w-[65%]">
                    {/* AI avatar */}
                    {!isUser && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="absolute -left-8 top-1 w-5 h-5 rounded-md bg-primary/15 flex items-center justify-center"
                      >
                        <Sparkles className="w-3 h-3 text-primary" />
                      </motion.div>
                    )}

                    <motion.div
                      whileHover={{ scale: 1.01 }}
                      className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed cursor-default transition-shadow ${
                        isUser
                          ? 'bg-gradient-to-br from-chat-user to-chat-user/90 text-chat-user-foreground rounded-br-md shadow-lg shadow-chat-user/10'
                          : 'bg-chat-ai text-chat-ai-foreground rounded-bl-md border border-border/30'
                      }`}
                      onDoubleClick={() => handleCopy(msg.text)}
                    >
                      {/* Highlight search matches */}
                      {searchQuery ? (
                        <HighlightText text={msg.text} query={searchQuery} />
                      ) : msg.text}
                    </motion.div>

                    {/* Meta */}
                    <div className={`flex items-center gap-1.5 mt-0.5 ${isUser ? 'justify-end' : 'justify-start'} px-1`}>
                      <span className="text-[10px] text-muted-foreground/40">{formatTime(msg.timestamp)}</span>
                      {isUser && (
                        <motion.span
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="text-[10px]"
                        >
                          {msg.status === 'read' ? <CheckCheck className="w-3 h-3 text-accent inline" /> :
                           msg.status === 'delivered' ? <CheckCheck className="w-3 h-3 text-muted-foreground/60 inline" /> :
                           <Check className="w-3 h-3 text-muted-foreground/60 inline" />}
                        </motion.span>
                      )}
                    </div>

                    {/* Reactions */}
                    <AnimatePresence>
                      {msg.reactions.length > 0 && (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          className={`flex gap-0.5 mt-0.5 ${isUser ? 'justify-end' : 'justify-start'}`}
                        >
                          {msg.reactions.map((emoji, idx) => (
                            <motion.button
                              key={idx}
                              whileHover={{ scale: 1.2 }}
                              whileTap={{ scale: 0.9 }}
                              onClick={() => toggleReaction(msg.id, emoji)}
                              className="text-xs bg-secondary/80 rounded-full px-1.5 py-0.5 hover:bg-secondary transition-colors border border-border/30 backdrop-blur-sm"
                            >
                              {emoji}
                            </motion.button>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {/* Hover actions */}
                    <div className={`absolute top-0 ${isUser ? '-left-[72px]' : '-right-[72px]'} opacity-0 group-hover:opacity-100 transition-all duration-200 flex gap-1`}>
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => setReactionMsgId(reactionMsgId === msg.id ? null : msg.id)}
                        className="h-7 w-7 rounded-lg glass flex items-center justify-center text-muted-foreground hover:text-foreground text-xs"
                      >
                        <Smile className="w-3.5 h-3.5" />
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => handleCopy(msg.text)}
                        className="h-7 w-7 rounded-lg glass flex items-center justify-center text-muted-foreground hover:text-foreground text-xs"
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </motion.button>
                    </div>

                    {/* Reaction picker */}
                    <AnimatePresence>
                      {reactionMsgId === msg.id && (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.7, y: 5 }}
                          animate={{ opacity: 1, scale: 1, y: 0 }}
                          exit={{ opacity: 0, scale: 0.7, y: 5 }}
                          className={`absolute ${isUser ? 'right-0' : 'left-0'} -top-11 z-10 flex gap-1.5 glass-strong rounded-2xl px-3 py-2 shadow-2xl`}
                        >
                          {REACTION_EMOJIS.map((emoji, idx) => (
                            <motion.button
                              key={emoji}
                              initial={{ scale: 0, rotate: -30 }}
                              animate={{ scale: 1, rotate: 0 }}
                              transition={{ delay: idx * 0.04, type: 'spring', stiffness: 400 }}
                              onClick={() => { toggleReaction(msg.id, emoji); setReactionMsgId(null); }}
                              className="hover:scale-150 transition-transform text-lg"
                            >
                              {emoji}
                            </motion.button>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </motion.div>
              </React.Fragment>
            );
          })}
        </AnimatePresence>

        {/* AI Thinking */}
        <AnimatePresence>
          {isAiThinking && (
            <motion.div
              initial={{ opacity: 0, y: 15, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="flex justify-start mb-1.5"
            >
              <div className="relative">
                <div className="absolute -left-8 top-1 w-5 h-5 rounded-md bg-primary/15 flex items-center justify-center">
                  <motion.div animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}>
                    <Sparkles className="w-3 h-3 text-primary" />
                  </motion.div>
                </div>
                <div className="bg-chat-ai text-chat-ai-foreground px-4 py-3 rounded-2xl rounded-bl-md border border-border/30">
                  <div className="flex items-center gap-2.5">
                    <div className="flex gap-1">
                      {[0, 0.2, 0.4].map((delay, idx) => (
                        <motion.span
                          key={idx}
                          className="w-2 h-2 rounded-full bg-primary/60"
                          animate={{ y: [0, -6, 0], opacity: [0.4, 1, 0.4] }}
                          transition={{ duration: 0.8, delay, repeat: Infinity }}
                        />
                      ))}
                    </div>
                    <motion.span
                      key={thinkingText}
                      initial={{ opacity: 0, x: -5 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="text-xs text-muted-foreground italic"
                    >
                      {thinkingText}
                    </motion.span>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        <div ref={chatEndRef} />
      </div>

      {/* Input Area */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="shrink-0 glass-strong border-t border-border/30 px-4 sm:px-6 py-3 relative z-10"
      >
        <div className="flex items-center gap-2 max-w-3xl mx-auto">
          <div className="flex-1 relative">
            <input
              ref={inputRef}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={systemState.aiEnabled ? 'Type your message…' : 'AI is unavailable'}
              disabled={!systemState.aiEnabled}
              className="w-full h-11 px-4 rounded-xl bg-secondary/60 border border-border/40 text-foreground placeholder:text-muted-foreground/50 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/30 transition-all disabled:opacity-30"
            />
            {input.length > 0 && (
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-muted-foreground/40"
              >
                {input.length}
              </motion.span>
            )}
          </div>

          <VoiceButton
            voiceState={userVoiceState}
            micState={micState}
            voiceSystemEnabled={systemState.voiceEnabled}
            onRequest={handleVoiceRequest}
            onMicToggle={handleMicToggle}
          />

          <motion.button
            onClick={handleSend}
            disabled={!input.trim() || !systemState.aiEnabled}
            className="h-11 w-11 rounded-xl bg-gradient-to-br from-primary to-primary/80 text-primary-foreground flex items-center justify-center transition-all disabled:opacity-20 disabled:cursor-not-allowed relative overflow-hidden"
            whileHover={{ scale: input.trim() ? 1.05 : 1, boxShadow: input.trim() ? '0 0 25px hsla(152, 60%, 48%, 0.4)' : 'none' }}
            whileTap={{ scale: input.trim() ? 0.9 : 1 }}
          >
            {sendRipple && (
              <motion.span
                initial={{ scale: 0, opacity: 0.5 }}
                animate={{ scale: 3, opacity: 0 }}
                transition={{ duration: 0.4 }}
                className="absolute inset-0 rounded-xl bg-primary-foreground/30"
              />
            )}
            <motion.div
              animate={input.trim() ? { rotate: [0, -10, 0] } : {}}
              transition={{ duration: 0.3 }}
            >
              <Send className="w-4 h-4 relative z-10" />
            </motion.div>
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  );
};

// Search highlight
const HighlightText = ({ text, query }: { text: string; query: string }) => {
  const parts = text.split(new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi'));
  return (
    <>
      {parts.map((part, i) =>
        part.toLowerCase() === query.toLowerCase() ? (
          <mark key={i} className="bg-warning/30 text-foreground rounded px-0.5">{part}</mark>
        ) : (
          <span key={i}>{part}</span>
        )
      )}
    </>
  );
};

// Voice Button Component
const VoiceButton = ({
  voiceState, micState, voiceSystemEnabled, onRequest, onMicToggle
}: {
  voiceState: string; micState: string; voiceSystemEnabled: boolean;
  onRequest: () => void; onMicToggle: () => void;
}) => {
  if (!voiceSystemEnabled) {
    return (
      <button disabled className="h-11 px-3 rounded-xl bg-secondary/60 text-muted-foreground text-xs opacity-40 cursor-not-allowed">
        <MicOff className="w-4 h-4" />
      </button>
    );
  }
  if (voiceState === 'none' || voiceState === 'expired' || voiceState === 'denied') {
    return (
      <motion.button
        whileHover={{ scale: 1.03 }}
        whileTap={{ scale: 0.97 }}
        onClick={onRequest}
        className="h-11 px-3 rounded-xl bg-accent/10 text-accent text-xs font-medium hover:bg-accent/20 transition-colors whitespace-nowrap border border-accent/20"
      >
        {voiceState === 'expired' ? 'Expired – Request' : voiceState === 'denied' ? 'Request Again' : 'Request Voice'}
      </motion.button>
    );
  }
  if (voiceState === 'pending') {
    return (
      <button disabled className="h-11 px-3 rounded-xl bg-warning/10 text-warning text-xs font-medium opacity-70 cursor-not-allowed flex items-center gap-1.5 whitespace-nowrap border border-warning/20">
        <motion.div animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}>
          <Clock className="w-3.5 h-3.5" />
        </motion.div>
        Pending
      </button>
    );
  }
  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.9 }}
      onClick={onMicToggle}
      className={`h-11 w-11 rounded-xl flex items-center justify-center transition-all relative ${
        micState === 'recording' ? 'bg-destructive text-destructive-foreground' :
        micState === 'processing' ? 'bg-warning/20 text-warning' :
        'bg-secondary/80 text-foreground hover:bg-secondary'
      }`}
    >
      {micState === 'recording' && (
        <motion.div
          className="absolute inset-0 rounded-xl border-2 border-destructive"
          animate={{ scale: [1, 1.3], opacity: [0.8, 0] }}
          transition={{ duration: 1, repeat: Infinity }}
        />
      )}
      {micState === 'processing' ? <Loader2 className="w-4 h-4 animate-spin" /> : <Mic className="w-4 h-4" />}
    </motion.button>
  );
};

// Full screen overlay
const FullOverlay = ({ icon, title, message }: { icon: React.ReactNode; title: string; message: string }) => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    className="min-h-screen flex items-center justify-center bg-background p-4 relative overflow-hidden"
  >
    <div className="absolute inset-0">
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-warning/5 rounded-full blur-[120px]" />
    </div>
    <div className="text-center space-y-6 relative z-10">
      <motion.div
        animate={{ y: [0, -12, 0], rotate: [0, 5, -5, 0] }}
        transition={{ duration: 4, repeat: Infinity }}
      >
        {icon}
      </motion.div>
      <h1 className="text-3xl font-black text-foreground">{title}</h1>
      <p className="text-muted-foreground max-w-sm text-sm">{message}</p>
      <motion.div
        className="w-16 h-1 bg-gradient-to-r from-warning to-warning/30 rounded-full mx-auto"
        animate={{ scaleX: [1, 0.5, 1] }}
        transition={{ duration: 2, repeat: Infinity }}
      />
    </div>
  </motion.div>
);

export default Chat;
