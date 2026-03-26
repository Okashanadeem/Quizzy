'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function StudentDashboard() {
  const [student, setStudent] = useState<any>(null);
  const [quizzes, setQuizzes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState(new Date());
  const router = useRouter();

  useEffect(() => {
    const storedStudent = localStorage.getItem('student');

    if (!storedStudent) {
      router.push('/login');
      return;
    }

    setStudent(JSON.parse(storedStudent));
    fetchQuizzes();

    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const fetchQuizzes = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/quizzes');
      const data = await res.json();
      setQuizzes(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getStatus = (start: string, end: string) => {
    const now = currentTime.getTime();
    const s = new Date(start).getTime();
    const e = new Date(end).getTime();

    if (now < s) return 'Upcoming';
    if (now >= s && now <= e) return 'Live';
    return 'Expired';
  };

  const getTimeRemaining = (target: string) => {
    const diff = new Date(target).getTime() - currentTime.getTime();

    if (diff <= 0) return '00:00:00';

    const h = Math.floor(diff / (1000 * 60 * 60));
    const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const s = Math.floor((diff % (1000 * 60)) / 1000);

    return `${h.toString().padStart(2, '0')}:${m
      .toString()
      .padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const categorized = {
    Live: quizzes.filter(q => getStatus(q.startTime, q.endTime) === 'Live'),
    Upcoming: quizzes.filter(q => getStatus(q.startTime, q.endTime) === 'Upcoming'),
    Expired: quizzes.filter(q => getStatus(q.startTime, q.endTime) === 'Expired'),
  };

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center text-slate-500">
        Loading dashboard...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-7xl mx-auto px-6 py-12">

        {/* HEADER */}
        <div className="flex justify-between items-end mb-14">
          <div>
            <h1 className="text-4xl font-bold tracking-tight text-slate-900">
              Welcome back, <span className="text-blue-600">{student?.name}</span>
            </h1>
            <p className="text-slate-500 mt-2">
              Manage and take your assessments
            </p>
          </div>

          {/* Sign Out button removed from here as it's now in the navbar */}
        </div>

        {/* LIVE */}
        <section className="mb-16">
          <h2 className="text-lg font-semibold mb-6 flex items-center gap-3">
            <span className="w-1.5 h-6 bg-red-500 rounded-full"></span>
            Live Assessments
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {categorized.Live.length > 0 ? (
              categorized.Live.map((quiz) => (
                <div
                  key={quiz._id}
                  className="bg-white rounded-2xl shadow-md border border-slate-200 p-8 flex flex-col justify-between transition-transform hover:-translate-y-1 hover:shadow-lg"
                >
                  {/* STATUS */}
                  <div className="flex justify-between items-center mb-4">
                    <span className="px-3 py-1 text-xs font-semibold bg-red-100 text-red-600 rounded-full">
                      LIVE
                    </span>
                  </div>

                  {/* TITLE */}
                  <h3 className="text-xl font-semibold text-slate-900 mb-4">
                    {quiz.title}
                  </h3>

                  {/* TIMER */}
                  <div className="mb-6">
                    <p className="text-sm text-slate-500 mb-1">Ends in</p>
                    <div className="font-mono text-lg font-bold text-slate-900">
                      {getTimeRemaining(quiz.endTime)}
                    </div>
                  </div>

                  {/* BUTTON */}
                  <button
                    onClick={() => router.push(`/quiz/${quiz._id}`)}
                    className="w-full py-3 rounded-lg bg-slate-900 text-white font-medium hover:bg-slate-700 transition-colors"
                  >
                    Start Quiz
                  </button>
                </div>
              ))
            ) : (
              <div className="col-span-full text-center py-10 bg-white rounded-xl text-slate-500 border border-slate-200">
                No live assessments available
              </div>
            )}
          </div>
        </section>

        {/* UPCOMING */}
        <section>
          <h2 className="text-lg font-semibold mb-6 flex items-center gap-3">
            <span className="w-1.5 h-6 bg-amber-500 rounded-full"></span>
            Upcoming
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {categorized.Upcoming.map((quiz) => (
              <div
                key={quiz._id}
                className="bg-white rounded-2xl p-7 min-h-[180px] flex flex-col justify-between shadow-sm border border-slate-100 hover:shadow-lg hover:-translate-y-1 transition"
              >
                <div>
                  <h3 className="text-lg font-semibold text-slate-900 mb-3">
                    {quiz.title}
                  </h3>

                  <p className="text-sm text-slate-500">Starts on</p>
                  <p className="text-sm font-medium text-slate-700">
                    {new Date(quiz.startTime).toLocaleString()}
                  </p>
                </div>

                <div className="mt-6 text-xs font-medium text-amber-600">
                  Upcoming
                </div>
              </div>
            ))}
          </div>
        </section>

      </div>
    </div>
  );
}