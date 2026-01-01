import React, { useEffect, useMemo, useState } from 'react';
import { motion } from 'motion/react';
import { useTimeContext } from '@/hooks/useTimeContext';

const clamp = (v: number, min = 0, max = 100) =>
  Math.min(Math.max(v, min), max);

const DisplayProgress = () => {
  const { snapshot } = useTimeContext();
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => setHydrated(true), []);

  const percentRaw = useMemo(
    () => clamp(snapshot.progressPercent),
    [snapshot.progressPercent]
  );
  const percent = useMemo(() => Number(percentRaw.toFixed(6)), [percentRaw]);
  const shown = hydrated ? percent : 0;

  return (
    <div className="flex flex-col gap-3 items-center text-center w-full">
      <div className="text-sm text-gray-500">進捗</div>

      <div className="flex flex-col gap-2 w-full max-w-3xl">
        <div className="flex items-center gap-3">
          <span className="hidden sm:flex h-8 w-8 items-center justify-center rounded-full bg-white text-sm shadow-sm ring-1 ring-[#d9deeb]">
            ⏱️
          </span>
          <div className="relative h-4 flex-1 overflow-hidden rounded-full bg-[#dde3f0]">
            <motion.div
              className="h-full"
              style={{
                width: `${shown}%`,
                minWidth: shown > 0 ? '4px' : '0px',
                background: 'linear-gradient(90deg, #2563eb, #7c3aed)',
              }}
              initial={false}
              animate={{ width: `${shown}%` }}
              transition={{ duration: 0.16, ease: 'easeOut' }}
            />
          </div>
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white text-sm shadow-sm ring-1 ring-[#d9deeb]">
            🏁
          </span>
        </div>

        <div className="flex items-center justify-between text-xs text-gray-500">
          <span>0%</span>
          <span className="font-mono tabular-nums text-lg text-gray-900">
            {shown.toFixed(6)}%
          </span>
        </div>
      </div>
    </div>
  );
};

export default DisplayProgress;
