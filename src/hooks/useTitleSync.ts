/** タイトルを時間の進捗に同期させるフック */

import { useEffect, useRef } from 'react';
import { useTimeContext } from './useTimeContext';
import { floorFixed } from '@/core/time-engine';

// ドキュメントタイトルを時間の進捗に同期させるフック
export const useTitleSync = () => {
  const { snapshot } = useTimeContext();
  const original = useRef<string | null>(null);

  useEffect(() => {
    if (typeof document === 'undefined') return;
    if (original.current === null) original.current = document.title;
    const percentText = floorFixed(snapshot.progressPercent, 5);
    document.title = `${percentText}% | ことしのこり`;
    return () => {
      if (original.current !== null) document.title = original.current;
    };
  }, [snapshot.progressPercent]);
};
