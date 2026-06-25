"use client";

import React, { useEffect, useState } from "react";
import ProtectedRoute from "@/components/ProtectedRoute";
import Sidebar from "@/components/Sidebar";
import VoiceAssistant from "@/components/VoiceAssistant";
import { useTasks } from "@/context/TaskContext";
import { useAuth } from "@/context/AuthContext";
import Link from "next/link";
import { 
  Sparkles, 
  Flame, 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  ArrowRight, 
  BrainCircuit, 
  Calendar, 
  ShieldAlert,
  Bell,
  Trash2,
  Undo2,
  TrendingUp,
  Smile
} from "lucide-react";

export default function Dashboard() {
  const { user } = useAuth();
  const {
    tasks,
    streak,
    productivityScore,
    aiRationale,
    aiSchedule,
    aiRisks,
    aiCoach,
    notifications,
    markNotificationRead,
    clearNotifications,
    updateTask,
    restoreTask,
    runAIPrioritization,
    runAIScheduling,
    runAICoach,
    runAIRiskPrediction
  } = useTasks();

  const [aiLoading, setAiLoading] = useState<Record<string, boolean>>({});
  const [showNotifications, setShowNotifications] = useState(false);

  // Initialize coach on mount
  useEffect(() => {
    if (tasks.length > 0 && !aiCoach) {
      runAICoach();
    }
  }, [tasks, aiCoach]);

  const activeTasks = tasks.filter(t => !t.completed && !t.deleted);
  const completedTasks = tasks.filter(t => t.completed && !t.deleted);
  const trashedTasks = tasks.filter(t => t.deleted);
  
  // Calculate Overdue
  const nowTime = new Date().getTime();
  const overdueTasks = activeTasks.filter(t => new Date(t.deadline).getTime() < nowTime);

  const handleAIAction = async (key: string, fn: () => Promise<void>) => {
    setAiLoading(prev => ({ ...prev, [key]: true }));
    try {
      await fn();
    } catch (e) {
      console.error(e);
    } finally {
      setAiLoading(prev => ({ ...prev, [key]: false }));
    }
  };

  const getPriorityBadgeColor = (p: string) => {
    switch (p) {
      case "critical": return "bg-red-500/10 text-red-500 border border-red-500/20";
      case "high": return "bg-orange-500/10 text-orange-500 border border-orange-500/20";
      case "medium": return "bg-blue-500/10 text-blue-500 border border-blue-500/20";
      default: return "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20";
    }
  };

  const formatDate = (isoString: string) => {
    const d = new Date(isoString);
    return d.toLocaleString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
  };

  return (
    <ProtectedRoute>
      <div className="flex flex-col lg:flex-row min-h-screen bg-background">
        <Sidebar />

        {/* Main Workspace */}
        <main className="flex-1 flex flex-col p-6 lg:p-8 overflow-y-auto max-w-7xl mx-auto w-full space-y-6">
          {/* Header */}
          <header className="flex justify-between items-center pb-4 border-b border-border">
            <div>
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Workspace</p>
              <h1 className="text-2xl md:text-3xl font-extrabold text-foreground tracking-tight">
                Focus Dashboard
              </h1>
            </div>
            
            <div className="flex items-center gap-4 relative">
              {/* Notification Center Icon */}
              <button 
                onClick={() => setShowNotifications(!showNotifications)}
                className="p-2.5 rounded-xl border border-border hover:bg-secondary relative text-muted-foreground hover:text-foreground transition-all active:scale-95"
              >
                <Bell className="h-5 w-5" />
                {notifications.some(n => !n.read) && (
                  <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-primary" />
                )}
              </button>

              {/* Notification Dropdown */}
              {showNotifications && (
                <div className="absolute right-0 top-14 w-80 bg-card border border-border shadow-2xl rounded-2xl p-4 z-30 flex flex-col max-h-[400px] overflow-y-auto animate-in fade-in slide-in-from-top-2 duration-150">
                  <div className="flex justify-between items-center pb-2 border-b border-border/60 mb-2">
                    <span className="font-bold text-xs">Alerts Center</span>
                    {notifications.length > 0 && (
                      <button onClick={clearNotifications} className="text-[10px] text-destructive hover:underline font-semibold">
                        Clear all
                      </button>
                    )}
                  </div>
                  {notifications.length === 0 ? (
                    <p className="text-xs text-muted-foreground py-6 text-center">No new notifications.</p>
                  ) : (
                    <div className="space-y-2">
                      {notifications.map((notif) => (
                        <div 
                          key={notif.id} 
                          onClick={() => markNotificationRead(notif.id)}
                          className={`p-2.5 rounded-xl border transition-all cursor-pointer text-xs ${
                            notif.read 
                              ? "bg-secondary/40 border-transparent text-muted-foreground" 
                              : "bg-primary/5 border-primary/10 text-foreground"
                          }`}
                        >
                          <div className="flex justify-between items-center mb-0.5">
                            <span className="font-bold">{notif.title}</span>
                            <span className="text-[9px] opacity-60">{new Date(notif.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                          </div>
                          <p className="leading-relaxed">{notif.message}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </header>

          {/* Quick Metrics Grid */}
          <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Circular Productivity Score Card */}
            <div className="bg-card border border-border rounded-3xl p-5 flex items-center justify-between shadow-sm hover:scale-[1.01] transition-all">
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Productivity Score</span>
                <p className="text-3xl font-extrabold text-foreground">{productivityScore}%</p>
                <p className="text-[10px] text-muted-foreground">Adjusts in realtime</p>
              </div>
              <div className="relative h-16 w-16 flex items-center justify-center">
                <svg className="absolute h-full w-full transform -rotate-90">
                  <circle cx="32" cy="32" r="28" className="stroke-secondary fill-none" strokeWidth="5" />
                  <circle 
                    cx="32" 
                    cy="32" 
                    r="28" 
                    className="stroke-primary fill-none transition-all duration-500" 
                    strokeWidth="5" 
                    strokeDasharray={2 * Math.PI * 28} 
                    strokeDashoffset={2 * Math.PI * 28 * (1 - productivityScore / 100)} 
                  />
                </svg>
                <TrendingUp className="h-5 w-5 text-primary" />
              </div>
            </div>

            {/* Streak Card */}
            <div className="bg-card border border-border rounded-3xl p-5 flex items-center justify-between shadow-sm hover:scale-[1.01] transition-all">
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Completions Streak</span>
                <p className="text-3xl font-extrabold text-foreground flex items-center gap-1.5">
                  <span>{streak} Days</span>
                  <Flame className="h-6 w-6 text-amber-500 animate-pulse fill-amber-500" />
                </p>
                <p className="text-[10px] text-muted-foreground">Perform tasks to build heat</p>
              </div>
              <div className="h-12 w-12 rounded-2xl bg-amber-500/10 flex items-center justify-center text-amber-500">
                <Flame className="h-6 w-6 fill-amber-500/25" />
              </div>
            </div>

            {/* Task Stats Card */}
            <div className="bg-card border border-border rounded-3xl p-5 flex items-center justify-between shadow-sm hover:scale-[1.01] transition-all">
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Pending / Resolved</span>
                <p className="text-3xl font-extrabold text-foreground">
                  {activeTasks.length} / {completedTasks.length}
                </p>
                <p className="text-[10px] text-muted-foreground">Keep your workspace clean</p>
              </div>
              <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                <CheckCircle2 className="h-6 w-6" />
              </div>
            </div>

            {/* Overdue Card */}
            <div className={`border rounded-3xl p-5 flex items-center justify-between shadow-sm hover:scale-[1.01] transition-all ${
              overdueTasks.length > 0 
                ? "bg-red-500/5 border-red-500/20 text-red-900 dark:text-red-300 priority-glow-critical"
                : "bg-card border-border"
            }`}>
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Overdue Deadlines</span>
                <p className={`text-3xl font-extrabold ${overdueTasks.length > 0 ? "text-red-500" : "text-foreground"}`}>
                  {overdueTasks.length}
                </p>
                <p className="text-[10px] text-muted-foreground">Tasks that missed targeted time</p>
              </div>
              <div className={`h-12 w-12 rounded-2xl flex items-center justify-center ${
                overdueTasks.length > 0 ? "bg-red-500/20 text-red-500" : "bg-secondary text-muted-foreground"
              }`}>
                <Clock className="h-6 w-6" />
              </div>
            </div>
          </section>

          {/* AI Productivity Coach Panel */}
          {aiCoach && (
            <section className="bg-gradient-to-r from-primary/10 via-blue-500/5 to-purple-500/10 border border-primary/20 rounded-3xl p-6 shadow-md relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl pointer-events-none" />
              <div className="flex flex-col md:flex-row gap-6 items-start md:items-center justify-between">
                <div className="space-y-3 flex-1">
                  <div className="flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-primary animate-pulse" />
                    <span className="text-sm font-bold bg-gradient-to-r from-primary to-purple-400 bg-clip-text text-transparent">
                      AI Productivity Coach Suggestions
                    </span>
                  </div>
                  
                  <div className="space-y-2">
                    <p className="text-base font-bold text-foreground">
                      🎯 Top Target: <span className="text-primary italic">"{aiCoach.focusTask}"</span>
                    </p>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      💡 <span className="font-semibold text-foreground">Focus Action:</span> {aiCoach.focusTip}
                    </p>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      🧠 <span className="font-semibold text-foreground">Work Strategy:</span> {aiCoach.strategy}
                    </p>
                  </div>
                </div>

                <div className="bg-card border border-border rounded-2xl p-4 max-w-xs md:self-stretch flex flex-col justify-between shrink-0 glass shadow-sm">
                  <p className="text-xs text-foreground italic leading-relaxed mb-3">
                    "{aiCoach.motivation}"
                  </p>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                    <Smile className="h-3.5 w-3.5 text-primary" />
                    <span>Planora Companion</span>
                  </span>
                </div>
              </div>
            </section>
          )}

          {/* Core AI Actions & Interactive Tables */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Section: Today's Priorities */}
            <div className="bg-card border border-border rounded-3xl p-5 flex flex-col space-y-4 shadow-sm">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <BrainCircuit className="h-5 w-5 text-primary" />
                  <h3 className="font-bold text-lg text-foreground">Smart Prioritization</h3>
                </div>
                <button
                  onClick={() => handleAIAction("prioritize", runAIPrioritization)}
                  disabled={aiLoading["prioritize"] || activeTasks.length === 0}
                  className="bg-primary hover:bg-primary/90 disabled:opacity-50 text-primary-foreground font-bold px-3 py-1.5 rounded-xl text-xs flex items-center gap-1.5 transition-all active:scale-95 cursor-pointer"
                >
                  <Sparkles className="h-3 w-3" />
                  <span>{aiLoading["prioritize"] ? "Re-ordering..." : "AI Prioritize"}</span>
                </button>
              </div>

              {aiRationale && (
                <div className="bg-secondary/40 border border-border rounded-2xl p-3 text-xs leading-relaxed text-muted-foreground italic">
                  {aiRationale}
                </div>
              )}

              {activeTasks.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-10 text-center space-y-2">
                  <CheckCircle2 className="h-8 w-8 text-emerald-500/80" />
                  <p className="text-xs font-semibold text-muted-foreground">All caught up! Create a task to test prioritization.</p>
                </div>
              ) : (
                <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
                  {activeTasks.slice(0, 5).map((task) => (
                    <div 
                      key={task.id}
                      className={`p-3 rounded-2xl border bg-card flex items-center justify-between transition-all hover:scale-[1.01] ${
                        task.priority === "critical" ? "priority-glow-critical" :
                        task.priority === "high" ? "priority-glow-high" :
                        task.priority === "medium" ? "priority-glow-medium" : "priority-glow-low"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          checked={task.completed}
                          onChange={() => updateTask(task.id, { completed: true })}
                          className="custom-checkbox"
                        />
                        <div className="min-w-0">
                          <p className="text-xs font-semibold text-foreground truncate max-w-[200px]">{task.title}</p>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <span className={`text-[9px] px-1.5 py-0.5 rounded font-bold uppercase tracking-wider ${getPriorityBadgeColor(task.priority)}`}>
                              {task.priority}
                            </span>
                            <span className="text-[9px] text-muted-foreground">{task.category}</span>
                          </div>
                        </div>
                      </div>
                      <span className="text-[10px] text-muted-foreground font-medium shrink-0">
                        {formatDate(task.deadline)}
                      </span>
                    </div>
                  ))}
                  {activeTasks.length > 5 && (
                    <Link href="/tasks" className="text-xs text-primary font-bold hover:underline flex items-center gap-1 mt-2 justify-center">
                      <span>View all {activeTasks.length} tasks</span>
                      <ArrowRight className="h-3 w-3" />
                    </Link>
                  )}
                </div>
              )}
            </div>

            {/* Section: Daily Timeline Scheduler */}
            <div className="bg-card border border-border rounded-3xl p-5 flex flex-col space-y-4 shadow-sm">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-primary" />
                  <h3 className="font-bold text-lg text-foreground">AI Daily Planner</h3>
                </div>
                <button
                  onClick={() => handleAIAction("schedule", runAIScheduling)}
                  disabled={aiLoading["schedule"] || activeTasks.length === 0}
                  className="bg-primary hover:bg-primary/90 disabled:opacity-50 text-primary-foreground font-bold px-3 py-1.5 rounded-xl text-xs flex items-center gap-1.5 transition-all active:scale-95 cursor-pointer"
                >
                  <Sparkles className="h-3 w-3" />
                  <span>{aiLoading["schedule"] ? "Planning..." : "AI Generate Schedule"}</span>
                </button>
              </div>

              {aiSchedule.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-10 text-center space-y-2 border border-dashed border-border rounded-2xl bg-secondary/20">
                  <p className="text-xs text-muted-foreground">Click Generate to build an hour-by-hour agenda.</p>
                </div>
              ) : (
                <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
                  {aiSchedule.map((slot, idx) => (
                    <div key={idx} className="flex gap-3">
                      <div className="w-16 text-[10px] font-bold text-right text-muted-foreground py-1.5 shrink-0">
                        {slot.time}
                      </div>
                      <div className="relative pb-3 flex-1">
                        {/* Timeline Connector Line */}
                        {idx !== aiSchedule.length - 1 && (
                          <div className="absolute top-6 bottom-0 left-3 w-0.5 bg-border/60" />
                        )}
                        <div className={`p-2.5 rounded-xl border flex items-center gap-2 text-xs ${
                          slot.taskId === null
                            ? "bg-emerald-500/5 border-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-semibold"
                            : "bg-secondary/40 border-transparent text-foreground"
                        }`}>
                          <div className={`h-2.5 w-2.5 rounded-full ${slot.taskId === null ? "bg-emerald-400" : "bg-primary"}`} />
                          <span className="truncate flex-1">{slot.taskTitle}</span>
                          <span className="text-[9px] text-muted-foreground shrink-0">{slot.duration} min</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Section: Deadline Risk Predictions */}
            <div className="bg-card border border-border rounded-3xl p-5 flex flex-col space-y-4 shadow-sm lg:col-span-2">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <ShieldAlert className="h-5 w-5 text-primary" />
                  <h3 className="font-bold text-lg text-foreground">AI Deadline Risk Predictions</h3>
                </div>
                <button
                  onClick={() => handleAIAction("risks", runAIRiskPrediction)}
                  disabled={aiLoading["risks"] || activeTasks.length === 0}
                  className="bg-primary hover:bg-primary/90 disabled:opacity-50 text-primary-foreground font-bold px-3 py-1.5 rounded-xl text-xs flex items-center gap-1.5 transition-all active:scale-95 cursor-pointer"
                >
                  <Sparkles className="h-3 w-3" />
                  <span>{aiLoading["risks"] ? "Calculating..." : "Analyze Risks"}</span>
                </button>
              </div>

              {aiRisks.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-6 text-center space-y-1 bg-secondary/10 border border-dashed border-border rounded-2xl">
                  <Smile className="h-7 w-7 text-emerald-500/80" />
                  <p className="text-xs font-semibold text-muted-foreground">All active tasks are safely scheduled with ample buffer time.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {aiRisks.map((risk, index) => (
                    <div 
                      key={index} 
                      className={`p-4 rounded-2xl border flex flex-col justify-between space-y-2 ${
                        risk.riskLevel === "High" 
                          ? "bg-red-500/5 border-red-500/10 text-foreground"
                          : "bg-orange-500/5 border-orange-500/10 text-foreground"
                      }`}
                    >
                      <div>
                        <div className="flex justify-between items-center mb-1">
                          <span className="font-bold text-xs truncate max-w-[200px]">{risk.title}</span>
                          <span className={`text-[9px] px-1.5 py-0.5 rounded font-extrabold uppercase ${
                            risk.riskLevel === "High" ? "bg-red-500/20 text-red-500" : "bg-orange-500/20 text-orange-500"
                          }`}>
                            {risk.riskLevel} Risk
                          </span>
                        </div>
                        <p className="text-[11px] text-muted-foreground leading-relaxed">
                          ⚠️ <span className="font-bold text-foreground">Why:</span> {risk.reason}
                        </p>
                      </div>
                      <div className="bg-background/80 border border-border p-2 rounded-xl text-[10px] leading-relaxed text-muted-foreground">
                        💡 <span className="font-semibold text-foreground">Solution:</span> {risk.suggestion}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Section: Trash / Soft Deleted Recovery */}
            {trashedTasks.length > 0 && (
              <div className="bg-card border border-border rounded-3xl p-5 flex flex-col space-y-3 shadow-sm lg:col-span-2">
                <div className="flex items-center gap-2">
                  <Trash2 className="h-5 w-5 text-muted-foreground" />
                  <h3 className="font-bold text-base text-foreground">Soft Deleted Trash</h3>
                </div>
                <div className="flex flex-wrap gap-2">
                  {trashedTasks.map((task) => (
                    <div 
                      key={task.id}
                      className="p-2.5 rounded-xl border border-border/80 bg-secondary/20 flex items-center gap-3 text-xs"
                    >
                      <span className="text-muted-foreground truncate max-w-[200px] line-through">{task.title}</span>
                      <button
                        onClick={() => restoreTask(task.id)}
                        className="p-1 rounded-md hover:bg-secondary text-primary transition-all active:scale-90"
                        title="Restore Task"
                      >
                        <Undo2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>
        </main>

        {/* Floating Voice Assistant Mic */}
        <VoiceAssistant />
      </div>
    </ProtectedRoute>
  );
}
