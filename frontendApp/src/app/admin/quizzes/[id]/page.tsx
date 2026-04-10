'use client';
import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { 
  ArrowLeft, 
  Plus, 
  FileUp, 
  Download, 
  HelpCircle, 
  Type, 
  CheckCircle2, 
  BarChart3,
  Trash2,
  ChevronDown,
  ChevronUp,
  LayoutList,
  Save,
  Loader2
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function ManageQuestions({ params }: { params: Promise<{ id: string }> }) {
  const { id: quizId } = use(params);
  const [quiz, setQuiz] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);
  
  // Manual Question Form
  const [type, setType] = useState('mcq');
  const [questionText, setQuestionText] = useState('');
  const [option1, setOption1] = useState('');
  const [option2, setOption2] = useState('');
  const [option3, setOption3] = useState('');
  const [option4, setOption4] = useState('');
  const [answer, setAnswer] = useState('');
  const [marks, setMarks] = useState(1);

  const router = useRouter();

  useEffect(() => {
    fetchQuiz();
  }, [quizId]);

  const fetchQuiz = async () => {
    try {
      const response = await fetch(`/api/admin/quizzes`, {
        headers: { 'Cache-Control': 'no-cache' },
        credentials: 'include'
      });
      const data = await response.json();
      // data is { quizzes: [...], currentPage: ..., totalPages: ..., totalQuizzes: ... }
      const currentQuiz = data.quizzes.find((q: any) => q._id === quizId);
      if (currentQuiz) setQuiz(currentQuiz);
    } catch (err) {
      toast.error('Failed to load quiz');
    } finally {
      setLoading(false);
    }
  };

  const handleAddManual = async (e: React.FormEvent) => {
    e.preventDefault();
    setAdding(true);
    const options = type === 'mcq' ? [option1, option2, option3, option4] : [];
    
    try {
      const response = await fetch(`/api/admin/quizzes/${quizId}/questions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type, question: questionText, options, answer, marks }),
        credentials: 'include'
      });
      if (response.ok) {
        toast.success('Question added!');
        fetchQuiz();
        // Reset form
        setQuestionText('');
        setOption1(''); setOption2(''); setOption3(''); setOption4('');
        setAnswer('');
      }
    } catch (err) {
      toast.error('Error adding question');
    } finally {
      setAdding(false);
    }
  };

  const handleDeleteQuestion = async (questionId: string) => {
    if (!confirm('Are you sure you want to delete this question?')) return;
    
    try {
      const response = await fetch(`/api/admin/quizzes/${quizId}/questions/${questionId}`, {
        method: 'DELETE',
        credentials: 'include'
      });
      if (response.ok) {
        toast.success('Question deleted');
        fetchQuiz();
      } else {
        toast.error('Failed to delete question');
      }
    } catch (err) {
      toast.error('Network error');
    }
  };

  const handleCSVUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.[0]) return;
    const formData = new FormData();
    formData.append('file', e.target.files[0]);

    const loadingToast = toast.loading('Importing questions...');
    try {
      const response = await fetch(`/api/admin/quizzes/${quizId}/questions/csv`, {
        method: 'POST',
        body: formData,
        credentials: 'include'
      });
      if (response.ok) {
        toast.success('CSV Uploaded Successfully', { id: loadingToast });
        fetchQuiz();
      } else {
        toast.error('Import failed', { id: loadingToast });
      }
    } catch (err) {
      toast.error('Error uploading CSV', { id: loadingToast });
    }
  };

  const downloadTemplate = () => {
    const csvContent = "question,option1,option2,option3,option4,answer,marks\nSample MCQ Question?,Option A,Option B,Option C,Option D,Option A,1";
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "quiz_template.csv");
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Template downloaded');
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center h-screen bg-slate-50">
      <Loader2 className="w-12 h-12 text-blue-600 animate-spin mb-4" />
      <p className="text-slate-500 font-medium italic">Loading questions...</p>
    </div>
  );
  
  if (!quiz) return <div className="p-10 text-center">Quiz not found</div>;

  const totalMarks = quiz.questions.reduce((sum: number, q: any) => sum + q.marks, 0);

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
              <h1 className="text-xl font-extrabold text-slate-900 truncate max-w-[200px] md:max-w-md">{quiz.title}</h1>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                <LayoutList className="w-3 h-3" />
                {quiz.questions.length} Questions • {totalMarks} Total Marks
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button 
              onClick={() => router.push(`/admin/quizzes/${quizId}/submissions`)}
              className="hidden md:flex items-center gap-2 bg-emerald-50 text-emerald-700 px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-emerald-100 transition-all border border-emerald-100"
            >
              <BarChart3 className="w-4 h-4" />
              View Submissions
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          
          {/* Left Column: Form & Tools */}
          <div className="lg:col-span-5 space-y-8">
            
            {/* Manual Addition */}
            <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-200">
              <div className="flex items-center gap-3 mb-8">
                <div className="p-3 rounded-2xl bg-blue-50 text-blue-600">
                  <Plus className="w-6 h-6" />
                </div>
                <h2 className="text-2xl font-black text-slate-900 tracking-tight">Add Question</h2>
              </div>

              <form onSubmit={handleAddManual} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700 ml-1 flex items-center gap-2">
                    <Type className="w-4 h-4" />
                    Question Type
                  </label>
                  <select 
                    className="w-full px-5 py-4 bg-slate-50 border-transparent focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 rounded-2xl transition-all outline-none font-medium appearance-none" 
                    value={type} 
                    onChange={(e) => setType(e.target.value)}
                  >
                    <option value="mcq">Multiple Choice (MCQ)</option>
                    <option value="short">Short Answer</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700 ml-1 flex items-center gap-2">
                    <HelpCircle className="w-4 h-4" />
                    Question Text
                  </label>
                  <textarea 
                    required 
                    placeholder="Enter the question here..."
                    className="w-full px-5 py-4 bg-slate-50 border-transparent focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 rounded-2xl transition-all outline-none font-medium min-h-[120px] resize-none" 
                    value={questionText} 
                    onChange={(e) => setQuestionText(e.target.value)} 
                  />
                </div>

                {type === 'mcq' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-in fade-in slide-in-from-top-2 duration-300">
                    <input placeholder="Option 1" required className="px-5 py-3.5 bg-slate-50 rounded-xl outline-none focus:ring-2 focus:ring-blue-500/20 font-medium border border-transparent" value={option1} onChange={(e) => setOption1(e.target.value)} />
                    <input placeholder="Option 2" required className="px-5 py-3.5 bg-slate-50 rounded-xl outline-none focus:ring-2 focus:ring-blue-500/20 font-medium border border-transparent" value={option2} onChange={(e) => setOption2(e.target.value)} />
                    <input placeholder="Option 3" required className="px-5 py-3.5 bg-slate-50 rounded-xl outline-none focus:ring-2 focus:ring-blue-500/20 font-medium border border-transparent" value={option3} onChange={(e) => setOption3(e.target.value)} />
                    <input placeholder="Option 4" required className="px-5 py-3.5 bg-slate-50 rounded-xl outline-none focus:ring-2 focus:ring-blue-500/20 font-medium border border-transparent" value={option4} onChange={(e) => setOption4(e.target.value)} />
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700 ml-1 flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4" />
                      Answer {type === 'short' && '(Optional)'}
                    </label>
                    <input 
                      required={type === 'mcq'} 
                      placeholder={type === 'mcq' ? "Correct option" : "Reference answer"}
                      className="w-full px-5 py-4 bg-slate-50 border-transparent focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 rounded-2xl transition-all outline-none font-medium border border-transparent" 
                      value={answer} 
                      onChange={(e) => setAnswer(e.target.value)} 
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700 ml-1 flex items-center gap-2">
                      <BarChart3 className="w-4 h-4" />
                      Marks
                    </label>
                    <input 
                      type="number" 
                      required 
                      min="1"
                      className="w-full px-5 py-4 bg-slate-50 border-transparent focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 rounded-2xl transition-all outline-none font-medium border border-transparent" 
                      value={marks} 
                      onChange={(e) => setMarks(Number(e.target.value))} 
                    />
                  </div>
                </div>

                <button 
                  type="submit" 
                  disabled={adding}
                  className="w-full bg-slate-900 text-white py-4 rounded-[1.5rem] font-bold text-lg hover:bg-slate-800 transition-all shadow-xl shadow-slate-200 flex items-center justify-center gap-2 disabled:opacity-70"
                >
                  {adding ? <Loader2 className="w-6 h-6 animate-spin" /> : <><Save className="w-5 h-5" /> Save Question</>}
                </button>
              </form>
            </div>

            {/* Bulk Tools */}
            <div className="bg-slate-900 p-8 rounded-[2.5rem] text-white shadow-2xl shadow-blue-900/20">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold flex items-center gap-2">
                  <FileUp className="w-5 h-5 text-blue-400" />
                  Bulk Import
                </h3>
                <button 
                  onClick={downloadTemplate}
                  className="text-xs bg-white/10 hover:bg-white/20 text-white py-2 px-4 rounded-xl font-bold transition-all flex items-center gap-2"
                >
                  <Download className="w-3.5 h-3.5" />
                  Template
                </button>
              </div>
              <p className="text-sm text-slate-400 mb-6 leading-relaxed">Import multiple MCQs instantly using our CSV format.</p>
              
              <label className="block w-full cursor-pointer group">
                <div className="border-2 border-dashed border-white/20 group-hover:border-blue-500/50 rounded-2xl p-6 text-center transition-all bg-white/5">
                  <FileUp className="w-8 h-8 text-slate-500 group-hover:text-blue-400 mx-auto mb-3 transition-colors" />
                  <p className="text-sm font-bold group-hover:text-white transition-colors">Choose CSV File</p>
                  <input type="file" accept=".csv" onChange={handleCSVUpload} className="hidden" />
                </div>
              </label>
            </div>
          </div>

          {/* Right Column: Question List */}
          <div className="lg:col-span-7">
            <div className="flex justify-between items-end mb-8 px-2">
              <h2 className="text-3xl font-black text-slate-900 tracking-tight italic">Live Preview</h2>
              <span className="text-slate-400 font-bold text-sm">{quiz.questions.length} Items</span>
            </div>

            <div className="space-y-4">
              {quiz.questions.length === 0 ? (
                <div className="text-center py-20 bg-white rounded-[2.5rem] border border-dashed border-slate-200">
                  <p className="text-slate-400 font-medium">No questions added yet.</p>
                </div>
              ) : (
                quiz.questions.map((q: any, index: number) => (
                  <div 
                    key={index} 
                    className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-md transition-all duration-200"
                  >
                    <div 
                      className="p-6 cursor-pointer flex items-center justify-between gap-4"
                      onClick={() => setExpandedIndex(expandedIndex === index ? null : index)}
                    >
                      <div className="flex items-start gap-4">
                        <span className="flex-shrink-0 w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 font-black text-xs">
                          {index + 1}
                        </span>
                        <div>
                          <p className="font-bold text-slate-800 line-clamp-1">{q.question}</p>
                          <div className="flex items-center gap-3 mt-1">
                            <span className={`text-[10px] uppercase font-black px-2 py-0.5 rounded-md ${q.type === 'mcq' ? 'bg-blue-50 text-blue-600' : 'bg-amber-50 text-amber-600'}`}>
                              {q.type}
                            </span>
                            <span className="text-xs font-bold text-slate-400">{q.marks} Marks</span>
                          </div>
                        </div>
                      </div>
                      {expandedIndex === index ? <ChevronUp className="w-5 h-5 text-slate-400 flex-shrink-0" /> : <ChevronDown className="w-5 h-5 text-slate-400 flex-shrink-0" />}
                    </div>

                    {expandedIndex === index && (
                      <div className="px-6 pb-6 pt-2 border-t border-slate-50 animate-in fade-in duration-200">
                        <div className="bg-slate-50 rounded-2xl p-5 space-y-4">
                          {q.type === 'mcq' && (
                            <div className="grid grid-cols-2 gap-3">
                              {q.options.map((opt: string, i: number) => (
                                <div key={i} className={`p-3 rounded-xl border text-sm font-medium ${opt === q.answer ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : 'bg-white border-slate-200 text-slate-600'}`}>
                                  <span className="text-[10px] font-black mr-2 opacity-50">{String.fromCharCode(65 + i)}</span>
                                  {opt}
                                </div>
                              ))}
                            </div>
                          )}
                          <div className="flex justify-between items-center pt-2">
                            <p className="text-sm font-bold text-slate-700">
                              Correct Answer: <span className={q.answer ? "text-emerald-600 ml-1" : "text-amber-600 ml-1 italic"}>{q.answer || (q.type === 'short' ? 'Manual Grading Required' : 'N/A')}</span>
                            </p>
                            <button 
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteQuestion(q.id);
                              }}
                              className="text-rose-500 p-2 hover:bg-rose-50 rounded-xl transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
