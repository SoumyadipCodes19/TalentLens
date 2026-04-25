# TalentLens — Autonomous Talent Scouting & Engagement

> A high-fidelity autonomous AI agentic pipeline that parses job descriptions, discovers matching candidates, conducts conversational outreach via LLMs, and produces secure, ranked shortlists.

![TalentLens](https://img.shields.io/badge/AI-TalentLens-000000?style=for-the-badge)
![Gemini](https://img.shields.io/badge/Google_Cloud-Gemini_2.5_Flash-4285F4?style=for-the-badge&logo=googlecloud&logoColor=white)
![Groq](https://img.shields.io/badge/Groq_Llama_3.1-F55036?style=for-the-badge)
![Next.js](https://img.shields.io/badge/Next.js_16-000000?style=for-the-badge&logo=nextdotjs&logoColor=white)
![Auth](https://img.shields.io/badge/Auth.js-Google_OAuth-black?style=for-the-badge)

## 🚀 Overview

TalentLens is designed to stabilize and scale the talent acquisition process by moving from monolithic processing to a highly concurrent, granular API-driven architecture. It ensures production stability on serverless platforms (like Vercel) while maintaining a premium, minimalistic aesthetic.

## ✨ Key Features

### 🛡️ Secure & Private

- **Google OAuth Integration**: Secure sign-in for all users.
- **Upstash Redis Usage Tracking**: Strictly enforced limits (3 runs per account) to prevent resource abuse.
- **Admin Bypass**: Global admin accounts (configured via ENV) enjoy unlimited access and full pipeline capabilities.

### 🧠 Agentic Pipeline (7 Steps)

1. **JD Parser** — Deep analysis of explicit and hidden job requirements.
2. **Strategy Planner** — Autonomous creation of search and evaluation strategies.
3. **Candidate Discovery** — AI-generated candidate personas (or CSV/JSON imports).
4. **Match Scorer** — Skill-by-skill evaluation with full reasoning transparency.
5. **Outreach Simulator** — multi-turn personalized conversations via Groq Llama 3.1 8B.
6. **Interest Analyzer** — Sentiment and engagement analysis of outreach transcripts.
7. **Self-Reflector & Ranker** — Automated bias detection and final executive brief generation.

### 🏗️ Modern Architecture

- **Concurrency-First**: Heavy scoring and outreach tasks are executed in parallel across granular API requests, bypassing serverless timeout limits.
- **Minimalist Aesthetic**: A professional, monochrome dark-mode design focused on data clarity and high-end typography.
- **Disposable Email Protection**: Built-in blocking of temporary email domains to maintain user quality.

## 📦 Local Setup

### Prerequisites

- Node.js 18+
- [Google Cloud Console](https://console.cloud.google.com/) (Gemini API enabled)
- [Groq Console API Key](https://console.groq.com/keys) (Llama 3.1 8B)
- [Upstash Redis](https://console.upstash.com/) (Free tier URL/Token)
- [Google Cloud Console](https://console.cloud.google.com/) (OAuth Client ID/Secret)

### Installation

```bash
# Clone and enter
git clone https://github.com/SoumyadipCodes19/TalentLens.git
cd talentlens

# Install
npm install

# Environment Configuration
# Create a .env.local file with the following keys:
GEMINI_API_KEY=your_google_cloud_api_key
GROQ_API_KEY=your_key

AUTH_SECRET=your_secret # Generate with: npx auth secret
GOOGLE_CLIENT_ID=your_id
GOOGLE_CLIENT_SECRET=your_secret

KV_REST_API_URL=your_upstash_url
KV_REST_API_TOKEN=your_upstash_token

ADMIN_EMAIL=your@email.com
NEXT_PUBLIC_ADMIN_EMAIL=your@email.com

# Start
npm run dev
```

## 🏗️ Technical Architecture

See [ARCHITECTURE.md](./ARCHITECTURE.md) for detailed implementation notes on the concurrent pipeline model and state management.

## 📄 License

MIT
