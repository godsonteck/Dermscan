import React from 'react';
import { Product } from '../types/index.js';

export default function ProductCard({ product }: { product: Product; key?: any }) {
  const { name, brand, type, emoji, description, key_ingredients, price_range, how_to_use } = product;

  // Set colors based on category/type
  const getTypeColor = (category: string) => {
    const norm = (category || 'Moisturizer').toLowerCase();
    if (norm.includes('cleanser') || norm.includes('toner')) {
      return 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20';
    }
    if (norm.includes('moisturizer') || norm.includes('lotion')) {
      return 'bg-violet-500/10 text-violet-400 border-violet-500/20';
    }
    if (norm.includes('cream') || norm.includes('ointment')) {
      return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
    }
    if (norm.includes('serum') || norm.includes('antihistamine')) {
      return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
    }
    if (norm.includes('antifungal') || norm.includes('gel')) {
      return 'bg-rose-500/10 text-rose-400 border-rose-500/20';
    }
    return 'bg-zinc-500/10 text-zinc-400 border-zinc-500/20';
  };

  return (
    <div className="bg-[#111118] border border-white/8 hover:border-white/15 rounded-2xl p-5 hover:-translate-y-0.5 transition-all duration-200 flex flex-col justify-between h-full group">
      <div>
        <div className="flex items-start justify-between gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-slate-800/80 flex items-center justify-center text-xl shadow-inner group-hover:scale-105 transition-transform">
            {emoji || '🧴'}
          </div>
          <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${getTypeColor(type)}`}>
            {type}
          </span>
        </div>

        <div className="mb-3">
          <span className="text-xs font-bold uppercase tracking-wider text-violet-400 mb-0.5 block">{brand}</span>
          <h4 className="text-base font-bold text-slate-100 leading-tight">{name}</h4>
        </div>

        <p className="text-sm text-white/70 mb-4 leading-relaxed">
          {description}
        </p>

        {key_ingredients && key_ingredients.length > 0 && (
          <div className="mb-4">
            <span className="text-xs uppercase font-extrabold tracking-widest text-white/50 block mb-1.5">Key Ingredients</span>
            <div className="flex flex-wrap gap-1.5">
              {key_ingredients.map((ingredient, idx) => (
                <span key={idx} className="bg-white/5 text-white/80 px-2.5 py-1 rounded text-xs font-bold">
                  {ingredient}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="pt-4 border-t border-white/5 flex flex-col gap-2">
        {how_to_use && (
          <div className="text-sm leading-relaxed">
            <span className="text-white/50 font-extrabold">Directions: </span>
            <span className="text-white/70 italic">{how_to_use}</span>
          </div>
        )}
        <div className="flex justify-between items-center mt-1.5">
          <span className="text-sm font-bold text-white/50">Price Range</span>
          <span className="text-sm font-extrabold text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-md">
            {price_range || '$10 - $20'}
          </span>
        </div>
      </div>
    </div>
  );
}
