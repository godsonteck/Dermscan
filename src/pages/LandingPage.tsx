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

        {/* Clickable descriptive badge */}
        <div className="inline-flex items-center gap-1.5 bg-violet-500/10 border border-violet-500/20 rounded-full px-3.5 py-1.5 mb-6 text-xs text-violet-300 font-medium z-10 select-none">
          ✨ Simple AI-Powered Skin Helper
        </div>

        {/* Title */}
        <h1 className="font-serif font-black text-4xl md:text-6xl tracking-tight text-white mb-6 leading-[1.15]">
          Check Your Skin.<br />
          <span className="bg-gradient-to-r from-violet-400 via-indigo-300 to-emerald-400 bg-clip-text text-transparent">
            Understand the Signs.
          </span>
        </h1>

        {/* Subhead */}
        <p className="text-sm md:text-base text-white/70 max-w-2xl mb-10 leading-relaxed font-normal">
          Simply upload a clear photo of your skin concern and tell us how it feels. Get an instant, easy-to-read AI report highlighting potential conditions, likely causes, and gentle skincare product suggestions.
        </p>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-4 items-center justify-center w-full mb-12 z-15 relative">
          <Link
            to={isAuthenticated ? "/scan/new" : "/register"}
            className="w-full sm:w-auto px-8 py-3.5 bg-gradient-to-r from-violet-600 to-indigo-600 border-none rounded-xl font-bold text-xs text-white tracking-widest hover:opacity-95 shadow-xl shadow-violet-500/15 hover:-translate-y-0.5 active:scale-98 transition duration-200 cursor-pointer"
          >
            START NEW SKIN CHECK →
          </Link>
          <a
            href="#how-it-works"
            className="w-full sm:w-auto px-8 py-3.5 bg-white/5 hover:bg-white/10 border border-white/8 hover:border-white/15 rounded-xl font-bold text-xs text-white/80 hover:text-white transition duration-200"
          >
            How it works
          </a>
        </div>

        {/* Quick Checkpoints */}
        <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-3 text-xs text-white/50">
          <span className="flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Easy to use
          </span>
          <span className="flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Smart AI insights
          </span>
          <span className="flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Instant reports
          </span>
        </div>
      </section>

      {/* SECTION 2: HOW IT WORKS */}
      <section id="how-it-works" className="py-16 px-6 border-y border-white/5 bg-[#111118]/40 relative">
        <div className="max-w-7xl mx-auto">
          {/* Eyebrow / Headline */}
          <div className="text-center mb-12">
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-violet-400 block mb-2">SIMPLE METHOD</span>
            <h2 className="font-serif font-bold text-2xl md:text-4xl text-slate-100">
              Three Easy Steps To Get Your Report
            </h2>
          </div>

          {/* Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Step 1 */}
            <div className="bg-[#111118]/80 border border-white/5 rounded-2xl p-6 relative overflow-hidden group hover:border-white/10 transition-all text-left">
              <span className="absolute top-2 right-4 font-serif text-6xl font-black text-white/[0.02] select-none">01</span>
              <div className="w-10 h-10 rounded-full bg-violet-500/10 flex items-center justify-center text-lg mb-4 text-violet-400">
                📷
              </div>
              <h3 className="text-sm font-bold text-slate-100 mb-2">1. Upload your photo</h3>
              <p className="text-[11px] text-white/50 leading-relaxed font-light">
                Take a clear, close-up photo of your skin concern under good light. Our camera guide will help you center it.
              </p>
            </div>

            {/* Step 2 */}
            <div className="bg-[#111118]/80 border border-white/5 rounded-2xl p-6 relative overflow-hidden group hover:border-white/10 transition-all text-left">
              <span className="absolute top-2 right-4 font-serif text-6xl font-black text-white/[0.02] select-none">02</span>
              <div className="w-10 h-10 rounded-full bg-violet-500/10 flex items-center justify-center text-lg mb-4 text-violet-400">
                ✍️
              </div>
              <h3 className="text-sm font-bold text-slate-100 mb-2">2. Tell us your symptoms</h3>
              <p className="text-[11px] text-white/50 leading-relaxed font-light">
                Select how your skin feels. Choose from options like itching, dryness, flushing, or scaling to customize your scan.
              </p>
            </div>

            {/* Step 3 */}
            <div className="bg-[#111118]/80 border border-white/5 rounded-2xl p-6 relative overflow-hidden group hover:border-white/10 transition-all text-left">
              <span className="absolute top-2 right-4 font-serif text-6xl font-black text-white/[0.02] select-none">03</span>
              <div className="w-10 h-10 rounded-full bg-violet-500/10 flex items-center justify-center text-lg mb-4 text-violet-400">
                📃
              </div>
              <h3 className="text-sm font-bold text-slate-100 mb-2">3. Receive your care profile</h3>
              <p className="text-[11px] text-white/50 leading-relaxed font-light">
                Review possible matching conditions, daily wash routines, and real product brands customized for your skin.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 3: FEATURES */}
      <section className="py-20 px-6 max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-violet-400 block mb-2">HOW IT HELPS YOU</span>
          <h2 className="font-serif font-bold text-2xl md:text-4xl text-slate-100">
            Smart Features Built For Simplicity
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {/* F1 */}
          <div className="bg-[#111118]/80 border border-white/5 p-5 rounded-2xl flex gap-4 text-left">
            <div className="p-2.5 h-10 rounded-xl bg-violet-500/5 text-violet-400 border border-violet-500/15 shrink-0">
              <FlaskConical className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-100 mb-1">Skin Photo Analysis</h4>
              <p className="text-[11px] text-white/50 leading-relaxed font-light">Smart AI carefully reads skin spots, moles, and rashes to match them with medical databases.</p>
            </div>
          </div>

          {/* F2 */}
          <div className="bg-[#111118]/80 border border-white/5 p-5 rounded-2xl flex gap-4 text-left">
            <div className="p-2.5 h-10 rounded-xl bg-violet-500/5 text-violet-400 border border-violet-500/15 shrink-0">
              <Stethoscope className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-100 mb-1">Clear Explanations</h4>
              <p className="text-[11px] text-white/50 leading-relaxed font-light">Provides simple overviews of possible skin issues, common triggers, and when to seek urgent care.</p>
            </div>
          </div>

          {/* F3 */}
          <div className="bg-[#111118]/80 border border-white/5 p-5 rounded-2xl flex gap-4 text-left">
            <div className="p-2.5 h-10 rounded-xl bg-violet-500/5 text-violet-400 border border-violet-500/15 shrink-0">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-100 mb-1">Real Skincare Brands</h4>
              <p className="text-[11px] text-white/50 leading-relaxed font-light">Avoids generic names. Recommends trusted real-world cleansers, healing creams, and sunscreens.</p>
            </div>
          </div>

          {/* F4 */}
          <div className="bg-[#111118]/80 border border-white/5 p-5 rounded-2xl flex gap-4 text-left">
            <div className="p-2.5 h-10 rounded-xl bg-violet-500/5 text-violet-400 border border-violet-500/15 shrink-0">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-100 mb-1">Daily Care Guides</h4>
              <p className="text-[11px] text-white/50 leading-relaxed font-light">Gives step-by-step skincare instructions for morning and night so you know exactly what to do.</p>
            </div>
          </div>

          {/* F5 */}
          <div className="bg-[#111118]/80 border border-white/5 p-5 rounded-2xl flex gap-4 text-left">
            <div className="p-2.5 h-10 rounded-xl bg-violet-500/5 text-violet-400 border border-violet-500/15 shrink-0">
              <History className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-100 mb-1">Track Your Progress</h4>
              <p className="text-[11px] text-white/50 leading-relaxed font-light">Keeps a clean history logs page where you can save past scans and easily check if your skin is healing.</p>
            </div>
          </div>

          {/* F6 */}
          <div className="bg-[#111118]/80 border border-white/5 p-5 rounded-2xl flex gap-4 text-left">
            <div className="p-2.5 h-10 rounded-xl bg-violet-500/5 text-violet-400 border border-violet-500/15 shrink-0">
              <Eye className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-100 mb-1 font-sans">Private & Secure</h4>
              <p className="text-[11px] text-white/50 leading-relaxed font-light">Your personal details are securely stored. Your scans and photos belong strictly to you.</p>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 4: CTA BANNER */}
      <section className="px-6 max-w-5xl mx-auto my-10">
        <div className="relative rounded-2xl bg-gradient-to-tr from-violet-800 to-indigo-950 border border-white/10 p-8 md:p-12 text-center overflow-hidden">
          {/* Subtle orb background */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] bg-indigo-500/10 rounded-full blur-[70px]" />

          <div className="relative z-10 space-y-4">
            <h2 className="font-serif font-bold text-2xl md:text-3xl text-white">
              Ready to Understand Your Skin?
            </h2>
            <p className="text-indigo-200/75 text-[11px] md:text-xs max-w-lg mx-auto leading-relaxed">
              Create your free account today. Start a scan, track your symptoms, and build a personalized skincare profile with smart AI assistance.
            </p>
            <div className="pt-2">
              <Link
                to={isAuthenticated ? "/scan/new" : "/register"}
                className="px-6 py-3 bg-white text-indigo-950 font-bold rounded-xl text-xs hover:bg-slate-100 transition active:scale-98 inline-block cursor-pointer select-none"
              >
                GET STARTED FREE
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
