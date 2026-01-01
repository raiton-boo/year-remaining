import { TimeProvider } from '@/hooks/useTimeContext';
import { useTitleSync } from '@/hooks/useTitleSync';
import DisplayCounter from './DisplayCounter';
import DisplayProgress from './DisplayProgress';

const TitleSync = () => {
  useTitleSync();
  return null;
};

const YearRemainingApp = () => {
  return (
    <TimeProvider>
      <TitleSync />
      <div className="flex flex-col items-center gap-10">
        <DisplayCounter />
        <DisplayProgress />
      </div>
    </TimeProvider>
  );
};

export default YearRemainingApp;
