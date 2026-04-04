'use client';
import { Sparkles, Globe, ArrowUpRight } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-white border-t border-slate-100 mt-auto">
      <div className="max-w-7xl mx-auto px-6 py-10 flex flex-col md:flex-row items-center justify-between gap-8">
        {/* Brand Side */}
        <div className="flex flex-col items-center md:items-start gap-3">
          <div className="flex items-center gap-3">
            <div className="p-1.5 rounded-lg bg-slate-900 text-blue-400">
              <Sparkles className="w-4 h-4 fill-current" />
            </div>
            <span className="text-sm font-black text-slate-900 tracking-tighter uppercase">Quizzy</span>
          </div>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">
            Next-Gen Assessment Platform
          </p>
        </div>

        {/* Developer Side */}
        <div className="flex flex-col items-center md:items-end gap-4">
          <a 
            href="https://github.com/Okashanadeem" 
            target="_blank" 
            rel="noopener noreferrer"
            className="flex flex-col items-center md:items-end gap-1 text-slate-500 hover:text-blue-600 transition-colors group text-center md:text-right"
          >
            <div className="flex items-center gap-2">
              <Globe className="w-4 h-4" />
              <span className="text-xs font-black tracking-tight text-slate-600">Okasha Nadeem</span>
              <ArrowUpRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-all -translate-y-0.5 text-blue-600" />
            </div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              Systems Design for SMIU
            </span>
          </a>
          
          <div className="text-[10px] font-black text-slate-300 uppercase tracking-[0.3em]">
            &copy; {new Date().getFullYear()} • ALL RIGHTS RESERVED
          </div>
        </div>
      </div>
    </footer>
  );
}
