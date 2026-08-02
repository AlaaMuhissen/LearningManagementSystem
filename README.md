# 🚀 CodeQuest

**Learn to code by actually coding — not by reading about it.**

CodeQuest is a full-stack learning management system built for young coders (ages 10–18) to learn HTML, CSS, JavaScript, and Python through interactive, gamified challenges — with an AI tutor in their corner and a teacher dashboard that actually shows what's working.

**[🎮 Live Demo →](https://learning-management-system-xr3x.vercel.app/)**

![React](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-Build-646CFF?logo=vite&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-Express-339933?logo=node.js&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Database-4169E1?logo=postgresql&logoColor=white)
![Firebase](https://img.shields.io/badge/Firebase-Auth-FFCA28?logo=firebase&logoColor=black)
![Gemini](https://img.shields.io/badge/Gemini_API-AI-8E75B2?logo=googlegemini&logoColor=white)
![MUI](https://img.shields.io/badge/MUI-Components-007FFF?logo=mui&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/Tailwind-CSS-06B6D4?logo=tailwindcss&logoColor=white)

---

<!--
  📸 Add a few screenshots or a short GIF here — the dashboard, a student
  solving a drag-and-drop challenge, the AI chat, and the teacher analytics
  view all make great first impressions.
-->

## 📖 Table of Contents

- [What is CodeQuest?](#-what-is-codequest)
- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Getting Started](#-getting-started)
- [Environment Variables](#-environment-variables)
- [Design System](#-design-system)
- [Roadmap](#-roadmap)
- [Contributing](#-contributing)
- [License](#-license)
- [Author](#-author)

---

## 🎯 What is CodeQuest?

Most beginner coding platforms fall into one of two traps: either they're too abstract (watch a video, answer a multiple-choice quiz) or too intimidating (a blank editor and a vague prompt). CodeQuest tries to split the difference — students start with **guided drag-and-drop puzzles**, graduate to **build-it-yourself block arrangement**, and finish in a **real code editor**, all scaffolded around the same core concept before moving to the next one.

At a glance, the platform currently covers:

| | |
|---|---|
| 🌐 **Languages** | 4 (HTML, CSS, JavaScript, Python) |
| 📚 **Topics** | 24 |
| 🎚️ **Levels** | 72 |
| 🧩 **Challenges** | 216 |
| 🎓 **Audience** | Ages 10–18 |

It started as an inherited project that needed real triage — a full database migration off MySQL onto PostgreSQL, a pass to re-enable features that had been quietly commented out, and a ground-up UI redesign — before growing into its current dark, "coding-native" aesthetic and its AI-powered teaching layer.

## ✨ Features

### For Students
- 🧩 **Three-level learning path per topic** — guided drag-and-drop → arrange-the-blocks → free coding in a real Monaco editor
- 🤖 **Practice with AI** — generate a fresh coding question anytime, in any language/level, no waiting on a teacher to assign one
- 💬 **AI Coding Buddy** — a floating chat assistant that *tutors*, not solves: it asks leading questions and points you toward the fix instead of handing you the answer, and it actually knows which exercise you're stuck on
- 📊 **Progress dashboard** — visual breakdowns by language, topic, and level, so it's obvious what's mastered and what needs another pass
- 🏆 **XP & rewards system** — points for correct answers, a reduced reward if a hint was used, encouraging genuine attempts before asking for help
- 📝 **Timed exams** — teacher-assigned, with retry policies and deadlines set per exam
- 🔑 **Join a class** — a simple join code links a student to their teacher's syllabus

### For Teachers
- 🎛️ **Full dashboard** — students, exercises, exams, submissions, and analytics in one place
- ✍️ **Exercise & exam builder** — create and edit challenges across all three difficulty levels, publish to specific students or the whole class
- 🤖 **AI-assisted exercise generation** — describe a topic, get a draft question (with blocks, hints, and answer key) to review and tweak rather than write from scratch
- 🧑‍🏫 **AI Teaching Advisor** — a chat assistant scoped to lesson planning and reading class performance data, not generic Q&A
- 📈 **Analytics that matter** — hint usage per exercise, retry counts per student, so struggling topics surface on their own instead of staying hidden in a spreadsheet

### Platform-wide
- 🔐 **Firebase Authentication** — email/password, Google, and Facebook sign-in
- 🎨 **Dark, glassmorphic UI** — built to look and feel like a coding tool, not a school portal
- 📱 **Responsive** — a proper mobile drawer, not just a squeezed-down desktop layout

## 🛠️ Tech Stack

**Frontend**
- React 18 + Vite
- Material UI (MUI) + Tailwind CSS
- Monaco Editor (the same editor that powers VS Code) for free-coding challenges
- react-dnd for drag-and-drop puzzles
- Firebase Auth SDK

**Backend**
- Node.js + Express
- PostgreSQL (hosted on Aiven)
- Firebase Admin SDK for token verification

**AI**
- Google Gemini API — exercise generation and both chat modes (student tutor / teacher advisor)

**Hosting**
- Frontend: Vercel
- Backend: Render

## 📁 Project Structure

```
LearningManagementSystem/
├── clientSide/                 # React + Vite frontend
│   ├── src/
│   │   ├── Components/         # Shared components (Layout, Login, Cards, Game, AI chat)
│   │   ├── Pages/
│   │   │   ├── Student/        # Practice, Exams, Join Teacher
│   │   │   ├── Teacher/        # Dashboard, forms, analytics
│   │   │   ├── Game/           # Challenge flow, progress charts
│   │   │   └── User/           # Profile
│   │   ├── config/             # API base URL, Firebase config
│   │   └── styles/
│   └── vercel.json
└── serverSide/                  # Node/Express backend
    ├── controller/              # Route handlers by domain (Student, Teacher, AI, ...)
    ├── routes/                  # Express routers
    ├── middleware/              # Auth token verification
    ├── services/                # Gemini API integration
    └── config/                  # DB connection
```

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- A PostgreSQL database
- A Firebase project (Authentication enabled — Email/Password, Google, Facebook providers)
- A free Gemini API key from [Google AI Studio](https://aistudio.google.com/apikey)

### Installation

```bash
git clone https://github.com/AlaaMuhissen/LearningManagementSystem.git
cd LearningManagementSystem
```

**Backend**
```bash
cd serverSide
npm install
# create a .env file — see Environment Variables below
npm start
```

**Frontend**
```bash
cd clientSide
npm install
# create a .env file — see Environment Variables below
npm run dev
```

The app should now be running locally, with the frontend talking to your local backend.

## 🔑 Environment Variables

**`serverSide/.env`**
```env
PORT=3000
DATABASE_URL=your_postgres_connection_string
GEMINI_API_KEY=your_gemini_api_key
FIREBASE_PROJECT_ID=your_firebase_project_id
FIREBASE_SERVICE_ACCOUNT=your_firebase_service_account
# plus any additional Firebase Admin SDK credentials your setup requires
```

**`clientSide/.env`**
```env
VITE_API_URL=http://localhost:3000
VITE_FIREBASE_API_KEY=your_firebase_web_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_firebase_project_id
# plus any additional Firebase web config values
```

> **Note:** if you deploy the frontend (e.g. to Vercel), make sure `VITE_API_URL` points at your deployed backend, not `localhost` — a build-time env var pointing at `localhost` gets baked into the production bundle and will silently fail for anyone but you.

## 🎨 Design System

CodeQuest's UI is built around a consistent dark "coding" palette, applied throughout via glassmorphic cards:

| Color | Hex | Used for |
|---|---|---|
| 🟢 Teal | `#64ffda` | Primary accent, success states |
| 🔵 Blue | `#4fc3f7` | Secondary accent |
| 🟣 Purple | `#a78bfa` | Tertiary accent, AI-related UI |
| ⚫ Background | `#0d1228` | Base background |

Cards use `rgba(255,255,255,0.03)` backgrounds with `rgba(255,255,255,0.07)` borders and backdrop blur for that layered, glass-panel look.

## 🗺️ Roadmap

- [ ] Additional languages beyond HTML/CSS/JS/Python
- [ ] Real drag-and-drop for AI-generated practice questions (currently a simplified click-to-arrange UI)
- [ ] Sandboxed execution for Python/Java free-coding checks
- [ ] Server-persisted avatar selection (currently local to the browser)

## 🤝 Contributing

This project is under active development. If you'd like to contribute, please open an issue first to discuss what you'd like to change.

## 📄 License

This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.

## 👤 Author

**Alaa Muhissen**
- GitHub: [@AlaaMuhissen](https://github.com/AlaaMuhissen)

---

<p align="center">Built with 💙 for the next generation of coders.</p>
