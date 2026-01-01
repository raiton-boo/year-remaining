import { TimeProvider } from '@/hooks/useTimeContext';
import { useTitleSync } from '@/hooks/useTitleSync';
import DisplayCounter from './DisplayCounter';
import DisplayProgress from './DisplayProgress';

const TitleSync = () => {
  useTitleSync();
  return null;
};

const Content = () => (
  <div className="flex flex-col items-center gap-10">
    <DisplayCounter />
    <DisplayProgress />
  </div>
);

const YearRemainingApp = () => (
  <TimeProvider>
    <TitleSync />
    <Content />
  </TimeProvider>
);

export default YearRemainingApp;
