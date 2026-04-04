import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Lock, ArrowRight, ArrowLeft, ShieldCheck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '@/context/AppContext';
import { toast } from 'sonner';
import AnimatedBackground from '@/components/AnimatedBackground';

const ADMIN_PASSWORD = 'admin123';

const AdminLogin = () => {
  const [password, setPassword] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const [isShaking, setIsShaking] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const { setAdminLoggedIn } = useApp();
  const navigate = useNavigate();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === ADMIN_PASSWORD) {
      setIsTransitioning(true);
      toast.success('Welcome, Admin');
      setTimeout(() => {
        setAdminLoggedIn(true);
        navigate('/admin/dashboard');
      }, 500);
    } else {
      setIsShaking(true);
      toast.error('Invalid password');
      setTimeout(() => setIsShaking(false), 600);
    }
  };

  return (
    <motion.div
      className="min-h-screen flex items-center justify-center bg-background p-4 relative overflow-hidden"
      animate={isTransitioning ? { opacity: 0, scale: 0.9, filter: 'blur(10px)' } : { opacity: 1, scale: 1, filter: 'blur(0px)' }}
      transition={{ duration: 0.5 }}
    >
      <AnimatedBackground intensity="subtle" />

      {/* Back button */}
      <motion.button
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.3 }}
        onClick={() => navigate('/')}
        className="absolute top-5 left-5 h-10 w-10 rounded-xl glass flex items-center justify-center hover:bg-secondary/80 transition-all z-10 interactive-scale"
      >
        <ArrowLeft className="w-4 h-4 text-foreground" />
      </motion.button>

      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-sm relative"
      >
        <motion.div
          animate={isShaking ? { x: [-10, 10, -8, 8, -4, 4, 0] } : {}}
          transition={{ duration: 0.5 }}
        >
          <div className="glass-strong rounded-3xl p-8 space-y-7 noise-bg shadow-2xl shadow-accent/5">
            {/* Animated top border */}
            <motion.div
              className="absolute top-0 left-[10%] right-[10%] h-[2px] rounded-full"
              style={{
                background: 'linear-gradient(90deg, transparent, hsl(var(--accent)), transparent)',
              }}
              animate={{ opacity: [0.3, 0.8, 0.3] }}
              transition={{ duration: 3, repeat: Infinity }}
            />

            <div className="text-center space-y-3">
              <motion.div
                className="mx-auto w-16 h-16 rounded-2xl bg-gradient-to-br from-accent/20 to-primary/10 flex items-center justify-center ring-1 ring-accent/20 relative"
                animate={{ y: [0, -5, 0] }}
                transition={{ duration: 3, repeat: Infinity }}
              >
                <Lock className="w-7 h-7 text-accent" />
                <motion.div
                  className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-primary flex items-center justify-center"
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <ShieldCheck className="w-3 h-3 text-primary-foreground" />
                </motion.div>
              </motion.div>
              <h1 className="text-2xl font-bold text-foreground">Admin Access</h1>
              <p className="text-sm text-muted-foreground/70">Enter credentials to continue</p>
            </div>

            <form onSubmit={handleLogin} className="space-y-4">
              <div className={`relative rounded-xl transition-all duration-300 ${isFocused ? 'ring-2 ring-accent/40' : ''}`}>
                {isFocused && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="absolute -inset-1 rounded-xl bg-accent/5 blur-sm -z-10"
                  />
                )}
                <input
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  onFocus={() => setIsFocused(true)}
                  onBlur={() => setIsFocused(false)}
                  placeholder="Enter admin password"
                  className="w-full h-12 px-4 rounded-xl bg-secondary/80 border border-border/60 text-foreground placeholder:text-muted-foreground/60 focus:outline-none transition-all"
                />
              </div>
              <motion.button
                type="submit"
                disabled={!password}
                className="w-full h-12 rounded-xl bg-gradient-to-r from-accent to-accent/80 text-accent-foreground font-bold flex items-center justify-center gap-2 transition-all disabled:opacity-30 disabled:cursor-not-allowed relative overflow-hidden"
                whileHover={{ scale: password ? 1.02 : 1, boxShadow: password ? '0 0 30px hsla(215, 80%, 55%, 0.3)' : 'none' }}
                whileTap={{ scale: password ? 0.98 : 1 }}
              >
                Login <ArrowRight className="w-4 h-4" />
              </motion.button>
            </form>
            <p className="text-xs text-center text-muted-foreground/50">Demo password: admin123</p>
          </div>
        </motion.div>
      </motion.div>
    </motion.div>
  );
};

export default AdminLogin;
