'use client';

const dotColor = {
  ok:   'bg-emerald-400',
  warn: 'bg-amber-400',
  error: 'bg-red-400',
  idle: 'bg-white/18',
};

const valueColor = {
  ok:   'text-emerald-400',
  warn: 'text-amber-400',
  error: 'text-red-400',
  idle: 'text-white/55',
};

export interface ObsItem {
  label: string;
  value?: string;
  status?: 'ok' | 'warn' | 'error' | 'idle';
  note?: string;
}

interface Props {
  title: string;
  items: ObsItem[];
}

// Each row ~34px. 3.5 rows visible = 119px, gives a hint there's more below.
const MAX_HEIGHT = 119;

export function ObservabilityList({ title, items }: Props) {
  return (
    <div>
      <p className="text-[9px] font-bold uppercase tracking-[0.15em] text-white/28 mb-1.5">{title}</p>
      <div
        className="rounded-xl border border-white/[0.07] bg-white/[0.025] overflow-y-auto"
        style={{ maxHeight: MAX_HEIGHT, scrollbarWidth: 'none' }}
      >
        {items.map((item, i) => (
          <div
            key={`${item.label}-${i}`}
            className={`flex items-center gap-2.5 px-3.5 py-[9px] ${
              i < items.length - 1 ? 'border-b border-white/[0.05]' : ''
            }`}
          >
            <div
              className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${dotColor[item.status ?? 'idle']}`}
            />
            <span className="text-xs text-white/58 flex-1 min-w-0 truncate">{item.label}</span>
            <div className="flex items-center gap-2 flex-shrink-0 ml-2">
              {item.note && (
                <span className="text-[10px] text-white/25 max-w-[80px] truncate">{item.note}</span>
              )}
              {item.value && (
                <span
                  className={`text-xs font-semibold tabular-nums ${valueColor[item.status ?? 'idle']}`}
                >
                  {item.value}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
