export function buildWagerJumps(
  balance: number,
  minBet: number,
  stageIdx: number,
  formatMoney: (n: number) => string,
): { label: string; amount: number }[] {
  if (balance < minBet) return [];

  const stageScale = [1, 8, 80, 800][stageIdx] ?? 800;
  const multipliers = [1, 2, 5, 10, 25, 50, 100, 250, 500, 1000, 2500, 5000];

  const raw = multipliers
    .map((m) => Math.floor(minBet * m * Math.max(1, stageScale / 8)))
    .filter((a) => a >= minBet && a <= balance);

  const unique = [...new Set(raw)].sort((a, b) => a - b);
  if (unique.length === 0) {
    return [{ label: formatMoney(minBet), amount: minBet }];
  }

  if (unique.length <= 5) {
    return unique.map((amount) => ({ label: formatMoney(amount), amount }));
  }

  const picks: number[] = [];
  const slots = 5;
  for (let i = 0; i < slots; i++) {
    const idx = Math.round((i / (slots - 1)) * (unique.length - 1));
    picks.push(unique[idx]);
  }

  return [...new Set(picks)].map((amount) => ({ label: formatMoney(amount), amount }));
}
