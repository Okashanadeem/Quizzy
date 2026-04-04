'use client';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { GraduationCap, LayoutDashboard, LogOut, LogIn, Sparkles, Menu, X } from 'lucide-react';

export default function Navbar() {
  const [isStudentLoggedIn, setIsStudentLoggedIn] = useState(false);
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

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

  return (
    <nav className="bg-white/90 backdrop-blur-md border-b border-slate-200 sticky top-0 z-[100]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-20 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 group z-[110]">
          <div className="p-2 rounded-xl bg-blue-600 text-white shadow-lg shadow-blue-200 group-hover:scale-110 transition-transform">
            <Sparkles className="w-5 h-5 fill-current" />
          </div>
          <span className="text-2xl font-black text-slate-900 tracking-tighter">Quizzy</span>
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
            className="p-2 rounded-xl bg-slate-100 text-slate-600 hover:bg-slate-200 transition-all z-[110]"
          >
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      <div 
        className={`fixed inset-0 bg-white/80 backdrop-blur-2xl z-[90] md:hidden transition-all duration-500 ease-in-out ${
          isMobileMenuOpen 
            ? 'opacity-100 pointer-events-auto translate-y-0' 
            : 'opacity-0 pointer-events-none -translate-y-8'
        }`}
      >
        <div className="flex flex-col gap-4 pt-24 px-6">
          {isStudentLoggedIn && (
            <Link 
              href="/dashboard" 
              className={`flex items-center gap-3 p-4 rounded-2xl text-lg font-bold transition-all transform ${isMobileMenuOpen ? 'translate-x-0 opacity-100' : '-translate-x-4 opacity-0'} duration-300 delay-100 ${
                pathname === '/dashboard' ? 'bg-blue-600 text-white shadow-lg shadow-blue-200' : 'bg-slate-100/50 text-slate-600'
              }`}
            >
              <GraduationCap className="w-6 h-6" />
              Student Dashboard
            </Link>
          )}
          {isAdminLoggedIn && (
            <Link 
              href="/admin/dashboard" 
              className={`flex items-center gap-3 p-4 rounded-2xl text-lg font-bold transition-all transform ${isMobileMenuOpen ? 'translate-x-0 opacity-100' : '-translate-x-4 opacity-0'} duration-300 delay-150 ${
                pathname.startsWith('/admin') ? 'bg-slate-900 text-white shadow-lg shadow-slate-200' : 'bg-slate-100/50 text-slate-600'
              }`}
            >
              <LayoutDashboard className="w-6 h-6" />
              Admin Console
            </Link>
          )}
          
          {isLoggedIn ? (
            <div className={`flex flex-col gap-3 transition-all transform ${isMobileMenuOpen ? 'translate-x-0 opacity-100' : '-translate-x-4 opacity-0'} duration-300 delay-200`}>
              <Link 
                href={isAdminLoggedIn ? "/admin/dashboard" : "/dashboard"}
                className="flex items-center gap-3 p-4 rounded-2xl bg-blue-600 text-white text-lg font-bold shadow-xl shadow-blue-200"
              >
                <LayoutDashboard className="w-6 h-6" />
                My Dashboard
              </Link>
              <button
                onClick={handleSignOut}
                className="flex items-center gap-3 p-4 rounded-2xl bg-rose-50/50 text-rose-600 text-lg font-bold border border-rose-100 backdrop-blur-md"
              >
                <LogOut className="w-6 h-6" />
                Sign Out
              </button>
            </div>
          ) : (
            <Link 
              href={pathname.startsWith('/admin') ? "/admin/login" : "/login"} 
              className={`flex items-center justify-center gap-3 p-5 rounded-2xl bg-blue-600 text-white text-xl font-bold shadow-xl shadow-blue-200 transition-all transform ${isMobileMenuOpen ? 'translate-x-0 opacity-100' : '-translate-x-4 opacity-0'} duration-300 delay-200`}
            >
              <LogIn className="w-6 h-6" />
              Sign In
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}

