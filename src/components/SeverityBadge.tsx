export default function SeverityBadge({ severity }: { severity: string }) {
  const normalized = (severity || 'low').toLowerCase();

  let bgClass = 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/20';
  let dotClass = 'bg-emerald-400';
  let label = 'Low Severity';

  if (normalized === 'moderate' || normalized === 'medium') {
    bgClass = 'bg-amber-500/15 text-amber-400 border border-amber-500/20';
    dotClass = 'bg-amber-400';
    label = 'Moderate Severity';
  } else if (normalized === 'high' || normalized === 'severe') {
    bgClass = 'bg-rose-500/15 text-rose-400 border border-rose-500/20';
    dotClass = 'bg-rose-400';
    label = 'High Severity';
  }

  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${bgClass}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${dotClass} animate-pulse`} />
      {label}
    </span>
  );
}
