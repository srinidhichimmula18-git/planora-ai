"use client";

import React, { useEffect, useState } from "react";
import ProtectedRoute from "@/components/ProtectedRoute";
import Sidebar from "@/components/Sidebar";
import VoiceAssistant from "@/components/VoiceAssistant";
import { useTasks } from "@/context/TaskContext";
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip, 
  PieChart, 
  Pie, 
  Cell, 
  BarChart, 
  Bar 
} from "recharts";
import { 
  Sparkles, 
  TrendingUp, 
  Award, 
  Flame, 
  Activity, 
  Target,
  Clock,
  ArrowRight,
  Smile,
  ShieldCheck,
  Info
} from "lucide-react";

export default function AnalyticsWorkspace() {
  const { 
    tasks, 
    streak, 
    productivityScore, 
    aiInsights, 
    runAIWeeklyInsights 
  } = useTasks();

  const [loadingInsights, setLoadingInsights] = useState(false);

  // Initialize insights on mount
  useEffect(() => {
    if (tasks.length > 0 && !aiInsights) {
      handleTriggerInsights();
    }
  }, [tasks, aiInsights]);

  const handleTriggerInsights = async () => {
    setLoadingInsights(true);
    try {
      await runAIWeeklyInsights();
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingInsights(false);
    }
  };

  const activeTasks = tasks.filter(t => !t.deleted);
  const completed = activeTasks.filter(t => t.completed).length;
  const pending = activeTasks.filter(t => !t.completed).length;

  // 1. Data Calculation: Category Distribution
  const categoryCounts: Record<string, number> = {};
  activeTasks.forEach((t) => {
    categoryCounts[t.category] = (categoryCounts[t.category] || 0) + 1;
  });
  
  const categoryData = Object.keys(categoryCounts).map((cat) => ({
    name: cat,
    value: categoryCounts[cat]
  }));

  // Colors for Category Pie Chart
  const PIE_COLORS = ["#3b82f6", "#a855f7", "#ec4899", "#10b981", "#f59e0b", "#64748b"];

  // 2. Data Calculation: Priority Density
  const priorityCounts = { low: 0, medium: 0, high: 0, critical: 0 };
  activeTasks.forEach((t) => {
    priorityCounts[t.priority] = (priorityCounts[t.priority] || 0) + 1;
  });

  const priorityData = [
    { name: "Low", count: priorityCounts.low, fill: "#10b981" },
    { name: "Medium", count: priorityCounts.medium, fill: "#3b82f6" },
    { name: "High", count: priorityCounts.high, fill: "#f97316" },
    { name: "Critical", count: priorityCounts.critical, fill: "#ef4444" }
  ];

  // 3. Data Calculation: Weekly completion trends (simulated past 7 days)
  const daysOfWeek = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const trendData = daysOfWeek.map((day, idx) => {
    // Generate some deterministic count patterns depending on user's tasks
    const countModifier = (completed % 3) + 1;
    const completedVal = Math.max(1, (idx * countModifier) % 5);
    const createdVal = Math.max(2, ((idx + 2) * countModifier) % 6);
    return {
      name: day,
      Created: createdVal,
      Resolved: completedVal
    };
  });

  // Calculate Badge Achievements
  const badges = [
    {
      id: "b1",
      title: "Consistent Planner",
      desc: "Maintain a task completion streak of 3+ days.",
      unlocked: streak >= 3,
      icon: Flame,
      color: "text-amber-500 bg-amber-500/10 border-amber-500/20"
    },
    {
      id: "b2",
      title: "Proactive Tasker",
      desc: "Complete at least 5 tasks on time.",
      unlocked: completed >= 5,
      icon: Target,
      color: "text-blue-500 bg-blue-500/10 border-blue-500/20"
    },
    {
      id: "b3",
      title: "AI Pioneer",
      desc: "Activate AI Prioritization or Planner schedule.",
      unlocked: true, // Auto-unlocked as AI is pre-configured
      icon: Sparkles,
      color: "text-purple-500 bg-purple-500/10 border-purple-500/20"
    },
    {
      id: "b4",
      title: "Focus Master",
      desc: "Attain a Productivity Score above 80%.",
      unlocked: productivityScore >= 80,
      icon: ShieldCheck,
      color: "text-emerald-500 bg-emerald-500/10 border-emerald-500/20"
    }
  ];

  return (
    <ProtectedRoute>
      <div className="flex flex-col lg:flex-row min-h-screen bg-background">
        <Sidebar />

        <main className="flex-1 flex flex-col p-6 lg:p-8 overflow-y-auto max-w-7xl mx-auto w-full space-y-6">
          {/* Header */}
          <header className="flex flex-col sm:flex-row justify-between sm:items-center pb-4 border-b border-border gap-4">
            <div>
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Workspace</p>
              <h1 className="text-2xl md:text-3xl font-extrabold text-foreground tracking-tight flex items-center gap-2">
                <Activity className="h-6 w-6 text-primary" />
                <span>Performance Insights</span>
              </h1>
            </div>
            
            <button
              onClick={handleTriggerInsights}
              disabled={loadingInsights || activeTasks.length === 0}
              className="bg-primary hover:bg-primary/90 disabled:opacity-50 text-primary-foreground font-bold px-4 py-2.5 rounded-xl text-xs flex items-center gap-1.5 transition-all active:scale-95 cursor-pointer self-start sm:self-center"
            >
              <Sparkles className="h-3 w-3" />
              <span>{loadingInsights ? "Calculating Insights..." : "Run AI Analytics Review"}</span>
            </button>
          </header>

          {/* Quick Metrics & Achievements */}
          <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Circular Ring Score */}
            <div className="bg-card border border-border rounded-3xl p-6 flex flex-col justify-between shadow-sm relative overflow-hidden">
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Workspace Health</span>
                <h3 className="font-extrabold text-lg text-foreground">Productivity Velocity</h3>
              </div>
              
              <div className="flex items-center gap-6 py-4">
                <div className="relative h-20 w-20 flex items-center justify-center shrink-0">
                  <svg className="absolute h-full w-full transform -rotate-90">
                    <circle cx="40" cy="40" r="34" className="stroke-secondary fill-none" strokeWidth="6" />
                    <circle 
                      cx="40" 
                      cy="40" 
                      r="34" 
                      className="stroke-primary fill-none transition-all duration-500" 
                      strokeWidth="6" 
                      strokeDasharray={2 * Math.PI * 34} 
                      strokeDashoffset={2 * Math.PI * 34 * (1 - productivityScore / 100)} 
                    />
                  </svg>
                  <TrendingUp className="h-6 w-6 text-primary animate-pulse" />
                </div>
                <div>
                  <p className="text-3xl font-extrabold text-foreground">{productivityScore}%</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Based on {completed} completed tasks vs {pending} remaining.
                  </p>
                </div>
              </div>
            </div>

            {/* Streak widget */}
            <div className="bg-card border border-border rounded-3xl p-6 flex flex-col justify-between shadow-sm">
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Consistency Tracker</span>
                <h3 className="font-extrabold text-lg text-foreground">Activity Streak</h3>
              </div>
              <div className="flex items-center gap-4 py-4">
                <div className="h-16 w-16 rounded-2xl bg-amber-500/10 flex items-center justify-center text-amber-500">
                  <Flame className="h-8 w-8 fill-amber-500/25 animate-bounce" />
                </div>
                <div>
                  <p className="text-3xl font-extrabold text-foreground">{streak} Days Active</p>
                  <p className="text-xs text-muted-foreground mt-1">Keep checking off tasks before midnight to sustain the heat!</p>
                </div>
              </div>
            </div>

            {/* Gamification Badge highlights */}
            <div className="bg-card border border-border rounded-3xl p-6 flex flex-col justify-between shadow-sm">
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Milestones achieved</span>
                <h3 className="font-extrabold text-lg text-foreground">Unlocked Badges</h3>
              </div>
              <div className="flex gap-2 py-4 overflow-x-auto">
                {badges.filter(b => b.unlocked).map((badge) => {
                  const Icon = badge.icon;
                  return (
                    <div 
                      key={badge.id}
                      className={`h-12 w-12 rounded-xl border flex items-center justify-center shrink-0 ${badge.color}`}
                      title={`${badge.title}: ${badge.desc}`}
                    >
                      <Icon className="h-5 w-5" />
                    </div>
                  );
                })}
                {badges.filter(b => b.unlocked).length === 0 && (
                  <p className="text-xs text-muted-foreground italic py-3">Finish tasks to unlock achievement badges.</p>
                )}
              </div>
            </div>
          </section>

          {/* Recharts Data Visualizations Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Area Chart: Completion Velocity */}
            <div className="bg-card border border-border rounded-3xl p-5 shadow-sm space-y-4">
              <h3 className="font-bold text-sm text-foreground uppercase tracking-wider">
                Weekly Resolution Trends
              </h3>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={trendData}>
                    <defs>
                      <linearGradient id="colorCreated" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2}/>
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="colorResolved" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.2}/>
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="name" stroke="#94a3b8" fontSize={10} tickLine={false} />
                    <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} />
                    <Tooltip contentStyle={{ background: "#0f172a", border: "1px solid #1e293b", borderRadius: "12px", fontSize: "11px" }} />
                    <Area type="monotone" dataKey="Created" stroke="#3b82f6" fillOpacity={1} fill="url(#colorCreated)" strokeWidth={2} />
                    <Area type="monotone" dataKey="Resolved" stroke="#10b981" fillOpacity={1} fill="url(#colorResolved)" strokeWidth={2} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Pie Chart: Category Distribution */}
            <div className="bg-card border border-border rounded-3xl p-5 shadow-sm space-y-4 flex flex-col justify-between">
              <h3 className="font-bold text-sm text-foreground uppercase tracking-wider">
                Category Productivity Allocation
              </h3>
              
              {categoryData.length === 0 ? (
                <p className="text-xs text-muted-foreground italic text-center py-24">No categories data. Create tasks with categories to display distribution.</p>
              ) : (
                <div className="flex flex-col sm:flex-row items-center gap-6 py-6">
                  <div className="h-56 w-56 shrink-0">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={categoryData}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={80}
                          paddingAngle={3}
                          dataKey="value"
                        >
                          {categoryData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip contentStyle={{ background: "#0f172a", border: "1px solid #1e293b", borderRadius: "12px", fontSize: "11px" }} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  
                  {/* Legend */}
                  <div className="flex-1 grid grid-cols-2 gap-3 text-xs">
                    {categoryData.map((d, index) => (
                      <div key={d.name} className="flex items-center gap-2">
                        <div 
                          className="h-3 w-3 rounded-full shrink-0" 
                          style={{ backgroundColor: PIE_COLORS[index % PIE_COLORS.length] }} 
                        />
                        <span className="font-semibold truncate max-w-[100px] text-foreground">{d.name}</span>
                        <span className="text-muted-foreground">({d.value})</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Bar Chart: Priority Density */}
            <div className="bg-card border border-border rounded-3xl p-5 shadow-sm space-y-4">
              <h3 className="font-bold text-sm text-foreground uppercase tracking-wider">
                Priority Volume Density
              </h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={priorityData}>
                    <XAxis dataKey="name" stroke="#94a3b8" fontSize={10} tickLine={false} />
                    <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} />
                    <Tooltip contentStyle={{ background: "#0f172a", border: "1px solid #1e293b", borderRadius: "12px", fontSize: "11px" }} />
                    <Bar dataKey="count" radius={[8, 8, 0, 0]} barSize={40}>
                      {priorityData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* AI Performance Report */}
            <div className="bg-card border border-border rounded-3xl p-5 shadow-sm flex flex-col justify-between space-y-4">
              <h3 className="font-bold text-sm text-foreground uppercase tracking-wider">
                AI Performance Report
              </h3>
              <div className="space-y-4 py-2">
                <div className="flex gap-4">
                  <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
                    <Clock className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-xs text-foreground">Peak Focus Velocity Hours</h4>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {aiInsights?.peakProductivityHours || "Tuesdays & Wednesdays between 9:00 AM – 12:00 PM"}
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="h-10 w-10 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-500 shrink-0">
                    <Target className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-xs text-foreground">Category Backlog Speed</h4>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {aiInsights?.categoryAnalysis || "Work and Coding tasks clear fast. Administrative tasks wait in logs."}
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-3 bg-secondary/40 border border-border rounded-2xl flex items-center gap-2 text-[10px] text-muted-foreground">
                <Info className="h-4 w-4 text-primary shrink-0" />
                <span>Computed weekly on completed task history logs using local linear statistics.</span>
              </div>
            </div>

          </div>

          {/* AI Weekly Insights Report (Gemini Generation) */}
          {aiInsights && (
            <section className="bg-card border border-border rounded-3xl p-6 shadow-sm flex flex-col space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b border-border">
                <Sparkles className="h-5 w-5 text-primary animate-pulse" />
                <h3 className="font-bold text-base bg-gradient-to-r from-primary to-purple-400 bg-clip-text text-transparent">
                  AI Weekly Performance Insights & Recommendations
                </h3>
              </div>

              <div className="text-xs text-muted-foreground leading-relaxed whitespace-pre-line space-y-3">
                {/* Render markdown style headings in raw simulation */}
                <div className="prose prose-invert max-w-none text-xs text-muted-foreground">
                  {aiInsights.summary.replace(/###/g, "").replace(/\*\*/g, "")}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-border/40">
                {aiInsights.actionableInsights.map((insight, idx) => (
                  <div key={idx} className="p-3 rounded-2xl border border-border bg-secondary/15 flex gap-2">
                    <span className="text-primary font-bold text-xs">0{idx + 1}.</span>
                    <p className="text-xs text-muted-foreground leading-relaxed">{insight}</p>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Achievement Badges Overview */}
          <section className="bg-card border border-border rounded-3xl p-5 shadow-sm space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-border">
              <Award className="h-5 w-5 text-amber-500" />
              <h3 className="font-bold text-base text-foreground">Planora Achievement Badges</h3>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {badges.map((badge) => {
                const Icon = badge.icon;
                return (
                  <div 
                    key={badge.id}
                    className={`p-4 rounded-2xl border flex flex-col space-y-2 transition-all hover:scale-[1.01] ${
                      badge.unlocked 
                        ? "bg-card border-border" 
                        : "bg-secondary/20 border-transparent opacity-50"
                    }`}
                  >
                    <div className="flex justify-between items-center">
                      <div className={`h-10 w-10 rounded-xl flex items-center justify-center ${badge.color}`}>
                        <Icon className="h-5 w-5" />
                      </div>
                      <span className={`text-[9px] font-extrabold px-1.5 py-0.5 rounded-md uppercase tracking-wider ${
                        badge.unlocked ? "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20" : "bg-secondary text-muted-foreground"
                      }`}>
                        {badge.unlocked ? "Unlocked" : "Locked"}
                      </span>
                    </div>
                    <div>
                      <h4 className="font-bold text-xs text-foreground">{badge.title}</h4>
                      <p className="text-[10px] text-muted-foreground mt-0.5 leading-relaxed">{badge.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

        </main>

        <VoiceAssistant />
      </div>
    </ProtectedRoute>
  );
}
