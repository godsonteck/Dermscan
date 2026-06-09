import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.js';
import { Sparkles, Shield, Eye, ArrowRight, CheckCircle2, FlaskConical, Stethoscope, History } from 'lucide-react';

export default function LandingPage() {
  const { isAuthenticated } = useAuth();

  return (
    <div className="bg-[#0a0a0f] min-h-screen relative overflow-hidden text-slate-100 font-sans pb-16">
      
      {/* Decorative Blob Elements */}
      <div className="absolute top-[-20%] right-[-10%] w-[600px] h-[600px] bg-violet-600/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-[20%] left-[-15%] w-[500px] h-[550px] bg-emerald-500/5 rounded-full blur-[120px] pointer-events-none" />

      {/* SECTION 1: HERO */}
      <section className="relative pt-16 md:pt-24 pb-20 px-6 max-w-7xl mx-auto flex flex-col items-center text-center">
        
        {/* Immersive Sonar Radar Decorative Background */}
        <div className="absolute top-[5%] left-1/2 -translate-x-1/2 w-[600px] h-[600px] pointer-events-none opacity-25 flex items-center justify-center">
          <div className="absolute w-[600px] h-[600px] sonar-circle flex items-center justify-center">
            <div className="absolute w-[450px] h-[450px] sonar-circle flex items-center justify-center">
              <div className="absolute w-[300px] h-[300px] sonar-circle flex items-center justify-center">
                <div className="absolute w-[150px] h-[150px] sonar-circle" />
              </div>
            </div>
          </div>
          <div className="radar-sweep-effect" />
          
          {/* Tech coordinates tracking markers */}
          <div className="absolute top-[20%] left-[20%] flex flex-col items-center">
            <span className="w-2 h-2 bg-violet-400 rounded-full animate-ping" />
            <span className="font-mono text-[9px] text-violet-400/60 mt-1">SCANNING_FACIAL_GRID_A</span>
          </div>
          <div className="absolute bottom-[25%] right-[15%] flex flex-col items-center">
            <span className="w-2 h-2 bg-[#10b981] rounded-full animate-ping" />
            <span className="font-mono text-[9px] text-[#10b981]/60 mt-1">INTEGRITY_INDEX_94%</span>
          </div>
        </div>

        {/* Pulsing Badge */}
        <div className="inline-flex items-center gap-2 bg-violet-500/10 border border-violet-500/25 rounded-full px-4 py-1.5 mb-6 animate-pulse z-10">
          <span className="w-2 h-2 rounded-full bg-violet-400 shadow-[0_0_10px_#38bdf8]" />
          <span className="text-[10px] md:text-xs font-bold uppercase tracking-wider text-violet-300 font-mono">
            DermScan SYSTEMS // STATUS: ACTIVE
          </span>
        </div>

        {/* Title */}
        <h1 className="font-serif font-black text-5xl md:text-7xl tracking-tight text-white mb-6 leading-[1.08]">
          Detect. Diagnose.<br />
          <span className="bg-gradient-to-r from-violet-400 via-indigo-300 to-emerald-400 bg-clip-text text-transparent">
            Heal Your Skin.
          </span>
        </h1>

        {/* Subhead */}
        <p className="text-base md:text-lg text-white/65 max-w-2xl mb-10 leading-relaxed font-light">
          Upload a photo of your skin condition, input symptoms, and immediately receive an AI-powered diagnostic classification, severity review, clinical causes, and individual skincare product recommendations.
        </p>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-4 items-center justify-center w-full mb-12">
          <Link
            to={isAuthenticated ? "/scan/new" : "/register"}
            className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-violet-500 to-fuchsia-600 border-none rounded-xl font-bold text-sm text-white tracking-wider hover:opacity-95 shadow-xl shadow-violet-500/30 hover:-translate-y-0.5 active:scale-98 transition duration-200"
          >
            START FREE SCAN →
          </Link>
          <a
            href="#how-it-works"
            className="w-full sm:w-auto px-8 py-4 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 rounded-xl font-bold text-sm text-white/80 hover:text-white transition duration-200"
          >
            How it works
          </a>
        </div>

        {/* Quick Checkpoints */}
        <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-3 text-xs text-white/45">
          <span className="flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Educational Sandbox
          </span>
          <span className="flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Gemini 3.5 AI Powered
          </span>
          <span className="flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Instantly Retrievable
          </span>
        </div>
      </section>

      {/* SECTION 2: HOW IT WORKS */}
      <section id="how-it-works" className="py-20 px-6 border-y border-white/5 bg-[#111118]/40 relative">
        <div className="max-w-7xl mx-auto">
          {/* Eyebrow / Headline */}
          <div className="text-center mb-16">
            <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-violet-400 block mb-3">HOW IT WORKS</span>
            <h2 className="font-serif font-bold text-3xl md:text-5xl text-slate-100">
              Three Steps To Absolute Clarity
            </h2>
          </div>

          {/* Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Step 1 */}
            <div className="bg-[#111118]/80 border border-white/8 rounded-2xl p-8 relative overflow-hidden group hover:border-white/15 transition-all">
              <span className="absolute top-2 right-4 font-serif text-8xl font-black text-white/[0.03] select-none">01</span>
              <div className="text-4xl mb-6">📸</div>
              <h3 className="text-base font-bold text-white mb-3">Upload a Photo</h3>
              <p className="text-xs text-white/60 leading-relaxed">
                Take a clear close-up picture of the affected skin area on your face, neck, arms, or back and upload it cleanly.
              </p>
            </div>

            {/* Step 2 */}
            <div className="bg-[#111118]/80 border border-white/8 rounded-2xl p-8 relative overflow-hidden group hover:border-white/15 transition-all">
              <span className="absolute top-2 right-4 font-serif text-8xl font-black text-white/[0.03] select-none">02</span>
              <div className="text-4xl mb-6">🔬</div>
              <h3 className="text-base font-bold text-white mb-3">Symptom Assessment</h3>
              <p className="text-xs text-white/60 leading-relaxed">
                Select your matching symptoms (itching, scaling, redness, burning) to complement image visual indicators.
              </p>
            </div>

            {/* Step 3 */}
            <div className="bg-[#111118]/80 border border-white/8 rounded-2xl p-8 relative overflow-hidden group hover:border-white/15 transition-all">
              <span className="absolute top-2 right-4 font-serif text-8xl font-black text-white/[0.03] select-none">03</span>
              <div className="text-4xl mb-6">💊</div>
              <h3 className="text-base font-bold text-white mb-3">Dermatology Insight</h3>
              <p className="text-xs text-white/60 leading-relaxed">
                Receive medical conditions detection, causes, severity warnings, daily care routines, and clinically useful products.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 3: FEATURES */}
      <section className="py-24 px-6 max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-violet-400 block mb-3">PRODUCT OFFERINGS</span>
          <h2 className="font-serif font-bold text-3xl md:text-5xl text-slate-100">
            Everything You Need In One Dashboard
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* F1 */}
          <div className="bg-[#111118] border border-white/5 p-6 rounded-2xl flex gap-4">
            <FlaskConical className="w-8 h-8 text-violet-400 shrink-0" />
            <div>
              <h4 className="text-sm font-bold text-white mb-1.5">Deep Image Classification</h4>
              <p className="text-xs text-white/60 leading-relaxed">AI analyzes skin lesions, pigmentations, and pores to classify condition variants.</p>
            </div>
          </div>

          {/* F2 */}
          <div className="bg-[#111118] border border-white/5 p-6 rounded-2xl flex gap-4">
            <Stethoscope className="w-8 h-8 text-violet-400 shrink-0" />
            <div>
              <h4 className="text-sm font-bold text-white mb-1.5">Clinical Diagnoses</h4>
              <p className="text-xs text-white/60 leading-relaxed">Generates comprehensive reviews containing diagnostic symptoms, causes, and warnings.</p>
            </div>
          </div>

          {/* F3 */}
          <div className="bg-[#111118] border border-white/5 p-6 rounded-2xl flex gap-4">
            <Sparkles className="w-8 h-8 text-violet-400 shrink-0" />
            <div>
              <h4 className="text-sm font-bold text-white mb-1.5">Suggested Products</h4>
              <p className="text-xs text-white/60 leading-relaxed">Recommends therapeutic cleansers, barrier-repair moisturizers, gels, and ointments.</p>
            </div>
          </div>

          {/* F4 */}
          <div className="bg-[#111118] border border-white/5 p-6 rounded-2xl flex gap-4">
            <Shield className="w-8 h-8 text-violet-400 shrink-0" />
            <div>
              <h4 className="text-sm font-bold text-white mb-1.5">Daily Care Routines</h4>
              <p className="text-xs text-white/60 leading-relaxed">Outlines exact morning and evening step logs to protect the skin barrier and accelerate healing.</p>
            </div>
          </div>

          {/* F5 */}
          <div className="bg-[#111118] border border-white/5 p-6 rounded-2xl flex gap-4">
            <History className="w-8 h-8 text-violet-400 shrink-0" />
            <div>
              <h4 className="text-sm font-bold text-white mb-1.5">Persistent Scan Archiving</h4>
              <p className="text-xs text-white/60 leading-relaxed">Secure history page saves and lists past analysis scans to evaluate progress over time.</p>
            </div>
          </div>

          {/* F6 */}
          <div className="bg-[#111118] border border-white/5 p-6 rounded-2xl flex gap-4">
            <Eye className="w-8 h-8 text-violet-400 shrink-0" />
            <div>
              <h4 className="text-sm font-bold text-white mb-1.5">Privacy Conscious</h4>
              <p className="text-xs text-white/60 leading-relaxed">Account actions secured via local JWT. Complete authorization barriers guard private entries.</p>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 4: CTA BANNER */}
      <section className="px-6 max-w-5xl mx-auto my-12">
        <div className="relative rounded-3xl bg-gradient-to-tr from-violet-800 to-indigo-900 border border-white/10 p-10 md:p-14 text-center overflow-hidden">
          {/* Subtle orb background */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-indigo-500/15 rounded-full blur-[80px]" />

          <div className="relative z-10">
            <h2 className="font-serif font-bold text-3xl md:text-4xl text-white mb-4">
              Ready To Clear Up Your Skin Outlook?
            </h2>
            <p className="text-indigo-200/85 text-xs md:text-sm max-w-lg mx-auto mb-8 font-light">
              Join thousands of clinical testing volunteers getting instant skin disease detections, symptom lists, and therapeutic selections.
            </p>
            <Link
              to={isAuthenticated ? "/scan/new" : "/register"}
              className="px-8 py-3.5 bg-white text-indigo-950 font-bold rounded-xl text-xs hover:bg-slate-100 transition active:scale-98"
            >
              CREATE FREE ACCOUNT NOW
            </Link>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="mt-20 pt-8 border-t border-white/5 text-center px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-white/40">
          <div className="font-bold flex items-center gap-1.5">
            <span>🔬</span> DermScan AI
          </div>
          <p>© 2206 DermScan AI — Ho Technical University Project. All Rights Reserved.</p>
          <div className="max-w-xs md:text-right">
            Disclaimer: Educational demo purpose only. This app is not a clinical tool or substitute for professional medical guidelines.
          </div>
        </div>
      </footer>
    </div>
  );
}
