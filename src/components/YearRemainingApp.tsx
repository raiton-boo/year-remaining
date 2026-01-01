import { TimeProvider } from '@/hooks/useTimeContext';
import DisplayCounter from './DisplayCounter';
import DisplayProgress from './DisplayProgress';

const YearRemainingApp = () => {
  return (
    <TimeProvider>
      <div className="flex flex-col items-center gap-10">
        <DisplayCounter />
        <DisplayProgress />
      </div>
    </TimeProvider>
  );
};

export default YearRemainingApp;
