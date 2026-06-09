import React, { useState, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api/client.js';
import { Scan } from '../types/index.js';
import AnalyzingLoader from '../components/AnalyzingLoader.js';
import { ArrowLeft, Upload, Check, X, ShieldAlert, ShoppingBag, Eye } from 'lucide-react';
import toast from 'react-hot-toast';

const BODY_PARTS = ['Face', 'Scalp', 'Neck', 'Chest', 'Back', 'Arms', 'Hands', 'Legs', 'Feet', 'Other'];
const SKIN_TYPES = ['Oily', 'Dry', 'Combination', 'Sensitive', 'Normal'];
const SYMPTOMS = [
  'Itching', 'Burning sensation', 'Redness', 'Swelling', 'Dry/Flaky skin',
  'Blisters', 'Rash', 'Discoloration', 'Pus/Discharge', 'Pain/Tenderness',
  'Scaling', 'Bleeding', 'Bumps/Pimples', 'Darkening', 'Hair loss nearby', 'Oozing'
];

export default function NewScanPage() {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Wizard state machine
  const [step, setStep] = useState(1);
  const [isSubmitLoading, setIsSubmitLoading] = useState(false);

  // Form selections data state
  const [imageSrc, setImageSrc] = useState<string | null>(null); // base64 string
  const [bodyPart, setBodyPart] = useState('');
  const [duration, setDuration] = useState('');
  const [skinType, setSkinType] = useState('');
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);

  // File Upload Handlers
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      toast.error('File exceeds limits: max image upload capacity is 10MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setImageSrc(reader.result);
        toast.success('Visual asset loaded successfully!');
      }
    };
    reader.onerror = () => {
      toast.error('Could not parse image files.');
    };
    reader.readAsDataURL(file);
  };

  const triggerFileSelect = () => {
    fileInputRef.current?.click();
  };

  const removeSelectedImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setImageSrc(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Drag and Drop implementation
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        toast.error('Unsupported formats - please drag JPEG, PNG, or WEBP images');
        return;
      }
      
      if (file.size > 10 * 1024 * 1024) {
        toast.error('File too large: maximum capacity is 10MB.');
        return;
      }

      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          setImageSrc(reader.result);
          toast.success('Visual asset loaded!');
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Symptoms Selection Handlers
  const toggleSymptom = (symptom: string) => {
    setSelectedSymptoms((prev) =>
      prev.includes(symptom)
        ? prev.filter((s) => s !== symptom)
        : [...prev, symptom]
    );
  };

  // Step Validation Helpers
  const isStep1Valid = () => {
    return bodyPart && duration;
  };

  const handleNextStep = () => {
    if (step === 1 && !isStep1Valid()) {
      toast.error('Affected Body Part and Duration are required fields to proceed.');
      return;
    }
    setStep((prev) => prev + 1);
  };

  const handleBackStep = () => {
    setStep((prev) => prev - 1);
  };

  const handleSubmitAnalysis = async () => {
    setIsSubmitLoading(true);
    try {
      const response = await api.post<Scan>('/scans/analyze', {
        image: imageSrc,
        body_part: bodyPart,
        duration,
        skin_type: skinType,
        symptoms: selectedSymptoms
      });
      toast.success('Dermatology analysis formulated!');
      navigate(`/scan/${response.data.id}`);
    } catch (err: any) {
      console.error(err);
      toast.error(err.response?.data?.error || 'Diagnostic query failed. Please verify API key settings.');
      setIsSubmitLoading(false);
    }
  };

  if (isSubmitLoading) {
    return (
      <div className="bg-transparent min-h-[calc(100vh-68px)] flex items-center justify-center">
        <AnalyzingLoader />
      </div>
    );
  }

  return (
    <div className="bg-transparent min-h-[calc(100vh-68px)] px-6 py-12 relative text-slate-100">
      <div className="max-w-2xl mx-auto space-y-8">
        
        {/* Header Back controls */}
        <div className="flex items-center gap-4">
          <Link
            to="/dashboard"
            className="w-10 h-10 rounded-xl bg-[#111118] border border-white/8 flex items-center justify-center hover:bg-white/5 hover:border-white/20 text-white transition"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-violet-400 block mb-1">NEW SCAN</span>
            <h1 className="font-serif font-bold text-3xl text-white">Analyze Your Skin</h1>
          </div>
        </div>

        {/* Wizard Multi-Step Progress Tracker */}
        <div className="bg-[#111118]/80 border border-white/5 rounded-2xl p-5 flex items-center justify-between">
          <div className="flex items-center gap-3 flex-1 justify-center md:justify-start">
            <span className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs ${step >= 1 ? 'bg-violet-500 text-white' : 'bg-white/5 text-white/40'}`}>
              {step > 1 ? <Check className="w-4 h-4" /> : '1'}
            </span>
            <span className={`text-xs font-bold ${step === 1 ? 'text-violet-400' : 'text-white/60'}`}>Details & Photo</span>
          </div>
          <div className="hidden md:block h-[1px] bg-white/10 w-12 shrink-0 mx-2" />
          
          <div className="flex items-center gap-3 flex-1 justify-center">
            <span className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs ${step >= 2 ? 'bg-violet-500 text-white' : 'bg-white/5 text-white/40'}`}>
              {step > 2 ? <Check className="w-4 h-4" /> : '2'}
            </span>
            <span className={`text-xs font-bold ${step === 2 ? 'text-violet-400' : 'text-white/60'}`}>Symptom logs</span>
          </div>
          <div className="hidden md:block h-[1px] bg-white/10 w-12 shrink-0 mx-2" />

          <div className="flex items-center gap-3 flex-1 justify-center md:justify-end">
            <span className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs ${step >= 3 ? 'bg-violet-500 text-white' : 'bg-white/5 text-white/40'}`}>
              3
            </span>
            <span className={`text-xs font-bold ${step === 3 ? 'text-violet-400' : 'text-white/60'}`}>Review details</span>
          </div>
        </div>

        {/* ========================================================
            STEP 1: DETAILS & PHOTO
            ======================================================== */}
        {step === 1 && (
          <div className="space-y-6 bg-[#111118] border border-white/8 rounded-3xl p-6 md:p-8">
            <h2 className="text-xl font-bold font-serif text-white">Upload Area and Condition Details</h2>
            
            {/* Dash Box Drag & Drop */}
            <div 
              onClick={triggerFileSelect}
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              className="border-2 border-dashed border-white/10 hover:border-violet-500/50 bg-white/3 rounded-2xl h-56 flex flex-col items-center justify-center text-center p-6 cursor-pointer relative overflow-hidden transition group"
            >
              {imageSrc ? (
                <>
                  <img src={imageSrc} alt="Diagnostic attachment" className="absolute inset-0 w-full h-full object-cover" />
                  <div className="absolute top-3 right-3 flex gap-2">
                    <span className="bg-emerald-500/90 text-white text-[10px] uppercase font-bold tracking-wider px-3 py-1 rounded-lg flex items-center gap-1 shadow-md">
                      <Check className="w-3.5 h-3.5" /> Uploaded
                    </span>
                    <button
                      onClick={removeSelectedImage}
                      className="bg-rose-500/90 text-white p-1 rounded-lg hover:bg-rose-600 transition shadow-md"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <Upload className="w-10 h-10 text-white/30 mb-3 group-hover:scale-110 transition duration-150" />
                  <p className="text-sm font-bold text-slate-200">Click to upload or drag & drop</p>
                  <p className="text-[11px] text-white/40 mt-1 max-w-xs leading-relaxed">
                    JPG, PNG, or WEBP format. Maximum image file capacity is 10MB.
                  </p>
                </>
              )}
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept="image/*"
                className="hidden"
              />
            </div>

            {/* Region Selector */}
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-white/55 block">Affected Body Part *</label>
              <div className="flex flex-wrap gap-2">
                {BODY_PARTS.map((region) => {
                  const isSelected = bodyPart === region;
                  return (
                    <button
                      key={region}
                      type="button"
                      onClick={() => setBodyPart(region)}
                      className={`px-3.5 py-2 text-xs font-semibold rounded-xl border transition ${
                        isSelected 
                          ? 'bg-violet-500/10 border-violet-500 text-violet-400 flex items-center gap-1.5' 
                          : 'bg-white/3 border-white/5 text-white/70 hover:bg-white/5'
                      }`}
                    >
                      {isSelected && <Check className="w-3.5 h-3.5" />}
                      {region}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Duration text */}
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-white/55 block">How long have you had it? *</label>
              <input
                type="text"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                placeholder="e.g. 5 days, about two weeks, 1 month..."
                className="bg-white/5 border border-white/10 hover:border-white/15 focus:border-violet-500/60 focus:ring-4 focus:ring-violet-500/10 text-slate-100 text-sm px-4 py-3 rounded-xl w-full placeholder-white/30 outline-none transition"
              />
            </div>

            {/* Skin Selector */}
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-white/55 block">Your Skin Type (optional)</label>
              <div className="flex flex-wrap gap-2">
                {SKIN_TYPES.map((type) => {
                  const isSelected = skinType === type;
                  return (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setSkinType(type)}
                      className={`px-3.5 py-2 text-xs font-semibold rounded-xl border transition ${
                        isSelected 
                          ? 'bg-violet-500/10 border-violet-500 text-violet-400 flex items-center gap-1.5' 
                          : 'bg-white/3 border-white/5 text-white/70 hover:bg-white/5'
                      }`}
                    >
                      {isSelected && <Check className="w-3.5 h-3.5" />}
                      {type}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Next buttons */}
            <button
              type="button"
              onClick={handleNextStep}
              className="w-full bg-gradient-to-r from-violet-500 to-indigo-600 font-bold py-3.5 px-6 rounded-xl text-sm hover:opacity-95 tracking-wider active:scale-98 transition flex items-center justify-center gap-2"
            >
              CONTINUE TO SYMPTOMS →
            </button>
          </div>
        )}

        {/* ========================================================
            STEP 2: SYMPTOMS SELECTION
            ======================================================== */}
        {step === 2 && (
          <div className="space-y-6 bg-[#111118] border border-white/8 rounded-3xl p-6 md:p-8">
            <div className="flex justify-between items-center pb-2">
              <div>
                <h2 className="text-xl font-bold font-serif text-white">What symptoms are you experiencing?</h2>
                <p className="text-xs text-white/50 mt-1">Select all matching symptom markers.</p>
              </div>
              {selectedSymptoms.length > 0 && (
                <span className="bg-violet-500/15 text-violet-400 text-[10px] font-bold px-2.5 py-1 rounded-full border border-violet-500/20">
                  {selectedSymptoms.length} SELECTED
                </span>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3">
              {SYMPTOMS.map((symptom) => {
                const isSelected = selectedSymptoms.includes(symptom);
                return (
                  <button
                    key={symptom}
                    type="button"
                    onClick={() => toggleSymptom(symptom)}
                    className={`p-3 text-xs font-semibold rounded-xl border text-left transition flex items-center justify-between ${
                      isSelected 
                        ? 'bg-violet-500/10 border-violet-500 text-violet-400 font-bold' 
                        : 'bg-white/3 border-white/5 text-white/70 hover:bg-white/5'
                    }`}
                  >
                    <span>{symptom}</span>
                    {isSelected && <Check className="w-4 h-4 shrink-0 text-violet-400" />}
                  </button>
                );
              })}
            </div>

            <div className="flex gap-4 pt-4 border-t border-white/5">
              <button
                type="button"
                onClick={handleBackStep}
                className="flex-1 px-5 py-3.5 border border-white/10 hover:border-white/20 hover:bg-white/5 rounded-xl font-bold text-xs text-white transition"
              >
                ← BACK
              </button>
              <button
                type="button"
                onClick={handleNextStep}
                className="flex-[2] py-3.5 bg-gradient-to-r from-violet-500 to-indigo-600 hover:opacity-95 text-white font-bold rounded-xl text-xs tracking-wider transition"
              >
                NEXT: REVIEW SELECTIONS →
              </button>
            </div>
          </div>
        )}

        {/* ========================================================
            STEP 3: REVIEW DETAILS
            ======================================================== */}
        {step === 3 && (
          <div className="space-y-6 bg-[#111118] border border-white/8 rounded-3xl p-6 md:p-8">
            <h2 className="text-xl font-bold font-serif text-white">Review Your Diagnostics Submission</h2>
            <p className="text-xs text-white/50 leading-relaxed mb-4">
              Please double check all selections below before committing to the Google Gemini AI analysis pipeline.
            </p>

            {/* Recap Card */}
            <div className="border border-white/5 rounded-2xl p-5 bg-white/1 space-y-4 text-xs">
              {/* Photo recap */}
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-slate-900 border border-white/5 rounded-xl flex items-center justify-center shrink-0 overflow-hidden">
                  {imageSrc ? (
                    <img src={imageSrc} alt="attachment" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-xl">📸</span>
                  )}
                </div>
                <div>
                  <h4 className="font-bold text-white leading-none">Photo Record</h4>
                  <p className="text-[10px] text-white/55 mt-1">
                    {imageSrc ? 'Valid diagnostic image attached' : 'No visual file uploaded (Symptom only analyze)'}
                  </p>
                </div>
              </div>

              {/* Specs recap */}
              <div className="grid grid-cols-3 gap-4 pt-3 border-t border-white/5">
                <div>
                  <span className="text-white/45 uppercase tracking-wider block text-[9px] font-bold">Region</span>
                  <span className="text-white font-bold block mt-0.5">{bodyPart}</span>
                </div>
                <div>
                  <span className="text-white/45 uppercase tracking-wider block text-[9px] font-bold">Duration</span>
                  <span className="text-white font-bold block mt-0.5">{duration}</span>
                </div>
                <div>
                  <span className="text-white/45 uppercase tracking-wider block text-[9px] font-bold">Skin profile</span>
                  <span className="text-white font-bold block mt-0.5">{skinType || 'Not specified'}</span>
                </div>
              </div>

              {/* Symptoms tags */}
              <div className="pt-3 border-t border-white/5">
                <span className="text-white/45 uppercase tracking-wider block text-[9px] font-bold mb-1.5">Symptoms Reported</span>
                {selectedSymptoms.length > 0 ? (
                  <div className="flex flex-wrap gap-1.5">
                    {selectedSymptoms.map((sym, idx) => (
                      <span key={idx} className="bg-white/5 text-white/80 px-2 py-0.5 rounded text-[10px] font-semibold border border-white/5">
                        {sym}
                      </span>
                    ))}
                  </div>
                ) : (
                  <span className="text-white/45 italic font-medium block">No symptomatic markers recorded</span>
                )}
              </div>
            </div>

            {/* Warning advisory card */}
            <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-4 flex gap-3 text-left">
              <ShieldAlert className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-xs font-bold text-amber-400">Diagnostic Disclaimer Warning</h4>
                <p className="text-[10px] text-white/60 mt-1 leading-normal max-w-md">
                  This educational web program applies AI models to approximate diagnostic classes. Results are informational, for sandbox university evaluation, and do not replace physical doctor visits.
                </p>
              </div>
            </div>

            {/* Commit actions */}
            <div className="flex gap-4 pt-4 border-t border-white/5">
              <button
                type="button"
                onClick={handleBackStep}
                className="flex-1 px-5 py-3.5 border border-white/10 hover:border-white/20 hover:bg-white/5 rounded-xl font-bold text-xs text-white transition"
              >
                ← ADJUST DETAILS
              </button>
              <button
                type="button"
                onClick={handleSubmitAnalysis}
                className="flex-[2] py-3.5 bg-gradient-to-r from-violet-500 via-indigo-600 to-fuchsia-600 hover:opacity-95 text-white font-black rounded-xl text-xs tracking-wider shadow-lg shadow-violet-500/30 transition flex items-center justify-center gap-2"
              >
                COMMIT LIVE AI REPORT 🔬
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
