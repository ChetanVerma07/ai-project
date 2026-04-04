import { useLocation, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { motion } from "framer-motion";
import { Ghost, ArrowLeft } from "lucide-react";
import AnimatedBackground from "@/components/AnimatedBackground";

const NotFound = () => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background relative overflow-hidden p-4">
      <AnimatedBackground intensity="subtle" />
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center relative z-10 space-y-6"
      >
        <motion.div
          animate={{ y: [0, -15, 0], rotate: [0, 5, -5, 0] }}
          transition={{ duration: 4, repeat: Infinity }}
          className="inline-block"
        >
          <Ghost className="w-20 h-20 text-muted-foreground/30 mx-auto" />
        </motion.div>
        <motion.h1
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
          className="text-8xl font-black text-gradient"
        >
          404
        </motion.h1>
        <p className="text-lg text-muted-foreground">This page doesn't exist in this dimension</p>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => navigate('/')}
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-primary text-primary-foreground font-semibold glow-primary"
        >
          <ArrowLeft className="w-4 h-4" /> Go Home
        </motion.button>
      </motion.div>
    </div>
  );
};

export default NotFound;
