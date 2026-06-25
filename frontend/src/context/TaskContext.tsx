"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { useAuth } from "./AuthContext";
import { db, isFirebaseConfigured } from "../config/firebase";
import { 
  collection, 
  doc, 
  setDoc, 
  addDoc, 
  getDocs, 
  updateDoc, 
  deleteDoc,
  query, 
  where, 
  onSnapshot 
} from "firebase/firestore";

// Task Interface
export interface Task {
  id: string;
  title: string;
  priority: "low" | "medium" | "high" | "critical";
  deadline: string; // ISO String or YYYY-MM-DDTHH:mm
  duration: number; // minutes
  category: string;
  tags: string[];
  completed: boolean;
  notes?: string;
  createdAt: string;
  deleted?: boolean;
}

// Notification Interface
export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  type: "info" | "warning" | "success" | "motivational";
}

// AI Schedule slot
export interface ScheduleSlot {
  time: string;
  taskId: string | null;
  taskTitle: string;
  duration: number;
}

// AI Risk Prediction
export interface RiskPrediction {
  taskId: string;
  title: string;
  riskLevel: "Low" | "Medium" | "High";
  reason: string;
  suggestion: string;
}

// Coach recommendations
export interface CoachData {
  focusTask: string;
  focusTip: string;
  strategy: string;
  motivation: string;
}

// Weekly Insights
export interface WeeklyInsights {
  summary: string;
  peakProductivityHours: string;
  categoryAnalysis: string;
  actionableInsights: string[];
}

interface TaskContextType {
  tasks: Task[];
  categories: string[];
  notifications: NotificationItem[];
  streak: number;
  productivityScore: number;
  theme: "light" | "dark";
  loading: boolean;
  aiRationale: string | null;
  aiSchedule: ScheduleSlot[];
  aiRisks: RiskPrediction[];
  aiCoach: CoachData | null;
  aiInsights: WeeklyInsights | null;
  
  addTask: (task: Omit<Task, "id" | "createdAt" | "completed" | "deleted">) => Promise<Task>;
  updateTask: (id: string, updates: Partial<Task>) => Promise<void>;
  deleteTask: (id: string) => Promise<void>; // soft delete
  restoreTask: (id: string) => Promise<void>;
  duplicateTask: (id: string) => Promise<void>;
  addCategory: (name: string) => void;
  removeCategory: (name: string) => void;
  toggleTheme: () => void;
  markNotificationRead: (id: string) => void;
  clearNotifications: () => void;
  addNotification: (title: string, message: string, type?: NotificationItem["type"]) => void;
  
  // AI Activations
  runAIPrioritization: () => Promise<void>;
  runAIScheduling: () => Promise<void>;
  runAICoach: () => Promise<void>;
  runAIRiskPrediction: () => Promise<void>;
  runAIWeeklyInsights: () => Promise<void>;
  runVoiceCommand: (transcript: string) => Promise<Task>;
}

const TaskContext = createContext<TaskContextType | undefined>(undefined);

const DEFAULT_CATEGORIES = ["Work", "Study", "Personal", "Coding", "Health", "Finance"];

export function TaskProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  
  const [tasks, setTasks] = useState<Task[]>([]);
  const [categories, setCategories] = useState<string[]>(DEFAULT_CATEGORIES);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [streak, setStreak] = useState(0);
  const [productivityScore, setProductivityScore] = useState(0);
  const [theme, setTheme] = useState<"light" | "dark">("dark");
  const [loading, setLoading] = useState(true);

  // AI states
  const [aiRationale, setAiRationale] = useState<string | null>(null);
  const [aiSchedule, setAiSchedule] = useState<ScheduleSlot[]>([]);
  const [aiRisks, setAiRisks] = useState<RiskPrediction[]>([]);
  const [aiCoach, setAiCoach] = useState<CoachData | null>(null);
  const [aiInsights, setAiInsights] = useState<WeeklyInsights | null>(null);

  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5001";

  // Initial Sync
  useEffect(() => {
    // 1. Sync Theme
    const savedTheme = localStorage.getItem("planora_theme") as "light" | "dark" | null;
    if (savedTheme) {
      setTheme(savedTheme);
      document.documentElement.classList.toggle("dark", savedTheme === "dark");
    } else {
      document.documentElement.classList.add("dark"); // Default dark mode
    }

    if (!user) {
      setTasks([]);
      setLoading(false);
      return;
    }

    setLoading(true);

    if (isFirebaseConfigured && db) {
      // Production Mode: Live Firestore Listener
      const q = query(collection(db, "users", user.uid, "tasks"));
      const unsubscribe = onSnapshot(q, (snapshot) => {
        const list: Task[] = [];
        snapshot.forEach((doc) => {
          list.push({ id: doc.id, ...doc.data() } as Task);
        });
        setTasks(list);
        
        // Sync categories
        const catsRef = collection(db, "users", user.uid, "categories");
        getDocs(catsRef).then(catSnapshot => {
          if (catSnapshot.empty) {
            // Seed defaults
            DEFAULT_CATEGORIES.forEach(async (c) => {
              await setDoc(doc(db, "users", user!.uid, "categories", c), { name: c });
            });
            setCategories(DEFAULT_CATEGORIES);
          } else {
            const loadedCats: string[] = [];
            catSnapshot.forEach(d => loadedCats.push(d.id));
            setCategories(loadedCats);
          }
        });

        // Sync streak and score from stats doc
        const statsRef = doc(db, "users", user.uid, "stats", "summary");
        onSnapshot(statsRef, (docSnapshot) => {
          if (docSnapshot.exists()) {
            const data = docSnapshot.data();
            setStreak(data.streak || 0);
            setProductivityScore(data.productivityScore || 0);
          }
        });

        setLoading(false);
      }, (err) => {
        console.error("Firestore sync error:", err);
        setLoading(false);
      });

      return unsubscribe;
    } else {
      // Mock Mode: LocalStorage
      const userTasksKey = `planora_tasks_${user.uid}`;
      const userCatsKey = `planora_categories_${user.uid}`;
      const userStatsKey = `planora_stats_${user.uid}`;
      const userNotifKey = `planora_notifs_${user.uid}`;

      // Load tasks
      const storedTasks = localStorage.getItem(userTasksKey);
      if (storedTasks) {
        setTasks(JSON.parse(storedTasks));
      } else {
        localStorage.setItem(userTasksKey, JSON.stringify([]));
        setTasks([]);
      }

      // Load categories
      const storedCats = localStorage.getItem(userCatsKey);
      if (storedCats) {
        setCategories(JSON.parse(storedCats));
      } else {
        localStorage.setItem(userCatsKey, JSON.stringify(DEFAULT_CATEGORIES));
        setCategories(DEFAULT_CATEGORIES);
      }

      // Load stats
      const storedStats = localStorage.getItem(userStatsKey);
      if (storedStats) {
        const stats = JSON.parse(storedStats);
        setStreak(stats.streak || 0);
        setProductivityScore(stats.productivityScore || 0);
      } else {
        const defaultStats = { streak: 0, productivityScore: 0 };
        localStorage.setItem(userStatsKey, JSON.stringify(defaultStats));
        setStreak(0);
        setProductivityScore(0);
      }

      // Load notifications
      const storedNotifs = localStorage.getItem(userNotifKey);
      if (storedNotifs) {
        setNotifications(JSON.parse(storedNotifs));
      } else {
        const initialNotif: NotificationItem = {
          id: "n_welcome",
          title: "Welcome to Planora AI!",
          message: "Press the voice assistant mic bubble to add your first task using natural speech.",
          timestamp: new Date().toISOString(),
          read: false,
          type: "success"
        };
        localStorage.setItem(userNotifKey, JSON.stringify([initialNotif]));
        setNotifications([initialNotif]);
      }

      setLoading(false);
    }
  }, [user]);

  // Recalculate Productivity Score when tasks change
  useEffect(() => {
    if (tasks.length === 0) {
      setProductivityScore(0);
      setStreak(0);
      if (user && (!isFirebaseConfigured || !db)) {
        localStorage.setItem(`planora_stats_${user.uid}`, JSON.stringify({ streak: 0, productivityScore: 0 }));
      }
      return;
    }
    const activeTasks = tasks.filter(t => !t.deleted);
    if (activeTasks.length === 0) {
      setProductivityScore(0);
      setStreak(0);
      if (user && (!isFirebaseConfigured || !db)) {
        localStorage.setItem(`planora_stats_${user.uid}`, JSON.stringify({ streak: 0, productivityScore: 0 }));
      }
      return;
    }

    const completedTasksList = activeTasks.filter(t => t.completed);
    const completed = completedTasksList.length;
    const completionRatio = completed / activeTasks.length;

    // Calculate overdue penalty
    const nowTime = new Date().getTime();
    const overdueCount = activeTasks.filter(t => !t.completed && new Date(t.deadline).getTime() < nowTime).length;
    const overduePenalty = overdueCount * 8; // -8 points per overdue task

    let score = Math.round((completionRatio * 85) + 15 - overduePenalty);
    score = Math.max(0, Math.min(100, score));

    setProductivityScore(score);

    // Safety check: if no tasks are completed, streak must be 0
    let currentStreak = streak;
    if (completed === 0) {
      currentStreak = 0;
      setStreak(0);
    }

    // Save stats in LocalStorage
    if (user && (!isFirebaseConfigured || !db)) {
      localStorage.setItem(`planora_stats_${user.uid}`, JSON.stringify({ streak: currentStreak, productivityScore: score }));
    }
  }, [tasks, user]);

  // Sync state helpers for mock mode
  const saveMockTasks = (newTasks: Task[]) => {
    if (user) {
      localStorage.setItem(`planora_tasks_${user.uid}`, JSON.stringify(newTasks));
    }
  };

  const toggleTheme = () => {
    const nextTheme = theme === "dark" ? "light" : "dark";
    setTheme(nextTheme);
    localStorage.setItem("planora_theme", nextTheme);
    document.documentElement.classList.toggle("dark", nextTheme === "dark");
  };

  // CRUD Actions
  const addTask = async (taskDetails: Omit<Task, "id" | "createdAt" | "completed" | "deleted">): Promise<Task> => {
    if (!user) throw new Error("No user is signed in.");

    const newTask: Task = {
      ...taskDetails,
      id: `task_${Math.random().toString(36).substring(2, 9)}`,
      createdAt: new Date().toISOString(),
      completed: false,
      deleted: false
    };

    if (isFirebaseConfigured && db) {
      // Firestore Create
      await setDoc(doc(db, "users", user.uid, "tasks", newTask.id), newTask);
    } else {
      // Mock Create
      const list = [...tasks, newTask];
      setTasks(list);
      saveMockTasks(list);
    }

    addNotification("Task Created", `"${newTask.title}" has been successfully scheduled.`, "success");
    return newTask;
  };

  const updateTask = async (id: string, updates: Partial<Task>): Promise<void> => {
    if (!user) throw new Error("No user is signed in.");

    // Trigger celebration confetti if task is completed
    const wasCompletedBefore = tasks.find(t => t.id === id)?.completed;
    if (updates.completed && !wasCompletedBefore) {
      try {
        const confetti = (await import("canvas-confetti")).default;
        confetti({ particleCount: 80, spread: 60, origin: { y: 0.8 } });
      } catch (e) {
        console.log("Confetti deferred:", e);
      }
      
      // Dynamic gamified streak increment
      setStreak(prev => prev + 1);
      addNotification("Streak Expanded!", `Keep going! You've achieved a streak of ${streak + 1} completions!`, "success");
    }

    if (isFirebaseConfigured && db) {
      // Firestore Update
      const taskRef = doc(db, "users", user.uid, "tasks", id);
      await updateDoc(taskRef, updates);
    } else {
      // Mock Update
      const list = tasks.map(t => t.id === id ? { ...t, ...updates } : t);
      setTasks(list);
      saveMockTasks(list);
    }
  };

  const deleteTask = async (id: string): Promise<void> => {
    // Soft delete to support "Restore Deleted Tasks"
    await updateTask(id, { deleted: true });
    addNotification("Task Trashed", "Task moved to trash. You can restore it anytime.", "warning");
  };

  const restoreTask = async (id: string): Promise<void> => {
    await updateTask(id, { deleted: false });
    addNotification("Task Restored", "Task has been recovered successfully.", "success");
  };

  const duplicateTask = async (id: string): Promise<void> => {
    const target = tasks.find(t => t.id === id);
    if (!target) return;
    
    await addTask({
      title: `${target.title} (Copy)`,
      priority: target.priority,
      deadline: target.deadline,
      duration: target.duration,
      category: target.category,
      tags: [...target.tags],
      notes: target.notes
    });
  };

  const addCategory = (name: string) => {
    if (!name.trim()) return;
    const formatted = name.trim();
    if (categories.includes(formatted)) return;
    
    const updated = [...categories, formatted];
    setCategories(updated);

    if (user) {
      if (isFirebaseConfigured && db) {
        setDoc(doc(db, "users", user.uid, "categories", formatted), { name: formatted });
      } else {
        localStorage.setItem(`planora_categories_${user.uid}`, JSON.stringify(updated));
      }
    }
  };

  const removeCategory = (name: string) => {
    const updated = categories.filter(c => c !== name);
    setCategories(updated);

    if (user) {
      if (isFirebaseConfigured && db) {
        deleteDoc(doc(db, "users", user.uid, "categories", name));
      } else {
        localStorage.setItem(`planora_categories_${user.uid}`, JSON.stringify(updated));
      }
    }
  };

  // Notification actions
  const addNotification = (title: string, message: string, type: NotificationItem["type"] = "info") => {
    const newNotif: NotificationItem = {
      id: `notif_${Math.random().toString(36).substring(2, 9)}`,
      title,
      message,
      timestamp: new Date().toISOString(),
      read: false,
      type
    };

    setNotifications(prev => {
      const updated = [newNotif, ...prev];
      if (user && (!isFirebaseConfigured || !db)) {
        localStorage.setItem(`planora_notifs_${user.uid}`, JSON.stringify(updated));
      }
      return updated;
    });

    // Request browser notification API
    if ("Notification" in window && Notification.permission === "granted") {
      new Notification(`Planora AI: ${title}`, { body: message });
    }
  };

  const markNotificationRead = (id: string) => {
    setNotifications(prev => {
      const updated = prev.map(n => n.id === id ? { ...n, read: true } : n);
      if (user && (!isFirebaseConfigured || !db)) {
        localStorage.setItem(`planora_notifs_${user.uid}`, JSON.stringify(updated));
      }
      return updated;
    });
  };

  const clearNotifications = () => {
    setNotifications([]);
    if (user && (!isFirebaseConfigured || !db)) {
      localStorage.setItem(`planora_notifs_${user.uid}`, JSON.stringify([]));
    }
  };

  // AI Server Activations with Client Fallback
  const runAIPrioritization = async () => {
    try {
      const activeTasks = tasks.filter(t => !t.completed && !t.deleted);
      if (activeTasks.length === 0) return;

      const response = await fetch(`${backendUrl}/api/ai/prioritize`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tasks: activeTasks })
      });

      if (!response.ok) throw new Error("Backend response error");
      const data = await response.json();
      
      // Update tasks array ordering in state (based on IDs)
      const sortedIds = data.sortedTasks.map((t: Task) => t.id);
      const remainingTasks = tasks.filter(t => t.completed || t.deleted);
      
      const newOrderedList = [
        ...[...activeTasks].sort((a, b) => sortedIds.indexOf(a.id) - sortedIds.indexOf(b.id)),
        ...remainingTasks
      ];

      setTasks(newOrderedList);
      saveMockTasks(newOrderedList);
      setAiRationale(data.rationale);
      addNotification("Prioritization Matrix Updated", "Gemini prioritized your task queue based on deadline weight constraints.", "success");
    } catch (err) {
      console.warn("Backend prioritizer unreachable. Running local fallback:", err);
      // Local prioritizer logic
      const priorityWeights = { critical: 4, high: 3, medium: 2, low: 1 };
      const now = new Date().getTime();
      const active = tasks.filter(t => !t.completed && !t.deleted);
      const sorted = [...active].sort((a, b) => {
        const aDiff = new Date(a.deadline).getTime() - now;
        const bDiff = new Date(b.deadline).getTime() - now;
        const aScore = (priorityWeights[a.priority] * 20) - (aDiff / (1000 * 60 * 60 * 2));
        const bScore = (priorityWeights[b.priority] * 20) - (bDiff / (1000 * 60 * 60 * 2));
        return bScore - aScore;
      });

      const updatedList = [...sorted, ...tasks.filter(t => t.completed || t.deleted)];
      setTasks(updatedList);
      saveMockTasks(updatedList);
      setAiRationale("[Local Heuristic Engine] Prioritization updated. Focused on closest deadlines and higher priority weights. Fire up the backend for deep Gemini analysis!");
    }
  };

  const runAIScheduling = async () => {
    try {
      const activeTasks = tasks.filter(t => !t.completed && !t.deleted);
      const response = await fetch(`${backendUrl}/api/ai/schedule`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tasks: activeTasks })
      });

      if (!response.ok) throw new Error("Backend response error");
      const data = await response.json();
      setAiSchedule(data);
      addNotification("Daily Planner Generated", "Gemini created a personalized hour-by-hour schedule slotting active tasks.", "info");
    } catch (err) {
      console.warn("Backend scheduler unreachable. Running local fallback:", err);
      // Local Scheduler logic
      const active = tasks.filter(t => !t.completed && !t.deleted);
      const slots: ScheduleSlot[] = [];
      let hour = 9;
      active.slice(0, 4).forEach((t, i) => {
        slots.push({
          time: `${hour === 12 ? 12 : hour % 12}:00 ${hour >= 12 ? "PM" : "AM"}`,
          taskId: t.id,
          taskTitle: t.title,
          duration: t.duration || 60
        });
        hour += 1;
        if (i === 1) {
          slots.push({
            time: `${hour === 12 ? 12 : hour % 12}:00 ${hour >= 12 ? "PM" : "AM"}`,
            taskId: null,
            taskTitle: "☕ Stand & Hydrate Break",
            duration: 15
          });
          hour += 1;
        }
      });
      setAiSchedule(slots.length > 0 ? slots : [{ time: "09:00 AM", taskId: null, taskTitle: "No active tasks. Enjoy a nice break!", duration: 60 }]);
    }
  };

  const runAICoach = async () => {
    try {
      const response = await fetch(`${backendUrl}/api/ai/coach`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tasks: tasks.filter(t => !t.deleted) })
      });

      if (!response.ok) throw new Error("Backend response error");
      const data = await response.json();
      setAiCoach(data);
    } catch (err) {
      console.warn("Backend coach unreachable. Running local fallback:", err);
      const active = tasks.filter(t => !t.completed && !t.deleted);
      if (active.length > 0) {
        setAiCoach({
          focusTask: active[0].title,
          focusTip: "Focus on finishing the first 15% of this task. Small starts build momentum.",
          strategy: "Time-blocking: Dedicate a solid block of 40 minutes to write down the core deliverables.",
          motivation: "Productivity is not about doing everything; it's about doing the right things, one step at a time."
        });
      } else {
        setAiCoach({
          focusTask: "Plan ahead!",
          focusTip: "Create a few tasks for tomorrow to keep your project velocity high.",
          strategy: "Daily Review: Review your calendar and block slots for planning.",
          motivation: "A clean dashboard is the ultimate peace of mind. Excellent job clearing your list!"
        });
      }
    }
  };

  const runAIRiskPrediction = async () => {
    try {
      const activeTasks = tasks.filter(t => !t.completed && !t.deleted);
      const response = await fetch(`${backendUrl}/api/ai/risks`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tasks: activeTasks })
      });

      if (!response.ok) throw new Error("Backend response error");
      const data = await response.json();
      setAiRisks(data);
      if (data.some((r: RiskPrediction) => r.riskLevel === "High")) {
        addNotification("Deadline Risks Detected", "Some high priority tasks have critical deadlines approaching.", "warning");
      }
    } catch (err) {
      console.warn("Backend risk predictor unreachable. Running local fallback:", err);
      const active = tasks.filter(t => !t.completed && !t.deleted);
      const risks: RiskPrediction[] = [];
      const now = new Date().getTime();
      active.forEach(t => {
        const diff = new Date(t.deadline).getTime() - now;
        if (diff > 0 && diff < 1000 * 60 * 60 * 24 && (t.priority === "high" || t.priority === "critical")) {
          risks.push({
            taskId: t.id,
            title: t.title,
            riskLevel: "High",
            reason: "Deadline is less than 24 hours away and task requires focus.",
            suggestion: "Dedicate the next block of time exclusively to this task and silence notifications."
          });
        }
      });
      setAiRisks(risks);
    }
  };

  const runAIWeeklyInsights = async () => {
    try {
      const response = await fetch(`${backendUrl}/api/ai/insights`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tasks })
      });

      if (!response.ok) throw new Error("Backend response error");
      const data = await response.json();
      setAiInsights(data);
    } catch (err) {
      console.warn("Backend analytics unreachable. Running local fallback:", err);
      const total = tasks.filter(t => !t.deleted).length;
      const completed = tasks.filter(t => t.completed && !t.deleted).length;
      setAiInsights({
        summary: `### Local Performance Summary\nYou resolved **${completed} out of ${total}** tasks this week. Keep active to gather more analytics!`,
        peakProductivityHours: "Mondays and Wednesdays, 10:00 AM - 12:00 PM",
        categoryAnalysis: "You complete study tasks quickly, but personal errands and work projects tend to wait in the backlog.",
        actionableInsights: [
          "Set aside 30 minutes on Monday morning to prioritize your top three focus targets.",
          "Clear quick, low-priority tasks (under 15 mins) immediately to reduce cognitive noise.",
          "Use the Pomodoro technique for high-intensity work blocks."
        ]
      });
    }
  };

  const runVoiceCommand = async (transcript: string): Promise<Task> => {
    try {
      const response = await fetch(`${backendUrl}/api/ai/voice`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ transcript })
      });

      if (!response.ok) throw new Error("Backend response error");
      const parsedTask = await response.json();
      
      const createdTask = await addTask({
        title: parsedTask.title || "Voice Captured Task",
        priority: parsedTask.priority || "medium",
        deadline: parsedTask.deadline || new Date(Date.now() + 86400000).toISOString().substring(0, 16),
        duration: parsedTask.duration || 45,
        category: parsedTask.category || "Personal",
        tags: parsedTask.tags || ["voice"],
        notes: parsedTask.notes || `Transcription details: "${transcript}"`
      });

      return createdTask;
    } catch (err) {
      console.warn("Backend voice endpoint unreachable. Local parsing fallback:", err);
      // Run simple frontend parser
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(17, 0, 0, 0);

      const cleanText = transcript.replace(/remind me to/i, "").replace(/schedule/i, "").trim();
      const createdTask = await addTask({
        title: cleanText.charAt(0).toUpperCase() + cleanText.slice(1),
        priority: transcript.includes("urgent") ? "critical" : "medium",
        deadline: tomorrow.toISOString().substring(0, 16),
        duration: 60,
        category: "Personal",
        tags: ["voice", "local-parse"],
        notes: `Speech-to-text text: "${transcript}"`
      });
      return createdTask;
    }
  };

  return (
    <TaskContext.Provider
      value={{
        tasks,
        categories,
        notifications,
        streak,
        productivityScore,
        theme,
        loading,
        aiRationale,
        aiSchedule,
        aiRisks,
        aiCoach,
        aiInsights,
        addTask,
        updateTask,
        deleteTask,
        restoreTask,
        duplicateTask,
        addCategory,
        removeCategory,
        toggleTheme,
        markNotificationRead,
        clearNotifications,
        addNotification,
        runAIPrioritization,
        runAIScheduling,
        runAICoach,
        runAIRiskPrediction,
        runAIWeeklyInsights,
        runVoiceCommand
      }}
    >
      {children}
    </TaskContext.Provider>
  );
}

export function useTasks() {
  const context = useContext(TaskContext);
  if (context === undefined) {
    throw new Error("useTasks must be used within a TaskProvider");
  }
  return context;
}
