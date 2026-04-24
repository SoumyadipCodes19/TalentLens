import { parseJobDescription } from './agents/jd-parser';
import { planSearchStrategy } from './agents/strategy-planner';
import { discoverCandidates } from './agents/candidate-discovery';
import { scoreAllCandidates } from './agents/match-scorer';
import { simulateAllOutreach } from './agents/outreach-simulator';
import { analyzeAllInterest } from './agents/interest-scorer';
import { selfReflect, generateFinalRanking } from './agents/self-reflector';
import type { PipelineEvent, PipelineResult, CandidateProfile } from './schemas';

export async function runPipeline(
  jdText: string,
  importedCandidates: CandidateProfile[] | null,
  onEvent: (event: PipelineEvent) => void
): Promise<PipelineResult> {
  const events: PipelineEvent[] = [];

  function emit(event: PipelineEvent) {
    events.push(event);
    onEvent(event);
  }

  // ── Step 1: Parse JD ────────────────────────────────────────────────
  emit({ stage: 'jd_parsing', status: 'started', timestamp: Date.now() });
  emit({ stage: 'jd_parsing', status: 'thinking', thinking: '🔍 Analyzing the job description for explicit and hidden requirements...', timestamp: Date.now() });

  const jdResult = await parseJobDescription(jdText);

  emit({
    stage: 'jd_parsing',
    status: 'thinking',
    thinking: jdResult.thinking || '📋 Extracted title, skills, experience requirements, culture signals, and hidden requirements.',
    timestamp: Date.now(),
  });
  emit({ stage: 'jd_parsing', status: 'completed', data: jdResult.data, timestamp: Date.now() });

  // ── Step 2: Strategy Planning ───────────────────────────────────────
  emit({ stage: 'strategy_planning', status: 'started', timestamp: Date.now() });
  emit({ stage: 'strategy_planning', status: 'thinking', thinking: '🧠 Creating autonomous search strategy — deciding what to prioritize and where to be flexible...', timestamp: Date.now() });

  const strategyResult = await planSearchStrategy(jdResult.data);

  emit({
    stage: 'strategy_planning',
    status: 'thinking',
    thinking: strategyResult.data.agentReasoning,
    timestamp: Date.now(),
  });
  emit({ stage: 'strategy_planning', status: 'completed', data: strategyResult.data, timestamp: Date.now() });

  // ── Step 3: Candidate Discovery ─────────────────────────────────────
  emit({ stage: 'candidate_discovery', status: 'started', timestamp: Date.now() });

  let candidates: CandidateProfile[];

  if (importedCandidates && importedCandidates.length > 0) {
    emit({ stage: 'candidate_discovery', status: 'thinking', thinking: `📂 Using ${importedCandidates.length} imported candidates from your database...`, timestamp: Date.now() });
    candidates = importedCandidates;
  } else {
    emit({ stage: 'candidate_discovery', status: 'thinking', thinking: '🔎 Generating diverse candidate profiles based on search strategy...', timestamp: Date.now() });
    const candidateResult = await discoverCandidates(jdResult.data, strategyResult.data, 3);
    candidates = candidateResult.data;
    emit({
      stage: 'candidate_discovery',
      status: 'thinking',
      thinking: candidateResult.thinking,
      timestamp: Date.now(),
    });
  }

  emit({ stage: 'candidate_discovery', status: 'completed', data: candidates, timestamp: Date.now() });

  // ── Step 4: Match Scoring ───────────────────────────────────────────
  emit({ stage: 'match_scoring', status: 'started', timestamp: Date.now() });
  emit({ stage: 'match_scoring', status: 'thinking', thinking: `⚖️ Evaluating ${candidates.length} candidates against JD requirements with skill-by-skill analysis...`, timestamp: Date.now() });

  const matchResult = await scoreAllCandidates(
    jdResult.data,
    candidates,
    strategyResult.data,
    (candidateId, index) => {
      const candidate = candidates.find(c => c.id === candidateId);
      emit({
        stage: 'match_scoring',
        status: 'thinking',
        thinking: `📊 Scoring candidate ${index + 1}/${candidates.length}: ${candidate?.name || candidateId}...`,
        timestamp: Date.now(),
      });
    }
  );

  emit({ stage: 'match_scoring', status: 'completed', data: matchResult.data, timestamp: Date.now() });

  // Select top candidates for outreach (those scoring above 40, up to 3)
  const sortedMatches = [...matchResult.data].sort((a, b) => b.overallMatchScore - a.overallMatchScore);
  const topCandidateIds = sortedMatches.slice(0, 3).map(m => m.candidateId);
  const topCandidates = candidates.filter(c => topCandidateIds.includes(c.id));
  const topMatchResults = matchResult.data.filter(m => topCandidateIds.includes(m.candidateId));

  // ── Step 5: Outreach Simulation ─────────────────────────────────────
  emit({ stage: 'outreach_simulation', status: 'started', timestamp: Date.now() });
  emit({
    stage: 'outreach_simulation',
    status: 'thinking',
    thinking: `💬 Conducting personalized outreach conversations with top ${topCandidates.length} candidates using Groq Llama 3.3 70B for realistic candidate voices...`,
    timestamp: Date.now(),
  });

  const conversationResult = await simulateAllOutreach(
    topCandidates,
    jdResult.data,
    topMatchResults,
    (candidateId) => {
      const candidate = candidates.find(c => c.id === candidateId);
      emit({
        stage: 'outreach_simulation',
        status: 'thinking',
        thinking: `🗣️ Engaging with ${candidate?.name || candidateId} (${candidate?.personalityType || 'unknown'} personality)...`,
        timestamp: Date.now(),
      });
    }
  );

  emit({ stage: 'outreach_simulation', status: 'completed', data: conversationResult.data, timestamp: Date.now() });

  // ── Step 6: Interest Analysis ───────────────────────────────────────
  emit({ stage: 'interest_analysis', status: 'started', timestamp: Date.now() });
  emit({ stage: 'interest_analysis', status: 'thinking', thinking: '🎯 Analyzing conversation transcripts for interest signals, sentiment, and risk factors...', timestamp: Date.now() });

  const interestResult = await analyzeAllInterest(
    conversationResult.data,
    topCandidates,
    (candidateId) => {
      const candidate = candidates.find(c => c.id === candidateId);
      emit({
        stage: 'interest_analysis',
        status: 'thinking',
        thinking: `🔬 Analyzing interest signals from ${candidate?.name || candidateId}'s conversation...`,
        timestamp: Date.now(),
      });
    }
  );

  emit({ stage: 'interest_analysis', status: 'completed', data: interestResult.data, timestamp: Date.now() });

  // ── Rate Limit Pause ────────────────────────────────────────────────
  emit({ stage: 'self_reflection_ranking', status: 'thinking', thinking: '⏳ Pausing for 60 seconds to reset API rate limits...', timestamp: Date.now() });
  await new Promise(resolve => setTimeout(resolve, 60000));

  // ── Step 7: Self-Reflection + Final Ranking ─────────────────────────
  emit({ stage: 'self_reflection_ranking', status: 'started', timestamp: Date.now() });
  emit({
    stage: 'self_reflection_ranking',
    status: 'thinking',
    thinking: '🪞 Self-reflecting on scoring — checking for biases in experience, education, and similarity patterns...',
    timestamp: Date.now(),
  });

  const reflectionResult = await selfReflect(topCandidates, topMatchResults, interestResult.data);

  emit({
    stage: 'self_reflection_ranking',
    status: 'thinking',
    thinking: `🧠 Self-reflection complete: ${reflectionResult.data.biasesDetected.length} biases detected, ${reflectionResult.data.scoreAdjustments.length} score adjustments made. Confidence: ${reflectionResult.data.confidenceInResults}%`,
    timestamp: Date.now(),
  });

  emit({
    stage: 'self_reflection_ranking',
    status: 'thinking',
    thinking: '🏆 Generating final ranked shortlist with executive summaries...',
    timestamp: Date.now(),
  });

  const rankingResult = await generateFinalRanking(
    topCandidates,
    topMatchResults,
    interestResult.data,
    reflectionResult.data
  );

  emit({ stage: 'self_reflection_ranking', status: 'completed', data: rankingResult.data, timestamp: Date.now() });

  return {
    parsedJD: jdResult.data,
    strategy: strategyResult.data,
    candidates,
    matchResults: matchResult.data,
    conversations: conversationResult.data,
    interestResults: interestResult.data,
    selfReflection: reflectionResult.data,
    finalRanking: rankingResult.data,
    events,
  };
}
