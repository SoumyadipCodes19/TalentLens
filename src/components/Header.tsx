'use client';

import React from 'react';
import { Aperture, LogOut } from 'lucide-react';
import { signOut } from 'next-auth/react';

export default function Header() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'var(--text-primary)'
        }}>
          <Aperture size={28} strokeWidth={1.5} />
        </div>
        <div>
          <h1 style={{ fontSize: '20px', fontWeight: 600, letterSpacing: '-0.04em', lineHeight: 1 }}>
            <span style={{ color: 'var(--text-primary)' }}>TalentLens</span>
          </h1>
          <p style={{ fontSize: '12px', fontWeight: 400, color: 'var(--text-muted)', marginTop: '2px', letterSpacing: '-0.01em' }}>
            Autonomous Recruiting
          </p>
        </div>
      </div>
      <button 
        onClick={() => signOut()}
        style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px' }}
      >
        <LogOut size={14} /> Sign out
      </button>
    </div>
  );
}
