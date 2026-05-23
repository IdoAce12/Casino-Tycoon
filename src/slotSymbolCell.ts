import type { SlotSymbolId } from './SlotSymbols';

/** Vegas Spectrum — always-on cell backgrounds per symbol type */
export const SYMBOL_CELL_CLASS: Record<SlotSymbolId, string> = {
  diamond: 'slot-cell-vegas slot-cell-diamond',
  crown: 'slot-cell-vegas slot-cell-crown',
  cash: 'slot-cell-vegas slot-cell-cash',
  jackpot: 'slot-cell-vegas slot-cell-jackpot',
  dice: 'slot-cell-vegas slot-cell-dice',
  bell: 'slot-cell-vegas slot-cell-bell',
  star: 'slot-cell-vegas slot-cell-star',
  clover: 'slot-cell-vegas slot-cell-clover',
  cherry: 'slot-cell-vegas slot-cell-cherry',
  ace: 'slot-cell-vegas slot-cell-ace',
};
