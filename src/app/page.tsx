'use client';

import React, { useState, useRef, useEffect } from 'react';
import JDInput from '@/components/JDInput';
import PipelineProgress from '@/components/PipelineProgress';
import ResultsDashboard from '@/components/ResultsDashboard';
import { executePipeline } from './actions';
import type { PipelineEvent, PipelineResult, PipelineStage, CandidateProfile } from '@/lib/schemas';
import { Bot, AlertCircle } from 'lucide-react';

export default function Home() {
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

  const handleSubmit = async (jdText: string, candidates: CandidateProfile[] | null) => {
    setIsLoading(true);
    setError(null);
    setResult(null);
    setEvents([]);
    setCurrentStage('jd_parsing');

    // Simulate progressive events via polling (since server actions can't stream)
    const stages: PipelineStage[] = [
      'jd_parsing', 'strategy_planning', 'candidate_discovery', 'match_scoring',
      'outreach_simulation', 'interest_analysis', 'self_reflection_ranking',
    ];

    // Start progress simulation
    let stageIndex = 0;
    const progressInterval = setInterval(() => {
      if (stageIndex < stages.length) {
        const stage = stages[stageIndex];
        setCurrentStage(stage);
        setEvents(prev => [...prev, {
          stage,
          status: 'thinking',
          thinking: getStageThinking(stage),
          timestamp: Date.now(),
        }]);
        stageIndex++;
      }
    }, 8000);

    try {
      const response = await executePipeline(
        jdText,
        candidates ? JSON.stringify(candidates) : undefined
      );

      clearInterval(progressInterval);

      if (response.success && response.result) {
        setEvents(response.events);
        setResult(response.result);
        setCurrentStage(null);
      } else {
        setError(response.error || 'Pipeline failed');
      }
    } catch (err) {
      clearInterval(progressInterval);
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
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
    outreach_simulation: 'Conducting personalized outreach conversations via Groq Llama 3.3 — each candidate responds based on their unique personality...',
    interest_analysis: 'Analyzing conversation transcripts — extracting enthusiasm, availability, role-fit questions, and compensation alignment signals...',
    self_reflection_ranking: 'Self-reflecting on scoring — checking for seniority bias, education bias, similarity patterns... then generating final ranking.',
  };
  return messages[stage];
}
