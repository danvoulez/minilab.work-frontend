import { notFound } from 'next/navigation';
import Link from 'next/link';
import { queryClient } from '@/lib/query-client';
import { StatusChip } from '@/components/StatusChip';
import { ObservabilityList } from '@/components/shell/ObservabilityList';
import { AlertTriangle, ArrowLeft, ArrowRight, MessageSquare } from 'lucide-react';
import type { ObsItem } from '@/components/shell/ObservabilityList';
import type { ActionItem } from '@/lib/types';

interface Props {
  params: Promise<{ placeId: string }>;
}

// Three fixed action slots under the hero. Real actions fill from the left;
// remaining slots render as honest "Soon" placeholders instead of vanishing,
// so every place reads as a consistent 3-up command row.
function ActionSlots({
  actions,
  accentColor,
  agentHref,
}: {
  actions: ActionItem[];
  accentColor: string;
  agentHref: string;
}) {
  const slots = [0, 1, 2].map((i) => actions[i] ?? null);

  return (
    <div>
      <p className="text-[9px] font-bold uppercase tracking-[0.15em] text-white/28 mb-1.5">Actions</p>
      <div className="grid grid-cols-3 gap-2">
        {slots.map((action, i) => {
          if (!action) {
            return (
              <div
                key={`empty-${i}`}
                className="flex flex-col justify-between min-h-[78px] rounded-xl border border-white/[0.06] bg-white/[0.015] p-3"
              >
                <span className="text-[12px] font-semibold leading-snug text-white/25">Soon</span>
                <span className="mt-auto pt-2 text-[8px] font-bold uppercase tracking-[0.14em] text-white/18">
                  slot
                </span>
              </div>
            );
          }

          const isPrimary = action.variant === 'primary';
          const isDanger = action.variant === 'danger';
          const isAgentAction = !action.href && !action.disabled;
          const href =
            action.href ?? (isAgentAction ? `${agentHref}?q=${encodeURIComponent(action.label)}` : undefined);

          const accentStyle =
            isPrimary && accentColor
              ? {
                  background: `linear-gradient(148deg, ${accentColor}55 0%, ${accentColor}2a 100%)`,
                  borderColor: `${accentColor}55`,
                }
              : undefined;

          const cardCls = [
            'flex flex-col justify-between min-h-[78px] rounded-xl border p-3 transition-all duration-150 active:scale-[0.97]',
            isPrimary
              ? 'bg-white/[0.06] border-white/[0.15] hover:bg-white/10'
              : isDanger
              ? 'bg-red-500/[0.06] border-red-500/20 hover:bg-red-500/10'
              : 'bg-white/[0.03] border-white/[0.07] hover:bg-white/[0.06]',
          ].join(' ');

          const labelCls = `text-[12px] font-semibold leading-snug ${
            isPrimary ? 'text-white' : isDanger ? 'text-red-300' : 'text-white/65'
          }`;

          const footer = (
            <div className="mt-auto pt-2 flex justify-end">
              {isAgentAction ? (
                <MessageSquare size={10} className="opacity-25" />
              ) : href ? (
                <ArrowRight size={10} className="opacity-25" />
              ) : (
                <span className="text-[8px] text-white/20 uppercase tracking-wider">soon</span>
              )}
            </div>
          );

          const inner = (
            <>
              <span className={`${labelCls} line-clamp-2`}>{action.label}</span>
              {footer}
            </>
          );

          if (href) {
            return (
              <Link key={action.id} href={href} className={cardCls} style={accentStyle}>
                {inner}
              </Link>
            );
          }
          return (
            <div key={action.id} className={`${cardCls} opacity-40 cursor-not-allowed`}>
              {inner}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function AgentHero({ placeId, shortLabel, color }: { placeId: string; shortLabel: string; color: string }) {
  return (
    <Link
      href={`/places/${placeId}/agent`}
      className="group relative flex items-center justify-between w-full rounded-2xl overflow-hidden transition-all duration-150 active:scale-[0.99]"
      style={{
        background: [
          `radial-gradient(ellipse 80% 130% at 0% 50%, ${color}dd 0%, transparent 55%)`,
          `linear-gradient(135deg, ${color}bb 0%, ${color}77 50%, ${color}44 100%)`,
        ].join(', '),
        border: `1px solid ${color}66`,
        padding: '18px 22px',
      }}
    >
      <div
        className="absolute inset-x-0 top-0 h-[1px]"
        style={{ background: `linear-gradient(90deg, ${color}ff, ${color}88, transparent)` }}
      />
      <div>
        <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-white/55 mb-1">
          every action · every question
        </p>
        <p className="text-lg font-black text-white leading-none tracking-tight">
          Talk to {shortLabel} agent
        </p>
      </div>
      <div className="flex-shrink-0 ml-4 w-11 h-11 flex items-center justify-center rounded-full bg-white/15 group-hover:bg-white/25 border border-white/20 transition-all duration-150">
        <MessageSquare size={18} className="text-white" />
      </div>
    </Link>
  );
}

export default async function PlacePage({ params }: Props) {
  const { placeId } = await params;
  const place = await queryClient.getPlace(placeId);
  if (!place) notFound();

  const color = place.accentColor;

  // statusLights → semaphore dots (the dot IS the signal)
  const readinessItems: ObsItem[] = place.statusLights.map((l) => ({
    label: l.label,
    status: l.status === 'on' ? 'ok' : l.status === 'warn' ? 'warn' : 'idle',
  }));

  // primarySignals → key metrics ("Runtime data: SOON", "Control plane: not wired", …)
  const signalItems: ObsItem[] = place.primarySignals.map((s) => ({
    label: s.label,
    value: s.value,
    note: s.note,
  }));

  // One small list: lead with the honest signals, top up with readiness lights, cap at 4.
  const obsItems: ObsItem[] = [...signalItems, ...readinessItems].slice(0, 4);

  return (
    <div className="min-h-[100svh] bg-[#0e0e0e] flex flex-col">
      {/* Dot-grid texture */}
      <div
        className="fixed inset-0 pointer-events-none opacity-[0.02]"
        aria-hidden="true"
        style={{
          backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.8) 1px, transparent 0)',
          backgroundSize: '28px 28px',
        }}
      />

      {/* Header */}
      <header className="relative z-10 flex-shrink-0 pt-safe px-4 py-3 border-b border-white/[0.06]">
        <div className="max-w-[440px] mx-auto">
          <nav className="flex items-center gap-1.5 mb-1.5">
            <Link
              href="/"
              className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-[0.14em] text-white/30 hover:text-white/55 transition-colors"
            >
              <ArrowLeft size={10} />
              minilab.work
            </Link>
            <span className="text-[10px] text-white/15">/</span>
            <span
              className="text-[10px] font-bold uppercase tracking-[0.12em]"
              style={{ color: `${color}cc` }}
            >
              {place.shortLabel}
            </span>
          </nav>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-black text-white tracking-tight leading-none">
              {place.shortLabel}
            </h1>
            <StatusChip status={place.status} />
          </div>
          <p className="text-[9px] font-bold uppercase tracking-[0.15em] text-white/28 mt-0.5">
            {place.descriptor}
          </p>
        </div>
      </header>

      {/* Scrollable body */}
      <div className="relative z-10 flex-1 overflow-y-auto" style={{ scrollbarWidth: 'none' }}>
        <div className="max-w-[440px] mx-auto px-4 py-4 space-y-3 pb-10">

          {/* 1. Big square — identity banner */}
          <div
            className="rounded-2xl px-5 py-5 relative overflow-hidden"
            style={{
              background: [
                `radial-gradient(ellipse 130% 70% at 50% 0%, ${color}cc 0%, transparent 60%)`,
                `radial-gradient(ellipse 80% 60% at 0% 100%, ${color}66 0%, transparent 50%)`,
                `linear-gradient(165deg, ${color}99 0%, ${color}44 35%, #141414 70%)`,
                '#141414',
              ].join(', '),
              border: `1px solid ${color}44`,
              boxShadow: `inset 0 1px 0 ${color}88`,
            }}
          >
            <p
              className="text-[10px] font-bold uppercase tracking-[0.2em] mb-2"
              style={{ color: `${color}ee` }}
            >
              {place.descriptor}
            </p>
            <h2 className="text-3xl font-black text-white leading-none tracking-tight">
              {place.shortLabel}
            </h2>
            <p className="text-[13px] text-white/40 mt-2 leading-snug max-w-sm">
              {place.overview || place.shortSummary}
            </p>
          </div>

          {/* 2. Three action slots */}
          <ActionSlots actions={place.actions} accentColor={color} agentHref={`/places/${placeId}/agent`} />

          {/* 3. Talk to agent */}
          <AgentHero placeId={placeId} shortLabel={place.shortLabel} color={color} />

          {/* 4. Small observability — one compact list, 3–4 items */}
          {obsItems.length > 0 && (
            <ObservabilityList title="Observability" items={obsItems} />
          )}

          {/* Attention — the honest "not wired" notice */}
          {place.attention && (
            <div className="flex gap-3 p-3.5 rounded-xl bg-amber-500/[0.07] border border-amber-500/20">
              <AlertTriangle size={13} className="text-amber-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-bold text-amber-300 uppercase tracking-wider mb-0.5">
                  {place.attention.title}
                </p>
                <p className="text-sm text-amber-200/55 leading-relaxed">{place.attention.body}</p>
              </div>
            </div>
          )}

          {/* Relations */}
          {place.relations.length > 0 && (
            <div>
              <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-white/20 mb-1.5">
                Relations
              </p>
              <div className="flex flex-wrap gap-1.5">
                {place.relations.map((rel) => {
                  const chip = (
                    <span className="flex items-center gap-1.5">
                      <span className="font-semibold text-white/50">{rel.place}</span>
                      <span className="text-white/22">·</span>
                      <span className="text-white/28 italic">{rel.nature}</span>
                    </span>
                  );
                  return rel.placeId ? (
                    <Link
                      key={rel.place}
                      href={`/places/${rel.placeId}`}
                      className="text-[11px] px-2.5 py-1 rounded-lg bg-white/[0.03] border border-white/[0.07] hover:bg-white/[0.07] transition-colors"
                    >
                      {chip}
                    </Link>
                  ) : (
                    <span
                      key={rel.place}
                      className="text-[11px] px-2.5 py-1 rounded-lg bg-white/[0.03] border border-white/[0.07]"
                    >
                      {chip}
                    </span>
                  );
                })}
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}

export async function generateStaticParams() {
  const places = await queryClient.listPlaces();
  return places.map((p) => ({ placeId: p.id }));
}
