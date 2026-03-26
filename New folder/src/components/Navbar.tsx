'use client';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation'; // Import usePathname and useRouter

export default function Navbar() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const pathname = usePathname(); // Get current pathname
  const router = useRouter();

  useEffect(() => {
    const checkAuthStatus = () => {
      const studentData = localStorage.getItem('student');
      setIsLoggedIn(!!studentData); // Set true if studentData exists, false otherwise
    };
    
    checkAuthStatus();

    // Add an event listener to re-check auth status if localStorage changes
    // This is useful if, for example, a sign-out happens in a different tab/window
    window.addEventListener('storage', checkAuthStatus);

    return () => {
      window.removeEventListener('storage', checkAuthStatus);
    };
  }, []); // Runs once on mount and listens for storage events

  const handleSignOut = () => {
    localStorage.removeItem('student'); // Clear authentication token
    setIsLoggedIn(false); // Update local state immediately
    router.push('/login'); // Redirect to login page
  };

  // Determine if the auth button should be visible
  // Hide only on the login page to avoid redundant action.
  const hideAuthButton = pathname === '/login';

  return (
    <nav className="bg-white border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link href="/" className="text-xl font-bold text-blue-600 tracking-tight">
          QuizApp
        </Link>
        
        <div className="flex items-center gap-4">
          {/* Always show Dashboard link if logged in */}
          {isLoggedIn && (
            <Link href="/dashboard" className="text-sm font-medium text-slate-600 hover:text-blue-600">
              Dashboard
            </Link>
          )}
          
          {/* Conditionally show Login or Sign Out button */}
          {!hideAuthButton && (
            isLoggedIn ? (
              <button
                onClick={handleSignOut}
                className="px-4 py-2 rounded-lg bg-red-600 text-white text-sm font-semibold hover:bg-red-700 transition-colors"
              >
                Sign Out
              </button>
            ) : (
              <Link href="/login" className="px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 transition-colors">
                Sign In
              </Link>
            )
          )}
        </div>
      </div>
    </nav>
  );
}
