import { describe, expect, it, vi, afterEach, beforeEach } from 'vitest';
import { getTimeSnapshot } from './time-engine';

const realTz = process.env.TZ;
const jstMidnightUtcMs = (year: number) => Date.UTC(year, 0, 1, -9, 0, 0, 0);

beforeEach(() => {
  process.env.TZ = 'UTC';
  vi.useFakeTimers();
});

afterEach(() => {
  process.env.TZ = realTz;
  vi.useRealTimers();
});

describe('getTimeSnapshot', () => {
  it('JSTの日付を返し、トータル日数がうるう年(366日)になる', () => {
    vi.setSystemTime(new Date('2024-03-15T12:00:00Z')); // JST 21:00
    const snap = getTimeSnapshot();
    expect(snap.nowJst.getHours()).toBe(21);
    const days = snap.totalMs / 86_400_000;
    expect(days).toBe(366);
  });

  it('進捗率は小数6桁で切り捨てられる', () => {
    vi.setSystemTime(new Date('2024-01-01T00:00:00Z'));
    const base = getTimeSnapshot();
    const startMs = jstMidnightUtcMs(base.nowJst.getFullYear());
    const targetMs = base.totalMs * 0.123456789;
    vi.setSystemTime(new Date(startMs + targetMs));
    const snap = getTimeSnapshot();
    expect(snap.progressPercent).toBeCloseTo(12.345678, 6);
  });

  it('年越し直後は残り0になり isNewYear が立つ', () => {
    // 2025-01-01T00:00:00+09:00 (JST) は 2024-12-31T15:00:00Z
    vi.setSystemTime(new Date('2024-12-31T15:00:00Z'));
    const snap = getTimeSnapshot();
    expect(snap.remainingMs).toBe(0);
    expect(snap.timeState.isNewYear).toBe(true);
  });

  it('残り日数は切り捨てで日単位に計算される', () => {
    vi.setSystemTime(new Date('2024-12-30T03:00:00Z')); // JST 12/30 12:00
    const snap = getTimeSnapshot();
    expect(snap.timeState.days).toBe(1); // 約1.5日 → floorで1
  });
});
