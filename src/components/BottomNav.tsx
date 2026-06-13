import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.js';
import { LayoutDashboard, Plus, History, User } from 'lucide-react';

export default function BottomNav() {
  const { isAuthenticated } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) return null;

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-[#020617]/90 backdrop-blur-xl border-t border-white/10 pb-canvas-safe pt-2 px-6 shadow-[0_-10px_30px_rgba(0,0,0,0.5)]">
      <div className="flex items-center justify-between max-w-lg mx-auto relative h-14">
        {/* Dashboard/Overview Item */}
        <Link
          to="/dashboard"
          className={`flex flex-col items-center justify-center gap-1 flex-1 transition-all ${
            isActive('/dashboard') ? 'text-violet-400 scale-105 font-bold' : 'text-white/50 hover:text-white'
          }`}
        >
          <LayoutDashboard className={`w-5 h-5 ${isActive('/dashboard') ? 'stroke-[2.5px]' : 'stroke-[1.8px]'}`} />
          <span className="text-[10px] uppercase tracking-wider font-mono">Overview</span>
        </Link>

        {/* Scan/New Scan Centered Button */}
        <div className="relative -top-4 flex-1 flex justify-center">
          <Link
            to="/scan/new"
            className="w-14 h-14 bg-gradient-to-tr from-violet-500 to-indigo-600 rounded-full border-[3px] border-[#020617] flex items-center justify-center text-white shadow-lg shadow-violet-500/40 hover:scale-110 active:scale-95 transition-all select-none"
            title="Start New Scan"
          >
            <Plus className="w-8 h-8 stroke-[3px]" />
          </Link>
        </div>

        {/* History Item */}
        <Link
          to="/history"
          className={`flex flex-col items-center justify-center gap-1 flex-1 transition-all ${
            isActive('/history') ? 'text-violet-400 scale-105 font-bold' : 'text-white/50 hover:text-white'
          }`}
        >
          <History className={`w-5 h-5 ${isActive('/history') ? 'stroke-[2.5px]' : 'stroke-[1.8px]'}`} />
          <span className="text-[10px] uppercase tracking-wider font-mono">History</span>
        </Link>

        {/* Profile Item */}
        <Link
          to="/profile"
          className={`flex flex-col items-center justify-center gap-1 flex-1 transition-all ${
            isActive('/profile') ? 'text-violet-400 scale-105 font-bold' : 'text-white/50 hover:text-white'
          }`}
        >
          <User className={`w-5 h-5 ${isActive('/profile') ? 'stroke-[2.5px]' : 'stroke-[1.8px]'}`} />
          <span className="text-[10px] uppercase tracking-wider font-mono">Profile</span>
        </Link>
      </div>
    </div>
  );
}
