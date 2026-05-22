import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from 'react';

// ─── Types ───────────────────────────────────────────────────────────────────

type Tab = 'blackjack' | 'slots' | 'shop' | 'empire';
type GameStatus = 'betting' | 'player-turn' | 'dealer-turn' | 'resolved';
type Rank = '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | '10' | 'J' | 'Q' | 'K' | 'A';
type Suit = '♠' | '♥' | '♦' | '♣';
type UpgradeKey = 'hustler' | 'ownership' | 'hftBot' | 'offshore' | 'megaResort';

interface Card {
  rank: Rank;
  suit: Suit;
}

interface BlackjackState {
  playerHand: Card[];
  dealerHand: Card[];
  deck: Card[];
  gameStatus: GameStatus;
  resultMessage: string;
  activeBet: number;
  doubled: boolean;
  dealerHoleHidden: boolean;
}

interface ColumnAnim {
  strip: string[];
  targetOffset: number;
  duration: number;
  cellHeight: number;
  finals: [string, string, string];
}

type SlotGrid = [string, string, string, string, string][];

type InfernoPhase = 'idle' | 'ignite' | 'celebrate';

interface SlotWin {
  lineIndex: number;
  count: 3 | 4 | 5;
  coords: [number, number][];
  payout: number;
  symbol: string;
}

interface SlotsState {
  grid: SlotGrid;
  isSpinning: boolean;
  slotResultMessage: string;
  persistentWinMessage: string;
  columnAnims: ColumnAnim[] | null;
  stoppedColumns: number;
  activeWins: SlotWin[];
  infernoPhase: InfernoPhase;
  burningCells: string[];
  pendingBet: number;
}

interface UpgradesBought {
  hustler: number;
  ownership: number;
  hftBot: number;
  offshore: number;
  megaResort: number;
}

interface StageTheme {
  appShell: string;
  header: string;
  nav: string;
  navActive: string;
  navInactive: string;
  label: string;
  title: string;
  muted: string;
  money: string;
  income: string;
  panel: string;
  panelGlow: string;
  ring: string;
  felt: string;
  btnWrap: string;
  btnPrimary: string;
  btnSecondary: string;
  btnFelt: string;
  btnGlow: string;
  scoreBadge: string;
  scorePulse: string;
  cardBack: string;
  slotFrame: string;
  slotCabinet: string;
  slotGlow: string;
  wagerControl: string;
  actionDock: string;
  modalWrap: string;
}

interface StageConfig {
  id: number;
  name: string;
  unlockCost: number;
  minBet: number;
  symbols: [string, string, string];
  theme: StageTheme;
  shopNames: { hustler: string; ownership: string };
}

interface FloatMessage {
  id: number;
  text: string;
  positive: boolean;
  fiery?: boolean;
}

// ─── Constants ─────────────────────────────────────────────────────────────────

const RANKS: Rank[] = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];
const SUITS: Suit[] = ['♠', '♥', '♦', '♣'];
const DECK_COUNT = 6;
const STAGES: StageConfig[] = [
  {
    id: 0,
    name: 'The Back Alley',
    unlockCost: 0,
    minBet: 5,
    symbols: ['❌', '💰', '🪙'],
    theme: {
      appShell: 'bg-gradient-to-b from-stone-900 via-zinc-950 to-neutral-950 text-stone-200',
      header: 'border-stone-700/50 bg-stone-950/85 backdrop-blur-md',
      nav: 'border-stone-700/40 bg-stone-950/95 backdrop-blur-xl',
      navActive: 'text-amber-300 bg-stone-800/60 shadow-[inset_0_0_20px_rgba(251,191,36,0.15)]',
      navInactive: 'text-stone-600',
      label: 'text-stone-400',
      title: 'text-amber-200',
      muted: 'text-stone-500',
      money: 'text-amber-100',
      income: 'text-stone-400',
      panel: 'bg-stone-900/70 backdrop-blur-md border border-stone-600/45',
      panelGlow: 'shadow-[0_0_28px_rgba(120,113,108,0.2)]',
      ring: 'ring-stone-600/35',
      felt: 'bg-gradient-to-br from-stone-800/95 via-emerald-950/55 to-stone-900 border-stone-600/55 shadow-inner',
      btnWrap: 'bg-gradient-to-r from-stone-600 via-amber-600 to-stone-600',
      btnPrimary: 'bg-gradient-to-br from-stone-800 to-zinc-950 text-amber-100',
      btnSecondary: 'bg-stone-900/95 text-stone-200',
      btnFelt: 'bg-gradient-to-br from-emerald-950 via-stone-900 to-stone-950 text-amber-100',
      btnGlow: 'shadow-[0_0_14px_rgba(251,191,36,0.25)]',
      scoreBadge: 'bg-zinc-950 border-2 border-amber-400/90 text-amber-200',
      scorePulse: 'shadow-[0_0_20px_rgba(251,191,36,0.65)]',
      cardBack: 'border-2 border-amber-500/50 bg-gradient-to-br from-stone-800 to-zinc-950',
      slotFrame: 'border-stone-600/55',
      slotCabinet: 'bg-gradient-to-b from-stone-800 via-zinc-900 to-stone-950',
      slotGlow: 'shadow-[0_0_32px_rgba(180,83,9,0.2)]',
      wagerControl: 'border-stone-600/35 bg-stone-900/55 text-amber-400/90',
      actionDock: 'border-stone-700/50 bg-stone-950/75',
      modalWrap: 'bg-gradient-to-r from-stone-500 via-amber-500 to-stone-500',
    },
    shopNames: {
      hustler: 'Street Hustler',
      ownership: 'Bribery',
    },
  },
  {
    id: 1,
    name: 'Neon Sports Bar',
    unlockCost: 2500,
    minBet: 50,
    symbols: ['🦩', '🍒', '💵'],
    theme: {
      appShell: 'bg-gradient-to-b from-indigo-950 via-purple-950 to-slate-950 text-cyan-50',
      header: 'border-cyan-500/25 bg-indigo-950/85 backdrop-blur-md',
      nav: 'border-fuchsia-500/30 bg-indigo-950/95 backdrop-blur-xl',
      navActive: 'text-fuchsia-300 bg-fuchsia-950/40 shadow-[inset_0_0_24px_rgba(217,70,239,0.35)]',
      navInactive: 'text-indigo-600',
      label: 'text-cyan-300/90',
      title: 'text-fuchsia-300',
      muted: 'text-indigo-400',
      money: 'text-cyan-200',
      income: 'text-fuchsia-400/90',
      panel: 'bg-indigo-950/65 backdrop-blur-md border border-cyan-400/35',
      panelGlow: 'shadow-[0_0_36px_rgba(34,211,238,0.22)]',
      ring: 'ring-fuchsia-500/40',
      felt: 'bg-gradient-to-br from-indigo-950 via-blue-950 to-purple-950 border-cyan-400/45 shadow-inner',
      btnWrap: 'bg-gradient-to-r from-cyan-400 via-fuchsia-500 to-pink-500',
      btnPrimary: 'bg-gradient-to-br from-indigo-900 to-purple-950 text-cyan-100',
      btnSecondary: 'bg-indigo-950/95 text-fuchsia-200',
      btnFelt: 'bg-gradient-to-br from-blue-950 via-indigo-900 to-fuchsia-950 text-white',
      btnGlow: 'shadow-[0_0_22px_rgba(217,70,239,0.45)]',
      scoreBadge: 'bg-indigo-950 border-2 border-cyan-400 text-cyan-100',
      scorePulse: 'shadow-[0_0_24px_rgba(34,211,238,0.75)]',
      cardBack: 'border-2 border-cyan-400/60 bg-gradient-to-br from-indigo-950 to-purple-950',
      slotFrame: 'border-cyan-400/50',
      slotCabinet: 'bg-gradient-to-b from-indigo-900 via-purple-900 to-indigo-950',
      slotGlow: 'shadow-[0_0_40px_rgba(217,70,239,0.35)]',
      wagerControl: 'border-cyan-500/35 bg-indigo-950/55 text-cyan-300',
      actionDock: 'border-fuchsia-500/35 bg-indigo-950/80',
      modalWrap: 'bg-gradient-to-r from-cyan-400 via-fuchsia-500 to-pink-500',
    },
    shopNames: {
      hustler: 'Auto Slot-Bot',
      ownership: 'Casino Ownership Share',
    },
  },
  {
    id: 2,
    name: 'The Syndicate Lounge',
    unlockCost: 25000,
    minBet: 500,
    symbols: ['🎲', '💎', '👑'],
    theme: {
      appShell: 'bg-gradient-to-b from-amber-950/30 via-emerald-950 to-stone-950 text-emerald-50',
      header: 'border-amber-700/40 bg-emerald-950/85 backdrop-blur-md',
      nav: 'border-amber-800/35 bg-emerald-950/95 backdrop-blur-xl',
      navActive: 'text-amber-300 bg-emerald-900/50 shadow-[inset_0_0_24px_rgba(180,83,9,0.3)]',
      navInactive: 'text-emerald-800',
      label: 'text-amber-200/85',
      title: 'text-amber-300',
      muted: 'text-emerald-700',
      money: 'text-amber-200',
      income: 'text-emerald-400',
      panel: 'bg-emerald-950/60 backdrop-blur-md border border-amber-700/40',
      panelGlow: 'shadow-[0_0_32px_rgba(13,79,60,0.35)]',
      ring: 'ring-amber-600/45',
      felt: 'bg-gradient-to-br from-emerald-900 via-emerald-800 to-emerald-950 border-amber-600/50 shadow-inner',
      btnWrap: 'bg-gradient-to-r from-amber-700 via-yellow-600 to-amber-800',
      btnPrimary: 'bg-gradient-to-br from-emerald-900 to-emerald-950 text-amber-100',
      btnSecondary: 'bg-emerald-950/95 text-amber-200/90',
      btnFelt: 'bg-gradient-to-br from-emerald-800 via-emerald-900 to-emerald-950 text-amber-50',
      btnGlow: 'shadow-[0_0_18px_rgba(180,83,9,0.4)]',
      scoreBadge: 'bg-emerald-950 border-2 border-amber-500 text-amber-100',
      scorePulse: 'shadow-[0_0_22px_rgba(234,179,8,0.6)]',
      cardBack: 'border-2 border-amber-600/55 bg-gradient-to-br from-emerald-900 to-emerald-950',
      slotFrame: 'border-amber-600/50',
      slotCabinet: 'bg-gradient-to-b from-amber-950/40 via-emerald-900 to-emerald-950',
      slotGlow: 'shadow-[0_0_36px_rgba(180,83,9,0.3)]',
      wagerControl: 'border-amber-700/40 bg-emerald-950/55 text-amber-300/90',
      actionDock: 'border-amber-800/40 bg-emerald-950/78',
      modalWrap: 'bg-gradient-to-r from-amber-600 via-yellow-500 to-amber-700',
    },
    shopNames: {
      hustler: 'Auto Slot-Bot',
      ownership: 'Casino Ownership Share',
    },
  },
  {
    id: 3,
    name: 'Casino Royale Vegas',
    unlockCost: 250000,
    minBet: 5000,
    symbols: ['🃏', '🦚', '🎰'],
    theme: {
      appShell: 'bg-gradient-to-b from-black via-zinc-950 to-stone-950 text-stone-100',
      header: 'border-yellow-600/35 bg-black/80 backdrop-blur-md',
      nav: 'border-yellow-700/30 bg-black/92 backdrop-blur-xl',
      navActive: 'text-yellow-300 bg-yellow-950/25 shadow-[inset_0_0_30px_rgba(212,175,55,0.35)]',
      navInactive: 'text-zinc-600',
      label: 'text-yellow-200/80',
      title: 'text-yellow-400',
      muted: 'text-zinc-500',
      money: 'text-yellow-100',
      income: 'text-yellow-500/90',
      panel: 'bg-black/75 backdrop-blur-md border border-yellow-600/35',
      panelGlow: 'shadow-[0_0_48px_rgba(212,175,55,0.28)]',
      ring: 'ring-yellow-500/50',
      felt: 'bg-gradient-to-br from-red-950 via-zinc-950 to-black border-yellow-600/45 shadow-[inset_0_2px_12px_rgba(0,0,0,0.6)]',
      btnWrap: 'bg-gradient-to-r from-yellow-700 via-[#D4AF37] to-yellow-600',
      btnPrimary: 'bg-gradient-to-br from-zinc-900 via-black to-zinc-950 text-yellow-100',
      btnSecondary: 'bg-zinc-950/95 text-yellow-200/90',
      btnFelt: 'bg-gradient-to-br from-red-950 via-zinc-900 to-black text-yellow-50',
      btnGlow: 'shadow-[0_0_28px_rgba(212,175,55,0.55)]',
      scoreBadge: 'bg-black border-2 border-[#D4AF37] text-yellow-300',
      scorePulse: 'shadow-[0_0_28px_rgba(212,175,55,0.85)]',
      cardBack: 'border-2 border-[#D4AF37]/70 bg-gradient-to-br from-zinc-900 to-black',
      slotFrame: 'border-yellow-600/55',
      slotCabinet: 'bg-gradient-to-b from-zinc-900 via-black to-zinc-950',
      slotGlow: 'shadow-[0_0_50px_rgba(212,175,55,0.45)] animate-pulse-gold',
      wagerControl: 'border-yellow-700/35 bg-black/60 text-yellow-400/90',
      actionDock: 'border-yellow-700/40 bg-black/82',
      modalWrap: 'bg-gradient-to-r from-yellow-600 via-[#D4AF37] to-amber-500',
    },
    shopNames: {
      hustler: 'Auto Slot-Bot',
      ownership: 'Casino Ownership Share',
    },
  },
];

const SLOT_SYMBOLS = ['🦩', '🍒', '💵', '🎲', '💎', '👑', '🃏', '🎰', '🍀', '🔔'] as const;
const SLOT_ROWS = 3;
const SLOT_COLS = 5;
const SLOT_CELL_H = 52;
const PAYLINE_COUNT = 20;
const LUCKY_SPIN_CHANCE = 0.48;
const LUCKY_SECOND_LINE_CHANCE = 0.32;

/** Common symbols appear 2× more often than rare tier */
const SLOT_SYMBOL_WEIGHTS: { symbol: (typeof SLOT_SYMBOLS)[number]; weight: number }[] = [
  { symbol: '🍒', weight: 4 },
  { symbol: '🍀', weight: 4 },
  { symbol: '🔔', weight: 4 },
  { symbol: '💵', weight: 2 },
  { symbol: '🎲', weight: 2 },
  { symbol: '🃏', weight: 2 },
  { symbol: '🦩', weight: 1 },
  { symbol: '💎', weight: 1 },
  { symbol: '👑', weight: 1 },
  { symbol: '🎰', weight: 1 },
];

const WEIGHTED_SYMBOL_TOTAL = SLOT_SYMBOL_WEIGHTS.reduce((s, e) => s + e.weight, 0);

/** 20 paylines: 3 horizontals, 2 diagonals, 15 structural (V, M, W, zigzags) */
const PAYLINES: ReadonlyArray<ReadonlyArray<[number, number]>> = [
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
    [0, 1],
    [2, 2],
    [0, 3],
    [0, 4],
  ],
  [
    [2, 0],
    [2, 1],
    [0, 2],
    [2, 3],
    [2, 4],
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

const PAYLINE_MULTIPLIERS: Record<3 | 4 | 5, number> = { 3: 2, 4: 5, 5: 25 };

const UPGRADE_BASE = {
  hustler: { cost: 75, income: 2 },
  ownership: { cost: 2500, income: 15 },
  hftBot: { cost: 12_500_000, income: 35, compoundPerLevel: 0.03 },
  offshore: { cost: 2_500_000_000, maxLevel: 1 },
  megaResort: { cost: 8e12, income: 2_500_000 },
};

const OFFSHORE_PASSIVE_MULT = 2.5;
const COLUMN_STOP_STAGGER_MS = 420;
const INFERNO_MIN_MATCH = 4;
const INFERNO_IGNITE_MS = 700;
const INFERNO_CELEBRATE_MS = 900;
const MEGA_WIN_MULT = 10;
const PASSIVE_HEAT_T = 1e12;
const PASSIVE_HEAT_QA = 1e15;
const DEALER_DRAW_DELAY_MS = 1000;
const DEALER_RESOLVE_DELAY_MS = 800;
const DEALER_FAILSAFE_MS = 20000;

function dealerMustHit(hand: Card[]): boolean {
  const dv = handValue(hand);
  return dv.total < 17 || (dv.total === 17 && dv.isSoft);
}

// ─── Audio ─────────────────────────────────────────────────────────────────────

let audioCtx: AudioContext | null = null;

function getAudio(): AudioContext {
  if (!audioCtx) audioCtx = new AudioContext();
  if (audioCtx.state === 'suspended') void audioCtx.resume();
  return audioCtx;
}

function playCardDeal(): void {
  const ctx = getAudio();
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = 'sine';
  osc.frequency.setValueAtTime(200, ctx.currentTime);
  osc.frequency.exponentialRampToValueAtTime(480, ctx.currentTime + 0.07);
  gain.gain.setValueAtTime(0.1, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.09);
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start();
  osc.stop(ctx.currentTime + 0.09);
}

function playSlotClick(): void {
  const ctx = getAudio();
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = 'triangle';
  osc.frequency.setValueAtTime(720 + Math.random() * 180, ctx.currentTime);
  gain.gain.setValueAtTime(0.05, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.035);
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start();
  osc.stop(ctx.currentTime + 0.035);
}

function playWinChime(): void {
  const ctx = getAudio();
  [523.25, 659.25, 783.99, 1046.5].forEach((freq, i) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    const t = ctx.currentTime + i * 0.09;
    osc.frequency.setValueAtTime(freq, t);
    gain.gain.setValueAtTime(0, t);
    gain.gain.linearRampToValueAtTime(0.12, t + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.32);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(t);
    osc.stop(t + 0.32);
  });
}

function playLossBuzz(): void {
  const ctx = getAudio();
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  const filter = ctx.createBiquadFilter();
  osc.type = 'sawtooth';
  osc.frequency.setValueAtTime(200, ctx.currentTime);
  osc.frequency.exponentialRampToValueAtTime(55, ctx.currentTime + 0.38);
  filter.type = 'lowpass';
  filter.frequency.linearRampToValueAtTime(70, ctx.currentTime + 0.38);
  gain.gain.setValueAtTime(0.14, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.42);
  osc.connect(filter);
  filter.connect(gain);
  gain.connect(ctx.destination);
  osc.start();
  osc.stop(ctx.currentTime + 0.42);
}

// ─── Card logic ────────────────────────────────────────────────────────────────

function createShoe(): Card[] {
  const deck: Card[] = [];
  for (let d = 0; d < DECK_COUNT; d++) {
    for (const suit of SUITS) {
      for (const rank of RANKS) deck.push({ rank, suit });
    }
  }
  return shuffle(deck);
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function drawCard(deck: Card[]): { card: Card; deck: Card[] } {
  let d = deck;
  if (d.length < 15) d = createShoe();
  const [card, ...rest] = d;
  return { card, deck: rest };
}

function handValue(cards: Card[]): { total: number; isSoft: boolean; isBlackjack: boolean } {
  let total = 0;
  let aces = 0;
  for (const c of cards) {
    if (c.rank === 'A') {
      aces++;
      total += 11;
    } else if (['K', 'Q', 'J', '10'].includes(c.rank)) {
      total += 10;
    } else {
      total += parseInt(c.rank, 10);
    }
  }
  while (total > 21 && aces > 0) {
    total -= 10;
    aces--;
  }
  return {
    total,
    isSoft: aces > 0 && total <= 21,
    isBlackjack: cards.length === 2 && total === 21,
  };
}

function cardColor(card: Card): string {
  return card.suit === '♥' || card.suit === '♦' ? 'text-red-600' : 'text-slate-900';
}

function randomSlotSymbol(): string {
  let roll = Math.random() * WEIGHTED_SYMBOL_TOTAL;
  for (const entry of SLOT_SYMBOL_WEIGHTS) {
    roll -= entry.weight;
    if (roll <= 0) return entry.symbol;
  }
  return SLOT_SYMBOL_WEIGHTS[0].symbol;
}

function applyLuckyPayline(grid: SlotGrid): SlotGrid {
  const newGrid = grid.map((row) => [...row]) as SlotGrid;
  const lineIdx = Math.floor(Math.random() * PAYLINES.length);
  const line = PAYLINES[lineIdx];
  const sym = randomSlotSymbol();
  const roll = Math.random();
  const matchLen: 3 | 4 | 5 = roll < 0.22 ? 5 : roll < 0.52 ? 4 : 3;
  for (let i = 0; i < matchLen; i++) {
    const [r, c] = line[i];
    newGrid[r][c] = sym;
  }
  return newGrid;
}

function generateSlotGrid(): SlotGrid {
  let grid = Array.from({ length: SLOT_ROWS }, () =>
    Array.from({ length: SLOT_COLS }, () => randomSlotSymbol()),
  ) as SlotGrid;

  if (Math.random() < LUCKY_SPIN_CHANCE) {
    grid = applyLuckyPayline(grid);
    if (Math.random() < LUCKY_SECOND_LINE_CHANCE) {
      grid = applyLuckyPayline(grid);
    }
  }

  return grid;
}

function buildColumnStrip(
  finals: [string, string, string],
  loops: number,
  cellHeight: number,
): ColumnAnim {
  const strip: string[] = [];
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
  };
}

function countPaylineMatch(symbols: string[]): number {
  const first = symbols[0];
  let count = 1;
  for (let i = 1; i < symbols.length; i++) {
    if (symbols[i] === first) count++;
    else break;
  }
  return count >= 3 ? count : 0;
}

function evaluateSlotWinsDetailed(
  grid: SlotGrid,
  bet: number,
): { payout: number; summary: string; wins: SlotWin[] } {
  const slotWins: SlotWin[] = [];
  let totalPayout = 0;
  const lines: string[] = [];

  for (let i = 0; i < PAYLINES.length; i++) {
    const line = PAYLINES[i];
    const symbols = line.map(([r, c]) => grid[r][c]);
    const count = countPaylineMatch(symbols);
    if (count >= 3) {
      const matchCount = count as 3 | 4 | 5;
      const mult = PAYLINE_MULTIPLIERS[matchCount];
      const linePayout = bet * mult;
      totalPayout += linePayout;
      const coords = line.slice(0, count) as [number, number][];
      slotWins.push({
        lineIndex: i,
        count: matchCount,
        coords,
        payout: linePayout,
        symbol: symbols[0],
      });
      const label = count === 5 ? 'JACKPOT' : `${count}×`;
      lines.push(`Line ${i + 1}: ${label} ${symbols[0]} → ${formatMoney(linePayout)}`);
    }
  }

  if (totalPayout === 0) {
    return { payout: 0, summary: 'No payline hits. Wager forfeited.', wins: [] };
  }

  const headline =
    lines.length === 1
      ? lines[0]
      : lines.length <= 3
        ? lines.join(' · ')
        : `${lines.length} of ${PAYLINE_COUNT} paylines · ${formatMoney(totalPayout)}`;
  return { payout: totalPayout, summary: headline, wins: slotWins };
}

function getWinningCells(wins: SlotWin[]): string[] {
  const keys = new Set<string>();
  for (const w of wins) {
    for (const [r, c] of w.coords) keys.add(`${r},${c}`);
  }
  return [...keys];
}

function getHeatGlowClass(passiveRate: number): string {
  if (passiveRate >= PASSIVE_HEAT_QA) return 'animate-heat-glow-qa rounded-none';
  if (passiveRate >= PASSIVE_HEAT_T) return 'animate-heat-glow-t rounded-none';
  return '';
}

function buildWagerJumps(
  balance: number,
  minBet: number,
  stageIdx: number,
): { label: string; amount: number }[] {
  const stageCeiling = [1e6, 1e9, 1e12, 1e18][stageIdx] ?? 1e18;
  const presets = [
    1_000, 10_000, 100_000, 1_000_000, 10_000_000, 100_000_000, 1_000_000_000,
    10_000_000_000, 100_000_000_000, 1_000_000_000_000, 1_000_000_000_000_000,
    1_000_000_000_000_000_000,
  ];
  const eligible = presets.filter(
    (a) => a >= minBet && a <= balance && a <= stageCeiling,
  );
  if (eligible.length === 0) return [];
  const picks = eligible.length <= 4 ? eligible : eligible.slice(-4);
  return picks.map((amount) => ({ label: formatMoney(amount), amount }));
}

function formatPersistentWin(totalPayout: number, bet: number): string {
  if (totalPayout > 0) return `WIN: ${formatMoney(totalPayout)}! 🔥`;
  return `LOSS: ${formatMoney(bet)}`;
}

const MONEY_TIERS: { threshold: number; suffix: string }[] = [
  { threshold: 1e33, suffix: 'Dc' },
  { threshold: 1e30, suffix: 'No' },
  { threshold: 1e27, suffix: 'Oc' },
  { threshold: 1e24, suffix: 'Sp' },
  { threshold: 1e21, suffix: 'Sx' },
  { threshold: 1e18, suffix: 'Qi' },
  { threshold: 1e15, suffix: 'Qa' },
  { threshold: 1e12, suffix: 'T' },
  { threshold: 1e9, suffix: 'B' },
  { threshold: 1e6, suffix: 'M' },
];

function formatScaled(value: number, decimals: number): string {
  const fixed = value.toFixed(decimals);
  return fixed.replace(/\.0+$/, '').replace(/(\.\d*?)0+$/, '$1');
}

function formatMoney(n: number): string {
  if (!Number.isFinite(n)) return '$0';
  const abs = Math.abs(n);
  const sign = n < 0 ? '-' : '';

  for (const { threshold, suffix } of MONEY_TIERS) {
    if (abs >= threshold) {
      const scaled = abs / threshold;
      const decimals = scaled >= 100 ? 0 : scaled >= 10 ? 1 : 2;
      return `${sign}$${formatScaled(scaled, decimals)}${suffix}`;
    }
  }

  if (abs >= 10_000) {
    return `${sign}$${formatScaled(abs / 1_000, 1)}K`;
  }

  return `${sign}$${Math.floor(abs).toLocaleString()}`;
}

function getUnlockedStage(money: number): number {
  let stage = 0;
  for (let i = STAGES.length - 1; i >= 0; i--) {
    if (money >= STAGES[i].unlockCost) {
      stage = i;
      break;
    }
  }
  return stage;
}

function initialBlackjack(): BlackjackState {
  return {
    playerHand: [],
    dealerHand: [],
    deck: createShoe(),
    gameStatus: 'betting',
    resultMessage: 'Place your wager to receive cards.',
    activeBet: 0,
    doubled: false,
    dealerHoleHidden: true,
  };
}

function initialSlots(): SlotsState {
  return {
    grid: generateSlotGrid(),
    isSpinning: false,
    slotResultMessage: 'Adjust wager and initiate spin sequence.',
    persistentWinMessage: '',
    columnAnims: null,
    stoppedColumns: SLOT_COLS,
    activeWins: [],
    infernoPhase: 'idle',
    burningCells: [],
    pendingBet: 0,
  };
}

// ─── UI primitives ─────────────────────────────────────────────────────────────

function GlassPanel({
  theme,
  children,
  className = '',
  glow = '',
}: {
  theme: StageTheme;
  children: ReactNode;
  className?: string;
  glow?: string;
}) {
  return (
    <div
      className={`theme-transition rounded-2xl backdrop-blur-md border ${theme.panel} ${glow || theme.panelGlow} ${className}`}
    >
      {children}
    </div>
  );
}

function GoldButton({
  theme,
  children,
  onClick,
  disabled = false,
  variant = 'primary',
  className = '',
  dense = false,
  action = false,
  acquired = false,
}: {
  theme: StageTheme;
  children: ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  variant?: 'primary' | 'secondary' | 'danger' | 'felt';
  className?: string;
  dense?: boolean;
  action?: boolean;
  acquired?: boolean;
}) {
  const inner =
    variant === 'felt'
      ? theme.btnFelt
      : variant === 'danger'
        ? 'bg-gradient-to-br from-red-950/90 to-black/95 text-red-300'
        : variant === 'secondary'
          ? theme.btnSecondary
          : theme.btnPrimary;

  const wrapClass = acquired
    ? 'inferno-brand-wrap animate-inferno-brand-pulse pointer-events-none'
    : `${theme.btnWrap} ${theme.btnGlow}`;
  const innerClass = acquired ? 'inferno-brand-inner' : inner;

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`theme-transition rounded-xl p-[1px] w-full btn-premium ${
        acquired ? '' : 'disabled:opacity-35'
      } disabled:pointer-events-none ${wrapClass} ${className}`}
    >
      <span
        className={`theme-transition block w-full rounded-[11px] text-center font-semibold tracking-wide ${innerClass} ${
          action ? 'px-4 py-4 text-base font-bold' : dense ? 'px-3 py-2 text-xs' : 'px-4 py-3 text-sm'
        }`}
      >
        {children}
      </span>
    </button>
  );
}

function ScoreBadge({ total, theme }: { total: number; theme: StageTheme }) {
  return (
    <div
      className={`absolute -top-2 -right-1 z-30 min-w-[2.5rem] h-10 px-2.5 flex items-center justify-center rounded-full font-black text-xl tabular-nums animate-pulse theme-transition ${theme.scoreBadge} ${theme.scorePulse}`}
      aria-label={`Hand total ${total}`}
    >
      {total}
    </div>
  );
}

function HandArea({
  label,
  theme,
  cards,
  hiddenIndex,
  showScore,
  total,
  cardsOnFire,
}: {
  label: string;
  theme: StageTheme;
  cards: Card[];
  hiddenIndex?: number;
  showScore: boolean;
  total: number;
  cardsOnFire?: boolean;
}) {
  return (
    <div
      className={`theme-transition relative flex-1 flex flex-col min-h-0 rounded-xl p-3 border shadow-inner min-h-[96px] overflow-hidden ${theme.felt}`}
    >
      <p className={`text-[10px] uppercase tracking-widest mb-2 text-center font-semibold shrink-0 ${theme.label}`}>
        {label}
      </p>
      <div className="relative z-0 flex-1 min-h-0 flex flex-wrap gap-2 justify-center items-center content-center px-1 pt-2 overflow-hidden">
        {showScore && <ScoreBadge total={total} theme={theme} />}
        {cards.map((card, i) => (
          <PlayingCard
            key={`${label}-${card.rank}${card.suit}-${i}`}
            card={card}
            hidden={hiddenIndex === i}
            size="large"
            theme={theme}
            onFire={cardsOnFire && hiddenIndex !== i}
          />
        ))}
      </div>
    </div>
  );
}

function PlayingCard({
  card,
  hidden = false,
  size = 'default',
  theme,
  onFire = false,
}: {
  card?: Card;
  hidden?: boolean;
  size?: 'compact' | 'default' | 'large';
  theme?: StageTheme;
  onFire?: boolean;
}) {
  const [dealAnim, setDealAnim] = useState(true);
  const sizeClass =
    size === 'large'
      ? 'w-[4.25rem] h-[5.75rem]'
      : size === 'compact'
        ? 'w-11 h-[3.25rem]'
        : 'w-14 h-20';
  const rankSize = size === 'large' ? 'text-xl' : size === 'compact' ? 'text-sm' : 'text-lg';
  const suitSize = size === 'large' ? 'text-3xl' : size === 'compact' ? 'text-xl' : 'text-2xl';
  const backInner =
    size === 'large' ? 'w-11 h-14' : size === 'compact' ? 'w-7 h-9' : 'w-9 h-12';

  useEffect(() => {
    const endTimer = setTimeout(() => setDealAnim(false), 380);
    return () => clearTimeout(endTimer);
  }, []);

  const anim = dealAnim ? 'animate-card-deal' : '';

  const cardBack = theme?.cardBack ?? 'border-amber-500/40 bg-gradient-to-br from-zinc-800 to-black';

  if (hidden) {
    return (
      <div
        className={`${sizeClass} rounded-xl ${cardBack} flex items-center justify-center shadow-xl ${anim}`}
      >
        <div
          className={`${backInner} rounded-lg border border-white/20 bg-gradient-to-br from-zinc-700 to-zinc-900`}
        />
      </div>
    );
  }
  if (!card) return null;
  const color = cardColor(card);
  return (
    <div
      className={`relative ${sizeClass} rounded-xl bg-white border shadow-xl flex flex-col items-center justify-center gap-0.5 ${anim} ${
        onFire
          ? 'border-orange-500/80 animate-card-inferno'
          : 'border-amber-500/30'
      }`}
    >
      {onFire && (
        <div
          className="absolute -inset-1 rounded-xl pointer-events-none z-10 bg-gradient-to-t from-orange-600/50 via-red-500/25 to-transparent animate-pulse"
          aria-hidden
        />
      )}
      <span className={`relative z-20 ${rankSize} font-black leading-none tracking-tight ${color}`}>
        {card.rank}
      </span>
      <span className={`relative z-20 ${suitSize} font-black leading-none ${color}`}>{card.suit}</span>
    </div>
  );
}

function cellCenterPct(row: number, col: number): { x: number; y: number } {
  return { x: ((col + 0.5) / SLOT_COLS) * 100, y: ((row + 0.5) / SLOT_ROWS) * 100 };
}

function PaylineOverlay({
  wins,
  infernoPhase,
  highlightInferno,
}: {
  wins: SlotWin[];
  infernoPhase: InfernoPhase;
  highlightInferno: boolean;
}) {
  if (wins.length === 0) return null;
  const infernoActive = highlightInferno && infernoPhase !== 'idle';

  return (
    <svg
      className="absolute inset-0 w-full h-full pointer-events-none z-30"
      viewBox="0 0 100 100"
      preserveAspectRatio="none"
      aria-hidden
    >
      <defs>
        <linearGradient id="infernoGrad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#ff2200" />
          <stop offset="45%" stopColor="#ff9500" />
          <stop offset="100%" stopColor="#ffcc00" />
        </linearGradient>
        <filter id="infernoGlow">
          <feGaussianBlur stdDeviation="1.2" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      {wins.map((win) => {
        const pts = win.coords.map(([r, c]) => {
          const { x, y } = cellCenterPct(r, c);
          return `${x},${y}`;
        });
        const isInfernoLine = win.count >= INFERNO_MIN_MATCH;
        const dense = wins.length > 6;
        return (
          <polyline
            key={`line-${win.lineIndex}-${win.count}`}
            points={pts.join(' ')}
            fill="none"
            stroke="url(#infernoGrad)"
            strokeWidth={
              dense ? 1.6 : infernoActive && isInfernoLine ? 3.2 : 2.2
            }
            strokeLinecap="round"
            strokeLinejoin="round"
            filter="url(#infernoGlow)"
            className={
              infernoActive && isInfernoLine
                ? 'animate-inferno-line'
                : infernoPhase === 'ignite'
                  ? 'animate-inferno-line opacity-90'
                  : 'opacity-80'
            }
            style={{ vectorEffect: 'non-scaling-stroke' } as React.CSSProperties}
          />
        );
      })}
    </svg>
  );
}

function SlotColumn({
  columnSymbols,
  anim,
  spinning,
  columnIndex,
  burningCells,
  cellHeight,
}: {
  columnSymbols: [string, string, string];
  anim: ColumnAnim | null;
  spinning: boolean;
  columnIndex: number;
  burningCells: Set<string>;
  cellHeight: number;
}) {
  const [offset, setOffset] = useState(0);
  const [transitioning, setTransitioning] = useState(false);
  const stripCellH = anim?.cellHeight ?? cellHeight;
  const viewportH = stripCellH * SLOT_ROWS;
  const showReelStrip = Boolean(anim && spinning);
  const displaySymbols = showReelStrip ? anim!.finals : columnSymbols;

  useEffect(() => {
    if (!anim || !spinning) {
      setOffset(0);
      setTransitioning(false);
      return;
    }
    setOffset(0);
    setTransitioning(false);
    const startId = requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        setTransitioning(true);
        setOffset(anim.targetOffset);
      });
    });
    return () => cancelAnimationFrame(startId);
  }, [anim, spinning]);

  const duration = anim?.duration ?? 2.2;

  return (
    <div
      className="relative flex-1 min-w-0 rounded-sm overflow-hidden border border-zinc-600 bg-[#050a12] shadow-[inset_0_0_16px_rgba(0,0,0,1)]"
      style={{ height: viewportH }}
    >
      <div className="absolute inset-0 bg-gradient-to-b from-cyan-500/5 via-transparent to-black/60 pointer-events-none z-10" />
      <div className="absolute inset-x-0 top-0 h-1/4 bg-gradient-to-b from-white/10 to-transparent z-10 pointer-events-none" />
      <div className="absolute inset-x-0 bottom-0 h-1/4 bg-gradient-to-t from-black/80 to-transparent z-10 pointer-events-none" />
      <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-[2px] bg-gold/30 z-20 pointer-events-none" />
      <div className="absolute inset-0 overflow-hidden">
        {showReelStrip ? (
          <div
            className="reel-strip"
            style={{
              transform: `translate3d(0, ${offset}px, 0)`,
              transition: transitioning
                ? `transform ${duration}s cubic-bezier(0.12, 0.72, 0.2, 1)`
                : 'none',
            }}
          >
            {anim!.strip.map((sym, idx) => (
              <div
                key={`${columnIndex}-${idx}`}
                className="flex items-center justify-center select-none leading-none"
                style={{ height: stripCellH }}
              >
                <span
                  className="drop-shadow-[0_0_8px_rgba(212,175,55,0.25)]"
                  style={{ fontSize: Math.max(18, Math.min(34, stripCellH * 0.5)) }}
                >
                  {sym}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col gap-0 leading-none">
            {displaySymbols.map((sym, row) => {
              const cellKey = `${row},${columnIndex}`;
              const inferno = burningCells.has(cellKey);
              return (
                <div
                  key={`${columnIndex}-${row}`}
                  className={`flex items-center justify-center select-none relative ${
                    inferno ? 'slot-cell-inferno' : ''
                  }`}
                  style={{ height: cellHeight }}
                >
                  <span
                    className={`relative z-[3] drop-shadow-[0_0_8px_rgba(212,175,55,0.3)] ${
                      inferno ? 'animate-inferno-celebrate' : ''
                    }`}
                    style={{ fontSize: Math.max(18, Math.min(34, cellHeight * 0.5)) }}
                  >
                    {sym}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

function SlotMatrix({
  theme,
  grid,
  spinning,
  columnAnims,
  stoppedColumns,
  activeWins,
  infernoPhase,
  burningCells,
  onCellHeight,
}: {
  theme: StageTheme;
  grid: SlotGrid;
  spinning: boolean;
  columnAnims: ColumnAnim[] | null;
  stoppedColumns: number;
  activeWins: SlotWin[];
  infernoPhase: InfernoPhase;
  burningCells: string[];
  onCellHeight: (height: number) => void;
}) {
  const gridRef = useRef<HTMLDivElement>(null);
  const [cellHeight, setCellHeight] = useState(SLOT_CELL_H);
  const burnSet = new Set(burningCells);
  const hasInfernoWin = activeWins.some((w) => w.count >= INFERNO_MIN_MATCH);
  const columns = Array.from({ length: SLOT_COLS }, (_, col) =>
    [grid[0][col], grid[1][col], grid[2][col]] as [string, string, string],
  );

  useEffect(() => {
    const el = gridRef.current;
    if (!el) return;
    const measure = () => {
      const h = el.clientHeight;
      if (h > 0) {
        const next = Math.max(44, Math.floor(h / SLOT_ROWS));
        setCellHeight(next);
        onCellHeight(next);
      }
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, [onCellHeight]);

  return (
    <div className={`relative w-full h-full mx-auto theme-transition ${theme.slotGlow}`}>
      <div className="absolute -inset-0.5 rounded-2xl bg-gradient-to-b from-gold/20 via-transparent to-gold-dark/30 blur-sm" />
      <div
        className={`theme-transition relative h-full flex flex-col rounded-xl border-2 p-1 shadow-[0_8px_32px_rgba(0,0,0,0.8),inset_0_1px_0_rgba(255,255,255,0.08)] ${theme.slotFrame} ${theme.slotCabinet}`}
      >
        <div className="flex items-center justify-between px-1 mb-1 shrink-0">
          <span className={`text-[9px] font-bold tracking-[0.2em] uppercase ${theme.title}`}>
            VIP · 3×5
          </span>
          <div className="flex gap-0.5">
            {Array.from({ length: SLOT_COLS }, (_, i) => (
              <div
                key={i}
                className={`w-1.5 h-1.5 rounded-full theme-transition ${
                  spinning && i >= stoppedColumns
                    ? 'bg-white animate-pulse opacity-100'
                    : spinning
                      ? 'bg-emerald-400/80'
                      : 'bg-white/30'
                }`}
              />
            ))}
          </div>
        </div>
        <div
          ref={gridRef}
          className="relative flex-1 min-h-0 rounded-lg border border-zinc-700 bg-black p-0.5 shadow-[inset_0_4px_24px_rgba(0,0,0,0.9)]"
        >
          <div className="flex gap-px justify-center w-full h-full relative">
            {columns.map((colSyms, i) => (
              <SlotColumn
                key={i}
                columnIndex={i}
                columnSymbols={colSyms}
                anim={columnAnims?.[i] ?? null}
                spinning={spinning && columnAnims !== null}
                burningCells={burnSet}
                cellHeight={cellHeight}
              />
            ))}
          </div>
          {!spinning && activeWins.length > 0 && (
            <PaylineOverlay
              wins={activeWins}
              infernoPhase={infernoPhase}
              highlightInferno={hasInfernoWin}
            />
          )}
        </div>
        <div className="mt-1 h-0.5 rounded-full bg-zinc-800 overflow-hidden shrink-0">
          <div
            className={`h-full bg-gradient-to-r from-gold-dark via-gold to-gold-light transition-all ease-out ${spinning ? 'w-full' : 'w-0'}`}
            style={{ transitionDuration: spinning ? '3800ms' : '300ms' }}
          />
        </div>
      </div>
    </div>
  );
}

// ─── App ───────────────────────────────────────────────────────────────────────

export default function App() {
  const [playerMoney, setPlayerMoney] = useState(100);
  const [currentBet, setCurrentBet] = useState(5);
  const [passiveIncomeRate, setPassiveIncomeRate] = useState(0);
  const [blackjackState, setBlackjackState] = useState<BlackjackState>(initialBlackjack);
  const [slotsState, setSlotsState] = useState<SlotsState>(() => initialSlots());
  const [currentTab, setCurrentTab] = useState<Tab>('blackjack');
  const [currentStage, setCurrentStage] = useState(0);
  const [upgradesBought, setUpgradesBought] = useState<UpgradesBought>({
    hustler: 0,
    ownership: 0,
    hftBot: 0,
    offshore: 0,
    megaResort: 0,
  });
  const [stageModal, setStageModal] = useState<StageConfig | null>(null);
  const [lifetimePeakMoney, setLifetimePeakMoney] = useState(100);
  const [highestStageUnlockedEver, setHighestStageUnlockedEver] = useState(0);
  const [floatMessages, setFloatMessages] = useState<FloatMessage[]>([]);
  const [winFlash, setWinFlash] = useState(false);
  const [lossShake, setLossShake] = useState(false);
  const [winShake, setWinShake] = useState(false);
  const [naturalBjFire, setNaturalBjFire] = useState(false);
  const [blackjackBusy, setBlackjackBusy] = useState(false);

  const floatId = useRef(0);
  const slotSpinSoundRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const slotSpinEndRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const slotCascadeTimeoutsRef = useRef<ReturnType<typeof setTimeout>[]>([]);
  const slotsCellHeightRef = useRef(SLOT_CELL_H);
  const dealerTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const dealerFailsafeRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const dealerSeqRef = useRef(0);
  const dealerActiveRef = useRef(false);
  const dealerCtxRef = useRef({
    playerHand: [] as Card[],
    dealerHand: [] as Card[],
    deck: [] as Card[],
    bet: 0,
  });

  const stage = STAGES[currentStage];
  const minBet = stage.minBet;

  useEffect(() => {
    const link = document.querySelector<HTMLLinkElement>('link[rel="manifest"]');
    if (!link) {
      const m = document.createElement('link');
      m.rel = 'manifest';
      m.href = '/manifest.json';
      document.head.appendChild(m);
    }
    document.documentElement.style.setProperty('--sat', 'env(safe-area-inset-top)');
  }, []);

  const recalcPassive = useCallback((upgrades: UpgradesBought, stageIdx: number) => {
    const stageMult = 1 + stageIdx * 0.5;
    const hustlerIncome = upgrades.hustler * UPGRADE_BASE.hustler.income * stageMult;
    const ownershipIncome = upgrades.ownership
      ? UPGRADE_BASE.ownership.income * Math.pow(2, upgrades.ownership) * stageMult
      : 0;
    const hftIncome = upgrades.hftBot * UPGRADE_BASE.hftBot.income * stageMult;
    const megaIncome = upgrades.megaResort * UPGRADE_BASE.megaResort.income * stageMult;
    const hftCompound = Math.pow(1 + UPGRADE_BASE.hftBot.compoundPerLevel, upgrades.hftBot);
    let rate = (hustlerIncome + ownershipIncome + hftIncome + megaIncome) * hftCompound;
    if (upgrades.offshore > 0) rate *= OFFSHORE_PASSIVE_MULT;
    return rate;
  }, []);

  useEffect(() => {
    setPassiveIncomeRate(recalcPassive(upgradesBought, currentStage));
  }, [upgradesBought, currentStage, recalcPassive]);

  useEffect(() => {
    if (passiveIncomeRate <= 0) return;
    const id = setInterval(() => setPlayerMoney((m) => m + passiveIncomeRate), 1000);
    return () => clearInterval(id);
  }, [passiveIncomeRate]);

  useEffect(() => {
    setLifetimePeakMoney((peak) => (playerMoney > peak ? playerMoney : peak));
  }, [playerMoney]);

  useEffect(() => {
    const stageFromPeak = getUnlockedStage(lifetimePeakMoney);
    if (stageFromPeak > highestStageUnlockedEver) {
      setHighestStageUnlockedEver(stageFromPeak);
      setCurrentStage((s) => Math.max(s, stageFromPeak));
      setStageModal(STAGES[stageFromPeak]);
      setSlotsState((prev) => ({
        ...prev,
        grid: generateSlotGrid(),
        activeWins: [],
        infernoPhase: 'idle',
        burningCells: [],
        persistentWinMessage: '',
        slotResultMessage: 'New venue unlocked. 3×5 matrix recalibrated.',
      }));
      if (currentBet < STAGES[stageFromPeak].minBet) {
        setCurrentBet(STAGES[stageFromPeak].minBet);
      }
    }
  }, [lifetimePeakMoney, highestStageUnlockedEver, currentBet]);

  useEffect(() => {
    if (currentBet < minBet) setCurrentBet(minBet);
  }, [minBet, currentBet]);

  const clearSlotCascadeTimers = useCallback(() => {
    for (const id of slotCascadeTimeoutsRef.current) clearTimeout(id);
    slotCascadeTimeoutsRef.current = [];
  }, []);

  const scheduleSlotCascade = useCallback((fn: () => void, ms: number) => {
    const id = setTimeout(fn, ms);
    slotCascadeTimeoutsRef.current.push(id);
  }, []);

  useEffect(() => {
    return () => {
      if (slotSpinSoundRef.current) clearInterval(slotSpinSoundRef.current);
      if (slotSpinEndRef.current) clearTimeout(slotSpinEndRef.current);
      clearSlotCascadeTimers();
      if (dealerTimeoutRef.current) clearTimeout(dealerTimeoutRef.current);
      if (dealerFailsafeRef.current) clearTimeout(dealerFailsafeRef.current);
      dealerSeqRef.current += 1;
      dealerActiveRef.current = false;
    };
  }, [clearSlotCascadeTimers]);

  const cancelDealerTimers = useCallback(() => {
    if (dealerTimeoutRef.current) {
      clearTimeout(dealerTimeoutRef.current);
      dealerTimeoutRef.current = null;
    }
    if (dealerFailsafeRef.current) {
      clearTimeout(dealerFailsafeRef.current);
      dealerFailsafeRef.current = null;
    }
  }, []);

  const releaseDealerLock = useCallback(() => {
    cancelDealerTimers();
    dealerActiveRef.current = false;
    setBlackjackBusy(false);
  }, [cancelDealerTimers]);

  const clearDealerSequence = useCallback(() => {
    dealerSeqRef.current += 1;
    releaseDealerLock();
  }, [releaseDealerLock]);

  useEffect(() => {
    if (blackjackState.gameStatus === 'dealer-turn') return;
    dealerSeqRef.current += 1;
    cancelDealerTimers();
    dealerActiveRef.current = false;
    setBlackjackBusy(false);
  }, [blackjackState.gameStatus, cancelDealerTimers]);

  const MAX_FLOAT_MESSAGES = 2;

  const addFloat = useCallback((text: string, positive: boolean, fiery = false) => {
    const id = ++floatId.current;
    setFloatMessages((prev) => [...prev.slice(-(MAX_FLOAT_MESSAGES - 1)), { id, text, positive, fiery }]);
    setTimeout(() => setFloatMessages((prev) => prev.filter((m) => m.id !== id)), fiery ? 1400 : 1200);
  }, []);

  const feedbackWin = useCallback(
    (amount: number, wager?: number) => {
      playWinChime();
      setWinFlash(true);
      setTimeout(() => setWinFlash(false), 600);
      if (wager !== undefined && amount >= wager * MEGA_WIN_MULT) {
        setWinShake(true);
        setTimeout(() => setWinShake(false), 560);
      }
      addFloat(`+${formatMoney(amount)}`, true, true);
    },
    [addFloat],
  );

  const feedbackLoss = useCallback(
    (amount: number) => {
      playLossBuzz();
      setLossShake(true);
      setTimeout(() => setLossShake(false), 500);
      addFloat(`-${formatMoney(amount)}`, false);
    },
    [addFloat],
  );

  const triggerNaturalBjFire = useCallback(() => {
    setNaturalBjFire(true);
    setTimeout(() => setNaturalBjFire(false), 3200);
  }, []);

  const handleSlotsCellHeight = useCallback((height: number) => {
    slotsCellHeightRef.current = height;
  }, []);

  const finalizeSlotsRound = useCallback(
    (
      totalPayout: number,
      bet: number,
      summary: string,
      finalGrid: SlotGrid,
      wins: SlotWin[],
      celebrateCells: string[],
    ) => {
      const net = totalPayout - bet;
      if (net > 0) {
        feedbackWin(net, bet);
        setPlayerMoney((m) => m + totalPayout);
      } else if (totalPayout === 0) {
        feedbackLoss(bet);
      }
      setSlotsState((s) => ({
        ...s,
        grid: finalGrid,
        isSpinning: false,
        columnAnims: null,
        stoppedColumns: SLOT_COLS,
        activeWins: wins,
        infernoPhase: totalPayout > 0 ? 'celebrate' : 'idle',
        burningCells: celebrateCells,
        pendingBet: 0,
        slotResultMessage: summary,
        persistentWinMessage: formatPersistentWin(totalPayout, bet),
      }));
    },
    [feedbackWin, feedbackLoss],
  );

  const resolveSlotsOutcome = useCallback(
    (grid: SlotGrid, bet: number) => {
      const { payout, summary, wins } = evaluateSlotWinsDetailed(grid, bet);
      const celebrateCells = payout > 0 ? getWinningCells(wins) : [];

      setSlotsState((s) => ({
        ...s,
        grid,
        activeWins: wins,
        infernoPhase: payout > 0 ? 'ignite' : 'idle',
        burningCells: [],
        pendingBet: bet,
        slotResultMessage: summary,
      }));

      const delay = payout > 0 ? INFERNO_IGNITE_MS + INFERNO_CELEBRATE_MS : 0;
      scheduleSlotCascade(
        () => finalizeSlotsRound(payout, bet, summary, grid, wins, celebrateCells),
        delay,
      );
    },
    [finalizeSlotsRound, scheduleSlotCascade],
  );

  const upgradeCost = (key: UpgradeKey): number => {
    const base = UPGRADE_BASE[key].cost;
    const count = upgradesBought[key];
    const stageScale = 1 + currentStage * 0.35;
    if (key === 'offshore') return Math.floor(base * stageScale);
    if (key === 'megaResort') return Math.floor(base * Math.pow(1.85, count) * stageScale);
    if (key === 'hftBot') return Math.floor(base * Math.pow(1.65, count) * stageScale);
    return Math.floor(base * Math.pow(1.5, count) * stageScale);
  };

  const buyUpgrade = (key: UpgradeKey) => {
    const cost = upgradeCost(key);
    if (playerMoney < cost) return;
    if (key === 'offshore' && upgradesBought.offshore > 0) return;
    setPlayerMoney((m) => m - cost);
    setUpgradesBought((u) => ({ ...u, [key]: u[key] + 1 }));
    playWinChime();
  };

  const resolveBlackjack = useCallback(
    (
      playerHand: Card[],
      dealerHand: Card[],
      bet: number,
      playerNatural: boolean,
      dealerNatural: boolean,
    ): { message: string; payout: number } => {
      const pv = handValue(playerHand);
      const dv = handValue(dealerHand);
      if (playerNatural && dealerNatural)
        return { message: 'Push — both natural blackjack.', payout: bet };
      if (playerNatural) return { message: 'Natural blackjack. Pays 3:2.', payout: bet + bet * 1.5 };
      if (dealerNatural) return { message: 'Dealer blackjack. Wager lost.', payout: 0 };
      if (pv.total > 21) return { message: `Player bust (${pv.total}).`, payout: 0 };
      if (dv.total > 21) return { message: `Dealer bust (${dv.total}). You win.`, payout: bet * 2 };
      if (pv.total > dv.total)
        return { message: `You win ${pv.total} over ${dv.total}.`, payout: bet * 2 };
      if (pv.total < dv.total)
        return { message: `Dealer wins ${dv.total} over ${pv.total}.`, payout: 0 };
      return { message: `Push at ${pv.total}.`, payout: bet };
    },
    [],
  );

  const finishRound = useCallback(
    (playerHand: Card[], dealerHand: Card[], deck: Card[], bet: number) => {
      try {
        const pv = handValue(playerHand);
        const dv = handValue(dealerHand);
        const { message, payout } = resolveBlackjack(
          playerHand,
          dealerHand,
          bet,
          pv.isBlackjack,
          dv.isBlackjack,
        );
        const net = payout - bet;
        if (net > 0) {
          if (pv.isBlackjack) triggerNaturalBjFire();
          feedbackWin(net, bet);
        } else if (net < 0) feedbackLoss(bet);
        setPlayerMoney((m) => m + payout);
        setBlackjackState((s) => ({
          ...s,
          playerHand,
          dealerHand,
          deck,
          gameStatus: 'resolved',
          resultMessage: message,
          dealerHoleHidden: false,
          activeBet: bet,
        }));
      } finally {
        releaseDealerLock();
      }
    },
    [resolveBlackjack, feedbackWin, feedbackLoss, releaseDealerLock, triggerNaturalBjFire],
  );

  const runDealerTurn = useCallback(
    (playerHand: Card[], dealerHand: Card[], deck: Card[], bet: number) => {
      const seq = ++dealerSeqRef.current;
      cancelDealerTimers();
      dealerActiveRef.current = true;
      setBlackjackBusy(true);

      let dHand = [...dealerHand];
      let dDeck = [...deck];
      dealerCtxRef.current = { playerHand, dealerHand: dHand, deck: dDeck, bet };

      const isStale = () => seq !== dealerSeqRef.current;

      const schedule = (fn: () => void, delay: number) => {
        dealerTimeoutRef.current = setTimeout(() => {
          if (isStale()) return;
          fn();
        }, delay);
      };

      dealerFailsafeRef.current = setTimeout(() => {
        if (isStale()) return;
        const ctx = dealerCtxRef.current;
        finishRound(ctx.playerHand, ctx.dealerHand, ctx.deck, ctx.bet);
      }, DEALER_FAILSAFE_MS);

      const resolveAfterPause = () => {
        schedule(() => {
          try {
            finishRound(playerHand, dHand, dDeck, bet);
          } catch {
            const ctx = dealerCtxRef.current;
            finishRound(ctx.playerHand, ctx.dealerHand, ctx.deck, ctx.bet);
          }
        }, DEALER_RESOLVE_DELAY_MS);
      };

      const drawStep = () => {
        if (isStale()) return;
        try {
          if (!dealerMustHit(dHand)) {
            resolveAfterPause();
            return;
          }

          const drawn = drawCard(dDeck);
          dHand = [...dHand, drawn.card];
          dDeck = drawn.deck;
          dealerCtxRef.current = { playerHand, dealerHand: dHand, deck: dDeck, bet };
          playCardDeal();

          const total = handValue(dHand).total;
          const stillHitting = dealerMustHit(dHand);

          setBlackjackState((s) => ({
            ...s,
            playerHand,
            dealerHand: dHand,
            deck: dDeck,
            gameStatus: 'dealer-turn',
            dealerHoleHidden: false,
            resultMessage: stillHitting
              ? `Dealer hits… ${total}`
              : `Dealer stands on ${total}.`,
          }));

          schedule(stillHitting ? drawStep : resolveAfterPause, DEALER_DRAW_DELAY_MS);
        } catch {
          resolveAfterPause();
        }
      };

      setBlackjackState((s) => ({
        ...s,
        gameStatus: 'dealer-turn',
        dealerHoleHidden: false,
        resultMessage: 'Dealer reveals hole card…',
      }));

      if (!dealerMustHit(dHand)) {
        schedule(resolveAfterPause, DEALER_DRAW_DELAY_MS);
        return;
      }

      schedule(drawStep, DEALER_DRAW_DELAY_MS);
    },
    [finishRound, cancelDealerTimers],
  );

  const placeBet = () => {
    if (blackjackState.gameStatus !== 'betting' || blackjackBusy) return;
    clearDealerSequence();
    const bet = currentBet;
    if (bet < minBet || playerMoney < bet) return;
    setPlayerMoney((m) => m - bet);
    let deck = [...blackjackState.deck];
    const draws: Card[] = [];
    for (let i = 0; i < 4; i++) {
      const d = drawCard(deck);
      draws.push(d.card);
      deck = d.deck;
      playCardDeal();
    }
    const playerHand = [draws[0], draws[2]];
    const dealerHand = [draws[1], draws[3]];
    const pv = handValue(playerHand);
    const dv = handValue(dealerHand);
    if (pv.isBlackjack || dv.isBlackjack) {
      const { message, payout } = resolveBlackjack(
        playerHand,
        dealerHand,
        bet,
        pv.isBlackjack,
        dv.isBlackjack,
      );
      const net = payout - bet;
      if (net > 0) {
        if (pv.isBlackjack) triggerNaturalBjFire();
        feedbackWin(net, bet);
      } else if (net < 0) feedbackLoss(bet);
      setPlayerMoney((m) => m + payout);
      setBlackjackState({
        playerHand,
        dealerHand,
        deck,
        gameStatus: 'resolved',
        resultMessage: message,
        activeBet: bet,
        doubled: false,
        dealerHoleHidden: false,
      });
      return;
    }
    setBlackjackState({
      playerHand,
      dealerHand,
      deck,
      gameStatus: 'player-turn',
      resultMessage: 'Your action — Hit, Stand, or Double Down.',
      activeBet: bet,
      doubled: false,
      dealerHoleHidden: true,
    });
  };

  const hit = () => {
    if (blackjackState.gameStatus !== 'player-turn' || blackjackBusy || dealerActiveRef.current) return;
    const bet = blackjackState.activeBet;
    let deck = [...blackjackState.deck];
    const drawn = drawCard(deck);
    playCardDeal();
    const playerHand = [...blackjackState.playerHand, drawn.card];
    deck = drawn.deck;
    const pv = handValue(playerHand);
    if (pv.total > 21) {
      clearDealerSequence();
      feedbackLoss(bet);
      setBlackjackState((s) => ({
        ...s,
        playerHand,
        deck,
        gameStatus: 'resolved',
        resultMessage: `Bust (${pv.total}). Wager lost.`,
        dealerHoleHidden: false,
      }));
      return;
    }
    if (blackjackState.doubled) {
      setBlackjackState((s) => ({
        ...s,
        playerHand,
        deck,
        gameStatus: 'dealer-turn',
        resultMessage: 'Dealer reveals…',
        dealerHoleHidden: false,
      }));
      runDealerTurn(playerHand, blackjackState.dealerHand, deck, bet);
      return;
    }
    setBlackjackState((s) => ({
      ...s,
      playerHand,
      deck,
      resultMessage: `Hand value ${pv.total}. Continue or stand.`,
    }));
  };

  const stand = () => {
    if (blackjackState.gameStatus !== 'player-turn' || blackjackBusy || dealerActiveRef.current) return;
    setBlackjackState((s) => ({
      ...s,
      gameStatus: 'dealer-turn',
      resultMessage: 'Dealer draws…',
      dealerHoleHidden: false,
    }));
    runDealerTurn(
      blackjackState.playerHand,
      blackjackState.dealerHand,
      blackjackState.deck,
      blackjackState.activeBet,
    );
  };

  const doubleDown = () => {
    if (blackjackState.gameStatus !== 'player-turn' || blackjackBusy || dealerActiveRef.current) return;
    if (blackjackState.playerHand.length !== 2) return;
    const extra = blackjackState.activeBet;
    if (playerMoney < extra) return;
    setPlayerMoney((m) => m - extra);
    const bet = extra * 2;
    let deck = [...blackjackState.deck];
    const drawn = drawCard(deck);
    playCardDeal();
    const playerHand = [...blackjackState.playerHand, drawn.card];
    deck = drawn.deck;
    const pv = handValue(playerHand);
    if (pv.total > 21) {
      clearDealerSequence();
      feedbackLoss(bet);
      setBlackjackState((s) => ({
        ...s,
        playerHand,
        deck,
        gameStatus: 'resolved',
        resultMessage: `Double down bust (${pv.total}).`,
        activeBet: bet,
        doubled: true,
        dealerHoleHidden: false,
      }));
      return;
    }
    setBlackjackState((s) => ({
      ...s,
      playerHand,
      deck,
      gameStatus: 'dealer-turn',
      activeBet: bet,
      doubled: true,
      dealerHoleHidden: false,
      resultMessage: 'Double down complete. Dealer plays.',
    }));
    runDealerTurn(playerHand, blackjackState.dealerHand, deck, bet);
  };

  const newHand = () => {
    clearDealerSequence();
    setBlackjackState((s) => ({
      ...initialBlackjack(),
      deck: s.deck.length > 20 ? s.deck : createShoe(),
    }));
  };

  const adjustBet = (delta: number) => {
    setCurrentBet((b) => Math.max(minBet, Math.min(playerMoney, b + delta)));
  };

  const setWagerJump = (amount: number) => {
    setCurrentBet(Math.max(minBet, Math.min(playerMoney, amount)));
  };

  const wagerJumps = buildWagerJumps(playerMoney, minBet, currentStage);

  const spinSlots = () => {
    if (slotsState.isSpinning) return;
    const bet = currentBet;
    if (bet < minBet || playerMoney < bet) return;

    const finalGrid = generateSlotGrid();
    const cellH = slotsCellHeightRef.current;
    const baseDurations = [1.6, 1.9, 2.2, 2.5, 2.8] as const;
    const columnAnims: ColumnAnim[] = Array.from({ length: SLOT_COLS }, (_, col) => {
      const finals = [finalGrid[0][col], finalGrid[1][col], finalGrid[2][col]] as [
        string,
        string,
        string,
      ];
      const base = buildColumnStrip(finals, 6 + col * 2, cellH);
      return { ...base, duration: baseDurations[col] };
    });

    clearSlotCascadeTimers();
    setPlayerMoney((m) => m - bet);
    setSlotsState({
      grid: finalGrid,
      isSpinning: true,
      columnAnims,
      slotResultMessage: 'Matrix engaged — columns locking…',
      persistentWinMessage: '',
      stoppedColumns: 0,
      activeWins: [],
      infernoPhase: 'idle',
      burningCells: [],
      pendingBet: bet,
    });

    slotSpinSoundRef.current = setInterval(() => playSlotClick(), 120);

    if (slotSpinEndRef.current) clearTimeout(slotSpinEndRef.current);

    const finishSpin = () => {
      if (slotSpinSoundRef.current) clearInterval(slotSpinSoundRef.current);
      setSlotsState((s) => ({
        ...s,
        isSpinning: false,
        columnAnims: null,
        stoppedColumns: SLOT_COLS,
      }));
      resolveSlotsOutcome(finalGrid, bet);
    };

    const maxMs = Math.max(...baseDurations) * 1000 + 200;
    slotSpinEndRef.current = setTimeout(finishSpin, maxMs);

    for (let col = 1; col <= SLOT_COLS; col++) {
      setTimeout(() => {
        setSlotsState((s) =>
          s.isSpinning ? { ...s, stoppedColumns: col } : s,
        );
      }, col * COLUMN_STOP_STAGGER_MS + 400);
    }
  };

  const selectStage = (idx: number) => {
    if (lifetimePeakMoney < STAGES[idx].unlockCost) return;
    setCurrentStage(idx);
    setCurrentBet(Math.max(currentBet, STAGES[idx].minBet));
    setSlotsState((s) => ({
      ...s,
      grid: generateSlotGrid(),
      columnAnims: null,
      isSpinning: false,
      stoppedColumns: SLOT_COLS,
      activeWins: [],
      infernoPhase: 'idle',
      burningCells: [],
      persistentWinMessage: '',
    }));
  };

  const theme = stage.theme;
  const heatGlow = getHeatGlowClass(passiveIncomeRate);
  const slotsResolving =
    slotsState.infernoPhase === 'ignite' && !slotsState.isSpinning;

  const slotsLiveStatus = slotsState.isSpinning
    ? 'Reels locking…'
    : slotsState.infernoPhase === 'ignite'
      ? 'Inferno ignite! 🔥'
      : null;

  const slotsWinDisplay =
    slotsState.isSpinning || slotsResolving
      ? slotsLiveStatus ?? 'Resolving…'
      : slotsState.persistentWinMessage || 'Set wager below · tap Spin';
  const dealerTotal = handValue(blackjackState.dealerHand).total;
  const playerTotal = handValue(blackjackState.playerHand).total;
  const canBet = blackjackState.gameStatus === 'betting' && !blackjackBusy;
  const playerTurn = blackjackState.gameStatus === 'player-turn' && !blackjackBusy;
  const dealerTurn = blackjackState.gameStatus === 'dealer-turn';
  const resolved = blackjackState.gameStatus === 'resolved';

  const navItems: { tab: Tab; icon: string; label: string }[] = [
    { tab: 'blackjack', icon: '♠', label: 'Blackjack' },
    { tab: 'slots', icon: '◆', label: 'Slots' },
    { tab: 'shop', icon: '✦', label: 'Shop' },
    { tab: 'empire', icon: '♛', label: 'Empire' },
  ];

  return (
    <div
      className={`theme-transition max-w-md mx-auto h-[100dvh] flex flex-col overflow-hidden ${theme.appShell} ${heatGlow} ${winFlash ? 'animate-flash-win' : ''} ${lossShake ? 'animate-shake-loss' : ''} ${winShake ? 'animate-win-shake' : ''}`}
    >
      <header className={`theme-transition shrink-0 pt-safe px-safe border-b ${theme.header}`}>
        <div className="px-4 py-3">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className={`text-[10px] tracking-[0.35em] uppercase font-medium ${theme.muted}`}>
                Lone Empire
              </p>
              <h1 className={`font-display text-lg font-bold leading-tight ${theme.title}`}>
                Casino Tycoon
              </h1>
              <p className={`text-xs mt-0.5 ${theme.label}`}>{stage.name}</p>
            </div>
            <GlassPanel theme={theme} className="px-3 py-2 text-right min-w-[100px]">
              <p className={`text-[9px] uppercase tracking-widest ${theme.muted}`}>Balance</p>
              <p className={`text-xl font-bold tabular-nums ${theme.money}`}>
                {formatMoney(playerMoney)}
              </p>
              {passiveIncomeRate > 0 && (
                <p className={`text-[10px] tabular-nums ${theme.income}`}>
                  +{formatMoney(passiveIncomeRate)}/s
                </p>
              )}
            </GlassPanel>
          </div>
          {currentTab !== 'slots' && (
            <GlassPanel theme={theme} className={`mt-3 px-3 py-2 flex items-center gap-2 ${theme.wagerControl}`}>
              <span className={`text-[10px] uppercase tracking-wider shrink-0 ${theme.muted}`}>
                Wager
              </span>
              <button
                type="button"
                onClick={() => adjustBet(-minBet)}
                className={`theme-transition w-8 h-8 rounded-lg border btn-premium text-sm font-bold ${theme.wagerControl}`}
              >
                −
              </button>
              <span className={`flex-1 text-center font-bold tabular-nums text-base ${theme.money}`}>
                {formatMoney(currentBet)}
              </span>
              <button
                type="button"
                onClick={() => adjustBet(minBet)}
                className={`theme-transition w-8 h-8 rounded-lg border btn-premium text-sm font-bold ${theme.wagerControl}`}
              >
                +
              </button>
              <span className={`text-[9px] shrink-0 ${theme.muted}`}>min {formatMoney(minBet)}</span>
            </GlassPanel>
          )}
        </div>
      </header>

      <main
        className={`flex-1 min-h-0 px-safe ${
          currentTab === 'blackjack' || currentTab === 'slots'
            ? 'flex flex-col overflow-hidden'
            : 'overflow-y-auto overflow-x-hidden'
        }`}
      >
        <div
          className={`relative ${
            currentTab === 'blackjack'
              ? 'flex flex-col flex-1 min-h-0 px-2 py-2'
              : currentTab === 'slots'
                ? 'flex flex-col flex-1 min-h-0 max-h-[85vh] overflow-hidden px-2 py-1'
                : 'px-3 py-3 min-h-full'
          }`}
        >
          {floatMessages.map((fm) => (
            <div
              key={fm.id}
              className={`pointer-events-none absolute left-1/2 -translate-x-1/2 z-50 font-black text-xl ${
                fm.fiery ? 'animate-fiery-float-up text-fire-win fiery-float-particles' : fm.positive ? 'animate-float-up text-emerald-400' : 'animate-float-up text-red-400'
              }`}
              style={{ top: '28%' }}
            >
              {fm.text}
            </div>
          ))}

          {currentTab === 'blackjack' && (
            <GlassPanel
              theme={theme}
              className={`flex-1 flex flex-col min-h-0 ring-1 ${theme.ring} p-2 pb-0 overflow-hidden`}
            >
              <p className={`shrink-0 text-center text-[11px] min-h-[32px] leading-snug px-1 mb-1 ${theme.muted}`}>
                {blackjackState.resultMessage}
              </p>

              <div className="flex-1 flex flex-col gap-2 min-h-0 py-1">
                <HandArea
                  label="Dealer"
                  theme={theme}
                  cards={blackjackState.dealerHand}
                  hiddenIndex={blackjackState.dealerHoleHidden ? 1 : undefined}
                  showScore={!blackjackState.dealerHoleHidden && blackjackState.dealerHand.length > 0}
                  total={dealerTotal}
                />
                <HandArea
                  label="Player"
                  theme={theme}
                  cards={blackjackState.playerHand}
                  showScore={blackjackState.playerHand.length > 0}
                  total={playerTotal}
                  cardsOnFire={naturalBjFire}
                />
              </div>

              <div className={`theme-transition relative z-20 shrink-0 pt-2 pb-2 pb-safe border-t -mx-2 px-2 mt-1 space-y-2 ${theme.actionDock}`}>
                {canBet && (
                  <GoldButton theme={theme} onClick={placeBet} disabled={playerMoney < currentBet || blackjackBusy} variant="felt" action>
                    Deal · {formatMoney(currentBet)}
                  </GoldButton>
                )}
                {playerTurn && (
                  <>
                    <div className="grid grid-cols-2 gap-2">
                      <GoldButton theme={theme} onClick={hit} disabled={blackjackBusy} action>Hit</GoldButton>
                      <GoldButton theme={theme} onClick={stand} disabled={blackjackBusy} variant="secondary" action>Stand</GoldButton>
                    </div>
                    <GoldButton
                      theme={theme}
                      onClick={doubleDown}
                      disabled={
                        blackjackBusy ||
                        blackjackState.playerHand.length !== 2 ||
                        playerMoney < blackjackState.activeBet
                      }
                      dense
                    >
                      Double Down
                    </GoldButton>
                  </>
                )}
                {dealerTurn && (
                  <p className={`text-center text-xs py-2 animate-pulse font-medium ${theme.label}`}>Dealer drawing…</p>
                )}
                {resolved && (
                  <GoldButton theme={theme} onClick={newHand} variant="secondary" action>New Hand</GoldButton>
                )}
              </div>
            </GlassPanel>
          )}

          {currentTab === 'slots' && (
            <GlassPanel
              theme={theme}
              className={`p-1.5 ring-1 ${theme.ring} flex flex-col flex-1 min-h-0 overflow-hidden`}
            >
              <div className="flex-1 min-h-0 flex items-stretch justify-center py-0.5">
                <SlotMatrix
                  theme={theme}
                  grid={slotsState.grid}
                  spinning={slotsState.isSpinning}
                  columnAnims={slotsState.columnAnims}
                  stoppedColumns={slotsState.stoppedColumns}
                  activeWins={slotsState.activeWins}
                  infernoPhase={slotsState.infernoPhase}
                  burningCells={slotsState.burningCells}
                  onCellHeight={handleSlotsCellHeight}
                />
              </div>

              <p
                className={`shrink-0 text-center font-bold tabular-nums py-1.5 px-1 min-h-[2.25rem] flex items-center justify-center ${
                  slotsState.persistentWinMessage && !slotsState.isSpinning && !slotsResolving
                    ? 'text-base text-fire-win'
                    : slotsState.isSpinning || slotsResolving
                      ? `text-xs animate-pulse ${theme.label}`
                      : 'text-xs text-zinc-500'
                }`}
              >
                {slotsWinDisplay}
              </p>

              <div className={`shrink-0 rounded-xl px-2 py-1.5 space-y-1.5 ${theme.actionDock}`}>
                <GlassPanel theme={theme} className={`px-2 py-1.5 flex items-center gap-1.5 ${theme.wagerControl}`}>
                  <span className={`text-[9px] uppercase tracking-wider shrink-0 ${theme.muted}`}>Bet</span>
                  <button
                    type="button"
                    onClick={() => adjustBet(-minBet)}
                    className={`theme-transition w-9 h-9 rounded-lg border btn-premium text-sm font-bold shrink-0 ${theme.wagerControl}`}
                  >
                    −
                  </button>
                  <span className={`flex-1 text-center font-bold tabular-nums text-sm ${theme.money}`}>
                    {formatMoney(currentBet)}
                  </span>
                  <button
                    type="button"
                    onClick={() => adjustBet(minBet)}
                    className={`theme-transition w-9 h-9 rounded-lg border btn-premium text-sm font-bold shrink-0 ${theme.wagerControl}`}
                  >
                    +
                  </button>
                </GlassPanel>

                {wagerJumps.length > 0 && (
                  <div className="flex flex-wrap gap-1 justify-center">
                    {wagerJumps.map((jump) => (
                      <button
                        key={jump.amount}
                        type="button"
                        onClick={() => setWagerJump(jump.amount)}
                        disabled={slotsState.isSpinning || slotsResolving}
                        className={`theme-transition px-2 py-1 rounded-lg border text-[10px] font-bold tabular-nums btn-premium disabled:opacity-40 ${theme.wagerControl} ${
                          currentBet === jump.amount ? 'ring-1 ring-orange-400/70' : ''
                        }`}
                      >
                        {jump.label}
                      </button>
                    ))}
                  </div>
                )}

                <GoldButton
                  theme={theme}
                  onClick={spinSlots}
                  disabled={slotsState.isSpinning || slotsResolving || playerMoney < currentBet}
                  action
                  className={
                    currentStage === 3 ? 'shadow-[0_0_30px_rgba(212,175,55,0.4)]' : ''
                  }
                >
                  {slotsState.isSpinning
                    ? 'SPINNING…'
                    : slotsResolving
                      ? 'INFERNO…'
                      : `Spin · ${formatMoney(currentBet)}`}
                </GoldButton>
              </div>
            </GlassPanel>
          )}

          {currentTab === 'shop' && (
            <section className="space-y-3">
              <h2 className={`text-center font-display text-base font-bold ${theme.title}`}>
                Concierge Shop
              </h2>
              <p className={`text-center text-[10px] tracking-widest uppercase -mt-1 mb-2 ${theme.muted}`}>
                Acquire strategic assets
              </p>
              {(
                [
                  {
                    key: 'hustler' as UpgradeKey,
                    name: stage.shopNames.hustler,
                    desc: `+${UPGRADE_BASE.hustler.income} passive income per level`,
                    tier: 'standard' as const,
                  },
                  {
                    key: 'ownership' as UpgradeKey,
                    name: stage.shopNames.ownership,
                    desc: 'Exponential empire revenue multiplier',
                    tier: 'standard' as const,
                  },
                  {
                    key: 'hftBot' as UpgradeKey,
                    name: 'High-Frequency Trading Bot',
                    desc: 'Compounds passive revenue — +3% compound per level',
                    tier: 'premium' as const,
                  },
                  {
                    key: 'offshore' as UpgradeKey,
                    name: 'Offshore Banking License',
                    desc: `Multiplies all passive income by ${OFFSHORE_PASSIVE_MULT}× (one-time)`,
                    tier: 'premium' as const,
                  },
                  {
                    key: 'megaResort' as UpgradeKey,
                    name: 'Mega-Resort Casino Acquisition',
                    desc: `+${formatMoney(UPGRADE_BASE.megaResort.income)}/s baseline per level — endgame empire asset`,
                    tier: 'elite' as const,
                  },
                ] as const
              ).map((item) => {
                const owned = upgradesBought[item.key];
                const cost = upgradeCost(item.key);
                const isOneTime = item.key === 'offshore';
                const acquired = isOneTime ? owned > 0 : owned > 0;
                const disabled = playerMoney < cost || (isOneTime && owned > 0);
                const elite = item.tier === 'elite';
                return (
                  <GlassPanel
                    theme={theme}
                    key={item.key}
                    glow={elite ? 'shadow-[0_0_28px_rgba(212,175,55,0.25)]' : undefined}
                    className={`p-4 ${elite ? 'ring-1 ring-gold/40 bg-gradient-to-br from-gold/5 to-transparent' : ''}`}
                  >
                    <div className="flex justify-between items-start gap-2 mb-2">
                      <div>
                        <h3 className={`font-semibold text-sm ${theme.money}`}>{item.name}</h3>
                        <p className={`text-[11px] mt-0.5 ${theme.muted}`}>{item.desc}</p>
                      </div>
                      <span className="text-[10px] text-zinc-600 tabular-nums">
                        {isOneTime ? (owned > 0 ? '✓' : '—') : `×${owned}`}
                      </span>
                    </div>
                    <GoldButton
                      theme={theme}
                      onClick={() => buyUpgrade(item.key)}
                      disabled={disabled}
                      acquired={acquired && disabled}
                    >
                      {acquired && disabled
                        ? isOneTime
                          ? '◆ BRANDED ◆'
                          : `◆ OWNED ×${owned} ◆`
                        : `Acquire · ${formatMoney(cost)}`}
                    </GoldButton>
                  </GlassPanel>
                );
              })}
            </section>
          )}

          {currentTab === 'empire' && (
            <section className="space-y-3">
              <h2 className={`text-center font-display text-base font-bold ${theme.title}`}>
                Empire Overview
              </h2>
              <GlassPanel theme={theme} className="p-5 text-center">
                <p className={`text-[10px] uppercase tracking-[0.3em] ${theme.muted}`}>Net Worth</p>
                <p className={`text-4xl font-bold tabular-nums mt-1 ${theme.money}`}>
                  {formatMoney(playerMoney)}
                </p>
                <div className="mt-3 pt-3 border-t border-white/10">
                  <p className="text-xs text-emerald-400/90">
                    Passive yield · {formatMoney(passiveIncomeRate)}/sec
                  </p>
                </div>
              </GlassPanel>
              <GlassPanel theme={theme} className="p-4">
                <h3 className={`text-xs uppercase tracking-widest mb-3 ${theme.label}`}>Venues</h3>
                {STAGES.map((s, idx) => {
                  const unlocked = lifetimePeakMoney >= s.unlockCost;
                  const active = currentStage === idx;
                  return (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => selectStage(idx)}
                      disabled={!unlocked}
                      className={`w-full text-left p-3 mb-2 rounded-xl border transition-all btn-premium ${
                        active
                          ? `border-current/50 ${s.theme.navActive}`
                          : 'border-white/10 bg-white/[0.02]'
                      } ${unlocked ? 'opacity-100' : 'opacity-40'} disabled:cursor-not-allowed`}
                    >
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-semibold text-gold-light/90">{s.name}</span>
                        {unlocked ? (
                          <span className="text-[9px] text-emerald-400 tracking-wider">OPEN</span>
                        ) : (
                          <span className="text-[9px] text-gold/60">
                            LOCKED · {formatMoney(s.unlockCost)}
                          </span>
                        )}
                      </div>
                      <p className="text-[10px] text-zinc-600 mt-1">
                        Min {formatMoney(s.minBet)} · 3×5 matrix · {SLOT_SYMBOLS.length} symbols
                      </p>
                    </button>
                  );
                })}
              </GlassPanel>
              <GlassPanel theme={theme} className="p-4">
                <h3 className={`text-xs uppercase tracking-widest mb-2 ${theme.label}`}>Portfolio</h3>
                <ul className="text-xs text-zinc-400 space-y-1.5">
                  <li className="flex justify-between">
                    <span>{stage.shopNames.hustler}</span>
                    <span className="text-gold/80">{upgradesBought.hustler}</span>
                  </li>
                  <li className="flex justify-between">
                    <span>{stage.shopNames.ownership}</span>
                    <span className="text-gold/80">{upgradesBought.ownership}</span>
                  </li>
                  <li className="flex justify-between">
                    <span>HFT Trading Bot</span>
                    <span className="text-gold/80">{upgradesBought.hftBot}</span>
                  </li>
                  <li className="flex justify-between">
                    <span>Offshore Banking</span>
                    <span className="text-gold/80">
                      {upgradesBought.offshore > 0 ? `${OFFSHORE_PASSIVE_MULT}×` : '—'}
                    </span>
                  </li>
                  <li className="flex justify-between">
                    <span>Mega-Resort Acquisition</span>
                    <span className="text-gold/80">{upgradesBought.megaResort}</span>
                  </li>
                </ul>
              </GlassPanel>
            </section>
          )}
        </div>
      </main>

      <nav className={`theme-transition shrink-0 pb-safe px-safe border-t ${theme.nav}`}>
        <div className="grid grid-cols-4">
          {navItems.map((item) => {
            const active = currentTab === item.tab;
            return (
              <button
                key={item.tab}
                type="button"
                onClick={() => setCurrentTab(item.tab)}
                className={`theme-transition flex flex-col items-center py-2.5 btn-premium ${
                  active ? theme.navActive : theme.navInactive
                }`}
              >
                <span className="text-lg leading-none font-display">{item.icon}</span>
                <span className="text-[9px] mt-1 font-medium tracking-wide uppercase">
                  {item.label}
                </span>
              </button>
            );
          })}
        </div>
      </nav>

      {stageModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-md p-4 pt-safe pb-safe">
          <div className={`theme-transition rounded-xl p-[1px] max-w-sm w-full animate-modal-flash ${theme.modalWrap} ${theme.btnGlow}`}>
            <div className={`rounded-[11px] p-6 text-center ${theme.panel}`}>
              <p className={`text-[10px] tracking-[0.4em] uppercase ${theme.muted}`}>Achievement</p>
              <h2 className={`font-display text-2xl font-bold mt-2 ${theme.title}`}>
                Stage Unlocked
              </h2>
              <div className={`my-4 w-16 h-16 mx-auto rounded-full border-2 flex items-center justify-center text-2xl ${theme.scoreBadge}`}>
                ♛
              </div>
              <p className={`text-lg font-semibold ${theme.money}`}>{stageModal.name}</p>
              <p className={`text-xs mt-2 ${theme.muted}`}>
                Minimum wager {formatMoney(stageModal.minBet)} · 3×5 matrix active
              </p>
              <div className="mt-6">
                <GoldButton theme={theme} onClick={() => setStageModal(null)}>Enter the Floor</GoldButton>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
