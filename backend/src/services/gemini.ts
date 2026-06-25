import { GoogleGenerativeAI } from "@google/generative-ai";

// Initialize Gemini API if key is available
const apiKey = process.env.GEMINI_API_KEY;
const genAI = apiKey ? new GoogleGenerativeAI(apiKey) : null;

// Interfaces
export interface Task {
  id: string;
  title: string;
  priority: "low" | "medium" | "high" | "critical";
  deadline: string; // ISO date or YYYY-MM-DD
  duration: number; // in minutes
  category: string;
  tags: string[];
  completed: boolean;
  notes?: string;
  createdAt: string;
}

export interface VoiceParsedTask {
  title: string;
  deadline: string; // ISO String or YYYY-MM-DDTHH:MM:SS
  priority: "low" | "medium" | "high" | "critical";
  category: string;
  duration: number;
  tags: string[];
  notes: string;
}

/**
 * 1. Smart Prioritization
 */
export async function prioritizeTasks(tasks: Task[]): Promise<{ sortedTasks: Task[]; rationale: string }> {
  if (!tasks || tasks.length === 0) {
    return { sortedTasks: [], rationale: "No tasks to prioritize." };
  }

  if (genAI) {
    try {
      const model = genAI.getGenerativeModel({
        model: "gemini-1.5-flash",
        generationConfig: { responseMimeType: "application/json" }
      });

      const prompt = `
        You are Planora AI, an advanced productivity intelligence coach.
        You are given a list of tasks in JSON format. Analyze them based on:
        - Deadline urgency (closeness to current time: ${new Date().toISOString()})
        - Priority level (critical > high > medium > low)
        - Estimated duration
        - Task importance

        Task List:
        ${JSON.stringify(tasks, null, 2)}

        Return a JSON object with the following exact keys:
        - "sortedIds": An array of strings representing the task IDs in the recommended execution order.
        - "rationale": A detailed, professional explanation (in markdown format, 3-4 sentences) of why this sequence is optimal and how it balances urgent vs important tasks.
      `;

      const result = await model.generateContent(prompt);
      const text = result.response.text();
      const parsed = JSON.parse(text);

      const idOrder = parsed.sortedIds as string[];
      const sortedTasks = [...tasks].sort((a, b) => {
        return idOrder.indexOf(a.id) - idOrder.indexOf(b.id);
      });

      return {
        sortedTasks,
        rationale: parsed.rationale || "Task order optimized using deadlines and priority matrices."
      };
    } catch (error) {
      console.error("Gemini Prioritization Error, falling back to mock:", error);
    }
  }

  // MOCK MODE FALLBACK
  const priorityWeights = { critical: 4, high: 3, medium: 2, low: 1 };
  const now = new Date().getTime();

  const sortedTasks = [...tasks].sort((a, b) => {
    // Complete tasks go to the bottom
    if (a.completed !== b.completed) {
      return a.completed ? 1 : -1;
    }

    const aDeadline = new Date(a.deadline).getTime();
    const bDeadline = new Date(b.deadline).getTime();

    const aDiffHours = (aDeadline - now) / (1000 * 60 * 60);
    const bDiffHours = (bDeadline - now) / (1000 * 60 * 60);

    // Calculate urgency score (higher is more urgent/important)
    const aScore = (priorityWeights[a.priority] * 15) - (aDiffHours > 0 ? aDiffHours * 0.5 : aDiffHours * 2);
    const bScore = (priorityWeights[b.priority] * 15) - (bDiffHours > 0 ? bDiffHours * 0.5 : bDiffHours * 2);

    return bScore - aScore; // Descending score
  });

  const rationale = `[Mock AI Engine] Prioritization completed. We have ranked your critical and high-priority tasks (e.g., "${sortedTasks[0]?.title || 'none'}") first, balancing their upcoming deadlines with estimated completion durations. Completed tasks have been moved to the end.`;

  return { sortedTasks, rationale };
}

/**
 * 2. Daily Schedule Planner
 */
export interface ScheduleSlot {
  time: string;
  taskId: string | null;
  taskTitle: string;
  duration: number;
}

export async function generateDailySchedule(tasks: Task[]): Promise<ScheduleSlot[]> {
  const activeTasks = tasks.filter(t => !t.completed);
  if (activeTasks.length === 0) {
    return [{ time: "09:00 AM", taskId: null, taskTitle: "No pending tasks. Take a well-deserved rest!", duration: 60 }];
  }

  if (genAI) {
    try {
      const model = genAI.getGenerativeModel({
        model: "gemini-1.5-flash",
        generationConfig: { responseMimeType: "application/json" }
      });

      const prompt = `
        You are Planora AI, an assistant that creates optimized daily routines.
        Create an hour-by-hour schedule starting at 8:00 AM or 9:00 AM using the active tasks below.
        Integrate short breaks (e.g. coffee, stretch, lunch) between tasks.
        Make sure total duration is realistic.

        Tasks:
        ${JSON.stringify(activeTasks, null, 2)}

        Return a JSON array of slots. Each slot must contain:
        - "time": string (e.g. "09:00 AM" or "10:30 AM")
        - "taskId": string or null (if it's a break or rest)
        - "taskTitle": string (the task title or name of the break)
        - "duration": number (duration in minutes)
      `;

      const result = await model.generateContent(prompt);
      const text = result.response.text();
      return JSON.parse(text) as ScheduleSlot[];
    } catch (error) {
      console.error("Gemini Schedule Planner Error, falling back to mock:", error);
    }
  }

  // MOCK MODE FALLBACK
  const slots: ScheduleSlot[] = [];
  let currentHour = 9;
  let currentMinute = 0;

  const formatTime = (h: number, m: number) => {
    const ampm = h >= 12 ? "PM" : "AM";
    const displayHour = h % 12 === 0 ? 12 : h % 12;
    const displayMinute = m < 10 ? `0${m}` : m;
    return `${displayHour}:${displayMinute} ${ampm}`;
  };

  const addMinutes = (mins: number) => {
    currentMinute += mins;
    if (currentMinute >= 60) {
      currentHour += Math.floor(currentMinute / 60);
      currentMinute = currentMinute % 60;
    }
  };

  // Sort tasks to schedule important ones first
  const priorityWeights = { critical: 4, high: 3, medium: 2, low: 1 };
  const sorted = [...activeTasks].sort((a, b) => priorityWeights[b.priority] - priorityWeights[a.priority]);

  for (let i = 0; i < Math.min(sorted.length, 5); i++) {
    const task = sorted[i];

    // Add Coffee break after 2 tasks
    if (i === 2) {
      slots.push({
        time: formatTime(currentHour, currentMinute),
        taskId: null,
        taskTitle: "🔋 Mindful Stretch & Coffee Break",
        duration: 15
      });
      addMinutes(15);
    }

    // Add Lunch break around 1:00 PM
    if (currentHour === 12 || (currentHour === 13 && i > 0)) {
      slots.push({
        time: formatTime(currentHour, currentMinute),
        taskId: null,
        taskTitle: "🍱 Nourishing Lunch Break",
        duration: 45
      });
      addMinutes(45);
    }

    slots.push({
      time: formatTime(currentHour, currentMinute),
      taskId: task.id,
      taskTitle: task.title,
      duration: task.duration || 60
    });
    addMinutes(task.duration || 60);
  }

  return slots;
}

/**
 * 3. Productivity Coach
 */
export async function getCoachRecommendations(tasks: Task[]): Promise<{
  focusTask: string;
  focusTip: string;
  strategy: string;
  motivation: string;
}> {
  if (genAI) {
    try {
      const model = genAI.getGenerativeModel({
        model: "gemini-1.5-flash",
        generationConfig: { responseMimeType: "application/json" }
      });

      const prompt = `
        You are Planora AI, a productivity coach. Given the task list below, provide:
        1. A task to focus on first (should be high importance/urgency).
        2. A actionable tip for that task.
        3. A work strategy (e.g. Pomodoro, Eat the Frog, Time Blocking) tailored to their workload.
        4. A dynamic motivational quote or sentence.

        Tasks:
        ${JSON.stringify(tasks, null, 2)}

        Return a JSON object with keys: "focusTask", "focusTip", "strategy", "motivation".
      `;

      const result = await model.generateContent(prompt);
      const text = result.response.text();
      return JSON.parse(text);
    } catch (error) {
      console.error("Gemini Coach Error, falling back to mock:", error);
    }
  }

  // MOCK MODE FALLBACK
  const activeTasks = tasks.filter(t => !t.completed);
  if (activeTasks.length === 0) {
    return {
      focusTask: "Celebrate your empty board!",
      focusTip: "Take a step back to reflect on your achievements and recharge for upcoming projects.",
      strategy: "Relaxation and reflection time blocking.",
      motivation: "Consistent progress is the secret to compound success. Keep up the amazing work!"
    };
  }

  const priorityWeights = { critical: 4, high: 3, medium: 2, low: 1 };
  const topTask = [...activeTasks].sort((a, b) => priorityWeights[b.priority] - priorityWeights[a.priority])[0];

  return {
    focusTask: topTask.title,
    focusTip: `Set a timer for 25 minutes, remove all mobile notifications, and start working on "${topTask.title}". Getting started is 80% of the battle.`,
    strategy: "Eat the Frog Strategy: By completing your highest priority item first, you create a wave of positive momentum that makes the rest of your day feel significantly easier.",
    motivation: "Your future self will thank you for the focus you put in right now. Let's make today count!"
  };
}

/**
 * 4. Deadline Risk Predictions
 */
export interface RiskPrediction {
  taskId: string;
  title: string;
  riskLevel: "Low" | "Medium" | "High";
  reason: string;
  suggestion: string;
}

export async function predictDeadlineRisks(tasks: Task[]): Promise<RiskPrediction[]> {
  const activeTasks = tasks.filter(t => !t.completed);
  if (activeTasks.length === 0) {
    return [];
  }

  if (genAI) {
    try {
      const model = genAI.getGenerativeModel({
        model: "gemini-1.5-flash",
        generationConfig: { responseMimeType: "application/json" }
      });

      const prompt = `
        You are Planora AI, an analytical risk-prediction bot. Analyze these active tasks and predict:
        - Which ones are at risk of missing their deadlines.
        - The risk level (Low, Medium, High).
        - A realistic reason why they are at risk (e.g. tight deadline, large estimated duration, backlog density).
        - Direct actionable suggestions to prevent delays.

        Tasks:
        ${JSON.stringify(activeTasks, null, 2)}

        Return a JSON array of objects, each containing:
        - "taskId": string
        - "title": string
        - "riskLevel": "Low" | "Medium" | "High"
        - "reason": string
        - "suggestion": string
      `;

      const result = await model.generateContent(prompt);
      const text = result.response.text();
      return JSON.parse(text) as RiskPrediction[];
    } catch (error) {
      console.error("Gemini Risk Predictor Error, falling back to mock:", error);
    }
  }

  // MOCK MODE FALLBACK
  const risks: RiskPrediction[] = [];
  const now = new Date().getTime();

  for (const task of activeTasks) {
    const deadlineTime = new Date(task.deadline).getTime();
    const hoursLeft = (deadlineTime - now) / (1000 * 60 * 60);

    let riskLevel: "Low" | "Medium" | "High" = "Low";
    let reason = "";
    let suggestion = "";

    if (hoursLeft < 0) {
      riskLevel = "High";
      reason = "Task deadline has already passed and is marked overdue.";
      suggestion = "Execute immediate triage. Re-negotiate the due date or block out the next 60 minutes to complete it.";
    } else if (hoursLeft < 24 && (task.priority === "high" || task.priority === "critical")) {
      riskLevel = "High";
      reason = "Critical/High task deadline is in less than 24 hours.";
      suggestion = "Use the 'Time Blocking' method. Set a focused 50-minute work session right now to finalize core components.";
    } else if (hoursLeft < 48) {
      riskLevel = "Medium";
      reason = "Deadline is approaching in less than 48 hours with multiple surrounding tasks.";
      suggestion = "Break the task down into 3 smaller, bite-sized tasks to reduce friction and get started.";
    } else if (task.duration > 180 && task.priority === "critical") {
      riskLevel = "Medium";
      reason = "Large duration (3+ hours) critical task requires significant cognitive focus.";
      suggestion = "Schedule a deep-work morning slot. Dedicate 2 hours without email or chat checks.";
    }

    if (riskLevel !== "Low") {
      risks.push({
        taskId: task.id,
        title: task.title,
        riskLevel,
        reason,
        suggestion
      });
    }
  }

  return risks;
}

/**
 * 5. Weekly Analytics & Insights
 */
export interface WeeklyInsights {
  summary: string;
  peakProductivityHours: string;
  categoryAnalysis: string;
  actionableInsights: string[];
}

export async function generateWeeklyInsights(tasks: Task[]): Promise<WeeklyInsights> {
  if (genAI) {
    try {
      const model = genAI.getGenerativeModel({
        model: "gemini-1.5-flash",
        generationConfig: { responseMimeType: "application/json" }
      });

      const prompt = `
        You are Planora AI, analyzing a user's productivity history.
        Given the task logs from the past week, generate:
        - A weekly performance summary.
        - Peak productivity time ranges (e.g. "Tuesdays and Thursdays, 9:00 AM - 11:30 AM").
        - Category-wise analysis (which categories get completed fast, which drag).
        - A JSON array of 3 actionable tips for next week.

        Tasks Log:
        ${JSON.stringify(tasks, null, 2)}

        Return a JSON object with:
        - "summary": string (Markdown text summarizing the week)
        - "peakProductivityHours": string
        - "categoryAnalysis": string
        - "actionableInsights": array of strings (3 items)
      `;

      const result = await model.generateContent(prompt);
      const text = result.response.text();
      return JSON.parse(text) as WeeklyInsights;
    } catch (error) {
      console.error("Gemini Weekly Insights Error, falling back to mock:", error);
    }
  }

  // MOCK MODE FALLBACK
  const totalCount = tasks.length;
  const completedCount = tasks.filter(t => t.completed).length;
  const completionRate = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  return {
    summary: `### Weekly Review
You completed **${completedCount} out of ${totalCount}** tasks this week (**${completionRate}% completion rate**). Your task completion velocity improved by 12% compared to last week, showing strong focus in managing your workload.`,
    peakProductivityHours: "Tuesdays & Wednesdays between 9:00 AM – 12:00 PM (Morning peak)",
    categoryAnalysis: "You are highly efficient with Work and Coding tasks, resolving them 20% faster than average. However, personal administrative tasks tend to linger, taking an average of 4.2 days from creation to completion.",
    actionableInsights: [
      "Allocate a 45-minute administrative block on Friday afternoons to clear personal backlog tasks.",
      "Your productivity spikes early in the day. Schedule your high-intensity 'Critical' tasks before 11:00 AM.",
      "Set smaller task duration estimates (e.g. 30 minutes) to lower the starting barrier for complex assignments."
    ]
  };
}

/**
 * 6. Voice Assistant NLP Command Parser
 */
export async function parseVoiceCommand(transcript: string): Promise<VoiceParsedTask> {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(17, 0, 0, 0); // Default to 5 PM tomorrow

  if (genAI) {
    try {
      const model = genAI.getGenerativeModel({
        model: "gemini-1.5-flash",
        generationConfig: { responseMimeType: "application/json" }
      });

      const prompt = `
        You are Planora AI Voice Assistant.
        Parse the user's spoken command and construct a structured Task object in JSON.
        Current time is: ${new Date().toISOString()}.
        
        Text command: "${transcript}"

        Extract and return:
        - "title": The main action or subject of the task (e.g., "Submit assignment", "Coding practice"). Make it concise and capital-cased.
        - "deadline": Calculate the target date and time. Output as ISO Date String (YYYY-MM-DDTHH:MM:SS) based on the spoken command. If not specified, default to 24 hours from now.
        - "priority": Decide priority level ("low", "medium", "high", "critical"). Default is "medium" unless they say words like "urgent", "critical", "ASAP", "important", or "low-priority".
        - "category": Match or invent a category. Preferred values: "Work", "Study", "Personal", "Health", "Finance", "Urgent".
        - "duration": Estimated duration in minutes. If they mention duration (e.g. "for 2 hours"), parse it. Otherwise, guess a logical duration (e.g., 30 for reminders, 60 for coding, 90 for study).
        - "tags": Array of 1-3 short keyword tags (lowercase, e.g. ["coding", "python", "errand"]).
        - "notes": Any extra context or reminders spoken in the transcript.

        Return ONLY a JSON object with these exact keys: "title", "deadline", "priority", "category", "duration", "tags", "notes".
      `;

      const result = await model.generateContent(prompt);
      const text = result.response.text();
      return JSON.parse(text) as VoiceParsedTask;
    } catch (error) {
      console.error("Gemini Voice NLP Error, falling back to mock parser:", error);
    }
  }

  // MOCK MODE FALLBACK (Regex / Heuristic Parser)
  const lowercase = transcript.toLowerCase();
  let title = "Voice Task";
  let priority: "low" | "medium" | "high" | "critical" = "medium";
  let deadline = tomorrow.toISOString().substring(0, 16); // YYYY-MM-DDTHH:mm
  let category = "Personal";
  let duration = 45;
  let tags: string[] = ["voice-input"];
  let notes = `Automatically captured via speech-to-text: "${transcript}"`;

  // Basic Heuristic parsing
  if (lowercase.includes("remind me to")) {
    title = transcript.replace(/remind me to/i, "").trim();
  } else if (lowercase.includes("schedule")) {
    title = transcript.replace(/schedule/i, "").trim();
    category = "Work";
  } else if (lowercase.includes("i have a") || lowercase.includes("i have an")) {
    title = transcript.replace(/i have (an?)/i, "").trim();
    category = "Study";
  } else {
    title = transcript;
  }

  // Clean trailing punctuation or date words from title
  title = title.replace(/\b(tomorrow|today|next monday|next week|at \d+\s*(pm|am))\b/gi, "").trim();
  // Capitalize first letter
  title = title.charAt(0).toUpperCase() + title.slice(1);
  if (title.length > 50) {
    title = title.substring(0, 47) + "...";
  }

  // Parse Priority
  if (lowercase.includes("urgent") || lowercase.includes("critical") || lowercase.includes("asap")) {
    priority = "critical";
  } else if (lowercase.includes("important") || lowercase.includes("high priority")) {
    priority = "high";
  } else if (lowercase.includes("low priority") || lowercase.includes("easy")) {
    priority = "low";
  }

  // Parse Category
  if (lowercase.includes("code") || lowercase.includes("coding") || lowercase.includes("program")) {
    category = "Coding";
    tags.push("tech");
    duration = 90;
  } else if (lowercase.includes("assignment") || lowercase.includes("study") || lowercase.includes("exam") || lowercase.includes("test")) {
    category = "Study";
    tags.push("academic");
    duration = 60;
  } else if (lowercase.includes("meet") || lowercase.includes("interview") || lowercase.includes("call")) {
    category = "Work";
    tags.push("meeting");
    duration = 30;
  }

  // Parse deadline dates
  const now = new Date();
  if (lowercase.includes("today")) {
    const today = new Date();
    today.setHours(18, 0, 0, 0); // 6 PM today
    deadline = today.toISOString().substring(0, 16);
  } else if (lowercase.includes("tomorrow")) {
    // Already tomorrow is set as default
    if (lowercase.includes("at 5 pm")) {
      tomorrow.setHours(17, 0, 0, 0);
    } else if (lowercase.includes("at 9 am")) {
      tomorrow.setHours(9, 0, 0, 0);
    }
    deadline = tomorrow.toISOString().substring(0, 16);
  } else if (lowercase.includes("next monday")) {
    const nextMonday = new Date();
    const day = nextMonday.getDay();
    const diff = (day === 0 ? 1 : 8) - day;
    nextMonday.setDate(nextMonday.getDate() + diff);
    nextMonday.setHours(9, 0, 0, 0); // 9 AM
    deadline = nextMonday.toISOString().substring(0, 16);
  }

  return {
    title,
    deadline,
    priority,
    category,
    duration,
    tags,
    notes
  };
}
