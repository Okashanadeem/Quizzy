'use client';
import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';

export default function SubmissionsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: quizId } = use(params);
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [quizTitle, setQuizTitle] = useState('');
  const router = useRouter();

  useEffect(() => {
    fetchSubmissions();
    fetchQuizInfo();
  }, [quizId]);

  const fetchSubmissions = async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/admin/quizzes/${quizId}/submissions`, {
        credentials: 'include'
      });
      if (response.status === 401 || response.status === 403) {
        router.push('/admin/login');
        return;
      }
      const data = await response.json();
      setSubmissions(data);
    } catch (err) {
      console.error('Error fetching submissions', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchQuizInfo = async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/admin/quizzes`, {
        credentials: 'include'
      });
      const data = await response.json();
      const quiz = data.find((q: any) => q._id === quizId);
      if (quiz) setQuizTitle(quiz.title);
    } catch (err) {
      console.error('Error fetching quiz info', err);
    }
  };

  if (loading) return <div className="p-10">Loading submissions...</div>;

  return (
    <div className="max-w-7xl mx-auto py-10 px-4 sm:px-6 lg:px-8">
      <button onClick={() => router.back()} className="text-blue-600 mb-4 hover:underline">&larr; Back</button>
      
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Submissions</h1>
          <p className="text-gray-500">{quizTitle}</p>
        </div>
        <div className="text-right">
          <p className="text-sm font-medium text-gray-900">Total: {submissions.length}</p>
        </div>
      </div>

      <div className="bg-white shadow-sm border border-gray-200 rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Student</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Score</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Violations</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Recording</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {submissions.map((sub) => (
              <tr key={sub._id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">{sub.studentName}</div>
                  <div className="text-sm text-gray-500">{sub.studentID}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 py-1 text-xs font-bold rounded-full ${sub.score / sub.maxScore >= 0.5 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {sub.score} / {sub.maxScore}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {sub.tabSwitches > 0 ? (
                    <span className="text-red-600 font-bold">{sub.tabSwitches} Switches</span>
                  ) : (
                    <span className="text-green-600">None</span>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-600">
                  {sub.recordingURL ? (
                    <a href={sub.recordingURL} target="_blank" rel="noopener noreferrer" className="hover:underline font-medium">
                      View Recording
                    </a>
                  ) : (
                    <span className="text-gray-400">N/A</span>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {new Date(sub.submittedAt).toLocaleString()}
                </td>
              </tr>
            ))}
            {submissions.length === 0 && (
              <tr>
                <td colSpan={5} className="px-6 py-10 text-center text-gray-500">No submissions found for this quiz yet.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
