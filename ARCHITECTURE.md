# Architecture & Design Document

## Core Philosophy

TalentLens is built as an **autonomous multi-step AI agentic pipeline**. Unlike simple LLM wrappers, it follows a structured, granular execution model designed for production stability, security, and explainability.

### 1. Stability-First Architecture (Sequential Processing)

To bypass Vercel's strict serverless execution limits (10s on hobby tier) and avoid hitting API rate limits on Gemini/Groq, the pipeline follows a **granular, sequential model**.

- **Atomic Operations**: Each pipeline step (Match Scoring, Outreach, Interest Analysis) is triggered via individual API requests.
- **Sequential Orchestration**: The frontend manages the state machine and triggers requests for each candidate one-by-one.
- **Production Resilience**: This ensures that LLM latencies are handled gracefully, preventing 504 Gateway Timeouts by staying within the per-request execution window.

### 2. Security & Rate Limiting

- **Google OAuth**: Access is restricted to authenticated users.
- **Upstash Redis**: Securely tracks usage limits (3 runs per account) and enforces candidate caps (5 per run) for non-admin users.
- **Admin Layer**: Global admins can bypass limits for internal testing and full-scale scouting.

### 3. Explainability & Reasoning

Every agent decision is accompanied by "Thinking" metadata. We use **Gemini 2.5 Flash** (via Google Cloud) for its superior reasoning and structured output capabilities, ensuring the recruiter can audit every match score.

---

## Technical Diagram

```
      USER (Browser)
          │
          ▼
   ┌───────────────┐        ┌─────────────────┐
   │ Next.js Auth  │◄──────►│ Google OAuth 2.0│
   └──────┬────────┘        └─────────────────┘
          │
          ▼
   ┌───────────────┐        ┌─────────────────┐
   │ Orchestrator  │◄──────►│ Upstash Redis   │
   │ (ClientPage)  │        │ (Usage Limits)  │
   └──────┬────────┘        └─────────────────┘
          │
          ├─► POST /api/pipeline (parse_jd)
          ├─► POST /api/pipeline (plan_strategy)
          ├─► POST /api/pipeline (discover_candidates)
          │
          │  (SEQUENTIAL LOOPS PER CANDIDATE)
          ├─► POST /api/pipeline (score_candidate)
          ├─► POST /api/pipeline (simulate_outreach)
          └─► POST /api/pipeline (analyze_interest)
```

---

## Multi-Model Strategy

| Model | Role | Rationale |
|-------|------|-----------|
| **Gemini 2.5 Flash (Google Cloud)** | Reasoning, Parsing, Scoring, Reflection | Best-in-class JSON formatting and chain-of-thought reasoning for structured data, now running via Google Cloud for production scale. |
| **Groq Llama 3.1 8B** | Outreach Simulation | Ultra-low latency and "instant" generation speed make it ideal for simulating realistic human-like conversations. |

---

## File Structure

```
talentlens/
├── src/
│   ├── auth.ts              # NextAuth configuration
│   ├── proxy.ts             # Next.js 16 Edge Proxy (Middleware)
│   ├── app/
│   │   ├── api/auth/        # OAuth endpoints
│   │   ├── api/pipeline/    # Atomic Agent API endpoints
│   │   ├── login/           # Stylized landing page
│   │   ├── globals.css      # Minimalist design system
│   │   └── ClientPage.tsx   # State Orchestrator
│   ├── components/
│   │   ├── PipelineProgress.tsx # Reasoning & Progress UI
│   │   └── ResultsDashboard.tsx # Executive Brief & Data Visualization
│   └── lib/
│       ├── agents/          # Individual Agent Logic (Atomic)
│       ├── gemini.ts        # Structured Output Wrapper
│       └── groq.ts          # Instant Chat Wrapper
└── .env.local               # Environment Secrets
```

## Performance Trade-offs

| Decision                | Rationale                                                                                   |
| ----------------------- | ------------------------------------------------------------------------------------------- |
| **Client-Side Looping** | Bypasses Vercel's 10s-60s timeout limits entirely.                                          |
| **Upstash vs SQL**      | Upstash (Redis) is zero-config and provides sub-millisecond usage tracking for free.        |
| **Monochrome UI**       | Reduces visual clutter to focus on the high-fidelity reasoning data produced by the agents. |
