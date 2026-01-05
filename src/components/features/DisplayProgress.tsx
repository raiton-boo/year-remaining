import React, { useEffect, useMemo, useState } from 'react';
import { useTimeContext } from '@/hooks/useTimeContext';
import { ProgressBar } from '../ui/Progress';

// 値をmin〜maxの範囲にクランプ
const clamp = (v: number, min = 0, max = 100) =>
  Math.min(Math.max(v, min), max);

// メインコンポーネント
const DisplayProgress = () => {
  const { snapshot, introPlaying, introDurationMs } = useTimeContext();
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => setHydrated(true), []);

  const percent = useMemo(
    () => clamp(snapshot.progressPercent, 0, 100),
    [snapshot.progressPercent]
  );
  const shown = hydrated ? percent : 0;

  return (
    <ProgressBar
      percentage={shown}
      introPlaying={introPlaying}
      introDurationMs={introDurationMs}
    />
  );
};

export default DisplayProgress;
