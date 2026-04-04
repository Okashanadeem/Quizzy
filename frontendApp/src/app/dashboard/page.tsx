'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Clock, 
  Calendar, 
  ArrowRight, 
  Play, 
  CheckCircle2, 
  AlertCircle,
  BookOpen,
  History,
  Timer,
  LayoutDashboard,
  Loader2,
  BellRing
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function StudentDashboard() {
  const [quizzes, setQuizzes] = useState<any[]>([]);
  const [student, setStudent] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'live' | 'upcoming' | 'past'>('live');
  const [currentTime, setCurrentTime] = useState(new Date());
  const [notifiedQuizzes, setNotifiedQuizzes] = useState<Set<string>>(new Set());
  const [submissionStatuses, setSubmissionStatuses] = useState<Record<string, boolean>>({});
  
  const router = useRouter();

  // Initialization
  useEffect(() => {
    const storedStudent = localStorage.getItem('student');
    if (!storedStudent) {
      router.push('/login');
      return;
    }
    const studentData = JSON.parse(storedStudent);
    setStudent(studentData);
    fetchQuizzes(studentData.id);

    // Update current time every 10 seconds to keep filters live
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 10000);

    return () => clearInterval(timer);
  }, []);

  const fetchQuizzes = async (studentId: string) => {
    try {
      const response = await fetch(`/api/quizzes`);
      const data = await response.json();
      setQuizzes(data);
      
      // Check submission status for each quiz
      const statuses: Record<string, boolean> = {};
      await Promise.all(data.map(async (quiz: any) => {
        const res = await fetch(`/api/submissions/check/${quiz._id}/${studentId}`);
        const statusData = await res.json();
        statuses[quiz._id] = statusData.submitted;
      }));
      setSubmissionStatuses(statuses);
    } catch {
      toast.error('Failed to load quizzes');
    } finally {
      setLoading(false);
    }
  };

  // Logic to monitor upcoming quizzes and notify when they go live
  useEffect(() => {
    quizzes.forEach(quiz => {
      const startTime = new Date(quiz.startTime);
      const endTime = new Date(quiz.endTime);
      
      if (currentTime >= startTime && currentTime <= endTime && !notifiedQuizzes.has(quiz._id)) {
        setNotifiedQuizzes(prev => new Set(prev).add(quiz._id));
        
        // Don't notify if already submitted
        if (submissionStatuses[quiz._id]) return;

        toast((t) => (
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2 font-black text-slate-900">
              <BellRing className="w-5 h-5 text-emerald-500 animate-bounce" />
              New Quiz is Live!
            </div>
            <p className="text-sm text-slate-500 font-medium">
              "{quiz.title}" is now available in your live section.
            </p>
            <button 
              onClick={() => {
                setActiveTab('live');
                toast.dismiss(t.id);
              }}
              className="mt-2 bg-emerald-600 text-white text-[10px] font-black uppercase tracking-widest py-2 rounded-lg hover:bg-emerald-700 transition-colors"
            >
              View Live Quizzes
            </button>
          </div>
        ), {
          duration: 6000,
          position: 'bottom-right',
          style: {
            borderRadius: '20px',
            background: '#fff',
            color: '#333',
            border: '1px solid #e2e8f0',
            padding: '16px',
            boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)'
          },
        });
      }
    });
  }, [currentTime, quizzes, notifiedQuizzes, submissionStatuses]);

  // Derived filter states
  const liveQuizzes = quizzes.filter(q => currentTime >= new Date(q.startTime) && currentTime <= new Date(q.endTime));
  const upcomingQuizzes = quizzes.filter(q => currentTime < new Date(q.startTime));
  const pastQuizzes = quizzes.filter(q => currentTime > new Date(q.endTime));

  if (loading) return (
    <div className="flex flex-col items-center justify-center h-screen bg-slate-50">
      <Loader2 className="w-12 h-12 text-blue-600 animate-spin mb-4" />
      <p className="text-slate-500 font-medium italic">Loading your dashboard...</p>
    </div>
  );

  const displayQuizzes = 
    activeTab === 'live' ? liveQuizzes : 
    activeTab === 'upcoming' ? upcomingQuizzes : 
    pastQuizzes;

  return (
    <div className="min-h-screen bg-slate-50/50 pb-20">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 pt-12 pb-8 mb-8">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center shadow-lg shadow-blue-200">
              <LayoutDashboard className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-3xl font-black text-slate-900 tracking-tight">Student Dashboard</h1>
              <p className="text-slate-500 font-medium italic">Welcome back, {student?.name}</p>
            </div>
          </div>

          {/* Custom Tabs */}
          <div className="flex gap-2 mt-10 p-1.5 bg-slate-100 rounded-2xl w-full sm:w-fit overflow-x-auto no-scrollbar">
            <TabButton 
              active={activeTab === 'live'} 
              onClick={() => setActiveTab('live')}
              icon={<Play className="w-4 h-4" />}
              label="Live"
              count={liveQuizzes.length}
              color="emerald"
            />
            <TabButton 
              active={activeTab === 'upcoming'} 
              onClick={() => setActiveTab('upcoming')}
              icon={<Calendar className="w-4 h-4" />}
              label="Upcoming"
              count={upcomingQuizzes.length}
              color="blue"
            />
            <TabButton 
              active={activeTab === 'past'} 
              onClick={() => setActiveTab('past')}
              icon={<History className="w-4 h-4" />}
              label="Past"
              count={pastQuizzes.length}
              color="slate"
            />
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6">
        {displayQuizzes.length === 0 ? (
          <div className="text-center py-24 bg-white rounded-[3rem] border border-slate-200 shadow-sm">
            <div className="inline-flex p-6 rounded-full bg-slate-50 text-slate-300 mb-6">
              <BookOpen className="w-12 h-12" />
            </div>
            <h3 className="text-2xl font-bold text-slate-900">No quizzes here</h3>
            <p className="text-slate-500 mt-2 max-w-sm mx-auto italic font-medium">There are no assessments in this category at the moment.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {displayQuizzes.map((quiz) => {
              const isSubmitted = submissionStatuses[quiz._id];
              return (
                <div 
                  key={quiz._id}
                  className={`group bg-white rounded-[2.5rem] border border-slate-200 shadow-sm hover:shadow-2xl hover:shadow-slate-200/50 transition-all duration-300 flex flex-col overflow-hidden ${isSubmitted ? 'opacity-75' : ''}`}
                >
                  <div className="p-6 sm:p-8 flex-grow">
                    <div className="flex justify-between items-start mb-6">
                      <div className="flex items-center gap-2 text-slate-400 font-bold text-[10px] uppercase tracking-widest">
                        <Timer className="w-3 h-3" />
                        {quiz.duration} Minutes
                      </div>
                      {isSubmitted ? (
                        <span className="px-2 py-1 rounded-md bg-emerald-50 text-emerald-600 text-[8px] font-black uppercase border border-emerald-100">Completed</span>
                      ) : activeTab === 'live' && (
                        <span className="flex h-2 w-2 relative">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                        </span>
                      )}
                    </div>

                    <h2 className="text-xl sm:text-2xl font-black text-slate-900 mb-6 group-hover:text-blue-600 transition-colors line-clamp-2 leading-tight">
                      {quiz.title}
                    </h2>

                    <div className="space-y-4 pt-4 border-t border-slate-50">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-slate-50 text-slate-400">
                          <Calendar className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Scheduled Date</p>
                          <p className="text-xs sm:text-sm font-bold text-slate-700">{new Date(quiz.startTime).toLocaleDateString(undefined, { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-slate-50 text-slate-400">
                          <Clock className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Visibility Window</p>
                          <p className="text-xs sm:text-sm font-bold text-slate-700">
                            {new Date(quiz.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - {new Date(quiz.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="p-6 bg-slate-50/50 border-t border-slate-100 px-6 sm:px-8 pb-8">
                    {isSubmitted ? (
                      <div className="w-full flex items-center justify-center gap-2 bg-emerald-50 text-emerald-700 py-4 rounded-2xl font-black text-sm border border-emerald-100 italic">
                        <CheckCircle2 className="w-4 h-4" />
                        Quiz Completed
                      </div>
                    ) : activeTab === 'live' ? (
                      <button 
                        onClick={() => router.push(`/quiz/${quiz._id}`)}
                        className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white py-4 rounded-2xl font-black text-sm hover:bg-blue-700 transition-all shadow-xl shadow-blue-200 active:scale-[0.98]"
                      >
                        <Play className="w-4 h-4 fill-current" />
                        Start Assessment
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    ) : activeTab === 'upcoming' ? (
                      <div className="w-full flex items-center justify-center gap-2 bg-amber-50 text-amber-700 py-4 rounded-2xl font-black text-sm border border-amber-100">
                        <Clock className="w-4 h-4" />
                        Waiting for window...
                      </div>
                    ) : (
                      <div className="w-full flex items-center justify-center gap-2 bg-slate-100 text-slate-500 py-4 rounded-2xl font-black text-sm grayscale">
                        <CheckCircle2 className="w-4 h-4" />
                        Window Closed
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

function TabButton({ active, onClick, icon, label, count, color }: any) {
  const colors = {
    emerald: active ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-100' : 'text-slate-500 hover:bg-slate-200',
    blue: active ? 'bg-blue-600 text-white shadow-lg shadow-blue-100' : 'text-slate-500 hover:bg-slate-200',
    slate: active ? 'bg-slate-900 text-white shadow-lg shadow-slate-200' : 'text-slate-500 hover:bg-slate-200'
  };

  return (
    <button 
      onClick={onClick}
      className={`flex items-center gap-2 px-4 sm:px-6 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all whitespace-nowrap ${colors[color as keyof typeof colors]}`}
    >
      {icon}
      {label}
      <span className={`ml-1 text-[8px] sm:text-[10px] px-1.5 py-0.5 rounded-md ${active ? 'bg-white/20' : 'bg-slate-200 text-slate-600'}`}>
        {count}
      </span>
    </button>
  );
}
