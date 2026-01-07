import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useSessionStorage } from '@/hooks/useSessionStorage';

type ViewMode = 'progress' | 'countdown';

export const ViewToggle = () => {
  const [mode, setMode] = useSessionStorage<ViewMode>('view-mode', 'progress');

  const [isAnimating, setIsAnimating] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const triggerHaptic = () => {
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate(10);
    }
  };

  const handleToggle = () => {
    setMode((prev) => (prev === 'progress' ? 'countdown' : 'progress'));
    triggerHaptic();
  };

  const handleMobileTap = () => {
    if (isAnimating) return;
    setIsAnimating(true);
    setTimeout(() => handleToggle(), 150);
    setTimeout(() => setIsAnimating(false), 800);
  };

  if (!mounted) return <div className="h-12 w-12 ml-auto" />;

  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;

  // アイコンコンポーネント
  const Icon = ({ type, active }: { type: ViewMode; active: boolean }) => (
    <div
      className={`transition-all duration-300 ${
        active
          ? 'text-blue-600 scale-110 drop-shadow-sm'
          : 'text-slate-500 opacity-40 grayscale'
      }`}
    >
      {type === 'progress' ? (
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="3"
          strokeLinecap="round"
        >
          <path d="M5 12h14" />
        </svg>
      ) : (
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="3"
          strokeLinecap="round"
        >
          <circle cx="12" cy="12" r="10" strokeDasharray="4 4" />
        </svg>
      )}
    </div>
  );

  return (
    <div className="flex items-center justify-end h-12">
      <motion.div
        onClick={isMobile ? handleMobileTap : handleToggle}
        animate={{ width: isMobile && !isAnimating ? 48 : 96 }}
        transition={{ type: 'spring', stiffness: 400, damping: 30 }}
        className="relative h-12 rounded-full bg-[#f0f2f5] p-1 cursor-pointer overflow-hidden shadow-[inset_4px_4px_8px_#d1d5db,inset_-4px_-4px_8px_#ffffff] shrink-0"
      >
        <div className="absolute inset-y-1 left-1 w-22 flex items-center justify-between px-2.5 z-0">
          <Icon type="progress" active={false} />
          <Icon type="countdown" active={false} />
        </div>

        <motion.div
          className="absolute h-10 w-10 rounded-full bg-[#f0f2f5] z-10 shadow-[4px_4px_10px_#c8ccd1,-4px_-4px_10px_#ffffff] flex items-center justify-center border border-white/20"
          animate={{
            x: isMobile && !isAnimating ? 0 : mode === 'progress' ? 0 : 48,
          }}
          transition={{ type: 'spring', stiffness: 500, damping: 35 }}
        >
          <Icon type={mode} active={true} />
        </motion.div>

        <motion.div
          className="absolute inset-0 z-0 pointer-events-none"
          animate={{
            x: isMobile && !isAnimating && mode === 'countdown' ? -48 : 0,
          }}
          transition={{ type: 'spring', stiffness: 500, damping: 35 }}
        />
      </motion.div>
    </div>
  );
};
