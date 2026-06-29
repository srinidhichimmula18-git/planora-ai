# 🚀 Planora AI – Intelligent Productivity Companion

Planora AI is an AI-powered productivity platform that helps students, professionals, and entrepreneurs plan, prioritize, and accomplish tasks before deadlines. Powered by **Google Gemini 1.5 Flash**, it intelligently analyzes workloads, generates optimized schedules, predicts deadline risks, and assists users through natural language voice commands.

---

## 🌟 Overview

Traditional task managers only store tasks—they don't help users decide **what should be done next**.

Planora AI solves this problem by combining artificial intelligence with modern productivity tools to help users:

- Prioritize tasks intelligently
- Create optimized daily schedules
- Predict deadline risks
- Analyze productivity patterns
- Manage work using natural voice commands

---

# ✨ Features

## 🤖 AI Smart Prioritization

Automatically reorders tasks based on:

- Deadline proximity
- Priority level
- Estimated duration
- Current workload

---

## 📅 AI Daily Planner

Creates an optimized day schedule beginning at **9:00 AM**, automatically including:

- Focus sessions
- Short breaks
- Lunch breaks
- Balanced workload distribution

Example:

```
09:00 AM  Coding Practice
10:30 AM  AI Assignment
12:30 PM  Lunch Break
01:30 PM  Project Development
03:30 PM  Revision
```

---

## ⚠️ AI Deadline Risk Prediction

Identifies tasks that are likely to miss deadlines.

Provides:

- Risk Level
- Reason
- Suggested Solution
- Priority Recommendation

---

## 📈 AI Weekly Insights

Displays intelligent analytics including:

- Weekly productivity
- Peak focus hours
- Category performance
- Completion trends
- Personalized recommendations

---

## 🎤 Voice Assistant

Create tasks naturally using speech.

Example:

> "Remind me to complete coding practice tomorrow at 5 PM."

Uses:

- Web Speech API
- Google Gemini NLP

---

## 📆 Interactive Calendar

Supports:

- Month View
- Week View
- Day View
- Timeline Scheduling
- Quick Task Creation

---

## 📊 Analytics Dashboard

Interactive charts built using **Recharts**

Includes:

- Task completion rate
- Priority distribution
- Productivity graphs
- Category statistics
- Achievement badges

---

## 🌙 Modern UI

- Responsive Design
- Mobile Friendly
- Glassmorphism UI
- Dark Mode
- Light Mode
- Smooth Animations

---

# 🏗 Architecture

```
                  User
                    │
                    ▼
      Next.js Frontend (React)
                    │
                    ▼
        Express.js Backend API
                    │
        ┌───────────┴───────────┐
        ▼                       ▼
 Google Gemini API       Firebase Services
                     (Auth & Firestore)
```

---

# ⚙ Dual Mode Architecture

## Mock Mode

Runs automatically when API keys are unavailable.

Features:

- Local Storage Database
- Mock Authentication
- Simulated AI Responses
- Offline Testing

---

## Production Mode

Runs with:

- Firebase Authentication
- Firebase Firestore
- Google Gemini API
- Live Cloud Database

---

# 🛠 Tech Stack

## Frontend

- Next.js 16
- React 19
- TypeScript
- Tailwind CSS v4
- Framer Motion
- Recharts
- Canvas Confetti

---

## Backend

- Node.js
- Express.js
- TypeScript
- Google Generative AI SDK
- Firebase Admin SDK

---

## Database

- Firebase Firestore

---

## Authentication

- Firebase Authentication

---

## Artificial Intelligence

- Google Gemini 1.5 Flash API

---

# ☁ Google Technologies Used

- Google Gemini 1.5 Flash API
- Google AI Studio
- Firebase Authentication
- Firebase Firestore
- Google Cloud

---

# 📂 Project Structure

```
Planora-AI
│
├── frontend
│   ├── app
│   ├── components
│   ├── hooks
│   ├── lib
│   └── public
│
├── backend
│   ├── src
│   ├── routes
│   ├── services
│   └── middleware
│
├── package.json
├── README.md
└── .gitignore
```

---

# 🚀 Installation

## Clone Repository

```bash
git clone https://github.com/srinidhichimmula18-git/planora-ai.git

cd planora-ai
```

---

## Install Dependencies

```bash
npm run install-all
```

---

## Backend Environment Variables

Create:

```
backend/.env
```

```env
PORT=5001

GEMINI_API_KEY=your_google_gemini_api_key
```

---

## Frontend Environment Variables

Create:

```
frontend/.env
```

```env
NEXT_PUBLIC_BACKEND_URL=http://localhost:5001

NEXT_PUBLIC_FIREBASE_API_KEY=

NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=

NEXT_PUBLIC_FIREBASE_PROJECT_ID=

NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=

NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=

NEXT_PUBLIC_FIREBASE_APP_ID=
```

If environment variables are not provided, Planora AI automatically starts in **Mock Mode**.

---

## Run the Application

```bash
npm run dev
```

Open:

```
http://localhost:3000
```

---

# 🧪 Quick Testing Guide

1. Open the application.

2. Click **Quick Guest Login**.

3. Create a few tasks.

4. Click **AI Prioritize**.

5. Click **Generate Schedule**.

6. Test the Voice Assistant.

7. Explore Calendar.

8. View Analytics Dashboard.

---

# 📸 Screenshots

Add screenshots here.

Suggested screenshots:

- Home Page
- Dashboard
- Calendar
- AI Planner
- Voice Assistant
- Analytics

---

# 🔒 Security

- Environment variables protected using `.gitignore`
- API keys are never committed
- Firebase Authentication secures users
- Backend validates incoming requests

---

# 🚀 Future Improvements

- Google Calendar Integration
- Email Notifications
- Team Collaboration
- AI Meeting Scheduler
- Mobile App
- Push Notifications
- Multi-language Support

---

# 👨‍💻 Author

**Srinidhi Chimmula**

GitHub:
https://github.com/srinidhichimmula18-git

---

## ⭐ Support

If you found this project useful, consider giving it a ⭐ on GitHub.
