'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Sparkles, 
  Hash, 
  User, 
  Mail, 
  ArrowRight, 
  Loader2,
  AlertCircle,
  GraduationCap
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function JoinQuizPage() {
  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [studentId, setStudentId] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch(`/api/quizzes/join/${code}`);
      const data = await res.json();

      if (res.ok) {
        // Check if student already submitted
        const checkRes = await fetch(`/api/submissions/check/${data._id}/${studentId}`);
        const checkData = await checkRes.json();

        if (checkData.submitted) {
          toast.error('You have already submitted this quiz.');
          setLoading(false);
          return;
        }

        // Store temporary student info for the session
        localStorage.setItem('temp_student', JSON.stringify({
            name,
            studentId,
            email,
            quizId: data._id
        }));

        toast.success(`Welcome ${name}! Starting quiz...`);
        router.push(`/quiz/${data._id}`);
      } else {
        toast.error(data.message || 'Could not join quiz. Please check your access code.');
        setLoading(false);
      }
    } catch (err) {
      toast.error('Network error. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
      <div className="max-w-xl w-full">
        {/* Logo/Brand */}
        <div className="text-center mb-10">
          <div className="inline-flex p-4 rounded-[2rem] bg-blue-600 text-white shadow-2xl shadow-blue-200 mb-6">
            <GraduationCap className="w-10 h-10" />
          </div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight mb-2">Join Assessment</h1>
          <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px]">
            EazyQuizzy • Secure Student Portal
          </p>
        </div>

        {/* Join Card */}
        <div className="bg-white p-10 rounded-[3rem] shadow-2xl shadow-slate-200/60 border border-slate-100">
          <form onSubmit={handleJoin} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Quiz Access Code</label>
                    <div className="relative group">
                        <Hash className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300 group-focus-within:text-blue-600 transition-colors" />
                        <input
                            type="text"
                            required
                            placeholder="EZ-XXXX"
                            className="w-full pl-12 pr-5 py-4 bg-slate-50 border-transparent focus:bg-white focus:border-blue-600 focus:ring-4 focus:ring-blue-600/5 rounded-2xl outline-none font-black text-slate-900 transition-all uppercase"
                            value={code}
                            onChange={(e) => setCode(e.target.value)}
                        />
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Student ID</label>
                    <div className="relative group">
                        <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300 group-focus-within:text-blue-600 transition-colors" />
                        <input
                            type="text"
                            required
                            placeholder="2024-STD-123"
                            className="w-full pl-12 pr-5 py-4 bg-slate-50 border-transparent focus:bg-white focus:border-blue-600 focus:ring-4 focus:ring-blue-600/5 rounded-2xl outline-none font-bold text-slate-900 transition-all"
                            value={studentId}
                            onChange={(e) => setStudentId(e.target.value)}
                        />
                    </div>
                </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Full Name</label>
              <div className="relative group">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300 group-focus-within:text-blue-600 transition-colors" />
                <input
                  type="text"
                  required
                  placeholder="John Doe"
                  className="w-full pl-12 pr-5 py-4 bg-slate-50 border-transparent focus:bg-white focus:border-blue-600 focus:ring-4 focus:ring-blue-600/5 rounded-2xl outline-none font-bold text-slate-900 transition-all"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Email Address</label>
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300 group-focus-within:text-blue-600 transition-colors" />
                <input
                  type="email"
                  required
                  placeholder="john@example.com"
                  className="w-full pl-12 pr-5 py-4 bg-slate-50 border-transparent focus:bg-white focus:border-blue-600 focus:ring-4 focus:ring-blue-600/5 rounded-2xl outline-none font-bold text-slate-900 transition-all"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            <div className="p-4 bg-blue-50/50 rounded-2xl border border-blue-100/50 flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                <p className="text-xs font-bold text-blue-700 leading-relaxed">
                    By clicking "Start Assessment", you agree to follow the proctoring guidelines. Your activity may be monitored to ensure academic integrity.
                </p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center items-center gap-3 py-5 px-6 bg-blue-600 text-white text-xl font-black rounded-3xl hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-600/20 disabled:opacity-70 disabled:cursor-not-allowed transition-all shadow-2xl shadow-blue-200 active:scale-[0.98]"
            >
              {loading ? (
                <Loader2 className="w-7 h-7 animate-spin" />
              ) : (
                <>
                  Start Assessment
                  <ArrowRight className="w-6 h-6 group-hover:translate-x-1.5 transition-transform" />
                </>
              )}
            </button>
          </form>
        </div>

        {/* Footer info */}
        <p className="text-center mt-10 text-slate-400 font-medium text-sm">
          Technical issue? Please contact your instructor or system admin.
        </p>
      </div>
    </div>
  );
}
