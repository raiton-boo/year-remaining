import { useEffect, useRef } from 'react';
import { useTimeContext } from './useTimeContext';
import { floorFixed } from '@/lib/time-engine';

export const useTitleSync = () => {
  const { snapshot } = useTimeContext();
  const original = useRef<string | null>(null);

  useEffect(() => {
    if (typeof document === 'undefined') return;
    if (original.current === null) original.current = document.title;
    const percentText = floorFixed(snapshot.progressPercent, 5);
    document.title = `${percentText}% | Year Remaining`;
    return () => {
      if (original.current !== null) document.title = original.current;
    };
  }, [snapshot.progressPercent]);
};
