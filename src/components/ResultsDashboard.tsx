'use client';
import React, { useState } from 'react';
import type { PipelineResult } from '@/lib/schemas';
import { Trophy, Users, MessageSquareText, BrainCircuit, Download, FileText, Target, AlertTriangle, CheckCircle, Search, Pin, UserCheck, Activity } from 'lucide-react';

export default function ResultsDashboard({ result }: { result: PipelineResult }) {
  const [activeTab, setActiveTab] = useState<'ranking' | 'candidates' | 'conversations' | 'reflection'>('ranking');
  const { finalRanking, candidates, matchResults, conversations, interestResults, selfReflection, parsedJD, strategy } = result;

  const tabs = [
    { id: 'ranking' as const, label: 'Final Ranking', icon: <Trophy size={16} /> },
    { id: 'candidates' as const, label: 'Candidates', icon: <Users size={16} /> },
    { id: 'conversations' as const, label: 'Conversations', icon: <MessageSquareText size={16} /> },
    { id: 'reflection' as const, label: 'Self-Reflection', icon: <BrainCircuit size={16} /> },
  ];

  const getScoreColor = (score: number) => score >= 75 ? 'var(--success)' : score >= 50 ? 'var(--warning)' : 'var(--error)';
  const getScoreClass = (score: number) => score >= 75 ? 'high' : score >= 50 ? 'medium' : 'low';
  const getRankClass = (rank: number) => rank === 1 ? 'gold' : rank === 2 ? 'silver' : rank === 3 ? 'bronze' : 'other';

  const exportCSV = () => {
    const headers = ['Rank','Name','Match Score','Interest Score','Combined Score','Recommendation','Action Item'];
    const rows = finalRanking.rankedCandidates.map(c =>
      [c.rank, c.candidateName, c.matchScore, c.interestScore, c.combinedScore, c.recommendation, `"${c.actionItem}"`].join(',')
    );
    const csv = [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'talentlens_shortlist.csv'; a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div style={{ paddingBottom: '40px' }}>
      {/* Parsed JD Summary */}
      <div className="glass-card-static animate-fade-in" style={{ padding: '24px', marginBottom: '24px' }}>
        <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <FileText size={18} className="text-gradient" /> Parsed Job Description
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '20px' }}>
          <div><span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Title</span><p style={{ fontWeight: 600, fontSize: '14px' }}>{parsedJD.title}</p></div>
          <div><span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Company</span><p style={{ fontWeight: 600, fontSize: '14px' }}>{parsedJD.company}</p></div>
          <div><span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Experience</span><p style={{ fontWeight: 600, fontSize: '14px' }}>{parsedJD.experienceRange.min}-{parsedJD.experienceRange.max} years</p></div>
          <div><span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Urgency</span><p><span className={`chip chip-${parsedJD.urgencyLevel === 'high' ? 'error' : parsedJD.urgencyLevel === 'medium' ? 'warning' : 'success'}`}>{parsedJD.urgencyLevel.toUpperCase()}</span></p></div>
        </div>
        <div style={{ marginBottom: '16px' }}>
          <span style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'block', marginBottom: '8px' }}>Required Skills</span>
          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
            {parsedJD.requiredSkills.map(s => (
              <span key={s.name} className={`chip chip-${s.importance === 'critical' ? 'critical' : s.importance === 'important' ? 'important' : 'preferred'}`}>{s.name}</span>
            ))}
          </div>
        </div>
        {parsedJD.hiddenRequirements.length > 0 && (
          <div>
            <span style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Search size={12} /> Hidden Requirements (Agent Inferred)
            </span>
            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
              {parsedJD.hiddenRequirements.map((h, i) => <span key={i} className="chip chip-warning">{h}</span>)}
            </div>
          </div>
        )}
      </div>

      {/* Strategy */}
      <div className="glass-card-static animate-fade-in" style={{ padding: '24px', marginBottom: '24px' }}>
        <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Target size={18} className="text-gradient" /> Agent&apos;s Search Strategy
        </h3>
        <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '16px', lineHeight: 1.7 }}>{strategy.idealCandidatePersona}</p>
        <details style={{ cursor: 'pointer' }}>
          <summary style={{ fontSize: '13px', color: 'var(--text-accent)', fontWeight: 600 }}>View agent reasoning &rarr;</summary>
          <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '12px', lineHeight: 1.7, padding: '16px', background: 'var(--bg-glass)', borderRadius: 'var(--radius-sm)' }}>{strategy.agentReasoning}</p>
        </details>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '24px', flexWrap: 'wrap', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '12px' }}>
        {tabs.map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)}
            style={{
              padding: '10px 16px', borderRadius: 'var(--radius-md)', border: 'none', fontSize: '14px', fontWeight: 600, cursor: 'pointer', fontFamily: 'Inter, sans-serif',
              background: activeTab === tab.id ? 'var(--bg-glass-strong)' : 'transparent',
              color: activeTab === tab.id ? 'var(--text-primary)' : 'var(--text-muted)',
              display: 'flex', alignItems: 'center', gap: '8px',
              transition: 'all 0.2s'
            }}>
            <span style={{ color: activeTab === tab.id ? 'var(--primary-400)' : 'inherit' }}>{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </div>

      {/* RANKING TAB */}
      {activeTab === 'ranking' && (
        <div className="animate-fade-in">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: 700 }}>Final Ranked Shortlist</h3>
            <button className="btn-secondary" onClick={exportCSV}>
              <Download size={14} /> Export CSV
            </button>
          </div>
          <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '24px', lineHeight: 1.7 }}>{finalRanking.executiveBrief}</p>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {finalRanking.rankedCandidates.map(rc => (
              <div key={rc.candidateId} className="glass-card" style={{ padding: '24px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '20px', flexWrap: 'wrap' }}>
                  <div className={`rank-badge ${getRankClass(rc.rank)}`}>{rc.rank}</div>
                  <div style={{ flex: 1, minWidth: '200px' }}>
                    <h4 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '4px' }}>{rc.candidateName}</h4>
                    <span className={`chip chip-${rc.recommendation === 'strong_yes' ? 'success' : rc.recommendation === 'yes' ? 'important' : rc.recommendation === 'maybe' ? 'warning' : 'error'}`}>
                      {rc.recommendation.replace('_', ' ').toUpperCase()}
                    </span>
                  </div>
                  <div style={{ display: 'flex', gap: '32px', alignItems: 'center' }}>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Match</div>
                      <div style={{ fontSize: '20px', fontWeight: 800, color: getScoreColor(rc.matchScore) }}>{rc.matchScore}</div>
                    </div>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Interest</div>
                      <div style={{ fontSize: '20px', fontWeight: 800, color: getScoreColor(rc.interestScore) }}>{rc.interestScore}</div>
                    </div>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Combined</div>
                      <div style={{ fontSize: '28px', fontWeight: 900, color: getScoreColor(rc.combinedScore) }}>{rc.combinedScore}</div>
                    </div>
                  </div>
                </div>
                <div style={{ marginTop: '20px' }}>
                  <div style={{ display: 'flex', gap: '16px', marginBottom: '16px' }}>
                    <div style={{ flex: 1 }}>
                      <div className="score-bar-track"><div className={`score-bar-fill ${getScoreClass(rc.matchScore)}`} style={{ width: `${rc.matchScore}%` }} /></div>
                    </div>
                    <div style={{ flex: 1 }}>
                      <div className="score-bar-track"><div className={`score-bar-fill ${getScoreClass(rc.interestScore)}`} style={{ width: `${rc.interestScore}%` }} /></div>
                    </div>
                  </div>
                  <p style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: 1.6, background: 'var(--bg-glass-strong)', padding: '16px', borderRadius: 'var(--radius-md)' }}>{rc.executiveSummary}</p>
                  <p style={{ fontSize: '13px', color: 'var(--text-primary)', marginTop: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Pin size={14} className="text-gradient-accent" /> {rc.actionItem}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* CANDIDATES TAB */}
      {activeTab === 'candidates' && (
        <div className="animate-fade-in" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '20px' }}>
          {candidates.map(c => {
            const match = matchResults.find(m => m.candidateId === c.id);
            return (
              <div key={c.id} className="glass-card" style={{ padding: '24px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
                  <div>
                    <h4 style={{ fontSize: '16px', fontWeight: 700 }}>{c.name}</h4>
                    <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>{c.currentRole} @ {c.currentCompany}</p>
                  </div>
                  {match && <div style={{ fontSize: '24px', fontWeight: 800, color: getScoreColor(match.overallMatchScore) }}>{match.overallMatchScore}</div>}
                </div>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span>{c.experienceYears} yrs</span> &bull; <span>{c.location}</span> &bull; <span>{c.education.degree}</span>
                </div>
                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '16px' }}>
                  {c.skills.slice(0, 6).map(s => (
                    <span key={s.name} className={`chip ${s.proficiency === 'expert' ? 'chip-critical' : s.proficiency === 'advanced' ? 'chip-important' : 'chip-preferred'}`} style={{ fontSize: '11px' }}>
                      {s.name}
                    </span>
                  ))}
                </div>
                {match && (
                  <details style={{ cursor: 'pointer' }}>
                    <summary style={{ fontSize: '13px', color: 'var(--text-accent)', fontWeight: 600 }}>Match breakdown &rarr;</summary>
                    <div style={{ marginTop: '12px', fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.7, background: 'var(--bg-glass)', padding: '12px', borderRadius: 'var(--radius-sm)' }}>
                      <p>{match.matchExplanation}</p>
                      <div style={{ marginTop: '12px' }}>
                        <strong style={{ color: 'var(--success)' }}>Strengths:</strong> {match.strengths.join(', ')}
                      </div>
                      <div style={{ marginTop: '4px' }}>
                        <strong style={{ color: 'var(--error)' }}>Gaps:</strong> {match.gaps.join(', ')}
                      </div>
                    </div>
                  </details>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* CONVERSATIONS TAB */}
      {activeTab === 'conversations' && (
        <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {conversations.map(conv => {
            const candidate = candidates.find(c => c.id === conv.candidateId);
            const interest = interestResults.find(i => i.candidateId === conv.candidateId);
            return (
              <div key={conv.candidateId} className="glass-card-static" style={{ padding: '24px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
                  <div>
                    <h4 style={{ fontSize: '16px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <UserCheck size={16} className="text-gradient" /> {candidate?.name}
                    </h4>
                    <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '4px' }}>Tone: {conv.overallTone} &bull; Personality: {candidate?.personalityType}</p>
                  </div>
                  {interest && (
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Interest</div>
                      <div style={{ fontSize: '24px', fontWeight: 800, color: getScoreColor(interest.overallInterestScore) }}>{interest.overallInterestScore}</div>
                    </div>
                  )}
                </div>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '20px', background: 'var(--bg-glass)', padding: '20px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
                  {conv.messages.map((msg, i) => (
                    <div key={i} style={{ display: 'flex', justifyContent: msg.role === 'recruiter' ? 'flex-end' : 'flex-start' }}>
                      <div className={`chat-bubble ${msg.role}`}>
                        <div style={{ fontSize: '11px', fontWeight: 700, color: msg.role === 'recruiter' ? 'var(--primary-400)' : 'var(--accent-400)', marginBottom: '6px', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '4px' }}>
                          {msg.role === 'recruiter' ? <><BrainCircuit size={12} /> Agent</> : <><Users size={12} /> {candidate?.name?.split(' ')[0]}</>}
                        </div>
                        {msg.content}
                        {msg.interestSignal && (
                          <div style={{ marginTop: '8px', fontSize: '12px', fontStyle: 'italic', color: msg.signalType === 'positive' ? 'var(--success)' : msg.signalType === 'negative' ? 'var(--error)' : 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <Activity size={12} /> {msg.interestSignal}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {interest && interest.keySignals.length > 0 && (
                  <details style={{ cursor: 'pointer' }}>
                    <summary style={{ fontSize: '13px', color: 'var(--text-accent)', fontWeight: 600 }}>Extracted Interest Signals ({interest.keySignals.length}) &rarr;</summary>
                    <div style={{ marginTop: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {interest.keySignals.map((sig, i) => (
                        <div key={i} style={{ fontSize: '13px', padding: '12px', background: 'var(--bg-glass-strong)', borderRadius: 'var(--radius-sm)', borderLeft: `3px solid ${sig.type === 'positive' ? 'var(--success)' : sig.type === 'negative' ? 'var(--error)' : 'var(--text-muted)'}` }}>
                          <span className={`chip chip-${sig.type === 'positive' ? 'success' : sig.type === 'negative' ? 'error' : 'preferred'}`} style={{ marginRight: '12px', fontSize: '10px' }}>{sig.type.toUpperCase()}</span>
                          <span style={{ fontWeight: 500 }}>{sig.signal}</span> <span style={{ color: 'var(--text-muted)' }}>&mdash; &quot;{sig.quote}&quot;</span>
                        </div>
                      ))}
                    </div>
                  </details>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* REFLECTION TAB */}
      {activeTab === 'reflection' && (
        <div className="animate-fade-in">
          <div className="glass-card-static" style={{ padding: '24px', marginBottom: '20px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <BrainCircuit size={18} className="text-gradient" /> Agent Self-Reflection
            </h3>
            <p style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: 1.7, marginBottom: '20px' }}>{selfReflection.overallAssessment}</p>
            <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
              <div className="chip chip-critical" style={{ padding: '6px 16px' }}><Target size={14} /> Confidence: {selfReflection.confidenceInResults}%</div>
              <div className="chip chip-warning" style={{ padding: '6px 16px' }}><AlertTriangle size={14} /> Biases Found: {selfReflection.biasesDetected.length}</div>
              <div className="chip chip-success" style={{ padding: '6px 16px' }}><CheckCircle size={14} /> Adjustments: {selfReflection.scoreAdjustments.length}</div>
            </div>
          </div>

          {selfReflection.biasesDetected.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '24px' }}>
              <h4 style={{ fontSize: '15px', fontWeight: 700 }}>Biases Detected & Corrected</h4>
              {selfReflection.biasesDetected.map((b, i) => (
                <div key={i} className="glass-card" style={{ padding: '20px', borderLeft: '4px solid var(--warning)' }}>
                  <div style={{ fontWeight: 600, fontSize: '15px', marginBottom: '8px' }}>{b.biasType}</div>
                  <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '12px' }}>{b.description}</p>
                  <p style={{ fontSize: '13px', color: 'var(--success)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <CheckCircle size={14} /> Correction: {b.correction}
                  </p>
                </div>
              ))}
            </div>
          )}

          {selfReflection.scoreAdjustments.length > 0 && (
            <div>
              <h4 style={{ fontSize: '15px', fontWeight: 700, marginBottom: '16px' }}>Score Adjustments Log</h4>
              <div style={{ overflowX: 'auto', background: 'var(--bg-glass)', borderRadius: 'var(--radius-md)', padding: '16px' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid var(--border-medium)' }}>
                      <th style={{ textAlign: 'left', padding: '12px 8px', color: 'var(--text-muted)' }}>Candidate ID</th>
                      <th style={{ padding: '12px 8px', color: 'var(--text-muted)' }}>Orig Match</th>
                      <th style={{ padding: '12px 8px', color: 'var(--text-muted)' }}>Adj Match</th>
                      <th style={{ padding: '12px 8px', color: 'var(--text-muted)' }}>Orig Interest</th>
                      <th style={{ padding: '12px 8px', color: 'var(--text-muted)' }}>Adj Interest</th>
                      <th style={{ textAlign: 'left', padding: '12px 8px', color: 'var(--text-muted)' }}>Reason</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selfReflection.scoreAdjustments.map((adj, i) => (
                      <tr key={i} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                        <td style={{ padding: '12px 8px', fontWeight: 600 }}>{adj.candidateId}</td>
                        <td style={{ padding: '12px 8px', textAlign: 'center' }}>{adj.originalMatchScore}</td>
                        <td style={{ padding: '12px 8px', textAlign: 'center', color: adj.adjustedMatchScore > adj.originalMatchScore ? 'var(--success)' : adj.adjustedMatchScore < adj.originalMatchScore ? 'var(--error)' : 'inherit', fontWeight: 600 }}>{adj.adjustedMatchScore}</td>
                        <td style={{ padding: '12px 8px', textAlign: 'center' }}>{adj.originalInterestScore}</td>
                        <td style={{ padding: '12px 8px', textAlign: 'center', color: adj.adjustedInterestScore > adj.originalInterestScore ? 'var(--success)' : adj.adjustedInterestScore < adj.originalInterestScore ? 'var(--error)' : 'inherit', fontWeight: 600 }}>{adj.adjustedInterestScore}</td>
                        <td style={{ padding: '12px 8px', fontSize: '13px', color: 'var(--text-secondary)' }}>{adj.reason}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
