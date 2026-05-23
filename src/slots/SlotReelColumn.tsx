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
  reelCell,
  onColumnLanded,
}: {
  columnIndex: number;
  columnSymbols: [SlotSymbolId, SlotSymbolId, SlotSymbolId];
  anim: ColumnAnim | null;
  isSpinning: boolean;
  burningCells: Set<string>;
  cellHeight: number;
  reelCell: string;
  onColumnLanded: (columnIndex: number) => void;
}) {
  const [offset, setOffset] = useState(0);
  const [transitioning, setTransitioning] = useState(false);
  const landedRef = useRef(false);
  const stripRef = useRef<HTMLDivElement>(null);

  const strip = anim?.strip ?? columnSymbols;
  const stripCellH = anim?.cellHeight ?? cellHeight;
  const viewportH = stripCellH * 3;
  const duration = anim?.duration ?? 2.2;
  const activeSpin = isSpinning && anim !== null && !anim.landed;
  const showMotionBlur = activeSpin && transitioning;
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

    setOffset(0);
    setTransitioning(false);
    const startId = requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        setTransitioning(true);
        setOffset(anim.targetOffset);
      });
    });
    return () => cancelAnimationFrame(startId);
  }, [anim, isSpinning]);

  useEffect(() => {
    const el = stripRef.current;
    if (!el || !activeSpin) return;

    const handleEnd = (ev: TransitionEvent) => {
      if (ev.propertyName !== 'transform') return;
      if (landedRef.current) return;
      landedRef.current = true;
      setTransitioning(false);
      onColumnLanded(columnIndex);
    };

    el.addEventListener('transitionend', handleEnd);
    return () => el.removeEventListener('transitionend', handleEnd);
  }, [activeSpin, columnIndex, onColumnLanded]);

  return (
    <div
      className={`prestige-reel-column relative flex-1 min-w-0 overflow-hidden border ${reelCell}`}
      style={{ height: viewportH }}
    >
      <div className="prestige-reel-glass absolute inset-0 pointer-events-none z-[2]" aria-hidden />
      <div className="absolute inset-0 overflow-hidden z-[5]">
        <div
          ref={stripRef}
          className={`reel-strip will-change-transform ${showMotionBlur ? 'reel-motion-blur' : ''}`}
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
              <div
                key={`${columnIndex}-${idx}-${sym}`}
                className="w-full select-none leading-none p-0"
                style={{ height: stripCellH }}
              >
                <SlotSymbolCell symbol={sym} inferno={inferno} />
              </div>
            );
          })}
        </div>
      </div>
      <div className="prestige-reel-highlight absolute inset-x-0 top-0 h-[18%] bg-gradient-to-b from-white/[0.14] to-transparent pointer-events-none z-[6]" />
      <div className="prestige-reel-shadow absolute inset-x-0 bottom-0 h-[22%] bg-gradient-to-t from-black/55 to-transparent pointer-events-none z-[6]" />
    </div>
  );
}
