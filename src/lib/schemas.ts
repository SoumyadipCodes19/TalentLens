import { z } from 'zod';

// ─── Parsed Job Description ─────────────────────────────────────────────
export const ParsedJDSchema = z.object({
  title: z.string().describe('Job title'),
  company: z.string().describe('Company name if mentioned, else "Not specified"'),
  department: z.string().describe('Department or team'),
  experienceRange: z.object({
    min: z.number(),
    max: z.number(),
  }).describe('Years of experience range'),
  requiredSkills: z.array(z.object({
    name: z.string(),
    importance: z.enum(['critical', 'important', 'preferred']),
  })),
  niceToHaveSkills: z.array(z.string()),
  responsibilities: z.array(z.string()),
  cultureSignals: z.array(z.string()).describe('Values, work culture, or environment signals detected'),
  compensationSignals: z.string().describe('Any salary/compensation hints found in the JD'),
  hiddenRequirements: z.array(z.string()).describe('Implicit requirements the agent inferred from context'),
  educationPreference: z.string(),
  locationPreference: z.string(),
  urgencyLevel: z.enum(['low', 'medium', 'high']).describe('How urgently the role needs to be filled based on JD signals'),
});
export type ParsedJD = z.infer<typeof ParsedJDSchema>;

// ─── Search Strategy ─────────────────────────────────────────────────────
export const SearchStrategySchema = z.object({
  idealCandidatePersona: z.string().describe('Description of the ideal candidate the agent envisions'),
  prioritySkillWeights: z.array(z.object({
    skill: z.string(),
    weight: z.number().min(0).max(1),
    reasoning: z.string(),
  })),
  dealBreakers: z.array(z.string()).describe('Absolute requirements that cannot be compromised'),
  flexibleAreas: z.array(z.string()).describe('Areas where the agent can be lenient'),
  searchFocusAreas: z.array(z.string()).describe('Industries or domains to prioritize'),
  diversityConsiderations: z.string().describe('How to ensure a diverse candidate pool'),
  agentReasoning: z.string().describe('The agent\'s chain-of-thought about its strategy'),
});
export type SearchStrategy = z.infer<typeof SearchStrategySchema>;

// ─── Candidate Profile ───────────────────────────────────────────────────
export const CandidateProfileSchema = z.object({
  id: z.string(),
  name: z.string(),
  currentRole: z.string(),
  currentCompany: z.string(),
  experienceYears: z.number(),
  skills: z.array(z.object({
    name: z.string(),
    proficiency: z.enum(['beginner', 'intermediate', 'advanced', 'expert']),
    yearsUsed: z.number(),
  })),
  education: z.object({
    degree: z.string(),
    field: z.string(),
    institution: z.string(),
  }),
  location: z.string(),
  summary: z.string().describe('Professional summary / LinkedIn headline'),
  achievements: z.array(z.string()),
  currentSatisfaction: z.enum(['very_happy', 'content', 'neutral', 'looking', 'actively_searching']),
  salaryExpectation: z.string(),
  noticePeriod: z.string(),
  personalityType: z.enum(['enthusiastic', 'cautious', 'passive', 'negotiator', 'analytical']),
});
export type CandidateProfile = z.infer<typeof CandidateProfileSchema>;

export const CandidatePoolSchema = z.object({
  candidates: z.array(CandidateProfileSchema),
  generationReasoning: z.string().describe('Why the agent generated these specific profiles'),
});
export type CandidatePool = z.infer<typeof CandidatePoolSchema>;

// ─── Match Score ─────────────────────────────────────────────────────────
export const SkillMatchSchema = z.object({
  skill: z.string(),
  candidateLevel: z.string(),
  requiredLevel: z.string(),
  matchPercentage: z.number().min(0).max(100),
  explanation: z.string(),
});

export const MatchResultSchema = z.object({
  candidateId: z.string(),
  overallMatchScore: z.number().min(0).max(100),
  skillMatchScore: z.number().min(0).max(100),
  experienceScore: z.number().min(0).max(100),
  educationScore: z.number().min(0).max(100),
  domainScore: z.number().min(0).max(100),
  skillBreakdown: z.array(SkillMatchSchema),
  strengths: z.array(z.string()),
  gaps: z.array(z.string()),
  matchExplanation: z.string().describe('Human-readable summary of why this score was given'),
  agentConfidence: z.number().min(0).max(100).describe('How confident the agent is in this assessment'),
});
export type MatchResult = z.infer<typeof MatchResultSchema>;

// ─── Conversation ────────────────────────────────────────────────────────
export const ConversationMessageSchema = z.object({
  role: z.enum(['recruiter', 'candidate']),
  content: z.string(),
  interestSignal: z.string().optional().describe('Interest signal detected in this message if any'),
  signalType: z.enum(['positive', 'negative', 'neutral', 'probing']).optional(),
});

export const ConversationSchema = z.object({
  candidateId: z.string(),
  messages: z.array(ConversationMessageSchema),
  overallTone: z.string().describe('Overall tone of the conversation'),
  keyInsights: z.array(z.string()).describe('Key insights the agent extracted from this conversation'),
  adaptationNotes: z.string().describe('How the agent adapted its approach during the conversation'),
});
export type Conversation = z.infer<typeof ConversationSchema>;

// ─── Interest Score ──────────────────────────────────────────────────────
export const InterestResultSchema = z.object({
  candidateId: z.string(),
  overallInterestScore: z.number().min(0).max(100),
  enthusiasmScore: z.number().min(0).max(100),
  availabilityScore: z.number().min(0).max(100),
  roleFitQuestionScore: z.number().min(0).max(100),
  compensationAlignmentScore: z.number().min(0).max(100),
  culturalFitScore: z.number().min(0).max(100),
  keySignals: z.array(z.object({
    signal: z.string(),
    type: z.enum(['positive', 'negative', 'neutral']),
    quote: z.string().describe('Direct quote from conversation that shows this signal'),
  })),
  interestExplanation: z.string(),
  riskFactors: z.array(z.string()),
});
export type InterestResult = z.infer<typeof InterestResultSchema>;

// ─── Self-Reflection ─────────────────────────────────────────────────────
export const SelfReflectionSchema = z.object({
  biasesDetected: z.array(z.object({
    biasType: z.string(),
    description: z.string(),
    affectedCandidates: z.array(z.string()),
    correction: z.string(),
  })),
  scoreAdjustments: z.array(z.object({
    candidateId: z.string(),
    originalMatchScore: z.number(),
    adjustedMatchScore: z.number(),
    originalInterestScore: z.number(),
    adjustedInterestScore: z.number(),
    reason: z.string(),
  })),
  overallAssessment: z.string(),
  confidenceInResults: z.number().min(0).max(100),
});
export type SelfReflection = z.infer<typeof SelfReflectionSchema>;

// ─── Final Ranking ───────────────────────────────────────────────────────
export const RankedCandidateSchema = z.object({
  rank: z.number(),
  candidateId: z.string(),
  candidateName: z.string(),
  matchScore: z.number(),
  interestScore: z.number(),
  combinedScore: z.number(),
  recommendation: z.enum(['strong_yes', 'yes', 'maybe', 'no']),
  actionItem: z.string().describe('Specific next step for the recruiter'),
  executiveSummary: z.string().describe('One-paragraph summary for the recruiter'),
});

export const FinalRankingSchema = z.object({
  rankedCandidates: z.array(RankedCandidateSchema),
  executiveBrief: z.string().describe('Overall brief for the recruiter about this search'),
  searchQuality: z.number().min(0).max(100).describe('Agent self-assessment of search quality'),
  recommendedNextSteps: z.array(z.string()),
});
export type FinalRanking = z.infer<typeof FinalRankingSchema>;

// ─── Pipeline Events (for streaming to UI) ───────────────────────────────
export type PipelineStage =
  | 'jd_parsing'
  | 'strategy_planning'
  | 'candidate_discovery'
  | 'match_scoring'
  | 'outreach_simulation'
  | 'interest_analysis'
  | 'self_reflection_ranking';

export interface PipelineEvent {
  stage: PipelineStage;
  status: 'started' | 'thinking' | 'completed' | 'error';
  thinking?: string;
  data?: unknown;
  timestamp: number;
}

export interface PipelineResult {
  parsedJD: ParsedJD;
  strategy: SearchStrategy;
  candidates: CandidateProfile[];
  matchResults: MatchResult[];
  conversations: Conversation[];
  interestResults: InterestResult[];
  selfReflection: SelfReflection;
  finalRanking: FinalRanking;
  events: PipelineEvent[];
}
