export type DisplayMode = 'DAYS' | 'DAYS_HOURS' | 'DAYS_MINUTES' | 'FULL';

export interface TimeState {
  days: number;
  isNewYear: boolean; // 年越し判定フラグ
}
