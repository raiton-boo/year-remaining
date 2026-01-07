import React from 'react';

export const TimeSegment: React.FC<{ value: string; label: string }> = ({
  value,
  label,
}) => (
  <div className="flex flex-col items-center shrink-0">
    <span className="font-main text-2xl sm:text-5xl text-slate-900 leading-none">
      {value}
    </span>
    <span className="font-wa text-[9px] sm:text-[11px] text-slate-600 font-bold tracking-tighter mt-1">
      {label}
    </span>
  </div>
);

export const TimeUnitDot = () => (
  <div className="w-0.5 h-0.5 sm:w-1 sm:h-1 rounded-full bg-slate-300 mb-3 sm:mb-4 shrink-0" />
);
