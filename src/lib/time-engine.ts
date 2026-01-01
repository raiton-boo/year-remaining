import { toZonedTime } from 'date-fns-tz';
import type { TimeState } from './types';

const JST_TIMEZONE = 'Asia/Tokyo';
const MS_PER_DAY = 86_400_000;

const truncate6 = (value: number): number =>
  Math.floor(value * 1_000_000) / 1_000_000;

// JST の 00:00:00.000 を UTC ミリ秒で求める（UTC+9 を -9h して計算）
const jstMidnightUtcMs = (year: number): number =>
  Date.UTC(year, 0, 1, -9, 0, 0, 0);

export interface TimeSnapshot {
  nowJst: Date;
  startOfYearJst: Date;
  endOfYearJst: Date;
  remainingMs: number;
  elapsedMs: number;
  totalMs: number;
  progressPercent: number; // 0–100, 小数6桁「切り捨て」
  timeState: TimeState;
}

export const getTimeSnapshot = (): TimeSnapshot => {
  const now = new Date();
  const nowJst = toZonedTime(now, JST_TIMEZONE);

  const currentYear = nowJst.getFullYear();
  const nextYear = currentYear + 1;

  const startMs = jstMidnightUtcMs(currentYear);
  const endMs = jstMidnightUtcMs(nextYear);

  const totalMs = endMs - startMs;
  const nowMs = now.getTime();
  const elapsedMs = Math.min(Math.max(nowMs - startMs, 0), totalMs);
  const remainingMs = Math.max(endMs - nowMs, 0);

  const ratio = totalMs === 0 ? 0 : elapsedMs / totalMs;
  const progressPercent = truncate6(Math.min(Math.max(ratio * 100, 0), 100));

  const days = Math.max(0, Math.floor(remainingMs / MS_PER_DAY));
  const isNewYear = remainingMs === 0;

  return {
    nowJst,
    startOfYearJst: toZonedTime(new Date(startMs), JST_TIMEZONE),
    endOfYearJst: toZonedTime(new Date(endMs), JST_TIMEZONE),
    remainingMs,
    elapsedMs,
    totalMs,
    progressPercent,
    timeState: { days, isNewYear },
  };
};
