import { NextResponse } from 'next/server';
import { Redis } from '@upstash/redis';
import { auth } from '@/auth';
import { parseJobDescription } from '@/lib/agents/jd-parser';
import { planSearchStrategy } from '@/lib/agents/strategy-planner';
import { discoverCandidates } from '@/lib/agents/candidate-discovery';
import { scoreAllCandidates } from '@/lib/agents/match-scorer';
import { simulateAllOutreach } from '@/lib/agents/outreach-simulator';
import { analyzeAllInterest } from '@/lib/agents/interest-scorer';
import { selfReflect, generateFinalRanking } from '@/lib/agents/self-reflector';

export const maxDuration = 300; // Increased to 5 minutes (Max for Vercel Pro) to prevent 504 Gateway Timeouts

// Initialize Redis if configured
const redis = process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN 
  ? new Redis({ url: process.env.KV_REST_API_URL, token: process.env.KV_REST_API_TOKEN }) 
  : null;

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session || !session.user || !session.user.email) {
      return NextResponse.json({ success: false, error: 'Unauthorized. Please log in.' }, { status: 401 });
    }

    const email = session.user.email;
    const isAdmin = email === process.env.ADMIN_EMAIL;

    // Check usage limits for non-admins if Redis is connected
    if (!isAdmin && redis) {
      const usageKey = `usage:${email}`;
      const runs = await redis.get<number>(usageKey) || 0;
      
      if (runs >= 3) {
        return NextResponse.json({ success: false, error: 'Usage limit reached. You have completed 3 pipeline runs.' }, { status: 403 });
      }
    }

    const { action, payload } = await req.json();

    // Increment usage on the very first step (parse_jd)
    if (action === 'parse_jd' && !isAdmin && redis) {
      const usageKey = `usage:${email}`;
      await redis.incr(usageKey);
    }

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
      
      case 'score_candidate': {
        const result = await scoreAllCandidates(payload.parsedJD, [payload.candidate], payload.strategy);
        return NextResponse.json({ success: true, data: { matchResult: result.data[0], thinking: result.thinking } });
      }
      
      case 'simulate_outreach': {
        const result = await simulateAllOutreach([payload.candidate], payload.parsedJD, [payload.matchResult]);
        return NextResponse.json({ success: true, data: { conversation: result.data[0], thinking: result.thinking } });
      }
      
      case 'analyze_interest': {
        const result = await analyzeAllInterest([payload.conversation], [payload.candidate]);
        return NextResponse.json({ success: true, data: { interestResult: result.data[0], thinking: result.thinking } });
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
