'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Users, 
  UserPlus, 
  Trash2, 
  BookOpen, 
  Mail, 
  ShieldCheck, 
  Calendar,
  Clock,
  Loader2,
  AlertCircle
} from 'lucide-react';
import toast from 'react-hot-toast';

interface Teacher {
  _id: string;
  name: string;
  email: string;
  createdAt: string;
}

interface QuizMetadata {
  _id: string;
  title: string;
  teacherId: {
    name: string;
    email: string;
  };
  startTime: string;
  endTime: string;
}

export default function SuperAdminDashboard() {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [quizzes, setQuizzes] = useState<QuizMetadata[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'teachers' | 'quizzes'>('teachers');
  
  // New Teacher Form
  const [showAddModal, setShowAddModal] = useState(false);
  const [newTeacher, setNewTeacher] = useState({ name: '', email: '' });
  const [submitting, setSubmitting] = useState(false);

  const router = useRouter();

  useEffect(() => {
    const role = localStorage.getItem('userRole');
    if (role !== 'superadmin') {
      router.push('/admin/login');
      return;
    }
    fetchData();
  }, [router]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [teachersRes, quizzesRes] = await Promise.all([
        fetch('/api/admin/teachers', { credentials: 'include' }),
        fetch('/api/admin/super/quizzes', { credentials: 'include' })
      ]);

      if (teachersRes.ok && quizzesRes.ok) {
        setTeachers(await teachersRes.json());
        setQuizzes(await quizzesRes.json());
      } else {
        toast.error('Failed to fetch global data');
      }
    } catch (err) {
      toast.error('Connection error');
    } finally {
      setLoading(false);
    }
  };

  const handleAddTeacher = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch('/api/admin/teachers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newTeacher),
        credentials: 'include'
      });
      if (res.ok) {
        toast.success('Teacher created and credentials emailed!');
        setNewTeacher({ name: '', email: '' });
        setShowAddModal(false);
        fetchData();
      } else {
        const data = await res.json();
        toast.error(data.message || 'Failed to create teacher');
      }
    } catch (err) {
      toast.error('Error connecting to server');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteTeacher = async (id: string) => {
    if (!confirm('Are you sure you want to delete this teacher? All their access will be revoked.')) return;
    
    try {
      const res = await fetch(`/api/admin/teachers/${id}`, {
        method: 'DELETE',
        credentials: 'include'
      });
      if (res.ok) {
        toast.success('Teacher removed');
        fetchData();
      } else {
        toast.error('Failed to delete teacher');
      }
    } catch (err) {
      toast.error('Error connecting to server');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-10 h-10 animate-spin text-blue-600" />
          <p className="text-slate-500 font-bold animate-pulse uppercase tracking-widest text-xs">
            Loading Super Console...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-20 pt-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 rounded-xl bg-slate-900 text-white shadow-lg">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h1 className="text-3xl font-black text-slate-900 tracking-tight">Super Control Panel</h1>
            </div>
            <p className="text-slate-500 font-medium">Manage teachers and oversee global system activity</p>
          </div>
          
          <button 
            onClick={() => setShowAddModal(true)}
            className="flex items-center justify-center gap-2 px-6 py-3.5 bg-blue-600 text-white font-bold rounded-2xl hover:bg-blue-700 transition-all shadow-xl shadow-blue-200"
          >
            <UserPlus className="w-5 h-5" />
            Provision New Teacher
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 p-1.5 bg-slate-200/50 backdrop-blur-sm rounded-2xl w-fit mb-8 border border-slate-200">
          <button
            onClick={() => setActiveTab('teachers')}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all ${
              activeTab === 'teachers' 
                ? 'bg-white text-slate-900 shadow-sm' 
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            <Users className="w-4 h-4" />
            Instructors
          </button>
          <button
            onClick={() => setActiveTab('quizzes')}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all ${
              activeTab === 'quizzes' 
                ? 'bg-white text-slate-900 shadow-sm' 
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            Global Quizzes
          </button>
        </div>

        {/* Content */}
        <div className="grid grid-cols-1 gap-6">
          {activeTab === 'teachers' ? (
            <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-slate-50/50 border-b border-slate-100">
                      <th className="px-6 py-4 text-xs font-black text-slate-400 uppercase tracking-widest">Instructor</th>
                      <th className="px-6 py-4 text-xs font-black text-slate-400 uppercase tracking-widest">Email</th>
                      <th className="px-6 py-4 text-xs font-black text-slate-400 uppercase tracking-widest">Joined On</th>
                      <th className="px-6 py-4 text-xs font-black text-slate-400 uppercase tracking-widest text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {teachers.length > 0 ? teachers.map((teacher) => (
                      <tr key={teacher._id} className="hover:bg-slate-50/50 transition-colors group">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-black text-sm">
                              {teacher.name.charAt(0).toUpperCase()}
                            </div>
                            <span className="font-bold text-slate-900">{teacher.name}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm font-medium text-slate-500">{teacher.email}</td>
                        <td className="px-6 py-4 text-sm font-medium text-slate-500">
                          {new Date(teacher.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <button 
                            onClick={() => handleDeleteTeacher(teacher._id)}
                            className="p-2.5 rounded-xl text-slate-300 hover:text-rose-600 hover:bg-rose-50 transition-all opacity-0 group-hover:opacity-100"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </td>
                      </tr>
                    )) : (
                      <tr>
                        <td colSpan={4} className="px-6 py-20 text-center">
                          <div className="flex flex-col items-center gap-2">
                            <AlertCircle className="w-8 h-8 text-slate-200" />
                            <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">No instructors found</p>
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {quizzes.length > 0 ? quizzes.map((quiz) => (
                <div key={quiz._id} className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-xl hover:shadow-slate-200/50 transition-all group">
                  <div className="flex justify-between items-start mb-4">
                    <div className="p-2.5 rounded-2xl bg-slate-900 text-white group-hover:scale-110 transition-transform">
                      <BookOpen className="w-5 h-5" />
                    </div>
                    <div className="px-3 py-1 rounded-full bg-blue-50 text-blue-600 text-[10px] font-black uppercase tracking-widest">
                      Live Preview Restricted
                    </div>
                  </div>
                  
                  <h3 className="text-xl font-black text-slate-900 mb-2 truncate">{quiz.title}</h3>
                  
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-6 h-6 rounded-lg bg-slate-100 flex items-center justify-center">
                      <Users className="w-3 h-3 text-slate-500" />
                    </div>
                    <span className="text-sm font-bold text-slate-600">
                      {quiz.teacherId?.name || 'Unknown Instructor'}
                    </span>
                  </div>

                  <div className="space-y-3 pt-4 border-t border-slate-50">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-400 font-bold uppercase tracking-widest flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5" /> Start
                      </span>
                      <span className="text-slate-600 font-black">
                        {new Date(quiz.startTime).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-400 font-bold uppercase tracking-widest flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5" /> End
                      </span>
                      <span className="text-slate-600 font-black">
                        {new Date(quiz.endTime).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                      </span>
                    </div>
                  </div>
                </div>
              )) : (
                <div className="col-span-full py-20 bg-white rounded-[2rem] border border-slate-100 flex flex-col items-center gap-2">
                   <AlertCircle className="w-8 h-8 text-slate-200" />
                   <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">No quizzes exist in the system</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Add Teacher Modal */}
        {showAddModal && (
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[200] flex items-center justify-center p-4">
            <div className="bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300">
              <div className="bg-slate-900 p-8 text-white relative">
                <button 
                  onClick={() => setShowAddModal(false)}
                  className="absolute top-6 right-6 p-2 rounded-xl hover:bg-white/10 transition-colors"
                >
                  <AlertCircle className="w-6 h-6 rotate-45" />
                </button>
                <div className="inline-flex p-3 rounded-2xl bg-blue-500/20 text-blue-400 mb-4">
                  <UserPlus className="w-6 h-6" />
                </div>
                <h2 className="text-2xl font-black tracking-tight">Provision Instructor</h2>
                <p className="text-slate-400 text-sm mt-1">Credentials will be emailed automatically.</p>
              </div>
              
              <form onSubmit={handleAddTeacher} className="p-8 space-y-6">
                <div className="space-y-2">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Full Name</label>
                  <input
                    type="text"
                    required
                    placeholder="Dr. Sarah Johnson"
                    className="w-full px-5 py-4 bg-slate-50 border-transparent focus:bg-white focus:border-blue-600 focus:ring-4 focus:ring-blue-600/5 rounded-2xl outline-none font-bold text-slate-900 transition-all"
                    value={newTeacher.name}
                    onChange={(e) => setNewTeacher({...newTeacher, name: e.target.value})}
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Email Address</label>
                  <div className="relative group">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300 group-focus-within:text-blue-600 transition-colors" />
                    <input
                      type="email"
                      required
                      placeholder="sarah@university.edu"
                      className="w-full pl-12 pr-5 py-4 bg-slate-50 border-transparent focus:bg-white focus:border-blue-600 focus:ring-4 focus:ring-blue-600/5 rounded-2xl outline-none font-bold text-slate-900 transition-all"
                      value={newTeacher.email}
                      onChange={(e) => setNewTeacher({...newTeacher, email: e.target.value})}
                    />
                  </div>
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="flex-1 py-4 text-slate-500 font-bold hover:bg-slate-50 rounded-2xl transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="flex-1 py-4 bg-blue-600 text-white font-black rounded-2xl hover:bg-blue-700 shadow-xl shadow-blue-200 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Create Account'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
