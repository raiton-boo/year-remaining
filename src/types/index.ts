export type DisplayMode = 'DAYS' | 'DAYS_HOURS' | 'DAYS_MINUTES' | 'FULL'; // 表示モードの種類

/**
 * 時間状態オブジェクト
 *
 * - days 今年の経過日数
 * - isNewYear 年越し判定フラグ
 */
export interface TimeState {
  days: number;
  isNewYear: boolean;
}

/**
 * 時間表示コンポーネントのプロパティ
 *
 * - -nowJst 現在の日本標準時(Dateオブジェクト)
 * - remainingMs 今年の残り時間（ミリ秒）
 * - elapsedMs 今年の経過時間（ミリ秒）
 * - totalMs 今年の総時間（ミリ秒）
 * - progressPercent 今年の経過割合（パーセンテージ）
 * - timeState 時間状態オブジェクト
 */
export interface TimeSnapshot {
  nowJst: Date;
  remainingMs: number;
  elapsedMs: number;
  totalMs: number;
  progressPercent: number;
  timeState: TimeState;
}

/**
 * 時間データオブジェクト
 *
 * - days 残り日数
 * - hours 残り時間（2桁文字列）
 * - minutes 残り分（2桁文字列）
 * - seconds 残り秒（2桁文字列）
 * - millis 残りミリ秒（2桁文字列）
 */
export interface TimeData {
  days: number;
  hours: string;
  minutes: string;
  seconds: string;
  millis: string;
}
