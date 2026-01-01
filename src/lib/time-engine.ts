import { toZonedTime } from 'date-fns-tz';
import type { TimeState } from './types';

const JST_TIMEZONE = 'Asia/Tokyo';
const MS_PER_DAY = 86_400_000;

const truncate6 = (value: number): number =>
  Math.floor(value * 1_000_000) / 1_000_000;

// 汎用の「切り捨て toFixed」
export const floorFixed = (value: number, digits: number) =>
  (Math.floor(value * 10 ** digits) / 10 ** digits).toFixed(digits);

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
  const nowMs = now.getTime();

  // 年越し直後（JST 00:00:00.000）は前年度の完走として扱う
  if (nowMs === startMs) {
    const prevYear = currentYear - 1;
    const prevStart = jstMidnightUtcMs(prevYear);
    const prevEnd = startMs;
    const totalMsPrev = prevEnd - prevStart;
    return {
      nowJst,
      startOfYearJst: toZonedTime(new Date(prevStart), JST_TIMEZONE),
      endOfYearJst: toZonedTime(new Date(prevEnd), JST_TIMEZONE),
      remainingMs: 0,
      elapsedMs: totalMsPrev,
      totalMs: totalMsPrev,
      progressPercent: 100,
      timeState: { days: 0, isNewYear: true },
    };
  }

  const totalMs = endMs - startMs;
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

type Listener = (snap: TimeSnapshot) => void;

export class TimeEngine {
  private rafId: number | null = null;
  private intervalId: ReturnType<typeof setInterval> | null = null;
  private listeners = new Set<Listener>();
  private lastSnap: TimeSnapshot = getTimeSnapshot();

  start() {
    // SSRでは起動させない
    if (typeof window === 'undefined') return;

    const tick = () => {
      this.lastSnap = getTimeSnapshot();
      this.listeners.forEach((fn) => fn(this.lastSnap));
      this.rafId = window.requestAnimationFrame(tick);
    };

    if (!this.rafId) this.rafId = window.requestAnimationFrame(tick);
  }

  startInterval(fps = 60) {
    if (this.intervalId) return;
    const interval = Math.max(1, Math.floor(1000 / fps));
    this.intervalId = setInterval(() => {
      this.lastSnap = getTimeSnapshot();
      this.listeners.forEach((fn) => fn(this.lastSnap));
    }, interval);
  }

  stop() {
    if (typeof window !== 'undefined' && this.rafId) {
      window.cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  subscribe(fn: Listener) {
    this.listeners.add(fn);
    fn(this.lastSnap);
    return () => this.listeners.delete(fn);
  }

  getSnapshot() {
    return this.lastSnap;
  }
}

export const timeEngine = new TimeEngine();
