import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.js';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import FederatedAuthModal from '../components/FederatedAuthModal.js';

export default function LoginPage() {
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [params] = useSearchParams();

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
    if (params.get('expired')) {
      toast.error('Your auth token session has expired. Please sign in again.');
    }
  }, [isAuthenticated, navigate, params]);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [federatedModalOpen, setFederatedModalOpen] = useState(false);
  const [federatedProvider, setFederatedProvider] = useState<'google' | 'apple' | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !password) {
      toast.error('Please fill in all credentials fields');
      return;
    }

    setIsSubmitting(true);
    try {
      await login(email, password);
      toast.success('Successfully logged in!');
      navigate('/dashboard');
    } catch (err: any) {
      toast.error(err.message || 'Incorrect email or password credentials');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-transparent min-h-[calc(100vh-68px)] flex items-center justify-center py-12 px-6 relative overflow-hidden">
      {/* Background radial effects */}
      <div className="absolute top-1/4 right-[-5%] w-[400px] h-[400px] bg-indigo-600/5 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-1/4 left-[-10%] w-[400px] h-[400px] bg-violet-650/5 rounded-full blur-[100px] pointer-events-none" />

      <div className="bg-[#111118] border border-white/8 rounded-3xl w-full max-w-md p-8 md:p-10 shadow-2xl relative z-15 backdrop-blur-md">
        <div className="text-center mb-8">
          <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-violet-400 block mb-2">WELCOME BACK</span>
          <h2 className="font-serif font-bold text-3xl text-white">Login to Account</h2>
          <p className="text-white/50 text-xs mt-2">
            Don't have an account?{' '}
            <Link to="/register" className="text-violet-400 font-bold hover:underline">
              Register here
            </Link>
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Email input */}
          <div className="space-y-2">
            <label className="text-white/65 text-xs font-semibold uppercase tracking-wider block">Email Address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g. skin@hospital.com"
              className="bg-white/5 border border-white/10 hover:border-white/15 focus:border-violet-500/60 focus:ring-4 focus:ring-violet-500/10 text-slate-100 text-sm px-4 py-3 rounded-xl w-full placeholder-white/30 outline-none transition"
              required
            />
          </div>

          {/* Password input */}
          <div className="space-y-2 relative">
            <div className="flex justify-between items-center text-xs font-semibold uppercase tracking-wider mb-2">
              <label className="text-white/65 block">Password</label>
            </div>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••••"
                className="bg-white/5 border border-white/10 hover:border-white/15 focus:border-violet-500/60 focus:ring-4 focus:ring-violet-500/10 text-slate-100 text-sm px-4 py-3 pr-11 rounded-xl w-full placeholder-white/30 outline-none transition"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/70 transition outline-none"
              >
                {showPassword ? <EyeOff className="w-4.5 h-4.5" /> : <Eye className="w-4.5 h-4.5" />}
              </button>
            </div>
          </div>

          {/* Primary Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-gradient-to-r from-violet-500 to-indigo-600 hover:opacity-95 text-white font-bold py-3.5 px-6 rounded-xl text-sm tracking-wider shadow-lg shadow-violet-500/20 active:scale-98 transition duration-150 disabled:opacity-50 disabled:pointer-events-none flex items-center justify-center gap-2 mt-2"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                AUTHENTICATING PROFILE...
              </>
            ) : (
              'LOGIN SECURELY'
            )}
          </button>
        </form>

        {/* Divider line */}
        <div className="relative my-6 animate-fade-in">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-white/5"></div>
          </div>
          <div className="relative flex justify-center text-xs">
            <span className="bg-[#111118] px-3 text-white/40 uppercase tracking-[0.15em] text-[9px] font-bold">Or continue with</span>
          </div>
        </div>

        {/* Google & Apple sign in buttons */}
        <div className="grid grid-cols-2 gap-3.5">
          <button
            type="button"
            onClick={() => {
              setFederatedProvider('google');
              setFederatedModalOpen(true);
            }}
            className="flex items-center justify-center gap-2 px-4 py-3.5 bg-white/5 border border-white/8 hover:border-white/15 hover:bg-white/8 rounded-xl text-xs font-semibold text-white/90 active:scale-98 transition duration-150 cursor-pointer"
          >
            <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" width="24" height="24">
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
            <span>Google</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setFederatedProvider('apple');
              setFederatedModalOpen(true);
            }}
            className="flex items-center justify-center gap-2 px-4 py-3.5 bg-white/5 border border-white/8 hover:border-white/15 hover:bg-white/8 rounded-xl text-xs font-semibold text-white/90 active:scale-98 transition duration-150 cursor-pointer"
          >
            <svg className="w-4 h-4 fill-white shrink-0" viewBox="0 0 256 315" width="256" height="315">
              <path d="M213.803 167.03c.442 47.58 41.74 63.413 42.197 63.623-.335 1.016-6.582 22.656-21.82 44.86-13.154 19.16-26.85 38.256-48.46 38.653-21.222.396-28.053-12.55-52.36-12.55-24.316 0-31.88 12.154-52.28 12.95-20.998.775-36.316-20.732-49.61-39.817C5.395 242.492-12.164 163.606 14.957 116.64c13.435-23.27 37.37-37.953 63.266-38.35 19.64-.105 38.09 13.513 50.143 13.513 12.053 0 34.25-16.143 57.77-13.78 9.84.4 37.49 3.96 55.226 29.814-1.42.872-33.1 19.29-32.748 59.183M180.203 50.416C190.22 38.21 197 21.215 195.148 4.2c-14.54.582-32.194 9.682-42.6 21.9-9.143 10.536-17.14 27.76-15.006 44.536 16.2 1.258 32.72-8.093 42.66-20.22z" />
            </svg>
            <span>Apple</span>
          </button>
        </div>

        <div className="mt-8 pt-6 border-t border-white/5 text-center text-[10px] text-white/30">
          This educational demo stores credentials securely on sandbox storage modules.
        </div>
      </div>

      {/* Federated Auth Popup Modal */}
      <FederatedAuthModal
        isOpen={federatedModalOpen}
        provider={federatedProvider}
        onClose={() => {
          setFederatedModalOpen(false);
          setFederatedProvider(null);
        }}
        onSuccess={() => {
          navigate('/dashboard');
        }}
      />
    </div>
  );
}
