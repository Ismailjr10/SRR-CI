export type ConnectionStatus = 'CONNECTED' | 'DISCONNECTED' | 'ERROR';

export type Mode = 'MANUAL' | 'AUTO';

export interface FingerPositions {
  thumb: number;
  index: number;
  middle: number;
  ring: number;
  pinky: number;
}

export interface LogEntry {
  id: string;
  timestamp: string;
  level: 'INFO' | 'WARN' | 'ERROR' | 'SUCCESS';
  message: string;
}

export type MacroType = 'UNSCREW_PENTALOBE' | 'LIFT_BATTERY' | 'HOME_POSITION';