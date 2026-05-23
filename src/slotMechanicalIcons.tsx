import { useId, type ReactElement } from 'react';
import type { SlotSymbolId } from './SlotSymbols';

function uid(p: string, id: string) {
  return `${p}-${id.replace(/:/g, '')}`;
}

function MechSvg({
  children,
  inferno,
}: {
  children: React.ReactNode;
  inferno?: boolean;
}) {
  return (
    <svg
      viewBox="0 0 48 48"
      className={`w-full h-full block ${inferno ? 'brightness-110' : ''}`}
      aria-hidden
    >
      {children}
    </svg>
  );
}

function CogIcon({ inferno }: { inferno?: boolean }) {
  const id = useId();
  const g = uid('cg', id);
  return (
    <MechSvg inferno={inferno}>
      <defs>
        <linearGradient id={g} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#fde68a" />
          <stop offset="45%" stopColor="#f59e0b" />
          <stop offset="100%" stopColor="#92400e" />
        </linearGradient>
      </defs>
      <circle cx="24" cy="24" r="14" fill={`url(#${g})`} stroke="#78350f" strokeWidth="1" />
      {[0, 45, 90, 135, 180, 225, 270, 315].map((deg) => (
        <rect
          key={deg}
          x="22"
          y="6"
          width="4"
          height="6"
          rx="1"
          fill="#b45309"
          transform={`rotate(${deg} 24 24)`}
        />
      ))}
      <circle cx="24" cy="24" r="5" fill="#451a03" stroke="#fde68a" strokeWidth="1" />
    </MechSvg>
  );
}

function BoltIcon({ inferno }: { inferno?: boolean }) {
  const id = useId();
  const g = uid('bl', id);
  return (
    <MechSvg inferno={inferno}>
      <defs>
        <linearGradient id={g} x1="0.2" y1="0" x2="0.8" y2="1">
          <stop offset="0%" stopColor="#f4f4f5" />
          <stop offset="50%" stopColor="#a1a1aa" />
          <stop offset="100%" stopColor="#52525b" />
        </linearGradient>
      </defs>
      <polygon points="24,6 30,14 27,14 27,38 21,38 21,14 18,14" fill={`url(#${g})`} stroke="#3f3f46" />
      <polygon points="14,34 34,34 32,42 16,42" fill="#71717a" stroke="#27272a" />
      <circle cx="24" cy="10" r="3" fill="#e4e4e7" />
    </MechSvg>
  );
}

function SpringIcon({ inferno }: { inferno?: boolean }) {
  const id = useId();
  const g = uid('sp', id);
  const path =
    'M12 24 Q16 14 20 24 T28 24 T36 24';
  return (
    <MechSvg inferno={inferno}>
      <defs>
        <linearGradient id={g} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#fcd34d" />
          <stop offset="100%" stopColor="#b45309" />
        </linearGradient>
      </defs>
      <path d={path} fill="none" stroke={`url(#${g})`} strokeWidth="4" strokeLinecap="round" />
      <path d={path} fill="none" stroke="#78350f" strokeWidth="6" strokeLinecap="round" opacity="0.35" />
      <rect x="10" y="32" width="28" height="6" rx="2" fill="#52525b" />
    </MechSvg>
  );
}

function DialIcon({ inferno }: { inferno?: boolean }) {
  const id = useId();
  const g = uid('dl', id);
  return (
    <MechSvg inferno={inferno}>
      <defs>
        <radialGradient id={g} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#fde68a" />
          <stop offset="70%" stopColor="#d97706" />
          <stop offset="100%" stopColor="#78350f" />
        </radialGradient>
      </defs>
      <circle cx="24" cy="24" r="16" fill={`url(#${g})`} stroke="#92400e" strokeWidth="1.5" />
      <circle cx="24" cy="24" r="12" fill="#1c1917" opacity="0.5" />
      <line x1="24" y1="24" x2="24" y2="12" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" />
      <line x1="24" y1="24" x2="32" y2="28" stroke="#fbbf24" strokeWidth="1.5" strokeLinecap="round" />
      <text x="24" y="40" textAnchor="middle" fontSize="6" fill="#fbbf24" fontWeight="bold">
        PSI
      </text>
    </MechSvg>
  );
}

function DiamondIcon({ inferno }: { inferno?: boolean }) {
  const id = useId();
  const c = uid('dm', id);
  const i = uid('ir', id);
  return (
    <MechSvg inferno={inferno}>
      <defs>
        <linearGradient id={c} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#67e8f9" />
          <stop offset="50%" stopColor="#06b6d4" />
          <stop offset="100%" stopColor="#0e7490" />
        </linearGradient>
        <linearGradient id={i} x1="0" y1="1" x2="0" y2="0">
          <stop offset="0%" stopColor="#27272a" />
          <stop offset="100%" stopColor="#52525b" />
        </linearGradient>
      </defs>
      <rect x="10" y="10" width="28" height="28" rx="3" fill={`url(#${i})`} stroke="#71717a" />
      <path d="M24 14 L32 24 L24 36 L16 24 Z" fill={`url(#${c})`} stroke="#0891b2" strokeWidth="0.8" />
      <path d="M24 14 L24 36 L16 24 Z" fill="#a5f3fc" opacity="0.4" />
    </MechSvg>
  );
}

function CrownIcon({ inferno }: { inferno?: boolean }) {
  const id = useId();
  const g = uid('cr', id);
  return (
    <MechSvg inferno={inferno}>
      <defs>
        <linearGradient id={g} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#fef3c7" />
          <stop offset="50%" stopColor="#f59e0b" />
          <stop offset="100%" stopColor="#78716c" />
        </linearGradient>
      </defs>
      <rect x="8" y="32" width="32" height="8" rx="1" fill="#57534e" stroke="#44403c" />
      <path
        d="M8 28 L12 14 L18 22 L24 10 L30 22 L36 14 L40 28 Z"
        fill={`url(#${g})`}
        stroke="#92400e"
        strokeWidth="0.8"
      />
      <circle cx="12" cy="16" r="1.5" fill="#a8a29e" />
      <circle cx="24" cy="12" r="1.5" fill="#a8a29e" />
      <circle cx="36" cy="16" r="1.5" fill="#a8a29e" />
    </MechSvg>
  );
}

function CrankIcon({ inferno }: { inferno?: boolean }) {
  const id = useId();
  const g = uid('ck', id);
  return (
    <MechSvg inferno={inferno}>
      <defs>
        <linearGradient id={g} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#d4d4d8" />
          <stop offset="100%" stopColor="#52525b" />
        </linearGradient>
      </defs>
      <rect x="14" y="8" width="20" height="28" rx="3" fill="#3f3f46" stroke="#71717a" />
      <circle cx="24" cy="18" r="6" fill="#ef4444" opacity="0.9" />
      <circle cx="24" cy="18" r="3" fill="#fca5a5" />
      <rect x="32" y="20" width="10" height="4" rx="2" fill={`url(#${g})`} />
      <circle cx="42" cy="22" r="5" fill="#a1a1aa" stroke="#52525b" />
      <rect x="18" y="36" width="12" height="6" rx="1" fill="#78350f" />
    </MechSvg>
  );
}

function BellIcon({ inferno }: { inferno?: boolean }) {
  const id = useId();
  const g = uid('be', id);
  return (
    <MechSvg inferno={inferno}>
      <defs>
        <linearGradient id={g} x1="0.3" y1="0" x2="0.7" y2="1">
          <stop offset="0%" stopColor="#a8a29e" />
          <stop offset="60%" stopColor="#57534e" />
          <stop offset="100%" stopColor="#292524" />
        </linearGradient>
      </defs>
      <path
        d="M24 8 C16 8 12 16 12 22 L36 22 C36 16 32 8 24 8 Z"
        fill={`url(#${g})`}
        stroke="#fbbf24"
        strokeWidth="1.2"
      />
      <rect x="22" y="22" width="4" height="6" fill="#44403c" />
      <circle cx="24" cy="32" r="4" fill="#292524" stroke="#fbbf24" strokeWidth="0.8" />
    </MechSvg>
  );
}

function CashIcon({ inferno }: { inferno?: boolean }) {
  const id = useId();
  const g = uid('ca', id);
  return (
    <MechSvg inferno={inferno}>
      <defs>
        <linearGradient id={g} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#86efac" />
          <stop offset="100%" stopColor="#166534" />
        </linearGradient>
      </defs>
      <rect x="12" y="12" width="24" height="22" rx="2" fill={`url(#${g})`} stroke="#14532d" />
      <rect x="8" y="14" width="4" height="18" fill="#71717a" />
      <rect x="36" y="14" width="4" height="18" fill="#71717a" />
      <rect x="10" y="16" width="28" height="3" fill="#52525b" />
      <rect x="10" y="24" width="28" height="3" fill="#52525b" />
    </MechSvg>
  );
}

function StarIcon({ inferno }: { inferno?: boolean }) {
  const id = useId();
  const g = uid('st', id);
  return (
    <MechSvg inferno={inferno}>
      <defs>
        <linearGradient id={g} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#fde68a" />
          <stop offset="100%" stopColor="#b45309" />
        </linearGradient>
      </defs>
      <path
        d="M24 6 L28 18 L40 18 L30 26 L34 38 L24 30 L14 38 L18 26 L8 18 L20 18 Z"
        fill={`url(#${g})`}
        stroke="#92400e"
        strokeWidth="0.8"
      />
      <circle cx="24" cy="22" r="3" fill="#78716c" />
    </MechSvg>
  );
}

const MECHANICAL_RENDERERS: Record<
  SlotSymbolId,
  (props: { inferno?: boolean }) => ReactElement
> = {
  clover: CogIcon,
  dice: BoltIcon,
  cherry: SpringIcon,
  ace: DialIcon,
  diamond: DiamondIcon,
  crown: CrownIcon,
  jackpot: CrankIcon,
  bell: BellIcon,
  cash: CashIcon,
  star: StarIcon,
};

export function MechanicalSymbolIcon({
  symbol,
  inferno = false,
}: {
  symbol: SlotSymbolId;
  inferno?: boolean;
}) {
  const Render = MECHANICAL_RENDERERS[symbol];
  return (
    <div
      className={`w-full h-full flex items-center justify-center p-0.5 ${
        inferno ? 'scale-105' : ''
      }`}
    >
      <Render inferno={inferno} />
    </div>
  );
}
