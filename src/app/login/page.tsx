import React from 'react';
import { auth, signIn } from '@/auth';
import { redirect } from 'next/navigation';
import { Aperture } from 'lucide-react';

export default async function LoginPage() {
  const session = await auth();
  if (session) redirect('/');

  return (
    <div style={{ display: 'flex', height: '100vh', width: '100vw', background: '#000', overflow: 'hidden', fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif" }}>

      {/* Left Panel: Brand */}
      <div style={{
        flex: 1.2, display: 'flex', flexDirection: 'column',
        justifyContent: 'space-between', padding: '56px',
        borderRight: '1px solid rgba(255,255,255,0.05)',
        background: '#000', position: 'relative', overflow: 'hidden'
      }}>

        {/* Subtle noise texture overlay */}
        <div style={{
          position: 'absolute', inset: 0,
          background: 'radial-gradient(ellipse 70% 60% at 0% 100%, rgba(255,255,255,0.02) 0%, transparent 70%)',
          pointerEvents: 'none',
        }} />

        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', position: 'relative' }}>
          <Aperture size={28} strokeWidth={1.5} color="#fff" />
          <span style={{ fontSize: '20px', fontWeight: 500, letterSpacing: '-0.04em', color: '#fff' }}>TalentLens</span>
        </div>

        {/* Main Headline */}
        <div style={{ position: 'relative' }}>
          <h1 style={{
            fontSize: '52px', fontWeight: 400, letterSpacing: '-0.04em',
            lineHeight: 1.05, color: '#fff', maxWidth: '520px', marginBottom: '32px'
          }}>
            The autonomous standard for modern talent scouting.
          </h1>
          <p style={{
            fontSize: '15px', color: 'rgba(255,255,255,0.4)', maxWidth: '420px',
            lineHeight: 1.7, marginBottom: '40px'
          }}>
            TalentLens parses your job description, discovers candidates, executes conversational outreach, and delivers an executive brief with granular Match and Interest scores.
          </p>

          {/* Feature Tags */}
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {['Automated Sourcing', 'LLM Outreach', 'Bias-Free Scoring', 'Interest Analysis'].map(tag => (
              <div key={tag} style={{
                display: 'inline-flex', alignItems: 'center', padding: '6px 14px',
                border: '1px solid rgba(255,255,255,0.1)', borderRadius: '4px',
                fontSize: '12px', color: 'rgba(255,255,255,0.5)', letterSpacing: '0.01em'
              }}>{tag}</div>
            ))}
          </div>
        </div>

        {/* Footer Quote */}
        <div style={{ position: 'relative' }}>
          <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.25)', letterSpacing: '0.01em' }}>
            Powered by Gemini 2.5 Flash · Groq Llama 3.1 8B
          </p>
        </div>
      </div>

      {/* Right Panel: Login */}
      <div style={{
        flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: '#030303'
      }}>
        <div style={{ width: '100%', maxWidth: '380px', padding: '40px' }}>

          <h2 style={{
            fontSize: '26px', fontWeight: 500, letterSpacing: '-0.04em',
            color: '#fff', marginBottom: '8px'
          }}>Sign in</h2>
          <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.4)', marginBottom: '40px', lineHeight: 1.5 }}>
            Access the autonomous recruiting pipeline.
          </p>

          <form
            action={async () => {
              'use server';
              await signIn('google', { redirectTo: '/' });
            }}
          >
            <button
              type="submit"
              style={{
                width: '100%', padding: '14px 20px',
                display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '12px',
                background: '#fff', color: '#000',
                border: '1px solid #fff', borderRadius: '6px',
                fontSize: '14px', fontWeight: 500, cursor: 'pointer',
                fontFamily: 'inherit', letterSpacing: '-0.01em',
                transition: 'all 0.2s'
              }}
            >
              <GoogleIcon />
              Continue with Google
            </button>
          </form>

          {/* Divider */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', margin: '28px 0' }}>
            <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.08)' }} />
            <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.2)' }}>terms</span>
            <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.08)' }} />
          </div>

          <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.25)', lineHeight: 1.6, textAlign: 'center' }}>
            Usage is limited to <strong style={{ color: 'rgba(255,255,255,0.5)' }}>3 pipeline runs per account</strong> and a maximum of 5 candidates per run to ensure fair access.
          </p>
        </div>
      </div>
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
    </svg>
  );
}
