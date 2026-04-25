'use client';

import React, { useState, useRef } from 'react';
import { SAMPLE_JDS } from '@/lib/sample-jds';
import { parseCSV, parseJSON } from '@/lib/candidate-import';
import type { CandidateProfile } from '@/lib/schemas';
import { FileUp, Play, X, FileText, Code, Database } from 'lucide-react';
import Header from './Header';

interface JDInputProps {
  onSubmit: (jdText: string, candidates: CandidateProfile[] | null) => void;
  isLoading: boolean;
}

export default function JDInput({ onSubmit, isLoading }: JDInputProps) {
  const [jdText, setJdText] = useState('');
  const [importedCandidates, setImportedCandidates] = useState<CandidateProfile[] | null>(null);
  const [fileName, setFileName] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      const text = evt.target?.result as string;
      try {
        let candidates: CandidateProfile[];
        if (file.name.endsWith('.csv')) {
          candidates = parseCSV(text);
        } else {
          candidates = parseJSON(text);
        }
        setImportedCandidates(candidates);
        setFileName(file.name);
      } catch (err) {
        alert('Failed to parse file. Please check the format.');
        console.error(err);
      }
    };
    reader.readAsText(file);
  };

  const getIconForJD = (label: string) => {
    if (label.includes('SWE')) return <Code size={14} />;
    if (label.includes('Manager')) return <FileText size={14} />;
    return <Database size={14} />;
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Sidebar Header */}
      <div className="sidebar-header">
        <Header />
      </div>

      {/* Sidebar Content (Form) */}
      <div className="sidebar-content">
        <div style={{ marginBottom: '24px' }}>
          <h2 style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '12px' }}>
            Job Description Source
          </h2>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '16px' }}>
            {SAMPLE_JDS.map((sample) => (
              <button
                key={sample.title}
                className="btn-secondary"
                onClick={() => setJdText(sample.text)}
                style={{ fontSize: '12px', padding: '6px 12px', gap: '6px' }}
              >
                {getIconForJD(sample.label)} {sample.label}
              </button>
            ))}
          </div>

          <textarea
            className="input-textarea"
            placeholder="Paste job description here...&#10;&#10;Include the role title, requirements, and responsibilities."
            value={jdText}
            onChange={(e) => setJdText(e.target.value)}
            style={{ minHeight: '300px' }}
          />
        </div>

        <div style={{ marginBottom: '32px' }}>
          <h2 style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '12px' }}>
            Candidate Source (Optional)
          </h2>
          <input
            ref={fileRef}
            type="file"
            accept=".csv,.json"
            onChange={handleFileUpload}
            style={{ display: 'none' }}
          />
          <button
            className="btn-secondary"
            onClick={() => fileRef.current?.click()}
            style={{ width: '100%', justifyContent: 'center' }}
          >
            <FileUp size={16} /> Import Candidates (CSV/JSON)
          </button>
          
          {fileName && (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px', background: 'var(--bg-glass-strong)', borderRadius: 'var(--radius-sm)', marginTop: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div className="chip chip-success" style={{ padding: '2px 8px' }}>Active</div>
                <span style={{ fontSize: '12px', color: 'var(--text-primary)' }}>{fileName}</span>
                <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>({importedCandidates?.length})</span>
              </div>
              <button
                onClick={() => { setImportedCandidates(null); setFileName(''); }}
                style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
              >
                <X size={14} />
              </button>
            </div>
          )}
        </div>

        <button
          className="btn-primary"
          onClick={() => onSubmit(jdText, importedCandidates)}
          disabled={!jdText.trim() || isLoading}
          style={{ width: '100%', padding: '16px' }}
        >
          {isLoading ? (
            <><div className="spinner" style={{ width: 16, height: 16 }} /> Running Agent...</>
          ) : (
            <><Play size={16} fill="currentColor" /> Launch Agent Pipeline</>
          )}
        </button>
      </div>

      <div className="sidebar-footer">
        <p>Built with Gemini 2.5 Flash + Groq Llama 3.1 8B</p>
      </div>
    </div>
  );
}
