export function StatCard({ label, value, hint }: { label: string; value: string | number; hint?: string }) {
  return (
    <div className="glass-card px-5 py-5">
      <p className="text-xs font-medium uppercase tracking-[0.18em] text-navy/50">{label}</p>
      <p className="mt-2 font-serif text-3xl text-navy tabular-nums">{value}</p>
      {hint && <p className="mt-1 text-xs text-navy/50">{hint}</p>}
    </div>
  );
}

export function Pill({ tone, children }: { tone: "yes" | "no" | "wait" | "new" | "muted"; children: React.ReactNode }) {
  const cls = {
    yes: "bg-navy text-white",
    no: "bg-blush/60 text-navy",
    wait: "bg-cream text-navy/70",
    new: "bg-powder text-navy",
    muted: "bg-white text-navy/50 border border-navy/10",
  }[tone];
  return <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${cls}`}>{children}</span>;
}

export function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1 border-b border-navy/5 py-3 last:border-0 sm:flex-row sm:items-start sm:gap-6">
      <dt className="w-48 shrink-0 text-xs font-medium uppercase tracking-[0.15em] text-navy/50">{label}</dt>
      <dd className="text-sm text-navy">{children}</dd>
    </div>
  );
}
