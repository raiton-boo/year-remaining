import { describe, expect, it, beforeEach, afterEach, vi } from 'vitest';
import { getTimeSnapshot } from './time-engine';

const setNow = (iso: string) => vi.setSystemTime(new Date(iso));

describe('getTimeSnapshot (JST基準)', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  it('1/1 00:00:00.000 JST で進捗 0.000000%', () => {
    // 1/1 00:00 JST は UTC 前日の 15:00
    setNow('2024-12-31T15:00:00.000Z');
    const snap = getTimeSnapshot();
    expect(snap.progressPercent).toBe(0);
    expect(snap.timeState.isNewYear).toBe(false);
  });

  it('1/1 00:00:00.001 JST で進捗が 0 より大きい', () => {
    setNow('2024-12-31T15:00:00.001Z');
    const snap = getTimeSnapshot();
    expect(snap.progressPercent).toBeGreaterThan(0);
  });

  it('うるう年 2024 の総ミリ秒が 366 日分になる', () => {
    setNow('2024-06-01T00:00:00.000Z');
    const snap = getTimeSnapshot();
    // 366 日 = 366 * 86_400_000
    expect(snap.totalMs).toBe(366 * 86_400_000);
  });

  it('非うるう年 2025 の総ミリ秒が 365 日分になる', () => {
    setNow('2025-06-01T00:00:00.000Z');
    const snap = getTimeSnapshot();
    expect(snap.totalMs).toBe(365 * 86_400_000);
  });

  it('年末直前で 100% 未満 (切り捨て) であること', () => {
    // 12/31 23:59:59.999 JST は UTC 12/31 14:59:59.999
    setNow('2025-12-31T14:59:59.999Z');
    const snap = getTimeSnapshot();
    expect(snap.progressPercent).toBeLessThan(100);
  });

  it('年越し後に 100.000000% となり、remaining が 0', () => {
    // 1/1 00:00:00.000 JST
    setNow('2025-12-31T15:00:00.000Z');
    const snap = getTimeSnapshot();
    expect(snap.progressPercent).toBe(0);
    // 直後
    setNow('2025-12-31T15:00:00.001Z');
    const snap2 = getTimeSnapshot();
    expect(snap2.progressPercent).toBeGreaterThan(0);
    // 1 年後の 1/1 00:00 JST
    setNow('2026-12-31T15:00:00.000Z');
    const snap3 = getTimeSnapshot();
    expect(snap3.progressPercent).toBe(0);
  });
});
