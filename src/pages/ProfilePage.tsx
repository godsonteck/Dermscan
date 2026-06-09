import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.js';
import api from '../api/client.js';
import { ProfileStats, User } from '../types/index.js';
import LoadingSpinner from '../components/LoadingSpinner.js';
import { User as UserIcon, LogOut, Check, Sliders, Activity, Mail } from 'lucide-react';
import toast from 'react-hot-toast';

export default function ProfilePage() {
  const { logout, updateLocalUser } = useAuth();
  const navigate = useNavigate();

  const [profileData, setProfileData] = useState<ProfileStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // Clean, focused state variables
  const [fullName, setFullName] = useState('');
  const [skinType, setSkinType] = useState('');
  const [skinSensitivity, setSkinSensitivity] = useState('');
  const [skinConcerns, setSkinConcerns] = useState<string[]>([]);
  const [ageGroup, setAgeGroup] = useState('');
  const [fitzpatrickType, setFitzpatrickType] = useState('');
  const [isSubmittingProfile, setIsSubmittingProfile] = useState(false);

  // Simplified core concerns for quick tags selection
  const availableConcerns = [
    "Acne & Scarring",
    "Aging & Fine Lines",
    "Hyperpigmentation",
    "Redness & Rosacea",
    "Dryness & Flaking",
    "Uneven Texture"
  ];

  useEffect(() => {
    async function loadProfile() {
      try {
        const response = await api.get<ProfileStats>('/users/profile');
        setProfileData(response.data);
        
        const u = response.data.user;
        setFullName(u.full_name || '');
        setSkinType(u.skin_type || 'normal');
        setSkinSensitivity(u.skin_sensitivity || 'low');
        setSkinConcerns(u.skin_concerns || []);
        setAgeGroup(u.age_group || '26-35');
        setFitzpatrickType(u.fitzpatrick_type || 'Type III');
      } catch (error: any) {
        console.error('Failed to load profile parameters:', error);
        toast.error('Could not load profile details.');
      } finally {
        setIsLoading(false);
      }
    }
    loadProfile();
  }, []);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim()) {
      toast.error('Name cannot be blank');
      return;
    }

    setIsSubmittingProfile(true);
    try {
      const response = await api.put<User>('/users/profile', {
        full_name: fullName,
        skin_type: skinType,
        skin_sensitivity: skinSensitivity,
        skin_concerns: skinConcerns,
        age_group: ageGroup,
        fitzpatrick_type: fitzpatrickType
      });
      
      updateLocalUser(response.data);
      if (profileData) {
        setProfileData({ ...profileData, user: response.data });
      }
      toast.success('Your skin profile has been updated!');
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Failed to update skin profile');
    } finally {
      setIsSubmittingProfile(false);
    }
  };

  const toggleConcern = (concern: string) => {
    if (skinConcerns.includes(concern)) {
      setSkinConcerns(skinConcerns.filter(c => c !== concern));
    } else {
      setSkinConcerns([...skinConcerns, concern]);
    }
  };

  const handleLogoutClick = () => {
    logout();
    toast.success('Signed out successfully.');
    navigate('/');
  };

  if (isLoading) {
    return <LoadingSpinner fullPage={true} label="Retrieving skin profile..." />;
  }

  return (
    <div className="bg-transparent min-h-[calc(100vh-68px)] px-4 md:px-8 py-10 text-slate-100 flex justify-center items-start">
      <div className="max-w-4xl w-full space-y-8 animate-in fade-in duration-300">
        
        {/* Header Block */}
        <div className="text-left space-y-1.5 border-b border-white/5 pb-5">
          <div className="inline-flex items-center gap-1.5 bg-violet-500/10 border border-violet-500/20 px-2.5 py-1 rounded-full text-violet-400 text-[10px] font-bold uppercase tracking-wider">
            <Activity className="w-3.5 h-3.5" /> Core Profile
          </div>
          <h1 className="text-2xl md:text-3xl font-bold font-serif text-white tracking-tight">
            Profile Settings
          </h1>
          <p className="text-xs text-white/40">
            Configure baseline characteristics to lock in high-accuracy skin analysis and real product recommendations.
          </p>
        </div>

        {/* 2-Column Clean Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          
          {/* Left Column: Premium Summary Stats & Session Control */}
          <div className="lg:col-span-1 space-y-4">
            
            {/* User Mini Card */}
            <div className="bg-[#111118]/80 border border-white/5 rounded-2xl p-5 flex items-center gap-4 relative overflow-hidden backdrop-blur-sm">
              <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-violet-600 to-indigo-600 flex items-center justify-center font-serif text-lg font-bold text-white shrink-0">
                {fullName.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase()}
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="font-serif font-bold text-base text-white truncate-none">{fullName}</h3>
                <p className="text-[11px] text-white/35 font-mono truncate flex items-center gap-1 mt-0.5">
                  <Mail className="w-3 h-3 shrink-0" /> {profileData?.user.email}
                </p>
              </div>
            </div>

            {/* Quick Metrics */}
            <div className="bg-[#111118]/80 border border-white/5 rounded-2xl p-5 space-y-4 backdrop-blur-sm font-sans">
              <h4 className="text-xs font-bold uppercase tracking-wider text-white/30">Evaluation Status</h4>
              
              <div className="space-y-3 pt-1">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-white/50">Total Scans Run</span>
                  <span className="font-mono font-bold text-violet-400 py-0.5 px-2 rounded-md bg-violet-400/5 border border-violet-400/10">
                    {profileData?.total_scans || 0}
                  </span>
                </div>

                <div className="flex justify-between items-center text-xs pt-2 border-t border-white/5">
                  <span className="text-white/50">Skin Baseline</span>
                  <span className="font-bold text-slate-100 uppercase text-[10px] tracking-wider">
                    {skinType || 'Not Set'}
                  </span>
                </div>

                <div className="flex justify-between items-center text-xs pt-2 border-t border-white/5">
                  <span className="text-white/50">Sensitivity</span>
                  <span className="font-bold text-slate-100 uppercase text-[10px] tracking-wider">
                    {skinSensitivity || 'Low'}
                  </span>
                </div>
              </div>
            </div>

            {/* Session Management */}
            <button
              onClick={handleLogoutClick}
              className="w-full py-2.5 border border-white/5 hover:border-rose-500/15 bg-white/2 hover:bg-rose-500/10 text-white/60 hover:text-rose-400 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition duration-150 cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" /> Sign Out
            </button>

          </div>

          {/* Right Column: Clean Form */}
          <div className="lg:col-span-2">
            <form onSubmit={handleUpdateProfile} className="bg-[#111118]/80 border border-white/5 rounded-2xl p-5 md:p-6 space-y-6 text-left backdrop-blur-sm">
              
              {/* Account Settings */}
              <div className="space-y-4">
                <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-1.5 border-b border-white/5 pb-2">
                  <span>General Account</span>
                </h3>
                
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-white/45 uppercase tracking-wide">Display Name</label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required
                    className="bg-white/3 border border-white/8 focus:border-violet-500/50 text-xs px-3.5 py-2.5 rounded-xl w-full outline-none transition font-medium"
                    placeholder="E.g., Jane Doe"
                  />
                </div>
              </div>

              {/* Skin Settings */}
              <div className="space-y-4 pt-1">
                <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-1.5 border-b border-white/5 pb-2">
                  <span>Skin Characteristics</span>
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Skin Type */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-white/45 uppercase tracking-wide">Skin Type</label>
                    <select
                      value={skinType}
                      onChange={(e) => setSkinType(e.target.value)}
                      className="bg-[#12121c] border border-white/8 text-xs px-3 py-2.5 rounded-xl w-full focus:border-violet-500/50 outline-none transition cursor-pointer"
                    >
                      <option value="normal">Normal</option>
                      <option value="dry">Dry</option>
                      <option value="oily">Oily</option>
                      <option value="combination">Combination</option>
                      <option value="sensitive">Sensitive</option>
                    </select>
                  </div>

                  {/* Sensitivity */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-white/45 uppercase tracking-wide">Sensitivity</label>
                    <select
                      value={skinSensitivity}
                      onChange={(e) => setSkinSensitivity(e.target.value)}
                      className="bg-[#12121c] border border-white/8 text-xs px-3 py-2.5 rounded-xl w-full focus:border-violet-500/50 outline-none transition cursor-pointer"
                    >
                      <option value="low">Low sensitivity</option>
                      <option value="medium">Medium sensitivity</option>
                      <option value="high">High sensitivity</option>
                    </select>
                  </div>

                  {/* Fitzpatrick Type */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-white/45 uppercase tracking-wide">Fitzpatrick Phototype</label>
                    <select
                      value={fitzpatrickType}
                      onChange={(e) => setFitzpatrickType(e.target.value)}
                      className="bg-[#12121c] border border-white/8 text-xs px-3 py-2.5 rounded-xl w-full focus:border-violet-500/50 outline-none transition cursor-pointer"
                    >
                      <option value="Type I">Type I (Pale / Burns easily)</option>
                      <option value="Type II">Type II (Fair / Usually burns)</option>
                      <option value="Type III">Type III (Cream / Moderate burn)</option>
                      <option value="Type IV">Type IV (Olive / Rare burn)</option>
                      <option value="Type V">Type V (Brown / Tans very easily)</option>
                      <option value="Type VI">Type VI (Deeply pigmented)</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
                  {/* Age Group */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-white/45 uppercase tracking-wide">Age Group</label>
                    <select
                      value={ageGroup}
                      onChange={(e) => setAgeGroup(e.target.value)}
                      className="bg-[#12121c] border border-white/8 text-xs px-3 py-2.5 rounded-xl w-full focus:border-violet-500/50 outline-none transition cursor-pointer"
                    >
                      <option value="under-18">Under 18</option>
                      <option value="18-25">18 - 25</option>
                      <option value="26-35">26 - 35</option>
                      <option value="36-50">36 - 50</option>
                      <option value="50-plus">Over 50</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Primary Concerns Selection */}
              <div className="space-y-3 pt-1">
                <label className="text-[10px] font-bold text-white/45 uppercase tracking-wide block">Primary Concerns</label>
                <div className="flex flex-wrap gap-2">
                  {availableConcerns.map((concern) => {
                    const isSelected = skinConcerns.includes(concern);
                    return (
                      <button
                        type="button"
                        key={concern}
                        onClick={() => toggleConcern(concern)}
                        className={`text-xs px-3.5 py-1.5 rounded-full border transition cursor-pointer font-medium select-none flex items-center gap-1.5 ${
                          isSelected 
                            ? 'bg-violet-600/20 border-violet-500/60 text-violet-200' 
                            : 'bg-white/2 border-white/5 hover:border-white/12 text-white/60'
                        }`}
                      >
                        {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-violet-400" />}
                        <span>{concern}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Save Trigger */}
              <div className="pt-4 border-t border-white/5 flex justify-end">
                <button
                  type="submit"
                  disabled={isSubmittingProfile}
                  className="px-5 py-2.5 bg-gradient-to-r from-violet-600 to-indigo-600 text-white rounded-xl text-xs font-bold shadow-lg hover:opacity-95 active:scale-98 transition flex items-center gap-1.5 disabled:opacity-50 select-none cursor-pointer"
                >
                  {isSubmittingProfile ? (
                    'Saving Updates...'
                  ) : (
                    <>
                      <Check className="w-3.5 h-3.5" /> Save Changes
                    </>
                  )}
                </button>
              </div>

            </form>
          </div>

        </div>

      </div>
    </div>
  );
}
