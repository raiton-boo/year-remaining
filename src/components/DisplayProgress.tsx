import { useTimeContext } from '@/hooks/useTimeContext';

const clamp = (v: number, min = 0, max = 100) =>
  Math.min(Math.max(v, min), max);

const DisplayProgress = () => {
  const { snapshot } = useTimeContext();
  const percent = clamp(snapshot.progressPercent);

  return (
    <div className="flex flex-col gap-2">
      <div className="text-sm text-gray-500">進捗</div>
      <div className="flex items-center gap-3">
        <div className="relative h-3 w-full overflow-hidden rounded-full bg-gray-200">
          <div
            className="h-full bg-black transition-[width] duration-150 ease-linear"
            style={{ width: `${percent}%` }}
          />
        </div>
        <div className="font-mono tabular-nums text-xl text-gray-900">
          {percent.toFixed(6)}%
        </div>
      </div>
    </div>
  );
};

export default DisplayProgress;
