'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Clock, 
  ArrowRight, 
  Play, 
  BookOpen,
  Timer,
  Loader2,
  Zap,
  ChevronLeft
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function JoinQuiz() {
  const [quizzes, setQuizzes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    fetchQuizzes();
  }, []);

  const fetchQuizzes = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/quizzes`);
      const data = await response.json();
      
      // Filter for LIVE quizzes only
      const now = new Date();
      const live = data.filter((q: any) => 
        now >= new Date(q.startTime) && now <= new Date(q.endTime)
      );
      setQuizzes(live);
    } catch {
      toast.error('Failed to load live assessments');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center h-screen bg-slate-50">
      <Loader2 className="w-12 h-12 text-emerald-600 animate-spin mb-4" />
      <p className="text-slate-500 font-bold italic">Finding live assessments...</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50/50 pb-20">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 pt-12 pb-8 mb-8">
        <div className="max-w-7xl mx-auto px-6">
          <button 
            onClick={() => router.push('/')}
            className="flex items-center gap-2 text-slate-400 hover:text-slate-900 font-bold text-sm mb-6 transition-colors group"
          >
            <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            Back to Home
          </button>
          
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shadow-lg shadow-emerald-200">
              <Zap className="w-6 h-6 fill-current" />
            </div>
            <div>
              <h1 className="text-3xl font-black text-slate-900 tracking-tight">Public Assessment Portal</h1>
              <p className="text-slate-500 font-medium italic">Select a live quiz to join as a guest</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6">
        {quizzes.length === 0 ? (
          <div className="text-center py-24 bg-white rounded-[3rem] border border-slate-200 shadow-sm">
            <div className="inline-flex p-6 rounded-full bg-slate-50 text-slate-300 mb-6">
              <Clock className="w-12 h-12" />
            </div>
            <h3 className="text-2xl font-bold text-slate-900">No quizzes live right now</h3>
            <p className="text-slate-500 mt-2 max-w-sm mx-auto italic font-medium">Check back when your assessment is scheduled to begin.</p>
            <button 
              onClick={() => router.push('/')}
              className="mt-8 text-blue-600 font-black hover:underline"
            >
              Return to main site
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {quizzes.map((quiz) => (
              <div 
                key={quiz._id}
                className="group bg-white rounded-[2.5rem] border border-slate-200 shadow-sm hover:shadow-2xl hover:shadow-slate-200/50 transition-all duration-300 flex flex-col overflow-hidden"
              >
                <div className="p-8 flex-grow">
                  <div className="flex justify-between items-start mb-6">
                    <div className="flex items-center gap-2 text-slate-400 font-bold text-[10px] uppercase tracking-widest">
                      <Timer className="w-3 h-3" />
                      {quiz.duration} Minutes
                    </div>
                    <span className="flex h-2 w-2 relative">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                    </span>
                  </div>

                  <h2 className="text-2xl font-black text-slate-900 mb-6 group-hover:text-emerald-600 transition-colors line-clamp-2 leading-tight">
                    {quiz.title}
                  </h2>

                  <div className="space-y-4 pt-4 border-t border-slate-50">
                    <div className="flex items-center gap-3 text-slate-500">
                      <Clock className="w-4 h-4" />
                      <p className="text-sm font-bold">
                        Ends at {new Date(quiz.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="p-6 bg-slate-50/50 border-t border-slate-100 px-8 pb-8">
                  <button 
                    onClick={() => router.push(`/quiz/${quiz._id}`)}
                    className="w-full flex items-center justify-center gap-2 bg-emerald-600 text-white py-4 rounded-2xl font-black text-sm hover:bg-emerald-700 transition-all shadow-xl shadow-emerald-200 active:scale-[0.98]"
                  >
                    <Play className="w-4 h-4 fill-current" />
                    Enter Assessment
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
