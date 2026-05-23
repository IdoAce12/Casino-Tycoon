import type { SlotSymbolId } from './SlotSymbols';

/** Lightweight Tailwind tile backgrounds — GPU-friendly gradients only */
export const SYMBOL_CELL_CLASS: Record<SlotSymbolId, string> = {
  cherry: 'bg-gradient-to-br from-rose-500 to-red-900',
  clover: 'bg-gradient-to-br from-lime-400 to-green-800',
  bell: 'bg-gradient-to-br from-yellow-300 to-amber-800',
  cash: 'bg-gradient-to-br from-emerald-400 to-green-900',
  dice: 'bg-gradient-to-br from-zinc-200 to-zinc-800',
  ace: 'bg-gradient-to-br from-indigo-300 to-indigo-900',
  star: 'bg-gradient-to-br from-amber-300 to-orange-700',
  diamond: 'bg-gradient-to-br from-cyan-400 to-blue-900',
  crown: 'bg-gradient-to-br from-yellow-200 to-amber-700',
  jackpot: 'bg-gradient-to-br from-red-400 to-red-950',
};
