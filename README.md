# Planora AI - Intelligent Productivity Companion

Planora AI is an intelligent productivity SaaS companion that helps students, professionals, and entrepreneurs plan, prioritize, and execute their tasks before deadlines. Using the power of the **Google Gemini 1.5 Flash API**, Planora AI goes beyond basic to-do lists by analyzing user workloads, generating optimized daily agendas, flagging overdue risks, and scheduling tasks automatically via **natural voice speech**.

---

## Key Features

1. **AI Smart Prioritization**: Re-orders your tasks in real-time by weighing deadline proximity, priority levels, and duration.
2. **AI Daily Planner**: Creates hour-by-hour schedules starting at 9 AM, automatically inserting stretch breaks and lunch periods.
3. **AI Deadline Risk Prediction**: Flags tasks likely to miss deadlines, details the risk reason, and suggests a strategic solution.
4. **AI Weekly Insights**: Highlights peak focus hours, category-specific backlog velocity, and actionable advice to improve efficiency.
5. **Built-in Voice Assistant**: Speaks naturally to schedule. For example: *"Remind me to complete coding practice tomorrow at 5 PM."* Uses Web Speech recognition and a Gemini NLP parser.
6. **Interactive Calendar Workspace**: Month, Week, and Day timeline agendas with quick schedule block creation.
7. **Performance Analytics Dashboard**: Recharts-powered graphs tracking completion velocity, priority density, and unlockable gamified badges.
8. **Responsive Light & Dark Modes**: Modern glassmorphic interfaces designed for desktop, tablet, and mobile screens.

---

## Dual-Mode System Architecture

To guarantee the application is instantly testable out of the box, we implemented a **Dual-Mode System**:
- **Mock Mode (Default Fallback)**: Runs entirely on local storage databases, simulated auth validation (any email works with a 6-character password), and client-side heuristic engines. Triggered automatically if environment configuration variables are absent.
- **Production Mode**: Hooks up to live Firebase Authentication, Firestore databases, and the Google Gemini API once environment configuration keys are added.

---

## Tech Stack

- **Frontend**: Next.js 16 (App Router), React 19, Tailwind CSS v4, TypeScript, Recharts, Framer Motion, Canvas Confetti, Firebase Client SDK.
- **Backend API**: Node.js, Express, TypeScript, Google Generative AI SDK (`@google/generative-ai`), Firebase Admin SDK.
- **Database / Auth**: Firebase Firestore & Firebase Auth.

---

## Setup & Running Locally

### Step 1: Install Dependencies
Run the helper installer script in the root directory. This automatically executes `npm install` in the root, frontend, and backend folders:
```bash
npm run install-all
```

### Step 2: Set Environment Variables (Optional for Production Mode)
Create `.env` files in both the `backend/` and `frontend/` subfolders based on the templates:

**Backend (`backend/.env`)**
```env
PORT=5000
GEMINI_API_KEY=your_google_gemini_api_key_here
```

**Frontend (`frontend/.env`)**
```env
NEXT_PUBLIC_BACKEND_URL=http://localhost:5000
NEXT_PUBLIC_FIREBASE_API_KEY=your-firebase-api-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-firebase-auth-domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-firebase-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-firebase-storage-bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-firebase-sender-id
NEXT_PUBLIC_FIREBASE_APP_ID=your-firebase-app-id
```
*(If you leave these variables blank, the monorepo boots in Mock Mode automatically).*

### Step 3: Run Concurrently
Boot the Express API server (on port 5000) and the Next.js frontend (on port 3000) concurrently using:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Quick Testing Instructions (Reviewers Guide)
1. When you load the login screen, click **"Quick Guest Login (Bypass Auth)"** to sign in instantly with a test account.
2. The dashboard will seed mock tasks representing overdue, critical, and completed statuses.
3. Click the floating microphone bubble in the bottom right corner. Grant microphone permissions, press the red mic button, and speak: *"Remind me to draft client presentation tomorrow at 5 PM"* or type it in the text box. The voice parser will construct and create a new task.
4. Click **"AI Prioritize"** or **"AI Generate Schedule"** to see Planora's intelligence optimize your agenda.
