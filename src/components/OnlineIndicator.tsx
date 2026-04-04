import { motion } from 'framer-motion';

const OnlineIndicator = ({ isOnline, size = 'sm' }: { isOnline: boolean; size?: 'sm' | 'md' }) => {
  const dims = size === 'sm' ? 'w-2 h-2' : 'w-2.5 h-2.5';
  return (
    <span className="relative inline-flex">
      <span className={`${dims} rounded-full ${isOnline ? 'bg-success' : 'bg-muted-foreground/30'}`} />
      {isOnline && (
        <>
          <motion.span
            className={`absolute inset-0 ${dims} rounded-full bg-success`}
            animate={{ scale: [1, 2], opacity: [0.6, 0] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          />
          <motion.span
            className={`absolute inset-0 ${dims} rounded-full bg-success`}
            animate={{ scale: [1, 2], opacity: [0.4, 0] }}
            transition={{ duration: 1.5, repeat: Infinity, delay: 0.5 }}
          />
        </>
      )}
    </span>
  );
};

export default OnlineIndicator;
