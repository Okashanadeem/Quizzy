'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface Quiz {
  _id: string;
  title: string;
  startTime: string;
  endTime: string;
  isRecordingEnabled: boolean;
}

export default function AdminDashboard() {
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);

  // Quiz Form State
  const [title, setTitle] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [isRecordingEnabled, setIsRecordingEnabled] = useState(false);

  const router = useRouter();

  useEffect(() => {
    fetchQuizzes();
  }, []);

  const fetchQuizzes = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('http://localhost:5000/api/admin/quizzes', {
        headers: { 'Cache-Control': 'no-cache' },
        credentials: 'include',
      });
      if (res.status === 401 || res.status === 403) {
        router.push('/admin/login');
        return;
      }
      const data = await res.json();
      setQuizzes(data);
    } catch (err) {
      console.error('Fetch error:', err);
      setError('Failed to fetch quizzes. Is the backend running?');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateQuiz = async (e: React.FormEvent) => {
    e.preventDefault();
    if (new Date(startTime) >= new Date(endTime)) {
      alert('End time must be after start time');
      return;
    }
    try {
      const res = await fetch('http://localhost:5000/api/admin/quizzes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          startTime: new Date(startTime).toISOString(),
          endTime: new Date(endTime).toISOString(),
          isRecordingEnabled,
          questions: [],
        }),
        credentials: 'include',
      });
      if (res.ok) {
        setShowModal(false);
        fetchQuizzes();
        // Reset form
        setTitle('');
        setStartTime('');
        setEndTime('');
        setIsRecordingEnabled(false);
      } else {
        const errData = await res.json();
        alert(errData.message || 'Error creating quiz');
      }
    } catch (err) {
      console.error(err);
      alert('Error creating quiz');
    }
  };

  const handleDeleteQuiz = async (id: string) => {
    if (!confirm('Are you sure you want to delete this quiz?')) return;
    try {
      const res = await fetch(`http://localhost:5000/api/admin/quizzes/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      if (res.ok) fetchQuizzes();
      else alert('Failed to delete quiz');
    } catch (err) {
      console.error(err);
      alert('Error deleting quiz');
    }
  };

  return (
    <div className="max-w-7xl mx-auto py-10 px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
        <button
          onClick={() => setShowModal(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition"
        >
          Create New Quiz
        </button>
      </div>

      {/* Error */}
      {error && (
        <div className="mb-4 text-red-600 bg-red-100 p-3 rounded">{error}</div>
      )}

      {/* Quizzes */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 animate-pulse"
            >
              <div className="h-6 bg-gray-200 rounded w-3/4 mb-4"></div>
              <div className="h-4 bg-gray-200 rounded mb-2"></div>
              <div className="h-4 bg-gray-200 rounded mb-2"></div>
              <div className="h-8 bg-gray-200 rounded w-1/2 mt-4"></div>
            </div>
          ))}
        </div>
      ) : quizzes.length === 0 ? (
        <p className="text-gray-500">No quizzes found. Create one to get started!</p>
      ) : (
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
  {quizzes.map((quiz) => (
    <div
      key={quiz._id}
      className="bg-white border border-gray-200 rounded-xl shadow-md hover:shadow-lg transition-shadow duration-200 p-6 flex flex-col justify-between"
    >
      {/* Quiz Info */}
      <div className="mb-4">
        <h2 className="text-lg font-semibold text-gray-900 mb-2 truncate">{quiz.title}</h2>
        <div className="text-gray-500 text-sm space-y-1">
          <p>
            <span className="font-medium text-gray-700">Start:</span>{' '}
            {new Date(quiz.startTime).toLocaleString()}
          </p>
          <p>
            <span className="font-medium text-gray-700">End:</span>{' '}
            {new Date(quiz.endTime).toLocaleString()}
          </p>
        </div>
      </div>

      {/* Recording Status */}
      <div className="mb-4">
        <span
          className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
            quiz.isRecordingEnabled
              ? 'bg-green-100 text-green-800'
              : 'bg-gray-100 text-gray-700'
          }`}
        >
          {quiz.isRecordingEnabled ? 'Recording Enabled' : 'Recording Disabled'}
        </span>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-between mt-auto pt-4 border-t border-gray-100">
        <button
          onClick={() => router.push(`/admin/quizzes/${quiz._id}`)}
          className="text-blue-600 font-medium text-sm hover:text-blue-800 transition"
        >
          Manage Questions
        </button>
        <button
          onClick={() => handleDeleteQuiz(quiz._id)}
          className="text-red-600 font-medium text-sm hover:text-red-800 transition"
        >
          Delete
        </button>
      </div>
    </div>
  ))}
</div>
      )}

      {/* Create Quiz Modal */}
      {showModal && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
          role="dialog"
          aria-modal="true"
        >
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h2 className="text-2xl font-bold mb-4">Create New Quiz</h2>
            <form onSubmit={handleCreateQuiz} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Quiz Title
                </label>
                <input
                  type="text"
                  required
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Start Time
                </label>
                <input
                  type="datetime-local"
                  required
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  End Time
                </label>
                <input
                  type="datetime-local"
                  required
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                />
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="recording"
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  checked={isRecordingEnabled}
                  onChange={(e) => setIsRecordingEnabled(e.target.checked)}
                />
                <label
                  htmlFor="recording"
                  className="ml-2 block text-sm text-gray-900"
                >
                  Enable Screen Recording
                </label>
              </div>

              <div className="flex justify-end space-x-3 mt-6">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-md"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md"
                >
                  Create Quiz
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}