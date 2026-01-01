import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react';
import {
  getTimeSnapshot,
  timeEngine,
  type TimeSnapshot,
} from '@/lib/time-engine';

interface TimeContextValue {
  snapshot: TimeSnapshot;
}

const TimeContext = createContext<TimeContextValue | null>(null);

export const TimeProvider = ({ children }: { children: ReactNode }) => {
  const [snapshot, setSnapshot] = useState<TimeSnapshot>(
    () => timeEngine.getSnapshot?.() ?? getTimeSnapshot()
  );

  useEffect(() => {
    // ブラウザのみエンジン起動
    timeEngine.start();
    const unsubscribe = timeEngine.subscribe((snap) => setSnapshot(snap));
    return () => {
      unsubscribe();
      timeEngine.stop();
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
