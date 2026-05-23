/** Steampunk industrial cabinet — blueprint obsidian shell */

export interface SlotCabinetStyle {
  shell: string;
  gridWindow: string;
  progressBar: string;
  badge: string;
}

const STEAMPUNK: SlotCabinetStyle = {
  shell: 'bg-[#0a0a0c] border-amber-800/40',
  gridWindow: 'blueprint-reel-window',
  progressBar: 'from-amber-700 via-amber-500 to-amber-800',
  badge: 'text-amber-600/90',
};

export const SLOT_CABINET_BY_STAGE: SlotCabinetStyle[] = [
  STEAMPUNK,
  STEAMPUNK,
  STEAMPUNK,
  STEAMPUNK,
];
