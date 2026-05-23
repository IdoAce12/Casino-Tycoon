import { useId, type ReactElement } from 'react';
import { SYMBOL_CELL_CLASS } from './slotSymbolCell';

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

/** Rarer symbols weighted lower — base hit rate ~18–28% before near-miss tension */
export const SLOT_SYMBOL_WEIGHTS: { symbol: SlotSymbolId; weight: number }[] = [
  { symbol: 'cherry', weight: 3 },
  { symbol: 'clover', weight: 3 },
  { symbol: 'bell', weight: 3 },
  { symbol: 'cash', weight: 2 },
  { symbol: 'dice', weight: 2 },
  { symbol: 'ace', weight: 2 },
  { symbol: 'star', weight: 1 },
  { symbol: 'diamond', weight: 1 },
  { symbol: 'crown', weight: 1 },
  { symbol: 'jackpot', weight: 1 },
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

export const PAYLINE_PAYOUT_MULT: Record<2 | 3 | 4 | 5, number> = {
  2: 0.15,
  3: 0.4,
  4: 2,
  5: 12,
};

const LUCKY_SPIN_CHANCE = 0.07;
const NEAR_MISS_CHANCE = 0.38;

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

/** Tease: 3–4 matching symbols then break on the payline hook */
function applyNearMiss(grid: SlotGrid): SlotGrid {
  const next = grid.map((row) => [...row]) as SlotGrid;
  const line = PAYLINES[Math.floor(Math.random() * PAYLINES.length)];
  const sym = randomSlotSymbol();
  const hookLen = Math.random() < 0.55 ? 3 : 4;
  for (let i = 0; i < hookLen; i++) {
    const [r, c] = line[i];
    next[r][c] = sym;
  }
  const [hr, hc] = line[hookLen];
  let bait = randomSlotSymbol();
  while (bait === sym) bait = randomSlotSymbol();
  next[hr][hc] = bait;
  return next;
}

function applyForcedLine(grid: SlotGrid, matchLen: 3 | 4): SlotGrid {
  const next = grid.map((row) => [...row]) as SlotGrid;
  const line = PAYLINES[Math.floor(Math.random() * PAYLINES.length)];
  const sym = randomSlotSymbol();
  for (let i = 0; i < matchLen; i++) {
    const [r, c] = line[i];
    next[r][c] = sym;
  }
  return next;
}

export function generateSlotGrid(): SlotGrid {
  let grid = randomGrid();
  if (Math.random() < NEAR_MISS_CHANCE) grid = applyNearMiss(grid);
  if (Math.random() < LUCKY_SPIN_CHANCE) {
    grid = applyForcedLine(grid, Math.random() < 0.25 ? 4 : 3);
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

function uid(prefix: string, id: string) {
  return `${prefix}-${id.replace(/:/g, '')}`;
}

function Cherry3D({ size, inferno }: { size: number; inferno: boolean }) {
  const id = useId();
  const g1 = uid('ch-b', id);
  const g2 = uid('ch-h', id);
  const g3 = uid('ch-s', id);
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" aria-hidden className="block">
      <defs>
        <radialGradient id={g1} cx="35%" cy="28%" r="65%">
          <stop offset="0%" stopColor="#ff8fa8" />
          <stop offset="40%" stopColor="#dc2626" />
          <stop offset="100%" stopColor="#450a0a" />
        </radialGradient>
        <radialGradient id={g2} cx="30%" cy="25%" r="50%">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.85" />
          <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
        </radialGradient>
        <linearGradient id={g3} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#a16207" />
          <stop offset="100%" stopColor="#3f2a14" />
        </linearGradient>
      </defs>
      <ellipse cx="16" cy="31" rx="10" ry="11" fill={`url(#${g1})`} />
      <ellipse cx="16" cy="27" rx="4" ry="3" fill={`url(#${g2})`} />
      <ellipse cx="32" cy="29" rx="9" ry="10" fill={`url(#${g1})`} />
      <ellipse cx="30" cy="25" rx="3.5" ry="2.5" fill={`url(#${g2})`} opacity="0.7" />
      <path
        d="M24 6 Q18 12 15 18 M24 6 Q30 12 33 18"
        stroke={`url(#${g3})`}
        strokeWidth="2.2"
        fill="none"
        strokeLinecap="round"
      />
      <circle cx="24" cy="6" r="2.5" fill="#4ade80" />
      {inferno && <ellipse cx="24" cy="24" rx="18" ry="14" fill="rgba(255,80,0,0.12)" />}
    </svg>
  );
}

function Bell3D({ size, inferno }: { size: number; inferno: boolean }) {
  const id = useId();
  const brass = uid('bl', id);
  const shine = uid('bls', id);
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" aria-hidden className="block">
      <defs>
        <linearGradient id={brass} x1="0.2" y1="0" x2="0.8" y2="1">
          <stop offset="0%" stopColor="#fde68a" />
          <stop offset="35%" stopColor="#d97706" />
          <stop offset="70%" stopColor="#92400e" />
          <stop offset="100%" stopColor="#451a03" />
        </linearGradient>
        <radialGradient id={shine} cx="40%" cy="25%" r="45%">
          <stop offset="0%" stopColor="#fff" stopOpacity="0.9" />
          <stop offset="100%" stopColor="#fff" stopOpacity="0" />
        </radialGradient>
      </defs>
      <path
        d="M24 8 C14 8 10 18 10 24 L38 24 C38 18 34 8 24 8 Z"
        fill={`url(#${brass})`}
        stroke="#78350f"
        strokeWidth="0.8"
      />
      <ellipse cx="24" cy="24" rx="14" ry="3" fill="#b45309" />
      <rect x="22" y="26" width="4" height="8" rx="1" fill="#78350f" />
      <circle cx="24" cy="36" r="4" fill="#451a03" />
      <ellipse cx="20" cy="16" rx="6" ry="8" fill={`url(#${shine})`} opacity="0.5" />
      <circle cx="30" cy="30" r="2.5" fill="#292524" />
      {inferno && <ellipse cx="24" cy="22" rx="16" ry="12" fill="rgba(255,120,0,0.15)" />}
    </svg>
  );
}

function Cash3D({ size, inferno }: { size: number; inferno: boolean }) {
  const id = useId();
  const bill = uid('cs', id);
  const band = uid('gd', id);
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" aria-hidden className="block">
      <defs>
        <linearGradient id={bill} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#065f46" />
          <stop offset="50%" stopColor="#047857" />
          <stop offset="100%" stopColor="#022c22" />
        </linearGradient>
        <linearGradient id={band} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#fde68a" />
          <stop offset="100%" stopColor="#ca8a04" />
        </linearGradient>
      </defs>
      {[0, 5, 10].map((off, i) => (
        <g key={i} transform={`translate(0, ${off})`}>
          <rect x="10" y="8" width="28" height="18" rx="2" fill={`url(#${bill})`} stroke="#022c22" strokeWidth="0.6" />
          <rect x="10" y="14" width="28" height="3" fill={`url(#${band})`} />
          <text x="24" y="13" textAnchor="middle" fontSize="7" fill="#a7f3d0" fontWeight="bold">
            100
          </text>
        </g>
      ))}
      {inferno && <rect x="8" y="6" width="32" height="28" rx="4" fill="rgba(255,90,0,0.1)" />}
    </svg>
  );
}

function Dice3D({ size, inferno }: { size: number; inferno: boolean }) {
  const id = useId();
  const ruby = uid('rb', id);
  const gloss = uid('gl', id);
  const spots = [
    [18, 18],
    [30, 18],
    [18, 30],
    [30, 30],
    [24, 24],
  ];
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" aria-hidden className="block">
      <defs>
        <linearGradient id={ruby} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#fb7185" />
          <stop offset="45%" stopColor="#be123c" />
          <stop offset="100%" stopColor="#4c0519" />
        </linearGradient>
        <radialGradient id={gloss} cx="30%" cy="20%" r="55%">
          <stop offset="0%" stopColor="#fff" stopOpacity="0.75" />
          <stop offset="100%" stopColor="#fff" stopOpacity="0" />
        </radialGradient>
      </defs>
      <rect x="10" y="10" width="28" height="28" rx="6" fill={`url(#${ruby})`} stroke="#881337" strokeWidth="1" />
      <rect x="12" y="12" width="24" height="10" rx="4" fill={`url(#${gloss})`} opacity="0.45" />
      {spots.map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r="2.8" fill="#fafafa" filter="drop-shadow(0 0 2px rgba(255,255,255,0.8))" />
      ))}
      {inferno && <rect x="8" y="8" width="32" height="32" rx="8" fill="rgba(255,100,0,0.12)" />}
    </svg>
  );
}

function Diamond3D({ size, inferno }: { size: number; inferno: boolean }) {
  const id = useId();
  const crystal = uid('dm', id);
  const neon = uid('cy', id);
  const facet = uid('fc', id);
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" aria-hidden className="block">
      <defs>
        <linearGradient id={crystal} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#a5f3fc" />
          <stop offset="40%" stopColor="#06b6d4" />
          <stop offset="100%" stopColor="#0c4a6e" />
        </linearGradient>
        <linearGradient id={facet} x1="0.5" y1="0" x2="0.5" y2="1">
          <stop offset="0%" stopColor="#ecfeff" stopOpacity="0.9" />
          <stop offset="100%" stopColor="#0891b2" stopOpacity="0.2" />
        </linearGradient>
      </defs>
      <path
        d="M24 4 L40 18 L24 44 L8 18 Z"
        fill={`url(#${crystal})`}
        stroke={`url(#${neon})`}
        strokeWidth={inferno ? 2.2 : 1.6}
        style={{ stroke: inferno ? '#22d3ee' : '#67e8f9' }}
      />
      <path d="M24 4 L24 44 L8 18 Z" fill={`url(#${facet})`} opacity="0.55" />
      <path d="M24 4 L40 18 L24 20 Z" fill="#ecfeff" opacity="0.35" />
      <ellipse cx="20" cy="14" rx="4" ry="6" fill="#fff" opacity="0.25" />
    </svg>
  );
}

function Crown3D({ size, inferno }: { size: number; inferno: boolean }) {
  const id = useId();
  const gold = uid('gd', id);
  const velvet = uid('vl', id);
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" aria-hidden className="block">
      <defs>
        <linearGradient id={gold} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#fef08a" />
          <stop offset="30%" stopColor="#f59e0b" />
          <stop offset="70%" stopColor="#b45309" />
          <stop offset="100%" stopColor="#78350f" />
        </linearGradient>
        <linearGradient id={velvet} x1="0" y1="1" x2="0" y2="0">
          <stop offset="0%" stopColor="#7f1d1d" />
          <stop offset="100%" stopColor="#991b1b" />
        </linearGradient>
      </defs>
      <rect x="8" y="32" width="32" height="8" rx="2" fill={`url(#${velvet})`} />
      <path
        d="M8 28 L12 14 L18 22 L24 10 L30 22 L36 14 L40 28 Z"
        fill={`url(#${gold})`}
        stroke="#92400e"
        strokeWidth="0.8"
      />
      <circle cx="12" cy="16" r="2" fill="#e0f2fe" opacity="0.9" />
      <circle cx="24" cy="12" r="2.5" fill="#bae6fd" />
      <circle cx="36" cy="16" r="2" fill="#e0f2fe" opacity="0.9" />
      <ellipse cx="18" cy="20" rx="5" ry="3" fill="#fff" opacity="0.35" />
      {inferno && <ellipse cx="24" cy="22" rx="18" ry="14" fill="rgba(255,140,0,0.14)" />}
    </svg>
  );
}

function Jackpot3D({ size, inferno }: { size: number; inferno: boolean }) {
  const id = useId();
  const metal = uid('mt', id);
  const chase = uid('ch', id);
  return (
    <svg width={size} height={size} viewBox="0 0 60 36" aria-hidden className="block">
      <defs>
        <linearGradient id={metal} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#fecaca" />
          <stop offset="40%" stopColor="#dc2626" />
          <stop offset="100%" stopColor="#7f1d1d" />
        </linearGradient>
        <linearGradient id={chase} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#fbbf24" />
          <stop offset="50%" stopColor="#ef4444" />
          <stop offset="100%" stopColor="#fbbf24" />
        </linearGradient>
      </defs>
      <rect
        x="2"
        y="2"
        width="56"
        height="32"
        rx="4"
        fill="none"
        stroke={`url(#${chase})`}
        strokeWidth={inferno ? 2.5 : 1.5}
        className={inferno ? 'animate-pulse' : ''}
      />
      <text
        x="30"
        y="26"
        textAnchor="middle"
        fontSize="22"
        fontWeight="900"
        fill={`url(#${metal})`}
        stroke="#450a0a"
        strokeWidth="0.8"
        style={{ filter: 'drop-shadow(0 3px 2px rgba(0,0,0,0.8))' }}
      >
        777
      </text>
    </svg>
  );
}

function Clover3D({ size, inferno }: { size: number; inferno: boolean }) {
  const id = useId();
  const leaf = uid('lf', id);
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" aria-hidden className="block">
      <defs>
        <radialGradient id={leaf} cx="40%" cy="35%" r="55%">
          <stop offset="0%" stopColor="#4ade80" />
          <stop offset="55%" stopColor="#15803d" />
          <stop offset="100%" stopColor="#052e16" />
        </radialGradient>
      </defs>
      {[
        [24, 12],
        [14, 24],
        [34, 24],
        [24, 34],
      ].map(([cx, cy], i) => (
        <circle key={i} cx={cx} cy={cy} r="9" fill={`url(#${leaf})`} />
      ))}
      <rect x="22" y="32" width="4" height="10" rx="2" fill="#14532d" />
      {inferno && <circle cx="24" cy="24" r="16" fill="rgba(255,100,0,0.1)" />}
    </svg>
  );
}

function Star3D({ size, inferno }: { size: number; inferno: boolean }) {
  const id = useId();
  const neon = uid('st', id);
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" aria-hidden className="block">
      <defs>
        <radialGradient id={neon} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#fef08a" />
          <stop offset="50%" stopColor="#f59e0b" />
          <stop offset="100%" stopColor="#b45309" />
        </radialGradient>
      </defs>
      <path
        d="M24 4 L28 18 L42 18 L31 27 L35 42 L24 33 L13 42 L17 27 L6 18 L20 18 Z"
        fill={`url(#${neon})`}
        stroke="#fde047"
        strokeWidth="0.8"
        filter="drop-shadow(0 0 6px rgba(250,204,21,0.6))"
      />
      <circle cx="24" cy="20" r="4" fill="#fff" opacity="0.4" />
      {inferno && <circle cx="24" cy="24" r="18" fill="rgba(255,120,0,0.12)" />}
    </svg>
  );
}

function Ace3D({ size, inferno }: { size: number; inferno: boolean }) {
  const id = useId();
  const card = uid('cd', id);
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" aria-hidden className="block">
      <defs>
        <linearGradient id={card} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#fafafa" />
          <stop offset="100%" stopColor="#d4d4d8" />
        </linearGradient>
      </defs>
      <rect x="9" y="6" width="30" height="36" rx="5" fill={`url(#${card})`} stroke="#52525b" strokeWidth="1.2" />
      <text x="24" y="30" textAnchor="middle" fontSize="20" fontWeight="900" fill="#18181b">
        A
      </text>
      <path d="M24 11 L26 17 L18 17 Z" fill="#dc2626" />
      {inferno && <rect x="7" y="4" width="34" height="40" rx="6" fill="rgba(255,90,0,0.08)" />}
    </svg>
  );
}

const RENDERERS: Record<
  SlotSymbolId,
  (props: { size: number; inferno: boolean }) => ReactElement
> = {
  cherry: Cherry3D,
  bell: Bell3D,
  cash: Cash3D,
  dice: Dice3D,
  diamond: Diamond3D,
  crown: Crown3D,
  jackpot: Jackpot3D,
  clover: Clover3D,
  star: Star3D,
  ace: Ace3D,
};

export function SlotSymbolIcon({
  symbol,
  size,
  inferno = false,
  fill = false,
}: {
  symbol: SlotSymbolId;
  size?: number;
  inferno?: boolean;
  fill?: boolean;
}) {
  const Render = RENDERERS[symbol];
  const depth = inferno
    ? 'brightness-[1.4] contrast-[1.25] saturate-[1.5] drop-shadow-[0_0_16px_rgba(255,100,0,0.9)]'
    : 'drop-shadow-[0_5px_8px_rgba(0,0,0,0.75)] drop-shadow-[0_0_12px_rgba(255,255,255,0.06)]';

  if (fill) {
    return (
      <div
        className={`symbol-3d-wrap w-full h-full min-w-0 min-h-0 flex items-center justify-center p-0 transition-all duration-300 ${depth}`}
      >
        <div className="w-full h-full flex items-center justify-center [&_svg]:w-full [&_svg]:h-full [&_svg]:max-w-full [&_svg]:max-h-full [&_svg]:object-contain">
          <Render size={48} inferno={inferno} />
        </div>
      </div>
    );
  }

  return (
    <div className={`symbol-3d-wrap transition-all duration-300 ${depth}`}>
      <Render size={size ?? 48} inferno={inferno} />
    </div>
  );
}

export function isSlotSymbolId(value: string): value is SlotSymbolId {
  return (SLOT_SYMBOLS as readonly string[]).includes(value);
}

/** Full grid cell: persistent Vegas background + scaled 3D symbol; inferno overlays on top */
export function SlotSymbolCell({
  symbol,
  inferno = false,
}: {
  symbol: SlotSymbolId;
  inferno?: boolean;
}) {
  return (
    <div
      className={`relative w-full h-full min-w-0 min-h-0 overflow-hidden ${SYMBOL_CELL_CLASS[symbol]} ${
        inferno ? 'slot-cell-inferno z-[8]' : 'z-[2]'
      }`}
    >
      <div className="slot-cell-vegas-shine pointer-events-none" aria-hidden />
      <div
        className={`relative z-[3] w-full h-full flex items-center justify-center p-0 ${
          inferno ? 'animate-inferno-celebrate' : ''
        }`}
      >
        <SlotSymbolIcon symbol={symbol} fill inferno={inferno} />
      </div>
    </div>
  );
}
