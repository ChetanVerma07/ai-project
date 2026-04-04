import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, ArrowRight, Zap, Bot, Cpu } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '@/context/AppContext';
import AnimatedBackground from '@/components/AnimatedBackground';

const FEATURES = [
  { icon: Bot, text: 'AI-Powered Conversations' },
  { icon: Zap, text: 'Lightning Fast Responses' },
  { icon: Cpu, text: 'Personalized Experience' },
];

const UserLogin = () => {
  const [username, setUsername] = useState('');
  const { setCurrentUser } = useApp();
  const navigate = useNavigate();
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [titleRevealed, setTitleRevealed] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [ripples, setRipples] = useState<{ id: number; x: number; y: number }[]>([]);

  useEffect(() => {
    const timer = setTimeout(() => setTitleRevealed(true), 300);
    return () => clearTimeout(timer);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = username.trim();
    if (!trimmed) return;
    setIsTransitioning(true);
    setTimeout(() => {
      setCurrentUser(trimmed);
      navigate('/chat');
    }, 600);
  };

  const addRipple = useCallback((e: React.MouseEvent<HTMLButtonElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const ripple = {
      id: Date.now(),
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
    setRipples(prev => [...prev, ripple]);
    setTimeout(() => setRipples(prev => prev.filter(r => r.id !== ripple.id)), 600);
  }, []);

  const titleChars = "jarvis AI".split('');

  return (
    <motion.div
      className="min-h-screen flex items-center justify-center bg-background p-4 relative overflow-hidden"
      animate={isTransitioning ? { opacity: 0, scale: 0.9, filter: 'blur(10px)' } : { opacity: 1, scale: 1, filter: 'blur(0px)' }}
      transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
    >
      <AnimatedBackground intensity="intense" />

      <div className="w-full max-w-md relative z-10">
        {/* Card */}
        <motion.div
          initial={{ opacity: 0, y: 40, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="relative"
        >
          <div className="glass-strong rounded-3xl p-8 sm:p-10 space-y-8 noise-bg shadow-2xl shadow-primary/5">
            {/* Animated border glow */}
            <motion.div
              className="absolute -inset-[1px] rounded-3xl opacity-50"
              style={{
                background: 'linear-gradient(135deg, hsl(var(--primary) / 0.3), hsl(var(--accent) / 0.2), hsl(var(--primary) / 0.1))',
                backgroundSize: '200% 200%',
                animation: 'gradient-shift 6s ease infinite',
                zIndex: -1,
                filter: 'blur(1px)',
              }}
            />

            {/* Logo */}
            <div className="text-center space-y-4">
              <motion.div
                className="mx-auto w-20 h-20 rounded-2xl relative flex items-center justify-center"
                animate={{ y: [0, -8, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
              >
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-primary/25 to-accent/25 blur-sm" />
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-primary/20 to-accent/20 ring-1 ring-primary/20" />
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
                  className="absolute inset-1 rounded-xl border border-dashed border-primary/20"
                />
                <Sparkles className="w-9 h-9 text-primary relative z-10" />
              </motion.div>

              {/* Character-by-character title */}
              <h1 className="text-4xl font-black tracking-tight">
                {titleChars.map((char, i) => (
                  <motion.span
                    key={i}
                    className="text-gradient inline-block"
                    initial={{ opacity: 0, y: 20, rotateX: -90 }}
                    animate={titleRevealed ? { opacity: 1, y: 0, rotateX: 0 } : {}}
                    transition={{ duration: 0.4, delay: i * 0.04, ease: [0.16, 1, 0.3, 1] }}
                  >
                    {char === ' ' ? '\u00A0' : char}
                  </motion.span>
                ))}
              </h1>

              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8, duration: 0.6 }}
                className="text-sm text-muted-foreground"
              >
                Talk to your personalized AI experience
              </motion.p>
            </div>

            {/* Features */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1, duration: 0.5 }}
              className="flex justify-center gap-6"
            >
              {FEATURES.map((f, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1.1 + i * 0.15 }}
                  className="flex flex-col items-center gap-1.5 group cursor-default"
                >
                  <div className="w-9 h-9 rounded-xl bg-secondary/80 flex items-center justify-center group-hover:bg-primary/15 transition-colors duration-300">
                    <f.icon className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors duration-300" />
                  </div>
                  <span className="text-[10px] text-muted-foreground/70 text-center leading-tight max-w-[70px]">{f.text}</span>
                </motion.div>
              ))}
            </motion.div>

            {/* Form */}
            <motion.form
              onSubmit={handleSubmit}
              className="space-y-4"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.6 }}
            >
              <div className="space-y-2">
                <div className={`relative rounded-xl transition-all duration-300 ${isFocused ? 'ring-2 ring-primary/40' : ''}`}>
                  {/* Input glow */}
                  {isFocused && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="absolute -inset-1 rounded-xl bg-primary/5 blur-sm -z-10"
                    />
                  )}
                  <input
                    id="usernameInput"
                    type="text"
                    value={username}
                    onChange={e => setUsername(e.target.value)}
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setIsFocused(false)}
                    placeholder="Enter your name…"
                    className="w-full h-13 px-5 rounded-xl bg-secondary/80 border border-border/60 text-foreground placeholder:text-muted-foreground/60 text-base focus:outline-none transition-all"
                    autoFocus
                    autoComplete="off"
                  />
                </div>
                <p className="text-xs text-muted-foreground/60 text-center">
                  This name will be used to personalize your experience
                </p>
              </div>

              {/* Submit button with ripple */}
              <motion.button
                id="startBtn"
                type="submit"
                disabled={!username.trim()}
                onClick={addRipple}
                className="w-full h-13 rounded-xl bg-gradient-to-r from-primary to-primary/80 text-primary-foreground font-bold flex items-center justify-center gap-2 transition-all disabled:opacity-20 disabled:cursor-not-allowed relative overflow-hidden group"
                whileHover={{ scale: username.trim() ? 1.02 : 1, boxShadow: username.trim() ? '0 0 30px hsla(152, 60%, 48%, 0.4)' : 'none' }}
                whileTap={{ scale: username.trim() ? 0.98 : 1 }}
              >
                {ripples.map(r => (
                  <span
                    key={r.id}
                    className="absolute w-4 h-4 rounded-full bg-primary-foreground/30"
                    style={{ left: r.x - 8, top: r.y - 8, animation: 'ripple 0.6s ease-out' }}
                  />
                ))}
                <span className="relative z-10 flex items-center gap-2">
                  Start Chat
                  <motion.span
                    animate={{ x: [0, 4, 0] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  >
                    <ArrowRight className="w-4 h-4" />
                  </motion.span>
                </span>
              </motion.button>
            </motion.form>
          </div>
        </motion.div>

        {/* Admin link */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5 }}
          className="text-xs text-center text-muted-foreground/60 mt-8"
        >
          <button
            onClick={() => navigate('/admin')}
            className="hover:text-foreground transition-all duration-300 underline underline-offset-4 decoration-border hover:decoration-primary"
          >
            Admin Access →
          </button>
        </motion.p>
      </div>
    </motion.div>
  );
};

export default UserLogin;
