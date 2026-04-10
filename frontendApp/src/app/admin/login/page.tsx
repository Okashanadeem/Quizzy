'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  ShieldCheck, 
  Lock, 
  Mail, 
  ArrowRight, 
  Loader2, 
  Sparkles,
  ChevronLeft,
  UserCircle2
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function AdminLogin() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch(`/api/admin/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
        credentials: 'include',
      });

      if (response.ok) {
        const data = await response.json();
        localStorage.setItem('isAdmin', 'true');
        localStorage.setItem('userRole', data.role);
        
        toast.success(`Welcome back, ${data.role === 'superadmin' ? 'Super Admin' : 'Instructor'}!`, {
            icon: '👋',
            style: {
                borderRadius: '1rem',
                background: '#0f172a',
                color: '#fff',
                fontWeight: 'bold'
            }
        });
        
        if (data.role === 'superadmin') {
          router.push('/admin/super');
        } else {
          router.push('/admin/dashboard');
        }
      } else {
        const data = await response.json();
        toast.error(data.message || 'Access denied. Invalid credentials.');
        setLoading(false);
      }
    } catch (err) {
      toast.error('Connection error. Is the backend server running?');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 relative overflow-hidden">
      {/* Decorative Background */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none z-0">
        <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-blue-100/50 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-100/50 rounded-full blur-[100px]"></div>
      </div>

      <div className="max-w-md w-full relative z-10">
        {/* Brand Logo */}
        <div className="text-center mb-10">
          <div className="inline-flex p-4 rounded-[2rem] bg-slate-900 text-white mb-6 shadow-2xl shadow-slate-200 group hover:scale-105 transition-transform duration-500">
            <ShieldCheck className="w-10 h-10 text-blue-400" />
          </div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tighter mb-2">Internal Portal</h1>
          <p className="text-slate-500 font-bold uppercase tracking-[0.2em] text-[10px]">
            EazyQuizzy • Super Admin & Instructor Access
          </p>
        </div>

        {/* Login Card */}
        <div className="bg-white p-10 rounded-[3rem] shadow-[0_32px_64px_-12px_rgba(15,23,42,0.1)] border border-slate-100 relative overflow-hidden">
          {/* Subtle accent bar */}
          <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-blue-600 to-indigo-600"></div>

          <form onSubmit={handleLogin} className="space-y-8">
            <div className="space-y-6">
              {/* Username/Email Field */}
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                  <UserCircle2 className="w-3 h-3" />
                  Admin ID or Email
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none text-slate-300 group-focus-within:text-blue-600 transition-colors">
                    <Mail className="w-5 h-5" />
                  </div>
                  <input
                    type="text"
                    required
                    placeholder="admin_root or email@edu.com"
                    className="block w-full pl-14 pr-6 py-5 bg-slate-50 border-transparent focus:bg-white focus:border-blue-600 focus:ring-4 focus:ring-blue-600/5 rounded-2xl transition-all outline-none text-slate-900 font-bold placeholder:text-slate-300 placeholder:font-medium"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                  />
                </div>
              </div>

              {/* Password Field */}
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                  <Lock className="w-3 h-3" />
                  Secret Key
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none text-slate-300 group-focus-within:text-blue-600 transition-colors">
                    <Lock className="w-5 h-5" />
                  </div>
                  <input
                    type="password"
                    required
                    placeholder="••••••••••••"
                    className="block w-full pl-14 pr-6 py-5 bg-slate-50 border-transparent focus:bg-white focus:border-blue-600 focus:ring-4 focus:ring-blue-600/5 rounded-2xl transition-all outline-none text-slate-900 font-bold placeholder:text-slate-300 placeholder:font-medium tracking-widest"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center items-center gap-3 py-5 px-6 bg-slate-900 text-white text-xl font-black rounded-3xl hover:bg-slate-800 focus:outline-none focus:ring-4 focus:ring-slate-900/10 disabled:opacity-70 disabled:cursor-not-allowed transition-all shadow-2xl shadow-slate-200 active:scale-[0.98]"
            >
              {loading ? (
                <Loader2 className="w-7 h-7 animate-spin" />
              ) : (
                <>
                  Authenticate Access
                  <ArrowRight className="w-6 h-6 group-hover:translate-x-1.5 transition-transform text-blue-400" />
                </>
              )}
            </button>
          </form>

          <div className="mt-10 pt-8 border-t border-slate-50 flex items-center justify-between text-[10px] font-bold text-slate-400 uppercase tracking-widest">
            <span className="flex items-center gap-1.5">
                <Sparkles className="w-3 h-3 text-blue-500 fill-current" />
                Encrypted Session
            </span>
            <span>v2.0 Enterprise</span>
          </div>
        </div>

        {/* Back Button */}
        <p className="text-center mt-10">
          <button 
            onClick={() => router.push('/')}
            className="inline-flex items-center gap-2 text-slate-400 hover:text-slate-900 text-xs font-black uppercase tracking-widest transition-all group"
          >
            <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            Back to Public Site
          </button>
        </p>
      </div>
    </div>
  );
}
