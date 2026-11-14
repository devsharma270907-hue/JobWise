import React, { useState } from 'react';
import { ExternalLink, BookOpen, Plus, TrendingUp } from 'lucide-react';
import { useAuth } from '../../auth/AuthProvider';

interface SkillItem {
  id: string;
  name: string;
  status: 'missing' | 'acquired';
  priority: string;
  matchesImpact: string;
  resource?: string;
}

export const SkillGapsPage: React.FC = () => {
  const { user } = useAuth();
  const isDemoUser = user?.email === 'demo@jobwise.ai';

  const demoSkills: SkillItem[] = [
    { id: 's1', name: 'Docker & Containerization', status: 'missing', priority: 'High', matchesImpact: '+14% match boost', resource: 'Docker for Node.js Microservices (Official Docs)' },
    { id: 's2', name: 'GraphQL & Apollo Client', status: 'missing', priority: 'Medium', matchesImpact: '+9% match boost', resource: 'Fullstack GraphQL Mastery' },
    { id: 's3', name: 'TypeScript Strict Mode', status: 'acquired', priority: 'Core', matchesImpact: 'Verified on Resume' },
    { id: 's4', name: 'React 19 & Server Components', status: 'acquired', priority: 'Core', matchesImpact: 'Verified on Resume' },
  ];

  const [skills, setSkills] = useState<SkillItem[]>(isDemoUser ? demoSkills : []);
  const [newSkillName, setNewSkillName] = useState('');
  const [newPriority, setNewPriority] = useState('High');

  const toggleAcquired = (id: string) => {
    setSkills(
      skills.map((s) =>
        s.id === id ? { ...s, status: s.status === 'acquired' ? 'missing' : 'acquired' } : s
      )
    );
  };

  const handleAddSkill = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSkillName.trim()) return;

    const newSkill: SkillItem = {
      id: `skill-${Date.now()}`,
      name: newSkillName.trim(),
      status: 'missing',
      priority: newPriority,
      matchesImpact: 'Target Skill Added',
    };

    setSkills([...skills, newSkill]);
    setNewSkillName('');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <div>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-main)', letterSpacing: '-0.02em' }}>
          Interactive Skill Gap & Learning Roadmap
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '0.2rem' }}>
          Target role benchmark analysis. Marking skills as acquired recalculates your job fit scores dynamically.
        </p>
      </div>

      {/* Add Skill Form */}
      <form
        onSubmit={handleAddSkill}
        className="card-surface"
        style={{
          padding: '1.25rem 1.5rem',
          display: 'flex',
          gap: '0.75rem',
          alignItems: 'center',
          flexWrap: 'wrap',
        }}
      >
        <input
          type="text"
          required
          placeholder="Enter a skill (e.g. Next.js, Python, Kubernetes, System Design)..."
          value={newSkillName}
          onChange={(e) => setNewSkillName(e.target.value)}
          style={{
            flex: 1,
            minWidth: '240px',
            padding: '0.65rem 0.85rem',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border-subtle)',
            backgroundColor: 'var(--bg-app)',
            color: 'var(--text-main)',
            fontSize: '0.88rem',
            outline: 'none',
          }}
        />
        <select
          value={newPriority}
          onChange={(e) => setNewPriority(e.target.value)}
          style={{
            padding: '0.65rem',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border-subtle)',
            backgroundColor: 'var(--bg-app)',
            color: 'var(--text-main)',
            fontSize: '0.88rem',
            outline: 'none',
          }}
        >
          <option value="High">High Priority</option>
          <option value="Medium">Medium Priority</option>
          <option value="Core">Core Fundamental</option>
        </select>
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
          <Plus size={16} />
          <span>Add Skill</span>
        </button>
      </form>

      {/* Skills List or Clean Empty State */}
      {skills.length === 0 ? (
        <div
          className="card-surface"
          style={{
            padding: '3rem 2rem',
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '1rem',
            borderRadius: 'var(--radius-lg)',
            border: '2px dashed var(--border-subtle)',
          }}
        >
          <div
            style={{
              width: '56px',
              height: '56px',
              borderRadius: 'var(--radius-full)',
              backgroundColor: 'var(--primary-light)',
              color: 'var(--primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <TrendingUp size={28} />
          </div>
          <div>
            <h2 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--text-main)' }}>
              No skills tracked in your roadmap yet
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', maxWidth: '420px', marginTop: '0.25rem' }}>
              Your skill gap roadmap is clean. Use the form above to add the technologies, frameworks, and competencies you plan to master.
            </p>
          </div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {skills.map((item) => {
            const isAcquired = item.status === 'acquired';
            return (
              <div
                key={item.id}
                className="card-surface"
                style={{
                  padding: '1.25rem 1.5rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '1rem',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <input
                    type="checkbox"
                    checked={isAcquired}
                    onChange={() => toggleAcquired(item.id)}
                    style={{ width: '18px', height: '18px', cursor: 'pointer', accentColor: 'var(--primary)' }}
                  />
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                      <span
                        style={{
                          fontSize: '0.95rem',
                          fontWeight: 700,
                          color: isAcquired ? 'var(--text-muted)' : 'var(--text-main)',
                          textDecoration: isAcquired ? 'line-through' : 'none',
                        }}
                      >
                        {item.name}
                      </span>
                      <span
                        style={{
                          padding: '1px 7px',
                          backgroundColor: isAcquired ? 'var(--success-light)' : 'var(--warning-light)',
                          color: isAcquired ? 'var(--success)' : 'var(--warning)',
                          borderRadius: 'var(--radius-full)',
                          fontSize: '0.72rem',
                          fontWeight: 700,
                        }}
                      >
                        {item.priority}
                      </span>
                    </div>
                    <div style={{ fontSize: '0.78rem', color: isAcquired ? 'var(--success)' : 'var(--primary)', fontWeight: 600, marginTop: '2px' }}>
                      {isAcquired ? '✓ Marked as Acquired' : item.matchesImpact}
                    </div>
                  </div>
                </div>

                {item.resource && !isAcquired && (
                  <button
                    style={{
                      padding: '0.45rem 0.85rem',
                      borderRadius: 'var(--radius-md)',
                      border: '1px solid var(--border-subtle)',
                      backgroundColor: 'var(--bg-app)',
                      fontSize: '0.8rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.4rem',
                    }}
                  >
                    <BookOpen size={14} />
                    <span>Start Course</span>
                    <ExternalLink size={12} />
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
