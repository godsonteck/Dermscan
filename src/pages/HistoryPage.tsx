import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/client.js';
import { ScanListItem } from '../types/index.js';
import LoadingSpinner from '../components/LoadingSpinner.js';
import SeverityBadge from '../components/SeverityBadge.js';
import ConfidenceBadge from '../components/ConfidenceBadge.js';
import DeleteModal from '../components/DeleteModal.js';
import { Search, Calendar, ChevronLeft, ChevronRight, Trash2, SlidersHorizontal, Layers, PlusCircle } from 'lucide-react';
import toast from 'react-hot-toast';

export default function HistoryPage() {
  const [scans, setScans] = useState<ScanListItem[]>([]);
  const [filteredScans, setFilteredScans] = useState<ScanListItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Search/Filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [severityFilter, setSeverityFilter] = useState('ALL');

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Delete modal state
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedDeleteScan, setSelectedDeleteScan] = useState<ScanListItem | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    async function loadScans() {
      try {
        const response = await api.get<ScanListItem[]>('/scans');
        setScans(response.data);
        setFilteredScans(response.data);
      } catch (error: any) {
        console.error('Failed to load past scans:', error);
        toast.error('Could not load history reports logs.');
      } finally {
        setIsLoading(false);
      }
    }
    loadScans();
  }, []);

  // Filter evaluations on query state change
  useEffect(() => {
    let result = [...scans];

    if (searchTerm) {
      result = result.filter((scan) =>
        scan.condition.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (severityFilter !== 'ALL') {
      result = result.filter(
        (scan) => scan.severity.toUpperCase() === severityFilter.toUpperCase()
      );
    }

    setFilteredScans(result);
    setCurrentPage(1); // Reset to page 1 on active filter change
  }, [searchTerm, severityFilter, scans]);

  const handleDeleteTrigger = (e: React.MouseEvent, scan: ScanListItem) => {
    e.stopPropagation();
    e.preventDefault();
    setSelectedDeleteScan(scan);
    setDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!selectedDeleteScan) return;
    setIsDeleting(true);
    try {
      await api.delete(`/scans/${selectedDeleteScan.id}`);
      setScans((prev) => prev.filter((s) => s.id !== selectedDeleteScan.id));
      toast.success('Scan report erased successfully!');
    } catch (error: any) {
      console.error(error);
      toast.error('Delete request failed.');
    } finally {
      setIsDeleting(false);
      setDeleteModalOpen(false);
      setSelectedDeleteScan(null);
    }
  };

  if (isLoading) {
    return <LoadingSpinner fullPage={true} label="Refreshing scanner history archives..." />;
  }

  // Pagination logic math
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredScans.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredScans.length / itemsPerPage) || 1;

  const handlePrevPage = () => {
    if (currentPage > 1) setCurrentPage((p) => p - 1);
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage((p) => p + 1);
  };

  const formatRowDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <div className="bg-transparent min-h-[calc(100vh-68px)] px-6 py-10 text-slate-100 flex flex-col items-center">
      <div className="max-w-5xl w-full space-y-8">
        
        {/* Header summary */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-white/5">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-violet-400 block mb-2">SCAN ARCHIVES</span>
            <h1 className="font-serif font-bold text-3xl text-white">Diagnostic History</h1>
            <p className="text-white/50 text-xs mt-1">
              Currently listing {filteredScans.length} of {scans.length} analyzed reports.
            </p>
          </div>

          <Link
            to="/scan/new"
            className="self-start md:self-auto px-4.5 py-2.5 bg-gradient-to-r from-violet-500 to-indigo-600 rounded-xl font-bold text-xs text-white shadow-md shadow-violet-500/10 hover:opacity-95 transition flex items-center gap-1.5"
          >
            <PlusCircle className="w-4 h-4" /> Start New Scan
          </Link>
        </div>

        {/* Filter Toolbar */}
        <div className="flex flex-col sm:flex-row gap-4 items-center bg-[#111118]/90 border border-white/7 rounded-2xl p-4 shadow-md">
          {/* Search bar */}
          <div className="relative flex-1 w-full">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by detected skin condition..."
              className="bg-white/5 border border-white/10 hover:border-white/15 focus:border-violet-500/60 focus:ring-4 focus:ring-violet-500/10 text-slate-100 text-xs pl-10 pr-4 py-3 rounded-xl w-full placeholder-white/30 outline-none transition"
            />
            <Search className="w-4.5 h-4.5 text-white/30 absolute left-3.5 top-1/2 -translate-y-1/2" />
          </div>

          {/* Filtering dropdown */}
          <div className="flex items-center gap-3 w-full sm:w-auto self-stretch">
            <SlidersHorizontal className="w-4.5 h-4.5 text-violet-400 shrink-0 hidden sm:block" />
            <select
              value={severityFilter}
              onChange={(e) => setSeverityFilter(e.target.value)}
              className="bg-white/5 border border-white/10 hover:border-white/15 focus:border-violet-500/60 focus:ring-4 focus:ring-violet-500/10 text-slate-100 text-xs px-4 py-3 rounded-xl w-full sm:w-44 outline-none transition cursor-pointer font-bold"
            >
              <option value="ALL" className="bg-[#111118]">All Severities</option>
              <option value="LOW" className="bg-[#111118]">Low Severity</option>
              <option value="MODERATE" className="bg-[#111118]">Moderate Severity</option>
              <option value="HIGH" className="bg-[#111118]">High Severity</option>
            </select>
          </div>
        </div>

        {/* Scan rows results list */}
        {filteredScans.length === 0 ? (
          <div className="bg-[#111118] border border-white/5 rounded-3xl p-12 text-center flex flex-col items-center">
            <span className="text-4xl mb-4">🗂️</span>
            <h3 className="text-base font-bold text-white mb-2">No historical scans matched</h3>
            <p className="text-xs text-white/50 max-w-sm mb-6 leading-relaxed">
              We couldn't locate any saved records conforming to your active search query configurations. Adjust filters or register a new scan.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {currentItems.map((scan) => (
              <Link 
                key={scan.id} 
                to={`/scan/${scan.id}`}
                className="bg-[#111118] border border-white/6 hover:border-white/12 rounded-2xl overflow-hidden p-4 flex flex-col sm:flex-row items-center gap-4 hover:-translate-y-0.5 transition-all duration-150 shadow-md group relative"
              >
                {/* Thumbnail */}
                <div className="w-20 h-20 rounded-xl bg-slate-900 border border-white/5 shrink-0 overflow-hidden relative flex items-center justify-center">
                  {scan.image_path ? (
                    <img src={scan.image_path} alt={scan.condition} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-2xl">🔬</span>
                  )}
                </div>

                {/* Info block */}
                <div className="flex-1 min-w-0 text-center sm:text-left space-y-1.5 w-full">
                  <div className="flex items-center justify-center sm:justify-start gap-2 flex-wrap">
                    <h3 className="text-base font-extrabold text-white truncate max-w-xs group-hover:text-violet-300 transition">
                      {scan.condition}
                    </h3>
                    <div className="flex items-center gap-1 text-[11px] text-white/40 font-medium">
                      <Calendar className="w-3.5 h-3.5" />
                      {formatRowDate(scan.created_at)}
                    </div>
                  </div>

                  <div className="flex items-center justify-center sm:justify-start gap-x-3 gap-y-1 text-xs text-white/50 flex-wrap">
                    {scan.body_part && (
                      <span className="flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-violet-400" />
                        Region: <strong className="text-white font-semibold">{scan.body_part}</strong>
                      </span>
                    )}
                    {scan.skin_type && (
                      <span className="flex items-center gap-1.5">
                        <Layers className="w-3.5 h-3.5 text-white/35" />
                        Skin: <strong className="text-white font-semibold">{scan.skin_type}</strong>
                      </span>
                    )}
                  </div>

                  {/* Symptom chips preview */}
                  {scan.symptoms && scan.symptoms.length > 0 && (
                    <div className="flex flex-wrap items-center justify-center sm:justify-start gap-1">
                      {scan.symptoms.slice(0, 4).map((sym, idx) => (
                        <span key={idx} className="bg-white/5 border border-white/5 text-[9px] font-bold text-white/75 px-2 py-0.5 rounded">
                          {sym}
                        </span>
                      ))}
                      {scan.symptoms.length > 4 && (
                        <span className="text-[9px] text-white/40 font-bold px-1 py-0.5">
                          +{scan.symptoms.length - 4} more
                        </span>
                      )}
                    </div>
                  )}
                </div>

                {/* Right controls */}
                <div className="flex items-center gap-4 shrink-0 justify-center w-full sm:w-auto pt-3 sm:pt-0 border-t sm:border-0 border-white/5">
                  <div className="flex flex-col items-center sm:items-end gap-1.5">
                    <SeverityBadge severity={scan.severity} />
                    <ConfidenceBadge confidence={scan.confidence} />
                  </div>

                  <button
                    onClick={(e) => handleDeleteTrigger(e, scan)}
                    className="w-9 h-9 rounded-xl bg-rose-500/10 hover:bg-rose-600 border border-rose-500/15 hover:border-rose-600 text-rose-400 hover:text-white flex items-center justify-center active:scale-95 transition"
                    title="Delete Scan Report"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* Paginations Controls */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between pt-4 border-t border-white/5 text-xs text-white/55">
            <button
              onClick={handlePrevPage}
              disabled={currentPage === 1}
              className="flex items-center gap-1 px-3 py-2 border border-white/10 rounded-xl hover:bg-white/5 hover:border-white/20 disabled:opacity-30 disabled:pointer-events-none transition font-bold"
            >
              <ChevronLeft className="w-4 h-4" /> Prev Page
            </button>
            <span className="font-bold">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={handleNextPage}
              disabled={currentPage === totalPages}
              className="flex items-center gap-1 px-3 py-2 border border-white/10 rounded-xl hover:bg-white/5 hover:border-white/20 disabled:opacity-30 disabled:pointer-events-none transition font-bold"
            >
              Next Page <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Delete Confirm Modal */}
        <DeleteModal
          isOpen={deleteModalOpen}
          isDeleting={isDeleting}
          onClose={() => setDeleteModalOpen(false)}
          onConfirm={handleConfirmDelete}
          conditionName={selectedDeleteScan?.condition}
        />

      </div>
    </div>
  );
}
