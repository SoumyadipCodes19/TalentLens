'use client';

import React from 'react';
import { Hexagon } from 'lucide-react';

export default function Header() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <div style={{
          width: '36px',
          height: '36px',
          borderRadius: '10px',
          background: 'var(--gradient-primary)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: 'var(--shadow-glow)',
          color: 'white'
        }}>
          <Hexagon size={20} strokeWidth={2.5} />
        </div>
        <div>
          <h1 style={{ fontSize: '18px', fontWeight: 800, letterSpacing: '-0.03em', lineHeight: 1.2 }}>
            <span className="text-gradient">TalentLens</span>
          </h1>
          <p style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
            AI Talent Scouting Agent
          </p>
        </div>
      </div>
    </div>
  );
}
