import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import aiRoutes from "./routes/ai";

// Load environment variables
dotenv.config();

const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(cors({ origin: "*" })); // Allow all origins for dev
app.use(express.json());

// Routes
app.use("/api/ai", aiRoutes);

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    timestamp: new Date().toISOString(),
    mode: process.env.GEMINI_API_KEY ? "production" : "mock"
  });
});

// Error handling middleware
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error("Unhandled Backend Error:", err.stack);
  res.status(500).json({
    error: "Internal Server Error",
    message: err.message
  });
});

// Start server
app.listen(port, () => {
  console.log(`Planora AI Server is running on port ${port}`);
  console.log(`AI Integration Mode: ${process.env.GEMINI_API_KEY ? "Google Gemini Live" : "Mock Engine Fallback"}`);
});
