'use server';

import { parseJobDescription } from '@/lib/agents/jd-parser';
import { planSearchStrategy } from '@/lib/agents/strategy-planner';
import { discoverCandidates } from '@/lib/agents/candidate-discovery';
import { scoreAllCandidates } from '@/lib/agents/match-scorer';
import { simulateAllOutreach } from '@/lib/agents/outreach-simulator';
import { analyzeAllInterest } from '@/lib/agents/interest-scorer';
import { selfReflect, generateFinalRanking } from '@/lib/agents/self-reflector';

import type { ParsedJD, SearchStrategy, CandidateProfile, MatchResult, Conversation, InterestResult, FinalRanking } from '@/lib/schemas';

// Each action must return a plain object or throw an error.
// We use a standard wrapper to safely return { success, data?, error? }

async function withErrorHandling<T>(fn: () => Promise<T>): Promise<{ success: boolean; data?: T; error?: string }> {
  try {
    const result = await fn();
    return { success: true, data: result };
  } catch (error) {
    console.error('Server Action Error:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error occurred' };
  }
}

export async function parseJdAction(jdText: string) {
  return withErrorHandling(async () => {
    const result = await parseJobDescription(jdText);
    return { parsedJD: result.data, thinking: result.thinking };
  });
}

export async function planStrategyAction(parsedJD: ParsedJD) {
  return withErrorHandling(async () => {
    const result = await planSearchStrategy(parsedJD);
    return { strategy: result.data, thinking: result.thinking };
  });
}

export async function discoverCandidatesAction(parsedJD: ParsedJD, strategy: SearchStrategy) {
  return withErrorHandling(async () => {
    // Generate 6 candidates
    const result = await discoverCandidates(parsedJD, strategy, 6);
    return { candidates: result.data, thinking: result.thinking };
  });
}

export async function scoreCandidatesAction(parsedJD: ParsedJD, candidates: CandidateProfile[], strategy: SearchStrategy) {
  return withErrorHandling(async () => {
    const result = await scoreAllCandidates(parsedJD, candidates, strategy);
    return { matchResults: result.data, thinking: result.thinking };
  });
}

export async function simulateOutreachAction(parsedJD: ParsedJD, candidates: CandidateProfile[], matchResults: MatchResult[]) {
  return withErrorHandling(async () => {
    // Select top 4 candidates for outreach based on Match Score
    const sortedMatches = [...matchResults].sort((a, b) => b.overallMatchScore - a.overallMatchScore);
    const topCandidateIds = sortedMatches.slice(0, 4).map(m => m.candidateId);
    const topCandidates = candidates.filter(c => topCandidateIds.includes(c.id));
    const topMatchResults = matchResults.filter(m => topCandidateIds.includes(m.candidateId));

    const result = await simulateAllOutreach(topCandidates, parsedJD, topMatchResults);
    return { conversations: result.data, thinking: result.thinking };
  });
}

export async function analyzeInterestAction(conversations: Conversation[], candidates: CandidateProfile[]) {
  return withErrorHandling(async () => {
    // Find candidates for the specific conversations
    const conversationCandidates = candidates.filter(c => conversations.some(conv => conv.candidateId === c.id));
    const result = await analyzeAllInterest(conversations, conversationCandidates);
    return { interestResults: result.data, thinking: result.thinking };
  });
}

export async function reflectAndRankAction(candidates: CandidateProfile[], matchResults: MatchResult[], interestResults: InterestResult[], parsedJD: ParsedJD, strategy: SearchStrategy) {
  return withErrorHandling(async () => {
    const reflection = await selfReflect(candidates, matchResults, interestResults);
    const ranking = await generateFinalRanking(candidates, matchResults, interestResults, reflection.data);
    
    // Combine thinking
    const combinedThinking = reflection.thinking + '\n---\n' + ranking.thinking;
    
    return { finalRanking: ranking.data, selfReflection: reflection.data, thinking: combinedThinking };
  });
}
