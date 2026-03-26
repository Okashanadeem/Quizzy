'use client';
import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';

export default function QuizTaking({ params }: { params: Promise<{ id: string }> }) {
  const { id: quizId } = use(params);
  const [quiz, setQuiz] = useState<any>(null);
  const [student, setStudent] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [tabSwitches, setTabSwitches] = useState(0);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const [recordedChunks, setRecordedChunks] = useState<Blob[]>([]);
  const router = useRouter();

  // Initialization
  useEffect(() => {
    const storedStudent = localStorage.getItem('student');
    if (!storedStudent) {
      router.push('/login');
      return;
    }
    setStudent(JSON.parse(storedStudent));
    fetchQuiz();

    const timer = setInterval(() => setCurrentTime(new Date()), 1000);

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        setTabSwitches(prev => {
          const newCount = prev + 1;
          alert(`⚠️ Tab switch detected. Violation count: ${newCount}`);
          return newCount;
        });
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      clearInterval(timer);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [quizId]);

  useEffect(() => {
    if (quiz?.isRecordingEnabled && !mediaRecorder) startRecording();
  }, [quiz]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({ video: true });
      const recorder = new MediaRecorder(stream);

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) setRecordedChunks(prev => [...prev, e.data]);
      };

      recorder.start();
      setMediaRecorder(recorder);

      stream.getVideoTracks()[0].onended = () => {
        alert('⚠️ Screen sharing stopped. You must keep sharing to continue the quiz.');
      };
    } catch {
      alert('Screen recording permission required. Refresh and allow access.');
      router.push('/dashboard');
    }
  };

  const fetchQuiz = async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/quizzes/${quizId}`);
      if (response.status === 403) {
        setError('Quiz is not accessible at this time.');
        return;
      }
      const data = await response.json();
      setQuiz(data);
    } catch {
      setError('Failed to load quiz.');
    } finally {
      setLoading(false);
    }
  };

  const getTimeRemaining = () => {
    if (!quiz) return '00:00:00';
    const diff = new Date(quiz.endTime).getTime() - currentTime.getTime();
    if (diff <= 0) {
      if (!isSubmitting) handleSubmit();
      return '00:00:00';
    }
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);
    return `${hours.toString().padStart(2, '0')}:${minutes
      .toString()
      .padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  const handleAnswerChange = (questionId: string, value: string) => {
    setAnswers(prev => ({ ...prev, [questionId]: value }));
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (isSubmitting) return;
    if (e && !confirm('Are you sure you want to submit your quiz?')) return;

    setIsSubmitting(true);

    if (mediaRecorder && mediaRecorder.state !== 'inactive') {
      mediaRecorder.stop();
      await new Promise(resolve => setTimeout(resolve, 500));
    }

    try {
      const formData = new FormData();
      formData.append('studentID', student.id);
      formData.append('studentName', student.name);
      formData.append(
        'answers',
        JSON.stringify(
          Object.entries(answers).map(([qId, ans]) => ({ questionId: qId, answer: ans }))
        )
      );
      formData.append('tabSwitches', tabSwitches.toString());

      if (recordedChunks.length > 0) {
        const recordingBlob = new Blob(recordedChunks, { type: 'video/webm' });
        formData.append('recording', recordingBlob, `recording_${student.id}.webm`);
      }

      const response = await fetch(
        `http://localhost:5000/api/quizzes/${quizId}/submit`,
        { method: 'POST', body: formData }
      );

      if (response.ok) {
        alert('✅ Quiz submitted successfully!');
        router.push('/dashboard');
      } else {
        const data = await response.json();
        alert(`Error: ${data.message}`);
      }
    } catch {
      alert('Network error. Submission failed.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading)
    return (
      <div className="flex justify-center items-center h-screen text-gray-500 font-medium">
        Loading quiz content...
      </div>
    );
  if (error)
    return (
      <div className="flex justify-center items-center h-screen text-red-500 font-semibold">
        {error}
      </div>
    );
  if (!quiz)
    return (
      <div className="flex justify-center items-center h-screen text-gray-500 font-medium">
        Quiz not found
      </div>
    );

  return (
    <div className="max-w-5xl mx-auto py-12 px-6">
      {/* Sticky Header */}
      <div className="sticky top-0 bg-white border-b border-gray-200 py-5 mb-10 z-20 flex justify-between items-center px-6 rounded-lg shadow-md">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900">{quiz.title}</h1>
          <p className="text-sm text-gray-500 mt-1">
            {student?.name} | ID: {student?.id}
          </p>
        </div>
        <div className="bg-red-50 px-5 py-2 rounded-lg border border-red-200 text-center">
          <p className="text-xs text-red-600 font-semibold uppercase tracking-wider">
            Time Remaining
          </p>
          <p className="text-3xl font-mono font-bold text-red-700 mt-1">{getTimeRemaining()}</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {quiz.questions.map((q: any, index: number) => (
          <div
            key={q.id}
            className="bg-white p-6 rounded-2xl shadow-md border border-gray-100 hover:shadow-lg transition-shadow duration-300"
          >
            <div className="flex justify-between items-center mb-4">
              <span className="font-semibold text-gray-400">Question {index + 1}</span>
              <span className="text-xs font-bold bg-blue-50 text-blue-700 px-3 py-1 rounded-full">
                {q.marks} Marks
              </span>
            </div>
            <p className="text-lg text-gray-800 font-medium mb-6">{q.question}</p>

            {q.type === 'mcq' ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {q.options.map((option: string, i: number) => (
                  <label
                    key={i}
                    className={`flex items-center p-3 border rounded-lg cursor-pointer transition-colors duration-200 ${
                      answers[q.id] === option
                        ? 'border-blue-500 bg-blue-50'
                        : 'hover:bg-gray-50'
                    }`}
                  >
                    <input
                      type="radio"
                      name={q.id}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                      value={option}
                      checked={answers[q.id] === option}
                      onChange={(e) => handleAnswerChange(q.id, e.target.value)}
                    />
                    <span className="ml-3 text-gray-700">{option}</span>
                  </label>
                ))}
              </div>
            ) : (
              <textarea
                className="w-full border border-gray-300 rounded-lg p-3 h-32 focus:ring-blue-500 focus:border-blue-500 resize-none transition-all"
                placeholder="Type your answer here..."
                value={answers[q.id] || ''}
                onChange={(e) => handleAnswerChange(q.id, e.target.value)}
              />
            )}
          </div>
        ))}

        <div className="pt-8 flex justify-center">
          <button
            type="submit"
            disabled={isSubmitting}
            className={`px-14 py-4 rounded-2xl text-white font-bold text-lg shadow-lg transition-transform duration-150 ${
              isSubmitting
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700 active:scale-95'
            }`}
          >
            {isSubmitting ? 'Submitting...' : 'Submit Quiz'}
          </button>
        </div>
      </form>
    </div>
  );
}