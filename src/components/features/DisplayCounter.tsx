// src/components/features/DisplayCounter.tsx
import React, { useEffect, useMemo, useState } from 'react';
import { useTimeContext } from '@/hooks/useTimeContext';
import { motion, AnimatePresence, LayoutGroup } from 'motion/react';
import { ElapsedHeader } from '../ui/ElapsedHeader';
import { TimeSegment, TimeUnitDot } from '../ui/TimeSegment';
import { useSessionStorage } from '@/hooks/useSessionStorage';
import type { TimeData } from '@/types';

const DisplayCounter: React.FC = () => {
  const { snapshot } = useTimeContext();
  const [hydrated, setHydrated] = useState(false);
  const [forcedDetail, setForcedDetail] = useSessionStorage('count-detail-forced', false);

  useEffect(() => setHydrated(true), []);

  const currentYear = new Date().getFullYear();

  // --- Logic ---
  const elapsedDays = useMemo(() => {
    const start = new Date(currentYear, 0, 1);
    return Math.floor((new Date().getTime() - start.getTime()) / 86400000);
  }, [snapshot]);

  const dynamicLabel = useMemo(() => {
    const d = snapshot.timeState.days;
    if (d >= 300) return `${currentYear}年は始まったばかり`;
    if (d >= 200) return `${currentYear}年も折り返し地点へ`;
    if (d >= 100) return `後半戦を刻む ${currentYear}年`;
    if (d >= 50) return `終わりへと向かう ${currentYear}年`;
    if (d >= 21) return `いよいよ大詰めを迎えた ${currentYear}年`;
    return `${currentYear}年 最高の締めくくりを`;
  }, [snapshot.timeState.days, currentYear]);

  const timeData: TimeData = useMemo(() => {
    const ms = snapshot.remainingMs;
    const totalSec = Math.floor(ms / 1000);
    return {
      days: snapshot.timeState.days,
      hours: String(Math.floor((totalSec % 86400) / 3600)).padStart(2, '0'),
      minutes: String(Math.floor((totalSec % 3600) / 60)).padStart(2, '0'),
      seconds: String(totalSec % 60).padStart(2, '0'),
      millis: String(Math.floor((ms % 1000) / 10)).padStart(2, '0'),
    };
  }, [snapshot]);

  const baseMode = useMemo(() => {
    const m = new Date().getMonth() + 1;
    const d = new Date().getDate();
    if (m === 12 && d >= 20) return 'FULL';
    if (m === 12) return 'DAYS_MINUTES';
    if (m === 11) return 'DAYS_HOURS';
    return 'DAYS';
  }, [snapshot]);

  const isDetailActive = forcedDetail || baseMode !== 'DAYS';
  const isFullMode = forcedDetail || baseMode === 'FULL';

  if (!hydrated) return <div className="h-64 sm:h-80" />;

  return (
    <div
      className={`flex flex-col items-center justify-center py-8 sm:py-12 select-none w-full overflow-hidden ${
        baseMode !== 'FULL' ? 'cursor-pointer' : ''
      }`}
      onClick={() => baseMode !== 'FULL' && setForcedDetail(!forcedDetail)}
    >
      <ElapsedHeader year={currentYear} days={elapsedDays} />

      <LayoutGroup>
        <div className="flex flex-col items-center w-full px-4">
          <motion.div layout className="mb-3 sm:mb-4">
            <span className="font-wa text-sm sm:text-base tracking-[0.4em] sm:tracking-[0.6em] text-slate-700 font-bold ml-[0.4em]">
              {snapshot.timeState.days <= 30 ? '今年も残り' : '今年の残り'}
            </span>
          </motion.div>

          <div className="flex items-center justify-center min-h-30 sm:min-h-36 w-full">
            <motion.div layout className="flex items-baseline shrink-0">
              <span className="font-main text-6xl sm:text-9xl text-slate-950 leading-none tracking-[-0.05em]">
                {timeData.days}
              </span>
              <span className="font-wa text-xl sm:text-3xl text-slate-900 ml-1 sm:ml-2 font-bold italic">
                日
              </span>
            </motion.div>

            <AnimatePresence>
              {isDetailActive && (
                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  className="flex items-center border-l border-slate-300 ml-3 pl-3 sm:ml-8 sm:pl-8 gap-2 sm:gap-6 shrink-0"
                >
                  <TimeSegment value={timeData.hours} label="時間" />
                  <TimeUnitDot />
                  <TimeSegment value={timeData.minutes} label="分" />

                  {isFullMode && (
                    <>
                      <TimeUnitDot />
                      <div className="flex items-baseline gap-1 sm:gap-2 shrink-0">
                        <TimeSegment value={timeData.seconds} label="秒" />
                        <span className="font-fluid text-lg sm:text-3xl text-slate-500 italic self-end pb-0.5 ml-0.5">
                          {timeData.millis}
                        </span>
                      </div>
                    </>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </LayoutGroup>

      <div className="mt-10 sm:mt-16 w-full flex flex-col items-center px-6">
        <span className="font-wa text-lg sm:text-3xl tracking-[0.2em] sm:tracking-[0.4em] text-slate-900 font-bold text-center">
          {dynamicLabel}
        </span>
        <div className="h-10 sm:h-12 mt-4 sm:mt-6 flex items-center justify-center">
          {baseMode !== 'FULL' && (
            <div className="flex items-center gap-4 sm:gap-6">
              <div className="w-1 h-1 rounded-full bg-slate-800" />
              <span className="font-wa text-[10px] sm:text-[12px] tracking-[0.3em] text-slate-800 font-bold uppercase">
                {forcedDetail ? 'RESET' : 'DETAILS'}
              </span>
              <div className="w-1 h-1 rounded-full bg-slate-800" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DisplayCounter;
