import Link from "next/link";

export default function Home() {
  return (
    <div className="flex-grow flex flex-col items-center justify-center text-center p-6">
      <div className="max-w-2xl">
        <h1 className="text-5xl font-extrabold tracking-tight text-slate-900 mb-6">
          Master Your Knowledge with <span className="text-blue-600">QuizApp</span>
        </h1>
        <p className="text-lg text-slate-600 mb-10 leading-relaxed">
          Create, manage, and take secure, scheduled assessments effortlessly. Built for educators and students who value efficiency and clarity.
        </p>
        <div className="flex gap-4 justify-center">
          <Link
            href="/dashboard"
            className="px-8 py-3 rounded-xl bg-blue-600 text-white font-semibold hover:bg-blue-700 transition-all shadow-md"
          >
            Get Started
          </Link>
          <Link
            href="/about"
            className="px-8 py-3 rounded-xl bg-slate-100 text-slate-900 font-semibold hover:bg-slate-200 transition-all"
          >
            Learn More
          </Link>
        </div>
      </div>
    </div>
  );
}
