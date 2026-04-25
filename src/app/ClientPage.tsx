'use client';

import React, { useState, useRef, useEffect } from 'react';
import JDInput from '@/components/JDInput';
import PipelineProgress from '@/components/PipelineProgress';
import ResultsDashboard from '@/components/ResultsDashboard';
import type { PipelineEvent, PipelineResult, PipelineStage, CandidateProfile, MatchResult, Conversation, InterestResult } from '@/lib/schemas';
import { Bot, AlertCircle } from 'lucide-react';

export default function ClientPage({ session }: { session: any }) {
  const [isLoading, setIsLoading] = useState(false);
  const [events, setEvents] = useState<PipelineEvent[]>([]);
  const [currentStage, setCurrentStage] = useState<PipelineStage | null>(null);
  const [result, setResult] = useState<PipelineResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const resultsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (result && resultsRef.current) {
      resultsRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [result]);

  const addEvent = (event: PipelineEvent) => {
    setEvents(prev => [...prev, event]);
  };

  const callApi = async (action: string, payload: any) => {
    const res = await fetch('/api/pipeline', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action, payload })
    });
    
    // We check text first in case Vercel returns an HTML 504 page
    const text = await res.text();
    let json;
    try {
      json = JSON.parse(text);
    } catch (e) {
      throw new Error(`Server returned an invalid response (might be a timeout): ${text.slice(0, 100)}`);
    }

    if (!json.success) throw new Error(json.error || 'API failed');
    return json.data;
  };

  const handleSubmit = async (jdText: string, importedCandidatesJson: CandidateProfile[] | null) => {
    setIsLoading(true);
    setError(null);
    setResult(null);
    setEvents([]);
    
    try {
      // 1. JD Parsing
      setCurrentStage('jd_parsing');
      addEvent({ stage: 'jd_parsing', status: 'started', timestamp: Date.now() });
      addEvent({ stage: 'jd_parsing', status: 'thinking', thinking: getStageThinking('jd_parsing'), timestamp: Date.now() });
      
      const jdData = await callApi('parse_jd', { jdText });
      addEvent({ stage: 'jd_parsing', status: 'completed', data: jdData.parsedJD, timestamp: Date.now() });

      // 2. Strategy Planning
      setCurrentStage('strategy_planning');
      addEvent({ stage: 'strategy_planning', status: 'started', timestamp: Date.now() });
      addEvent({ stage: 'strategy_planning', status: 'thinking', thinking: getStageThinking('strategy_planning'), timestamp: Date.now() });
      
      const strategyData = await callApi('plan_strategy', { parsedJD: jdData.parsedJD });
      addEvent({ stage: 'strategy_planning', status: 'thinking', thinking: strategyData.thinking, timestamp: Date.now() });
      addEvent({ stage: 'strategy_planning', status: 'completed', data: strategyData.strategy, timestamp: Date.now() });

      // 3. Candidate Discovery
      setCurrentStage('candidate_discovery');
      addEvent({ stage: 'candidate_discovery', status: 'started', timestamp: Date.now() });
      
      let finalCandidates: CandidateProfile[] = [];
      if (importedCandidatesJson && importedCandidatesJson.length > 0) {
        addEvent({ stage: 'candidate_discovery', status: 'thinking', thinking: `📂 Using ${importedCandidatesJson.length} imported candidates from your database...`, timestamp: Date.now() });
        finalCandidates = importedCandidatesJson;
      } else {
        addEvent({ stage: 'candidate_discovery', status: 'thinking', thinking: getStageThinking('candidate_discovery'), timestamp: Date.now() });
        const candData = await callApi('discover_candidates', { parsedJD: jdData.parsedJD, strategy: strategyData.strategy });
        finalCandidates = candData.candidates;
        addEvent({ stage: 'candidate_discovery', status: 'thinking', thinking: candData.thinking, timestamp: Date.now() });
      }

      // Limit to 5 candidates for non-admins
      const isAdmin = session?.user?.email === process.env.NEXT_PUBLIC_ADMIN_EMAIL;
      if (!isAdmin && finalCandidates.length > 5) {
        addEvent({ stage: 'candidate_discovery', status: 'thinking', thinking: `⚠️ Non-admin usage limit: Truncating list from ${finalCandidates.length} to 5 candidates.`, timestamp: Date.now() });
        finalCandidates = finalCandidates.slice(0, 5);
      }

      addEvent({ stage: 'candidate_discovery', status: 'completed', data: finalCandidates, timestamp: Date.now() });

      // 4. Match Scoring (Granular)
      setCurrentStage('match_scoring');
      addEvent({ stage: 'match_scoring', status: 'started', timestamp: Date.now() });
      addEvent({ stage: 'match_scoring', status: 'thinking', thinking: getStageThinking('match_scoring'), timestamp: Date.now() });
      
      const matchResults: MatchResult[] = [];
      // Execute scoring requests completely concurrently to maximize speed and bypass timeouts
      const scorePromises = finalCandidates.map(async (candidate) => {
        const scoreData = await callApi('score_candidate', { parsedJD: jdData.parsedJD, candidate, strategy: strategyData.strategy });
        matchResults.push(scoreData.matchResult);
        addEvent({ stage: 'match_scoring', status: 'thinking', thinking: `Scored candidate: ${candidate.name}`, timestamp: Date.now() });
      });
      await Promise.all(scorePromises);
      addEvent({ stage: 'match_scoring', status: 'completed', data: matchResults, timestamp: Date.now() });

      // 5. Outreach Simulation (Granular)
      setCurrentStage('outreach_simulation');
      addEvent({ stage: 'outreach_simulation', status: 'started', timestamp: Date.now() });
      addEvent({ stage: 'outreach_simulation', status: 'thinking', thinking: getStageThinking('outreach_simulation'), timestamp: Date.now() });
      
      // Select top 2 candidates for outreach
      const sortedMatches = [...matchResults].sort((a, b) => b.overallMatchScore - a.overallMatchScore);
      const topCandidateIds = sortedMatches.slice(0, 2).map(m => m.candidateId);
      const topCandidates = finalCandidates.filter(c => topCandidateIds.includes(c.id));
      
      const conversations: Conversation[] = [];
      const outreachPromises = topCandidates.map(async (candidate) => {
        const matchResult = matchResults.find(m => m.candidateId === candidate.id);
        const outreachData = await callApi('simulate_outreach', { parsedJD: jdData.parsedJD, candidate, matchResult });
        conversations.push(outreachData.conversation);
        addEvent({ stage: 'outreach_simulation', status: 'thinking', thinking: `Simulated outreach for: ${candidate.name}`, timestamp: Date.now() });
      });
      await Promise.all(outreachPromises);
      addEvent({ stage: 'outreach_simulation', status: 'completed', data: conversations, timestamp: Date.now() });

      // 6. Interest Analysis (Granular)
      setCurrentStage('interest_analysis');
      addEvent({ stage: 'interest_analysis', status: 'started', timestamp: Date.now() });
      addEvent({ stage: 'interest_analysis', status: 'thinking', thinking: getStageThinking('interest_analysis'), timestamp: Date.now() });
      
      const interestResults: InterestResult[] = [];
      const interestPromises = conversations.map(async (conversation) => {
        const candidate = finalCandidates.find(c => c.id === conversation.candidateId);
        const interestData = await callApi('analyze_interest', { conversation, candidate });
        interestResults.push(interestData.interestResult);
        addEvent({ stage: 'interest_analysis', status: 'thinking', thinking: `Analyzed interest for: ${candidate?.name}`, timestamp: Date.now() });
      });
      await Promise.all(interestPromises);
      addEvent({ stage: 'interest_analysis', status: 'completed', data: interestResults, timestamp: Date.now() });

      // 7. Self-Reflection
      setCurrentStage('self_reflection_ranking');
      addEvent({ stage: 'self_reflection_ranking', status: 'started', timestamp: Date.now() });
      addEvent({ stage: 'self_reflection_ranking', status: 'thinking', thinking: '🧠 Self-reflecting on scoring — checking for seniority bias, education bias, similarity patterns...', timestamp: Date.now() });
      
      const reflectData = await callApi('self_reflect', { 
        candidates: finalCandidates, 
        matchResults: matchResults, 
        interestResults: interestResults, 
      });
      addEvent({ stage: 'self_reflection_ranking', status: 'thinking', thinking: reflectData.thinking, timestamp: Date.now() });

      // 8. Final Ranking
      addEvent({ stage: 'self_reflection_ranking', status: 'thinking', thinking: '📊 Generating final executive brief and ranking...', timestamp: Date.now() });
      const rankData = await callApi('generate_final_ranking', {
        candidates: finalCandidates,
        matchResults: matchResults,
        interestResults: interestResults,
        selfReflection: reflectData.selfReflection
      });
      addEvent({ stage: 'self_reflection_ranking', status: 'thinking', thinking: rankData.thinking, timestamp: Date.now() });
      addEvent({ stage: 'self_reflection_ranking', status: 'completed', data: { reflection: reflectData.selfReflection, ranking: rankData.finalRanking }, timestamp: Date.now() });

      // Assemble Final Result
      const pipelineResult: PipelineResult = {
        parsedJD: jdData.parsedJD,
        strategy: strategyData.strategy,
        candidates: finalCandidates,
        matchResults: matchResults,
        conversations: conversations,
        interestResults: interestResults,
        selfReflection: reflectData.selfReflection,
        finalRanking: rankData.finalRanking,
        events: [], // Events are tracked in component state now
      };

      setResult(pipelineResult);
      setCurrentStage(null);

    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : 'An unexpected error occurred during pipeline execution.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="app-layout">
      {/* Sidebar Area (Fixed) */}
      <div className="sidebar">
        <JDInput onSubmit={handleSubmit} isLoading={isLoading} />
      </div>

      {/* Main Content Area (Scrollable) */}
      <div className="main-content">
        <div className="main-inner">
          
          {/* Empty State */}
          {!isLoading && !error && !result && (
            <div style={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', paddingTop: '10vh' }} className="animate-fade-in">
              <div style={{ width: '80px', height: '80px', borderRadius: '24px', background: 'var(--bg-glass-strong)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '24px', border: '1px solid var(--border-subtle)' }}>
                <Bot size={40} className="text-gradient" />
              </div>
              <h2 style={{ fontSize: '24px', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '12px' }}>Awaiting Job Description</h2>
              <p style={{ fontSize: '15px', maxWidth: '400px', textAlign: 'center', lineHeight: 1.6 }}>
                Paste a Job Description in the sidebar to launch the autonomous talent scouting pipeline. The agent will analyze, source, evaluate, and simulate conversations.
              </p>
            </div>
          )}

          {/* Loading / Pipeline Progress */}
          {isLoading && (
            <PipelineProgress events={events} currentStage={currentStage} />
          )}

          {/* Error State */}
          {error && (
            <div className="glass-card-static animate-fade-in" style={{ padding: '24px', borderColor: 'rgba(239,68,68,0.3)', borderLeft: '4px solid var(--error)' }}>
              <h3 style={{ color: 'var(--error)', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <AlertCircle size={18} /> Pipeline Error
              </h3>
              <p style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>{error}</p>
              <button className="btn-secondary" onClick={() => setError(null)} style={{ marginTop: '16px' }}>
                Dismiss
              </button>
            </div>
          )}

          {/* Results State */}
          {result && (
            <div ref={resultsRef}>
              <ResultsDashboard result={result} />
            </div>
          )}

        </div>
      </div>
    </div>
  );
}

function getStageThinking(stage: PipelineStage): string {
  const messages: Record<PipelineStage, string> = {
    jd_parsing: 'Analyzing job description — extracting explicit requirements, inferring hidden needs, and detecting culture signals...',
    strategy_planning: 'Creating autonomous search strategy — deciding which skills to prioritize, where to be flexible, and what deal-breakers to enforce...',
    candidate_discovery: 'Discovering candidates — generating diverse profiles across experience levels, backgrounds, and personality types...',
    match_scoring: 'Evaluating each candidate with granular skill-by-skill analysis, experience alignment, and domain expertise scoring...',
    outreach_simulation: 'Conducting personalized outreach conversations via Groq Llama 3.1 8B — each candidate responds based on their unique personality...',
    interest_analysis: 'Analyzing conversation transcripts — extracting enthusiasm, availability, role-fit questions, and compensation alignment signals...',
    self_reflection_ranking: 'Self-reflecting on scoring — checking for seniority bias, education bias, similarity patterns... then generating final ranking.',
  };
  return messages[stage];
}
