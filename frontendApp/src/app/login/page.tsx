'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { User, IdCard, ArrowRight, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

export default function StudentLogin() {
  const [name, setName] = useState('');
  const [studentId, setStudentId] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Authenticate via backend
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/student/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, studentId })
      });

      if (response.ok) {
        const student = await response.json();
        
        try {
          // Force clear any active admin session on the backend
          await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/logout`, { 
            method: 'POST', 
            credentials: 'include' 
          });
        } catch (err) {
          console.error('Silent session clear failed', err);
        }

        // Clear any existing admin session from local storage
        localStorage.removeItem('isAdmin');
        
        // Set student session
        localStorage.setItem('student', JSON.stringify(student));
        toast.success(`Welcome back, ${student.name}!`);
        router.push('/dashboard');
      } else {
        toast.error('Invalid credentials. Please check your name and ID.');
        setLoading(false);
      }
    } catch (err) {
      toast.error('Connection error. Is the backend server running?');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center bg-slate-50 px-6 py-12">
      <div className="max-w-md w-full">
        {/* Logo/Header */}
        <div className="text-center mb-10">
          <div className="inline-flex p-4 rounded-3xl bg-blue-600 text-white mb-6 shadow-lg shadow-blue-200">
            <User className="w-8 h-8" />
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900">Student Portal</h1>
          <p className="text-slate-500 mt-2 text-lg">Enter your credentials to access quizzes</p>
        </div>

        {/* Login Card */}
        <div className="bg-white p-8 rounded-[2rem] shadow-xl shadow-slate-200/60 border border-slate-100">
          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <label htmlFor="name" className="text-sm font-semibold text-slate-700 ml-1">
                Full Name
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-blue-600 transition-colors">
                  <User className="w-5 h-5" />
                </div>
                <input
                  id="name"
                  type="text"
                  required
                  placeholder="e.g. John Doe"
                  className="block w-full pl-11 pr-4 py-3.5 bg-slate-50 border-transparent focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 rounded-2xl transition-all outline-none text-slate-900 placeholder:text-slate-400 font-medium"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="studentId" className="text-sm font-semibold text-slate-700 ml-1">
                Student ID
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-blue-600 transition-colors">
                  <IdCard className="w-5 h-5" />
                </div>
                <input
                  id="studentId"
                  type="text"
                  required
                  placeholder="e.g. BSE-25F-000"
                  className="block w-full pl-11 pr-4 py-3.5 bg-slate-50 border-transparent focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 rounded-2xl transition-all outline-none text-slate-900 placeholder:text-slate-400 font-medium"
                  value={studentId}
                  onChange={(e) => setStudentId(e.target.value)}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center items-center gap-2 py-4 px-4 bg-blue-600 text-white text-lg font-bold rounded-2xl hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-500/20 disabled:opacity-70 disabled:cursor-not-allowed transition-all shadow-lg shadow-blue-200"
            >
              {loading ? (
                <Loader2 className="w-6 h-6 animate-spin" />
              ) : (
                <>
                  Sign In
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>
        </div>

        {/* Support Note */}
        <p className="text-center mt-8 text-slate-500 text-sm">
          Having trouble? Contact your instructor for your credentials.
        </p>
      </div>
    </div>
  );
}
