import { useEffect, useMemo, useRef, useState } from 'react';
import { motion } from 'framer-motion';

interface Particle {
  id: number;
  x: number;
  y: number;
  size: number;
  duration: number;
  delay: number;
  opacity: number;
}

const AnimatedBackground = ({ intensity = 'normal' }: { intensity?: 'subtle' | 'normal' | 'intense' }) => {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleMouse = (e: MouseEvent) => {
      setMousePos({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', handleMouse);
    return () => window.removeEventListener('mousemove', handleMouse);
  }, []);

  const orbCount = intensity === 'subtle' ? 3 : intensity === 'intense' ? 7 : 5;
  const particleCount = intensity === 'subtle' ? 15 : intensity === 'intense' ? 40 : 25;

  const orbs = useMemo(() => [
    { size: 400, x: '5%', y: '15%', hue: 'primary', opacity: 0.08, delay: 0, duration: 25 },
    { size: 350, x: '75%', y: '55%', hue: 'accent', opacity: 0.06, delay: 3, duration: 30 },
    { size: 280, x: '85%', y: '5%', hue: 'primary', opacity: 0.05, delay: 5, duration: 22 },
    { size: 450, x: '20%', y: '75%', hue: 'accent', opacity: 0.04, delay: 2, duration: 28 },
    { size: 200, x: '50%', y: '40%', hue: 'warning', opacity: 0.03, delay: 7, duration: 20 },
    { size: 300, x: '40%', y: '10%', hue: 'primary', opacity: 0.04, delay: 4, duration: 26 },
    { size: 250, x: '60%', y: '80%', hue: 'accent', opacity: 0.05, delay: 6, duration: 24 },
  ].slice(0, orbCount), [orbCount]);

  const particles: Particle[] = useMemo(() => 
    Array.from({ length: particleCount }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 3 + 1,
      duration: Math.random() * 15 + 10,
      delay: Math.random() * 10,
      opacity: Math.random() * 0.4 + 0.1,
    }))
  , [particleCount]);

  return (
    <div ref={containerRef} className="fixed inset-0 overflow-hidden pointer-events-none z-0">
      {/* Floating orbs */}
      {orbs.map((orb, i) => (
        <motion.div
          key={`orb-${i}`}
          className="absolute rounded-full"
          style={{
            width: orb.size,
            height: orb.size,
            left: orb.x,
            top: orb.y,
            background: `radial-gradient(circle, hsl(var(--${orb.hue}) / ${orb.opacity}) 0%, transparent 70%)`,
            filter: 'blur(60px)',
          }}
          animate={{
            x: [0, 40, -30, 20, 0],
            y: [0, -30, 20, -15, 0],
            scale: [1, 1.15, 0.9, 1.1, 1],
          }}
          transition={{
            duration: orb.duration,
            repeat: Infinity,
            delay: orb.delay,
            ease: 'easeInOut',
          }}
        />
      ))}

      {/* Floating particles */}
      {particles.map(p => (
        <motion.div
          key={`particle-${p.id}`}
          className="absolute rounded-full bg-foreground"
          style={{
            width: p.size,
            height: p.size,
            left: `${p.x}%`,
            top: `${p.y}%`,
            opacity: 0,
          }}
          animate={{
            y: [0, -80, 0],
            x: [0, Math.random() * 40 - 20, 0],
            opacity: [0, p.opacity, 0],
          }}
          transition={{
            duration: p.duration,
            repeat: Infinity,
            delay: p.delay,
            ease: 'easeInOut',
          }}
        />
      ))}

      {/* Mouse-follow spotlight */}
      <div
        className="absolute w-[500px] h-[500px] rounded-full transition-all duration-700 ease-out"
        style={{
          left: mousePos.x - 250,
          top: mousePos.y - 250,
          background: 'radial-gradient(circle, hsl(var(--primary) / 0.04) 0%, transparent 70%)',
          filter: 'blur(40px)',
        }}
      />

      {/* Grid pattern */}
      <div
        className="absolute inset-0 opacity-[0.02]"
        style={{
          backgroundImage: `
            linear-gradient(hsl(var(--foreground)) 1px, transparent 1px),
            linear-gradient(90deg, hsl(var(--foreground)) 1px, transparent 1px)
          `,
          backgroundSize: '80px 80px',
        }}
      />

      {/* Vignette */}
      <div
        className="absolute inset-0"
        style={{
          background: 'radial-gradient(ellipse at center, transparent 50%, hsl(var(--background)) 100%)',
        }}
      />
    </div>
  );
};

export default AnimatedBackground;
