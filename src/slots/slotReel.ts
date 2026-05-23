import { randomSlotSymbol, type SlotSymbolId } from '../SlotSymbols';

export const SLOT_ROWS = 3;
export const SLOT_COLS = 5;

export interface ColumnAnim {
  strip: SlotSymbolId[];
  targetOffset: number;
  duration: number;
  cellHeight: number;
  finals: [SlotSymbolId, SlotSymbolId, SlotSymbolId];
  landed: boolean;
}

export const REEL_STOP_DURATIONS = [0.95, 1.1, 1.25, 1.4, 1.55] as const;
export const REEL_EASING = 'cubic-bezier(0.2, 0.9, 0.25, 1)';

export function buildColumnStrip(
  finals: [SlotSymbolId, SlotSymbolId, SlotSymbolId],
  loops: number,
  cellHeight: number,
): ColumnAnim {
  const strip: SlotSymbolId[] = [];
  for (let loop = 0; loop < loops; loop++) {
    for (let i = 0; i < SLOT_ROWS; i++) strip.push(randomSlotSymbol());
  }
  strip.push(...finals);
  const landIndex = strip.length - SLOT_ROWS;
  return {
    strip,
    targetOffset: -landIndex * cellHeight,
    duration: 0,
    cellHeight,
    finals,
    landed: false,
  };
}

export function idleColumnStrip(
  finals: [SlotSymbolId, SlotSymbolId, SlotSymbolId],
  cellHeight: number,
): ColumnAnim {
  return {
    strip: [...finals],
    targetOffset: 0,
    duration: 0,
    cellHeight,
    finals,
    landed: true,
  };
}
