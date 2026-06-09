import { useState, useEffect } from 'react';
import { Loader2, Microscope, ShieldCheck } from 'lucide-react';

export default function AnalyzingLoader() {
  const [step, setStep] = useState(0);

  const statuses = [
    { title: "Processing skin image...", desc: "Analyzing pixels and color channels" },
    { title: "Symptom matching...", desc: "Cross-referencing reported conditions and duration" },
    { title: "AI Model Detection...", desc: "Classifying condition profiles using Deep Neural Nets" },
    { title: "Formulating Diagnosis...", desc: "Querying Gemini API for comprehensive diagnostic facts" },
    { title: "Sourcing Skincare Recommendations...", desc: "Tailoring skincare product lines based on results" }
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setStep((prev) => (prev < statuses.length - 1 ? prev + 1 : prev));
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 max-w-md mx-auto text-center">
      {/* Visual glowing scanner element */}
      <div className="relative mb-8 w-24 h-24 flex items-center justify-center">
        {/* Pulsing ring */}
        <div className="absolute inset-0 rounded-full border border-violet-500/30 animate-ping" />
        <div className="absolute inset-2 rounded-full border-2 border-violet-500/55 animate-pulse" />
        
        {/* Core diagnostic icon */}
        <div className="relative w-16 h-16 rounded-full bg-violet-600/20 border border-violet-500/40 flex items-center justify-center shadow-lg shadow-violet-550/20">
          <Microscope className="w-8 h-8 text-violet-400 animate-bounce" />
        </div>
      </div>

      {/* Main title */}
      <h3 className="text-xl font-bold font-sans text-slate-100 mb-2">
        DermScan AI Processing...
      </h3>
      <p className="text-sm text-white/50 mb-8 max-w-xs">
        Analyzing conditional models. Please do not close or navigate away from this screen.
      </p>

      {/* Stepper display */}
      <div className="w-full space-y-4 bg-[#111118] border border-white/8 rounded-2xl p-5 shadow-md">
        {statuses.map((status, idx) => {
          const isActive = idx === step;
          const isCompleted = idx < step;

          return (
            <div key={idx} className="flex items-start gap-3 text-left transition-all duration-300">
              <div className="mt-0.5 shrink-0">
                {isCompleted ? (
                  <div className="w-5 h-5 rounded-full bg-emerald-500/20 border border-emerald-500 flex items-center justify-center">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  </div>
                ) : isActive ? (
                  <div className="w-5 h-5 rounded-full bg-violet-500/20 border border-violet-500 flex items-center justify-center">
                    <Loader2 className="w-3.5 h-3.5 text-violet-400 animate-spin" />
                  </div>
                ) : (
                  <div className="w-5 h-5 rounded-full bg-white/5 border border-white/10 flex items-center justify-center">
                    <span className="text-[10px] text-white/30 font-bold">{idx + 1}</span>
                  </div>
                )}
              </div>

              <div>
                <h4 className={`text-xs font-bold leading-none ${isActive ? 'text-violet-400' : isCompleted ? 'text-slate-350 line-through opacity-75' : 'text-white/40'}`}>
                  {status.title}
                </h4>
                {isActive && (
                  <p className="text-[11px] text-white/60 mt-1 animate-pulse">
                    {status.desc}
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Warning check */}
      <div className="mt-8 text-[11px] text-amber-500/80 bg-amber-500/5 border border-amber-500/10 px-4 py-2.5 rounded-xl">
        ⚠️ Result is educational and for reference use only. Always consult medical experts.
      </div>
    </div>
  );
}
