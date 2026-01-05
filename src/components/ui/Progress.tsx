import React from 'react';
import { motion } from 'motion/react';

/**
 * プログレスバーコンポーネントのプロパティ
 *
 * - percentage 進捗率 (0〜100)
 * - introPlaying イントロアニメーションが再生中かどうか
 * - introDurationMs イントロアニメーションの継続時間（ミリ秒）
 */
interface ProgressBarProps {
  percentage: number;
  introPlaying?: boolean;
  introDurationMs?: number;
}

/**
 * 進捗率を表示するプログレスバーコンポーネント
 *
 * @param props ProgressBarProps
 * @returns React.FC
 */
export const ProgressBar: React.FC<ProgressBarProps> = ({
  percentage,
  introPlaying = false,
  introDurationMs = 1000,
}) => {
  return (
    <div className="flex flex-col gap-3 items-center text-center w-full">
      <div className="text-sm text-gray-500">進捗</div>

      <div className="flex flex-col gap-2 w-full max-w-3xl">
        <div className="flex items-center gap-3">
          <span className="hidden sm:flex h-8 w-8 items-center justify-center rounded-full bg-white text-sm shadow-sm ring-1 ring-[#d9deeb]">
            ⏱️
          </span>
          <div className="relative h-4 flex-1 overflow-hidden rounded-full bg-[#dde3f0]">
            <motion.div
              className="h-full"
              initial={{ width: introPlaying ? '0%' : `${percentage}%` }}
              animate={{ width: `${percentage}%` }}
              transition={{
                duration: introPlaying ? introDurationMs / 1000 : 0.16,
                ease: 'easeOut',
              }}
              style={{
                minWidth: percentage > 0 ? '4px' : '0px',
                background: 'linear-gradient(90deg, #2563eb, #7c3aed)',
              }}
            />
          </div>
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white text-sm shadow-sm ring-1 ring-[#d9deeb]">
            🏁
          </span>
        </div>

        <div className="flex items-center justify-between text-xs text-gray-500">
          <span>0%</span>
          <span className="font-mono tabular-nums text-lg text-gray-900">
            {percentage.toFixed(6)}%
          </span>
        </div>
      </div>
    </div>
  );
};
