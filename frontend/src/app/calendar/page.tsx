"use client";

import React, { useState } from "react";
import ProtectedRoute from "@/components/ProtectedRoute";
import Sidebar from "@/components/Sidebar";
import VoiceAssistant from "@/components/VoiceAssistant";
import { useTasks, Task } from "@/context/TaskContext";
import { 
  Sparkles, 
  ChevronLeft, 
  ChevronRight, 
  Calendar as CalendarIcon, 
  Clock, 
  MapPin, 
  Plus, 
  Info,
  CheckCircle2,
  X
} from "lucide-react";

export default function CalendarWorkspace() {
  const { tasks, updateTask, addTask } = useTasks();

  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<"month" | "week" | "day">("month");

  // Create Task Modal on specific Date
  const [quickAddDate, setQuickAddDate] = useState<string | null>(null);
  const [quickTitle, setQuickTitle] = useState("");
  const [quickCategory, setQuickCategory] = useState("Work");
  const [quickPriority, setQuickPriority] = useState<Task["priority"]>("medium");

  const activeTasks = tasks.filter(t => !t.deleted);

  // Month navigation helpers
  const handlePrev = () => {
    const newDate = new Date(currentDate);
    if (viewMode === "month") {
      newDate.setMonth(newDate.getMonth() - 1);
    } else if (viewMode === "week") {
      newDate.setDate(newDate.getDate() - 7);
    } else {
      newDate.setDate(newDate.getDate() - 1);
    }
    setCurrentDate(newDate);
  };

  const handleNext = () => {
    const newDate = new Date(currentDate);
    if (viewMode === "month") {
      newDate.setMonth(newDate.getMonth() + 1);
    } else if (viewMode === "week") {
      newDate.setDate(newDate.getDate() + 7);
    } else {
      newDate.setDate(newDate.getDate() + 1);
    }
    setCurrentDate(newDate);
  };

  const getPriorityBorder = (priority: string) => {
    switch (priority) {
      case "critical": return "border-l-4 border-l-red-500 bg-red-500/5";
      case "high": return "border-l-4 border-l-orange-500 bg-orange-500/5";
      case "medium": return "border-l-4 border-l-blue-500 bg-blue-500/5";
      default: return "border-l-4 border-l-emerald-500 bg-emerald-500/5";
    }
  };

  const getPriorityIndicator = (priority: string) => {
    switch (priority) {
      case "critical": return "bg-red-500";
      case "high": return "bg-orange-400";
      case "medium": return "bg-blue-400";
      default: return "bg-emerald-400";
    }
  };

  const handleQuickAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickTitle.trim() || !quickAddDate) return;

    try {
      await addTask({
        title: quickTitle.trim(),
        deadline: quickAddDate + "T12:00", // Default to midday
        duration: 45,
        priority: quickPriority,
        category: quickCategory,
        tags: ["calendar-added"],
        notes: "Created via Calendar Quick Add."
      });
      setQuickTitle("");
      setQuickAddDate(null);
    } catch (err) {
      console.error(err);
    }
  };

  // Render Month View calendar calculations
  const renderMonthCells = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    const firstDayOfMonth = new Date(year, month, 1).getDay(); // 0 (Sun) to 6 (Sat)
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const daysInPrevMonth = new Date(year, month, 0).getDate();

    const cells: React.ReactNode[] = [];

    // Fill previous month trailing days
    for (let i = firstDayOfMonth - 1; i >= 0; i--) {
      const day = daysInPrevMonth - i;
      const cellDate = new Date(year, month - 1, day);
      cells.push(renderDayCell(cellDate, false, `prev-${day}`));
    }

    // Fill current month days
    for (let day = 1; day <= daysInMonth; day++) {
      const cellDate = new Date(year, month, day);
      const isToday = new Date().toDateString() === cellDate.toDateString();
      cells.push(renderDayCell(cellDate, true, `curr-${day}`, isToday));
    }

    // Fill next month leading days to complete grid (42 cells standard)
    const totalCells = cells.length;
    const remaining = 42 - totalCells;
    for (let day = 1; day <= remaining; day++) {
      const cellDate = new Date(year, month + 1, day);
      cells.push(renderDayCell(cellDate, false, `next-${day}`));
    }

    return cells;
  };

  const renderDayCell = (date: Date, isCurrentMonth: boolean, key: string, isToday = false) => {
    const dateString = date.toISOString().split("T")[0];
    const dayTasks = activeTasks.filter(t => t.deadline.startsWith(dateString));

    return (
      <div 
        key={key}
        onClick={() => setQuickAddDate(dateString)}
        className={`min-h-[100px] border border-border p-2 flex flex-col justify-between hover:bg-secondary/40 transition-colors cursor-pointer select-none relative group ${
          isCurrentMonth ? "text-foreground" : "text-muted-foreground/50 bg-secondary/10"
        } ${isToday ? "bg-primary/5 ring-1 ring-primary/30" : ""}`}
      >
        <div className="flex justify-between items-center">
          <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
            isToday ? "bg-primary text-primary-foreground" : ""
          }`}>
            {date.getDate()}
          </span>
          <span className="opacity-0 group-hover:opacity-100 transition-opacity text-[10px] text-primary font-bold">
            + Add
          </span>
        </div>

        {/* Task lists inside the month day */}
        <div className="flex-1 mt-1 space-y-1 overflow-y-auto max-h-[80px]">
          {dayTasks.slice(0, 3).map((task) => (
            <div 
              key={task.id}
              onClick={(e) => {
                e.stopPropagation(); // Avoid triggering day click
                // Simulate quick status toggle on click
                updateTask(task.id, { completed: !task.completed });
              }}
              className={`px-1.5 py-0.5 rounded-md text-[9px] font-medium truncate flex items-center gap-1 border transition-all hover:scale-102 ${getPriorityBorder(task.priority)} ${
                task.completed ? "line-through text-muted-foreground/60 opacity-60" : "text-foreground"
              }`}
              title={task.title}
            >
              <span className={`h-1.5 w-1.5 rounded-full ${getPriorityIndicator(task.priority)}`} />
              <span className="truncate">{task.title}</span>
            </div>
          ))}
          {dayTasks.length > 3 && (
            <div className="text-[8px] font-bold text-primary pl-1">
              +{dayTasks.length - 3} more tasks
            </div>
          )}
        </div>
      </div>
    );
  };

  // Render Weekly view
  const renderWeekView = () => {
    // Calculate Sunday of the current date week
    const startOfWeek = new Date(currentDate);
    const day = startOfWeek.getDay();
    startOfWeek.setDate(startOfWeek.getDate() - day);

    const weekDays: Date[] = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(startOfWeek);
      d.setDate(startOfWeek.getDate() + i);
      weekDays.push(d);
    }

    return (
      <div className="grid grid-cols-7 gap-4 min-h-[400px]">
        {weekDays.map((date, idx) => {
          const dateString = date.toISOString().split("T")[0];
          const dayTasks = activeTasks.filter(t => t.deadline.startsWith(dateString));
          const isToday = new Date().toDateString() === date.toDateString();

          return (
            <div 
              key={idx}
              onClick={() => setQuickAddDate(dateString)}
              className={`border border-border rounded-2xl p-3 flex flex-col space-y-3 hover:bg-secondary/20 transition-all cursor-pointer ${
                isToday ? "bg-primary/5 ring-1 ring-primary/20" : "bg-card"
              }`}
            >
              <div className="text-center pb-2 border-b border-border/60">
                <p className="text-[10px] uppercase font-bold text-muted-foreground">
                  {date.toLocaleString("en-US", { weekday: "short" })}
                </p>
                <p className={`text-lg font-extrabold mt-0.5 ${isToday ? "text-primary" : ""}`}>
                  {date.getDate()}
                </p>
              </div>

              <div className="flex-1 space-y-2 overflow-y-auto max-h-[350px]">
                {dayTasks.map((task) => (
                  <div 
                    key={task.id}
                    onClick={(e) => {
                      e.stopPropagation();
                      updateTask(task.id, { completed: !task.completed });
                    }}
                    className={`p-2.5 rounded-xl border flex flex-col gap-1 transition-all hover:scale-102 ${getPriorityBorder(task.priority)} ${
                      task.completed ? "opacity-60 line-through" : ""
                    }`}
                  >
                    <span className="text-[10px] font-bold text-foreground leading-normal truncate">{task.title}</span>
                    <span className="text-[8px] text-muted-foreground uppercase">{task.category}</span>
                  </div>
                ))}
                {dayTasks.length === 0 && (
                  <p className="text-[10px] text-muted-foreground text-center py-10 italic">Free</p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  // Render Daily View
  const renderDayView = () => {
    const dateString = currentDate.toISOString().split("T")[0];
    const dayTasks = activeTasks.filter(t => t.deadline.startsWith(dateString));

    // Timeline hours 8:00 AM to 8:00 PM
    const hours = Array.from({ length: 13 }, (_, i) => i + 8);

    return (
      <div className="bg-card border border-border rounded-3xl p-6 shadow-sm max-w-3xl mx-auto space-y-4">
        <h3 className="font-bold text-sm text-foreground uppercase tracking-wider pb-2 border-b border-border">
          Agenda Timeline: {currentDate.toLocaleDateString([], { weekday: "long", month: "short", day: "numeric" })}
        </h3>

        <div className="space-y-4 relative">
          {hours.map((hour) => {
            const displayTime = `${hour > 12 ? hour - 12 : hour}:00 ${hour >= 12 ? "PM" : "AM"}`;
            
            // Check if any task is scheduled in this hour block
            const matchingTasks = dayTasks.filter(task => {
              const taskHour = new Date(task.deadline).getHours();
              return taskHour === hour;
            });

            return (
              <div key={hour} className="flex gap-4">
                <div className="w-16 text-[10px] font-bold text-right text-muted-foreground py-2 shrink-0">
                  {displayTime}
                </div>
                
                <div className="flex-1 pb-4 border-b border-border/40 relative">
                  {/* Timeline connector circle */}
                  <div className="absolute top-3 -left-[22px] h-2.5 w-2.5 rounded-full bg-border" />
                  
                  <div className="space-y-2">
                    {matchingTasks.map((task) => (
                      <div 
                        key={task.id}
                        onClick={() => updateTask(task.id, { completed: !task.completed })}
                        className={`p-3 rounded-xl border flex items-center justify-between transition-all hover:scale-[1.01] cursor-pointer ${getPriorityBorder(task.priority)} ${
                          task.completed ? "opacity-60 line-through" : ""
                        }`}
                      >
                        <div className="flex items-center gap-2 text-xs font-semibold">
                          <div className={`h-2.5 w-2.5 rounded-full ${getPriorityIndicator(task.priority)}`} />
                          <span>{task.title}</span>
                          <span className="text-[9px] text-muted-foreground bg-secondary px-1.5 py-0.5 rounded">📂 {task.category}</span>
                        </div>
                        <span className="text-[10px] text-muted-foreground">{task.duration} mins</span>
                      </div>
                    ))}

                    {matchingTasks.length === 0 && (
                      <button 
                        onClick={() => setQuickAddDate(dateString)}
                        className="text-[10px] text-muted-foreground/60 hover:text-primary hover:underline italic font-medium p-1 transition-colors"
                      >
                        + Click to schedule task block
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

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
                <CalendarIcon className="h-6 w-6 text-primary" />
                <span>Interactive Calendar</span>
              </h1>
            </div>

            {/* Toggle View Options */}
            <div className="flex rounded-xl bg-secondary p-1 text-xs self-start sm:self-center">
              {[
                { key: "month", label: "Month" },
                { key: "week", label: "Week" },
                { key: "day", label: "Day" }
              ].map((v) => (
                <button
                  key={v.key}
                  onClick={() => setViewMode(v.key as any)}
                  className={`px-4 py-1.5 rounded-lg font-bold transition-all ${
                    viewMode === v.key 
                      ? "bg-card text-foreground shadow-sm" 
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {v.label}
                </button>
              ))}
            </div>
          </header>

          {/* Navigation Control Panel */}
          <section className="flex items-center justify-between bg-card border border-border p-4 rounded-2xl shadow-sm">
            <div className="flex items-center gap-2">
              <button 
                onClick={handlePrev}
                className="p-2 border border-border rounded-xl hover:bg-secondary text-foreground transition-all active:scale-95"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button 
                onClick={handleNext}
                className="p-2 border border-border rounded-xl hover:bg-secondary text-foreground transition-all active:scale-95"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
              <button 
                onClick={() => setCurrentDate(new Date())}
                className="px-3 py-2 border border-border rounded-xl text-xs font-bold hover:bg-secondary transition-all active:scale-95"
              >
                Today
              </button>
            </div>

            <h2 className="text-sm md:text-base font-extrabold text-foreground uppercase tracking-wider">
              {currentDate.toLocaleString("en-US", { month: "long", year: "numeric" })}
            </h2>
          </section>

          {/* Core Calendar Views */}
          <section className="flex-1">
            {viewMode === "month" && (
              <div className="bg-card border border-border rounded-3xl overflow-hidden shadow-sm">
                {/* Day Labels */}
                <div className="grid grid-cols-7 border-b border-border bg-secondary/50 text-center py-3">
                  {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
                    <span key={day} className="text-[10px] uppercase font-bold text-muted-foreground">
                      {day}
                    </span>
                  ))}
                </div>
                {/* Cells Grid */}
                <div className="grid grid-cols-7 bg-background">
                  {renderMonthCells()}
                </div>
              </div>
            )}

            {viewMode === "week" && renderWeekView()}

            {viewMode === "day" && renderDayView()}
          </section>
        </main>

        {/* Quick Add Modal */}
        {quickAddDate && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div onClick={() => setQuickAddDate(null)} className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
            <div className="relative z-10 w-full max-w-sm bg-card border border-border rounded-3xl shadow-2xl p-6 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
              <div className="flex justify-between items-center mb-4 pb-2 border-b border-border/80">
                <span className="font-bold text-sm text-foreground flex items-center gap-1.5">
                  <Sparkles className="h-4 w-4 text-primary animate-pulse" />
                  <span>Quick Schedule Block</span>
                </span>
                <button onClick={() => setQuickAddDate(null)} className="text-muted-foreground hover:text-foreground">
                  <X className="h-4 w-4" />
                </button>
              </div>

              <form onSubmit={handleQuickAddSubmit} className="space-y-4 text-left">
                <div className="flex flex-col space-y-1">
                  <label className="text-[10px] uppercase font-bold text-muted-foreground">Task Title</label>
                  <input
                    type="text"
                    required
                    value={quickTitle}
                    onChange={(e) => setQuickTitle(e.target.value)}
                    placeholder="Enter what you want to achieve..."
                    className="w-full text-xs bg-secondary/80 rounded-xl px-3 py-2.5 border border-border focus:outline-none focus:ring-1 focus:ring-primary text-foreground font-semibold"
                  />
                </div>

                <div className="flex flex-col space-y-1">
                  <label className="text-[10px] uppercase font-bold text-muted-foreground">Category Space</label>
                  <select
                    value={quickCategory}
                    onChange={(e) => setQuickCategory(e.target.value)}
                    className="w-full text-xs bg-secondary/80 rounded-xl px-3 py-2.5 border border-border focus:outline-none text-foreground font-semibold"
                  >
                    <option value="Work">Work</option>
                    <option value="Study">Study</option>
                    <option value="Personal">Personal</option>
                    <option value="Coding">Coding</option>
                  </select>
                </div>

                <div className="flex flex-col space-y-1">
                  <label className="text-[10px] uppercase font-bold text-muted-foreground">Priority Weight</label>
                  <select
                    value={quickPriority}
                    onChange={(e) => setQuickPriority(e.target.value as any)}
                    className="w-full text-xs bg-secondary/80 rounded-xl px-3 py-2.5 border border-border focus:outline-none text-foreground font-semibold"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="critical">Critical</option>
                  </select>
                </div>

                <div className="pt-2 border-t border-border flex justify-end gap-2 text-xs">
                  <button
                    type="button"
                    onClick={() => setQuickAddDate(null)}
                    className="border border-border bg-card text-foreground px-4 py-2 rounded-xl font-bold hover:bg-secondary transition-all active:scale-95"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={!quickTitle.trim()}
                    className="bg-primary text-primary-foreground font-bold px-4 py-2 rounded-xl hover:bg-primary/95 transition-all active:scale-95 disabled:opacity-50"
                  >
                    Schedule
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        <VoiceAssistant />
      </div>
    </ProtectedRoute>
  );
}
