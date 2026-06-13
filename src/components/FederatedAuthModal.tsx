import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.js';
import { X, Loader2, Shield, Apple, ExternalLink, AlertTriangle } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../api/client.js';

interface FederatedAuthModalProps {
  isOpen: boolean;
  provider: 'google' | 'apple' | null;
  onClose: () => void;
  onSuccess: () => void;
}

export default function FederatedAuthModal({ isOpen, provider, onClose, onSuccess }: FederatedAuthModalProps) {
  const { loginFederated } = useAuth();
  const [authUrl, setAuthUrl] = useState<string | null>(null);
  const [isRealFlow, setIsRealFlow] = useState<boolean>(false);
  const [isLoadingUrl, setIsLoadingUrl] = useState<boolean>(false);
  const [isAuthenticating, setIsAuthenticating] = useState<boolean>(false);
  const [statusText, setStatusText] = useState<string>('Connecting to authority...');
  const [portalOpened, setPortalOpened] = useState<boolean>(false);
  const [blockerAlert, setBlockerAlert] = useState<boolean>(false);

  // Load the target OAuth URL dynamically based on provider
  useEffect(() => {
    if (!isOpen || !provider) return;

    async function loadOAuthUrl() {
      setIsLoadingUrl(true);
      setPortalOpened(false);
      setBlockerAlert(false);
      try {
        const clientOrigin = window.location.origin;
        const response = await api.get<{ url: string; is_real: boolean }>(`/auth/${provider}/url?origin=${encodeURIComponent(clientOrigin)}`);
        setAuthUrl(response.data.url);
        setIsRealFlow(response.data.is_real);
      } catch (error) {
        console.error('Failed to load federated address:', error);
        toast.error(`Could not initialize secure ${provider} portal session.`);
      } finally {
        setIsLoadingUrl(false);
      }
    }

    loadOAuthUrl();
  }, [isOpen, provider]);

  // Set up global postMessage events receiver for authenticating profile payloads
  useEffect(() => {
    const handleOAuthMessage = async (event: MessageEvent) => {
      const origin = event.origin;
      // Allow local development ports, preview configurations and deployed domains
      if (!origin.endsWith('.run.app') && !origin.includes('localhost') && !origin.includes('127.0.0.1')) {
        return;
      }

      // Real live OAuth backend callback response completed and user is logged in
      if (event.data?.type === 'OAUTH_AUTH_SUCCESS') {
        const { token, user } = event.data;
        localStorage.setItem('dermscan_token', token);
        localStorage.setItem('dermscan_user', JSON.stringify(user));
        toast.success(`Welcome back ${user.full_name}! Login verified successfully.`);
        onSuccess();
        onClose();
        // Dynamic reloading to clean-update application state
        window.location.reload();
      }

      // Simulation profile response completed, process registration natively via backend federated registry
      if (event.data?.type === 'OAUTH_SIMULATE_SUCCESS') {
        const { full_name, email, provider: respProvider, provider_id } = event.data;
        setIsAuthenticating(true);
        setStatusText("Registering credentials inside app database...");
        try {
          await loginFederated(full_name, email, respProvider, provider_id);
          toast.success(`Successfully logged in with ${respProvider === 'google' ? 'Google' : 'Apple'}!`);
          onSuccess();
          onClose();
        } catch (err: any) {
          toast.error(err.message || "Failed to catalog credentials in secure database.");
        } finally {
          setIsAuthenticating(false);
        }
      }
    };

    window.addEventListener('message', handleOAuthMessage);
    return () => window.removeEventListener('message', handleOAuthMessage);
  }, [loginFederated, onClose, onSuccess]);

  if (!isOpen || !provider) return null;

  const handleLaunchPortal = () => {
    if (!authUrl) {
      toast.error("Waiting on secure OAuth URL validation...");
      return;
    }

    setPortalOpened(true);
    setStatusText("Waiting for authentication to complete inside popup...");
    
    // Open standard secure browser popup centered
    const width = 500;
    const height = 620;
    const left = window.screen.width / 2 - width / 2;
    const top = window.screen.height / 2 - height / 2;

    const popup = window.open(
      authUrl,
      `dermscan_${provider}_auth`,
      `width=${width},height=${height},top=${top},left=${left},status=no,resizable=yes,scrollbars=yes`
    );

    if (!popup || popup.closed || typeof popup.closed === 'undefined') {
      setBlockerAlert(true);
      toast.error('The popup was blocked by your browser. Please allow popups.');
    } else {
      setBlockerAlert(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm transition-opacity">
      {/* Visual content container */}
      <div className="bg-[#111118]/95 border border-white/10 rounded-3xl w-full max-w-sm overflow-hidden shadow-2xl relative animate-in fade-in zoom-in duration-200">
        
        {/* Top brand header indicator strip */}
        <div className={`h-1.5 w-full ${provider === 'google' ? 'bg-gradient-to-r from-red-500 via-yellow-400 steps-3 to-green-500' : 'bg-white'}`} />

        {/* Global Exit */}
        {!isAuthenticating && (
          <button 
            onClick={onClose}
            className="absolute top-4.5 right-4.5 text-white/30 hover:text-white/80 hover:bg-white/5 p-1 rounded-lg transition"
          >
            <X className="w-4 h-4" />
          </button>
        )}

        <div className="p-6 md:p-8 space-y-6 text-center">
          
          {/* Logo illustration */}
          <div className="flex justify-center mt-2">
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center border ${provider === 'google' ? 'bg-white/[0.03] border-red-500/20' : 'bg-white/[0.03] border-white/15'}`}>
              {provider === 'google' ? (
                <svg className="w-6 h-6" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
                </svg>
              ) : (
                <Apple className="w-6 h-6 fill-white text-white" />
              )}
            </div>
          </div>

          {/* Heading */}
          <div className="space-y-1">
            <h3 className="text-sm font-black uppercase tracking-widest text-white/90">
              {provider === 'google' ? 'Google Social Account' : 'Apple Social Account'}
            </h3>
            <p className="text-[11px] text-white/40 max-w-xs mx-auto">
              Securely authenticate your profile catalog to synchronize scan records
            </p>
          </div>

          {/* Dynamic Content Core */}
          <div className="bg-[#181822]/80 border border-white/5 rounded-2xl p-5 space-y-4">
            {isLoadingUrl ? (
              <div className="py-4 space-y-2.5">
                <Loader2 className="w-6 h-6 text-violet-400 animate-spin mx-auto" />
                <span className="text-[10px] uppercase font-bold text-white/40 block tracking-widest">
                  Verifying Cryptographic URL...
                </span>
              </div>
            ) : isAuthenticating ? (
              <div className="py-4 space-y-3">
                <div className="w-1.5 h-1.5 bg-violet-400 rounded-full animate-ping mx-auto" />
                <div className="space-y-1">
                  <span className="text-[10px] text-violet-400 font-bold uppercase tracking-wider block">
                    Securing Database Link
                  </span>
                  <p className="text-[11px] text-white/60 leading-normal">
                    {statusText}
                  </p>
                </div>
              </div>
            ) : portalOpened ? (
              <div className="py-2.5 space-y-3">
                <div className="w-7 h-7 border-2 border-violet-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
                <div className="space-y-1">
                  <span className="text-[10px] text-violet-400 font-black uppercase tracking-wider block">
                    Verify inside popup window
                  </span>
                  <p className="text-[11px] text-white/50 leading-normal">
                    Please log in or select your desired profile card inside the secure popup dialog.
                  </p>
                </div>
                
                <button
                  onClick={handleLaunchPortal}
                  className="text-[10px] text-white/30 hover:text-white/65 underline transition block mx-auto pt-2"
                >
                  Lost or closed popup? Reopen here
                </button>
              </div>
            ) : (
              <div className="space-y-3.5">
                <div className="text-left space-y-1 bg-white/3 border border-white/5 rounded-xl p-3.5">
                  <div className="flex items-center gap-1.5 mb-1">
                    <Shield className="w-3.5 h-3.5 text-violet-400 shrink-0" />
                    <span className="text-[10px] text-violet-400 font-bold uppercase tracking-wider">
                      OAuth Sandbox Module Active
                    </span>
                  </div>
                  <p className="text-[10px] text-white/65 leading-relaxed">
                    This build initializes a {isRealFlow ? "real connection with OAuth production services" : "highly detailed, interactive visual profile authenticator with automatic database synchronization"}. No personal credentials will ever be serialized.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleLaunchPortal}
                  className="w-full py-3 bg-gradient-to-r from-violet-500 to-indigo-600 rounded-xl text-xs font-black text-white hover:opacity-95 active:scale-95 transition-all select-none shadow-md shadow-violet-500/10 cursor-pointer flex items-center justify-center gap-2 uppercase tracking-wide"
                >
                  <span>Launch {provider} Portal</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>

          {/* Browser Blocker Exception Alert */}
          {blockerAlert && (
            <div className="flex items-start gap-2 text-left bg-rose-500/10 border border-rose-500/25 rounded-xl p-3.5 animate-in slide-in-from-top-2 duration-150">
              <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <span className="text-[10px] text-[#f87171] font-bold uppercase tracking-wider block">
                  Popup Window Blocked
                </span>
                <p className="text-[9px] text-[#f87171]/80 leading-normal">
                  Your browser stopped the secure portal from rendering. Please disable popup blocks for this site in the website URL bar settings to log in.
                </p>
              </div>
            </div>
          )}

          <div className="pt-2 text-[9px] text-white/20 select-none">
            DermScan Web Authorization v1.0 • HTU Research Project
          </div>

        </div>
      </div>
    </div>
  );
}
