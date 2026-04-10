'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowRight, ShieldCheck, Clock, CheckCircle2, GraduationCap, LayoutDashboard, Sparkles, Zap, ChevronRight } from 'lucide-react';

export default function Home() {
  const [isStudentLoggedIn, setIsStudentLoggedIn] = useState(false);
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const checkAuth = () => {
      setIsStudentLoggedIn(!!localStorage.getItem('student'));
      setIsAdminLoggedIn(!!localStorage.getItem('isAdmin'));
    };
    checkAuth();
    window.addEventListener('storage', checkAuth);
    return () => window.removeEventListener('storage', checkAuth);
  }, []);

  if (!mounted) return null; // Prevent hydration mismatch

  return (
    <div className="min-h-[calc(100vh-80px)] bg-slate-50 overflow-hidden flex flex-col relative selection:bg-blue-500/30 selection:text-blue-900">
      
      {/* Decorative Background Elements */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-100 rounded-full blur-[120px] opacity-60"></div>
        <div className="absolute bottom-[-10%] right-[-5%] w-[30%] h-[40%] bg-indigo-100 rounded-full blur-[100px] opacity-60"></div>
        <div className="absolute top-[20%] right-[10%] w-[20%] h-[30%] bg-emerald-50 rounded-full blur-[80px] opacity-50"></div>
      </div>

      <main className="flex-grow flex flex-col justify-center relative z-10">
        <div className="max-w-7xl mx-auto px-6 py-20 lg:py-32 text-center">
          
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-slate-200 text-blue-600 text-xs sm:text-sm font-black mb-10 shadow-sm animate-in fade-in slide-in-from-bottom-4 duration-700 uppercase tracking-[0.2em]">
            <Sparkles className="w-4 h-4 fill-current" />
            Next-Gen Assessment Platform
          </div>
          
          <h1 className="text-5xl sm:text-6xl lg:text-[7rem] font-black tracking-tighter text-slate-900 mb-8 leading-[1.05] animate-in fade-in slide-in-from-bottom-6 duration-700 delay-100">
            Assess with <span className="text-transparent bg-clip-text bg-gradient-to-br from-blue-600 to-indigo-600">Confidence</span>,<br className="hidden sm:block" />
            Grade with <span className="text-transparent bg-clip-text bg-gradient-to-br from-indigo-600 to-blue-600">Ease</span>.
          </h1>
          
          <p className="max-w-2xl mx-auto text-base sm:text-lg lg:text-xl text-slate-500 mb-14 font-medium leading-relaxed italic animate-in fade-in slide-in-from-bottom-8 duration-700 delay-200">
            EazyQuizzy provides a streamlined, secure environment for creating and taking assessments. 
            Experience automated grading and detailed reporting today.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center max-w-lg mx-auto sm:max-w-none animate-in fade-in slide-in-from-bottom-10 duration-700 delay-300">
            <Link
              href="/join"
              className="group w-full sm:w-auto px-8 py-4 sm:py-5 rounded-2xl bg-blue-600 text-white font-black text-base sm:text-lg hover:bg-blue-700 transition-all shadow-xl shadow-blue-200 flex items-center justify-center gap-3 active:scale-[0.98]"
            >
              <GraduationCap className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              Join Assessment
              <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 group-hover:translate-x-1 transition-transform" />
            </Link>

            {isAdminLoggedIn ? (
              <Link
                href={localStorage.getItem('userRole') === 'superadmin' ? "/admin/super" : "/admin/dashboard"}
                className="w-full sm:w-auto px-8 py-4 sm:py-5 rounded-2xl bg-white text-slate-900 font-black text-base sm:text-lg border-2 border-slate-200 hover:border-slate-300 hover:bg-slate-50 transition-all shadow-sm flex items-center justify-center gap-3 active:scale-[0.98]"
              >
                <ShieldCheck className="w-5 h-5 sm:w-6 sm:h-6 text-emerald-600" />
                Admin Console
              </Link>
            ) : (
              <Link
                href="/admin/login"
                className="w-full sm:w-auto px-8 py-4 sm:py-5 rounded-2xl bg-white text-slate-900 font-black text-base sm:text-lg border-2 border-slate-200 hover:border-slate-300 hover:bg-slate-50 transition-all shadow-sm flex items-center justify-center gap-3 active:scale-[0.98]"
              >
                <ShieldCheck className="w-5 h-5 sm:w-6 sm:h-6 text-slate-400" />
                Instructor Login
              </Link>
            )}
          </div>
        </div>

        {/* Feature Grid */}
        <div className="max-w-7xl mx-auto px-6 pb-24 relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 animate-in fade-in slide-in-from-bottom-12 duration-700 delay-500">
            <FeatureCard 
              icon={<Clock className="w-6 h-6 text-blue-600" />}
              title="Timed Assessments"
              description="Strictly enforced time limits with server-side validation to ensure fair play across all your live quizzes."
            />
            <FeatureCard 
              icon={<ShieldCheck className="w-6 h-6 text-emerald-600" />}
              title="Focus Enforcement"
              description="Advanced monitoring detects when students leave the assessment tab, reporting violations directly to instructors."
            />
            <FeatureCard 
              icon={<CheckCircle2 className="w-6 h-6 text-indigo-600" />}
              title="Instant Analytics"
              description="Automatic grading for multiple-choice questions provides immediate feedback and comprehensive performance insights."
            />
          </div>
        </div>
      </main>
    </div>
  );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) {
  return (
    <div className="bg-white/80 backdrop-blur-xl p-8 rounded-[2.5rem] shadow-xl shadow-slate-200/40 border border-slate-100 hover:scale-[1.02] hover:shadow-2xl hover:shadow-blue-900/5 transition-all duration-300">
      <div className="inline-flex p-4 rounded-2xl bg-slate-50 border border-slate-100 mb-6 shadow-inner">
        {icon}
      </div>
      <h3 className="text-2xl font-black text-slate-900 mb-3 tracking-tight">{title}</h3>
      <p className="text-slate-500 font-medium leading-relaxed">{description}</p>
    </div>
  );
}
