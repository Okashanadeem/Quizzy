'use client';
import { Sparkles, Globe, ArrowUpRight } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-white border-t border-slate-100 mt-auto">
      <div className="max-w-7xl mx-auto px-6 h-20 flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Brand Side */}
        <div className="flex items-center gap-3">
          <div className="p-1.5 rounded-lg bg-slate-900 text-blue-400">
            <Sparkles className="w-4 h-4 fill-current" />
          </div>
          <span className="text-sm font-black text-slate-900 tracking-tighter uppercase">CAMS</span>
          <div className="h-4 w-px bg-slate-200 hidden sm:block"></div>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
            Premium Assessment Solution
          </p>
        </div>

        {/* Developer Side */}
        <div className="flex items-center gap-6">
          <a 
            href="https://github.com/Okashanadeem" 
            target="_blank" 
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-slate-500 hover:text-blue-600 transition-colors group"
          >
            <Globe className="w-4 h-4" />
            <span className="text-xs font-black tracking-tight text-slate-500">Developed by Okasha Nadeem (CR of BSSE Fall 2025)</span>
            <div className="h-3 w-px bg-slate-200"></div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Systems design for SMIU</span>
            <ArrowUpRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-all -translate-y-0.5 text-blue-600" />
          </a>
          
          <div className="text-[10px] font-black text-slate-300 uppercase tracking-[0.2em]">
            &copy; {new Date().getFullYear()}
          </div>
        </div>
      </div>
    </footer>
  );
}
