import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import {
  getTimeSnapshot,
  timeEngine,
  type TimeSnapshot,
} from '@/core/time-engine';

interface TimeContextValue {
  snapshot: TimeSnapshot;
  introPlaying: boolean;
  introDurationMs: number;
}

const TimeContext = createContext<TimeContextValue | null>(null);

export const TimeProvider = ({ children }: { children: ReactNode }) => {
  const [introPlaying, setIntroPlaying] = useState(true);
  const [introDurationMs, setIntroDurationMs] = useState(400);
  const [snapshot, setSnapshot] = useState<TimeSnapshot>(() =>
    getTimeSnapshot()
  );
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const targetSnap = getTimeSnapshot();
    setSnapshot(targetSnap);

    // 最短0.18s〜最長0.5s（進捗依存）
    const dur = Math.min(
      500,
      Math.max(180, 180 + (targetSnap.progressPercent / 100) * 320)
    );
    setIntroDurationMs(dur);

    timerRef.current = setTimeout(() => setIntroPlaying(false), dur);

    timeEngine.start();
    const unsubscribe = timeEngine.subscribe((snap) => {
      setSnapshot(snap);
    });

    return () => {
      unsubscribe();
      timeEngine.stop();
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  const value = useMemo(
    () => ({ snapshot, introPlaying, introDurationMs }),
    [snapshot, introPlaying, introDurationMs]
  );

  return <TimeContext.Provider value={value}>{children}</TimeContext.Provider>;
};

export const useTimeContext = (): TimeContextValue => {
  const ctx = useContext(TimeContext);
  if (!ctx) throw new Error('useTimeContext must be used within TimeProvider');
  return ctx;
};
