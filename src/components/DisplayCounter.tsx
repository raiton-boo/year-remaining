import { useMemo, useState } from 'react';
import { useTimeContext } from '@/hooks/useTimeContext';
import type { DisplayMode } from '@/lib/types';

const getDisplayMode = (now: Date): DisplayMode => {
  const m = now.getMonth() + 1;
  const d = now.getDate();
  if (m === 12 && d >= 20) return 'FULL';
  if (m === 12) return 'DAYS_MINUTES';
  if (m === 11 && d >= 1) return 'DAYS_HOURS';
  return 'DAYS';
};

const formatRemaining = (ms: number, mode: DisplayMode) => {
  const totalSeconds = Math.floor(ms / 1000);
  const days = Math.floor(totalSeconds / 86_400);
  const hours = Math.floor((totalSeconds % 86_400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  const millis = ms % 1000;

  if (mode === 'DAYS') return `${days}日`;
  if (mode === 'DAYS_HOURS') return `${days}日 ${hours}時間`;
  if (mode === 'DAYS_MINUTES') return `${days}日 ${hours}時間 ${minutes}分`;
  return `${days}日 ${hours}時間 ${minutes}分 ${seconds}秒 ${millis
    .toString()
    .padStart(3, '0')}ms`;
};

const DisplayCounter = () => {
  const { snapshot } = useTimeContext();
  const [showDetail, setShowDetail] = useState(false);

  const mode = useMemo(
    () => getDisplayMode(snapshot.nowJst),
    [snapshot.nowJst]
  );
  const displayMode = showDetail ? 'FULL' : mode;

  const handlePointerDown = () => setShowDetail(true);
  const handlePointerUp = () => setShowDetail(false);

  return (
    <div
      className="select-none"
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      onPointerLeave={handlePointerUp}
    >
      <div className="text-sm text-gray-500">今年の残り時間</div>
      <div className="font-mono tabular-nums text-4xl text-gray-900">
        {formatRemaining(snapshot.remainingMs, displayMode)}
      </div>
    </div>
  );
};

export default DisplayCounter;
