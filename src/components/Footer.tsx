import React from 'react';
import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="mt-auto pt-10 pb-8 border-t border-white/5 px-6 bg-[#09090e]">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Grid layout for footer */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
          
          {/* Col 1: About */}
          <div className="space-y-3">
            <div className="font-serif font-black text-lg text-white flex items-center gap-2">
              <span>🔬</span> DermScan AI
            </div>
            <p className="text-sm text-white/60 leading-relaxed pr-4">
              A simple, smart skin helper built to make skin checks easy and easy to understand. Easily scan pictures of skin changes, log your symptoms, and find real-world product suggestions customized for you.
            </p>
          </div>

          {/* Col 2: Navigation Links */}
          <div className="space-y-3">
            <h4 className="text-xs font-black uppercase tracking-wider text-violet-400">Quick Links</h4>
            <div className="grid grid-cols-2 gap-2 text-sm font-medium text-white/55">
              <Link to="/" className="hover:text-violet-400 transition">Main Page</Link>
              <Link to="/scan/new" className="hover:text-violet-400 transition">New Skin Check</Link>
              <Link to="/history" className="hover:text-violet-400 transition">Past Checks</Link>
              <Link to="/profile" className="hover:text-violet-400 transition">My Skin Profile</Link>
            </div>
          </div>

          {/* Col 3: Research or Project Affiliation */}
          <div className="space-y-3">
            <h4 className="text-xs font-black uppercase tracking-wider text-violet-400">Project Information</h4>
            <p className="text-sm text-white/60 leading-relaxed font-sans">
              Designed as an academic project evaluating automated skin disease detection, diagnosis, and product recommendation under Ho Technical University.
            </p>
          </div>
          
        </div>

        {/* Signature and Copyright info */}
        <div className="pt-4 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between text-xs text-white/40 gap-3 font-mono">
          <span>© 2026 DermScan AI. Ho Technical University Research Project.</span>
          <span>All Session Data Secured Offline</span>
        </div>

      </div>
    </footer>
  );
}
