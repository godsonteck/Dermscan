import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../api/client.js';
import { Scan } from '../types/index.js';
import LoadingSpinner from '../components/LoadingSpinner.js';
import SeverityBadge from '../components/SeverityBadge.js';
import ConfidenceBadge from '../components/ConfidenceBadge.js';
import ProductCard from '../components/ProductCard.js';
import { ArrowLeft, Stethoscope, ShoppingBag, Eye, HeartHandshake, AlertTriangle, AlertCircle, Printer, Plus, Calendar, Layers } from 'lucide-react';
import toast from 'react-hot-toast';

enum Tab {
  DIAGNOSIS = 'DIAGNOSIS',
  PRODUCTS = 'PRODUCTS',
  CARE_PLAN = 'CARE_PLAN'
}

export default function ScanResultPage() {
  const { id } = useParams<{ id: string }>();
  const [scan, setScan] = useState<Scan | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<Tab>(Tab.DIAGNOSIS);

  useEffect(() => {
    async function loadScanDetails() {
      try {
        const response = await api.get<Scan>(`/scans/${id}`);
        setScan(response.data);
      } catch (error: any) {
        console.error('Failed to load scan reports:', error);
        toast.error(error.response?.data?.error || 'Could not load diagnostic data report');
      } finally {
        setIsLoading(false);
      }
    }
    if (id) loadScanDetails();
  }, [id]);

  if (isLoading) {
    return <LoadingSpinner fullPage={true} label="Opening your skin check report..." />;
  }

  if (!scan) {
    return (
      <div className="bg-[#0a0a0f] min-h-[calc(100vh-68px)] flex flex-col items-center justify-center p-6 text-center">
        <AlertTriangle className="w-12 h-12 text-rose-500 mb-4" />
        <h2 className="text-xl font-bold font-serif mb-2">Skin Check Not Found</h2>
        <p className="text-xs text-white/50 max-w-sm mb-6">
          The requested skin check report could not be found. It may have been deleted, or you might not have access to it.
        </p>
        <Link to="/dashboard" className="px-6 py-3 bg-violet-600 rounded-xl text-xs font-bold text-white transition hover:opacity-90">
          Return to Dashboard
        </Link>
      </div>
    );
  }

  // Fallback parsers for string arrays if base fields missed or strings
  const parseList = (data: any): string[] => {
    if (!data) return [];
    if (Array.isArray(data)) return data;
    try {
      if (typeof data === 'string') {
        const parsed = JSON.parse(data);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch {
      // split by common markers
      return data.split(/[•\n\,-]/g).map((s: string) => s.trim()).filter(Boolean);
    }
    return [];
  };

  const causesList = parseList(scan.causes);
  const stepsList = parseList(scan.immediate_steps);
  const routineList = parseList(scan.daily_routine);
  const avoidList = parseList(scan.avoid);

  const formattedDate = new Date(scan.created_at).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  return (
    <div className="bg-transparent min-h-[calc(100vh-68px)] px-6 py-10 relative text-slate-100 print:bg-white print:text-black">
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* Upper Navigation Action Bar */}
        <div className="flex justify-between items-center pb-4 border-b border-white/5 print:hidden">
          <Link
            to="/history"
            className="flex items-center gap-1.5 text-xs font-semibold text-white/55 hover:text-white transition"
          >
            <ArrowLeft className="w-4 h-4" />
            BACK TO PAST CHECKS
          </Link>

          <Link
            to="/scan/new"
            className="px-4 py-2 bg-gradient-to-r from-violet-500 to-indigo-600 rounded-xl font-bold text-xs tracking-wide text-white shadow-md shadow-violet-500/20 hover:opacity-95 transition flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" /> Start New Check
          </Link>
        </div>

        {/* Hero scan diagnosis header banner */}
        <div className="bg-gradient-to-tr from-violet-950/20 via-[#111118]/90 to-indigo-950/20 border border-violet-500/15 rounded-3xl p-6 md:p-8 flex flex-col md:flex-row gap-6 items-start md:items-center relative overflow-hidden shadow-2xl">
          {/* Subtle graphic accent */}
          <div className="absolute -bottom-12 -right-12 w-48 h-48 bg-violet-500/5 rounded-full blur-[40px] pointer-events-none" />

          {/* Picture Thumbnail */}
          {scan.image_path ? (
            <div className="w-28 h-28 rounded-2xl overflow-hidden shrink-0 border-2 border-violet-500/30 shadow-lg relative flex items-center justify-center bg-slate-900 mx-auto md:mx-0">
              <img src={scan.image_path} alt={scan.condition} className="w-full h-full object-cover" />
            </div>
          ) : (
            <div className="w-24 h-24 rounded-2xl bg-indigo-505/10 border border-indigo-500/20 shrink-0 flex flex-col items-center justify-center text-3xl mx-auto md:mx-0 text-violet-400">
              <span>🔬</span>
            </div>
          )}

          {/* Summary condition names & badge selectors */}
          <div className="flex-1 space-y-3 text-center md:text-left w-full">
            <div>
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-x-3 gap-y-1 text-xs text-white/50 mb-1">
                <span className="flex items-center gap-1 font-semibold uppercase tracking-wider text-violet-400 font-mono">Skin Check Report</span>
                <span className="w-1 h-1 bg-white/20 rounded-full hidden md:block" />
                <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" />{formattedDate}</span>
              </div>
              <h1 className="font-serif font-black text-2xl md:text-3xl text-white tracking-tight leading-tight">
                {scan.condition || 'Analyzing details...'}
              </h1>
            </div>

            <div className="flex flex-wrap items-center justify-center md:justify-start gap-2">
              <SeverityBadge severity={scan.severity} />
              <ConfidenceBadge confidence={scan.confidence} />
              {scan.body_part && (
                <span className="bg-white/5 border border-white/8 text-[11px] text-white/60 font-semibold px-2.5 py-0.5 rounded-full uppercase tracking-wide">
                  Body Part: {scan.body_part}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Invalid Image Warning Alert Banner */}
        {scan.is_valid_skin_image === false && (
          <div className="bg-amber-500/5 border border-amber-500/20 rounded-3xl p-6 flex items-start gap-4 shadow-lg relative overflow-hidden animate-in slide-in-from-top-4 duration-300">
            <div className="absolute top-0 left-0 w-1.5 h-full bg-amber-500" />
            <AlertCircle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5 animate-pulse" />
            <div className="space-y-1">
              <h4 className="text-xs font-bold text-amber-500 uppercase tracking-widest">Image Does Not Look Like Skin</h4>
              <p className="text-xs text-white/70 leading-relaxed font-light">
                Our skin checked has flagged this photo as unlikely to show human skin, moles, hair, or nails. For highly accurate results and product suggestions, please submit a well-lit, sharp, and centered close-up photo of your skin.
              </p>
            </div>
          </div>
        )}

        {/* Tab Selection Row */}
        <div className="flex border-b border-white/5 gap-4 md:gap-8 pb-px print:hidden overflow-x-auto scrollbar-none">
          <button
            onClick={() => setActiveTab(Tab.DIAGNOSIS)}
            className={`py-3.5 px-1 text-sm font-extrabold uppercase tracking-wider flex items-center gap-2 border-b-2 transition ${
              activeTab === Tab.DIAGNOSIS 
                ? 'border-violet-500 text-violet-400' 
                : 'border-transparent text-white/60 hover:text-white'
            }`}
          >
            <Stethoscope className="w-5 h-5" /> Diagnosis
          </button>
          <button
            onClick={() => setActiveTab(Tab.PRODUCTS)}
            className={`py-3.5 px-1 text-sm font-extrabold uppercase tracking-wider flex items-center gap-2 border-b-2 transition ${
              activeTab === Tab.PRODUCTS 
                ? 'border-violet-500 text-violet-400' 
                : 'border-transparent text-white/60 hover:text-white'
            }`}
          >
            <ShoppingBag className="w-5 h-5" /> Skincare Products
          </button>
          <button
            onClick={() => setActiveTab(Tab.CARE_PLAN)}
            className={`py-3.5 px-1 text-sm font-extrabold uppercase tracking-wider flex items-center gap-2 border-b-2 transition ${
              activeTab === Tab.CARE_PLAN 
                ? 'border-violet-500 text-violet-400' 
                : 'border-transparent text-white/60 hover:text-white'
            }`}
          >
            <HeartHandshake className="w-5 h-5" /> Daily Care Program
          </button>
        </div>

        {/* ========================================================
            TAB 1: DIAGNOSIS CONTENT
            ======================================================== */}
        {(activeTab === Tab.DIAGNOSIS || window.location.search.includes('print')) && (
          <div className="space-y-8 animate-in fade-in duration-200">
            {/* Description */}
            <div className="bg-[#111118] border border-white/5 rounded-2xl p-6 md:p-8 space-y-3.5 shadow-md">
              <span className="text-sm font-black tracking-widest text-violet-400 block font-mono">ABOUT THIS SKIN CONCERN</span>
              <p className="text-base md:text-lg text-white/90 leading-relaxed font-normal">
                {scan.description || 'Our skin analysis results are being made...'}
              </p>
            </div>

            {/* Causes and Risks */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               {/* Causes */}
               <div className="bg-[#111118] border border-white/5 rounded-2xl p-6 md:p-8 space-y-4 shadow-md">
                 <span className="text-xs font-extrabold tracking-widest text-violet-400 block font-mono">COMMON CAUSES</span>
                 {causesList.length > 0 ? (
                   <ul className="space-y-4 text-sm md:text-base leading-relaxed text-white/85 font-normal">
                     {causesList.map((cause, idx) => (
                       <li key={idx} className="flex gap-2.5 items-start">
                         <span className="w-1.5 h-1.5 rounded-full bg-violet-400 shrink-0 mt-2.5" />
                         <span>{cause}</span>
                       </li>
                     ))}
                   </ul>
                 ) : (
                   <p className="text-sm md:text-base text-white/60 italic font-medium">No typical causes specified.</p>
                 )}
               </div>

               {/* Risks */}
               <div className="bg-[#111118] border border-white/5 rounded-2xl p-6 md:p-8 space-y-3 shadow-md">
                 <span className="text-xs font-extrabold tracking-widest text-violet-400 block font-mono">POTENTIAL RISK FACTORS</span>
                 <p className="text-sm md:text-base text-white/85 leading-relaxed font-normal">
                   {scan.risk_factors || 'Risk factors based on visible skin properties and symptoms.'}
                 </p>
               </div>
            </div>

            {/* When to consult warning banner */}
            <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-6 flex gap-4 text-left shadow-md">
              <AlertCircle className="w-6 h-6 text-amber-500 shrink-0 mt-0.5 animate-pulse" />
              <div className="space-y-1.5">
                <h4 className="text-sm font-black text-amber-500 uppercase tracking-wide">WHEN TO SEE A DOCTOR</h4>
                <p className="text-sm text-white/85 leading-relaxed max-w-2xl font-normal">
                  {scan.when_to_see_doctor || 'If the condition does not improve, spreads, hurts, bleeds, or changes color, please consult with a qualified dermatologist near you.'}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================
            TAB 2: RECOMMENDED PRODUCTS
            ======================================================== */}
        {activeTab === Tab.PRODUCTS && (
          <div className="space-y-8 animate-in fade-in duration-200">
            {/* Products advisory banner */}
            <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-4 flex gap-3 text-left items-center shadow-sm">
              <span className="text-xl">💡</span>
              <p className="text-sm text-emerald-400 font-semibold leading-relaxed">
                These product suggestions are tailored for the detected condition. Always do a patch test or consult a doctor before using new products.
              </p>
            </div>

            {/* Products grid */}
            {scan.products && scan.products.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {scan.products.map((product, idx) => (
                  <ProductCard key={idx} product={product} />
                ))}
              </div>
            ) : (
              <div className="bg-[#111118] rounded-2xl border border-white/5 py-12 text-center text-sm text-white/55">
                No custom products were generated for this check.
              </div>
            )}
          </div>
        )}

        {/* ========================================================
            TAB 3: CARE PLAN ROUTINES
            ======================================================== */}
        {activeTab === Tab.CARE_PLAN && (
          <div className="space-y-8 animate-in fade-in duration-200">
            {/* Immediate Steps list */}
            <div className="bg-[#111118] border border-white/5 rounded-2xl p-6 md:p-8 space-y-4 shadow-md">
              <span className="text-xs font-extrabold tracking-widest text-violet-400 block font-mono">NEXT IMPORTANT STEPS</span>
              {stepsList.length > 0 ? (
                <div className="space-y-4">
                  {stepsList.map((stepItem, idx) => (
                    <div key={idx} className="flex gap-4 items-start text-sm text-white/85">
                      <span className="w-7 h-7 rounded-full bg-violet-500/20 text-violet-400 border border-violet-500/30 flex items-center justify-center font-extrabold text-sm shrink-0 mt-0.5">
                        {idx + 1}
                      </span>
                      <p className="leading-relaxed font-normal">{stepItem}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-white/50 italic">No urgent steps suggested.</p>
              )}
            </div>

            {/* Daily routines and Avoid arrays */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Daily routine */}
              <div className="bg-[#111118] border border-white/5 rounded-2xl p-6 md:p-8 space-y-4 shadow-md">
                <span className="text-xs font-extrabold tracking-widest text-emerald-400 block font-mono">DAILY CARE ROUTINE</span>
                {routineList.length > 0 ? (
                  <ul className="space-y-4 text-sm leading-relaxed text-white/80">
                    {routineList.map((task, idx) => (
                      <li key={idx} className="flex gap-2.5 items-start">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0 mt-2" />
                        <span>{task}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-white/50 italic">No specific daily routines needed.</p>
                )}
              </div>

              {/* Avoid panel */}
              <div className="bg-[#111118] border border-white/5 rounded-2xl p-6 md:p-8 space-y-4 shadow-md">
                <span className="text-xs font-extrabold tracking-widest text-rose-400 block font-mono">THINGS TO AVOID</span>
                {avoidList.length > 0 ? (
                  <ul className="space-y-4 text-sm leading-relaxed text-white/80">
                    {avoidList.map((avoidItem, idx) => (
                      <li key={idx} className="flex gap-2.5 items-start text-rose-200/90 font-medium">
                        <span className="text-rose-400 shrink-0 text-sm mt-0.5">✕</span>
                        <span>{avoidItem}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-white/50 italic">No typical restrictions identified.</p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Action button triggers footer */}
        <div className="flex gap-4 pt-6 border-t border-white/5 print:hidden">
          <button
            onClick={() => window.print()}
            className="flex-1 px-5 py-4 border border-white/10 hover:border-white/20 hover:bg-white/5 rounded-xl font-extrabold text-sm text-white transition flex items-center justify-center gap-1.5 shadow-md font-mono"
          >
            <Printer className="w-4.5 h-4.5" /> Save as PDF / Print
          </button>
          
          <Link
            to="/scan/new"
            className="flex-[2] py-4 bg-gradient-to-r from-violet-500 to-indigo-600 hover:opacity-95 text-white font-serif font-black rounded-xl text-center text-sm tracking-wider shadow-lg shadow-violet-500/25 active:scale-98 transition block"
          >
            START NEW SKIN CHECK
          </Link>
        </div>

      </div>
    </div>
  );
}
