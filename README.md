# TalentLens — AI-Powered Talent Scouting & Engagement Agent

> An autonomous AI agent that parses job descriptions, discovers matching candidates, conducts conversational outreach, and produces ranked shortlists — with full reasoning transparency.

![TalentLens](https://img.shields.io/badge/AI-TalentLens-6366f1?style=for-the-badge)
![Gemini](https://img.shields.io/badge/Gemini_2.5_Flash-4285F4?style=for-the-badge&logo=google&logoColor=white)
![Groq](https://img.shields.io/badge/Groq_Llama_3.3-F55036?style=for-the-badge)
![Next.js](https://img.shields.io/badge/Next.js_16-000000?style=for-the-badge&logo=nextdotjs&logoColor=white)

## 🚀 Live Demo

> **[Live URL](https://talent-lens-blue.vercel.app/)** — *https://talent-lens-blue.vercel.app/*

## ✨ Features

### Agentic Capabilities
- **🧠 Autonomous Planning** — Agent creates its own search strategy based on JD analysis
- **🔧 Tool Orchestration** — Agent decides which tools to use and when
- **🔄 Self-Reflection Loop** — Agent reviews its own scores for bias and re-calibrates
- **💬 Adaptive Conversations** — Each outreach conversation is uniquely shaped by candidate responses
- **📊 Dynamic Decision Making** — Agent makes judgment calls about shortlisting
- **🔍 Reasoning Transparency** — Every decision shows the agent's chain-of-thought

### Core Pipeline (7 Steps)
1. **JD Parser** — Extracts explicit + hidden requirements from job descriptions
2. **Strategy Planner** — Creates autonomous search strategy (not hard-coded)
3. **Candidate Discovery** — Generates diverse candidate profiles (or imports from CSV/JSON)
4. **Match Scorer** — Granular skill-by-skill match evaluation with explainability
5. **Outreach Simulator** — Multi-turn personalized conversations via Groq Llama 3.3
6. **Interest Analyzer** — Sentiment analysis on conversation transcripts
7. **Self-Reflector & Ranker** — Bias detection, score adjustment, final ranking

### Dual-Axis Scoring
- **Match Score (0-100)**: Technical skills (40%) + Experience (25%) + Domain (20%) + Education (15%)
- **Interest Score (0-100)**: Enthusiasm (30%) + Availability (25%) + Role-fit (20%) + Compensation (15%) + Culture (10%)
- **Combined Score**: `Match × 0.6 + Interest × 0.4`

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16 (App Router, Server Actions) |
| AI (Reasoning) | Google Gemini 2.5 Flash |
| AI (Conversations) | Groq Llama 3.3 70B Versatile |
| Validation | Zod (structured LLM output) |
| Styling | Vanilla CSS (dark glassmorphism) |
| Charts | Recharts |
| Deploy | Vercel |

## 📦 Local Setup

### Prerequisites
- Node.js 18+
- Free API keys:
  - [Google AI Studio](https://aistudio.google.com/apikey) — Gemini 2.5 Flash
  - [Groq Console](https://console.groq.com/keys) — Llama 3.3 70B

### Installation

```bash
# Clone the repo
git clone https://github.com/YOUR_USERNAME/talentlens.git
cd talentlens

# Install dependencies
npm install

# Set up environment variables
cp .env.local.example .env.local
# Edit .env.local and add your API keys:
# GEMINI_API_KEY=your_key_here
# GROQ_API_KEY=your_key_here

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Running in Production

```bash
npm run build
npm start
```

## 📋 Usage

1. **Paste a Job Description** — or click one of the sample JDs (Senior SWE, Product Manager, Data Scientist)
2. **Optionally import candidates** — Upload a CSV/JSON file with real candidate data
3. **Click "Launch Agent Pipeline"** — Watch the 7-step agent pipeline execute with live reasoning
4. **Review results** — Browse the Final Ranking, Candidates, Conversations, and Self-Reflection tabs
5. **Export** — Download the ranked shortlist as CSV

### CSV Import Format

```csv
name,current_role,company,experience_years,skills,location,summary
"Jane Smith","Senior SWE","Google",8,"Python;Go;Kubernetes","San Francisco","Backend engineer..."
```

## 🏗️ Architecture

See [ARCHITECTURE.md](./ARCHITECTURE.md) for the detailed write-up.

### Quick Overview

```
User Input (JD + optional CSV)
    │
    ▼
┌─────────────────────────────────────┐
│     Agent Orchestrator (Pipeline)    │
│                                     │
│  1. JD Parser      ──► Gemini 2.5   │
│  2. Strategy Planner──► Gemini 2.5   │
│  3. Candidate Disc. ──► Gemini 2.5   │
│  4. Match Scorer    ──► Gemini 2.5   │
│  5. Outreach Sim.   ──► Groq Llama   │
│  6. Interest Scorer ──► Gemini 2.5   │
│  7. Self-Reflect    ──► Gemini 2.5   │
│                                     │
│  Memory + Context across all steps   │
└─────────────────────┬───────────────┘
                      │
                      ▼
            Ranked Shortlist
         (Match + Interest Scores)
```

## 📊 Sample Output

| Rank | Candidate | Match | Interest | Combined | Recommendation |
|------|-----------|-------|----------|----------|---------------|
| 🥇 1 | Alex Chen | 92 | 85 | 89 | STRONG YES |
| 🥈 2 | Sarah Kim | 88 | 78 | 84 | YES |
| 🥉 3 | James Liu | 85 | 72 | 80 | YES |
| 4 | Maria Patel | 76 | 68 | 73 | MAYBE |

## 📄 License

MIT
