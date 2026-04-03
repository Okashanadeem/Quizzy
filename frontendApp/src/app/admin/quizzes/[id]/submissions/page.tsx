'use client';
import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { 
  ArrowLeft, 
  Download, 
  Mail, 
  MailWarning, 
  AlertCircle, 
  Search,
  ChevronRight,
  User,
  Clock,
  Award,
  ExternalLink,
  X,
  CheckCircle2,
  Loader2,
  RefreshCw,
  Eye,
  Save
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function SubmissionsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: quizId } = use(params);
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalSubmissions: 0
  });
  const [loading, setLoading] = useState(true);
  const [quiz, setQuiz] = useState<any>(null);
  const [searchTerm, setSearchText] = useState('');
  const [selectedSub, setSelectedSub] = useState<any>(null);
  const [manualMarks, setManualMarks] = useState<Record<string, number>>({});
  const [grading, setGrading] = useState(false);
  
  const router = useRouter();

  useEffect(() => {
    fetchSubmissions();
    fetchQuizInfo();
  }, [quizId]);

  const fetchSubmissions = async (page = 1) => {
    setLoading(true);
    try {
      const response = await fetch(`/api/admin/quizzes/${quizId}/submissions?page=${page}&limit=10`, {
        credentials: 'include'
      });
      if (response.status === 401 || response.status === 403) {
        router.push('/admin/login');
        return;
      }
      const data = await response.json();
      setSubmissions(data.submissions);
      setPagination({
        currentPage: data.currentPage,
        totalPages: data.totalPages,
        totalSubmissions: data.totalSubmissions
      });
    } catch (err) {
      toast.error('Error fetching submissions');
    } finally {
      setLoading(false);
    }
  };

  const fetchQuizInfo = async () => {
    try {
      const response = await fetch(`/api/admin/quizzes`, {
        credentials: 'include'
      });
      const data = await response.json();
      // data is { quizzes: [...], currentPage: ..., totalPages: ..., totalQuizzes: ... }
      const currentQuiz = data.quizzes.find((q: any) => q._id === quizId);
      if (currentQuiz) setQuiz(currentQuiz);
    } catch (err) {
      console.error('Error fetching quiz info', err);
    }
  };

  const exportToCSV = () => {
    if (submissions.length === 0) return;
    const headers = "Student Name,Student ID,Score,Max Score,Tab Switches,Email Sent,Date\n";
    const rows = submissions.map(s => 
      `${s.studentName},${s.studentID},${s.score},${s.maxScore},${s.tabSwitches},${s.emailSent},"${new Date(s.submittedAt).toLocaleString()}"`
    ).join("\n");
    
    const blob = new Blob([headers + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `submissions_${quizId}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Report exported');
  };

  const handleManualGrade = async (submissionId: string, questionId: string) => {
    const marks = manualMarks[questionId];
    if (marks === undefined || marks < 0) {
      toast.error('Invalid marks');
      return;
    }

    setGrading(true);
    try {
      const response = await fetch(`/api/admin/submissions/${submissionId}/grade`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ questionId, marksAwarded: marks }),
        credentials: 'include'
      });

      if (response.ok) {
        toast.success('Grade updated!');
        fetchSubmissions();
        // Update local selectedSub score too
        const data = await response.json();
        setSelectedSub((prev: any) => ({ ...prev, score: data.newScore }));
      } else {
        toast.error('Failed to update grade');
      }
    } catch {
      toast.error('Network error');
    } finally {
      setGrading(false);
    }
  };

  const filteredSubmissions = submissions.filter(s => 
    s.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.studentID.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return (
    <div className="flex flex-col items-center justify-center h-screen bg-slate-50">
      <Loader2 className="w-12 h-12 text-blue-600 animate-spin mb-4" />
      <p className="text-slate-500 font-medium italic">Gathering submissions...</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50/50 pb-20">
      {/* Sticky Header */}
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => router.push('/admin/dashboard')} 
              className="p-2.5 hover:bg-slate-100 rounded-xl transition-colors text-slate-500"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-xl font-extrabold text-slate-900 truncate max-w-[200px] md:max-w-md">Submissions</h1>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{quiz?.title || 'Assessment'}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button 
              onClick={exportToCSV}
              className="flex items-center gap-2 bg-slate-900 text-white px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-slate-800 transition-all shadow-lg shadow-slate-200"
            >
              <Download className="w-4 h-4" />
              Export CSV
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-10">
        
        {/* Search & Filter Bar */}
        <div className="bg-white p-4 rounded-[1.5rem] border border-slate-200 shadow-sm mb-8 flex items-center gap-4">
          <div className="relative flex-grow group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
            <input 
              type="text" 
              placeholder="Search by name or student ID..."
              className="w-full pl-12 pr-4 py-3 bg-slate-50 border-transparent focus:bg-white focus:ring-4 focus:ring-blue-500/10 rounded-xl outline-none transition-all font-medium"
              value={searchTerm}
              onChange={(e) => setSearchText(e.target.value)}
            />
          </div>
          <button
            onClick={() => fetchSubmissions()}
            className="p-3 text-slate-500 hover:bg-slate-100 rounded-xl transition-all"            title="Refresh List"
          >
            <RefreshCw className="w-5 h-5" />
          </button>
        </div>

        {/* Submissions Table */}
        <div className="bg-white rounded-[2rem] border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200">
              <thead>
                <tr className="bg-slate-50/50">
                  <th className="px-8 py-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Student Information</th>
                  <th className="px-8 py-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Performance</th>
                  <th className="px-8 py-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Compliance</th>
                  <th className="px-8 py-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Email Status</th>
                  <th className="px-8 py-5 text-right text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredSubmissions.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-8 py-20 text-center">
                      <div className="inline-flex p-4 rounded-full bg-slate-50 text-slate-300 mb-4">
                        <Search className="w-8 h-8" />
                      </div>
                      <p className="text-slate-500 font-medium">No matching submissions found.</p>
                    </td>
                  </tr>
                ) : (
                  filteredSubmissions.map((sub) => (
                    <tr key={sub._id} className="hover:bg-slate-50/50 transition-colors group">
                      <td className="px-8 py-6 whitespace-nowrap">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                            {sub.studentName.charAt(0)}
                          </div>
                          <div>
                            <div className="flex items-center gap-2 text-sm font-bold text-slate-900">
                              {sub.studentName}
                              {sub.isUnverified && (
                                <span className="px-1.5 py-0.5 rounded-md bg-amber-100 text-amber-700 text-[8px] uppercase font-black border border-amber-200">Unverified</span>
                              )}
                            </div>
                            <div className="text-xs font-medium text-slate-400">{sub.studentID}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-6 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <span className={`text-sm font-black ${sub.score / sub.maxScore >= 0.5 ? 'text-emerald-600' : 'text-rose-600'}`}>
                            {sub.score} / {sub.maxScore}
                          </span>
                          <div className="w-24 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                            <div 
                              className={`h-full rounded-full ${sub.score / sub.maxScore >= 0.5 ? 'bg-emerald-500' : 'bg-rose-500'}`}
                              style={{ width: `${(sub.score / sub.maxScore) * 100}%` }}
                            ></div>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-6 whitespace-nowrap">
                        {sub.tabSwitches > 0 ? (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-50 text-rose-600 text-[10px] font-black uppercase tracking-wider border border-rose-100">
                            <AlertCircle className="w-3 h-3" />
                            {sub.tabSwitches} Violations
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-600 text-[10px] font-black uppercase tracking-wider border border-emerald-100">
                            <CheckCircle2 className="w-3 h-3" />
                            Clean Attempt
                          </span>
                        )}
                      </td>
                      <td className="px-8 py-6 whitespace-nowrap">
                        {sub.emailSent ? (
                          <span className="flex items-center gap-2 text-emerald-600 font-bold text-xs">
                            <Mail className="w-4 h-4" />
                            Delivered
                          </span>
                        ) : (
                          <span className="flex items-center gap-2 text-slate-400 font-bold text-xs">
                            <MailWarning className="w-4 h-4" />
                            Not Sent
                          </span>
                        )}
                      </td>
                      <td className="px-8 py-6 whitespace-nowrap text-right">
                        <button 
                          onClick={() => setSelectedSub(sub)}
                          className="p-2.5 bg-slate-100 text-slate-600 hover:bg-slate-900 hover:text-white rounded-xl transition-all"
                        >
                          <Eye className="w-5 h-5" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Pagination Controls */}
        {pagination.totalPages > 1 && (
          <div className="mt-8 flex items-center justify-center gap-4">
            <button
              disabled={pagination.currentPage === 1 || loading}
              onClick={() => fetchSubmissions(pagination.currentPage - 1)}
              className="px-6 py-2.5 bg-white border border-slate-200 text-slate-600 rounded-xl font-bold hover:bg-slate-50 disabled:opacity-50 transition-all shadow-sm"
            >
              Previous
            </button>
            <span className="text-sm font-bold text-slate-500">
              Page {pagination.currentPage} of {pagination.totalPages}
            </span>
            <button
              disabled={pagination.currentPage === pagination.totalPages || loading}
              onClick={() => fetchSubmissions(pagination.currentPage + 1)}
              className="px-6 py-2.5 bg-white border border-slate-200 text-slate-600 rounded-xl font-bold hover:bg-slate-50 disabled:opacity-50 transition-all shadow-sm"
            >
              Next
            </button>
          </div>
        )}
      </div>

      {/* Detailed View Modal */}
      {selectedSub && (
        <div className="fixed inset-0 z-[100] flex items-center justify-end">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity" onClick={() => setSelectedSub(null)}></div>
          <div className="relative bg-white h-full w-full max-w-2xl shadow-2xl overflow-y-auto animate-in slide-in-from-right duration-300 flex flex-col">
            {/* Modal Header */}
            <div className="sticky top-0 z-10 bg-white border-b border-slate-100 px-8 py-6 flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-black text-slate-900 tracking-tight">Answer Sheet</h2>
                <p className="text-slate-400 font-bold text-xs uppercase tracking-widest mt-1">Reviewing: {selectedSub.studentName}</p>
              </div>
              <button onClick={() => setSelectedSub(null)} className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-400">
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="flex-grow p-8 space-y-10">
              {/* Quick Summary Cards */}
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                  <p className="text-[10px] font-black text-slate-400 uppercase mb-1">Final Score</p>
                  <p className="text-xl font-black text-slate-900">{selectedSub.score} / {selectedSub.maxScore}</p>
                </div>
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                  <p className="text-[10px] font-black text-slate-400 uppercase mb-1">Percentage</p>
                  <p className="text-xl font-black text-slate-900">{Math.round((selectedSub.score / selectedSub.maxScore) * 100)}%</p>
                </div>
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                  <p className="text-[10px] font-black text-slate-400 uppercase mb-1">Tab Switches</p>
                  <p className={`text-xl font-black ${selectedSub.tabSwitches > 0 ? 'text-rose-600' : 'text-emerald-600'}`}>{selectedSub.tabSwitches}</p>
                </div>
              </div>

              {/* Answers List */}
              <div className="space-y-6">
                <h3 className="text-lg font-black text-slate-900 border-l-4 border-blue-600 pl-4 uppercase tracking-wider">Responses</h3>
                {selectedSub.answers.map((ans: any, idx: number) => {
                  const question = quiz?.questions.find((q: any) => q.id === ans.questionId);
                  const isMCQ = question?.type === 'mcq';
                  
                  return (
                    <div key={idx} className="group p-6 rounded-[1.5rem] bg-white border border-slate-200 hover:border-blue-200 transition-all shadow-sm">
                      <div className="flex justify-between items-start mb-4">
                        <span className="w-8 h-8 rounded-full bg-slate-900 text-white flex items-center justify-center text-xs font-black">
                          {idx + 1}
                        </span>
                        <div className="text-right">
                          <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded ${isMCQ ? 'bg-blue-50 text-blue-600' : 'bg-amber-50 text-amber-600'}`}>
                            {question?.type || 'Unknown'}
                          </span>
                          <p className="text-[10px] font-bold text-slate-400 mt-1">{question?.marks || 0} Marks</p>
                        </div>
                      </div>
                      
                      <div className="space-y-4">
                        <div>
                          <p className="text-xs font-bold text-slate-500 mb-2 italic">Question: {question?.question || 'N/A'}</p>
                          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Student's Answer</p>
                          <p className={`text-slate-800 font-semibold leading-relaxed p-4 rounded-xl border ${isMCQ ? (ans.answer === question?.answer ? 'bg-emerald-50 border-emerald-100' : 'bg-rose-50 border-rose-100') : 'bg-slate-50 border-slate-100'}`}>
                            {ans.answer || <span className="italic opacity-50">No response provided</span>}
                          </p>
                        </div>

                        {!isMCQ && (
                          <div className="pt-4 border-t border-slate-50 flex items-center gap-4">
                            <div className="flex-grow">
                              <label className="text-[10px] font-black text-slate-400 uppercase block mb-1">Award Marks</label>
                              <input 
                                type="number" 
                                max={question?.marks}
                                min="0"
                                placeholder={`Max ${question?.marks}`}
                                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-bold outline-none focus:border-blue-500 transition-colors"
                                onChange={(e) => setManualMarks(prev => ({ ...prev, [ans.questionId]: Number(e.target.value) }))}
                              />
                            </div>
                            <button 
                              disabled={grading || manualMarks[ans.questionId] === undefined}
                              onClick={() => handleManualGrade(selectedSub._id, ans.questionId)}
                              className="mt-5 p-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all disabled:opacity-50 shadow-md shadow-blue-100"
                            >
                              <Save className="w-4 h-4" />
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Sticky Footer */}
            <div className="sticky bottom-0 bg-white border-t border-slate-100 p-8">
              <button 
                onClick={() => setSelectedSub(null)}
                className="w-full py-4 bg-slate-900 text-white font-bold rounded-2xl hover:bg-slate-800 transition-all shadow-xl shadow-slate-200"
              >
                Done Reviewing
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
