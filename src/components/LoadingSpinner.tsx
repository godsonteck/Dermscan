import { Loader2 } from 'lucide-react';

export default function LoadingSpinner({ fullPage = false, label = "Loading data..." }: { fullPage?: boolean; label?: string }) {
  const content = (
    <div className="flex flex-col items-center justify-center p-6 text-center">
      <Loader2 className="w-10 h-10 text-violet-500 animate-spin mb-3" />
      <span className="text-sm font-medium text-slate-350">{label}</span>
    </div>
  );

  if (fullPage) {
    return (
      <div className="fixed inset-0 bg-slate-950 flex items-center justify-center z-50">
        {content}
      </div>
    );
  }

  return content;
}
