'use client';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { GraduationCap, LayoutDashboard, LogOut, LogIn, Sparkles } from 'lucide-react';

export default function Navbar() {
  const [isStudentLoggedIn, setIsStudentLoggedIn] = useState(false);
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    const checkAuthStatus = () => {
      const studentData = localStorage.getItem('student');
      const isAdminData = localStorage.getItem('isAdmin');
      
      // Mutual Exclusivity: If both exist (shouldn't happen with new login logic), 
      // prefer the one that matches the current route or default to student
      if (studentData && isAdminData) {
        if (pathname.startsWith('/admin')) {
          setIsAdminLoggedIn(true);
          setIsStudentLoggedIn(false);
        } else {
          setIsAdminLoggedIn(false);
          setIsStudentLoggedIn(true);
        }
      } else {
        setIsStudentLoggedIn(!!studentData);
        setIsAdminLoggedIn(!!isAdminData);
      }
    };
    
    checkAuthStatus();
    window.addEventListener('storage', checkAuthStatus);
    return () => window.removeEventListener('storage', checkAuthStatus);
  }, [pathname]);

  const handleSignOut = async () => {
    if (isAdminLoggedIn) {
      try {
        await fetch(`/api/admin/logout`, { 
          method: 'POST',
          credentials: 'include' 
        });
      } catch (err) {
        console.error('Backend logout call failed, clearing local session anyway:', err);
      } finally {
        localStorage.removeItem('isAdmin');
        setIsAdminLoggedIn(false);
        router.push('/');
      }
    } else {
      localStorage.removeItem('student');
      setIsStudentLoggedIn(false);
      router.push('/');
    }
  };

  const isLoggedIn = isStudentLoggedIn || isAdminLoggedIn;
  const hideAuthButton = pathname === '/login' || pathname === '/admin/login';

  return (
    <nav className="bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0 z-[60]">
      <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 group">
          <div className="p-2 rounded-xl bg-blue-600 text-white shadow-lg shadow-blue-200 group-hover:scale-110 transition-transform">
            <Sparkles className="w-5 h-5 fill-current" />
          </div>
          <span className="text-2xl font-black text-slate-900 tracking-tighter">Quizzy</span>
        </Link>
        
        <div className="flex items-center gap-3 sm:gap-6">
          {/* Desktop Dashboard Links - Hidden on login pages */}
          {!hideAuthButton && (
            <div className="hidden md:flex items-center gap-1">
              {isStudentLoggedIn && (
                <Link href="/dashboard" className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all ${pathname === '/dashboard' ? 'bg-blue-50 text-blue-600' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'}`}>
                  <GraduationCap className="w-4 h-4" />
                  Student Dashboard
                </Link>
              )}
              {isAdminLoggedIn && (
                <Link href="/admin/dashboard" className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all ${pathname.startsWith('/admin') ? 'bg-slate-900 text-white' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'}`}>
                  <LayoutDashboard className="w-4 h-4" />
                  Admin Console
                </Link>
              )}
            </div>
          )}
          
          {/* Auth Button Logic */}
          {!hideAuthButton && (
            isLoggedIn ? (
              <div className="flex items-center gap-2">
                {/* Primary Action Button */}
                <Link 
                  href={isAdminLoggedIn ? "/admin/dashboard" : "/dashboard"}
                  className="hidden sm:flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 text-white text-sm font-black hover:bg-blue-700 shadow-lg shadow-blue-200 transition-all active:scale-95"
                >
                  <LayoutDashboard className="w-4 h-4" />
                  My Dashboard
                </Link>
                
                {/* Sign Out Button */}
                <button
                  onClick={handleSignOut}
                  title="Sign Out"
                  className="flex items-center justify-center p-2.5 rounded-xl bg-slate-100 text-slate-500 hover:bg-rose-50 hover:text-rose-600 transition-all border border-transparent hover:border-rose-100"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            ) : (
              <Link href={pathname.startsWith('/admin') ? "/admin/login" : "/login"} className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-blue-600 text-white text-sm font-black hover:bg-blue-700 shadow-lg shadow-blue-200 transition-all active:scale-95">
                <LogIn className="w-4 h-4" />
                Sign In
              </Link>
            )
          )}
        </div>
      </div>
    </nav>
  );
}
