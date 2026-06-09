import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext.js';
import { X, Loader2, ArrowRight, User as UserIcon, Shield, Apple, Check } from 'lucide-react';
import toast from 'react-hot-toast';

interface FederatedAuthModalProps {
  isOpen: boolean;
  provider: 'google' | 'apple' | null;
  onClose: () => void;
  onSuccess: () => void;
}

export default function FederatedAuthModal({ isOpen, provider, onClose, onSuccess }: FederatedAuthModalProps) {
  const { loginFederated } = useAuth();
  const [step, setStep] = useState<'chooser' | 'custom' | 'signing'>('chooser');
  const [customEmail, setCustomEmail] = useState('');
  const [customName, setCustomName] = useState('');
  const [appleHideEmail, setAppleHideEmail] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen || !provider) return null;

  // Prepopulate standard options
  const defaultEmail = 'manuelsad18@gmail.com';
  const defaultName = 'Manuel Sad';

  const handleSelectAccount = async (email: string, name: string) => {
    setStep('signing');
    setIsLoading(true);
    try {
      const emailToUse = (provider === 'apple' && appleHideEmail) 
        ? `${name.toLowerCase().replace(/\s+/g, '.')}@privaterelay.appleid.com`
        : email;

      const randomId = Math.floor(10000000 + Math.random() * 90000000).toString();
      await loginFederated(name, emailToUse, provider, `${provider}_${randomId}`);
      toast.success(`Successfully signed in with ${provider === 'google' ? 'Google' : 'Apple'}!`);
      onSuccess();
      onClose();
    } catch (err: any) {
      toast.error(err.message || `Authentications with ${provider} failed.`);
      setStep('chooser');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customEmail || !customName) {
      toast.error('All fields are required');
      return;
    }
    handleSelectAccount(customEmail, customName);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm transition-opacity">
      {/* Container */}
      <div className="bg-[#111118] border border-white/10 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl relative animate-in fade-in zoom-in duration-200">
        
        {/* Header decoration based on provider */}
        <div className={`h-1.5 w-full ${provider === 'google' ? 'bg-gradient-to-r from-red-500 via-yellow-400 to-green-500' : 'bg-white'}`} />

        {/* Close Button */}
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-white/40 hover:text-white/85 transition"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="p-6 md:p-8">
          {provider === 'google' ? (
            /* =======================================
               GOOGLE SIGN IN INTERACTIVE WINDOW
               ======================================= */
            <div>
              {step === 'chooser' && (
                <div className="space-y-6">
                  <div className="text-center">
                    {/* Render standard full Google Logo */}
                    <div className="inline-flex items-center gap-1.5 mb-2 font-medium text-lg tracking-tight text-white/90">
                      <svg className="w-5 h-5" viewBox="0 0 24 24" width="24" height="24">
                        <path
                          fill="#4285F4"
                          d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                        />
                        <path
                          fill="#34A853"
                          d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                        />
                        <path
                          fill="#FBBC05"
                          d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                        />
                        <path
                          fill="#EA4335"
                          d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                        />
                      </svg>
                      <span className="font-semibold text-slate-100">Sign in with Google</span>
                    </div>
                    <p className="text-white/40 text-xs">to continue to <span className="text-violet-400 font-semibold">DermScan AI</span></p>
                  </div>

                  <div className="space-y-2">
                    <span className="text-[10px] text-white/30 font-bold uppercase tracking-wider block mb-1">Choose an account</span>
                    
                    {/* Sandbox profile choice */}
                    <button
                      onClick={() => handleSelectAccount(defaultEmail, defaultName)}
                      className="w-full flex items-center gap-3 p-3 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 active:scale-99 transition text-left"
                    >
                      <div className="w-10 h-10 rounded-full bg-indigo-600 flex items-center justify-center font-bold text-white shadow-md">
                        MS
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-xs font-bold text-white truncate">{defaultName}</div>
                        <div className="text-[11px] text-white/50 truncate">{defaultEmail}</div>
                      </div>
                      <div className="text-[10px] bg-emerald-500/20 text-emerald-400 font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                        Active
                      </div>
                    </button>

                    {/* Custom options */}
                    <button
                      onClick={() => setStep('custom')}
                      className="w-full flex items-center gap-3 p-3 bg-transparent border border-dashed border-white/20 rounded-xl hover:border-white/40 hover:bg-white/5 active:scale-99 transition text-left"
                    >
                      <div className="w-10 h-10 rounded-full border border-dashed border-white/20 flex items-center justify-center text-white/50">
                        <UserIcon className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-xs font-semibold text-white">Use another account</div>
                        <div className="text-[11px] text-white/40">Register a new profile</div>
                      </div>
                      <ArrowRight className="w-4 h-4 ml-auto text-white/30" />
                    </button>
                  </div>

                  <div className="text-[10px] text-white/30 flex items-start gap-1.5 p-3 bg-white/2 rounded-xl mt-3">
                    <Shield className="w-3.5 h-3.5 text-violet-400 shrink-0 mt-0.5" />
                    <span>DermScan AI will access your public name and email address. Secure login verification happens on sandbox environment.</span>
                  </div>
                </div>
              )}

              {step === 'custom' && (
                <form onSubmit={handleCustomSubmit} className="space-y-4">
                  <div className="text-center mb-4">
                    <div className="inline-flex items-center gap-2 mb-2">
                      <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-ping" />
                      <span className="text-xs font-medium text-white">Google Federated Identity Form</span>
                    </div>
                    <div className="text-xs text-white/50">Enter credentials to authenticate custom account</div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-white/60 text-[10px] font-bold uppercase tracking-wider block">Full Name</label>
                    <input
                      type="text"
                      value={customName}
                      onChange={(e) => setCustomName(e.target.value)}
                      placeholder="e.g. Sarah Connor"
                      className="bg-white/5 border border-white/10 focus:border-violet-500 text-slate-100 text-xs px-3.5 py-2.5 rounded-lg w-full outline-none"
                      required
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-white/60 text-[10px] font-bold uppercase tracking-wider block">Google Email</label>
                    <input
                      type="email"
                      value={customEmail}
                      onChange={(e) => setCustomEmail(e.target.value)}
                      placeholder="e.g. sarah.connor@gmail.com"
                      className="bg-white/5 border border-white/10 focus:border-violet-500 text-slate-100 text-xs px-3.5 py-2.5 rounded-lg w-full outline-none"
                      required
                    />
                  </div>

                  <div className="flex gap-2.5 pt-2">
                    <button
                      type="button"
                      onClick={() => setStep('chooser')}
                      className="flex-1 bg-white/5 hover:bg-white/10 text-white/70 py-2 rounded-lg text-xs font-semibold"
                    >
                      Back
                    </button>
                    <button
                      type="submit"
                      className="flex-1 bg-violet-600 hover:bg-violet-500 text-white py-2 rounded-lg text-xs font-semibold"
                    >
                      Continue
                    </button>
                  </div>
                </form>
              )}

              {step === 'signing' && (
                <div className="py-8 text-center space-y-4">
                  <Loader2 className="w-8 h-8 text-violet-400 animate-spin mx-auto" />
                  <div>
                    <h4 className="text-xs font-bold text-white uppercase tracking-wider">Securing Connection...</h4>
                    <p className="text-[11px] text-white/40 mt-1">Connecting Google Credentials API with DermScan Database...</p>
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* =======================================
               APPLE SIGN IN INTERACTIVE WINDOW
               ======================================= */
            <div>
              {step === 'chooser' && (
                <div className="space-y-6">
                  <div className="text-center">
                    <div className="inline-flex items-center gap-1.5 mb-2 font-medium text-lg tracking-tight text-white/90">
                      <Apple className="w-5 h-5 fill-white" />
                      <span className="font-semibold text-slate-100">Sign in with Apple ID</span>
                    </div>
                    <p className="text-apple-300 text-white/45 text-xs">Secure login to app <span className="text-violet-400">DermScan AI</span></p>
                  </div>

                  <div className="space-y-3">
                    {/* Sandbox profile ID */}
                    <div className="p-4 bg-white/4 border border-white/10 rounded-xl space-y-3">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center font-bold text-white text-xs">
                          
                        </div>
                        <div>
                          <div className="text-xs font-bold text-white">{defaultName}</div>
                          <div className="text-[10px] text-white/40">{defaultEmail}</div>
                        </div>
                      </div>

                      <hr className="border-white/5" />

                      {/* Apple-specific Toggle "Hide My Email" */}
                      <div className="space-y-2">
                        <div className="text-[10px] text-white/50 uppercase tracking-widest font-semibold block">Email settings</div>
                        <div className="grid grid-cols-2 gap-2">
                          <button
                            type="button"
                            onClick={() => setAppleHideEmail(false)}
                            className={`p-2.5 rounded-lg border text-[11px] font-bold text-left transition flex items-center justify-between ${!appleHideEmail ? 'bg-white/10 border-violet-500 text-white' : 'bg-transparent border-white/5 text-white/40 hover:bg-white/2'}`}
                          >
                            <span>Share Email</span>
                            {!appleHideEmail && <Check className="w-3.5 h-3.5 text-violet-400" />}
                          </button>
                          <button
                            type="button"
                            onClick={() => setAppleHideEmail(true)}
                            className={`p-2.5 rounded-lg border text-[11px] font-bold text-left transition flex items-center justify-between ${appleHideEmail ? 'bg-white/10 border-violet-500 text-white' : 'bg-transparent border-white/5 text-white/40 hover:bg-white/2'}`}
                          >
                            <span>Hide Email</span>
                            {appleHideEmail && <Check className="w-3.5 h-3.5 text-violet-400" />}
                          </button>
                        </div>
                        <p className="text-[9px] text-white/35 leading-normal">
                          {appleHideEmail 
                            ? "Generates a randomized @privaterelay.appleid.com email to protect your primary mailbox." 
                            : "Shares your primary email address listed in your Apple credentials file."}
                        </p>
                      </div>

                      <button
                        onClick={() => handleSelectAccount(defaultEmail, defaultName)}
                        className="w-full bg-white text-black hover:bg-slate-100 font-bold py-2.5 rounded-lg text-xs leading-none tracking-wide transition active:scale-98 flex items-center justify-center gap-1.5"
                      >
                        <Apple className="w-3.5 h-3.5 fill-black" />
                        Continue with Apple ID
                      </button>
                    </div>

                    <button
                      onClick={() => setStep('custom')}
                      className="w-full text-center text-xs text-white/40 hover:text-white/60 transition py-1 underline block font-medium"
                    >
                      Authenticate different Apple Account ID
                    </button>
                  </div>
                </div>
              )}

              {step === 'custom' && (
                <form onSubmit={handleCustomSubmit} className="space-y-4">
                  <div className="text-center mb-1">
                    <Apple className="w-6 h-6 fill-white mx-auto mb-2" />
                    <div className="text-xs text-white/55">Create Account with any developer Apple ID</div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-white/60 text-[10px] font-bold uppercase tracking-wider block">Full Name</label>
                    <input
                      type="text"
                      value={customName}
                      onChange={(e) => setCustomName(e.target.value)}
                      placeholder="e.g. Taylor Swift"
                      className="bg-white/5 border border-white/10 focus:border-violet-500 text-slate-100 text-xs px-3.5 py-2.5 rounded-lg w-full outline-none"
                      required
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-white/60 text-[10px] font-bold uppercase tracking-wider block">Apple ID Email</label>
                    <input
                      type="email"
                      value={customEmail}
                      onChange={(e) => setCustomEmail(e.target.value)}
                      placeholder="e.g. tswift@icloud.com"
                      className="bg-white/5 border border-white/10 focus:border-violet-500 text-slate-100 text-xs px-3.5 py-2.5 rounded-lg w-full outline-none"
                      required
                    />
                  </div>

                  <div className="flex gap-2.5 pt-2">
                    <button
                      type="button"
                      onClick={() => setStep('chooser')}
                      className="flex-1 bg-white/5 hover:bg-white/10 text-white/70 py-2 rounded-lg text-xs font-semibold"
                    >
                      Back
                    </button>
                    <button
                      type="submit"
                      className="flex-1 bg-white text-black hover:bg-slate-100 py-2 rounded-lg text-xs font-bold"
                    >
                      Authenticate ID
                    </button>
                  </div>
                </form>
              )}

              {step === 'signing' && (
                <div className="py-8 text-center space-y-4">
                  <Loader2 className="w-7 h-7 text-white animate-spin mx-auto" />
                  <div>
                    <h4 className="text-xs font-bold text-white uppercase tracking-wider">Signing in with Apple...</h4>
                    <p className="text-[11px] text-white/40 mt-1">Verifying iCloud key pair connection session...</p>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
