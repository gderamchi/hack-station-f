import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth-config";
import Link from "next/link";

export default async function Home() {
  const session = await getServerSession(authOptions);

  // If user is logged in, redirect to dashboard
  if (session) {
    redirect("/dashboard");
  }

  // Landing page for non-authenticated users
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900">
      {/* Hero Section */}
      <main className="flex min-h-screen flex-col items-center justify-center px-8 py-16 text-center">
        {/* Logo/Brand */}
        <div className="mb-12 animate-fade-in">
          <div className="mb-6 inline-block rounded-full bg-blue-500/10 p-4 backdrop-blur-sm">
            <div className="text-6xl">🤖</div>
          </div>
          <h1 className="mb-4 bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-7xl font-bold text-transparent">
            Mirai
          </h1>
          <p className="text-2xl text-blue-200">
            Autonomous AI Call Center
          </p>
          <p className="mt-2 text-lg text-blue-300/80">
            Find leads, make calls, book meetings — all on autopilot
          </p>
        </div>

        {/* Feature Cards */}
        <div className="mb-12 grid max-w-4xl grid-cols-1 gap-6 md:grid-cols-3">
          <div className="group rounded-2xl bg-white/10 p-8 backdrop-blur-md transition-all hover:bg-white/20 hover:scale-105">
            <div className="mb-4 text-5xl">🔍</div>
            <h3 className="mb-3 text-xl font-bold text-white">AI Finds Leads</h3>
            <p className="text-sm text-blue-200">
              No databases needed. AI searches the web and finds qualified prospects automatically.
            </p>
          </div>
          <div className="group rounded-2xl bg-white/10 p-8 backdrop-blur-md transition-all hover:bg-white/20 hover:scale-105">
            <div className="mb-4 text-5xl">💬</div>
            <h3 className="mb-3 text-xl font-bold text-white">Real Conversations</h3>
            <p className="text-sm text-blue-200">
              Natural AI voice that listens, responds, and adapts to each prospect.
            </p>
          </div>
          <div className="group rounded-2xl bg-white/10 p-8 backdrop-blur-md transition-all hover:bg-white/20 hover:scale-105">
            <div className="mb-4 text-5xl">📅</div>
            <h3 className="mb-3 text-xl font-bold text-white">Books Meetings</h3>
            <p className="text-sm text-blue-200">
              Qualifies leads and schedules demos automatically. You just show up.
            </p>
          </div>
        </div>

        {/* Stats */}
        <div className="mb-12 flex gap-12 text-center">
          <div>
            <div className="text-4xl font-bold text-blue-400">$0.30</div>
            <div className="text-sm text-blue-300">per call</div>
          </div>
          <div className="h-12 w-px bg-blue-500/30"></div>
          <div>
            <div className="text-4xl font-bold text-blue-400">99%</div>
            <div className="text-sm text-blue-300">cost savings</div>
          </div>
          <div className="h-12 w-px bg-blue-500/30"></div>
          <div>
            <div className="text-4xl font-bold text-blue-400">24/7</div>
            <div className="text-sm text-blue-300">autonomous</div>
          </div>
        </div>

        {/* CTA Buttons */}
        <div className="flex gap-4">
          <Link
            href="/register"
            className="group relative overflow-hidden rounded-xl bg-gradient-to-r from-blue-500 to-indigo-500 px-10 py-4 text-lg font-bold text-white shadow-2xl transition-all hover:scale-105 hover:shadow-blue-500/50"
          >
            <span className="relative z-10">Start Free Demo</span>
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-indigo-600 opacity-0 transition-opacity group-hover:opacity-100"></div>
          </Link>
          <Link
            href="/login"
            className="rounded-xl border-2 border-blue-400 px-10 py-4 text-lg font-bold text-blue-400 backdrop-blur-sm transition-all hover:bg-blue-400/10"
          >
            Sign In
          </Link>
        </div>

        {/* Social Proof */}
        <div className="mt-16 text-sm text-blue-300/60">
          <p>Built for Station F Hackathon 2025 🇫🇷</p>
        </div>
      </main>
    </div>
  );
}
