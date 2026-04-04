'use client';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { GraduationCap, LayoutDashboard, LogOut, LogIn, Sparkles, Menu, X } from 'lucide-react';

export default function Navbar() {
  const [isStudentLoggedIn, setIsStudentLoggedIn] = useState(false);
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      
      // Always show navbar at the very top or if mobile menu is open
      if (currentScrollY < 10 || isMobileMenuOpen) {
        setIsVisible(true);
      } 
      // Scrolling down: hide navbar
      else if (currentScrollY > lastScrollY && currentScrollY > 80) {
        setIsVisible(false);
      } 
      // Scrolling up: show navbar
      else if (currentScrollY < lastScrollY) {
        setIsVisible(true);
      }
      
      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY, isMobileMenuOpen]);

  useEffect(() => {
    const checkAuthStatus = () => {
      const studentData = localStorage.getItem('student');
      const isAdminData = localStorage.getItem('isAdmin');
      
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

  // Close mobile menu when pathname changes
  useEffect(() => {
    setIsMobileMenuOpen(false);
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
  const isQuizPage = pathname.startsWith('/quiz/');

  if (isQuizPage) return null;

  return (
    <nav className={`bg-white/90 backdrop-blur-md border-b border-slate-200 fixed top-0 z-[100] w-full transition-transform duration-500 ease-in-out ${isVisible ? 'translate-y-0' : '-translate-y-full'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between relative z-[110]">
        <Link href="/" className="flex items-center gap-2 group shrink-0">
          <div className="p-2 rounded-xl bg-blue-600 text-white shadow-lg shadow-blue-200 group-hover:scale-110 transition-transform">
            <Sparkles className="w-5 h-5 fill-current" />
          </div>
          <span className="text-xl sm:text-2xl font-black text-slate-900 tracking-tighter">Quizzy</span>
        </Link>
        
        {/* Desktop Menu */}
        <div className="hidden md:flex items-center gap-6">
          {!hideAuthButton && (
            <div className="flex items-center gap-1">
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
          
          {!hideAuthButton && (
            isLoggedIn ? (
              <div className="flex items-center gap-2">
                <Link 
                  href={isAdminLoggedIn ? "/admin/dashboard" : "/dashboard"}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 text-white text-sm font-black hover:bg-blue-700 shadow-lg shadow-blue-200 transition-all active:scale-95"
                >
                  <LayoutDashboard className="w-4 h-4" />
                  My Dashboard
                </Link>
                
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

        {/* Mobile Menu Toggle */}
        <div className="md:hidden flex items-center gap-2">
          {!hideAuthButton && !isLoggedIn && (
             <Link href={pathname.startsWith('/admin') ? "/admin/login" : "/login"} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 text-white text-xs font-black">
              Sign In
            </Link>
          )}
          <button 
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-2 rounded-xl bg-slate-100 text-slate-600 hover:bg-slate-200 transition-all"
          >
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      <div 
        className={`fixed inset-0 bg-white/95 backdrop-blur-3xl z-[105] md:hidden transition-all duration-500 ease-in-out ${
          isMobileMenuOpen 
            ? 'opacity-100 pointer-events-auto translate-y-0' 
            : 'opacity-0 pointer-events-none -translate-y-full'
        }`}
      >
        <div className="flex flex-col gap-4 pt-28 px-6">
          {isStudentLoggedIn && (
            <Link 
              href="/dashboard" 
              className={`flex items-center gap-4 p-5 rounded-[2rem] text-xl font-black transition-all transform ${isMobileMenuOpen ? 'translate-x-0 opacity-100' : '-translate-x-8 opacity-0'} duration-500 delay-100 shadow-sm border ${
                pathname === '/dashboard' ? 'bg-blue-600 text-white border-blue-500 shadow-blue-200' : 'bg-slate-50 text-slate-600 border-slate-100'
              }`}
            >
              <GraduationCap className="w-7 h-7" />
              Student Dashboard
            </Link>
          )}
          {isAdminLoggedIn && (
            <Link 
              href="/admin/dashboard" 
              className={`flex items-center gap-4 p-5 rounded-[2rem] text-xl font-black transition-all transform ${isMobileMenuOpen ? 'translate-x-0 opacity-100' : '-translate-x-8 opacity-0'} duration-500 delay-150 shadow-sm border ${
                pathname.startsWith('/admin') ? 'bg-slate-900 text-white border-slate-800 shadow-slate-200' : 'bg-slate-50 text-slate-600 border-slate-100'
              }`}
            >
              <LayoutDashboard className="w-7 h-7" />
              Admin Console
            </Link>
          )}
          
          {isLoggedIn ? (
            <div className={`flex flex-col gap-4 transition-all transform ${isMobileMenuOpen ? 'translate-x-0 opacity-100' : '-translate-x-8 opacity-0'} duration-500 delay-200`}>
              <Link 
                href={isAdminLoggedIn ? "/admin/dashboard" : "/dashboard"}
                className="flex items-center gap-4 p-5 rounded-[2rem] bg-blue-600 text-white text-xl font-black shadow-2xl shadow-blue-200 border border-blue-500"
              >
                <LayoutDashboard className="w-7 h-7" />
                My Dashboard
              </Link>
              <button
                onClick={handleSignOut}
                className="flex items-center gap-4 p-5 rounded-[2rem] bg-rose-50 text-rose-600 text-xl font-black border border-rose-100 shadow-sm"
              >
                <LogOut className="w-7 h-7" />
                Sign Out
              </button>
            </div>
          ) : (
            <Link 
              href={pathname.startsWith('/admin') ? "/admin/login" : "/login"} 
              className={`flex items-center justify-center gap-4 p-6 rounded-[2.5rem] bg-blue-600 text-white text-2xl font-black shadow-2xl shadow-blue-200 transition-all transform ${isMobileMenuOpen ? 'translate-x-0 opacity-100' : '-translate-x-8 opacity-0'} duration-500 delay-200 border border-blue-500`}
            >
              <LogIn className="w-8 h-8" />
              Sign In
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}

