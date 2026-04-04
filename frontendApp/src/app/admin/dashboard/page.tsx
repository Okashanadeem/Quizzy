'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Plus, 
  Calendar, 
  Clock, 
  Trash2, 
  Settings2, 
  BookOpen, 
  Users, 
  Activity,
  ArrowRight,
  Loader2,
  X,
  AlertCircle,
  Lock,
  RefreshCw
} from 'lucide-react';
import toast from 'react-hot-toast';

interface Quiz {
  _id: string;
  title: string;
  startTime: string;
  endTime: string;
  duration: number;
  unverifiedPassword?: string;
  questions: any[];
}

interface Stats {
  totalQuizzes: number;
  totalSubmissions: number;
  activeQuizzes: number;
  upcomingQuizzes: number;
}

export default function AdminDashboard() {
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [stats, setStats] = useState<Stats>({
    totalQuizzes: 0,
    totalSubmissions: 0,
    activeQuizzes: 0,
    upcomingQuizzes: 0
  });
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalQuizzes: 0
  });
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingQuiz, setEditingQuiz] = useState<Quiz | null>(null);

  // Quiz Form State
  const [title, setTitle] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [duration, setDuration] = useState<number>(30);
  const [unverifiedPassword, setUnverifiedPassword] = useState('');
  const [allowStudentCopy, setAllowStudentCopy] = useState(false);

  const router = useRouter();

  const fetchAll = async (page = 1) => {
    setLoading(true);
    await Promise.all([fetchQuizzes(page), fetchStats()]);
    setLoading(false);
  };

  useEffect(() => {
    fetchAll();
  }, []);

  const fetchQuizzes = async (page = 1) => {
    try {
      const res = await fetch(`/api/admin/quizzes?page=${page}&limit=9`, {
        headers: { 'Cache-Control': 'no-cache' },
        credentials: 'include',
      });
      if (res.status === 401 || res.status === 403) {
        router.push('/admin/login');
        return;
      }
      const data = await res.json();
      setQuizzes(data.quizzes);
      setPagination({
        currentPage: data.currentPage,
        totalPages: data.totalPages,
        totalQuizzes: data.totalQuizzes
      });
    } catch (err) {
      toast.error('Failed to load quizzes');
    }
  };

  const fetchStats = async () => {
    try {
      const res = await fetch(`/api/admin/stats`, {
        credentials: 'include',
      });
      if (res.ok) {
        const data = await res.json();
        setStats(data);
      }
    } catch (err) {
      console.error('Failed to fetch stats:', err);
    }
  };

  const handleCreateOrUpdateQuiz = async (e: React.FormEvent) => {
    e.preventDefault();
    if (new Date(startTime) >= new Date(endTime)) {
      toast.error('Visibility End must be after Start time');
      return;
    }
    if (duration <= 0) {
      toast.error('Duration must be at least 1 minute');
      return;
    }

    const payload = {
      title,
      startTime: new Date(startTime).toISOString(),
      endTime: new Date(endTime).toISOString(),
      duration: Number(duration),
      unverifiedPassword,
      allowStudentCopy
    };

    try {
      const url = editingQuiz 
        ? `/api/admin/quizzes/${editingQuiz._id}`
        : `/api/admin/quizzes`;
      
      const res = await fetch(url, {
        method: editingQuiz ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingQuiz ? payload : { ...payload, questions: [] }),
        credentials: 'include',
      });

      if (res.ok) {
        toast.success(`Quiz ${editingQuiz ? 'updated' : 'created'} successfully!`);
        closeModal();
        fetchQuizzes();
        fetchStats();
      } else {
        const errData = await res.json();
        toast.error(errData.message || 'Action failed');
      }
    } catch (err) {
      toast.error('A network error occurred');
    }
  };

  const openEditModal = (quiz: Quiz) => {
    setEditingQuiz(quiz);
    setTitle(quiz.title);
    setStartTime(new Date(quiz.startTime).toISOString().slice(0, 16));
    setEndTime(new Date(quiz.endTime).toISOString().slice(0, 16));
    setDuration(quiz.duration);
    setUnverifiedPassword(quiz.unverifiedPassword || '');
    setAllowStudentCopy(quiz.allowStudentCopy || false);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingQuiz(null);
    setTitle('');
    setStartTime('');
    setEndTime('');
    setDuration(30);
    setUnverifiedPassword('');
    setAllowStudentCopy(false);
  };

  const handleDeleteQuiz = async (id: string) => {
    if (!confirm('Are you sure you want to delete this quiz? This action cannot be undone.')) return;
    try {
      const res = await fetch(`/api/admin/quizzes/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      if (res.ok) {
        toast.success('Quiz deleted');
        fetchQuizzes();
        fetchStats();
      } else {
        toast.error('Failed to delete');
      }
    } catch (err) {
      toast.error('Network error');
    }
  };

  const getQuizStatus = (start: string, end: string) => {
    const now = new Date();
    const s = new Date(start);
    const e = new Date(end);
    if (now < s) return { label: 'Upcoming', color: 'bg-amber-100 text-amber-700 border-amber-200' };
    if (now > e) return { label: 'Expired', color: 'bg-slate-100 text-slate-600 border-slate-200' };
    return { label: 'Active', color: 'bg-emerald-100 text-emerald-700 border-emerald-200' };
  };

  return (
    <div className="min-h-screen bg-slate-50/50 pb-20">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 pt-12 pb-8 mb-8">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">Admin Dashboard</h1>
              <p className="text-slate-500 mt-2 text-lg">Manage your assessments and track student progress</p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => fetchAll()}
                disabled={loading}
                className="p-3.5 bg-white border border-slate-200 text-slate-500 rounded-2xl hover:bg-slate-50 transition-all shadow-sm active:scale-95 disabled:opacity-50"
                title="Refresh Data"
              >
                <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
              </button>
              <button
                onClick={() => setShowModal(true)}
                className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-3.5 rounded-2xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-200 active:scale-95"
              >
                <Plus className="w-5 h-5" />
                Create New Quiz
              </button>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-10">
            <StatCard icon={<BookOpen className="text-blue-600" />} label="Total Quizzes" value={stats.totalQuizzes} />
            <StatCard icon={<Activity className="text-emerald-600" />} label="Active Now" value={stats.activeQuizzes} />
            <StatCard icon={<Users className="text-indigo-600" />} label="Submissions" value={stats.totalSubmissions} />
            <StatCard icon={<Calendar className="text-amber-600" />} label="Upcoming" value={stats.upcomingQuizzes} />
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6">
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm animate-pulse">
                <div className="h-6 bg-slate-100 rounded-full w-3/4 mb-4"></div>
                <div className="h-4 bg-slate-100 rounded-full w-1/2 mb-8"></div>
                <div className="space-y-3">
                  <div className="h-10 bg-slate-50 rounded-xl"></div>
                  <div className="h-10 bg-slate-50 rounded-xl"></div>
                </div>
              </div>
            ))}
          </div>
        ) : quizzes.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-[3rem] border-2 border-dashed border-slate-200">
            <div className="inline-flex p-6 rounded-full bg-slate-50 text-slate-400 mb-6">
              <BookOpen className="w-12 h-12" />
            </div>
            <h3 className="text-2xl font-bold text-slate-900">No quizzes found</h3>
            <p className="text-slate-500 mt-2 max-w-sm mx-auto">Get started by creating your first assessment for your students.</p>
            <button
              onClick={() => setShowModal(true)}
              className="mt-8 text-blue-600 font-bold hover:underline"
            >
              Create your first quiz &rarr;
            </button>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {quizzes.map((quiz) => {
              const status = getQuizStatus(quiz.startTime, quiz.endTime);
              return (
                <div
                  key={quiz._id}
                  className="group bg-white border border-slate-200 rounded-[2rem] shadow-sm hover:shadow-xl hover:shadow-slate-200/50 transition-all duration-300 flex flex-col overflow-hidden"
                >
                  <div className="p-8 flex-grow">
                    <div className="flex justify-between items-start mb-6">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold border ${status.color}`}>
                        {status.label}
                      </span>
                      <div className="flex items-center gap-1 text-slate-400 text-sm font-medium">
                        <Clock className="w-4 h-4" />
                        {quiz.duration}m
                      </div>
                    </div>
                    
                    <h2 className="text-xl font-bold text-slate-900 mb-6 line-clamp-2 group-hover:text-blue-600 transition-colors">{quiz.title}</h2>
                    
                    <div className="space-y-4">
                      <div className="flex items-start gap-3">
                        <div className="mt-1 p-1.5 rounded-lg bg-slate-50 text-slate-400">
                          <Calendar className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="text-[10px] uppercase tracking-wider font-bold text-slate-400">Visibility Window</p>
                          <p className="text-sm font-semibold text-slate-700">
                            {new Date(quiz.startTime).toLocaleDateString()}
                          </p>
                          <p className="text-xs text-slate-500">
                            {new Date(quiz.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - {new Date(quiz.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="p-6 bg-slate-50/50 border-t border-slate-100 grid grid-cols-2 gap-3">
                    <button
                      onClick={() => router.push(`/admin/quizzes/${quiz._id}`)}
                      className="flex items-center justify-center gap-2 bg-white border border-slate-200 text-slate-700 py-2.5 rounded-xl text-sm font-bold hover:bg-slate-100 hover:border-slate-300 transition-all"
                    >
                      <Settings2 className="w-4 h-4" />
                      Manage
                    </button>
                    <button
                      onClick={() => router.push(`/admin/quizzes/${quiz._id}/submissions`)}
                      className="flex items-center justify-center gap-2 bg-blue-600 text-white py-2.5 rounded-xl text-sm font-bold hover:bg-blue-700 shadow-md shadow-blue-100 transition-all"
                    >
                      Results
                      <ArrowRight className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => openEditModal(quiz)}
                      className="col-span-1 flex items-center justify-center gap-2 bg-white border border-slate-200 text-slate-600 py-2.5 rounded-xl text-sm font-bold hover:bg-slate-100 transition-all"
                    >
                      Visibility
                    </button>
                    <button
                      onClick={() => handleDeleteQuiz(quiz._id)}
                      className="col-span-1 flex items-center justify-center gap-2 bg-rose-50 text-rose-600 py-2.5 rounded-xl text-sm font-bold hover:bg-rose-100 transition-all"
                    >
                      <Trash2 className="w-4 h-4" />
                      Delete
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Pagination Controls */}
            {pagination.totalPages > 1 && (
              <div className="mt-12 flex flex-wrap items-center justify-center gap-4">
                <button
                  disabled={pagination.currentPage === 1 || loading}
                  onClick={() => fetchQuizzes(pagination.currentPage - 1)}
                  className="px-4 sm:px-6 py-2.5 bg-white border border-slate-200 text-slate-600 rounded-xl font-bold text-xs sm:text-sm hover:bg-slate-50 disabled:opacity-50 transition-all shadow-sm"
                >
                  Previous
                </button>
                <span className="text-xs sm:text-sm font-bold text-slate-500">
                  Page {pagination.currentPage} / {pagination.totalPages}
                </span>
                <button
                  disabled={pagination.currentPage === pagination.totalPages || loading}
                  onClick={() => fetchQuizzes(pagination.currentPage + 1)}
                  className="px-4 sm:px-6 py-2.5 bg-white border border-slate-200 text-slate-600 rounded-xl font-bold text-xs sm:text-sm hover:bg-slate-50 disabled:opacity-50 transition-all shadow-sm"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity" onClick={closeModal}></div>
          <div className="relative bg-white rounded-[2.5rem] shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="px-8 pt-8 pb-4 flex justify-between items-center">
              <h2 className="text-2xl font-black text-slate-900">
                {editingQuiz ? 'Edit Quiz Settings' : 'New Assessment'}
              </h2>
              <button onClick={closeModal} className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-400 hover:text-slate-900">
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleCreateOrUpdateQuiz} className="p-8 space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700 ml-1">Quiz Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Midterm Advanced Mathematics"
                  className="w-full px-5 py-4 bg-slate-50 border-transparent focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 rounded-2xl transition-all outline-none font-medium"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700 ml-1">Start Time</label>
                  <input
                    type="datetime-local"
                    required
                    className="w-full px-5 py-4 bg-slate-50 border-transparent focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 rounded-2xl transition-all outline-none font-medium"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700 ml-1">End Time</label>
                  <input
                    type="datetime-local"
                    required
                    className="w-full px-5 py-4 bg-slate-50 border-transparent focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 rounded-2xl transition-all outline-none font-medium"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700 ml-1">Duration (Minutes)</label>
                <div className="relative">
                  <Clock className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input
                    type="number"
                    required
                    min="1"
                    className="w-full pl-12 pr-5 py-4 bg-slate-50 border-transparent focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 rounded-2xl transition-all outline-none font-medium"
                    value={duration}
                    onChange={(e) => setDuration(Number(e.target.value))}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700 ml-1">Unverified Student Password (Optional)</label>
                <div className="relative">
                  <Lock className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Shared password for guests"
                    className="w-full pl-12 pr-5 py-4 bg-slate-50 border-transparent focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 rounded-2xl transition-all outline-none font-medium"
                    value={unverifiedPassword}
                    onChange={(e) => setUnverifiedPassword(e.target.value)}
                  />
                </div>
              </div>

              <div className="flex items-center gap-3 p-4 bg-blue-50/50 rounded-2xl border border-blue-100/50">
                <input
                  type="checkbox"
                  id="allowStudentCopy"
                  className="w-5 h-5 accent-blue-600 cursor-pointer"
                  checked={allowStudentCopy}
                  onChange={(e) => setAllowStudentCopy(e.target.checked)}
                />
                <label htmlFor="allowStudentCopy" className="text-sm font-bold text-slate-700 cursor-pointer select-none">
                  Allow students to receive a copy of their results via email
                </label>
              </div>

              <div className="pt-4 flex gap-3">
                <button
                  type="button"
                  onClick={closeModal}
                  className="flex-1 px-6 py-4 bg-slate-100 text-slate-700 font-bold rounded-2xl hover:bg-slate-200 transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-[2] px-6 py-4 bg-blue-600 text-white font-bold rounded-2xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-200 active:scale-[0.98]"
                >
                  {editingQuiz ? 'Update Quiz' : 'Create Quiz'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function StatCard({ icon, label, value }: { icon: React.ReactNode, label: string, value: string | number }) {
  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-5">
      <div className="p-3 rounded-xl bg-slate-50">
        {icon}
      </div>
      <div>
        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">{label}</p>
        <p className="text-2xl font-black text-slate-900">{value}</p>
      </div>
    </div>
  );
}
