import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { getTimeSnapshot, type TimeSnapshot } from '@/lib/time-engine';

interface TimeContextValue {
  snapshot: TimeSnapshot;
}

const TimeContext = createContext<TimeContextValue | null>(null);

export const TimeProvider = ({ children }: { children: ReactNode }) => {
  const [snapshot, setSnapshot] = useState<TimeSnapshot>(() =>
    getTimeSnapshot()
  );
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    const loop = () => {
      setSnapshot(getTimeSnapshot());
      rafRef.current = requestAnimationFrame(loop);
    };
    rafRef.current = requestAnimationFrame(loop);
    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  return (
    <TimeContext.Provider value={{ snapshot }}>{children}</TimeContext.Provider>
  );
};

export const useTimeContext = (): TimeContextValue => {
  const ctx = useContext(TimeContext);
  if (!ctx) throw new Error('useTimeContext must be used within TimeProvider');
  return ctx;
};
