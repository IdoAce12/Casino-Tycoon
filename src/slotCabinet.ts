/** Classic Vegas cabinet — uniform dark velvet reel window */

export interface SlotCabinetStyle {
  shell: string;
  gridWindow: string;
  progressBar: string;
  badge: string;
}

const CLASSIC_VEGAS: SlotCabinetStyle = {
  shell: 'bg-zinc-900/90 border-zinc-700/80',
  gridWindow: 'bg-slate-950',
  progressBar: 'from-amber-600 via-amber-400 to-amber-600',
  badge: 'text-amber-500/80',
};

export const SLOT_CABINET_BY_STAGE: SlotCabinetStyle[] = [
  CLASSIC_VEGAS,
  CLASSIC_VEGAS,
  CLASSIC_VEGAS,
  CLASSIC_VEGAS,
];
