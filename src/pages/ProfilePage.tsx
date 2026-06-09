import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.js';
import api from '../api/client.js';
import { ProfileStats, User } from '../types/index.js';
import LoadingSpinner from '../components/LoadingSpinner.js';
import { User as UserIcon, Calendar, Microscope, ShieldAlert, Key, LogOut, Check } from 'lucide-react';
import toast from 'react-hot-toast';

export default function ProfilePage() {
  const { logout, updateLocalUser } = useAuth();
  const navigate = useNavigate();

  const [profileData, setProfileData] = useState<ProfileStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [fullName, setFullName] = useState('');
  const [isSubmittingProfile, setIsSubmittingProfile] = useState(false);

  useEffect(() => {
    async function loadProfile() {
      try {
        const response = await api.get<ProfileStats>('/users/profile');
        setProfileData(response.data);
        setFullName(response.data.user.full_name);
      } catch (error: any) {
        console.error('Failed to load profile parameters:', error);
        toast.error('Could not load user profile details');
      } finally {
        setIsLoading(false);
      }
    }
    loadProfile();
  }, []);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName) {
      toast.error('Full name cannot be blank');
      return;
    }

    setIsSubmittingProfile(true);
    try {
      const response = await api.put<User>('/users/profile', { full_name: fullName });
      updateLocalUser(response.data);
      if (profileData) {
        setProfileData({ ...profileData, user: response.data });
      }
      toast.success('Profile details updated!');
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Failed to update credentials names');
    } finally {
      setIsSubmittingProfile(false);
    }
  };

  const handleLogoutClick = () => {
    logout();
    toast.success('Logged out successfully');
    navigate('/');
  };

  if (isLoading) {
    return <LoadingSpinner fullPage={true} label="Refreshing user profile credentials..." />;
  }

  const getInitials = (name: string) => {
    if (!name) return 'DS';
    return name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase();
  };

  const formatStatsDate = (dateString: string | null) => {
    if (!dateString) return 'Never';
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <div className="bg-transparent min-h-[calc(100vh-68px)] px-6 py-10 relative text-slate-100 flex justify-center">
      <div className="max-w-2xl w-full space-y-8">
        
        {/* Profile identity banner card */}
        <div className="bg-[#111118] border border-white/7 rounded-3xl p-6 md:p-8 flex items-center gap-6 shadow-xl relative overflow-hidden">
          {/* Accent blob */}
          <div className="absolute right-0 top-0 w-32 h-32 bg-violet-600/5 rounded-full blur-2xl" />

          {/* Large initials avatar */}
          <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-gradient-to-tr from-violet-600 offset-2 to-fuchsia-600 text-white font-serif font-black text-2xl md:text-3xl flex items-center justify-center shadow-lg shadow-violet-500/20 shrink-0">
            {getInitials(profileData?.user.full_name || 'DermScan')}
          </div>

          <div className="space-y-1 text-left">
            <span className="text-[10px] font-bold uppercase tracking-widest text-violet-400">Account status</span>
            <h2 className="font-serif font-bold text-2xl text-white leading-tight">
              {profileData?.user.full_name}
            </h2>
            <p className="text-white/50 text-xs">
              {profileData?.user.email}
            </p>
          </div>
        </div>

        {/* Mini stats cards row */}
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-[#111118]/60 border border-white/5 rounded-2xl p-4 text-center space-y-1 shadow-md">
            <span className="text-[9px] uppercase tracking-wider text-white/40 block font-bold">Total Scans</span>
            <strong className="text-2xl font-black text-violet-400 block">{profileData?.total_scans || 0}</strong>
          </div>
          <div className="bg-[#111118]/60 border border-white/5 rounded-2xl p-4 text-center space-y-1 shadow-md">
            <span className="text-[9px] uppercase tracking-wider text-white/40 block font-bold">Last Analysis</span>
            <strong className="text-xs font-bold text-violet-400 block truncate py-1.5 hover:text-white" title={formatStatsDate(profileData?.last_scan_date || null)}>
              {profileData?.last_scan_date ? formatStatsDate(profileData.last_scan_date).split(',')[0] : 'Never'}
            </strong>
          </div>
          <div className="bg-[#111118]/60 border border-white/5 rounded-2xl p-4 text-center space-y-1 shadow-md">
            <span className="text-[9px] uppercase tracking-wider text-white/40 block font-bold">Top Cond.</span>
            <strong className="text-xs font-extrabold text-violet-400 block truncate py-1.5" title={profileData?.most_common_condition || 'None yet'}>
              {profileData?.most_common_condition || 'None'}
            </strong>
          </div>
        </div>

        {/* Change account details Form wrapper */}
        <div className="bg-[#111118] border border-white/8 rounded-3xl p-6 md:p-8 space-y-6">
          <h3 className="text-lg font-bold font-serif text-white">Edit Your Profile</h3>
          <p className="text-xs text-white/50 mt-1">Update your display settings inside the educational environment.</p>

          <form onSubmit={handleUpdateProfile} className="space-y-4">
            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase tracking-wider text-white/60 block">Full Name</label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Change display full name..."
                required
                className="bg-white/5 border border-white/10 hover:border-white/15 focus:border-violet-500/60 focus:ring-4 focus:ring-violet-500/10 text-slate-100 text-sm px-4 py-3 rounded-xl w-full outline-none transition"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmittingProfile}
              className="px-5 py-3 bg-gradient-to-r from-violet-500 to-indigo-600 rounded-xl text-xs font-bold text-white shadow-md hover:opacity-95 transition tracking-wider active:scale-98 flex items-center justify-center gap-1.5 disabled:opacity-50"
            >
              {isSubmittingProfile ? 'Saving updates...' : (
                <>
                  <Check className="w-4 h-4" /> SAVE CHANGES
                </>
              )}
            </button>
          </form>
        </div>

        {/* Danger Account actions zone */}
        <div className="bg-[#111118] border border-rose-500/15 rounded-3xl p-6 md:p-8 space-y-4 shadow-sm">
          <h3 className="text-sm font-bold text-rose-400 uppercase tracking-widest block">Account Operations</h3>
          <p className="text-xs text-white/50 leading-relaxed font-light">
            Erase session data token files and securely exit your portal credentials view.
          </p>
          <button
            onClick={handleLogoutClick}
            className="w-full py-3.5 border border-rose-500/15 hover:border-rose-500/25 bg-rose-500/5 hover:bg-rose-500/10 text-rose-400 font-bold rounded-xl text-xs flex items-center justify-center gap-2 transition"
          >
            <LogOut className="w-4.5 h-4.5 animate-pulse" /> LOG OUT FROM SECURE SESSION
          </button>
        </div>

      </div>
    </div>
  );
}
