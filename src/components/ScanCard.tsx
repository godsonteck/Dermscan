import React from 'react';
import { ScanListItem } from '../types/index.js';
import SeverityBadge from './SeverityBadge.js';
import ConfidenceBadge from './ConfidenceBadge.js';
import { Calendar, Layers } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function ScanCard({ scan }: { scan: ScanListItem; key?: any }) {
  const { id, condition, confidence, severity, image_path, body_part, skin_type, symptoms, created_at } = scan;

  const formattedDate = new Date(created_at).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });

  return (
    <Link 
      id={`scan-card-${id}`} 
      to={`/scan/${id}`}
      className="bg-[#111118] border border-white/8 hover:border-white/15 hover:-translate-y-0.5 transition-all duration-200 rounded-2xl overflow-hidden flex flex-col md:flex-row shadow-lg hover:shadow-violet-950/10"
    >
      {/* Thumbnail */}
      <div className="w-full md:w-36 h-36 bg-slate-900 border-b md:border-b-0 md:border-r border-white/5 shrink-0 relative flex items-center justify-center">
        {image_path ? (
          <img 
            src={image_path} 
            alt={condition} 
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
        ) : (
          <div className="flex flex-col items-center justify-center text-slate-500">
            <span className="text-3xl mb-1">🔬</span>
            <span className="text-[10px] uppercase font-bold tracking-wider text-slate-500">No Image</span>
          </div>
        )}
      </div>

      {/* Main details */}
      <div className="p-5 flex-1 flex flex-col justify-between">
        <div>
          <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
            <span className="text-[10px] uppercase font-bold tracking-widest text-violet-400">Scan Analysis</span>
            <div className="flex items-center gap-2 text-[11px] text-white/50">
              <Calendar className="w-3.5 h-3.5" />
              {formattedDate}
            </div>
          </div>

          <h3 className="text-lg font-bold text-white mb-2 leading-tight group-hover:text-violet-300">
            {condition || 'Analyzing...'}
          </h3>

          <div className="flex flex-wrap gap-x-4 gap-y-1.5 text-xs text-white/60 mb-3">
            {body_part && (
              <span className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-violet-500" />
                Region: <strong className="text-white font-medium">{body_part}</strong>
              </span>
            )}
            {skin_type && (
              <span className="flex items-center gap-1">
                <Layers className="w-3.5 h-3.5 text-white/40" />
                Skin: <strong className="text-white font-medium">{skin_type}</strong>
              </span>
            )}
          </div>

          {symptoms && symptoms.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-3">
              {symptoms.slice(0, 3).map((sym, idx) => (
                <span key={idx} className="bg-white/5 text-[10px] font-medium text-white/75 px-2 py-0.5 rounded-full">
                  {sym}
                </span>
              ))}
              {symptoms.length > 3 && (
                <span className="bg-white/5 text-[10px] font-medium text-white/45 px-1.5 py-0.5 rounded-full">
                  +{symptoms.length - 3} more
                </span>
              )}
            </div>
          )}
        </div>

        {/* Badges footer */}
        <div className="flex flex-wrap gap-2 pt-3 border-t border-white/5">
          <SeverityBadge severity={severity} />
          <ConfidenceBadge confidence={confidence} />
        </div>
      </div>
    </Link>
  );
}
