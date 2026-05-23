export type SlotSymbolId =
  | 'cherry'
  | 'clover'
  | 'bell'
  | 'cash'
  | 'dice'
  | 'ace'
  | 'star'
  | 'diamond'
  | 'crown'
  | 'jackpot';

export const SLOT_SYMBOLS: SlotSymbolId[] = [
  'cherry',
  'clover',
  'bell',
  'cash',
  'dice',
  'ace',
  'star',
  'diamond',
  'crown',
  'jackpot',
];

export const SYMBOL_EMOJI: Record<SlotSymbolId, string> = {
  cherry: '🍒',
  clover: '🍀',
  bell: '🔔',
  cash: '💵',
  dice: '🎲',
  ace: '🦩',
  star: '⭐',
  diamond: '💎',
  crown: '👑',
  jackpot: '🎰',
};

export const SLOT_SYMBOL_WEIGHTS: { symbol: SlotSymbolId; weight: number }[] = [
  { symbol: 'cherry', weight: 4 },
  { symbol: 'clover', weight: 4 },
  { symbol: 'bell', weight: 4 },
  { symbol: 'cash', weight: 4 },
  { symbol: 'dice', weight: 4 },
  { symbol: 'ace', weight: 3 },
  { symbol: 'star', weight: 3 },
  { symbol: 'diamond', weight: 3 },
  { symbol: 'crown', weight: 3 },
  { symbol: 'jackpot', weight: 3 },
];

const WEIGHTED_TOTAL = SLOT_SYMBOL_WEIGHTS.reduce((s, e) => s + e.weight, 0);

export const SYMBOL_LABELS: Record<SlotSymbolId, string> = {
  cherry: 'Cherry',
  clover: 'Clover',
  bell: 'Bell',
  cash: 'Cash',
  dice: 'Dice',
  ace: 'Ace',
  star: 'Star',
  diamond: 'Diamond',
  crown: 'Crown',
  jackpot: '777',
};

/** Rewarding payouts — frequent hits should feel worthwhile */
export const PAYLINE_PAYOUT_MULT: Record<2 | 3 | 4 | 5, number> = {
  2: 0.5,
  3: 1.2,
  4: 4,
  5: 18,
};

/** ~40% forced winning lines; often 3–4 of a kind */
const LUCKY_SPIN_CHANCE = 0.42;
const LUCKY_SECOND_LINE_CHANCE = 0.3;
const SOFT_WIN_CHANCE = 0.22;

export type SlotGrid = [SlotSymbolId, SlotSymbolId, SlotSymbolId, SlotSymbolId, SlotSymbolId][];

export const PAYLINES: ReadonlyArray<ReadonlyArray<[number, number]>> = [
  [
    [0, 0],
    [0, 1],
    [0, 2],
    [0, 3],
    [0, 4],
  ],
  [
    [1, 0],
    [1, 1],
    [1, 2],
    [1, 3],
    [1, 4],
  ],
  [
    [2, 0],
    [2, 1],
    [2, 2],
    [2, 3],
    [2, 4],
  ],
  [
    [0, 0],
    [1, 1],
    [2, 2],
    [1, 3],
    [0, 4],
  ],
  [
    [2, 0],
    [1, 1],
    [0, 2],
    [1, 3],
    [2, 4],
  ],
  [
    [0, 0],
    [0, 1],
    [1, 2],
    [2, 3],
    [2, 4],
  ],
  [
    [2, 0],
    [2, 1],
    [1, 2],
    [0, 3],
    [0, 4],
  ],
  [
    [1, 0],
    [0, 1],
    [0, 2],
    [0, 3],
    [1, 4],
  ],
  [
    [1, 0],
    [2, 1],
    [2, 2],
    [2, 3],
    [1, 4],
  ],
  [
    [0, 0],
    [1, 1],
    [0, 2],
    [1, 3],
    [0, 4],
  ],
  [
    [2, 0],
    [1, 1],
    [2, 2],
    [1, 3],
    [2, 4],
  ],
  [
    [1, 0],
    [1, 1],
    [0, 2],
    [1, 3],
    [1, 4],
  ],
  [
    [1, 0],
    [1, 1],
    [2, 2],
    [1, 3],
    [1, 4],
  ],
  [
    [0, 0],
    [1, 1],
    [1, 2],
    [1, 3],
    [0, 4],
  ],
  [
    [2, 0],
    [1, 1],
    [1, 2],
    [1, 3],
    [2, 4],
  ],
  [
    [0, 0],
    [1, 1],
    [2, 2],
    [2, 3],
    [2, 4],
  ],
  [
    [2, 0],
    [1, 1],
    [0, 2],
    [0, 3],
    [0, 4],
  ],
  [
    [1, 0],
    [0, 1],
    [2, 2],
    [0, 3],
    [1, 4],
  ],
  [
    [1, 0],
    [2, 1],
    [0, 2],
    [2, 3],
    [1, 4],
  ],
  [
    [0, 0],
    [2, 1],
    [0, 2],
    [2, 3],
    [0, 4],
  ],
];

export const PAYLINE_COUNT = PAYLINES.length;

const WIN_SYMBOLS: SlotSymbolId[] = ['cherry', 'clover', 'bell', 'cash', 'dice', 'star'];

export function randomSlotSymbol(): SlotSymbolId {
  let roll = Math.random() * WEIGHTED_TOTAL;
  for (const entry of SLOT_SYMBOL_WEIGHTS) {
    roll -= entry.weight;
    if (roll <= 0) return entry.symbol;
  }
  return SLOT_SYMBOL_WEIGHTS[0].symbol;
}

function randomGrid(): SlotGrid {
  return Array.from({ length: 3 }, () =>
    Array.from({ length: 5 }, () => randomSlotSymbol()),
  ) as SlotGrid;
}

function pickWinSymbol(): SlotSymbolId {
  return WIN_SYMBOLS[Math.floor(Math.random() * WIN_SYMBOLS.length)];
}

function applyForcedLine(grid: SlotGrid, matchLen: 3 | 4 | 5, sym?: SlotSymbolId): SlotGrid {
  const next = grid.map((row) => [...row]) as SlotGrid;
  const line = PAYLINES[Math.floor(Math.random() * PAYLINES.length)];
  const symbol = sym ?? pickWinSymbol();
  for (let i = 0; i < matchLen; i++) {
    const [r, c] = line[i];
    next[r][c] = symbol;
  }
  return next;
}

export function generateSlotGrid(): SlotGrid {
  let grid = randomGrid();

  if (Math.random() < LUCKY_SPIN_CHANCE) {
    const roll = Math.random();
    const matchLen: 3 | 4 | 5 = roll < 0.12 ? 5 : roll < 0.42 ? 4 : 3;
    grid = applyForcedLine(grid, matchLen);
    if (Math.random() < LUCKY_SECOND_LINE_CHANCE) {
      grid = applyForcedLine(grid, Math.random() < 0.55 ? 3 : 4);
    }
  } else if (Math.random() < SOFT_WIN_CHANCE) {
    grid = applyForcedLine(grid, 3);
  }

  return grid;
}

export function countPaylineMatch(symbols: SlotSymbolId[]): number {
  const first = symbols[0];
  let count = 1;
  for (let i = 1; i < symbols.length; i++) {
    if (symbols[i] === first) count++;
    else break;
  }
  return count;
}

export function paylinePayoutMultiplier(count: number): number {
  if (count >= 5) return PAYLINE_PAYOUT_MULT[5];
  if (count >= 4) return PAYLINE_PAYOUT_MULT[4];
  if (count >= 3) return PAYLINE_PAYOUT_MULT[3];
  if (count >= 2) return PAYLINE_PAYOUT_MULT[2];
  return 0;
}

export function SlotSymbolCell({
  symbol,
  inferno = false,
}: {
  symbol: SlotSymbolId;
  inferno?: boolean;
}) {
  return (
    <div className="w-full h-full flex items-center justify-center p-0 m-0 bg-transparent">
      <span
        className={`block leading-none select-none text-[clamp(2.25rem,13vw,4rem)] ${
          inferno ? 'scale-110' : ''
        }`}
        aria-hidden
      >
        {SYMBOL_EMOJI[symbol]}
      </span>
    </div>
  );
}

export function isSlotSymbolId(value: string): value is SlotSymbolId {
  return (SLOT_SYMBOLS as readonly string[]).includes(value);
}
