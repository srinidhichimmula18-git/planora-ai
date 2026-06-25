"use client";

import React from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { 
  Sparkles, 
  Mic, 
  ArrowRight, 
  ShieldAlert, 
  Calendar, 
  TrendingUp, 
  CheckCircle,
  BrainCircuit,
  Award
} from "lucide-react";

export default function LandingPage() {
  const { user } = useAuth();

  const features = [
    {
      icon: BrainCircuit,
      title: "AI Smart Prioritization",
      desc: "Analyze workload, duration weights, and deadline closeness. Return the optimal daily order of execution automatically.",
      color: "from-blue-500 to-indigo-500"
    },
    {
      icon: Mic,
      title: "Voice Scheduler Assistant",
      desc: "Press the mic and say: 'Remind me to draft client pitch tomorrow at 5 PM.' Gemini processes and schedules it instantly.",
      color: "from-purple-500 to-pink-500"
    },
    {
      icon: ShieldAlert,
      title: "Deadline Risk Predictor",
      desc: "Flag tasks likely to miss deadlines, explain why, and receive action tips to complete them before it is too late.",
      color: "from-orange-500 to-red-500"
    },
    {
      icon: Calendar,
      title: "Smart Daily Timeline",
      desc: "Get an hour-by-hour daily schedule complete with mindful stretch breaks and lunch slots automatically fitted.",
      color: "from-emerald-500 to-teal-500"
    },
    {
      icon: TrendingUp,
      title: "Productivity Insights",
      desc: "Review your performance trends, peak work hours, and category analysis computed on your logs.",
      color: "from-cyan-500 to-blue-500"
    },
    {
      icon: Award,
      title: "Gamified Streaks & Badges",
      desc: "Earn badges and keep your completion streak active! Gain score points by completing tasks on time.",
      color: "from-amber-500 to-yellow-500"
    }
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col relative overflow-hidden selection:bg-primary/30">
      {/* Background grids and blurs */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#0f172a_1px,transparent_1px),linear-gradient(to_bottom,#0f172a_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-70" />
      
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-blue-500/10 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-purple-500/10 blur-[120px] pointer-events-none" />

      {/* Header */}
      <header className="relative z-10 border-b border-slate-900 bg-slate-950/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 font-bold text-2xl tracking-tight">
            <Sparkles className="h-7 w-7 text-primary animate-pulse" />
            <span className="bg-gradient-to-r from-blue-400 via-primary to-purple-400 bg-clip-text text-transparent">
              Planora AI
            </span>
          </Link>

          <nav className="flex items-center gap-4">
            {user ? (
              <Link 
                href="/dashboard"
                className="flex items-center gap-1.5 bg-primary text-primary-foreground font-bold px-5 py-2.5 rounded-xl hover:scale-105 hover:bg-primary/95 transition-all shadow-lg shadow-primary/25 text-sm"
              >
                <span>Go to Dashboard</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            ) : (
              <>
                <Link href="/login" className="text-sm font-medium hover:text-white transition-colors">
                  Sign In
                </Link>
                <Link 
                  href="/login?tab=signup"
                  className="bg-slate-900 hover:bg-slate-800 border border-slate-800 text-sm font-semibold px-4 py-2.5 rounded-xl transition-all"
                >
                  Get Started
                </Link>
              </>
            )}
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <main className="relative z-10 flex-1 flex flex-col justify-center">
        <section className="max-w-4xl mx-auto text-center px-6 py-20 md:py-28 flex flex-col items-center">
          {/* Animated Announcement Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-blue-500/25 bg-blue-500/5 text-xs text-blue-400 font-semibold mb-8 hover:bg-blue-500/10 transition-all select-none cursor-default">
            <Sparkles className="h-3.5 w-3.5 animate-spin-slow" />
            <span>Next-Gen Gemini 1.5 Flash Model Configured</span>
          </div>

          <h1 className="text-4xl md:text-7xl font-extrabold tracking-tight leading-[1.1] mb-6">
            Your Intelligent <br className="hidden md:block" />
            <span className="bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400 bg-clip-text text-transparent">
              Productivity Companion
            </span>
          </h1>

          <p className="text-base md:text-xl text-slate-400 max-w-2xl leading-relaxed mb-10">
            Planora AI doesn't just display lists. It uses Google Gemini AI to analyze workloads, schedule schedules via natural speech, predict deadline risks, and coach your time.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            {user ? (
              <Link 
                href="/dashboard"
                className="flex items-center gap-2 bg-primary text-primary-foreground font-bold px-8 py-4 rounded-2xl hover:scale-105 shadow-xl shadow-primary/30 transition-all"
              >
                <span>Enter Workspace</span>
                <ArrowRight className="h-5 w-5" />
              </Link>
            ) : (
              <>
                <Link 
                  href="/login?tab=signup"
                  className="flex items-center gap-2 bg-primary text-primary-foreground font-bold px-8 py-4 rounded-2xl hover:scale-105 shadow-xl shadow-primary/30 transition-all"
                >
                  <span>Start for Free</span>
                  <ArrowRight className="h-5 w-5" />
                </Link>
                <Link 
                  href="/login"
                  className="border border-slate-800 bg-slate-900/50 hover:bg-slate-900 px-8 py-4 rounded-2xl font-semibold transition-all hover:border-slate-700"
                >
                  View Features
                </Link>
              </>
            )}
          </div>
        </section>

        {/* Feature Grid */}
        <section className="border-t border-slate-900 bg-slate-950/40 py-24">
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center max-w-xl mx-auto mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Core AI Superpowers</h2>
              <p className="text-slate-400">Everything you need to beat procrastination, manage deadlines, and build consistent habits.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {features.map((feature, i) => {
                const Icon = feature.icon;
                return (
                  <div 
                    key={i}
                    className="p-8 rounded-3xl bg-slate-900/40 border border-slate-900/80 hover:border-slate-800 hover:bg-slate-900/70 transition-all duration-300 flex flex-col space-y-4 group hover:scale-[1.02]"
                  >
                    <div className={`h-12 w-12 rounded-2xl bg-gradient-to-br ${feature.color} flex items-center justify-center text-white shadow-lg`}>
                      <Icon className="h-6 w-6" />
                    </div>
                    <h3 className="font-bold text-lg text-white group-hover:text-primary transition-colors">{feature.title}</h3>
                    <p className="text-slate-400 text-sm leading-relaxed">{feature.desc}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 py-10 relative z-10">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 font-bold text-lg text-slate-300">
            <Sparkles className="h-5 w-5 text-primary" />
            <span>Planora AI</span>
          </div>
          <p className="text-xs text-slate-500">&copy; {new Date().getFullYear()} Planora AI. Built for Google Gemini AI Hackathon. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
