import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

// ─── Types ───────────────────────────────────────────────────────────────────

type Tab = 'blackjack' | 'slots' | 'shop' | 'empire';
type GameStatus = 'betting' | 'player-turn' | 'dealer-turn' | 'resolved';
type Rank = '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | '10' | 'J' | 'Q' | 'K' | 'A';
type Suit = '♠' | '♥' | '♦' | '♣';

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

interface SlotsState {
  reels: [string, string, string];
  isSpinning: boolean;
  slotResultMessage: string;
}

type UpgradeKey = 'hustler' | 'lens' | 'ownership';

interface UpgradesBought {
  hustler: number;
  lens: number;
  ownership: number;
}

interface StageConfig {
  id: number;
  name: string;
  unlockCost: number;
  minBet: number;
  symbols: [string, string, string];
  theme: {
    bg: string;
    panel: string;
    accent: string;
    text: string;
    border: string;
    glow: string;
    nav: string;
    navActive: string;
    gradient: string;
  };
  shopNames: {
    hustler: string;
    lens: string;
    ownership: string;
  };
}

interface FloatMessage {
  id: number;
  text: string;
  positive: boolean;
}

// ─── Constants ─────────────────────────────────────────────────────────────────

const RANKS: Rank[] = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];
const SUITS: Suit[] = ['♠', '♥', '♦', '♣'];
const DECK_COUNT = 6;
const HIGH_RANKS: Rank[] = ['10', 'J', 'Q', 'K', 'A'];

const STAGES: StageConfig[] = [
  {
    id: 0,
    name: 'The Back Alley',
    unlockCost: 0,
    minBet: 5,
    symbols: ['❌', '💰', '🪙'],
    theme: {
      bg: 'bg-zinc-900',
      panel: 'bg-zinc-800/90 border-zinc-600',
      accent: 'text-amber-600',
      text: 'text-zinc-100',
      border: 'border-zinc-500',
      glow: 'shadow-[0_0_20px_rgba(113,63,18,0.5)]',
      nav: 'bg-zinc-950 border-zinc-700',
      navActive: 'bg-amber-900/60 text-amber-400 border-amber-700',
      gradient: 'from-zinc-800 via-zinc-900 to-stone-950',
    },
    shopNames: {
      hustler: 'Street Hustler',
      lens: 'Card Counting Lens',
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
      bg: 'bg-indigo-950',
      panel: 'bg-indigo-900/80 border-purple-500/50',
      accent: 'text-fuchsia-400',
      text: 'text-indigo-50',
      border: 'border-purple-400',
      glow: 'shadow-[0_0_30px_rgba(168,85,247,0.7)] animate-pulse-glow',
      nav: 'bg-indigo-950 border-purple-800',
      navActive: 'bg-purple-900/70 text-fuchsia-300 border-fuchsia-500',
      gradient: 'from-indigo-950 via-purple-950 to-indigo-900',
    },
    shopNames: {
      hustler: 'Auto Slot-Bot',
      lens: "Dealer's Leak",
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
      bg: 'bg-emerald-950',
      panel: 'bg-emerald-900/70 border-amber-700/60',
      accent: 'text-amber-400',
      text: 'text-emerald-50',
      border: 'border-amber-600/70',
      glow: 'shadow-[0_0_25px_rgba(180,83,9,0.5)]',
      nav: 'bg-emerald-950 border-amber-900',
      navActive: 'bg-emerald-800/80 text-amber-300 border-amber-500',
      gradient: 'from-emerald-950 via-emerald-900 to-stone-900',
    },
    shopNames: {
      hustler: 'Auto Slot-Bot',
      lens: "Dealer's Leak",
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
      bg: 'bg-black',
      panel: 'bg-zinc-900/90 border-yellow-500/40',
      accent: 'text-yellow-400',
      text: 'text-yellow-50',
      border: 'border-yellow-500/50',
      glow: 'shadow-[0_0_35px_rgba(234,179,8,0.6)]',
      nav: 'bg-black border-yellow-700/50',
      navActive: 'bg-yellow-900/30 text-yellow-300 border-yellow-500',
      gradient: 'from-black via-zinc-950 to-amber-950',
    },
    shopNames: {
      hustler: 'Auto Slot-Bot',
      lens: "Dealer's Leak",
      ownership: 'Casino Ownership Share',
    },
  },
];

const UPGRADE_BASE = {
  hustler: { cost: 75, income: 2 },
  lens: { cost: 350 },
  ownership: { cost: 2500, income: 15 },
};

// ─── Audio (Web Audio API) ─────────────────────────────────────────────────────

let audioCtx: AudioContext | null = null;

function getAudio(): AudioContext {
  if (!audioCtx) {
    audioCtx = new AudioContext();
  }
  if (audioCtx.state === 'suspended') {
    void audioCtx.resume();
  }
  return audioCtx;
}

function playCardDeal(): void {
  const ctx = getAudio();
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = 'square';
  osc.frequency.setValueAtTime(180, ctx.currentTime);
  osc.frequency.exponentialRampToValueAtTime(520, ctx.currentTime + 0.08);
  gain.gain.setValueAtTime(0.12, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.1);
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start();
  osc.stop(ctx.currentTime + 0.1);
}

function playSlotClick(): void {
  const ctx = getAudio();
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = 'triangle';
  osc.frequency.setValueAtTime(800 + Math.random() * 200, ctx.currentTime);
  gain.gain.setValueAtTime(0.06, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.04);
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start();
  osc.stop(ctx.currentTime + 0.04);
}

function playWinChime(): void {
  const ctx = getAudio();
  const notes = [523.25, 659.25, 783.99, 1046.5];
  notes.forEach((freq, i) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    const t = ctx.currentTime + i * 0.1;
    osc.frequency.setValueAtTime(freq, t);
    gain.gain.setValueAtTime(0, t);
    gain.gain.linearRampToValueAtTime(0.15, t + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.35);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(t);
    osc.stop(t + 0.35);
  });
}

function playLossBuzz(): void {
  const ctx = getAudio();
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  const filter = ctx.createBiquadFilter();
  osc.type = 'sawtooth';
  osc.frequency.setValueAtTime(220, ctx.currentTime);
  osc.frequency.exponentialRampToValueAtTime(60, ctx.currentTime + 0.4);
  filter.type = 'lowpass';
  filter.frequency.setValueAtTime(400, ctx.currentTime);
  filter.frequency.linearRampToValueAtTime(80, ctx.currentTime + 0.4);
  gain.gain.setValueAtTime(0.18, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.45);
  osc.connect(filter);
  filter.connect(gain);
  gain.connect(ctx.destination);
  osc.start();
  osc.stop(ctx.currentTime + 0.45);
}

// ─── Card utilities ────────────────────────────────────────────────────────────

function createShoe(): Card[] {
  const deck: Card[] = [];
  for (let d = 0; d < DECK_COUNT; d++) {
    for (const suit of SUITS) {
      for (const rank of RANKS) {
        deck.push({ rank, suit });
      }
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
  if (d.length < 15) {
    d = createShoe();
  }
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
  const isSoft = aces > 0 && total <= 21;
  const isBlackjack = cards.length === 2 && total === 21;
  return { total, isSoft, isBlackjack };
}

function isHighCard(card: Card): boolean {
  return HIGH_RANKS.includes(card.rank);
}

function highCardPercent(deck: Card[]): number {
  if (deck.length === 0) return 0;
  const high = deck.filter(isHighCard).length;
  return Math.round((high / deck.length) * 1000) / 10;
}

function cardLabel(card: Card): string {
  return `${card.rank}${card.suit}`;
}

function cardColor(card: Card): string {
  return card.suit === '♥' || card.suit === '♦' ? 'text-red-500' : 'text-white';
}

function formatMoney(n: number): string {
  return n >= 1_000_000
    ? `$${(n / 1_000_000).toFixed(2)}M`
    : n >= 10_000
      ? `$${(n / 1000).toFixed(1)}K`
      : `$${Math.floor(n).toLocaleString()}`;
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
    resultMessage: 'Place your bet to deal.',
    activeBet: 0,
    doubled: false,
    dealerHoleHidden: true,
  };
}

function initialSlots(symbols: [string, string, string]): SlotsState {
  return {
    reels: [...symbols] as [string, string, string],
    isSpinning: false,
    slotResultMessage: 'Set your bet and spin!',
  };
}

// ─── App ───────────────────────────────────────────────────────────────────────

export default function App() {
  const [playerMoney, setPlayerMoney] = useState(100);
  const [currentBet, setCurrentBet] = useState(5);
  const [passiveIncomeRate, setPassiveIncomeRate] = useState(0);
  const [blackjackState, setBlackjackState] = useState<BlackjackState>(initialBlackjack);
  const [slotsState, setSlotsState] = useState<SlotsState>(() => initialSlots(STAGES[0].symbols));
  const [currentTab, setCurrentTab] = useState<Tab>('blackjack');
  const [currentStage, setCurrentStage] = useState(0);
  const [upgradesBought, setUpgradesBought] = useState<UpgradesBought>({
    hustler: 0,
    lens: 0,
    ownership: 0,
  });
  const [stageModal, setStageModal] = useState<StageConfig | null>(null);
  const [floatMessages, setFloatMessages] = useState<FloatMessage[]>([]);
  const [winFlash, setWinFlash] = useState(false);
  const [lossShake, setLossShake] = useState(false);
  const floatId = useRef(0);
  const prevUnlocked = useRef(0);
  const slotIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const slotSpinSoundRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const stage = STAGES[currentStage];
  const minBet = stage.minBet;

  const recalcPassive = useCallback((upgrades: UpgradesBought, stageIdx: number) => {
    const stageMult = 1 + stageIdx * 0.5;
    const hustlerIncome = upgrades.hustler * UPGRADE_BASE.hustler.income * stageMult;
    const ownershipIncome = upgrades.ownership
      ? UPGRADE_BASE.ownership.income * Math.pow(2, upgrades.ownership) * stageMult
      : 0;
    return hustlerIncome + ownershipIncome;
  }, []);

  useEffect(() => {
    setPassiveIncomeRate(recalcPassive(upgradesBought, currentStage));
  }, [upgradesBought, currentStage, recalcPassive]);

  useEffect(() => {
    if (passiveIncomeRate <= 0) return;
    const id = setInterval(() => {
      setPlayerMoney((m) => m + passiveIncomeRate);
    }, 1000);
    return () => clearInterval(id);
  }, [passiveIncomeRate]);

  useEffect(() => {
    const unlocked = getUnlockedStage(playerMoney);
    if (unlocked > prevUnlocked.current) {
      setCurrentStage(unlocked);
      setStageModal(STAGES[unlocked]);
      setSlotsState((s) => ({
        ...s,
        reels: [...STAGES[unlocked].symbols] as [string, string, string],
        slotResultMessage: 'New venue unlocked! Spin the reels.',
      }));
      if (currentBet < STAGES[unlocked].minBet) {
        setCurrentBet(STAGES[unlocked].minBet);
      }
    }
    prevUnlocked.current = unlocked;
  }, [playerMoney, currentBet]);

  useEffect(() => {
    if (currentBet < minBet) setCurrentBet(minBet);
  }, [minBet, currentBet]);

  useEffect(() => {
    return () => {
      if (slotIntervalRef.current) clearInterval(slotIntervalRef.current);
      if (slotSpinSoundRef.current) clearInterval(slotSpinSoundRef.current);
    };
  }, []);

  const addFloat = useCallback((text: string, positive: boolean) => {
    const id = ++floatId.current;
    setFloatMessages((prev) => [...prev, { id, text, positive }]);
    setTimeout(() => {
      setFloatMessages((prev) => prev.filter((m) => m.id !== id));
    }, 1200);
  }, []);

  const feedbackWin = useCallback(
    (amount: number) => {
      playWinChime();
      setWinFlash(true);
      setTimeout(() => setWinFlash(false), 600);
      addFloat(`+${formatMoney(amount)}`, true);
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

  const upgradeCost = (key: UpgradeKey): number => {
    const base = UPGRADE_BASE[key].cost;
    const count = upgradesBought[key];
    const stageMult = 1 + currentStage * 0.35;
    return Math.floor(base * Math.pow(1.5, count) * stageMult);
  };

  const buyUpgrade = (key: UpgradeKey) => {
    const cost = upgradeCost(key);
    if (playerMoney < cost) return;
    if (key === 'lens' && upgradesBought.lens > 0) return;
    setPlayerMoney((m) => m - cost);
    setUpgradesBought((u) => ({ ...u, [key]: u[key] + 1 }));
    playWinChime();
  };

  const highCardPct = useMemo(
    () => (upgradesBought.lens > 0 ? highCardPercent(blackjackState.deck) : null),
    [upgradesBought.lens, blackjackState.deck],
  );

  const resolveBlackjack = useCallback(
    (
      playerHand: Card[],
      dealerHand: Card[],
      _deck: Card[],
      bet: number,
      playerNatural: boolean,
      dealerNatural: boolean,
    ): { message: string; payout: number } => {
      const pv = handValue(playerHand);
      const dv = handValue(dealerHand);

      if (playerNatural && dealerNatural) {
        return { message: 'Push — both Blackjack!', payout: bet };
      }
      if (playerNatural) {
        return { message: 'Blackjack! Pays 3:2', payout: bet + bet * 1.5 };
      }
      if (dealerNatural) {
        return { message: 'Dealer Blackjack — you lose.', payout: 0 };
      }
      if (pv.total > 21) {
        return { message: `Bust (${pv.total}) — you lose.`, payout: 0 };
      }
      if (dv.total > 21) {
        return { message: `Dealer busts (${dv.total}) — you win!`, payout: bet * 2 };
      }
      if (pv.total > dv.total) {
        return { message: `You win ${pv.total} vs ${dv.total}!`, payout: bet * 2 };
      }
      if (pv.total < dv.total) {
        return { message: `Dealer wins ${dv.total} vs ${pv.total}.`, payout: 0 };
      }
      return { message: `Push at ${pv.total}.`, payout: bet };
    },
    [],
  );

  const finishRound = useCallback(
    (playerHand: Card[], dealerHand: Card[], deck: Card[], bet: number) => {
      const pv = handValue(playerHand);
      const dv = handValue(dealerHand);
      const playerNatural = pv.isBlackjack;
      const dealerNatural = dv.isBlackjack;
      const { message, payout } = resolveBlackjack(
        playerHand,
        dealerHand,
        deck,
        bet,
        playerNatural,
        dealerNatural,
      );
      const net = payout - bet;
      if (net > 0) feedbackWin(net);
      else if (net < 0) feedbackLoss(bet);
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
    },
    [resolveBlackjack, feedbackWin, feedbackLoss],
  );

  const dealerPlay = useCallback(
    (playerHand: Card[], dealerHand: Card[], deck: Card[], bet: number) => {
      let dHand = [...dealerHand];
      let dDeck = [...deck];
      let dv = handValue(dHand);
      while (dv.total < 17 || (dv.total === 17 && dv.isSoft)) {
        const drawn = drawCard(dDeck);
        dHand = [...dHand, drawn.card];
        dDeck = drawn.deck;
        dv = handValue(dHand);
      }
      finishRound(playerHand, dHand, dDeck, bet);
    },
    [finishRound],
  );

  const placeBet = () => {
    if (blackjackState.gameStatus !== 'betting') return;
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
        deck,
        bet,
        pv.isBlackjack,
        dv.isBlackjack,
      );
      const net = payout - bet;
      if (net > 0) feedbackWin(net);
      else if (net < 0) feedbackLoss(bet);
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
      resultMessage: 'Your move — Hit, Stand, or Double.',
      activeBet: bet,
      doubled: false,
      dealerHoleHidden: true,
    });
  };

  const hit = () => {
    if (blackjackState.gameStatus !== 'player-turn') return;
    const bet = blackjackState.activeBet;
    let deck = [...blackjackState.deck];
    const drawn = drawCard(deck);
    playCardDeal();
    const playerHand = [...blackjackState.playerHand, drawn.card];
    deck = drawn.deck;
    const pv = handValue(playerHand);
    if (pv.total > 21) {
      feedbackLoss(bet);
      setBlackjackState((s) => ({
        ...s,
        playerHand,
        deck,
        gameStatus: 'resolved',
        resultMessage: `Bust (${pv.total}) — you lose.`,
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
      dealerPlay(playerHand, blackjackState.dealerHand, deck, bet);
      return;
    }
    setBlackjackState((s) => ({
      ...s,
      playerHand,
      deck,
      resultMessage: `Hand: ${pv.total}. Hit or Stand?`,
    }));
  };

  const stand = () => {
    if (blackjackState.gameStatus !== 'player-turn') return;
    setBlackjackState((s) => ({
      ...s,
      gameStatus: 'dealer-turn',
      resultMessage: 'Dealer plays…',
      dealerHoleHidden: false,
    }));
    dealerPlay(
      blackjackState.playerHand,
      blackjackState.dealerHand,
      blackjackState.deck,
      blackjackState.activeBet,
    );
  };

  const doubleDown = () => {
    if (blackjackState.gameStatus !== 'player-turn') return;
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
      feedbackLoss(bet);
      setBlackjackState((s) => ({
        ...s,
        playerHand,
        deck,
        gameStatus: 'resolved',
        resultMessage: `Double Down bust (${pv.total})!`,
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
      resultMessage: 'Double Down — dealer plays…',
    }));
    dealerPlay(playerHand, blackjackState.dealerHand, deck, bet);
  };

  const newHand = () => {
    setBlackjackState((s) => ({
      ...initialBlackjack(),
      deck: s.deck.length > 20 ? s.deck : createShoe(),
    }));
  };

  const adjustBet = (delta: number) => {
    setCurrentBet((b) => Math.max(minBet, Math.min(playerMoney, b + delta)));
  };

  const spinSlots = () => {
    if (slotsState.isSpinning) return;
    const bet = currentBet;
    if (bet < minBet || playerMoney < bet) return;
    setPlayerMoney((m) => m - bet);
    setSlotsState((s) => ({ ...s, isSpinning: true, slotResultMessage: 'Spinning…' }));

    slotSpinSoundRef.current = setInterval(() => playSlotClick(), 80);

    const symbols = stage.symbols;
    let ticks = 0;
    const maxTicks = 19;

    slotIntervalRef.current = setInterval(() => {
      ticks++;
      setSlotsState((s) => ({
        ...s,
        reels: [
          symbols[Math.floor(Math.random() * 3)],
          symbols[Math.floor(Math.random() * 3)],
          symbols[Math.floor(Math.random() * 3)],
        ] as [string, string, string],
      }));
      if (ticks >= maxTicks) {
        if (slotIntervalRef.current) clearInterval(slotIntervalRef.current);
        if (slotSpinSoundRef.current) clearInterval(slotSpinSoundRef.current);

        const final: [string, string, string] = [
          symbols[Math.floor(Math.random() * 3)],
          symbols[Math.floor(Math.random() * 3)],
          symbols[Math.floor(Math.random() * 3)],
        ];
        const [a, b, c] = final;
        let payout = 0;
        let msg = 'No match — bet lost.';
        if (a === b && b === c) {
          payout = bet * 10;
          msg = `JACKPOT! Triple ${a} — ${formatMoney(payout)}!`;
        } else if (a === b || b === c || a === c) {
          payout = bet * 2;
          msg = `Two of a kind — ${formatMoney(payout)}!`;
        }
        const net = payout - bet;
        if (net > 0) {
          feedbackWin(net);
          setPlayerMoney((m) => m + payout);
        } else {
          feedbackLoss(bet);
        }
        setSlotsState({
          reels: final,
          isSpinning: false,
          slotResultMessage: msg,
        });
      }
    }, 79);
  };

  const selectStage = (idx: number) => {
    if (playerMoney < STAGES[idx].unlockCost) return;
    setCurrentStage(idx);
    setCurrentBet(Math.max(currentBet, STAGES[idx].minBet));
    setSlotsState((s) => ({
      ...s,
      reels: [...STAGES[idx].symbols] as [string, string, string],
    }));
  };

  const t = stage.theme;
  const canBet = blackjackState.gameStatus === 'betting';
  const playerTurn = blackjackState.gameStatus === 'player-turn';
  const resolved = blackjackState.gameStatus === 'resolved';

  return (
    <div
      className={`max-w-md mx-auto h-screen flex flex-col overflow-hidden bg-gradient-to-b ${t.gradient} ${winFlash ? 'animate-flash-win' : ''} ${lossShake ? 'animate-shake-loss' : ''}`}
    >
      {/* Header */}
      <header className={`shrink-0 px-4 pt-3 pb-2 border-b ${t.border} ${t.panel}`}>
        <div className="flex items-center justify-between">
          <div>
            <h1 className={`text-sm font-bold tracking-wider uppercase ${t.accent}`}>
              Casino Tycoon
            </h1>
            <p className={`text-xs opacity-80 ${t.text}`}>{stage.name}</p>
          </div>
          <div className="text-right">
            <p className={`text-lg font-black tabular-nums ${t.accent}`}>
              {formatMoney(playerMoney)}
            </p>
            {passiveIncomeRate > 0 && (
              <p className="text-[10px] text-green-400">+{formatMoney(passiveIncomeRate)}/s</p>
            )}
          </div>
        </div>
        <div className="mt-2 flex items-center gap-2">
          <span className={`text-[10px] ${t.text} opacity-70`}>Bet:</span>
          <button
            type="button"
            onClick={() => adjustBet(-minBet)}
            className={`w-7 h-7 rounded-full border ${t.border} text-xs font-bold ${t.text} active:scale-95`}
          >
            −
          </button>
          <span className={`flex-1 text-center font-bold tabular-nums ${t.accent}`}>
            {formatMoney(currentBet)}
          </span>
          <button
            type="button"
            onClick={() => adjustBet(minBet)}
            className={`w-7 h-7 rounded-full border ${t.border} text-xs font-bold ${t.text} active:scale-95`}
          >
            +
          </button>
          <span className={`text-[10px] opacity-60 ${t.text}`}>min {formatMoney(minBet)}</span>
        </div>
      </header>

      {/* Main content */}
      <main className={`flex-1 overflow-y-auto px-3 py-3 relative ${t.bg}`}>
        {floatMessages.map((fm) => (
          <div
            key={fm.id}
            className={`pointer-events-none absolute left-1/2 -translate-x-1/2 z-50 font-black text-lg animate-float-up ${
              fm.positive ? 'text-green-400' : 'text-red-500'
            }`}
            style={{ top: '30%' }}
          >
            {fm.text}
          </div>
        ))}

        {currentTab === 'blackjack' && (
          <section className={`rounded-2xl border p-3 ${t.panel} ${t.glow}`}>
            <h2 className={`text-center font-bold mb-2 ${t.accent}`}>🃏 Blackjack Pro</h2>
            {highCardPct !== null && (
              <p className="text-center text-xs text-cyan-300 mb-2">
                High cards remaining: <span className="font-bold">{highCardPct}%</span>
              </p>
            )}
            <p className={`text-center text-xs mb-3 ${t.text} opacity-90`}>
              {blackjackState.resultMessage}
            </p>

            <div className="mb-3">
              <p className={`text-xs mb-1 ${t.text} opacity-70`}>Dealer</p>
              <div className="flex flex-wrap gap-1.5 justify-center min-h-[52px]">
                {blackjackState.dealerHand.map((card, i) => (
                  <div
                    key={`d-${i}`}
                    className={`w-10 h-14 rounded-lg border-2 flex items-center justify-center text-sm font-bold bg-white/10 ${
                      blackjackState.dealerHoleHidden && i === 1
                        ? 'bg-zinc-700 border-zinc-500'
                        : t.border
                    }`}
                  >
                    {blackjackState.dealerHoleHidden && i === 1 ? (
                      <span className="text-zinc-400">?</span>
                    ) : (
                      <span className={cardColor(card)}>{cardLabel(card)}</span>
                    )}
                  </div>
                ))}
              </div>
              {!blackjackState.dealerHoleHidden && blackjackState.dealerHand.length > 0 && (
                <p className={`text-center text-xs mt-1 ${t.accent}`}>
                  {handValue(blackjackState.dealerHand).total}
                </p>
              )}
            </div>

            <div className="mb-3">
              <p className={`text-xs mb-1 ${t.text} opacity-70`}>You</p>
              <div className="flex flex-wrap gap-1.5 justify-center min-h-[52px]">
                {blackjackState.playerHand.map((card, i) => (
                  <div
                    key={`p-${i}`}
                    className={`w-10 h-14 rounded-lg border-2 flex items-center justify-center text-sm font-bold bg-white/10 ${t.border}`}
                  >
                    <span className={cardColor(card)}>{cardLabel(card)}</span>
                  </div>
                ))}
              </div>
              {blackjackState.playerHand.length > 0 && (
                <p className={`text-center text-xs mt-1 font-bold ${t.accent}`}>
                  {handValue(blackjackState.playerHand).total}
                </p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-2">
              {canBet && (
                <button
                  type="button"
                  onClick={placeBet}
                  disabled={playerMoney < currentBet}
                  className={`col-span-2 py-3 rounded-xl font-bold bg-green-700 text-white active:scale-95 disabled:opacity-40`}
                >
                  Deal — {formatMoney(currentBet)}
                </button>
              )}
              {playerTurn && (
                <>
                  <button
                    type="button"
                    onClick={hit}
                    className="py-2.5 rounded-xl font-bold bg-blue-600 text-white active:scale-95"
                  >
                    Hit
                  </button>
                  <button
                    type="button"
                    onClick={stand}
                    className="py-2.5 rounded-xl font-bold bg-amber-600 text-white active:scale-95"
                  >
                    Stand
                  </button>
                  <button
                    type="button"
                    onClick={doubleDown}
                    disabled={
                      blackjackState.playerHand.length !== 2 ||
                      playerMoney < blackjackState.activeBet
                    }
                    className="col-span-2 py-2.5 rounded-xl font-bold bg-purple-700 text-white active:scale-95 disabled:opacity-40"
                  >
                    Double Down
                  </button>
                </>
              )}
              {resolved && (
                <button
                  type="button"
                  onClick={newHand}
                  className={`col-span-2 py-3 rounded-xl font-bold border-2 ${t.border} ${t.accent} active:scale-95`}
                >
                  New Hand
                </button>
              )}
            </div>
          </section>
        )}

        {currentTab === 'slots' && (
          <section className={`rounded-2xl border p-4 ${t.panel} ${t.glow}`}>
            <h2 className={`text-center font-bold mb-4 ${t.accent}`}>🎰 Underground Slots</h2>
            <div className="flex justify-center gap-2 mb-4">
              {slotsState.reels.map((sym, i) => (
                <div
                  key={i}
                  className={`w-20 h-24 rounded-xl border-2 flex items-center justify-center text-4xl bg-black/40 ${
                    slotsState.isSpinning ? 'animate-pulse scale-105' : ''
                  } ${t.border}`}
                >
                  {sym}
                </div>
              ))}
            </div>
            <p className={`text-center text-sm mb-4 min-h-[40px] ${t.text}`}>
              {slotsState.slotResultMessage}
            </p>
            <p className={`text-center text-[10px] mb-3 opacity-70 ${t.text}`}>
              3 match = 10× · 2 match = 2×
            </p>
            <button
              type="button"
              onClick={spinSlots}
              disabled={slotsState.isSpinning || playerMoney < currentBet}
              className={`w-full py-4 rounded-xl font-black text-lg bg-gradient-to-r from-pink-600 to-purple-700 text-white active:scale-95 disabled:opacity-40 ${
                currentStage === 3 ? 'animate-shimmer bg-[length:200%_auto] from-yellow-600 via-amber-400 to-yellow-600' : ''
              }`}
            >
              {slotsState.isSpinning ? 'SPINNING…' : `SPIN ${formatMoney(currentBet)}`}
            </button>
          </section>
        )}

        {currentTab === 'shop' && (
          <section className="space-y-3">
            <h2 className={`text-center font-bold ${t.accent}`}>🛒 Upgrade Shop</h2>
            {(
              [
                {
                  key: 'hustler' as UpgradeKey,
                  name: stage.shopNames.hustler,
                  desc: `+${UPGRADE_BASE.hustler.income} passive $/s per level (scales with stage)`,
                  icon: '🤖',
                },
                {
                  key: 'lens' as UpgradeKey,
                  name: stage.shopNames.lens,
                  desc: 'Reveals high-card % left in the blackjack shoe',
                  icon: '🔍',
                },
                {
                  key: 'ownership' as UpgradeKey,
                  name: stage.shopNames.ownership,
                  desc: 'Exponential passive income (doubles effect per buy)',
                  icon: '👑',
                },
              ] as const
            ).map((item) => {
              const owned = upgradesBought[item.key];
              const cost = upgradeCost(item.key);
              const isLens = item.key === 'lens';
              const disabled =
                playerMoney < cost || (isLens && owned > 0);
              return (
                <div
                  key={item.key}
                  className={`rounded-xl border p-3 ${t.panel} ${t.border}`}
                >
                  <div className="flex items-start gap-3">
                    <span className="text-2xl">{item.icon}</span>
                    <div className="flex-1 min-w-0">
                      <h3 className={`font-bold text-sm ${t.accent}`}>{item.name}</h3>
                      <p className={`text-[11px] opacity-80 ${t.text}`}>{item.desc}</p>
                      <p className="text-[10px] text-zinc-400 mt-1">Owned: {owned}</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => buyUpgrade(item.key)}
                    disabled={disabled}
                    className={`mt-2 w-full py-2 rounded-lg font-bold text-sm bg-green-700/90 text-white disabled:opacity-40 active:scale-95`}
                  >
                    {isLens && owned > 0
                      ? 'Purchased'
                      : `Buy — ${formatMoney(cost)}`}
                  </button>
                </div>
              );
            })}
          </section>
        )}

        {currentTab === 'empire' && (
          <section className="space-y-3">
            <h2 className={`text-center font-bold ${t.accent}`}>👑 Your Empire</h2>
            <div className={`rounded-xl border p-4 text-center ${t.panel} ${t.glow}`}>
              <p className={`text-3xl font-black ${t.accent}`}>{formatMoney(playerMoney)}</p>
              <p className={`text-sm mt-1 ${t.text}`}>Net Worth</p>
              <p className="text-green-400 text-sm mt-2 font-bold">
                Empire Income: {formatMoney(passiveIncomeRate)}/sec
              </p>
            </div>
            <div className={`rounded-xl border p-3 ${t.panel}`}>
              <h3 className={`font-bold text-sm mb-2 ${t.accent}`}>Venues</h3>
              {STAGES.map((s, idx) => {
                const unlocked = playerMoney >= s.unlockCost;
                const active = currentStage === idx;
                return (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => selectStage(idx)}
                    disabled={!unlocked}
                    className={`w-full text-left p-2.5 mb-2 rounded-lg border transition-all ${
                      active ? t.navActive : `${t.border} ${unlocked ? 'opacity-100' : 'opacity-40'}`
                    } disabled:cursor-not-allowed`}
                  >
                    <div className="flex justify-between items-center">
                      <span className={`text-sm font-bold ${t.text}`}>{s.name}</span>
                      {unlocked ? (
                        <span className="text-[10px] text-green-400">OPEN</span>
                      ) : (
                        <span className="text-[10px] text-amber-500">
                          🔒 {formatMoney(s.unlockCost)}
                        </span>
                      )}
                    </div>
                    <p className={`text-[10px] opacity-70 ${t.text}`}>
                      Min bet {formatMoney(s.minBet)} · {s.symbols.join(' ')}
                    </p>
                  </button>
                );
              })}
            </div>
            <div className={`rounded-xl border p-3 ${t.panel}`}>
              <h3 className={`font-bold text-sm mb-2 ${t.accent}`}>Assets Owned</h3>
              <ul className={`text-xs space-y-1 ${t.text}`}>
                <li>
                  {stage.shopNames.hustler}: {upgradesBought.hustler}
                </li>
                <li>
                  {stage.shopNames.lens}: {upgradesBought.lens > 0 ? 'Active' : '—'}
                </li>
                <li>
                  {stage.shopNames.ownership}: {upgradesBought.ownership}
                </li>
              </ul>
            </div>
          </section>
        )}
      </main>

      {/* Bottom nav */}
      <nav
        className={`shrink-0 grid grid-cols-4 border-t ${t.nav} safe-area-pb`}
      >
        {(
          [
            { tab: 'blackjack' as Tab, label: '🃏', sub: 'Cards' },
            { tab: 'slots' as Tab, label: '🎰', sub: 'Slots' },
            { tab: 'shop' as Tab, label: '🛒', sub: 'Shop' },
            { tab: 'empire' as Tab, label: '👑', sub: 'Empire' },
          ] as const
        ).map((item) => (
          <button
            key={item.tab}
            type="button"
            onClick={() => setCurrentTab(item.tab)}
            className={`flex flex-col items-center py-2.5 text-[10px] border-t-2 transition-colors ${
              currentTab === item.tab
                ? `${t.navActive} border-current`
                : `border-transparent opacity-60 ${t.text}`
            }`}
          >
            <span className="text-xl leading-none">{item.label}</span>
            <span className="mt-0.5 font-semibold">{item.sub}</span>
          </button>
        ))}
      </nav>

      {/* Stage unlock modal */}
      {stageModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div
            className={`max-w-sm w-full rounded-2xl border-2 border-yellow-400 p-6 text-center animate-modal-flash bg-gradient-to-br from-yellow-900 via-amber-800 to-black shadow-[0_0_60px_rgba(234,179,8,0.8)]`}
          >
            <p className="text-yellow-300 text-sm font-bold tracking-[0.3em] uppercase animate-pulse">
              ✨ Achievement ✨
            </p>
            <h2 className="text-3xl font-black text-yellow-400 mt-2 drop-shadow-lg">
              STAGE UNLOCKED!
            </h2>
            <p className="text-5xl my-4">🎉</p>
            <p className="text-xl font-bold text-white">{stageModal.name}</p>
            <p className="text-sm text-yellow-200/80 mt-2">
              Min bet: {formatMoney(stageModal.minBet)} · New symbols unlocked
            </p>
            <button
              type="button"
              onClick={() => setStageModal(null)}
              className="mt-6 w-full py-3 rounded-xl bg-yellow-500 text-black font-black text-lg active:scale-95"
            >
              Enter the Floor
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
