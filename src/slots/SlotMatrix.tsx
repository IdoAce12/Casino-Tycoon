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

function cellCenterPct(row: number, col: number): { x: number; y: number } {
  return { x: ((col + 0.5) / SLOT_COLS) * 100, y: ((row + 0.5) / SLOT_ROWS) * 100 };
}

function PaylineOverlay({
  wins,
  infernoPhase,
}: {
  wins: SlotWin[];
  infernoPhase: InfernoPhase;
}) {
  if (wins.length === 0) return null;

  return (
    <svg
      className="absolute inset-0 w-full h-full pointer-events-none z-20"
      viewBox="0 0 100 100"
      preserveAspectRatio="none"
      aria-hidden
    >
      {wins.map((win) => {
        const pts = win.coords.map(([r, c]) => {
          const { x, y } = cellCenterPct(r, c);
          return `${x},${y}`;
        });
        return (
          <polyline
            key={`line-${win.lineIndex}`}
            points={pts.join(' ')}
            fill="none"
            stroke={win.count >= INFERNO_MIN_MATCH ? '#f59e0b' : '#d97706'}
            strokeWidth={win.count >= INFERNO_MIN_MATCH ? 2.5 : 1.8}
            strokeLinecap="round"
            strokeLinejoin="round"
            opacity={infernoPhase === 'idle' ? 0.75 : 1}
            style={{ vectorEffect: 'non-scaling-stroke' } as React.CSSProperties}
          />
        );
      })}
    </svg>
  );
}

export function SlotMatrix({
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
    <div className="relative w-full h-full flex flex-col rounded-lg border border-amber-900/30 bg-[#0a0a0c] p-1 min-h-0">
      <div
        className={`flex items-center justify-between px-1.5 py-0.5 shrink-0 border-b border-amber-800/30 ${cabinet.shell}`}
      >
        <span className={`text-[8px] font-bold tracking-[0.2em] uppercase ${cabinet.badge}`}>
          Blueprint · 3×5
        </span>
        <div className="flex gap-1">
          {Array.from({ length: SLOT_COLS }, (_, i) => (
            <div
              key={i}
              className={`w-1.5 h-1.5 rounded-full ${
                isSpinning && i >= stoppedColumns ? 'bg-amber-400' : isSpinning ? 'bg-amber-600' : 'bg-zinc-700'
              }`}
            />
          ))}
        </div>
      </div>

      <div ref={gridRef} className={`relative flex-1 min-h-0 rounded-sm ${cabinet.gridWindow}`}>
        <div className="blueprint-schematic-lines absolute inset-0 pointer-events-none opacity-40" aria-hidden />
        <div className="relative flex h-full w-full z-[1]">
          {columns.map((colSyms, i) => (
            <SlotReelColumn
              key={i}
              columnIndex={i}
              columnSymbols={colSyms}
              anim={columnAnims?.[i] ?? null}
              isSpinning={isSpinning}
              burningCells={burnSet}
              cellHeight={cellHeight}
              isLastColumn={i === SLOT_COLS - 1}
              onColumnLanded={onColumnLanded}
            />
          ))}
        </div>
        {showPaylines && <PaylineOverlay wins={activeWins} infernoPhase={infernoPhase} />}
      </div>

      <div className="mt-0.5 h-0.5 rounded-full bg-zinc-900 overflow-hidden shrink-0">
        <div
          className={`h-full bg-gradient-to-r ${cabinet.progressBar} transition-[width] ease-out ${isSpinning ? 'w-full' : 'w-0'}`}
          style={{ transitionDuration: isSpinning ? '1600ms' : '200ms' }}
        />
      </div>
    </div>
  );
}

export { INFERNO_MIN_MATCH };
