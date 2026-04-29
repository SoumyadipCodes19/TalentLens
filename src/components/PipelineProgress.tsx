'use client';

import React from 'react';
import type { PipelineEvent, PipelineStage } from '@/lib/schemas';
import { BrainCircuit, Search, Users, Activity, MessageSquareText, LineChart, Trophy, Loader2, CheckCircle2 } from 'lucide-react';

const STAGE_META: Record<PipelineStage, { label: string; icon: React.ReactNode; description: string }> = {
  jd_parsing: { label: 'JD Analysis', icon: <Search size={16} />, description: 'Parsing requirements & hidden signals' },
  strategy_planning: { label: 'Strategy Planning', icon: <BrainCircuit size={16} />, description: 'Creating autonomous search strategy' },
  candidate_discovery: { label: 'Candidate Discovery', icon: <Users size={16} />, description: 'Finding matching candidates' },
  match_scoring: { label: 'Match Scoring', icon: <Activity size={16} />, description: 'Evaluating skill-by-skill fit' },
  outreach_simulation: { label: 'Outreach Simulation', icon: <MessageSquareText size={16} />, description: 'Conducting personalized conversations' },
  interest_analysis: { label: 'Interest Analysis', icon: <LineChart size={16} />, description: 'Analyzing sentiment & signals' },
  self_reflection_ranking: { label: 'Reflect & Rank', icon: <Trophy size={16} />, description: 'Self-checking biases, final ranking' },
};

const STAGES: PipelineStage[] = [
  'jd_parsing', 'strategy_planning', 'candidate_discovery', 'match_scoring',
  'outreach_simulation', 'interest_analysis', 'self_reflection_ranking',
];

interface PipelineProgressProps {
  events: PipelineEvent[];
  currentStage: PipelineStage | null;
}

export default function PipelineProgress({ events, currentStage }: PipelineProgressProps) {
  const completedStages = new Set(
    events.filter(e => e.status === 'completed').map(e => e.stage)
  );

  const thinkingMessages = events
    .filter(e => e.status === 'thinking' && e.thinking)
    .slice(-8);

  return (
    <div style={{ paddingTop: '16px' }} className="animate-fade-in">
      <div style={{ marginBottom: '24px' }}>
        <h2 style={{ fontSize: '18px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Loader2 size={20} className="animate-spin text-gradient" />
          Agent Pipeline Running
        </h2>
        <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>The autonomous agent is processing your request.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 280px), 1fr))', gap: '24px' }}>
        {/* Steps */}
        <div className="glass-card-static" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            {STAGES.map((stage, idx) => {
              const meta = STAGE_META[stage];
              const isCompleted = completedStages.has(stage);
              const isActive = currentStage === stage;
              const isPending = !isCompleted && !isActive;

              return (
                <div key={stage} className={`pipeline-step ${isActive ? 'active' : ''} ${isCompleted ? 'completed' : ''}`}>
                  <div className={`step-indicator ${isCompleted ? 'completed' : isActive ? 'active' : 'pending'}`}>
                    {isCompleted ? <CheckCircle2 size={16} /> : isActive ? <div className="spinner" style={{ width: 14, height: 14, borderWidth: 2 }} /> : idx + 1}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ color: isActive ? 'var(--primary-400)' : isCompleted ? 'var(--success)' : 'var(--text-muted)' }}>
                        {meta.icon}
                      </span>
                      <span style={{
                        fontWeight: 600,
                        fontSize: '14px',
                        color: isActive ? 'var(--text-primary)' : isPending ? 'var(--text-muted)' : 'var(--text-secondary)',
                      }}>
                        {meta.label}
                      </span>
                      {isActive && (
                        <span className="chip chip-critical animate-pulse" style={{ fontSize: '10px', padding: '2px 8px' }}>
                          RUNNING
                        </span>
                      )}
                    </div>
                    <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>
                      {meta.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Thinking Panel */}
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px', paddingLeft: '4px' }}>
            <BrainCircuit size={16} className="text-gradient" />
            <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)' }}>
              Live Agent Reasoning
            </span>
          </div>
          <div className="thinking-panel" style={{ flex: 1, minHeight: '300px' }}>
            {thinkingMessages.map((event, idx) => (
              <div key={idx} className="thinking-line animate-slide-in">
                {event.thinking}
              </div>
            ))}
            {thinkingMessages.length === 0 && (
              <div style={{ color: 'var(--text-muted)', fontStyle: 'italic', fontSize: '12px' }}>
                Waiting for agent initialization...
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
