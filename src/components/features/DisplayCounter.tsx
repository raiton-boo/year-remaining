import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useTimeContext } from '@/hooks/useTimeContext';
import type { DisplayMode } from '@/types';
import { TimeDisplay } from '../ui/TimeSegment';

// 表示モードの決定
const getDisplayMode = (now: Date): DisplayMode => {
  const m = now.getMonth() + 1;
  const d = now.getDate();
  if (m === 12 && d >= 20) return 'FULL';
  if (m === 12) return 'DAYS_MINUTES';
  if (m === 11 && d >= 1) return 'DAYS_HOURS';
  return 'DAYS';
};

// フォーマット関数
const formatMobile = (ms: number, mode: DisplayMode) => {
  const totalSeconds = Math.floor(ms / 1000);
  const days = Math.floor(totalSeconds / 86_400);
  const hours = Math.floor((totalSeconds % 86_400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  const millis = ms % 1000;

  if (mode === 'DAYS') return { main: `${days}日` };
  if (mode === 'DAYS_HOURS') return { main: `${days}日 ${hours}時間` };
  if (mode === 'DAYS_MINUTES')
    return { main: `${days}日 ${hours}時間 ${minutes}分` };

  const secondsWithMs = (seconds + millis / 1000).toFixed(3);
  return {
    main: `${days}日 ${hours}時間`,
    detail: `${minutes}分 ${secondsWithMs}秒`,
  };
};

// フォーマット関数
const formatDesktop = (ms: number, mode: DisplayMode) => {
  const totalSeconds = Math.floor(ms / 1000);
  const days = Math.floor(totalSeconds / 86_400);
  const hours = Math.floor((totalSeconds % 86_400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  const millis = ms % 1000;

  if (mode === 'DAYS') return `${days}日`;
  if (mode === 'DAYS_HOURS') return `${days}日 ${hours}時間`;
  if (mode === 'DAYS_MINUTES') return `${days}日 ${hours}時間 ${minutes}分`;
  const secondsWithMs = (seconds + millis / 1000).toFixed(3);
  return `${days}日 ${hours}時間 ${minutes}分 ${secondsWithMs}秒`;
};

// 現在日時フォーマット
const formatCurrent = (now: Date) => {
  const pad = (n: number) => n.toString().padStart(2, '0');
  return `${now.getFullYear()}/${pad(now.getMonth() + 1)}/${pad(
    now.getDate()
  )} ${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;
};

// 年間日数情報取得
const getDayInfo = (now: Date) => {
  const start = new Date(now.getFullYear(), 0, 1);
  const end = new Date(now.getFullYear() + 1, 0, 1);
  const dayOfYear = Math.floor((+now - +start) / 86_400_000) + 1;
  const totalDays = Math.floor((+end - +start) / 86_400_000);
  const elapsedDays = dayOfYear;
  const remainingDays = totalDays - dayOfYear;
  return { totalDays, elapsedDays, remainingDays };
};

// メインコンポーネント
const DisplayCounter = () => {
  const { snapshot, introPlaying, introDurationMs } = useTimeContext();
  const [forcedDetail, setForcedDetail] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);
  const [hydrated, setHydrated] = useState(false);
  const pointerHandledRef = useRef(false);

  useEffect(() => setHydrated(true), []);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const mq = window.matchMedia('(min-width: 768px)');
    const update = () => setIsDesktop(mq.matches);
    update();
    mq.addEventListener('change', update);
    return () => mq.removeEventListener('change', update);
  }, []);

  const baseMode = useMemo(
    () => getDisplayMode(snapshot.nowJst),
    [snapshot.nowJst]
  );
  const info = useMemo(() => getDayInfo(snapshot.nowJst), [snapshot.nowJst]);
  const currentLabel = useMemo(
    () => formatCurrent(snapshot.nowJst),
    [snapshot.nowJst]
  );

  const canForce = baseMode !== 'FULL';

  useEffect(() => {
    if (!canForce && forcedDetail) setForcedDetail(false);
  }, [canForce, forcedDetail]);

  const displayMode = forcedDetail && canForce ? 'FULL' : baseMode;

  const toggleDetail = () => {
    if (!canForce) return;
    setForcedDetail((prev) => !prev);
  };

  const handlePointerDown: React.PointerEventHandler<HTMLSpanElement> = (e) => {
    if (e.pointerType === 'mouse' && e.button !== 0) return;
    if (e.pointerType === 'touch') e.preventDefault();
    pointerHandledRef.current = true;
    toggleDetail();
  };

  const handleClick: React.MouseEventHandler<HTMLSpanElement> = () => {
    if (pointerHandledRef.current) {
      pointerHandledRef.current = false;
      return;
    }
    toggleDetail();
  };

  // 表示データの準備
  const mobileFormatted = formatMobile(snapshot.remainingMs, displayMode);
  const desktopFormatted = formatDesktop(snapshot.remainingMs, displayMode);
  const showHint = hydrated && canForce && !forcedDetail;
  const showPrefix = hydrated && displayMode !== 'FULL' && baseMode === 'DAYS';
  const safeCurrent = hydrated ? currentLabel : '----/--/-- --:--:--';
  const prefixText = showPrefix ? `${info.elapsedDays}/` : undefined;

  // SSR/初回ロード時のプレースホルダ
  if (!hydrated) {
    return (
      <div className="text-center space-y-4 select-none">
        <div className="flex flex-col items-center gap-1.5">
          <div className="text-2xl font-semibold text-gray-900">
            今年の残り…
          </div>
          <div className="text-[11px] text-gray-500">
            Year Remaining Tracker
          </div>
          <div className="flex items-center gap-2 text-[11px] font-mono text-gray-800">
            <span className="rounded-full border border-gray-300 bg-white px-2 py-1">
              現在日時 {safeCurrent}
            </span>
          </div>
          <div className="h-px w-16 bg-linear-to-r from-gray-200 to-gray-100" />
        </div>
        <div className="flex flex-col items-center gap-1">
          <span className="font-mono tabular-nums text-[44px] text-gray-300 leading-tight">
            --日
          </span>
          <span className="font-mono tabular-nums text-[28px] text-gray-200">
            --分 --
          </span>
        </div>
      </div>
    );
  }

  return (
    <div onPointerDown={handlePointerDown} onClick={handleClick}>
      <TimeDisplay
        label={safeCurrent}
        mainText={isDesktop ? desktopFormatted : mobileFormatted.main}
        detailText={isDesktop ? undefined : mobileFormatted.detail}
        prefixText={prefixText}
        isDesktop={isDesktop}
        introPlaying={introPlaying}
        introDurationMs={introDurationMs}
        showHint={showHint}
        onToggle={() => {}} // 親divでハンドリングするため空関数
        canForce={canForce}
        forcedDetail={forcedDetail}
      />
    </div>
  );
};

export default DisplayCounter;
