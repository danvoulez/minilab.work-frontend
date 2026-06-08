import { PlaceGrid } from '@/components/PlaceGrid';
import { queryClient } from '@/lib/query-client';
import { createClient } from '@/lib/supabase/server';

// Live read of the cockpit "today" summary straight from the Supabase source of
// truth (audit.v_mobile_today, via the public.cockpit_today read surface).
// Returns null on any failure so the UI degrades honestly instead of faking data.
async function getToday() {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase.from('cockpit_today').select('*').single();
    if (error) return null;
    return data as Record<string, number>;
  } catch {
    return null;
  }
}

export default async function Home() {
  const [summaries, today] = await Promise.all([queryClient.listPlaces(), getToday()]);

  const stats = today
    ? ([
        { label: 'Entities live', value: today.entities_active ?? 0, tone: 'good' as const },
        { label: 'Acts · 24h', value: today.logline_acts_24h ?? 0, tone: 'plain' as const },
        {
          label: 'Unverified links',
          value: today.unverified_links ?? 0,
          tone: (today.unverified_links ?? 0) > 0 ? ('warn' as const) : ('plain' as const),
        },
        {
          label: 'Open ghosts',
          value: today.lab_ghosts_open ?? 0,
          tone: (today.lab_ghosts_open ?? 0) > 0 ? ('warn' as const) : ('plain' as const),
        },
        {
          label: 'Releases pending',
          value: today.releases_pending ?? 0,
          tone: (today.releases_pending ?? 0) > 0 ? ('warn' as const) : ('plain' as const),
        },
      ])
    : [];

  const valueTone = {
    good: 'text-emerald-400',
    warn: 'text-amber-400',
    plain: 'text-white',
  };

  return (
    <main className="min-h-screen bg-[#0e0e0e]">
      {/* Subtle dot-grid background texture */}
      <div
        className="fixed inset-0 pointer-events-none opacity-[0.025]"
        style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, rgba(255,255,255,0.8) 1px, transparent 0)`,
          backgroundSize: '28px 28px',
        }}
        aria-hidden="true"
      />

      <div className="relative z-10 min-h-screen flex flex-col">
        {/* Header */}
        <header className="flex-shrink-0 pt-safe px-4 md:px-8 pb-4">
          <div className="flex items-baseline justify-between max-w-5xl mx-auto w-full">
            <div>
              <h1 className="text-base font-black tracking-tight text-white leading-none">minilab.work</h1>
              <p className="text-[9px] text-white/22 mt-0.5 font-semibold tracking-[0.15em] uppercase">
                Operational Cockpit
              </p>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.6)]" />
              <span className="text-[10px] text-white/28 font-semibold tracking-wide">
                {summaries.length} active
              </span>
            </div>
          </div>
        </header>

        {/* Live "today" strip — real numbers from minilab.database */}
        {stats.length > 0 && (
          <div className="flex-shrink-0 px-4 md:px-8 pb-4">
            <div className="max-w-5xl mx-auto w-full">
              <div className="flex items-center gap-1.5 mb-1.5">
                <div className="w-1 h-1 rounded-full bg-emerald-400 shadow-[0_0_5px_rgba(52,211,153,0.7)]" />
                <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-white/30">
                  Today · live from minilab.database
                </p>
              </div>
              <div className="flex gap-2 overflow-x-auto pb-1" style={{ scrollbarWidth: 'none' }}>
                {stats.map((s) => (
                  <div
                    key={s.label}
                    className="flex-shrink-0 min-w-[92px] rounded-xl border border-white/[0.07] bg-white/[0.025] px-3 py-2.5"
                  >
                    <p className={`text-xl font-black tabular-nums leading-none ${valueTone[s.tone]}`}>
                      {s.value}
                    </p>
                    <p className="text-[9px] font-bold uppercase tracking-[0.1em] text-white/30 mt-1.5 whitespace-nowrap">
                      {s.label}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Grid */}
        <div className="flex-1 px-3 md:px-6 lg:px-8 pb-6 max-w-5xl mx-auto w-full">
          <PlaceGrid summaries={summaries} />
        </div>
      </div>
    </main>
  );
}
