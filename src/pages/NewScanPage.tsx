import React, { useState, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api/client.js';
import { Scan } from '../types/index.js';
import AnalyzingLoader from '../components/AnalyzingLoader.js';
import { ArrowLeft, Upload, Check, X, ShieldAlert, ShoppingBag, Eye } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext.js';

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
  const { user } = useAuth();

  // Wizard state machine
  const [step, setStep] = useState(1);
  const [isSubmitLoading, setIsSubmitLoading] = useState(false);

  // Form selections data state
  const [imageSrc, setImageSrc] = useState<string | null>(null); // base64 string
  const [bodyPart, setBodyPart] = useState('');
  const [duration, setDuration] = useState('');
  const [skinType, setSkinType] = useState('');
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);

  // Pre-populate skin type if configured in active profile
  React.useEffect(() => {
    if (user && user.skin_type) {
      const formatted = user.skin_type.charAt(0).toUpperCase() + user.skin_type.slice(1).toLowerCase();
      if (SKIN_TYPES.includes(formatted)) {
        setSkinType(formatted);
      }
    }
  }, [user]);

  // Camera capture state
  const [useCamera, setUseCamera] = useState(false);
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('environment');
  const [isCameraLoading, setIsCameraLoading] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Stop camera helper
  const stopCamera = () => {
    if (cameraStream) {
      cameraStream.getTracks().forEach((track) => track.stop());
      setCameraStream(null);
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  };

  // Start camera helper
  const startCamera = async (mode: 'user' | 'environment' = facingMode) => {
    setIsCameraLoading(true);
    setCameraError(null);
    setUseCamera(true);

    try {
      // Release any current stream
      if (cameraStream) {
        cameraStream.getTracks().forEach((t) => t.stop());
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: mode,
          width: { ideal: 1280 },
          height: { ideal: 720 }
        },
        audio: false
      });

      setCameraStream(stream);

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play().catch(e => console.error("Video play error:", e));
      }
    } catch (err: any) {
      console.error("Camera access failed:", err);
      // Fallback request
      try {
        const fallStream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: false
        });
        setCameraStream(fallStream);
        if (videoRef.current) {
          videoRef.current.srcObject = fallStream;
          videoRef.current.play().catch(e => console.error("Fallback video play error:", e));
        }
      } catch (fallErr) {
        console.error("Fallback general camera failed:", fallErr);
        setCameraError('Unable to lock camera. Please check browser camera block-lists or use file uploads.');
        toast.error('Camera connection could not be established.');
      }
    } finally {
      setIsCameraLoading(false);
    }
  };

  // Capture frame from the live video element onto a canvas
  const capturePhoto = () => {
    if (!videoRef.current) return;
    try {
      const video = videoRef.current;
      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth || 640;
      canvas.height = video.videoHeight || 480;

      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
        setImageSrc(dataUrl);
        toast.success('Visual capture recorded successfully!');
        stopCamera();
        setUseCamera(false);
      }
    } catch (err) {
      console.error("Capture capturePhoto error:", err);
      toast.error('Failed to capture frame from video.');
    }
  };

  // Clean up stream of camera when unmounting
  React.useEffect(() => {
    return () => {
      if (cameraStream) {
        cameraStream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [cameraStream]);

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
            
            {/* Visual Capture / Image Upload Section */}
            {!imageSrc && !useCamera && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* File Drop Area */}
                <div 
                  onClick={triggerFileSelect}
                  onDragOver={handleDragOver}
                  onDrop={handleDrop}
                  className="border-2 border-dashed border-white/10 hover:border-violet-500/50 bg-white/3 rounded-2xl h-56 flex flex-col items-center justify-center text-center p-6 cursor-pointer relative overflow-hidden transition group"
                >
                  <Upload className="w-8 h-8 text-white/30 mb-2.5 group-hover:scale-110 transition duration-150" />
                  <p className="text-sm font-bold text-slate-200">Upload Image File</p>
                  <p className="text-[11px] text-white/40 mt-1 max-w-xs leading-relaxed">
                    Click or drag & drop. Supports JPEG, PNG, WEBP files up to 10MB.
                  </p>
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    accept="image/*"
                    className="hidden"
                  />
                </div>

                {/* Webcam Option */}
                <button
                  type="button"
                  onClick={() => startCamera('environment')}
                  className="border-2 border-dashed border-white/10 hover:border-violet-500/55 hover:bg-white/5 bg-white/3 rounded-2xl h-56 flex flex-col items-center justify-center text-center p-6 cursor-pointer relative overflow-hidden transition group text-left w-full"
                >
                  <div className="w-9 h-9 rounded-full bg-violet-500/10 flex items-center justify-center mb-2.5 group-hover:scale-110 transition duration-150 border border-violet-500/20 text-lg">
                    📷
                  </div>
                  <p className="text-sm font-bold text-slate-200">Use Live Camera</p>
                  <p className="text-[11px] text-white/40 mt-1 max-w-xs leading-relaxed">
                    Access mobile lens or web-cam. Features an intuitive overlay guide.
                  </p>
                </button>
              </div>
            )}

            {/* Active Camera Preview Area */}
            {useCamera && (
              <div className="relative border border-white/10 bg-black rounded-3xl overflow-hidden aspect-video max-h-[380px] w-full flex flex-col justify-center items-center">
                {/* Video feed */}
                <video
                  ref={videoRef}
                  playsInline
                  autoPlay
                  muted
                  className="w-full h-full object-cover"
                />

                {/* Camera Overlay Guide Target */}
                <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                  {/* Backdrop shadow mask to highlight target circle */}
                  <div className="absolute inset-0 bg-black/40" />

                  {/* Centering guide frame (cutout) */}
                  <div className="relative w-44 h-44 sm:w-52 sm:h-52 rounded-full border-2 border-dashed border-violet-400 flex items-center justify-center animate-pulse duration-1000 shadow-[0_0_0_9999px_rgba(17,17,24,0.65)]">
                    
                    {/* Corner Bracket markers */}
                    <div className="absolute top-[-3px] left-[-3px] w-5 h-5 border-t-4 border-l-4 border-violet-400 rounded-tl-lg" />
                    <div className="absolute top-[-3px] right-[-3px] w-5 h-5 border-t-4 border-r-4 border-violet-400 rounded-tr-lg" />
                    <div className="absolute bottom-[-3px] left-[-3px] w-5 h-5 border-b-4 border-l-4 border-violet-400 rounded-bl-lg" />
                    <div className="absolute bottom-[-3px] right-[-3px] w-5 h-5 border-b-4 border-r-4 border-violet-400 rounded-br-lg" />

                    {/* Central micro croshair */}
                    <div className="w-2.5 h-2.5 relative">
                      <div className="absolute left-[4px] top-0 w-[2px] h-2.5 bg-violet-400/60" />
                      <div className="absolute left-0 top-[4px] w-2.5 h-[2px] bg-violet-400/60" />
                    </div>

                    {/* Extra pulsing micro-ring */}
                    <div className="absolute inset-[-10px] rounded-full border border-violet-500/20 animate-ping duration-[1800ms] opacity-50" />
                  </div>

                  {/* Align Instructions Pill */}
                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-slate-900/95 backdrop-blur-md border border-white/10 px-4 py-1 rounded-full shadow-md flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-pulse" />
                    <span className="text-[10px] uppercase font-bold tracking-widest text-[#d8b4fe]">
                      Align lesion in center focus
                    </span>
                  </div>

                  {/* Light guidance banner */}
                  <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-black/60 backdrop-blur-sm px-3.5 py-1 rounded-lg border border-white/5">
                    <span className="text-[9px] text-white/70 font-semibold tracking-wide">
                      💡 Hold camera 4-6 inches (10-15cm) away with clear light
                    </span>
                  </div>
                </div>

                {/* Loading state bar */}
                {isCameraLoading && (
                  <div className="absolute inset-0 bg-[#111118] flex flex-col items-center justify-center gap-3">
                    <div className="w-7 h-7 rounded-full border-2 border-violet-400 border-t-transparent animate-spin" />
                    <span className="text-xs text-white/50 tracking-widest uppercase font-bold">Waking camera device...</span>
                  </div>
                )}

                {/* Device connection errors */}
                {cameraError && (
                  <div className="absolute inset-0 bg-[#111118] flex flex-col items-center justify-center p-6 text-center gap-2.5">
                    <span className="text-xl">⚠️</span>
                    <p className="text-xs text-white/80 font-semibold leading-relaxed max-w-sm">{cameraError}</p>
                    <button 
                      onClick={() => setUseCamera(false)}
                      className="bg-white/5 hover:bg-white/10 text-white text-xs px-4 py-2 rounded-lg border border-white/5 font-semibold"
                    >
                      Close and Use File Upload
                    </button>
                  </div>
                )}

                {/* Controls overlay */}
                <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent p-4 flex items-center justify-between pointer-events-auto">
                  <button
                    type="button"
                    onClick={() => {
                      stopCamera();
                      setUseCamera(false);
                    }}
                    className="px-3.5 py-2 bg-black/60 hover:bg-black/80 rounded-xl text-white/70 hover:text-white transition border border-white/5 cursor-pointer flex items-center gap-1.5 text-xs font-semibold"
                  >
                    <X className="w-4 h-4" />
                    Cancel
                  </button>

                  {/* Shutter capture trigger button */}
                  <button
                    type="button"
                    onClick={capturePhoto}
                    disabled={isCameraLoading || !!cameraError}
                    className="p-1 rounded-full bg-white hover:bg-slate-100 transition duration-150 disabled:opacity-40 select-none shadow-xl border-4 border-black/35 hover:scale-105 active:scale-95 cursor-pointer"
                  >
                    <div className="w-12 h-12 rounded-full border-2 border-black flex items-center justify-center bg-transparent">
                      <div className="w-5 h-5 rounded-full bg-violet-600" />
                    </div>
                  </button>

                  {/* Mirror facing toggler button */}
                  <button
                    type="button"
                    onClick={() => {
                      const nextMode = facingMode === 'user' ? 'environment' : 'user';
                      setFacingMode(nextMode);
                      startCamera(nextMode);
                    }}
                    disabled={isCameraLoading || !!cameraError}
                    className="px-3.5 py-2 bg-black/60 hover:bg-black/80 rounded-xl text-white/70 hover:text-white transition border border-white/5 cursor-pointer disabled:opacity-40 text-xs font-semibold flex items-center gap-1.5"
                  >
                    🔄 Switch
                  </button>
                </div>
              </div>
            )}

            {/* Ready/Attached Image Preview Mode */}
            {imageSrc && !useCamera && (
              <div className="relative border border-white/10 bg-white/3 rounded-2xl h-56 flex flex-col items-center justify-center overflow-hidden">
                <img src={imageSrc} alt="Diagnostic attachment" className="absolute inset-0 w-full h-full object-cover" />
                <div className="absolute top-3 right-3 flex gap-2">
                  <span className="bg-emerald-500/90 text-white text-[10px] uppercase font-bold tracking-wider px-3 py-1 rounded-lg flex items-center gap-1 shadow-md">
                    <Check className="w-3.5 h-3.5" /> Ready for Scan
                  </span>
                  <button
                    onClick={removeSelectedImage}
                    className="bg-rose-500/90 text-white p-1 rounded-lg hover:bg-rose-600 transition shadow-md"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

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
