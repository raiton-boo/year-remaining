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

  it('1/1 00:00:01.000 JST で進捗が 0 より大きい', () => {
    // 1/1 00:00:01 JST は UTC 前日の 15:00:01
    setNow('2024-12-31T15:00:01.000Z');
    const snap = getTimeSnapshot();
    expect(snap.progressPercent).toBeGreaterThan(0);
  });

  it('うるう年 2024 の総ミリ秒が 366 日分になる', () => {
    setNow('2024-06-01T00:00:00.000Z');
    const snap = getTimeSnapshot();
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

  it('年越し後は進捗が 0 から増え、1年後は次年度として 0 に戻る', () => {
    // 年始直後（2026-01-01 00:00:00 JST）
    setNow('2025-12-31T15:00:00.000Z');
    const start = getTimeSnapshot();
    expect(start.progressPercent).toBe(0);
    expect(start.remainingMs).toBeGreaterThan(0);

    // 1 秒後（進捗が 0 超になる）
    setNow('2025-12-31T15:00:01.000Z');
    const after1s = getTimeSnapshot();
    expect(after1s.progressPercent).toBeGreaterThan(0);
    expect(after1s.remainingMs).toBeGreaterThan(0);

    // 1 年後の年始（2027-01-01 00:00:00 JST相当）で進捗リセット
    setNow('2026-12-31T15:00:00.000Z');
    const nextYear = getTimeSnapshot();
    expect(nextYear.progressPercent).toBe(0);
  });
});
