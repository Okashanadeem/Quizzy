export default function Footer() {
  return (
    <footer className="bg-slate-50 border-t border-slate-200 mt-auto">
      <div className="max-w-7xl mx-auto px-6 py-8 text-center text-slate-500 text-sm">
        &copy; {new Date().getFullYear()} QuizApp. All rights reserved.
      </div>
    </footer>
  );
}
