'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowRight, ShieldCheck, Clock, CheckCircle2, GraduationCap, LayoutDashboard, Sparkles, Zap } from 'lucide-react';

export default function Home() {
  const [isStudentLoggedIn, setIsStudentLoggedIn] = useState(false);
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);

  useEffect(() => {
    setIsStudentLoggedIn(!!localStorage.getItem('student'));
    setIsAdminLoggedIn(!!localStorage.getItem('isAdmin'));
  }, []);

  return (
    <div className="flex-grow flex flex-col bg-white font-sans">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-20 pb-24 lg:pt-32 lg:pb-40">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full -z-10">
          <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-50 rounded-full blur-[120px] opacity-60"></div>
          <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-50 rounded-full blur-[120px] opacity-60"></div>
        </div>

        <div className="max-w-7xl mx-auto px-6 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-100 text-blue-600 text-sm font-bold mb-8 animate-fade-in uppercase tracking-wider">
            <Sparkles className="w-4 h-4 fill-current" />
            Next-Gen Assessment Platform
          </div>
          
          <h1 className="text-5xl lg:text-8xl font-black tracking-tight text-slate-900 mb-8 leading-[1]">
            Assess with <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">Confidence</span>,<br />
            Grade with <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-blue-600">Ease</span>.
          </h1>
          
          <p className="max-w-2xl mx-auto text-lg lg:text-xl text-slate-500 mb-12 font-medium leading-relaxed italic">
            Quizzy provides a streamlined, secure environment for creating and taking assessments. 
            Automated MCQ grading and detailed reporting for short answers.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            {isStudentLoggedIn ? (
              <Link
                href="/dashboard"
                className="group w-full sm:w-auto px-10 py-5 rounded-2xl bg-blue-600 text-white font-black text-lg hover:bg-blue-700 transition-all shadow-2xl shadow-blue-200 hover:shadow-blue-300 flex items-center justify-center gap-3 active:scale-95"
              >
                <LayoutDashboard className="w-6 h-6" />
                Go to My Dashboard
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
            ) : (
              <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
                <Link
                  href="/login"
                  className="group px-10 py-5 rounded-2xl bg-blue-600 text-white font-black text-lg hover:bg-blue-700 transition-all shadow-2xl shadow-blue-200 hover:shadow-blue-300 flex items-center justify-center gap-3 active:scale-95"
                >
                  <GraduationCap className="w-6 h-6" />
                  Student Login
                </Link>
                <Link
                  href="/join"
                  className="group px-10 py-5 rounded-2xl bg-white text-slate-900 font-black text-lg border-2 border-slate-100 hover:border-indigo-500 hover:text-indigo-600 hover:bg-indigo-50/30 transition-all flex items-center justify-center gap-3 active:scale-95 shadow-lg shadow-slate-100"
                >
                  <Zap className="w-6 h-6 fill-current text-indigo-500" />
                  Join as Guest
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform opacity-50" />
                </Link>
              </div>
            )}

            {isAdminLoggedIn ? (
              <Link
                href="/admin/dashboard"
                className="w-full sm:w-auto px-10 py-5 rounded-2xl bg-slate-900 text-white font-black text-lg hover:bg-slate-800 transition-all shadow-2xl shadow-slate-200 flex items-center justify-center gap-3 active:scale-95"
              >
                <LayoutDashboard className="w-6 h-6 text-blue-400" />
                Admin Console
              </Link>
            ) : (
              <Link
                href="/admin/login"
                className="w-full sm:w-auto px-10 py-5 rounded-2xl bg-white text-slate-900 font-black text-lg border-2 border-slate-100 hover:border-slate-200 hover:bg-slate-50 transition-all flex items-center justify-center gap-3 active:scale-95 shadow-lg shadow-slate-100"
              >
                <LayoutDashboard className="w-6 h-6 text-blue-600" />
                Admin Portal
              </Link>
            )}
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-24 bg-slate-50/50 border-y border-slate-100">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-20">
            <h2 className="text-4xl font-black text-slate-900 mb-4 tracking-tight">Built for Modern Education</h2>
            <p className="text-slate-500 font-medium italic">Powerful features to simplify the assessment lifecycle.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            <FeatureCard 
              icon={<ShieldCheck className="w-8 h-8 text-blue-600" />}
              title="Secure Environment"
              description="Built-in tab-switch detection ensures students stay focused on the assessment during live windows."
            />
            <FeatureCard 
              icon={<Clock className="w-8 h-8 text-indigo-600" />}
              title="Smart Timers"
              description="Flexible visibility windows and per-student duration timers with reliable server-side auto-submission."
            />
            <FeatureCard 
              icon={<CheckCircle2 className="w-8 h-8 text-emerald-600" />}
              title="Instant Grading"
              description="MCQs are graded instantly. Teachers get detailed HTML answer sheets via email for every attempt."
            />
          </div>
        </div>
      </section>


    </div>
  );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) {
  return (
    <div className="p-10 bg-white rounded-[2.5rem] border border-slate-200 shadow-sm hover:shadow-xl hover:shadow-slate-200/50 transition-all duration-300 group">
      <div className="mb-8 inline-flex p-4 rounded-2xl bg-slate-50 group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors">
        {icon}
      </div>
      <h3 className="text-2xl font-black text-slate-900 mb-4 tracking-tight">{title}</h3>
      <p className="text-slate-500 font-medium leading-relaxed italic opacity-80">{description}</p>
    </div>
  );
}
