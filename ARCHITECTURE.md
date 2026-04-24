# Architecture & Design Document

## Approach

TalentLens is built as an **autonomous multi-step AI agent** — not a simple LLM wrapper. The system demonstrates genuine agentic behavior through autonomous planning, tool orchestration, adaptive conversations, self-reflection, and transparent reasoning.

### Design Philosophy

1. **Agent-First**: Every component is designed as an agent "tool" that the orchestrator can invoke. The agent reasons about strategy before acting.
2. **Explainability-First**: Every score and decision includes human-readable reasoning. Recruiters can audit *why* any decision was made.
3. **Multi-Model Orchestration**: Gemini 2.5 Flash handles reasoning/scoring tasks; Groq Llama 3.3 70B generates candidate conversation responses — different models for different strengths.
4. **Schema-Driven**: All LLM outputs are validated against Zod schemas. This ensures pipeline reliability across 20+ LLM calls per run.

## Architecture Diagram

```
┌──────────────────────────────────────────────────────────────┐
│                      FRONTEND (Next.js)                       │
│                                                              │
│  ┌─────────┐  ┌──────────────┐  ┌───────────────────────┐   │
│  │ JDInput  │  │ Pipeline     │  │ Results Dashboard     │   │
│  │ + Upload │  │ Progress +   │  │ ┌─────┐ ┌──────────┐ │   │
│  │          │  │ Thinking     │  │ │Rank │ │Candidates│ │   │
│  └────┬─────┘  │ Panel        │  │ └─────┘ └──────────┘ │   │
│       │        └──────────────┘  │ ┌─────┐ ┌──────────┐ │   │
│       │                          │ │Chats│ │Reflection│ │   │
│       │                          │ └─────┘ └──────────┘ │   │
│       ▼                          └───────────────────────┘   │
│  ┌─────────────────────────────────────────────────────┐     │
│  │              Server Action: executePipeline          │     │
│  └──────────────────────┬──────────────────────────────┘     │
└─────────────────────────┼────────────────────────────────────┘
                          │
                          ▼
┌──────────────────────────────────────────────────────────────┐
│                   AGENT ORCHESTRATOR                          │
│                                                              │
│  Step 1: JD Parser ──────────────────► Gemini 2.5 Flash      │
│       ↓ (Parsed JD)                                          │
│  Step 2: Strategy Planner ───────────► Gemini 2.5 Flash      │
│       ↓ (Search Strategy)                                    │
│  Step 3: Candidate Discovery ────────► Gemini 2.5 Flash      │
│       ↓ (12 Candidate Profiles)       (or CSV/JSON import)   │
│  Step 4: Match Scorer (batched) ─────► Gemini 2.5 Flash      │
│       ↓ (Match Scores × 12)                                  │
│  Step 5: Outreach Simulator ─────────► Groq Llama 3.3 70B    │
│       ↓ (8 Conversations)             (with Gemini fallback) │
│  Step 6: Interest Analyzer ──────────► Gemini 2.5 Flash      │
│       ↓ (Interest Scores × 8)                                │
│  Step 7: Self-Reflect + Rank ────────► Gemini 2.5 Flash      │
│       ↓ (Final Ranking)                                      │
│                                                              │
│  🧠 Memory: Context flows across all steps                   │
│  📡 Events: Each step emits thinking/progress events         │
└──────────────────────────────────────────────────────────────┘
```

## Scoring Methodology

### Match Score (0-100)

| Component | Weight | Method |
|-----------|--------|--------|
| Technical Skills | 40% | Per-skill comparison: candidate proficiency vs JD requirement. Expert-level matches score higher. |
| Experience | 25% | Years of experience, seniority level alignment, relevant domain experience. |
| Domain Knowledge | 20% | Industry background, project relevance, specific domain expertise. |
| Education | 15% | Degree relevance, institution, certifications. |

### Interest Score (0-100)

| Signal | Weight | Detection Method |
|--------|--------|-----------------|
| Enthusiasm | 30% | Tone analysis, proactive questions, response length/quality |
| Availability | 25% | Notice period, active vs passive status, timeline readiness |
| Role-Fit Questions | 20% | Quality of questions about growth, team, impact, tech stack |
| Compensation | 15% | Salary expectations vs role range alignment |
| Cultural Fit | 10% | Values alignment, work-style preferences |

### Combined Score

```
Combined = (Match × 0.6) + (Interest × 0.4)
```

The agent can autonomously adjust weights based on JD signals (e.g., urgency increases availability weight).

## Trade-offs

| Decision | Trade-off | Rationale |
|----------|-----------|-----------|
| **Synthetic candidates** as default | Not using real data | Enables full demo without database/scraping; CSV import available for real data |
| **Server Actions** (not streaming) | UI updates via progress simulation, not true SSE | Simpler architecture; real events are captured in the final response |
| **Multi-model** (Gemini + Groq) | Adds dependency on two APIs | Better conversation quality; demonstrates sophisticated orchestration |
| **12 candidates, 8 conversations** | Limited pool size | Balances demo quality with free-tier API rate limits |
| **Zod validation on every LLM call** | Extra processing overhead | Prevents pipeline crashes from malformed JSON — critical for reliability |
| **Self-reflection as separate step** | Additional API call | Demonstrates genuine agentic self-evaluation; catches scoring biases |

## APIs & Tools Declared

| Tool | Usage | Tier |
|------|-------|------|
| Google Gemini 2.5 Flash | JD parsing, strategy, scoring, interest analysis, reflection, ranking | Free tier via AI Studio |
| Groq Llama 3.3 70B | Candidate conversation simulation | Free tier |
| Next.js 16 | Full-stack framework | Open source |
| Vercel | Deployment | Free tier |
| Zod | Schema validation | Open source |
| Recharts | Score visualization | Open source |
| PapaParse | CSV parsing | Open source |

## File Structure

```
talentlens/
├── src/
│   ├── app/
│   │   ├── globals.css          # Design system
│   │   ├── layout.tsx           # Root layout
│   │   ├── page.tsx             # Main page
│   │   └── actions.ts           # Server actions
│   ├── components/
│   │   ├── Header.tsx           # App header
│   │   ├── JDInput.tsx          # JD input + file upload
│   │   ├── PipelineProgress.tsx # Pipeline stepper + thinking panel
│   │   └── ResultsDashboard.tsx # Tabbed results view
│   └── lib/
│       ├── gemini.ts            # Gemini client
│       ├── groq.ts              # Groq client
│       ├── schemas.ts           # Zod schemas
│       ├── prompts.ts           # Agent prompts
│       ├── pipeline.ts          # Pipeline orchestrator
│       ├── candidate-import.ts  # CSV/JSON import
│       ├── sample-jds.ts        # Sample job descriptions
│       └── agents/
│           ├── jd-parser.ts
│           ├── strategy-planner.ts
│           ├── candidate-discovery.ts
│           ├── match-scorer.ts
│           ├── outreach-simulator.ts
│           ├── interest-scorer.ts
│           └── self-reflector.ts
├── .env.local.example
├── README.md
├── ARCHITECTURE.md
└── package.json
```
