'use client';
import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Clock, 
  ChevronLeft, 
  ChevronRight, 
  Send, 
  AlertTriangle, 
  Flag,
  CheckCircle2,
  LayoutGrid,
  Loader2,
  Info,
  User,
  IdCard,
  Lock,
  ArrowRight,
  MenuSquare,
  X
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function QuizTaking({ params }: { params: Promise<{ id: string }> }) {
  const { id: quizId } = use(params);
  const [quiz, setQuiz] = useState<any>(null);
  const [student, setStudent] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [checkingStatus, setCheckingStatus] = useState(true);
  const [hasAlreadySubmitted, setHasAlreadySubmitted] = useState(false);
  const [error, setError] = useState('');
  
  // Unverified Entry State
  const [isUnverifiedEntry, setIsUnverifiedEntry] = useState(false);
  const [unverifiedName, setUnverifiedName] = useState('');
  const [unverifiedId, setUnverifiedId] = useState('');
  const [quizPassword, setQuizPassword] = useState('');
  const [isAccessGranted, setIsAccessGranted] = useState(false);

  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [flagged, setFlagged] = useState<Record<string, boolean>>({});
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [tabSwitches, setTabSwitches] = useState(0);
  const [endOfAttemptTime, setEndOfAttemptTime] = useState<Date | null>(null);
  const [visibilityEnded, setVisibilityEnded] = useState(false);
  
  // Pagination & Mobile UI State
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
  
  const router = useRouter();

  // Initialization & Auto-Save Load
  useEffect(() => {
    const storedStudent = localStorage.getItem('student');
    let activeStudentId = null;

    if (storedStudent) {
      const s = JSON.parse(storedStudent);
      setStudent(s);
      activeStudentId = s.id;
      checkSubmissionStatus(s.id);
    } else {
      setIsUnverifiedEntry(true);
      setCheckingStatus(false);
    }
    
    fetchQuiz();

    // Load saved answers/flags if they exist
    if (activeStudentId) {
      const savedAnswers = localStorage.getItem(`quiz_answers_${quizId}_${activeStudentId}`);
      if (savedAnswers) setAnswers(JSON.parse(savedAnswers));
      
      const savedFlags = localStorage.getItem(`quiz_flags_${quizId}_${activeStudentId}`);
      if (savedFlags) setFlagged(JSON.parse(savedFlags));
    }

    const timer = setInterval(() => setCurrentTime(new Date()), 1000);

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden' && isAccessGranted) {
        setTabSwitches(prev => {
          const newCount = prev + 1;
          toast.error(`⚠️ Tab switch detected! Violation #${newCount}`, {
            duration: 5000,
            icon: '🚫',
          });
          return newCount;
        });
      }
    };

    const preventAction = (e: any) => {
      if (isAccessGranted) {
        e.preventDefault();
        toast.error('Action restricted during assessment', {
          id: 'restriction-toast',
          duration: 2000
        });
      }
    };

    const handleBlur = () => {
      if (isAccessGranted) {
        setTabSwitches(prev => {
          const newCount = prev + 1;
          toast.error(`⚠️ Security Violation: Focus Lost! Violation #${newCount}`, {
            duration: 5000,
            icon: '🚫',
          });
          return newCount;
        });
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    document.addEventListener('blur', handleBlur);
    document.addEventListener('copy', preventAction);
    document.addEventListener('paste', preventAction);
    document.addEventListener('contextmenu', preventAction);

    return () => {
      clearInterval(timer);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      document.removeEventListener('blur', handleBlur);
      document.removeEventListener('copy', preventAction);
      document.removeEventListener('paste', preventAction);
      document.removeEventListener('contextmenu', preventAction);
    };
  }, [quizId]);

  // Set up attempt end time once access is granted
  useEffect(() => {
    if (quiz && !endOfAttemptTime && (student || isAccessGranted)) {
      const activeStudent = student || { id: unverifiedId, name: unverifiedName };
      const storageKey = `quiz_start_${quizId}_${activeStudent.id}`;
      let attemptStart = localStorage.getItem(storageKey);
      
      if (!attemptStart) {
        attemptStart = new Date().toISOString();
        localStorage.setItem(storageKey, attemptStart);
      }

      const startTime = new Date(attemptStart);
      const durationEndTime = new Date(startTime.getTime() + quiz.duration * 60000);
      const visibilityEndTime = new Date(quiz.endTime);

      const finalEndTime = durationEndTime < visibilityEndTime ? durationEndTime : visibilityEndTime;
      setEndOfAttemptTime(finalEndTime);
    }
  }, [quiz, student, isAccessGranted, unverifiedId, unverifiedName]);

  // Auto-submit check
  useEffect(() => {
    if (endOfAttemptTime && currentTime >= endOfAttemptTime && !isSubmitting && isAccessGranted) {
      const visibilityEndTime = new Date(quiz?.endTime);
      if (currentTime >= visibilityEndTime) {
        setVisibilityEnded(true);
      }
      handleSubmit();
    }
  }, [currentTime, endOfAttemptTime, isAccessGranted, isSubmitting, quiz]);

  const fetchQuiz = async () => {
    try {
      const response = await fetch(`/api/quizzes/${quizId}`);
      if (response.status === 403) {
        setError('Quiz is not accessible at this time.');
        return;
      }
      const data = await response.json();
      setQuiz(data);
    } catch {
      setError('Failed to load quiz content.');
    } finally {
      setLoading(false);
    }
  };

  const checkSubmissionStatus = async (studentId: string) => {
    try {
      const response = await fetch(`/api/submissions/check/${quizId}/${studentId}`);
      const data = await response.json();
      if (data.submitted) {
        setHasAlreadySubmitted(true);
      } else {
        setIsAccessGranted(true);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setCheckingStatus(false);
    }
  };

  const handleUnverifiedAccess = async (e: React.FormEvent) => {
    e.preventDefault();
    setCheckingStatus(true);
    try {
      const response = await fetch(`/api/submissions/check/${quizId}/${unverifiedId}`);
      const data = await response.json();
      if (data.submitted) {
        setHasAlreadySubmitted(true);
        setCheckingStatus(false);
        return;
      }
      setIsAccessGranted(true);
      toast.success('Access Granted. Good luck!');
    } catch (err) {
      toast.error('Verification failed.');
    } finally {
      setCheckingStatus(false);
    }
  };

  const getTimeRemaining = () => {
    if (!endOfAttemptTime) return '00:00:00';
    const diff = endOfAttemptTime.getTime() - currentTime.getTime();
    if (diff <= 0) return '00:00:00';
    
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);
    return `${hours.toString().padStart(2, '0')}:${minutes
      .toString()
      .padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  const handleAnswerChange = (questionId: string, value: string) => {
    const newAnswers = { ...answers, [questionId]: value };
    setAnswers(newAnswers);
    
    // Auto-Save
    const activeStudentId = student?.id || unverifiedId;
    if (activeStudentId) {
      localStorage.setItem(`quiz_answers_${quizId}_${activeStudentId}`, JSON.stringify(newAnswers));
    }
  };

  const toggleFlag = (questionId: string) => {
    const newFlags = { ...flagged, [questionId]: !flagged[questionId] };
    setFlagged(newFlags);
    
    // Auto-Save Flags
    const activeStudentId = student?.id || unverifiedId;
    if (activeStudentId) {
      localStorage.setItem(`quiz_flags_${quizId}_${activeStudentId}`, JSON.stringify(newFlags));
    }
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (isSubmitting) return;
    
    if (e && !confirm('Are you sure you want to finish and submit your assessment?')) return;

    if (!e) {
      if (visibilityEnded) {
        toast('Visibility window expired. Submitting now.', { icon: '⏰' });
      } else {
        toast('Time is up! Your responses are being saved.', { icon: '⏰' });
      }
    }

    setIsSubmitting(true);
    const loadingToast = toast.loading('Submitting your responses...');

    try {
      const activeStudent = student || { id: unverifiedId, name: unverifiedName };
      const submissionData = {
        studentID: activeStudent.id,
        studentName: activeStudent.name,
        answers: Object.entries(answers).map(([qId, ans]) => ({ questionId: qId, answer: ans })),
        tabSwitches: tabSwitches,
        isUnverified: isUnverifiedEntry,
        quizPassword: quizPassword
      };

      const response = await fetch(
        `/api/quizzes/${quizId}/submit`,
        { 
          method: 'POST', 
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(submissionData)
        }
      );

      if (response.ok) {
        localStorage.removeItem(`quiz_start_${quizId}_${activeStudent.id}`);
        localStorage.removeItem(`quiz_answers_${quizId}_${activeStudent.id}`);
        localStorage.removeItem(`quiz_flags_${quizId}_${activeStudent.id}`);
        toast.success('Assessment Submitted Successfully!', { id: loadingToast });
        router.push('/dashboard');
      } else {
        const data = await response.json();
        toast.error(`Error: ${data.message}`, { id: loadingToast });
      }
    } catch {
      toast.error('Network error. Your progress might be lost.', { id: loadingToast });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading || checkingStatus) return (
    <div className="flex flex-col items-center justify-center h-screen bg-slate-50 text-slate-500">
      <Loader2 className="w-12 h-12 text-blue-600 animate-spin mb-4" />
      <p className="font-bold italic">Checking status...</p>
    </div>
  );

  if (hasAlreadySubmitted) return (
    <div className="flex flex-col items-center justify-center h-screen bg-slate-50 px-6 text-center">
      <div className="p-6 rounded-full bg-emerald-100 text-emerald-600 mb-8">
        <CheckCircle2 className="w-16 h-16" />
      </div>
      <h2 className="text-3xl font-black text-slate-900 tracking-tight">Assessment Completed</h2>
      <p className="text-slate-500 mt-4 max-w-md mx-auto italic font-medium text-lg">You have already submitted this quiz. Multiple attempts are not permitted.</p>
      <button onClick={() => router.push('/dashboard')} className="mt-10 px-8 py-4 bg-slate-900 text-white rounded-2xl font-bold hover:bg-slate-800 transition-all shadow-xl shadow-slate-200">
        Return to Dashboard
      </button>
    </div>
  );

  if (!isAccessGranted && isUnverifiedEntry) return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-6 py-12">
      <div className="max-w-md w-full">
        <div className="text-center mb-10">
          <div className="inline-flex p-4 rounded-3xl bg-blue-600 text-white mb-6 shadow-lg">
            <User className="w-8 h-8" />
          </div>
          <h1 className="text-3xl font-black text-slate-900">Unverified Entry</h1>
          <p className="text-slate-500 mt-2">Enter your details and the quiz password</p>
        </div>

        <div className="bg-white p-8 rounded-[2.5rem] shadow-xl border border-slate-100">
          <form onSubmit={handleUnverifiedAccess} className="space-y-6">
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Full Name</label>
              <div className="relative group">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300 group-focus-within:text-blue-600 transition-colors" />
                <input required type="text" placeholder="e.g. John Doe" className="w-full pl-12 pr-4 py-4 bg-slate-50 border-transparent focus:bg-white focus:border-blue-500 rounded-2xl outline-none font-bold" value={unverifiedName} onChange={e => setUnverifiedName(e.target.value)} />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Student ID</label>
              <div className="relative group">
                <IdCard className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300 group-focus-within:text-blue-600 transition-colors" />
                <input required type="text" placeholder="e.g. GUEST-001" className="w-full pl-12 pr-4 py-4 bg-slate-50 border-transparent focus:bg-white focus:border-blue-500 rounded-2xl outline-none font-bold" value={unverifiedId} onChange={e => setUnverifiedId(e.target.value)} />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Quiz Password</label>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300 group-focus-within:text-blue-600 transition-colors" />
                <input required type="password" placeholder="Provided by teacher" className="w-full pl-12 pr-4 py-4 bg-slate-50 border-transparent focus:bg-white focus:border-blue-500 rounded-2xl outline-none font-bold" value={quizPassword} onChange={e => setQuizPassword(e.target.value)} />
              </div>
            </div>
            <button type="submit" className="w-full py-5 bg-blue-600 text-white rounded-2xl font-black uppercase tracking-widest hover:bg-blue-700 shadow-lg transition-all flex items-center justify-center gap-2">
              Verify & Start
              <ArrowRight className="w-5 h-5" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
  
  if (error) return (
    <div className="flex flex-col items-center justify-center h-screen bg-slate-50 px-6 text-center">
      <div className="p-4 rounded-full bg-rose-100 text-rose-600 mb-6">
        <AlertTriangle className="w-12 h-12" />
      </div>
      <h2 className="text-2xl font-black text-slate-900">{error}</h2>
      <button onClick={() => router.push('/dashboard')} className="mt-8 text-blue-600 font-bold hover:underline">Return to Dashboard</button>
    </div>
  );

  if (quiz.questions.length === 0) return (
    <div className="flex flex-col items-center justify-center h-screen bg-slate-50 px-6 text-center">
      <div className="p-4 rounded-full bg-amber-100 text-amber-600 mb-6">
        <Info className="w-12 h-12" />
      </div>
      <h2 className="text-2xl font-black text-slate-900">No Questions Found</h2>
      <p className="text-slate-500 mt-2 max-w-sm mx-auto italic font-medium">This assessment doesn't have any questions yet. Please contact your instructor.</p>
      <button onClick={() => router.push('/dashboard')} className="mt-8 text-blue-600 font-bold hover:underline">Return to Dashboard</button>
    </div>
  );

  const currentQuestion = quiz.questions[currentIndex];
  const progress = Math.round((Object.keys(answers).length / quiz.questions.length) * 100);

  return (
    <div className="min-h-[100dvh] bg-slate-50 flex flex-col relative overflow-hidden">
      {/* Header bar */}
      <header className="bg-white/90 backdrop-blur-md border-b border-slate-200 h-16 sm:h-20 sticky top-0 z-50 flex items-center shadow-sm">
        <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 flex justify-between items-center">
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="bg-slate-900 text-white p-2 sm:p-2.5 rounded-xl">
              <Clock className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div>
              <p className="text-[8px] sm:text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Time Left</p>
              <p className="text-lg sm:text-2xl font-black text-slate-900 font-mono leading-none">{getTimeRemaining()}</p>
            </div>
          </div>

          <div className="hidden md:block text-center flex-grow max-w-md mx-8">
            <div className="flex justify-between text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 px-1">
              <span>Overall Progress</span>
              <span>{progress}% Complete</span>
            </div>
            <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
              <div 
                className="h-full bg-blue-600 rounded-full transition-all duration-500 ease-out"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Mobile Nav Toggle */}
            <button 
              onClick={() => setIsMobileNavOpen(true)}
              className="md:hidden flex items-center gap-2 bg-slate-100 text-slate-600 px-3 py-2 rounded-lg font-bold text-xs hover:bg-slate-200 transition-all"
            >
              <MenuSquare className="w-4 h-4" />
              <span className="hidden sm:inline">Navigator</span>
            </button>

            <button 
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="flex items-center gap-2 bg-blue-600 text-white px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl font-black text-xs sm:text-sm hover:bg-blue-700 shadow-lg shadow-blue-200 transition-all active:scale-95 disabled:opacity-50"
            >
              {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              <span className="hidden sm:inline">Finish</span>
              <span className="sm:hidden">Submit</span>
            </button>
          </div>
        </div>
      </header>

      <main className="flex-grow flex flex-col lg:flex-row max-w-7xl mx-auto w-full px-4 sm:px-6 py-6 sm:py-10 gap-6 sm:gap-10 pb-24 md:pb-10">
        
        {/* Left: Question Content */}
        <div className="flex-grow lg:max-w-4xl space-y-6 sm:space-y-8 w-full">
          <div className="bg-white rounded-[2rem] sm:rounded-[2.5rem] border border-slate-200 shadow-sm p-6 sm:p-10 relative overflow-hidden">
            {/* Background Decoration */}
            <div className="absolute top-0 right-0 p-4 sm:p-8 opacity-[0.02] pointer-events-none select-none">
              <span className="text-[8rem] sm:text-[12rem] font-black leading-none">{currentIndex + 1}</span>
            </div>

            <div className="relative z-10">
              <div className="flex justify-between items-center mb-8 sm:mb-10">
                <span className="bg-slate-100 text-slate-500 px-3 sm:px-4 py-1.5 rounded-full text-[10px] sm:text-xs font-black uppercase tracking-widest">
                  Q{currentIndex + 1} / {quiz.questions.length}
                </span>
                <button 
                  onClick={() => toggleFlag(currentQuestion.id)}
                  className={`flex items-center gap-2 px-3 sm:px-4 py-1.5 rounded-full text-[10px] sm:text-xs font-black uppercase tracking-widest transition-all ${flagged[currentQuestion.id] ? 'bg-rose-100 text-rose-600' : 'bg-slate-50 text-slate-400 hover:bg-slate-100'}`}
                >
                  <Flag className={`w-3 h-3 sm:w-3.5 sm:h-3.5 ${flagged[currentQuestion.id] ? 'fill-current' : ''}`} />
                  {flagged[currentQuestion.id] ? 'Flagged' : 'Flag'}
                </button>
              </div>

              <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-slate-900 mb-8 sm:mb-12 leading-snug">
                {currentQuestion.question}
              </h2>

              {currentQuestion.type === 'mcq' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                  {currentQuestion.options.map((option: string, i: number) => (
                    <button
                      key={i}
                      onClick={() => handleAnswerChange(currentQuestion.id, option)}
                      className={`p-4 sm:p-6 rounded-2xl sm:rounded-3xl border-2 text-left transition-all group flex items-start gap-3 sm:gap-4 ${
                        answers[currentQuestion.id] === option
                          ? 'bg-blue-50 border-blue-600 shadow-md shadow-blue-100'
                          : 'bg-white border-slate-100 hover:border-slate-300'
                      }`}
                    >
                      <div className={`w-6 h-6 sm:w-8 sm:h-8 rounded-full border-2 flex items-center justify-center font-black text-[10px] sm:text-xs shrink-0 transition-colors ${
                        answers[currentQuestion.id] === option
                          ? 'bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-300'
                          : 'bg-slate-50 border-slate-200 text-slate-400'
                      }`}>
                        {String.fromCharCode(65 + i)}
                      </div>
                      <span className={`text-base sm:text-lg font-semibold leading-tight ${
                        answers[currentQuestion.id] === option ? 'text-blue-900' : 'text-slate-700 group-hover:text-slate-900'
                      }`}>
                        {option}
                      </span>
                    </button>
                  ))}
                </div>
              ) : (
                <textarea
                  className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl sm:rounded-[2rem] p-6 sm:p-8 text-base sm:text-lg font-medium text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-blue-500 transition-all outline-none min-h-[200px] sm:min-h-[300px] resize-none"
                  placeholder="Type your comprehensive response here..."
                  value={answers[currentQuestion.id] || ''}
                  onChange={(e) => handleAnswerChange(currentQuestion.id, e.target.value)}
                />
              )}
            </div>
          </div>

          {/* Navigation Buttons (Desktop and inline Mobile) */}
          <div className="flex justify-between items-center gap-4 sm:gap-6">
            <button 
              disabled={currentIndex === 0}
              onClick={() => setCurrentIndex(currentIndex - 1)}
              className="flex-1 flex items-center justify-center gap-2 sm:gap-3 bg-white border border-slate-200 p-4 sm:p-5 rounded-xl sm:rounded-2xl font-black text-xs sm:text-sm text-slate-600 hover:bg-slate-50 disabled:opacity-30 transition-all active:scale-95"
            >
              <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" />
              Previous
            </button>
            <button 
              disabled={currentIndex === quiz.questions.length - 1}
              onClick={() => setCurrentIndex(currentIndex + 1)}
              className="flex-1 flex items-center justify-center gap-2 sm:gap-3 bg-white border border-slate-200 p-4 sm:p-5 rounded-xl sm:rounded-2xl font-black text-xs sm:text-sm text-slate-600 hover:bg-slate-50 disabled:opacity-30 transition-all active:scale-95"
            >
              Next
              <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
          </div>
        </div>

        {/* Right: Question Palette Sidebar (Hidden on mobile unless opened via drawer) */}
        <aside className={`fixed inset-x-0 bottom-0 z-[100] md:relative md:z-0 lg:w-80 md:space-y-6 sm:space-y-8 bg-white md:bg-transparent rounded-t-[2.5rem] md:rounded-none shadow-2xl md:shadow-none border-t md:border-t-0 border-slate-200 transition-transform duration-300 ease-in-out transform ${isMobileNavOpen ? 'translate-y-0' : 'translate-y-full md:translate-y-0'} md:block`}>
          
          {/* Mobile Drawer Handle & Close */}
          <div className="md:hidden flex justify-between items-center px-8 py-5 border-b border-slate-100">
            <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight flex items-center gap-2">
              <LayoutGrid className="w-5 h-5 text-blue-600" />
              Navigator
            </h3>
            <button onClick={() => setIsMobileNavOpen(false)} className="p-2 bg-slate-100 rounded-full text-slate-500">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="bg-white md:rounded-[2rem] sm:rounded-[2.5rem] md:border border-slate-200 md:shadow-sm p-6 sm:p-8 max-h-[60vh] md:max-h-none overflow-y-auto no-scrollbar">
            <div className="hidden md:flex items-center gap-3 mb-6 sm:mb-8">
              <div className="p-2 rounded-lg bg-blue-50 text-blue-600">
                <LayoutGrid className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
              <h3 className="text-base sm:text-lg font-black text-slate-900 uppercase tracking-tight">Question Navigator</h3>
            </div>

            <div className="grid grid-cols-5 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-4 gap-2 sm:gap-3">
              {quiz.questions.map((q: any, idx: number) => {
                const isAnswered = !!answers[q.id];
                const isFlagged = flagged[q.id];
                const isCurrent = currentIndex === idx;

                return (
                  <button
                    key={q.id}
                    onClick={() => {
                      setCurrentIndex(idx);
                      if (window.innerWidth < 768) setIsMobileNavOpen(false);
                    }}
                    className={`w-full aspect-square rounded-xl sm:rounded-2xl font-black text-xs sm:text-sm flex items-center justify-center transition-all relative ${
                      isCurrent ? 'ring-2 sm:ring-4 ring-blue-500/20 scale-110 z-10' : ''
                    } ${
                      isAnswered 
                        ? 'bg-blue-600 text-white shadow-lg shadow-blue-200' 
                        : 'bg-slate-100 text-slate-400 hover:bg-slate-200'
                    }`}
                  >
                    {idx + 1}
                    {isFlagged && (
                      <span className="absolute -top-1 -right-1 w-3 h-3 sm:w-4 sm:h-4 bg-rose-500 rounded-full border border-white flex items-center justify-center">
                        <Flag className="w-1.5 h-1.5 sm:w-2 sm:h-2 text-white fill-current" />
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            <div className="mt-8 space-y-3 pt-6 sm:pt-8 border-t border-slate-50">
              <LegendItem color="bg-blue-600" label="Answered" />
              <LegendItem color="bg-slate-100" label="Unanswered" />
              <LegendItem color="bg-rose-500" label="Flagged" />
            </div>
          </div>

          {/* Security Alert Panel (Hidden on mobile drawer to save space, but visible on desktop) */}
          <div className="hidden md:block bg-slate-900 rounded-[2rem] sm:rounded-[2.5rem] p-6 sm:p-8 text-white shadow-2xl shadow-blue-900/20 mt-6">
            <h4 className="font-black text-[10px] sm:text-xs uppercase tracking-[0.2em] text-slate-500 mb-4 flex items-center gap-2">
              <Info className="w-3.5 h-3.5" />
              Security
            </h4>
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Violations</p>
                <p className="text-lg sm:text-xl font-black text-rose-400">{tabSwitches} <span className="text-[10px] sm:text-xs font-medium text-slate-500 ml-1">Detected</span></p>
              </div>
              <p className="text-[10px] text-slate-500 font-medium leading-relaxed italic">
                Leaving this page is logged and reported.
              </p>
            </div>
          </div>
        </aside>
        
        {/* Mobile Backdrop for Drawer */}
        {isMobileNavOpen && (
          <div 
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[90] md:hidden" 
            onClick={() => setIsMobileNavOpen(false)}
          ></div>
        )}
      </main>
    </div>
  );
}

function LegendItem({ color, label }: { color: string, label: string }) {
  return (
    <div className="flex items-center gap-3">
      <div className={`w-3 h-3 rounded-full ${color}`}></div>
      <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">{label}</span>
    </div>
  );
}

