import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.js';
import { LogOut, User as UserIcon, PlusCircle, History, LayoutDashboard, Menu, X } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Navbar() {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    setDropdownOpen(false);
    setMobileMenuOpen(false);
    toast.success('Successfully logged out');
    navigate('/');
  };

  const isActive = (path: string) => location.pathname === path;

  const getInitials = (name: string) => {
    if (!name) return 'DS';
    return name
      .split(' ')
      .map((n) => n[0])
      .slice(0, 2)
      .join('')
      .toUpperCase();
  };

  return (
    <nav className="h-[68px] sticky top-0 z-40 bg-[#020617]/80 backdrop-blur-lg border-b border-white/10 px-6">
      <div className="max-w-7xl mx-auto h-full flex items-center justify-between">
        {/* Logo */}
        <Link to={isAuthenticated ? "/dashboard" : "/"} className="flex items-center gap-2 group">
          <span className="text-2xl group-hover:scale-110 transition-transform">🔬</span>
          <span className="font-mono font-black text-xl tracking-wider bg-gradient-to-r from-violet-400 to-emerald-400 bg-clip-text text-transparent">
            DermScan AI
          </span>
        </Link>
 
        {/* Desktop Authenticated Navigation Links */}
        {isAuthenticated && (
          <div className="hidden md:flex items-center gap-4">
            <Link
              to="/dashboard"
              className={`flex items-center gap-1.5 text-[11px] font-bold tracking-wider transition-all uppercase px-3.5 py-1.5 rounded-md font-mono ${
                isActive('/dashboard') ? 'bg-violet-500/10 text-violet-400 border border-violet-500/25 glow-cyan' : 'text-white/60 hover:text-white border border-transparent'
              }`}
            >
              <LayoutDashboard className="w-3.5 h-3.5 text-violet-400" />
              OVERVIEW
            </Link>
            <Link
              to="/scan/new"
              className={`flex items-center gap-1.5 text-[11px] font-bold tracking-wider transition-all uppercase px-3.5 py-1.5 rounded-md font-mono ${
                isActive('/scan/new') ? 'bg-violet-500/10 text-violet-400 border border-violet-500/25 glow-cyan' : 'text-white/60 hover:text-white border border-transparent'
              }`}
            >
              <PlusCircle className="w-3.5 h-3.5 text-violet-400" />
              NEW SCAN
            </Link>
            <Link
              to="/history"
              className={`flex items-center gap-1.5 text-[11px] font-bold tracking-wider transition-all uppercase px-3.5 py-1.5 rounded-md font-mono ${
                isActive('/history') ? 'bg-violet-500/10 text-violet-400 border border-violet-500/25 glow-cyan' : 'text-white/60 hover:text-white border border-transparent'
              }`}
            >
              <History className="w-3.5 h-3.5 text-violet-400" />
              SCAN HISTORY
            </Link>
          </div>
        )}

        {/* Right Section actions */}
        <div className="flex items-center gap-4">
          {isAuthenticated && user ? (
            <div className="relative" ref={dropdownRef}>
              {/* Avatar trigger button */}
              <button
                id="avatar-dropdown-trigger"
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="w-10 h-10 rounded-full bg-gradient-to-tr from-violet-600 to-fuchsia-600 border border-white/10 flex items-center justify-center font-bold text-sm text-white hover:scale-105 transition-all outline-none"
              >
                {getInitials(user.full_name)}
              </button>

              {/* Dropdown Menu */}
              {dropdownOpen && (
                <div className="absolute right-0 mt-3 w-48 bg-[#111118] border border-white/10 rounded-2xl p-2 shadow-2xl animate-in fade-in slide-in-from-top-2 duration-150">
                  <div className="px-3 py-2 border-b border-white/5 mb-1 text-left">
                    <p className="text-xs font-bold text-white truncate">{user.full_name}</p>
                    <p className="text-[10px] text-white/50 truncate mt-0.5">{user.email}</p>
                  </div>
                  <Link
                    to="/profile"
                    onClick={() => setDropdownOpen(false)}
                    className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium text-white/70 hover:bg-white/5 hover:text-white transition"
                  >
                    <UserIcon className="w-4 h-4 text-violet-400" />
                    Manage Profile
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium text-rose-400 hover:bg-rose-500/10 transition text-left"
                  >
                    <LogOut className="w-4 h-4" />
                    Logout Account
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="hidden md:flex items-center gap-3">
              <Link
                to="/login"
                className="px-4 py-2 border border-white/10 hover:border-white/20 hover:bg-white/5 text-slate-100 font-bold rounded-xl text-xs tracking-wider transition-all"
              >
                LOGIN
              </Link>
              <Link
                to="/register"
                className="px-4 py-2.5 bg-gradient-to-r from-violet-500 to-indigo-500 hover:opacity-95 text-white font-serif font-black rounded-xl text-xs tracking-wide shadow-lg shadow-violet-500/20 active:scale-98 transition-all"
              >
                GET STARTED
              </Link>
            </div>
          )}

          {/* Mobile Menu Toggle Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-white outline-none hover:bg-white/10 active:scale-95 transition"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Responsive Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed top-[69px] left-0 right-0 bg-[#0a0a0f] border-b border-white/10 p-5 shadow-2xl animate-in slide-in-from-top duration-200 z-30">
          {isAuthenticated ? (
            <div className="flex flex-col gap-4">
              <Link
                to="/dashboard"
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-3 p-3 rounded-xl font-bold text-sm ${
                  isActive('/dashboard') ? 'bg-violet-500/10 text-violet-400' : 'text-white/70 hover:bg-[#111118]'
                }`}
              >
                <LayoutDashboard className="w-4 h-4" />
                Dashboard Overview
              </Link>
              <Link
                to="/scan/new"
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-3 p-3 rounded-xl font-bold text-sm ${
                  isActive('/scan/new') ? 'bg-violet-500/10 text-violet-400' : 'text-white/70 hover:bg-[#111118]'
                }`}
              >
                <PlusCircle className="w-4 h-4" />
                Analyze New Scan
              </Link>
              <Link
                to="/history"
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-3 p-3 rounded-xl font-bold text-sm ${
                  isActive('/history') ? 'bg-violet-500/10 text-violet-400' : 'text-white/70 hover:bg-[#111118]'
                }`}
              >
                <History className="w-4 h-4" />
                Diagnostic History
              </Link>
              <Link
                to="/profile"
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-3 p-3 rounded-xl font-bold text-sm ${
                  isActive('/profile') ? 'bg-violet-500/10 text-violet-400' : 'text-white/70 hover:bg-[#111118]'
                }`}
              >
                <UserIcon className="w-4 h-4" />
                My Profile
              </Link>
              <button
                onClick={handleLogout}
                className="flex items-center gap-3 p-3 rounded-xl font-bold text-sm text-rose-400 hover:bg-rose-500/10 transition mt-2"
              >
                <LogOut className="w-4 h-4" />
                Logout Account
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              <Link
                to="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full text-center p-3 border border-white/10 hover:bg-white/5 text-slate-100 font-bold rounded-xl text-sm transition"
              >
                LOGIN
              </Link>
              <Link
                to="/register"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full text-center p-3.5 bg-gradient-to-r from-violet-500 to-indigo-500 text-white font-bold rounded-xl text-sm shadow-lg shadow-violet-500/20 transition"
              >
                GET STARTED
              </Link>
            </div>
          )}
        </div>
      )}
    </nav>
  );
}
