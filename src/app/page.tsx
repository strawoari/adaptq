import Link from "next/link";

export default function HomePage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-80px)] text-center px-4">
      <div className="max-w-2xl">
        <div className="inline-flex items-center gap-2 bg-green-50 text-green-700 px-4 py-1.5 rounded-full text-sm font-medium mb-6">
          <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
          Adaptive Learning and Reflection
        </div>

        <h1 className="text-5xl font-bold text-slate-900 mb-4 leading-tight">
          AdaptQ
        </h1>
        <p className="text-xl text-slate-500 mb-10 leading-relaxed">
          Upload your school work and get personalized review
          recommendations based on skill level — no fluff, just optimal
          challenge.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/upload" className="btn-primary">
            Upload CSV
          </Link>
          <Link href="/dashboard" className="btn-secondary">
            View Dashboard
          </Link>
          <Link href="/question-bank" className="btn-secondary">
            Question Bank
          </Link>
        </div>

        <div className="mt-16 grid grid-cols-1 sm:grid-cols-3 gap-6 text-left">
          {[
            {
              icon: "📊",
              title: "Skill Estimation",
              desc: "Per-topic skill computed from your correct and incorrect attempts.",
            },
            {
              icon: "🎯",
              title: "Optimal Challenge",
              desc: "Questions pitched just above your current level for maximum growth.",
            },
            {
              icon: "📚",
              title: "Question Bank",
              desc: "Browse and filter all stored questions, with record of previous attempts and stats.",
            },
          ].map((feature) => (
            <div key={feature.title} className="card">
              <div className="text-3xl mb-3">{feature.icon}</div>
              <h3 className="font-semibold text-slate-800 mb-1">
                {feature.title}
              </h3>
              <p className="text-sm text-slate-500">{feature.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
