'use client';

import React, { useState, useRef, useEffect } from 'react';
import JDInput from '@/components/JDInput';
import PipelineProgress from '@/components/PipelineProgress';
import ResultsDashboard from '@/components/ResultsDashboard';
import { 
  parseJdAction, 
  planStrategyAction, 
  discoverCandidatesAction, 
  scoreCandidatesAction, 
  simulateOutreachAction, 
  analyzeInterestAction, 
  reflectAndRankAction 
} from './actions';
import type { PipelineEvent, PipelineResult, PipelineStage, CandidateProfile } from '@/lib/schemas';
import { Bot, AlertCircle } from 'lucide-react';

export default function ClientPage() {
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
      
      const jdRes = await parseJdAction(jdText);
      if (!jdRes.success || !jdRes.data) throw new Error(jdRes.error || 'Failed to parse JD');
      addEvent({ stage: 'jd_parsing', status: 'completed', data: jdRes.data.parsedJD, timestamp: Date.now() });

      // 2. Strategy Planning
      setCurrentStage('strategy_planning');
      addEvent({ stage: 'strategy_planning', status: 'started', timestamp: Date.now() });
      addEvent({ stage: 'strategy_planning', status: 'thinking', thinking: getStageThinking('strategy_planning'), timestamp: Date.now() });
      
      const strategyRes = await planStrategyAction(jdRes.data.parsedJD);
      if (!strategyRes.success || !strategyRes.data) throw new Error(strategyRes.error || 'Failed to plan strategy');
      addEvent({ stage: 'strategy_planning', status: 'thinking', thinking: strategyRes.data.thinking, timestamp: Date.now() });
      addEvent({ stage: 'strategy_planning', status: 'completed', data: strategyRes.data.strategy, timestamp: Date.now() });

      // 3. Candidate Discovery
      setCurrentStage('candidate_discovery');
      addEvent({ stage: 'candidate_discovery', status: 'started', timestamp: Date.now() });
      
      let finalCandidates: CandidateProfile[] = [];
      if (importedCandidatesJson && importedCandidatesJson.length > 0) {
        addEvent({ stage: 'candidate_discovery', status: 'thinking', thinking: `📂 Using ${importedCandidatesJson.length} imported candidates from your database...`, timestamp: Date.now() });
        finalCandidates = importedCandidatesJson;
      } else {
        addEvent({ stage: 'candidate_discovery', status: 'thinking', thinking: getStageThinking('candidate_discovery'), timestamp: Date.now() });
        const candRes = await discoverCandidatesAction(jdRes.data.parsedJD, strategyRes.data.strategy);
        if (!candRes.success || !candRes.data) throw new Error(candRes.error || 'Failed to discover candidates');
        finalCandidates = candRes.data.candidates;
        addEvent({ stage: 'candidate_discovery', status: 'thinking', thinking: candRes.data.thinking, timestamp: Date.now() });
      }
      addEvent({ stage: 'candidate_discovery', status: 'completed', data: finalCandidates, timestamp: Date.now() });

      // 4. Match Scoring
      setCurrentStage('match_scoring');
      addEvent({ stage: 'match_scoring', status: 'started', timestamp: Date.now() });
      addEvent({ stage: 'match_scoring', status: 'thinking', thinking: getStageThinking('match_scoring'), timestamp: Date.now() });
      
      const scoreRes = await scoreCandidatesAction(jdRes.data.parsedJD, finalCandidates, strategyRes.data.strategy);
      if (!scoreRes.success || !scoreRes.data) throw new Error(scoreRes.error || 'Failed to score candidates');
      addEvent({ stage: 'match_scoring', status: 'completed', data: scoreRes.data.matchResults, timestamp: Date.now() });

      // 5. Outreach Simulation
      setCurrentStage('outreach_simulation');
      addEvent({ stage: 'outreach_simulation', status: 'started', timestamp: Date.now() });
      addEvent({ stage: 'outreach_simulation', status: 'thinking', thinking: getStageThinking('outreach_simulation'), timestamp: Date.now() });
      
      const outreachRes = await simulateOutreachAction(jdRes.data.parsedJD, finalCandidates, scoreRes.data.matchResults);
      if (!outreachRes.success || !outreachRes.data) throw new Error(outreachRes.error || 'Failed to simulate outreach');
      addEvent({ stage: 'outreach_simulation', status: 'completed', data: outreachRes.data.conversations, timestamp: Date.now() });

      // 6. Interest Analysis
      setCurrentStage('interest_analysis');
      addEvent({ stage: 'interest_analysis', status: 'started', timestamp: Date.now() });
      addEvent({ stage: 'interest_analysis', status: 'thinking', thinking: getStageThinking('interest_analysis'), timestamp: Date.now() });
      
      const interestRes = await analyzeInterestAction(outreachRes.data.conversations, finalCandidates);
      if (!interestRes.success || !interestRes.data) throw new Error(interestRes.error || 'Failed to analyze interest');
      addEvent({ stage: 'interest_analysis', status: 'completed', data: interestRes.data.interestResults, timestamp: Date.now() });

      // 7. Self-Reflection & Ranking
      setCurrentStage('self_reflection_ranking');
      addEvent({ stage: 'self_reflection_ranking', status: 'started', timestamp: Date.now() });
      addEvent({ stage: 'self_reflection_ranking', status: 'thinking', thinking: getStageThinking('self_reflection_ranking'), timestamp: Date.now() });
      
      const rankRes = await reflectAndRankAction(finalCandidates, scoreRes.data.matchResults, interestRes.data.interestResults, jdRes.data.parsedJD, strategyRes.data.strategy);
      if (!rankRes.success || !rankRes.data) throw new Error(rankRes.error || 'Failed to rank candidates');
      addEvent({ stage: 'self_reflection_ranking', status: 'thinking', thinking: rankRes.data.thinking, timestamp: Date.now() });
      addEvent({ stage: 'self_reflection_ranking', status: 'completed', data: { reflection: rankRes.data.selfReflection, ranking: rankRes.data.finalRanking }, timestamp: Date.now() });

      // Assemble Final Result
      const pipelineResult: PipelineResult = {
        parsedJD: jdRes.data.parsedJD,
        strategy: strategyRes.data.strategy,
        candidates: finalCandidates,
        matchResults: scoreRes.data.matchResults,
        conversations: outreachRes.data.conversations,
        interestResults: interestRes.data.interestResults,
        selfReflection: rankRes.data.selfReflection,
        finalRanking: rankRes.data.finalRanking,
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
