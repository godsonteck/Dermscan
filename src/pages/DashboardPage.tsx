import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.js';
import api from '../api/client.js';
import { ScanListItem, ProfileStats } from '../types/index.js';
import ScanCard from '../components/ScanCard.js';
import LoadingSpinner from '../components/LoadingSpinner.js';
import { Plus, Microscope, Calendar, BarChart2, Award, ArrowRight, Activity } from 'lucide-react';
import toast from 'react-hot-toast';

export default function DashboardPage() {
  const { user } = useAuth();
  const [scans, setScans] = useState<ScanListItem[]>([]);
  const [stats, setStats] = useState<ProfileStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadDashboardData() {
      try {
        const [scansRes, statsRes] = await Promise.all([
          api.get<ScanListItem[]>('/scans'),
          api.get<ProfileStats>('/users/profile')
        ]);
        setScans(scansRes.data);
        setStats(statsRes.data);
      } catch (error: any) {
        console.error('Failed to load dashboard metrics:', error);
        toast.error('Could not refresh dashboard statistics.');
      } finally {
        setIsLoading(false);
      }
    }
    loadDashboardData();
  }, []);

  if (isLoading) {
    return <LoadingSpinner fullPage={true} label="Refreshing scanner dashboard..." />;
  }

  const firstName = user?.full_name ? user.full_name.split(' ')[0] : 'User';

  const formatStatsDate = (dateString: string | null) => {
    if (!dateString) return 'None';
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });
  };

  const getMemberSince = () => {
    if (!user?.created_at) return 'June 2026';
    return new Date(user.created_at).toLocaleDateString('en-US', {
      month: 'long',
      year: 'numeric'
    });
  };

  return (
    <div className="bg-transparent min-h-[calc(100vh-68px)] px-6 py-10 relative text-slate-100">
      <div className="max-w-7xl mx-auto space-y-12">
        
        {/* Header greetings */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-white/5">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-violet-400 block mb-2">OVERVIEW PORTAL</span>
            <h1 className="font-serif font-bold text-35px md:text-4xl text-white leading-tight">
              Welcome Back, {firstName} 👋
            </h1>
            <p className="text-white/50 text-xs mt-1">
              Select symptoms and analyze image detections to keep your skin integrity updated.
            </p>
          </div>
          
          <Link
            to="/scan/new"
            className="self-start md:self-auto px-5 py-3 bg-gradient-to-r from-violet-500 to-indigo-600 rounded-xl font-bold text-xs tracking-wider text-white shadow-lg shadow-violet-500/20 active:scale-98 hover:opacity-95 transition flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            ANALYZE NEW SCAN
          </Link>
        </div>

        {/* Stats Metrics Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Card 1 */}
          <div className="bg-[#111118] border border-white/7 rounded-2xl p-6 relative overflow-hidden flex flex-col justify-between h-32 group hover:border-white/12 transition">
            <span className="absolute top-4 right-4 w-9 h-9 rounded-xl bg-violet-500/10 flex items-center justify-center text-violet-400">
              <Microscope className="w-5 h-5" />
            </span>
            <div>
              <p className="text-white/45 text-[11px] uppercase font-bold tracking-widest leading-none">Total Scans</p>
              <h2 className="text-3xl font-black font-sans text-white mt-2 leading-none">
                {stats?.total_scans || 0}
              </h2>
            </div>
            <p className="text-[10px] text-white/45 font-medium leading-none">Permanent records saved</p>
          </div>

          {/* Card 2 */}
          <div className="bg-[#111118] border border-white/7 rounded-2xl p-6 relative overflow-hidden flex flex-col justify-between h-32 group hover:border-white/12 transition">
            <span className="absolute top-4 right-4 w-9 h-9 rounded-xl bg-violet-500/10 flex items-center justify-center text-violet-400">
              <Calendar className="w-5 h-5" />
            </span>
            <div>
              <p className="text-white/45 text-[11px] uppercase font-bold tracking-widest leading-none">Last Scan</p>
              <h2 className="text-xl font-bold font-sans text-white mt-3 truncate leading-none">
                {formatStatsDate(stats?.last_scan_date || null)}
              </h2>
            </div>
            <p className="text-[10px] text-white/45 font-medium leading-none">Most recent diagnostic</p>
          </div>

          {/* Card 3 */}
          <div className="bg-[#111118] border border-white/7 rounded-2xl p-6 relative overflow-hidden flex flex-col justify-between h-32 group hover:border-white/12 transition">
            <span className="absolute top-4 right-4 w-9 h-9 rounded-xl bg-violet-500/10 flex items-center justify-center text-violet-400">
              <BarChart2 className="w-5 h-5" />
            </span>
            <div>
              <p className="text-white/45 text-[11px] uppercase font-bold tracking-widest leading-none">Common Profile</p>
              <h2 className="text-base font-extrabold text-white mt-4 truncate max-w-[150px] leading-tight" title={stats?.most_common_condition || 'None yet'}>
                {stats?.most_common_condition || 'None yet'}
              </h2>
            </div>
            <p className="text-[10px] text-white/45 font-medium leading-none">Repetitive disease metrics</p>
          </div>

          {/* Card 4 */}
          <div className="bg-[#111118] border border-white/7 rounded-2xl p-6 relative overflow-hidden flex flex-col justify-between h-32 group hover:border-white/12 transition">
            <span className="absolute top-4 right-4 w-9 h-9 rounded-xl bg-violet-500/10 flex items-center justify-center text-violet-400">
              <Award className="w-5 h-5" />
            </span>
            <div>
              <p className="text-white/45 text-[11px] uppercase font-bold tracking-widest leading-none">Member Since</p>
              <h2 className="text-lg font-bold font-sans text-white mt-3.5 leading-none">
                {getMemberSince()}
              </h2>
            </div>
            <p className="text-[10px] text-white/45 font-medium leading-none">HTU educational participant</p>
          </div>
        </div>

        {/* Recent Scans Section */}
        <div className="space-y-6">
          <div className="flex justify-between items-center pb-2">
            <h2 className="font-serif font-bold text-2xl text-white">Recent Analyses</h2>
            {scans.length > 0 && (
              <Link to="/history" className="text-xs font-bold text-violet-400 hover:text-violet-300 flex items-center gap-1">
                VIEW ALL RECORDS <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            )}
          </div>

          {/* Scans Grid List */}
          {scans.length === 0 ? (
            <div className="bg-[#111118] border border-white/5 rounded-3xl p-12 text-center max-w-xl mx-auto flex flex-col items-center shadow-lg">
              <div className="w-16 h-16 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-400 flex items-center justify-center text-2xl mb-5">
                🔬
              </div>
              <h3 className="text-lg font-bold text-slate-100 mb-2">No scans recorded yet</h3>
              <p className="text-xs text-white/55 max-w-sm mb-6 leading-relaxed">
                Take a clean photo and list your symptoms to generate your very first detailed diagnostic skin report and care program.
              </p>
              <Link
                to="/scan/new"
                className="px-6 py-3 bg-gradient-to-r from-violet-500 to-indigo-600 rounded-xl text-xs font-bold text-white tracking-widest shadow-lg shadow-violet-500/25 active:scale-98 transition"
              >
                START YOUR FIRST SCAN
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {scans.slice(0, 4).map((scan) => (
                <ScanCard key={scan.id} scan={scan} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
