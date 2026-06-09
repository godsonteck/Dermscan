export default function ConfidenceBadge({ confidence }: { confidence: string }) {
  const normalized = (confidence || 'high').toLowerCase();

  let bgClass = 'bg-emerald-550/15 text-emerald-400 border border-emerald-500/25';
  let label = 'High Confidence';

  if (normalized === 'moderate' || normalized === 'medium') {
    bgClass = 'bg-amber-550/15 text-amber-400 border border-amber-500/25';
    label = 'Moderate Confidence';
  } else if (normalized === 'low') {
    bgClass = 'bg-rose-550/15 text-rose-400 border border-rose-500/25';
    label = 'Low Confidence';
  }

  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${bgClass}`}>
      {label}
    </span>
  );
}
