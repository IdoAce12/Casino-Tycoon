import {
  Bell,
  Crown,
  Dices,
  DollarSign,
  Gem,
  Star,
  type LucideIcon,
} from 'lucide-react';

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

export const SLOT_SYMBOL_WEIGHTS: { symbol: SlotSymbolId; weight: number }[] = [
  { symbol: 'cherry', weight: 4 },
  { symbol: 'clover', weight: 4 },
  { symbol: 'bell', weight: 4 },
  { symbol: 'cash', weight: 2 },
  { symbol: 'dice', weight: 2 },
  { symbol: 'ace', weight: 2 },
  { symbol: 'star', weight: 1 },
  { symbol: 'diamond', weight: 1 },
  { symbol: 'crown', weight: 1 },
  { symbol: 'jackpot', weight: 1 },
];

export const WEIGHTED_SYMBOL_TOTAL = SLOT_SYMBOL_WEIGHTS.reduce((s, e) => s + e.weight, 0);

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

function CherryIcon({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" aria-hidden className="block">
      <defs>
        <radialGradient id="cherry-glow" cx="50%" cy="40%" r="55%">
          <stop offset="0%" stopColor="#ff6b8a" />
          <stop offset="55%" stopColor="#dc2626" />
          <stop offset="100%" stopColor="#7f1d1d" />
        </radialGradient>
        <linearGradient id="cherry-stem" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#4ade80" />
          <stop offset="100%" stopColor="#166534" />
        </linearGradient>
      </defs>
      <ellipse cx="17" cy="30" rx="11" ry="12" fill="url(#cherry-glow)" />
      <ellipse cx="31" cy="28" rx="10" ry="11" fill="url(#cherry-glow)" />
      <path
        d="M24 8 C20 14 17 18 17 22 M24 8 C28 14 31 18 31 22"
        stroke="url(#cherry-stem)"
        strokeWidth="2.5"
        strokeLinecap="round"
        fill="none"
      />
      <circle cx="24" cy="8" r="3" fill="#86efac" />
    </svg>
  );
}

function CloverIcon({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" aria-hidden className="block">
      <defs>
        <radialGradient id="clover-g" cx="50%" cy="45%" r="50%">
          <stop offset="0%" stopColor="#4ade80" />
          <stop offset="50%" stopColor="#16a34a" />
          <stop offset="100%" stopColor="#14532d" />
        </radialGradient>
      </defs>
      <circle cx="24" cy="14" r="9" fill="url(#clover-g)" />
      <circle cx="14" cy="26" r="9" fill="url(#clover-g)" />
      <circle cx="34" cy="26" r="9" fill="url(#clover-g)" />
      <circle cx="24" cy="34" r="9" fill="url(#clover-g)" />
      <rect x="22" y="32" width="4" height="10" rx="2" fill="#166534" />
    </svg>
  );
}

function JackpotIcon({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 56 32" aria-hidden className="block">
      <defs>
        <linearGradient id="jp-silver" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#f8fafc" />
          <stop offset="45%" stopColor="#94a3b8" />
          <stop offset="100%" stopColor="#475569" />
        </linearGradient>
        <linearGradient id="jp-red" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#fca5a5" />
          <stop offset="100%" stopColor="#b91c1c" />
        </linearGradient>
      </defs>
      <text
        x="28"
        y="24"
        textAnchor="middle"
        fontSize="22"
        fontWeight="900"
        fill="url(#jp-silver)"
        stroke="#1e293b"
        strokeWidth="0.6"
        fontFamily="Georgia, serif"
      >
        777
      </text>
      <rect x="4" y="4" width="48" height="4" rx="1" fill="url(#jp-red)" opacity="0.85" />
    </svg>
  );
}

function AceIcon({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" aria-hidden className="block">
      <defs>
        <linearGradient id="ace-card" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#fafafa" />
          <stop offset="100%" stopColor="#d4d4d8" />
        </linearGradient>
      </defs>
      <rect
        x="8"
        y="6"
        width="32"
        height="36"
        rx="5"
        fill="url(#ace-card)"
        stroke="#52525b"
        strokeWidth="1.5"
      />
      <text
        x="24"
        y="30"
        textAnchor="middle"
        fontSize="20"
        fontWeight="800"
        fill="#18181b"
        fontFamily="Georgia, serif"
      >
        A
      </text>
      <path d="M24 12 L26 18 L20 18 Z" fill="#dc2626" />
    </svg>
  );
}

const LUCIDE_SLOT: Partial<
  Record<SlotSymbolId, { Icon: LucideIcon; className: string; strokeWidth: number }>
> = {
  bell: {
    Icon: Bell,
    className: 'text-amber-300 fill-amber-500/35 stroke-amber-200',
    strokeWidth: 1.75,
  },
  cash: {
    Icon: DollarSign,
    className: 'text-emerald-300 fill-emerald-600/40 stroke-emerald-400',
    strokeWidth: 2,
  },
  dice: {
    Icon: Dices,
    className: 'text-zinc-100 fill-zinc-700/50 stroke-zinc-200',
    strokeWidth: 1.75,
  },
  star: {
    Icon: Star,
    className: 'text-yellow-200 fill-amber-400/50 stroke-amber-100',
    strokeWidth: 1.75,
  },
  diamond: {
    Icon: Gem,
    className: 'text-cyan-200 fill-cyan-400/45 stroke-cyan-100',
    strokeWidth: 1.75,
  },
  crown: {
    Icon: Crown,
    className: 'text-amber-200 fill-amber-500/55 stroke-yellow-300',
    strokeWidth: 1.75,
  },
};

function CustomSymbol({ id, size }: { id: SlotSymbolId; size: number }) {
  switch (id) {
    case 'cherry':
      return <CherryIcon size={size} />;
    case 'clover':
      return <CloverIcon size={size} />;
    case 'jackpot':
      return <JackpotIcon size={size} />;
    case 'ace':
      return <AceIcon size={size} />;
    default:
      return null;
  }
}

export function SlotSymbolIcon({
  symbol,
  size,
  inferno = false,
}: {
  symbol: SlotSymbolId;
  size: number;
  inferno?: boolean;
}) {
  const glow = inferno
    ? 'brightness-[1.35] contrast-[1.2] saturate-[1.45] drop-shadow-[0_0_14px_rgba(255,120,0,0.85)]'
    : 'drop-shadow-[0_4px_6px_rgba(0,0,0,0.65)] drop-shadow-[0_0_10px_rgba(255,255,255,0.08)]';

  const lucide = LUCIDE_SLOT[symbol];
  if (lucide) {
    const { Icon, className, strokeWidth } = lucide;
    return (
      <Icon
        size={size}
        strokeWidth={strokeWidth}
        className={`${className} ${glow} transition-all duration-300`}
        aria-hidden
      />
    );
  }

  return (
    <div className={`${glow} transition-all duration-300`}>
      <CustomSymbol id={symbol} size={size} />
    </div>
  );
}

export function randomSlotSymbol(): SlotSymbolId {
  let roll = Math.random() * WEIGHTED_SYMBOL_TOTAL;
  for (const entry of SLOT_SYMBOL_WEIGHTS) {
    roll -= entry.weight;
    if (roll <= 0) return entry.symbol;
  }
  return SLOT_SYMBOL_WEIGHTS[0].symbol;
}

export function isSlotSymbolId(value: string): value is SlotSymbolId {
  return (SLOT_SYMBOLS as readonly string[]).includes(value);
}
