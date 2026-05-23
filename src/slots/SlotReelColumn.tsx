import { useEffect, useRef, useState } from 'react';
import { SlotSymbolCell } from '../SlotSymbols';
import type { SlotSymbolId } from '../SlotSymbols';
import { REEL_EASING, type ColumnAnim } from './slotReel';

export function SlotReelColumn({
  columnIndex,
  columnSymbols,
  anim,
  isSpinning,
  burningCells,
  cellHeight,
  onColumnLanded,
}: {
  columnIndex: number;
  columnSymbols: [SlotSymbolId, SlotSymbolId, SlotSymbolId];
  anim: ColumnAnim | null;
  isSpinning: boolean;
  burningCells: Set<string>;
  cellHeight: number;
  onColumnLanded: (columnIndex: number) => void;
}) {
  const [offset, setOffset] = useState(0);
  const [transitioning, setTransitioning] = useState(false);
  const landedRef = useRef(false);
  const stripRef = useRef<HTMLDivElement>(null);
  const spinEpochRef = useRef(0);

  const strip = anim?.strip ?? columnSymbols;
  const stripCellH = anim?.cellHeight ?? cellHeight;
  const viewportH = stripCellH * 3;
  const duration = anim?.duration ?? 1.4;
  const activeSpin = isSpinning && anim !== null && !anim.landed;
  const displayOffset =
    anim && (anim.landed || (!activeSpin && anim.targetOffset !== 0))
      ? anim.targetOffset
      : activeSpin
        ? offset
        : 0;

  useEffect(() => {
    landedRef.current = anim?.landed ?? false;
    if (!anim || !isSpinning || anim.landed) {
      setOffset(anim?.landed ? anim.targetOffset : 0);
      setTransitioning(false);
      return;
    }
    landedRef.current = false;
    spinEpochRef.current += 1;
    const epoch = spinEpochRef.current;
    setOffset(0);
    setTransitioning(false);
    const startId = requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        if (epoch !== spinEpochRef.current) return;
        setTransitioning(true);
        setOffset(anim.targetOffset);
      });
    });
    return () => cancelAnimationFrame(startId);
  }, [anim, isSpinning]);

  const reportLanded = () => {
    if (landedRef.current) return;
    landedRef.current = true;
    setTransitioning(false);
    onColumnLanded(columnIndex);
  };

  useEffect(() => {
    const el = stripRef.current;
    if (!el || !activeSpin) return;

    const handleEnd = (ev: TransitionEvent) => {
      if (ev.propertyName !== 'transform') return;
      reportLanded();
    };

    el.addEventListener('transitionend', handleEnd);
    const failsafeMs = Math.round(duration * 1000) + 120;
    const failsafeId = window.setTimeout(reportLanded, failsafeMs);

    return () => {
      el.removeEventListener('transitionend', handleEnd);
      window.clearTimeout(failsafeId);
    };
  }, [activeSpin, columnIndex, duration]);

  return (
    <div className="relative flex-1 min-w-0 overflow-hidden" style={{ height: viewportH }}>
      <div className="absolute inset-0 overflow-hidden">
        <div
          ref={stripRef}
          className="reel-strip will-change-transform"
          style={{
            transform: `translate3d(0, ${displayOffset}px, 0)`,
            transition: transitioning
              ? `transform ${duration}s ${REEL_EASING}`
              : 'none',
          }}
        >
          {strip.map((sym, idx) => {
            const rowInView =
              strip.length === 3
                ? idx
                : idx >= strip.length - 3
                  ? idx - (strip.length - 3)
                  : -1;
            const inferno =
              rowInView >= 0 && burningCells.has(`${rowInView},${columnIndex}`);

            return (
              <div key={`${columnIndex}-${idx}`} className="w-full" style={{ height: stripCellH }}>
                <SlotSymbolCell symbol={sym} inferno={inferno} spinning={activeSpin} />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
