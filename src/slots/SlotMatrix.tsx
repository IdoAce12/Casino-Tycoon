import { useEffect, useRef, useState } from 'react';
import { type SlotGrid, type SlotSymbolId } from '../SlotSymbols';
import { SLOT_CABINET_BY_STAGE } from '../slotCabinet';
import { SlotReelColumn } from './SlotReelColumn';
import { SLOT_COLS, SLOT_ROWS, type ColumnAnim } from './slotReel';

const SLOT_CELL_H = 56;
const INFERNO_MIN_MATCH = 4;

type InfernoPhase = 'idle' | 'ignite' | 'celebrate';

interface SlotWin {
  lineIndex: number;
  count: 2 | 3 | 4 | 5;
  coords: [number, number][];
  payout: number;
  symbol: SlotSymbolId;
}

interface StageTheme {
  slotGlow: string;
  slotFrame: string;
  title: string;
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
          <feGaussianBlur stdDeviation="1.4" result="blur" />
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
            strokeWidth={dense ? 1.8 : infernoActive && isInfernoLine ? 3.4 : 2.4}
            strokeLinecap="round"
            strokeLinejoin="round"
            filter="url(#infernoGlow)"
            className={
              infernoActive && isInfernoLine
                ? 'animate-inferno-line'
                : infernoPhase === 'ignite'
                  ? 'animate-inferno-line opacity-90'
                  : 'opacity-85'
            }
            style={{ vectorEffect: 'non-scaling-stroke' } as React.CSSProperties}
          />
        );
      })}
    </svg>
  );
}

export function SlotMatrix({
  theme,
  stageIndex,
  grid,
  isSpinning,
  columnAnims,
  stoppedColumns,
  activeWins,
  infernoPhase,
  burningCells,
  onCellHeight,
  onColumnLanded,
}: {
  theme: StageTheme;
  stageIndex: number;
  grid: SlotGrid;
  isSpinning: boolean;
  columnAnims: ColumnAnim[] | null;
  stoppedColumns: number;
  activeWins: SlotWin[];
  infernoPhase: InfernoPhase;
  burningCells: string[];
  onCellHeight: (height: number) => void;
  onColumnLanded: (columnIndex: number) => void;
}) {
  const cabinet = SLOT_CABINET_BY_STAGE[Math.min(stageIndex, SLOT_CABINET_BY_STAGE.length - 1)];
  const gridRef = useRef<HTMLDivElement>(null);
  const [cellHeight, setCellHeight] = useState(SLOT_CELL_H);
  const burnSet = new Set(burningCells);
  const hasInfernoWin = activeWins.some((w) => w.count >= INFERNO_MIN_MATCH);
  const showPaylines = !isSpinning && activeWins.length > 0;

  const columns = Array.from({ length: SLOT_COLS }, (_, col) =>
    [grid[0][col], grid[1][col], grid[2][col]] as [SlotSymbolId, SlotSymbolId, SlotSymbolId],
  );

  useEffect(() => {
    const el = gridRef.current;
    if (!el) return;
    const measure = () => {
      const h = el.clientHeight;
      if (h > 0) {
        const next = Math.max(48, Math.floor(h / SLOT_ROWS));
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
    <div className={`prestige-cabinet relative w-full h-full mx-auto theme-transition ${theme.slotGlow}`}>
      <div
        className={`absolute -inset-1 rounded-2xl bg-gradient-to-b opacity-90 blur-md pointer-events-none ${cabinet.outerAura}`}
      />
      <div
        className={`prestige-cabinet-shell theme-transition relative h-full flex flex-col rounded-xl border-2 p-1 shadow-[0_12px_40px_rgba(0,0,0,0.92),inset_0_2px_0_rgba(255,255,255,0.12)] ${theme.slotFrame} ${cabinet.shell}`}
      >
        {cabinet.decorClass && (
          <div
            className={`absolute inset-0 rounded-xl pointer-events-none z-0 overflow-hidden ${cabinet.decorClass}`}
            aria-hidden
          />
        )}
        <div className="flex items-center justify-between px-1.5 py-0.5 shrink-0 relative z-[2]">
          <span className={`text-[8px] font-black tracking-[0.28em] uppercase ${cabinet.badge}`}>
            High Limit · 3×5
          </span>
          <div className="flex gap-0.5">
            {Array.from({ length: SLOT_COLS }, (_, i) => (
              <div
                key={i}
                className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${
                  isSpinning && i >= stoppedColumns
                    ? 'bg-amber-200 animate-pulse shadow-[0_0_6px_rgba(251,191,36,0.9)]'
                    : isSpinning
                      ? 'bg-emerald-400/90 shadow-[0_0_4px_rgba(52,211,153,0.7)]'
                      : 'bg-white/25'
                }`}
              />
            ))}
          </div>
        </div>
        <div
          ref={gridRef}
          className={`prestige-reel-window relative flex-1 min-h-0 rounded-md border p-0 z-[1] ${cabinet.gridWindow}`}
        >
          <div className="prestige-scanlines absolute inset-0 pointer-events-none z-[25] opacity-[0.07]" aria-hidden />
          <div className="flex gap-px justify-center w-full h-full relative z-[10]">
            {columns.map((colSyms, i) => (
              <SlotReelColumn
                key={i}
                columnIndex={i}
                columnSymbols={colSyms}
                anim={columnAnims?.[i] ?? null}
                isSpinning={isSpinning}
                burningCells={burnSet}
                cellHeight={cellHeight}
                reelCell={cabinet.reelCell}
                onColumnLanded={onColumnLanded}
              />
            ))}
          </div>
          {showPaylines && (
            <PaylineOverlay
              wins={activeWins}
              infernoPhase={infernoPhase}
              highlightInferno={hasInfernoWin}
            />
          )}
        </div>
        <div className="mt-0.5 h-0.5 rounded-full bg-black/50 overflow-hidden shrink-0 relative z-[2]">
          <div
            className={`h-full bg-gradient-to-r transition-all ${cabinet.progressBar} ${isSpinning ? 'w-full ease-out' : 'w-0'}`}
            style={{ transitionDuration: isSpinning ? '3200ms' : '280ms' }}
          />
        </div>
      </div>
    </div>
  );
}

export { INFERNO_MIN_MATCH };
