import React from 'react';

/**
 * 時間表示コンポーネントのプロパティ
 *
 * - mainText メインの時間表示テキスト
 * - detailText 詳細の時間表示テキスト（オプション）
 * - prefixText メインテキストの前に表示する接頭辞テキスト（オプション）
 * - isDesktop デスクトップ表示かどうか
 * - introPlaying イントロアニメーションが再生中かどうか
 * - introDurationMs イントロアニメーションの継続時間（ミリ秒）
 * - showHint ヒント表示を行うかどうか
 * - onToggle 詳細表示の切り替えハンドラ
 * - canForce 詳細表示の強制切り替えが可能かどうか
 * - forcedDetail 詳細表示が強制的に有効かどうか
 */
interface TimeDisplayProps {
  mainText: string;
  detailText?: string;
  prefixText?: string;
  isDesktop: boolean;
  introPlaying: boolean;
  introDurationMs: number;
  showHint: boolean;
  onToggle: () => void;
  canForce: boolean;
  forcedDetail: boolean;
}

/**
 * 時間表示のメインUIコンポーネント
 */
export const TimeDisplay: React.FC<TimeDisplayProps> = ({
  mainText,
  detailText,
  prefixText,
  isDesktop,
  introPlaying,
  introDurationMs,
  showHint,
  onToggle,
  canForce,
  forcedDetail,
}) => {
  const numberFx = introPlaying
    ? 'opacity-0 blur-[3px] translate-y-1'
    : 'opacity-100 blur-0 translate-y-0';

  const numberTransition = {
    transition: `opacity ${introDurationMs}ms ease-out, transform ${introDurationMs}ms ease-out, filter ${introDurationMs}ms ease-out`,
  };

  const HeaderLine = () => (
    <div className="flex flex-col items-center gap-1.5">
      <div className="text-2xl font-semibold text-gray-900">今年の残り…</div>
      <div className="text-[11px] text-gray-500">Year Remaining Tracker</div>
      {/* 現在日時表示を削除 */}
      <div className="h-px w-16 bg-linear-to-r from-gray-200 to-gray-100" />
    </div>
  );

  const NumberPlaceholder = () => (
    <div className="absolute inset-0 flex flex-col items-center gap-1 pointer-events-none transition-opacity duration-150">
      <span className="flex items-baseline gap-1 font-mono tabular-nums text-[44px] md:text-6xl text-transparent leading-tight whitespace-nowrap">
        {prefixText && (
          <span className="text-transparent text-2xl translate-y-px md:translate-y-0.5">
            {prefixText}
          </span>
        )}
        <span>{mainText}</span>
      </span>
      {detailText && (
        <span className="font-mono tabular-nums text-[28px] md:text-[28px] font-semibold text-transparent whitespace-nowrap">
          {detailText}
        </span>
      )}
    </div>
  );

  // モバイル表示
  if (!isDesktop) {
    return (
      <div className="text-center space-y-4">
        <HeaderLine />
        <div className="relative flex flex-col items-center gap-1">
          {introPlaying && <NumberPlaceholder />}
          <span
            className={`flex items-baseline gap-1 font-mono tabular-nums text-[44px] text-gray-900 leading-tight whitespace-nowrap select-none ${numberFx}`}
            style={numberTransition}
          >
            {prefixText && (
              <span className="text-gray-400 text-2xl translate-y-px">
                {prefixText}
              </span>
            )}
            <span
              role={canForce ? 'button' : undefined}
              aria-pressed={forcedDetail}
              onClick={onToggle}
            >
              {mainText}
            </span>
          </span>
          {detailText && (
            <span
              className={`font-mono tabular-nums text-[28px] font-semibold text-gray-900 whitespace-nowrap select-none ${numberFx}`}
              style={numberTransition}
            >
              {detailText}
            </span>
          )}
        </div>
        {showHint && (
          <div className="text-[11px] text-gray-600">タップで詳細表示</div>
        )}
      </div>
    );
  }

  // デスクトップ表示
  return (
    <div className="text-center space-y-4">
      <HeaderLine />
      <div className="relative flex items-baseline justify-center gap-2 font-mono tabular-nums text-6xl text-gray-900 leading-tight select-none">
        {introPlaying && <NumberPlaceholder />}
        {prefixText && (
          <span className="text-gray-400 text-2xl translate-y-0.5">
            {prefixText}
          </span>
        )}
        <span
          className={`${numberFx}`}
          style={numberTransition}
          role={canForce ? 'button' : undefined}
          aria-pressed={forcedDetail}
          onClick={onToggle}
        >
          {mainText}
        </span>
        {detailText && (
          <span className={`${numberFx}`} style={numberTransition}>
            {detailText}
          </span>
        )}
      </div>
      {showHint && (
        <div className="text-[11px] text-gray-600">
          タップ/クリックで詳細表示
        </div>
      )}
    </div>
  );
};
