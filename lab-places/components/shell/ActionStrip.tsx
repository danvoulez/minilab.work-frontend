'use client';

import Link from 'next/link';
import { MessageSquare } from 'lucide-react';
import type { ActionItem } from '@/lib/types';

interface Props {
  actions: ActionItem[];
  accentColor?: string;
  agentHref?: string;
}

export function ActionStrip({ actions, accentColor, agentHref }: Props) {
  if (actions.length === 0) return null;

  return (
    <div>
      <p className="text-[9px] font-bold uppercase tracking-[0.15em] text-white/28 mb-1.5">Actions</p>
      {/* Negative margin bleeds past padding so cards touch the edge on small screens */}
      <div
        className="flex gap-2 overflow-x-auto pb-1"
        style={{ scrollbarWidth: 'none' }}
      >
        {actions.map((action) => {
          const isPrimary = action.variant === 'primary';
          const isDanger  = action.variant === 'danger';
          const isAgentAction = !action.href && agentHref && !action.disabled;

          const href = action.href
            ?? (isAgentAction ? `${agentHref}?q=${encodeURIComponent(action.label)}` : undefined);

          const accentStyle =
            isPrimary && accentColor
              ? {
                  background: `linear-gradient(148deg, ${accentColor}55 0%, ${accentColor}2a 100%)`,
                  borderColor: `${accentColor}55`,
                }
              : undefined;

          const cardCls = [
            'flex-shrink-0 w-[152px] min-h-[84px] flex flex-col justify-between',
            'rounded-xl border p-3.5 transition-all duration-150 active:scale-[0.97]',
            isPrimary
              ? 'bg-white/[0.06] border-white/[0.15] hover:bg-white/10'
              : isDanger
              ? 'bg-red-500/[0.06] border-red-500/20 hover:bg-red-500/10'
              : 'bg-white/[0.03] border-white/[0.07] hover:bg-white/[0.06]',
          ].join(' ');

          const labelCls = `text-[13px] font-semibold leading-snug ${
            isPrimary ? 'text-white' : isDanger ? 'text-red-300' : 'text-white/65'
          }`;

          const footer = isAgentAction ? (
            <MessageSquare size={10} className="opacity-25" />
          ) : (
            <span className="text-[9px] text-white/20 uppercase tracking-wider">Open →</span>
          );

          const inner = (
            <>
              <span className={labelCls}>{action.label}</span>
              {action.description && (
                <span className="text-[10px] text-white/28 leading-tight mt-1 line-clamp-2">
                  {action.description}
                </span>
              )}
              <div className="mt-auto pt-2 flex justify-end">{footer}</div>
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
            <div key={action.id} className={`${cardCls} opacity-35 cursor-not-allowed`}>
              {inner}
            </div>
          );
        })}
      </div>
    </div>
  );
}
