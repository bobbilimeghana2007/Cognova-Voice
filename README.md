# Cognova Voice — Agentic AI Mentor for Personalized Learning & Career Readiness

> **Tagline:** Speak. Learn. Improve. Grow.  
> **Hackathon:** VORTEX 2K26 — Global AI Innovation Hackathon  
> **Theme:** Theme 5 — Deep Tech, Automation & Emerging Technology  

---

## 🌟 Overview

**Cognova Voice** is an autonomous multi-agent learning platform that acts as a real-time voice-first personal academic and career readiness mentor. It moves beyond standard chatbots by executing an autonomous closed-loop learning cycle:

$$\text{Understand} \longrightarrow \text{Retrieve} \longrightarrow \text{Teach} \longrightarrow \text{Assess} \longrightarrow \text{Analyze} \longrightarrow \text{Plan} \longrightarrow \text{Adapt} \longrightarrow \text{Guide}$$

---

## 🚀 One-Command Quickstart (Windows)

### Method 1: Double-Click Launcher (Recommended for Windows)
Simply double-click:
```
START_COGNOVA.bat
```
Located directly in the project root folder. It automatically verifies Python, Node.js, sets up environments, starts the backend & frontend, polls health checks, and opens your browser.

### Method 2: Single PowerShell Command
In your Antigravity / PowerShell terminal inside `cognova-voice`:
```powershell
.\start_project.ps1
```

---

## 🤖 Multi-Agent Ecosystem (7 Autonomous Agents)

1. **Orchestrator Agent:** Natural language intent classification, routing to specialized agents, multi-step conversation context tracking.
2. **Tutor Agent:** Multi-level explanations (Beginner/Intermediate/Advanced), analogies, step-by-step logic, bilingual support (English + Telugu + Code-mixed).
3. **RAG Knowledge Agent:** Anti-hallucination document extraction, chunking, source page citations (`pypdf` grounded retrieval).
4. **Assessment Agent:** Adaptive MCQs, scenario questions, step-by-step mistake diagnosis, automated grading.
5. **Performance Agent:** Continuous topic mastery calculation ($0-100\%$), weakness identification, forgetting curve detection.
6. **Adaptive Planner Agent:** Dynamically restructures student's daily study tasks and schedule based on assessment mistakes.
7. **Career Readiness Agent:** Matches student competencies against target career matrices (e.g., Data Scientist) and generates actionable skill-gap roadmaps.

---

## 💻 Tech Stack

- **Frontend:** React 18, Vite, TypeScript, Tailwind CSS (Futuristic Study Library Glassmorphism), Lucide Icons.
- **Backend:** Python 3.10+, FastAPI, Pydantic v2, SQLAlchemy.
- **Database:** SQLite with pre-seeded demo student **Meghana** (Data Scientist track, Bayes Theorem weak topic) plus dynamic student registration.
- **Voice Engine:** Web Speech API (Browser Native STT & TTS with English + Telugu support).
- **Document RAG:** Lightweight pure Python `pypdf` with 180-word semantic chunking, keyword-density ranking, and zero-hallucination grounding.
- **Visual PDF Generation:** ReportLab 4-page educational analytics dossier with sanctuary color palette, charts, and roadmaps.
- **AI / LLMs:** Multi-provider support for Google Gemini (`gemini-1.5-flash`), Groq, OpenAI, or intelligent built-in 9-part pedagogical engine with 100% offline uptime.

---

## 📚 Key New Capabilities Added

### 1. General-Purpose Academic Pedagogical Engine
- Teaches any subject: Machine Learning, Python, Java, Data Warehousing & Data Mining (DWDM), Database Management (SQL), Biology (Photosynthesis), Mathematics, and Career Skills.
- Adapts to prompt constraints (e.g. "explain briefly in 3 bullet points" or "10-mark exam answer format").
- 9-part structured teaching with step-by-step logic, ASCII/Mermaid flowcharts, and Telugu / bilingual explanations.

### 2. Tri-Mode Knowledge Retrieval Selector
- 🌿 **My Notes Mode:** Strictly grounded in uploaded student materials with page citations (`Page X`). If a fact is missing from the notes, it honestly states: *"This topic is not covered in your uploaded notes."*
- 💡 **General Learning Mode:** Broad academic curriculum across all sciences, engineering, and programming.
- ⚡ **Combined Mode:** Synthesizes personal notes with wider foundational explanations and real-world analogies.

### 3. Document AI Study Tools
- **Generate Summary Notes:** One-click executive summary, key formulas, and exam review notes from uploaded PDFs.
- **Generate Practice Quiz:** Generates 3 adaptive multiple-choice questions directly grounded in the document.
- **Active Recall Flashcards:** Generates 2-sided question/answer flashcards with page numbers for spaced repetition.

### 4. 4-Page Visual PDF Learning Report (ReportLab)
- Instant download of a professional 4-page visual dossier via `GET /api/reports/weekly/pdf?user_id=1`:
  - **Page 1: Executive Summary & Learning Profile** (Streak, XP, Study Goal, Employability index).
  - **Page 2: Visual Analytics & Topic Mastery Breakdown** (Mastery bars, completion stats, focus sessions).
  - **Page 3: Weak Topics Diagnostics & Misconception Analysis** (Diagnosed mistakes, explanations).
  - **Page 4: Next-Week Adaptive Action Plan** (Prioritized study tasks, target career milestones).

### 5. Multi-User Profile Isolation
- Switch between different student profiles (e.g., Meghana, custom registered students) or create new student profiles directly from the header dropdown.
- Full data isolation across chat history, topic masteries, study tasks, and uploaded notes.

---

## 🌐 Endpoints

- **Web Application:** `http://localhost:5173`
- **FastAPI Backend:** `http://127.0.0.1:8000`
- **Interactive API Swagger Docs:** `http://127.0.0.1:8000/docs`
- **Health Check Endpoint:** `http://127.0.0.1:8000/api/health`
- **Visual PDF Report Download:** `http://127.0.0.1:8000/api/reports/weekly/pdf?user_id=1`

