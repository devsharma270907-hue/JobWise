import React, { useState } from 'react';
import { Sparkles, ArrowRight, Plus, Briefcase, X } from 'lucide-react';
import { useAuth } from '../../auth/AuthProvider';

interface GigItem {
  id: string;
  title: string;
  client: string;
  budget: string;
  duration: string;
  fitScore: number;
  brief: string;
}

export const FreelanceGigsPage: React.FC = () => {
  const { user } = useAuth();
  const isDemoUser = user?.email === 'demo@jobwise.ai';

  const demoGigs: GigItem[] = [
    {
      id: 'gig-1',
      title: 'Full Stack React & Node Dashboard Development',
      client: 'SaaS Startup (US)',
      budget: '$2,500 - $3,500 Fixed',
      duration: '3 weeks',
      fitScore: 94,
      brief: 'Need a developer to build analytics graphs and webhook handlers for our telemetry service.',
    },
    {
      id: 'gig-2',
      title: 'TypeScript API Integration & Performance Tuning',
      client: 'E-commerce Brand',
      budget: '$65 / hr',
      duration: 'Ongoing',
      fitScore: 89,
      brief: 'Audit checkout latency and integrate Stripe Elements with error retries.',
    },
  ];

  const [customGigs, setCustomGigs] = useState<GigItem[]>([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Form states
  const [newTitle, setNewTitle] = useState('');
  const [newClient, setNewClient] = useState('');
  const [newBudget, setNewBudget] = useState('$50 - $75 / hr');
  const [newDuration, setNewDuration] = useState('2-4 weeks');
  const [newBrief, setNewBrief] = useState('');

  const displayGigs = isDemoUser ? demoGigs : customGigs;

  const handleAddGig = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newClient.trim()) return;

    const newGig: GigItem = {
      id: `gig-${Date.now()}`,
      title: newTitle.trim(),
      client: newClient.trim(),
      budget: newBudget.trim() || 'Negotiable',
      duration: newDuration.trim() || 'Flexible',
      fitScore: 92,
      brief: newBrief.trim() || 'Target client project proposal.',
    };

    setCustomGigs([newGig, ...customGigs]);
    setNewTitle('');
    setNewClient('');
    setNewBrief('');
    setIsAddModalOpen(false);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-main)', letterSpacing: '-0.02em' }}>
            Freelance Gigs & AI Proposal Generator
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '0.2rem' }}>
            {isDemoUser
              ? 'Matched contracts from freelance feeds. Generate hyper-tailored pitch drafts in seconds.'
              : 'Track contract opportunities and client projects. Generate hyper-tailored pitch drafts in seconds.'}
          </p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          style={{
            padding: '0.65rem 1.1rem',
            backgroundColor: 'var(--primary)',
            color: 'var(--primary-fg)',
            border: 'none',
            borderRadius: 'var(--radius-md)',
            fontWeight: 600,
            fontSize: '0.86rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.45rem',
            boxShadow: '0 2px 8px -2px var(--primary-glow)',
          }}
        >
          <Plus size={16} />
          <span>Add Freelance Project</span>
        </button>
      </div>

      {displayGigs.length === 0 ? (
        <div
          className="card-surface"
          style={{
            padding: '3.5rem 2rem',
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
            <Briefcase size={28} />
          </div>
          <div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-main)' }}>
              No freelance contracts tracked yet
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', maxWidth: '420px', marginTop: '0.35rem' }}>
              Your freelance workspace is completely clean. Click below to add a client project or gig opportunity you are pitching for.
            </p>
          </div>
          <button
            onClick={() => setIsAddModalOpen(true)}
            style={{
              marginTop: '0.5rem',
              padding: '0.65rem 1.25rem',
              backgroundColor: 'var(--primary)',
              color: 'var(--primary-fg)',
              border: 'none',
              borderRadius: 'var(--radius-md)',
              fontWeight: 600,
              fontSize: '0.88rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.45rem',
            }}
          >
            <Plus size={16} />
            <span>Add Your First Gig</span>
          </button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {displayGigs.map((gig) => (
            <div key={gig.id} className="card-surface" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                    <h2 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-main)' }}>{gig.title}</h2>
                    <span
                      style={{
                        padding: '2px 8px',
                        backgroundColor: 'var(--success-light)',
                        color: 'var(--success)',
                        borderRadius: 'var(--radius-full)',
                        fontSize: '0.75rem',
                        fontWeight: 700,
                      }}
                    >
                      {gig.fitScore}% Fit
                    </span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginTop: '0.35rem', fontSize: '0.82rem', color: 'var(--text-muted)', flexWrap: 'wrap' }}>
                    <span>Client: {gig.client}</span>
                    <span style={{ fontWeight: 600, color: 'var(--text-main)' }}>{gig.budget}</span>
                    <span>Duration: {gig.duration}</span>
                  </div>
                </div>

                <button
                  style={{
                    padding: '0.55rem 1rem',
                    backgroundColor: 'var(--primary)',
                    color: 'var(--primary-fg)',
                    border: 'none',
                    borderRadius: 'var(--radius-md)',
                    fontWeight: 600,
                    fontSize: '0.84rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                  }}
                >
                  <Sparkles size={15} />
                  <span>Draft AI Proposal</span>
                  <ArrowRight size={14} />
                </button>
              </div>

              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{gig.brief}</p>
            </div>
          ))}
        </div>
      )}

      {/* Add Custom Gig Modal */}
      {isAddModalOpen && (
        <div
          onClick={() => setIsAddModalOpen(false)}
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.45)',
            backdropFilter: 'blur(3px)',
            zIndex: 100,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1rem',
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="card-surface"
            style={{
              width: '100%',
              maxWidth: '460px',
              padding: '2rem',
              borderRadius: 'var(--radius-lg)',
              display: 'flex',
              flexDirection: 'column',
              gap: '1.25rem',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-main)' }}>
                Add Freelance Project / Gig
              </h2>
              <button
                onClick={() => setIsAddModalOpen(false)}
                style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleAddGig} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                  Project / Gig Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Full Stack React & Node API Integration"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.65rem',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border-subtle)',
                    backgroundColor: 'var(--bg-app)',
                    color: 'var(--text-main)',
                    fontSize: '0.88rem',
                    outline: 'none',
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                  Client / Company Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Design Agency, FinTech Startup"
                  value={newClient}
                  onChange={(e) => setNewClient(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.65rem',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border-subtle)',
                    backgroundColor: 'var(--bg-app)',
                    color: 'var(--text-main)',
                    fontSize: '0.88rem',
                    outline: 'none',
                  }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                    Budget / Rate
                  </label>
                  <input
                    type="text"
                    value={newBudget}
                    onChange={(e) => setNewBudget(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '0.65rem',
                      borderRadius: 'var(--radius-md)',
                      border: '1px solid var(--border-subtle)',
                      backgroundColor: 'var(--bg-app)',
                      color: 'var(--text-main)',
                      fontSize: '0.88rem',
                      outline: 'none',
                    }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                    Estimated Duration
                  </label>
                  <input
                    type="text"
                    value={newDuration}
                    onChange={(e) => setNewDuration(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '0.65rem',
                      borderRadius: 'var(--radius-md)',
                      border: '1px solid var(--border-subtle)',
                      backgroundColor: 'var(--bg-app)',
                      color: 'var(--text-main)',
                      fontSize: '0.88rem',
                      outline: 'none',
                    }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                  Brief / Description
                </label>
                <textarea
                  rows={3}
                  placeholder="e.g. Need a developer to build webhook handlers and a payment checkout flow."
                  value={newBrief}
                  onChange={(e) => setNewBrief(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.65rem',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border-subtle)',
                    backgroundColor: 'var(--bg-app)',
                    color: 'var(--text-main)',
                    fontSize: '0.88rem',
                    outline: 'none',
                  }}
                />
              </div>

              <button
                type="submit"
                style={{
                  marginTop: '0.5rem',
                  padding: '0.75rem',
                  backgroundColor: 'var(--primary)',
                  color: 'var(--primary-fg)',
                  border: 'none',
                  borderRadius: 'var(--radius-md)',
                  fontWeight: 600,
                  fontSize: '0.88rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.45rem',
                }}
              >
                <Plus size={16} />
                <span>Save Project</span>
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
