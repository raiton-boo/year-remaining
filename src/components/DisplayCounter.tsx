import React, { useEffect, useMemo, useState } from 'react';
import { useTimeContext } from '@/hooks/useTimeContext';
import type { DisplayMode } from '@/lib/types';

const getDisplayMode = (now: Date): DisplayMode => {
  const m = now.getMonth() + 1;
  const d = now.getDate();
  if (m === 12 && d >= 20) return 'FULL';
  if (m === 12) return 'DAYS_MINUTES';
  if (m === 11 && d >= 1) return 'DAYS_HOURS';
  return 'DAYS';
};

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

const formatCurrent = (now: Date) => {
  const pad = (n: number) => n.toString().padStart(2, '0');
  return `${now.getFullYear()}/${pad(now.getMonth() + 1)}/${pad(
    now.getDate()
  )} ${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;
};

// うるう年対応: 年始と翌年始の差分から算出
const getDayInfo = (now: Date) => {
  const start = new Date(now.getFullYear(), 0, 1);
  const end = new Date(now.getFullYear() + 1, 0, 1);
  const dayOfYear = Math.floor((+now - +start) / 86_400_000) + 1;
  const totalDays = Math.floor((+end - +start) / 86_400_000); // 365 or 366
  // 経過日は当日を含む、残りは当日を除く
  const elapsedDays = dayOfYear;
  const remainingDays = totalDays - dayOfYear;
  return { totalDays, elapsedDays, remainingDays };
};

const DisplayCounter = () => {
  const { snapshot, introPlaying, introDurationMs } = useTimeContext();
  const [forcedDetail, setForcedDetail] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);
  const [hydrated, setHydrated] = useState(false);

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

  const handleToggle: React.PointerEventHandler<HTMLSpanElement> = (e) => {
    if (
      canForce &&
      (e.pointerType === 'touch' || e.pointerType === 'mouse') &&
      e.button === 0
    ) {
      if (e.pointerType === 'touch') e.preventDefault();
      setForcedDetail((prev) => !prev);
    }
  };

  const mobileFormatted = formatMobile(snapshot.remainingMs, displayMode);
  const desktopFormatted = formatDesktop(snapshot.remainingMs, displayMode);
  const showHint = hydrated && canForce && !forcedDetail;
  const showPrefix = hydrated && displayMode !== 'FULL' && baseMode === 'DAYS';
  const safeCurrent = hydrated ? currentLabel : '----/--/-- --:--:--';

  const numberFx = introPlaying
    ? 'opacity-0 blur-[3px] translate-y-1'
    : 'opacity-100 blur-0 translate-y-0';
  const numberTransition = {
    transition: `opacity ${introDurationMs}ms ease-out, transform ${introDurationMs}ms ease-out, filter ${introDurationMs}ms ease-out`,
  };

  const NumberPlaceholder = ({
    main,
    detail,
  }: {
    main: string;
    detail?: string;
  }) => (
    <div className="absolute inset-0 flex flex-col items-center gap-1 pointer-events-none transition-opacity duration-150">
      <span className="flex items-baseline gap-1 font-mono tabular-nums text-[44px] md:text-6xl text-transparent leading-tight whitespace-nowrap">
        {showPrefix && (
          <span className="text-transparent text-2xl translate-y-px md:translate-y-0.5">
            {info.elapsedDays}/
          </span>
        )}
        <span>{main}</span>
      </span>
      {detail && (
        <span className="font-mono tabular-nums text-[28px] md:text-[28px] font-semibold text-transparent whitespace-nowrap">
          {detail}
        </span>
      )}
    </div>
  );

  const HeaderLine = ({ label }: { label: string }) => (
    <div className="flex flex-col items-center gap-1.5">
      <div className="text-2xl font-semibold text-gray-900">今年の残り…</div>
      <div className="text-[11px] text-gray-500">Year Remaining Tracker</div>
      <div className="flex items-center gap-2 text-[11px] font-mono text-gray-800">
        <span className="rounded-full border border-gray-300 bg-white px-2 py-1">
          現在日時 {label}
        </span>
      </div>
      <div className="h-px w-16 bg-linear-to-r from-gray-200 to-gray-100" />
    </div>
  );

  // SSR/初回はプレースホルダで描画してミスマッチを防ぐ
  if (!hydrated) {
    return (
      <div className="text-center space-y-4 select-none">
        <HeaderLine label={safeCurrent} />
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

  // モバイル
  if (!isDesktop) {
    return (
      <div className="text-center space-y-4">
        <HeaderLine label={safeCurrent} />

        <div className="relative flex flex-col items-center gap-1">
          {introPlaying && (
            <NumberPlaceholder
              main={mobileFormatted.main}
              detail={mobileFormatted.detail}
            />
          )}
          <span
            className={`flex items-baseline gap-1 font-mono tabular-nums text-[44px] text-gray-900 leading-tight whitespace-nowrap select-none ${numberFx}`}
            style={numberTransition}
          >
            {showPrefix && (
              <span className="text-gray-400 text-2xl translate-y-px">
                {info.elapsedDays}/
              </span>
            )}
            <span
              role={canForce ? 'button' : undefined}
              aria-pressed={forcedDetail}
              onPointerDown={handleToggle}
            >
              {mobileFormatted.main}
            </span>
          </span>
          {mobileFormatted.detail && (
            <span
              className={`font-mono tabular-nums text-[28px] font-semibold text-gray-900 whitespace-nowrap select-none ${numberFx}`}
              style={numberTransition}
            >
              {mobileFormatted.detail}
            </span>
          )}
        </div>

        {showHint && (
          <div className="text-[11px] text-gray-600">タップで詳細表示</div>
        )}
      </div>
    );
  }

  // デスクトップ
  return (
    <div className="text-center space-y-4">
      <HeaderLine label={safeCurrent} />

      <div className="relative flex items-baseline justify-center gap-2 font-mono tabular-nums text-6xl text-gray-900 leading-tight select-none">
        {introPlaying && (
          <NumberPlaceholder main={desktopFormatted} detail={undefined} />
        )}
        {showPrefix && (
          <span className="text-gray-400 text-2xl translate-y-0.5">
            {info.elapsedDays}/
          </span>
        )}
        <span
          className={`${numberFx}`}
          style={numberTransition}
          role={canForce ? 'button' : undefined}
          aria-pressed={forcedDetail}
          onPointerDown={handleToggle}
        >
          {desktopFormatted}
        </span>
      </div>

      {showHint && (
        <div className="text-[11px] text-gray-600">
          タップ/クリックで詳細表示
        </div>
      )}
    </div>
  );
};

export default DisplayCounter;
