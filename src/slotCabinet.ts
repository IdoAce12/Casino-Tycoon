/** Stage-specific slot machine shell styling (cabinet frame + reel backdrop) */

export interface SlotCabinetStyle {
  shell: string;
  outerAura: string;
  gridWindow: string;
  reelCell: string;
  progressBar: string;
  badge: string;
  decorClass?: string;
}

export const SLOT_CABINET_BY_STAGE: SlotCabinetStyle[] = [
  {
    shell:
      'bg-gradient-to-b from-stone-700 via-zinc-800 to-stone-900 border-amber-900/60 shadow-[inset_0_2px_0_rgba(255,200,120,0.15),0_8px_24px_rgba(0,0,0,0.9)]',
    outerAura: 'from-amber-900/20 via-transparent to-stone-950/40',
    gridWindow:
      'bg-gradient-to-b from-zinc-900 via-stone-950 to-black border-amber-950/80 shadow-[inset_0_6px_20px_rgba(0,0,0,0.95)]',
    reelCell:
      'border-amber-950/70 bg-gradient-to-b from-zinc-800/90 to-zinc-950 shadow-[inset_0_3px_8px_rgba(0,0,0,0.85)]',
    progressBar: 'from-amber-700 via-amber-500 to-amber-800',
    badge: 'text-amber-500/90',
    decorClass: 'cabinet-flicker-bulbs',
  },
  {
    shell:
      'bg-gradient-to-b from-fuchsia-950 via-indigo-950 to-black border-cyan-400/50 shadow-[0_0_28px_rgba(217,70,239,0.35),inset_0_0_20px_rgba(34,211,238,0.08)]',
    outerAura: 'from-fuchsia-500/25 via-cyan-500/10 to-transparent animate-neon-cabinet-pulse',
    gridWindow:
      'bg-gradient-to-b from-indigo-950 via-purple-950 to-black border-fuchsia-400/40 shadow-[inset_0_0_30px_rgba(217,70,239,0.2)]',
    reelCell:
      'border-fuchsia-500/35 bg-gradient-to-b from-indigo-900/80 to-black shadow-[inset_0_0_12px_rgba(34,211,238,0.15)]',
    progressBar: 'from-cyan-400 via-fuchsia-500 to-pink-500',
    badge: 'text-cyan-300',
    decorClass: 'cabinet-neon-tubes',
  },
  {
    shell:
      'bg-gradient-to-b from-amber-950/50 via-emerald-950 to-emerald-950 border-amber-600/55 shadow-[inset_0_0_24px_rgba(13,79,60,0.5)]',
    outerAura: 'from-amber-700/15 via-emerald-900/20 to-transparent',
    gridWindow:
      'bg-gradient-to-b from-emerald-950 via-[#062e24] to-emerald-950 border-amber-700/45 shadow-[inset_0_8px_24px_rgba(0,0,0,0.75)]',
    reelCell:
      'border-amber-800/45 bg-gradient-to-b from-emerald-900/70 to-emerald-950 shadow-[inset_0_2px_6px_rgba(0,0,0,0.7)]',
    progressBar: 'from-amber-600 via-yellow-500 to-amber-700',
    badge: 'text-amber-300/90',
    decorClass: 'cabinet-brass-trim',
  },
  {
    shell:
      'bg-gradient-to-b from-zinc-900 via-black to-zinc-950 border-[#D4AF37]/65 shadow-[0_0_40px_rgba(212,175,55,0.35),inset_0_1px_0_rgba(255,255,255,0.12)]',
    outerAura: 'from-yellow-500/20 via-amber-600/10 to-transparent animate-royale-shimmer',
    gridWindow:
      'bg-gradient-to-b from-black via-zinc-950 to-black border-yellow-600/50 shadow-[inset_0_0_40px_rgba(212,175,55,0.15)]',
    reelCell:
      'border-yellow-700/40 bg-gradient-to-b from-zinc-900/90 to-black shadow-[inset_0_0_16px_rgba(212,175,55,0.12)]',
    progressBar: 'from-yellow-600 via-[#D4AF37] to-amber-500',
    badge: 'text-yellow-300',
    decorClass: 'cabinet-royale-particles',
  },
];
