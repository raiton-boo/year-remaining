import React from 'react';

interface Props {
  year: number;
  days: number;
}

export const ElapsedHeader: React.FC<Props> = ({ year, days }) => (
  <div className="flex flex-col items-center gap-1 mb-8 sm:mb-12">
    <div className="w-16 sm:w-24 h-px bg-slate-400 opacity-60" />
    <div className="flex items-center gap-2 sm:gap-3 py-1">
      <span className="font-wa text-[10px] sm:text-[11px] tracking-[0.2em] font-bold text-slate-600">
        {year}年
      </span>
      <span className="text-slate-900 font-main text-xl sm:text-2xl leading-none">
        {days}
      </span>
      <span className="font-wa text-[10px] sm:text-[11px] font-bold text-slate-600">
        日経過
      </span>
    </div>
    <div className="w-16 sm:w-24 h-px bg-slate-400 opacity-60" />
  </div>
);
