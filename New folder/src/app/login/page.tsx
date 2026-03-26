'use client';
import { useState, useEffect } from 'react'; // Import useEffect
import { useRouter } from 'next/navigation';
import studentsData from '@/data/students.json';

export default function StudentLogin() {
  const [name, setName] = useState('');
  const [studentId, setStudentId] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  // Add useEffect to check for existing authentication
  useEffect(() => {
    const storedStudent = localStorage.getItem('student');
    if (storedStudent) {
      try {
        const student = JSON.parse(storedStudent);
        if (student && student.id) { // Basic validation
          router.push('/dashboard'); // Redirect if already logged in
        }
      } catch (e) {
        console.error('Error parsing student data from localStorage:', e);
        localStorage.removeItem('student'); // Clear corrupted data
      }
    }
  }, [router]); // Dependency array includes router

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Check if student exists in the JSON file
    const student = studentsData.find(
      (s: any) => s.name.toLowerCase() === name.toLowerCase() && s.id === studentId
    );

    if (student) {
      // Save student info in localStorage (simple session management)
      localStorage.setItem('student', JSON.stringify(student));
      router.push('/dashboard');
    } else {
      setError('Invalid Name or Student ID. Please try again.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-lg shadow-md">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Student Login
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Enter your name and student ID to access your dashboard.
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleLogin}>
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <input
                type="text"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                placeholder="Full Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div>
              <input
                type="text"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                placeholder="Student ID (e.g., BSE-25F-001)"
                value={studentId}
                onChange={(e) => setStudentId(e.target.value)}
              />
            </div>
          </div>

          {error && <p className="text-red-500 text-sm text-center">{error}</p>}

          <div>
            <button
              type="submit"
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Access Dashboard
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
