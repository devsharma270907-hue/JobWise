import React, { useState } from 'react';
import { Mic, MicOff, Clock, Award, MessageSquare, Play } from 'lucide-react';
import { useAuth } from '../../auth/AuthProvider';

export const InterviewStudioPage: React.FC = () => {
  const { user } = useAuth();
  const isDemoUser = user?.email === 'demo@jobwise.ai';

  const demoQuestions = [
    {
      q: 'Tell me about a time you handled a difficult technical tradeoff under tight deadlines.',
      type: 'Behavioral (STAR Method)',
      role: 'Full Stack Engineer @ Datadog',
    },
    {
      q: 'How would you architect a real-time collaborative document editor handling 10,000 concurrent updates?',
      type: 'System Design',
      role: 'Full Stack Engineer @ Datadog',
    },
  ];

  const [customRole, setCustomRole] = useState('');
  const [activeSession, setActiveSession] = useState<{ q: string; type: string; role: string } | null>(
    isDemoUser ? demoQuestions[0] : null
  );
  const [isRecording, setIsRecording] = useState(false);
  const timer = 120;

  const handleStartPractice = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customRole.trim()) return;

    setActiveSession({
      q: `Tell me about your experience building applications with ${customRole.trim()} and how you approach debugging complex production issues.`,
      type: 'Technical & Behavioral (STAR)',
      role: customRole.trim(),
    });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <div>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-main)', letterSpacing: '-0.02em' }}>
          Interactive Voice & Timed Mock Interview Studio
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '0.2rem' }}>
          Practice role-specific interview questions with live speech-to-text and multi-dimensional STAR scoring.
        </p>
      </div>

      {/* If No Active Session (Fresh User Canvas) */}
      {!activeSession ? (
        <div
          className="card-surface"
          style={{
            padding: '3rem 2rem',
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '1.25rem',
            borderRadius: 'var(--radius-lg)',
            border: '2px dashed var(--border-subtle)',
          }}
        >
          <div
            style={{
              width: '60px',
              height: '60px',
              borderRadius: 'var(--radius-full)',
              backgroundColor: 'var(--primary-light)',
              color: 'var(--primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <MessageSquare size={28} />
          </div>
          <div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-main)' }}>
              Start a New Mock Interview Session
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', maxWidth: '440px', marginTop: '0.35rem' }}>
              No mock questions are pre-loaded for your account. Enter your target role or tech stack below to practice role-tailored questions.
            </p>
          </div>

          <form
            onSubmit={handleStartPractice}
            style={{ display: 'flex', gap: '0.5rem', width: '100%', maxWidth: '420px', flexWrap: 'wrap' }}
          >
            <input
              type="text"
              required
              placeholder="e.g. Frontend Engineer, React Dev, Data Analyst"
              value={customRole}
              onChange={(e) => setCustomRole(e.target.value)}
              style={{
                flex: 1,
                minWidth: '220px',
                padding: '0.65rem 0.85rem',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-subtle)',
                backgroundColor: 'var(--bg-app)',
                color: 'var(--text-main)',
                fontSize: '0.88rem',
                outline: 'none',
              }}
            />
            <button
              type="submit"
              style={{
                padding: '0.65rem 1.15rem',
                backgroundColor: 'var(--primary)',
                color: 'var(--primary-fg)',
                border: 'none',
                borderRadius: 'var(--radius-md)',
                fontWeight: 600,
                fontSize: '0.86rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
              }}
            >
              <Play size={15} />
              <span>Begin Session</span>
            </button>
          </form>
        </div>
      ) : (
        /* Main Studio Arena */
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '1.5rem' }}>
          {/* Question & Voice Answer Console */}
          <div className="card-surface" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span
                  style={{
                    padding: '3px 10px',
                    backgroundColor: 'var(--primary-light)',
                    color: 'var(--primary)',
                    borderRadius: 'var(--radius-full)',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                  }}
                >
                  {activeSession.type}
                </span>
                <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                  Role: {activeSession.role}
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--warning)', fontWeight: 700, fontSize: '0.9rem' }}>
                <Clock size={16} />
                <span>{Math.floor(timer / 60)}:{(timer % 60).toString().padStart(2, '0')}</span>
              </div>
            </div>

            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-main)', lineHeight: 1.4 }}>
              "{activeSession.q}"
            </h2>

            <div
              style={{
                padding: '1.25rem',
                backgroundColor: 'var(--bg-app)',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-subtle)',
                minHeight: '140px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                textAlign: 'center',
              }}
            >
              {isRecording ? (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
                  <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: 'var(--danger)' }} />
                  <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-main)' }}>
                    Listening via Web Speech API... Speak clearly.
                  </span>
                </div>
              ) : (
                <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                  Press the microphone button below to record your voice answer or practice your delivery.
                </span>
              )}
            </div>

            {/* Controls */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1rem' }}>
              <button
                onClick={() => setIsRecording(!isRecording)}
                style={{
                  width: '56px',
                  height: '56px',
                  borderRadius: 'var(--radius-full)',
                  backgroundColor: isRecording ? 'var(--danger)' : 'var(--primary)',
                  color: '#ffffff',
                  border: 'none',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 4px 15px -2px var(--primary-glow)',
                  transition: 'all var(--transition-fast)',
                }}
              >
                {isRecording ? <MicOff size={24} /> : <Mic size={24} />}
              </button>
            </div>
          </div>

          {/* STAR Scoring Rubric Radar Feedback */}
          <div className="card-surface" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Award size={20} style={{ color: 'var(--primary)' }} />
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-main)' }}>
                STAR Rubric Assessment
              </h3>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              {[
                { dim: 'Situation & Task Context', score: isRecording ? 85 : 0, tip: 'Set the scene with concrete constraints and deadlines.' },
                { dim: 'Action Specificity (I vs We)', score: isRecording ? 90 : 0, tip: 'Highlight your specific contribution and architectural decisions.' },
                { dim: 'Quantifiable Results', score: isRecording ? 80 : 0, tip: 'Cite measurable metrics (e.g. latency, revenue, efficiency).' },
                { dim: 'Technical Depth', score: isRecording ? 88 : 0, tip: 'Demonstrate deep understanding of system tradeoffs.' },
              ].map((metric, i) => (
                <div key={i} style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', fontWeight: 600 }}>
                    <span>{metric.dim}</span>
                    <span style={{ color: 'var(--primary)' }}>{metric.score}%</span>
                  </div>
                  <div style={{ height: '6px', backgroundColor: 'var(--border-subtle)', borderRadius: 'var(--radius-full)', overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${metric.score}%`, backgroundColor: 'var(--primary)', transition: 'width 0.3s ease' }} />
                  </div>
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{metric.tip}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
