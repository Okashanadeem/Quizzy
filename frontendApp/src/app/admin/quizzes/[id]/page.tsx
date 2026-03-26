'use client';
import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';

export default function ManageQuestions({ params }: { params: Promise<{ id: string }> }) {
  const { id: quizId } = use(params);
  const [quiz, setQuiz] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
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
      const response = await fetch(`http://localhost:5000/api/admin/quizzes`, {
        headers: { 'Cache-Control': 'no-cache' },
        credentials: 'include'
      });
      const data = await response.json();
      const currentQuiz = data.find((q: any) => q._id === quizId);
      if (currentQuiz) setQuiz(currentQuiz);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddManual = async (e: React.FormEvent) => {
    e.preventDefault();
    const options = type === 'mcq' ? [option1, option2, option3, option4] : [];
    
    try {
      const response = await fetch(`http://localhost:5000/api/admin/quizzes/${quizId}/questions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type, question: questionText, options, answer, marks }),
        credentials: 'include'
      });
      if (response.ok) {
        fetchQuiz();
        // Reset form
        setQuestionText('');
        setOption1(''); setOption2(''); setOption3(''); setOption4('');
        setAnswer('');
      }
    } catch (err) {
      alert('Error adding question');
    }
  };

  const handleCSVUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.[0]) return;
    const formData = new FormData();
    formData.append('file', e.target.files[0]);

    try {
      const response = await fetch(`http://localhost:5000/api/admin/quizzes/${quizId}/questions/csv`, {
        method: 'POST',
        body: formData,
        credentials: 'include'
      });
      if (response.ok) {
        alert('CSV Uploaded Successfully');
        fetchQuiz();
      }
    } catch (err) {
      alert('Error uploading CSV');
    }
  };

  if (loading) return <div className="p-10">Loading...</div>;
  if (!quiz) return <div className="p-10">Quiz not found</div>;

  return (
    <div className="max-w-7xl mx-auto py-10 px-4 sm:px-6 lg:px-8">
      <button onClick={() => router.back()} className="text-blue-600 mb-4 hover:underline">&larr; Back to Dashboard</button>
      
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold mb-2">{quiz.title}</h1>
          <p className="text-gray-600">Total Questions: {quiz.questions.length}</p>
        </div>
        <button 
          onClick={() => router.push(`/admin/quizzes/${quizId}/submissions`)}
          className="bg-green-600 text-white px-6 py-2 rounded-md hover:bg-green-700 font-bold"
        >
          View Submissions
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Manual Addition */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h2 className="text-xl font-bold mb-4">Add Question Manually</h2>
          <form onSubmit={handleAddManual} className="space-y-4">
            <div>
              <label className="block text-sm font-medium">Type</label>
              <select className="mt-1 block w-full border rounded-md p-2" value={type} onChange={(e) => setType(e.target.value)}>
                <option value="mcq">Multiple Choice (MCQ)</option>
                <option value="short">Short Answer</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium">Question Text</label>
              <textarea required className="mt-1 block w-full border rounded-md p-2" value={questionText} onChange={(e) => setQuestionText(e.target.value)} />
            </div>
            {type === 'mcq' && (
              <div className="grid grid-cols-2 gap-2">
                <input placeholder="Option 1" required className="border rounded-md p-2" value={option1} onChange={(e) => setOption1(e.target.value)} />
                <input placeholder="Option 2" required className="border rounded-md p-2" value={option2} onChange={(e) => setOption2(e.target.value)} />
                <input placeholder="Option 3" required className="border rounded-md p-2" value={option3} onChange={(e) => setOption3(e.target.value)} />
                <input placeholder="Option 4" required className="border rounded-md p-2" value={option4} onChange={(e) => setOption4(e.target.value)} />
              </div>
            )}
            <div>
              <label className="block text-sm font-medium">Correct Answer {type === 'mcq' && '(Must match an option exactly)'}</label>
              <input required className="mt-1 block w-full border rounded-md p-2" value={answer} onChange={(e) => setAnswer(e.target.value)} />
            </div>
            <div>
              <label className="block text-sm font-medium">Marks</label>
              <input type="number" required className="mt-1 block w-full border rounded-md p-2" value={marks} onChange={(e) => setMarks(Number(e.target.value))} />
            </div>
            <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700">Add Question</button>
          </form>
        </div>

        {/* CSV Upload & Preview */}
        <div>
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 mb-8">
            <h2 className="text-xl font-bold mb-4">Bulk Import (CSV)</h2>
            <p className="text-sm text-gray-500 mb-4">Format: question, type, option1, option2, option3, option4, answer, marks</p>
            <input type="file" accept=".csv" onChange={handleCSVUpload} className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" />
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h2 className="text-xl font-bold mb-4">Question List</h2>
            <div className="space-y-4 max-h-[500px] overflow-y-auto">
              {quiz.questions.map((q: any, index: number) => (
                <div key={index} className="border-b pb-4">
                  <p className="font-medium">{index + 1}. {q.question}</p>
                  <p className="text-xs text-blue-600 uppercase font-bold">{q.type} - {q.marks} Marks</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
