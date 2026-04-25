import { NextResponse } from 'next/server';
import { parseJobDescription } from '@/lib/agents/jd-parser';
import { planSearchStrategy } from '@/lib/agents/strategy-planner';
import { discoverCandidates } from '@/lib/agents/candidate-discovery';
import { scoreAllCandidates } from '@/lib/agents/match-scorer';
import { simulateAllOutreach } from '@/lib/agents/outreach-simulator';
import { analyzeAllInterest } from '@/lib/agents/interest-scorer';
import { selfReflect, generateFinalRanking } from '@/lib/agents/self-reflector';

export const maxDuration = 60; // Natively supported in API routes

export async function POST(req: Request) {
  try {
    const { action, payload } = await req.json();

    switch (action) {
      case 'parse_jd': {
        const result = await parseJobDescription(payload.jdText);
        return NextResponse.json({ success: true, data: { parsedJD: result.data, thinking: result.thinking } });
      }
      
      case 'plan_strategy': {
        const result = await planSearchStrategy(payload.parsedJD);
        return NextResponse.json({ success: true, data: { strategy: result.data, thinking: result.thinking } });
      }
      
      case 'discover_candidates': {
        const result = await discoverCandidates(payload.parsedJD, payload.strategy, 6);
        return NextResponse.json({ success: true, data: { candidates: result.data, thinking: result.thinking } });
      }
      
      case 'score_candidates': {
        const result = await scoreAllCandidates(payload.parsedJD, payload.candidates, payload.strategy);
        return NextResponse.json({ success: true, data: { matchResults: result.data, thinking: result.thinking } });
      }
      
      case 'simulate_outreach': {
        const sortedMatches = [...payload.matchResults].sort((a, b) => b.overallMatchScore - a.overallMatchScore);
        const topCandidateIds = sortedMatches.slice(0, 4).map(m => m.candidateId);
        const topCandidates = payload.candidates.filter((c: any) => topCandidateIds.includes(c.id));
        const topMatchResults = payload.matchResults.filter((m: any) => topCandidateIds.includes(m.candidateId));

        const result = await simulateAllOutreach(topCandidates, payload.parsedJD, topMatchResults);
        return NextResponse.json({ success: true, data: { conversations: result.data, thinking: result.thinking } });
      }
      
      case 'analyze_interest': {
        const conversationCandidates = payload.candidates.filter((c: any) => payload.conversations.some((conv: any) => conv.candidateId === c.id));
        const result = await analyzeAllInterest(payload.conversations, conversationCandidates);
        return NextResponse.json({ success: true, data: { interestResults: result.data, thinking: result.thinking } });
      }
      
      case 'self_reflect': {
        const reflection = await selfReflect(payload.candidates, payload.matchResults, payload.interestResults);
        return NextResponse.json({ success: true, data: { selfReflection: reflection.data, thinking: reflection.thinking } });
      }

      case 'generate_final_ranking': {
        const ranking = await generateFinalRanking(payload.candidates, payload.matchResults, payload.interestResults, payload.selfReflection);
        return NextResponse.json({ success: true, data: { finalRanking: ranking.data, thinking: ranking.thinking } });
      }

      default:
        return NextResponse.json({ success: false, error: 'Invalid action' }, { status: 400 });
    }
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json({ success: false, error: error instanceof Error ? error.message : 'Unknown error' }, { status: 500 });
  }
}
