/** Minimal cabinet chrome — no per-cell styling, uniform reel backdrop */

export interface SlotCabinetStyle {
  shell: string;
  gridWindow: string;
  progressBar: string;
  badge: string;
}

const MINIMAL: SlotCabinetStyle = {
  shell: 'bg-zinc-900 border-zinc-700',
  gridWindow: 'bg-slate-950',
  progressBar: 'from-amber-600 to-amber-500',
  badge: 'text-zinc-500',
};

export const SLOT_CABINET_BY_STAGE: SlotCabinetStyle[] = [MINIMAL, MINIMAL, MINIMAL, MINIMAL];
