'use client';

import type { PlaceSummary } from '@/lib/types';

interface Props {
  summary: PlaceSummary;
}

type ColorStrength = 'vivid' | 'muted' | 'dim';

const statusConfig: Record<string, { dot: string; strength: ColorStrength }> = {
  healthy:   { dot: 'bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.7)]', strength: 'vivid' },
  syncing:   { dot: 'bg-sky-400 shadow-[0_0_6px_rgba(56,189,248,0.7)]',     strength: 'vivid' },
  warning:   { dot: 'bg-amber-400 shadow-[0_0_6px_rgba(251,191,36,0.7)]',   strength: 'muted' },
  attention: { dot: 'bg-orange-400 shadow-[0_0_6px_rgba(251,146,60,0.7)]',  strength: 'muted' },
  degraded:  { dot: 'bg-red-400 shadow-[0_0_6px_rgba(248,113,113,0.7)]',    strength: 'dim'   },
  offline:   { dot: 'bg-white/25',                                           strength: 'dim'   },
};

const colorAlpha: Record<ColorStrength, [string, string]> = {
  vivid: ['cc', '88'],
  muted: ['66', '44'],
  dim:   ['2a', '18'],
};

export function PlaceCardFront({ summary }: Props) {
  const cfg = statusConfig[summary.status] ?? statusConfig.offline;
  const [a1, a2] = colorAlpha[cfg.strength];
  const c = summary.accentColor;

  return (
    <div
      className="relative w-full h-full rounded-[20px] overflow-hidden select-none bg-[#111]"
    >
      {/* Color wash — intensity driven by status */}
      <div
        className="absolute inset-0 rounded-[20px]"
        style={{
          background: [
            `radial-gradient(ellipse 140% 90% at 15% 85%, ${c}${a1} 0%, transparent 60%)`,
            `linear-gradient(148deg, ${c}${a2} 0%, transparent 55%)`,
          ].join(', '),
        }}
      />

      {/* Depth vignette */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-transparent to-transparent rounded-[20px]" />

      {/* Top highlight line */}
      <div className="absolute inset-x-0 top-0 h-px bg-white/[0.08]" />

      {/* Content */}
      <div className="absolute inset-0 flex flex-col justify-between p-4 md:p-5">

        {/* Descriptor — small, top */}
        <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-white/38">
          {summary.descriptor}
        </span>

        {/* Name + status dot — bottom */}
        <div className="space-y-3">
          <h2 className="text-[1.75rem] md:text-[1.9rem] font-black text-white leading-none tracking-tight">
            {summary.shortLabel}
          </h2>
          <div className={`w-2 h-2 rounded-full ${cfg.dot}`} />
        </div>
      </div>
    </div>
  );
}
