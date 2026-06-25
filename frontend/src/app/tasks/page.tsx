"use client";

import React, { useState } from "react";
import ProtectedRoute from "@/components/ProtectedRoute";
import Sidebar from "@/components/Sidebar";
import VoiceAssistant from "@/components/VoiceAssistant";
import { useTasks, Task } from "@/context/TaskContext";
import { 
  Sparkles, 
  Search, 
  Plus, 
  Trash2, 
  Copy, 
  Edit3, 
  Check, 
  Paperclip, 
  Tag, 
  Calendar, 
  ArrowUpDown,
  Filter,
  X,
  PlusCircle,
  FolderMinus,
  CheckCircle2,
  FileText
} from "lucide-react";

export default function TaskManager() {
  const {
    tasks,
    categories,
    addTask,
    updateTask,
    deleteTask,
    duplicateTask,
    addCategory,
    removeCategory
  } = useTasks();

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"active" | "completed" | "deleted" | "all">("active");
  const [priorityFilter, setPriorityFilter] = useState<string>("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<"deadline" | "priority" | "duration">("deadline");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

  // Category State
  const [newCatName, setNewCatName] = useState("");
  const [showCatManager, setShowCatManager] = useState(false);

  // Modal / Form state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  
  // Form fields
  const [title, setTitle] = useState("");
  const [priority, setPriority] = useState<Task["priority"]>("medium");
  const [deadline, setDeadline] = useState("");
  const [duration, setDuration] = useState(45);
  const [category, setCategory] = useState("Work");
  const [notes, setNotes] = useState("");
  const [tagInput, setTagInput] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [attachmentName, setAttachmentName] = useState<string | null>(null);

  const openAddModal = () => {
    setEditingTask(null);
    setTitle("");
    setPriority("medium");
    
    // Set default deadline to tomorrow 5 PM
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(17, 0, 0, 0);
    setDeadline(tomorrow.toISOString().substring(0, 16));
    
    setDuration(45);
    setCategory(categories[0] || "Work");
    setNotes("");
    setTags([]);
    setTagInput("");
    setAttachmentName(null);
    setIsModalOpen(true);
  };

  const openEditModal = (task: Task) => {
    setEditingTask(task);
    setTitle(task.title);
    setPriority(task.priority);
    setDeadline(task.deadline);
    setDuration(task.duration || 45);
    setCategory(task.category);
    setNotes(task.notes || "");
    setTags(task.tags || []);
    setTagInput("");
    // Simulate current attachment if any
    setAttachmentName((task as any).attachment || null);
    setIsModalOpen(true);
  };

  const handleAddTag = () => {
    if (!tagInput.trim()) return;
    const cleanTag = tagInput.trim().toLowerCase();
    if (!tags.includes(cleanTag)) {
      setTags([...tags, cleanTag]);
    }
    setTagInput("");
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter(t => t !== tagToRemove));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setAttachmentName(e.target.files[0].name);
    }
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const taskFields = {
      title: title.trim(),
      priority,
      deadline,
      duration,
      category,
      tags,
      notes: notes.trim(),
      attachment: attachmentName // custom parameter
    } as any;

    try {
      if (editingTask) {
        await updateTask(editingTask.id, taskFields);
      } else {
        await addTask(taskFields);
      }
      setIsModalOpen(false);
    } catch (err) {
      console.error(err);
    }
  };

  // Run Search, Filter & Sort
  const filteredTasks = tasks
    .filter((task) => {
      // 1. Status Filter
      if (statusFilter === "active") return !task.completed && !task.deleted;
      if (statusFilter === "completed") return task.completed && !task.deleted;
      if (statusFilter === "deleted") return !!task.deleted;
      return !task.deleted; // "all" active+completed, ignore trashed
    })
    .filter((task) => {
      // 2. Search query filter
      return (
        task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (task.notes || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
        task.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    })
    .filter((task) => {
      // 3. Priority filter
      if (priorityFilter === "all") return true;
      return task.priority === priorityFilter;
    })
    .filter((task) => {
      // 4. Category filter
      if (categoryFilter === "all") return true;
      return task.category === categoryFilter;
    })
    .sort((a, b) => {
      // 5. Sorting
      let comparison = 0;
      if (sortBy === "deadline") {
        comparison = new Date(a.deadline).getTime() - new Date(b.deadline).getTime();
      } else if (sortBy === "priority") {
        const priorityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
        comparison = priorityOrder[b.priority] - priorityOrder[a.priority];
      } else if (sortBy === "duration") {
        comparison = (a.duration || 0) - (b.duration || 0);
      }
      return sortOrder === "asc" ? comparison : -comparison;
    });

  const getPriorityColor = (p: string) => {
    switch (p) {
      case "critical": return "text-red-500 bg-red-500/10 border-red-500/20";
      case "high": return "text-orange-500 bg-orange-500/10 border-orange-500/20";
      case "medium": return "text-blue-500 bg-blue-500/10 border-blue-500/20";
      default: return "text-emerald-500 bg-emerald-500/10 border-emerald-500/20";
    }
  };

  const handleAddCategorySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newCatName.trim()) {
      addCategory(newCatName);
      setNewCatName("");
    }
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
              <h1 className="text-2xl md:text-3xl font-extrabold text-foreground tracking-tight">
                Task Manager
              </h1>
            </div>
            
            <div className="flex gap-2">
              {/* Category manager toggle */}
              <button 
                onClick={() => setShowCatManager(!showCatManager)}
                className="bg-secondary text-foreground hover:bg-secondary/80 font-semibold px-4 py-2.5 rounded-xl text-sm transition-all active:scale-95 flex items-center gap-1.5"
              >
                <span>Categories</span>
              </button>
              
              {/* Add task button */}
              <button 
                onClick={openAddModal}
                className="bg-primary text-primary-foreground font-bold px-4 py-2.5 rounded-xl text-sm hover:scale-105 shadow-md shadow-primary/20 transition-all flex items-center gap-1.5 active:scale-95 cursor-pointer"
              >
                <Plus className="h-4 w-4" />
                <span>New Task</span>
              </button>
            </div>
          </header>

          {/* Category Management Drawer/Section */}
          {showCatManager && (
            <section className="bg-card border border-border rounded-3xl p-5 shadow-md animate-in fade-in slide-in-from-top-3 duration-200">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-sm text-foreground">Workspace Categories</h3>
                <button onClick={() => setShowCatManager(false)} className="text-muted-foreground hover:text-foreground">
                  <X className="h-4 w-4" />
                </button>
              </div>
              <div className="flex flex-wrap gap-2 mb-4">
                {categories.map((cat) => (
                  <div key={cat} className="flex items-center gap-1.5 bg-secondary px-3 py-1.5 rounded-xl text-xs text-foreground font-semibold">
                    <span>{cat}</span>
                    <button 
                      onClick={() => removeCategory(cat)}
                      className="p-0.5 rounded-full hover:bg-destructive/20 text-muted-foreground hover:text-destructive transition-colors"
                      title={`Delete category ${cat}`}
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
              <form onSubmit={handleAddCategorySubmit} className="flex gap-2 max-w-sm">
                <input
                  type="text"
                  value={newCatName}
                  onChange={(e) => setNewCatName(e.target.value)}
                  placeholder="Create custom category..."
                  className="flex-1 text-xs bg-secondary/80 rounded-xl px-3.5 py-2.5 border border-border focus:outline-none focus:ring-1 focus:ring-primary w-full text-foreground"
                />
                <button
                  type="submit"
                  disabled={!newCatName.trim()}
                  className="bg-primary text-primary-foreground text-xs font-bold px-4 py-2 rounded-xl hover:bg-primary/95 disabled:opacity-40 transition-all active:scale-95"
                >
                  Add
                </button>
              </form>
            </section>
          )}

          {/* Control Filter Bar */}
          <section className="bg-card border border-border rounded-3xl p-5 shadow-sm space-y-4">
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
              
              {/* Search bar */}
              <div className="relative w-full md:max-w-xs">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search tasks, notes, tags..."
                  className="w-full bg-secondary/60 border border-border focus:border-border/80 rounded-2xl pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-primary text-foreground"
                />
              </div>

              {/* Advanced Sorting & Order */}
              <div className="flex flex-wrap items-center gap-3 w-full md:w-auto justify-end">
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <ArrowUpDown className="h-3.5 w-3.5" />
                  <span>Sort:</span>
                </div>
                
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="bg-secondary/60 border border-border rounded-xl px-3 py-2 text-xs focus:outline-none text-foreground"
                >
                  <option value="deadline">Deadline</option>
                  <option value="priority">Priority</option>
                  <option value="duration">Duration</option>
                </select>

                <button
                  onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
                  className="bg-secondary/60 hover:bg-secondary border border-border p-2 rounded-xl text-xs text-foreground transition-all active:scale-95"
                >
                  {sortOrder === "asc" ? "Ascending" : "Descending"}
                </button>
              </div>

            </div>

            {/* Quick Filters */}
            <div className="flex flex-wrap gap-3 pt-2 border-t border-border/40 text-xs">
              {/* Status Filters */}
              <div className="flex rounded-xl bg-secondary p-1">
                {[
                  { key: "active", label: "Pending" },
                  { key: "completed", label: "Resolved" },
                  { key: "deleted", label: "Trash" },
                  { key: "all", label: "All" }
                ].map((s) => (
                  <button
                    key={s.key}
                    onClick={() => setStatusFilter(s.key as any)}
                    className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
                      statusFilter === s.key 
                        ? "bg-card text-foreground shadow-sm" 
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {s.label}
                  </button>
                ))}
              </div>

              {/* Priority Dropdown */}
              <select
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value)}
                className="bg-secondary/60 border border-border rounded-xl px-3 py-1.5 text-xs text-foreground focus:outline-none"
              >
                <option value="all">All Priorities</option>
                <option value="critical">Critical</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>

              {/* Category Dropdown */}
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="bg-secondary/60 border border-border rounded-xl px-3 py-1.5 text-xs text-foreground focus:outline-none"
              >
                <option value="all">All Categories</option>
                {categories.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
          </section>

          {/* Task Grid / List View */}
          <section className="space-y-3">
            {filteredTasks.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-center space-y-3 border border-dashed border-border rounded-3xl bg-card">
                <CheckCircle2 className="h-10 w-10 text-primary/60" />
                <div>
                  <h3 className="font-bold text-foreground">No tasks found</h3>
                  <p className="text-xs text-muted-foreground max-w-xs mt-1">Try relaxing filters, updating search parameters, or create a brand new task to get started.</p>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4">
                {filteredTasks.map((task) => (
                  <div 
                    key={task.id} 
                    className={`bg-card border border-border rounded-3xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all hover:scale-[1.005] ${
                      task.deleted ? "opacity-60" :
                      task.completed ? "border-emerald-500/20 bg-emerald-500/[0.01]" :
                      task.priority === "critical" ? "priority-glow-critical" :
                      task.priority === "high" ? "priority-glow-high" :
                      task.priority === "medium" ? "priority-glow-medium" : "priority-glow-low"
                    }`}
                  >
                    {/* Checkbox + Details */}
                    <div className="flex items-start gap-4 flex-1">
                      <input
                        type="checkbox"
                        checked={task.completed}
                        disabled={task.deleted}
                        onChange={() => updateTask(task.id, { completed: !task.completed })}
                        className="custom-checkbox mt-1 shrink-0"
                      />
                      
                      <div className="space-y-1.5 min-w-0">
                        <h3 className={`font-bold text-sm leading-relaxed text-foreground truncate max-w-lg ${task.completed ? "line-through text-muted-foreground font-medium" : ""}`}>
                          {task.title}
                        </h3>

                        {/* Notes snippet */}
                        {task.notes && (
                          <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2 max-w-2xl whitespace-pre-line">
                            {task.notes}
                          </p>
                        )}

                        {/* Badges/Category */}
                        <div className="flex flex-wrap items-center gap-2 pt-1">
                          <span className={`text-[9px] px-2 py-0.5 rounded-md font-bold uppercase tracking-wider ${getPriorityColor(task.priority)}`}>
                            {task.priority}
                          </span>
                          <span className="text-[10px] font-semibold text-muted-foreground bg-secondary/80 px-2 py-0.5 rounded-md">
                            📂 {task.category}
                          </span>
                          <span className="text-[10px] text-muted-foreground bg-secondary/80 px-2 py-0.5 rounded-md">
                            ⏳ {task.duration || 45} mins
                          </span>
                          {/* Tags list */}
                          {task.tags && task.tags.map(t => (
                            <span key={t} className="text-[10px] text-primary/90 bg-primary/5 px-2 py-0.5 rounded-md font-medium border border-primary/10">
                              #{t}
                            </span>
                          ))}
                          {/* Attachment Indicator */}
                          {(task as any).attachment && (
                            <span className="text-[10px] text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded-md font-medium border border-amber-500/20 flex items-center gap-1">
                              <Paperclip className="h-3 w-3" />
                              <span className="truncate max-w-[100px]">{(task as any).attachment}</span>
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Deadline + Action Buttons */}
                    <div className="flex items-center justify-between md:justify-end gap-4 border-t border-border/40 pt-4 md:pt-0 md:border-none shrink-0">
                      <div className="flex flex-col text-left md:text-right">
                        <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Target Due</span>
                        <span className="text-xs font-semibold text-foreground flex items-center gap-1 md:justify-end mt-0.5">
                          <Calendar className="h-3.5 w-3.5 text-primary" />
                          <span>{new Date(task.deadline).toLocaleString([], { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}</span>
                        </span>
                      </div>

                      <div className="flex items-center gap-1 bg-secondary/40 p-1.5 rounded-2xl border border-border/60">
                        {task.deleted ? (
                          <button
                            onClick={() => updateTask(task.id, { deleted: false })}
                            className="p-2 rounded-xl text-primary hover:bg-secondary transition-all active:scale-90 font-bold text-xs flex items-center gap-1"
                            title="Restore Task"
                          >
                            <span>Restore</span>
                          </button>
                        ) : (
                          <>
                            <button
                              onClick={() => openEditModal(task)}
                              className="p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-secondary transition-all active:scale-90"
                              title="Edit Task"
                            >
                              <Edit3 className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => duplicateTask(task.id)}
                              className="p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-secondary transition-all active:scale-90"
                              title="Duplicate Task"
                            >
                              <Copy className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => deleteTask(task.id)}
                              className="p-2 rounded-xl text-destructive/80 hover:text-destructive hover:bg-destructive/10 transition-all active:scale-90"
                              title="Delete Task"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </>
                        )}
                      </div>
                    </div>

                  </div>
                ))}
              </div>
            )}
          </section>
        </main>

        {/* Task Form Modal (Add / Edit) */}
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div 
              onClick={() => setIsModalOpen(false)} 
              className="absolute inset-0 bg-black/60 backdrop-blur-sm" 
            />
            
            <div className="relative z-10 w-full max-w-xl bg-card border border-border rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
              <div className="bg-secondary/40 px-6 py-4 flex justify-between items-center border-b border-border">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-primary animate-pulse" />
                  <span className="font-bold text-foreground">
                    {editingTask ? "Modify Task Parameters" : "Draft New Task Agent"}
                  </span>
                </div>
                <button onClick={() => setIsModalOpen(false)} className="p-1 rounded-full hover:bg-secondary">
                  <X className="h-5 w-5" />
                </button>
              </div>

              <form onSubmit={handleFormSubmit} className="p-6 space-y-4">
                
                {/* Title */}
                <div className="flex flex-col space-y-1.5">
                  <label className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">Task Title</label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="What action needs completion?"
                    className="w-full bg-secondary/60 border border-border rounded-2xl px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-primary text-foreground"
                  />
                </div>

                {/* Priority + Category */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col space-y-1.5">
                    <label className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">Priority Weight</label>
                    <select
                      value={priority}
                      onChange={(e) => setPriority(e.target.value as any)}
                      className="bg-secondary/60 border border-border rounded-2xl px-3 py-3 text-xs focus:outline-none text-foreground"
                    >
                      <option value="low">Low Priority</option>
                      <option value="medium">Medium Priority</option>
                      <option value="high">High Priority</option>
                      <option value="critical">Critical Urgency</option>
                    </select>
                  </div>
                  <div className="flex flex-col space-y-1.5">
                    <label className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">Category Space</label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="bg-secondary/60 border border-border rounded-2xl px-3 py-3 text-xs focus:outline-none text-foreground"
                    >
                      {categories.map((c) => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Deadline + Duration */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col space-y-1.5">
                    <label className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">Target Deadline</label>
                    <input
                      type="datetime-local"
                      required
                      value={deadline}
                      onChange={(e) => setDeadline(e.target.value)}
                      className="w-full bg-secondary/60 border border-border rounded-2xl px-3.5 py-2.5 text-xs focus:outline-none text-foreground"
                    />
                  </div>
                  <div className="flex flex-col space-y-1.5">
                    <label className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">Duration (Minutes)</label>
                    <input
                      type="number"
                      required
                      min="5"
                      max="480"
                      value={duration}
                      onChange={(e) => setDuration(parseInt(e.target.value) || 30)}
                      placeholder="e.g. 60"
                      className="w-full bg-secondary/60 border border-border rounded-2xl px-4 py-2.5 text-xs focus:outline-none text-foreground"
                    />
                  </div>
                </div>

                {/* Tags Section */}
                <div className="flex flex-col space-y-1.5">
                  <label className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">Metadata Tags</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      placeholder="Add short keyword..."
                      className="flex-1 bg-secondary/60 border border-border rounded-2xl px-4 py-2.5 text-xs focus:outline-none text-foreground"
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          handleAddTag();
                        }
                      }}
                    />
                    <button
                      type="button"
                      onClick={handleAddTag}
                      className="bg-secondary border border-border text-foreground text-xs font-bold px-4 rounded-2xl hover:bg-secondary/80 active:scale-95"
                    >
                      Insert
                    </button>
                  </div>
                  {tags.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {tags.map((t) => (
                        <div key={t} className="flex items-center gap-1 bg-primary/10 border border-primary/20 text-primary text-[10px] font-semibold px-2 py-0.5 rounded-lg">
                          <span>#{t}</span>
                          <button type="button" onClick={() => handleRemoveTag(t)}>
                            <X className="h-3 w-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Notes */}
                <div className="flex flex-col space-y-1.5">
                  <label className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">Detailed Notes</label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Enter additional criteria details..."
                    rows={3}
                    className="w-full bg-secondary/60 border border-border rounded-2xl px-4 py-3 text-xs focus:outline-none text-foreground resize-none"
                  />
                </div>

                {/* File Attachment Upload */}
                <div className="flex flex-col space-y-1.5">
                  <label className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider flex items-center gap-1.5">
                    <Paperclip className="h-3.5 w-3.5 text-primary" />
                    <span>Attach Supporting Document</span>
                  </label>
                  <div className="flex items-center gap-4">
                    <input
                      type="file"
                      id="file-attachment"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                    <label 
                      htmlFor="file-attachment"
                      className="border border-dashed border-border hover:border-primary/60 bg-secondary/40 hover:bg-secondary/70 p-3 rounded-2xl flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-[0.98] text-xs font-bold text-muted-foreground hover:text-foreground"
                    >
                      <Paperclip className="h-4 w-4" />
                      <span>{attachmentName ? "Change Attachment" : "Choose File"}</span>
                    </label>
                    {attachmentName && (
                      <div className="flex items-center gap-1.5 text-xs text-amber-500 font-semibold bg-amber-500/10 px-3 py-1.5 rounded-xl border border-amber-500/20 max-w-[200px]">
                        <FileText className="h-4 w-4 shrink-0" />
                        <span className="truncate">{attachmentName}</span>
                        <button type="button" onClick={() => setAttachmentName(null)} className="p-0.5 rounded-full hover:bg-amber-500/20">
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 justify-end pt-4 border-t border-border/40">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="border border-border bg-card text-foreground hover:bg-secondary px-5 py-3 rounded-2xl text-xs font-bold transition-all active:scale-95"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="bg-primary text-primary-foreground font-bold px-6 py-3 rounded-2xl text-xs hover:bg-primary/95 transition-all flex items-center gap-1 active:scale-95 cursor-pointer"
                  >
                    <span>{editingTask ? "Save Edits" : "Deploy Task"}</span>
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
