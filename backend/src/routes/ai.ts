import { Router, Request, Response } from "express";
import {
  prioritizeTasks,
  generateDailySchedule,
  getCoachRecommendations,
  predictDeadlineRisks,
  generateWeeklyInsights,
  parseVoiceCommand
} from "../services/gemini";

const router = Router();

/**
 * Route: POST /api/ai/prioritize
 * Prioritizes a list of tasks using AI.
 */
router.post("/prioritize", async (req: Request, res: Response) => {
  try {
    const { tasks } = req.body;
    if (!Array.isArray(tasks)) {
      return res.status(400).json({ error: "Missing tasks array in request body." });
    }
    const result = await prioritizeTasks(tasks);
    res.json(result);
  } catch (error: any) {
    console.error("AI Prioritize Route Error:", error);
    res.status(500).json({ error: "Failed to prioritize tasks", message: error.message });
  }
});

/**
 * Route: POST /api/ai/schedule
 * Generates an hour-by-hour schedule slotting active tasks.
 */
router.post("/schedule", async (req: Request, res: Response) => {
  try {
    const { tasks } = req.body;
    if (!Array.isArray(tasks)) {
      return res.status(400).json({ error: "Missing tasks array in request body." });
    }
    const schedule = await generateDailySchedule(tasks);
    res.json(schedule);
  } catch (error: any) {
    console.error("AI Schedule Route Error:", error);
    res.status(500).json({ error: "Failed to generate schedule", message: error.message });
  }
});

/**
 * Route: POST /api/ai/coach
 * Returns strategic tips and focus advice.
 */
router.post("/coach", async (req: Request, res: Response) => {
  try {
    const { tasks } = req.body;
    if (!Array.isArray(tasks)) {
      return res.status(400).json({ error: "Missing tasks array in request body." });
    }
    const coachRecommendations = await getCoachRecommendations(tasks);
    res.json(coachRecommendations);
  } catch (error: any) {
    console.error("AI Coach Route Error:", error);
    res.status(500).json({ error: "Failed to get coach recommendations", message: error.message });
  }
});

/**
 * Route: POST /api/ai/risks
 * Predicts deadline completion risks.
 */
router.post("/risks", async (req: Request, res: Response) => {
  try {
    const { tasks } = req.body;
    if (!Array.isArray(tasks)) {
      return res.status(400).json({ error: "Missing tasks array in request body." });
    }
    const risks = await predictDeadlineRisks(tasks);
    res.json(risks);
  } catch (error: any) {
    console.error("AI Risks Route Error:", error);
    res.status(500).json({ error: "Failed to predict deadline risks", message: error.message });
  }
});

/**
 * Route: POST /api/ai/insights
 * Generates weekly analytics review.
 */
router.post("/insights", async (req: Request, res: Response) => {
  try {
    const { tasks } = req.body;
    if (!Array.isArray(tasks)) {
      return res.status(400).json({ error: "Missing tasks array in request body." });
    }
    const insights = await generateWeeklyInsights(tasks);
    res.json(insights);
  } catch (error: any) {
    console.error("AI Insights Route Error:", error);
    res.status(500).json({ error: "Failed to generate weekly insights", message: error.message });
  }
});

/**
 * Route: POST /api/ai/voice
 * Processes speech-to-text transcript and converts it into structured task attributes.
 */
router.post("/voice", async (req: Request, res: Response) => {
  try {
    const { transcript } = req.body;
    if (typeof transcript !== "string" || !transcript.trim()) {
      return res.status(400).json({ error: "Missing transcript text string in request body." });
    }
    const taskDetails = await parseVoiceCommand(transcript);
    res.json(taskDetails);
  } catch (error: any) {
    console.error("AI Voice Route Error:", error);
    res.status(500).json({ error: "Failed to process voice command", message: error.message });
  }
});

export default router;
