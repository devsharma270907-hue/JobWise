import React, { useState } from 'react';
import {
  Clock,
  Plus,
  X,
  Sparkles,
  Trash2,
  FolderOpen,
  Loader2,
} from 'lucide-react';
import {
  useApplications,
  useCreateApplication,
  useUpdateApplicationStatus,
  useDeleteApplication,
  type Application,
} from '../../lib/api/applications';

export const KanbanBoardPage: React.FC = () => {
  const { data: appData, isLoading } = useApplications();
  const createMutation = useCreateApplication();
  const updateStatusMutation = useUpdateApplicationStatus();
  const deleteMutation = useDeleteApplication();

  const [selectedApp, setSelectedApp] = useState<Application | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // New application form state
  const [newCompany, setNewCompany] = useState('');
  const [newRole, setNewRole] = useState('');
  const [newLocation, setNewLocation] = useState('Remote');
  const [newStage, setNewStage] = useState<'saved' | 'applied' | 'interviewing' | 'offer'>('saved');

  const applications = appData?.data || [];

  const columns: Array<{ id: 'saved' | 'applied' | 'interviewing' | 'offer' | 'rejected'; label: string; color: string }> = [
    { id: 'saved', label: 'Saved', color: 'var(--text-muted)' },
    { id: 'applied', label: 'Applied', color: 'var(--info)' },
    { id: 'interviewing', label: 'Interviewing', color: 'var(--warning)' },
    { id: 'offer', label: 'Offer Received', color: 'var(--success)' },
    { id: 'rejected', label: 'Archived / Rejected', color: 'var(--text-subtle)' },
  ];

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCompany.trim() || !newRole.trim()) return;

    await createMutation.mutateAsync({
      company: newCompany.trim(),
      jobTitle: newRole.trim(),
      location: newLocation.trim(),
      status: newStage,
    });

    setNewCompany('');
    setNewRole('');
    setNewLocation('Remote');
    setNewStage('saved');
    setIsAddModalOpen(false);
  };

  const handleStatusChange = async (appId: string, targetStatus: string) => {
    await updateStatusMutation.mutateAsync({
      id: appId,
      status: targetStatus,
    });
    if (selectedApp && selectedApp._id === appId) {
      setSelectedApp({ ...selectedApp, status: targetStatus as any });
    }
  };

  const handleDelete = async (appId: string) => {
    if (window.confirm('Are you sure you want to delete this application?')) {
      await deleteMutation.mutateAsync(appId);
      if (selectedApp?._id === appId) {
        setSelectedApp(null);
      }
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem', position: 'relative' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-main)', letterSpacing: '-0.02em' }}>
            Application CRM & Kanban Pipeline
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '0.2rem' }}>
            Manage lifecycle transitions, recruiter contacts, and negotiation milestones.
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
          <span>Add Application</span>
        </button>
      </div>

      {isLoading ? (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '4rem', color: 'var(--text-muted)', gap: '0.5rem' }}>
          <Loader2 size={24} className="animate-spin" />
          <span>Loading your application pipeline...</span>
        </div>
      ) : applications.length === 0 ? (
        /* Empty state for brand new users */
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
              width: '64px',
              height: '64px',
              borderRadius: 'var(--radius-full)',
              backgroundColor: 'var(--primary-light)',
              color: 'var(--primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <FolderOpen size={30} />
          </div>
          <div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-main)' }}>
              No applications tracked yet
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', maxWidth: '420px', marginTop: '0.35rem' }}>
              Your workspace is completely clean. Click the button below to add your first job application or track opportunities from the Job Feed.
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
            <span>Add Your First Application</span>
          </button>
        </div>
      ) : (
        /* Kanban Columns Grid */
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(5, minmax(260px, 1fr))',
            gap: '1rem',
            overflowX: 'auto',
            paddingBottom: '1rem',
          }}
        >
          {columns.map((col) => {
            const colApps = applications.filter((a) => a.status === col.id);
            return (
              <div
                key={col.id}
                style={{
                  backgroundColor: 'var(--bg-surface)',
                  borderRadius: 'var(--radius-lg)',
                  border: '1px solid var(--border-subtle)',
                  padding: '1rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.85rem',
                  minHeight: '580px',
                }}
              >
                {/* Column Header */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: '0.5rem', borderBottom: '1px solid var(--border-subtle)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{ width: '8px', height: '8px', borderRadius: 'var(--radius-full)', backgroundColor: col.color }} />
                    <span style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-main)' }}>{col.label}</span>
                  </div>
                  <span
                    style={{
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      padding: '2px 7px',
                      borderRadius: 'var(--radius-full)',
                      backgroundColor: 'var(--bg-app)',
                      color: 'var(--text-muted)',
                    }}
                  >
                    {colApps.length}
                  </span>
                </div>

                {/* Application Cards */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', flex: 1 }}>
                  {colApps.map((app) => {
                    const daysAgo = Math.max(1, Math.round((Date.now() - new Date(app.updatedAt || app.createdAt).getTime()) / (1000 * 60 * 60 * 24)));
                    return (
                      <div
                        key={app._id}
                        onClick={() => setSelectedApp(app)}
                        className="card-surface card-interactive"
                        style={{
                          padding: '1rem',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '0.6rem',
                          cursor: 'pointer',
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                          <span style={{ fontSize: '0.92rem', fontWeight: 700, color: 'var(--text-main)' }}>
                            {app.company}
                          </span>
                        </div>
                        <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>{app.jobTitle}</div>

                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.72rem', color: 'var(--text-subtle)', marginTop: '0.25rem' }}>
                          <span style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                            <Clock size={12} /> {daysAgo}d ago
                          </span>
                          {app.location && <span style={{ fontWeight: 500, color: 'var(--text-muted)' }}>{app.location}</span>}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add Custom Application Modal */}
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
                Add New Application
              </h2>
              <button
                onClick={() => setIsAddModalOpen(false)}
                style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreate} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                  Company Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Google, Microsoft, Startup"
                  value={newCompany}
                  onChange={(e) => setNewCompany(e.target.value)}
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
                  Job Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Software Engineer, Frontend Developer"
                  value={newRole}
                  onChange={(e) => setNewRole(e.target.value)}
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
                  Location
                </label>
                <input
                  type="text"
                  placeholder="e.g. Remote, San Francisco, New York"
                  value={newLocation}
                  onChange={(e) => setNewLocation(e.target.value)}
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
                  Initial Stage
                </label>
                <select
                  value={newStage}
                  onChange={(e) => setNewStage(e.target.value as any)}
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
                >
                  <option value="saved">Saved (Bookmark)</option>
                  <option value="applied">Applied (Submitted)</option>
                  <option value="interviewing">Interviewing (In Progress)</option>
                  <option value="offer">Offer Received</option>
                </select>
              </div>

              <button
                type="submit"
                disabled={createMutation.isPending}
                style={{
                  marginTop: '0.5rem',
                  padding: '0.75rem',
                  backgroundColor: 'var(--primary)',
                  color: 'var(--primary-fg)',
                  border: 'none',
                  borderRadius: 'var(--radius-md)',
                  fontWeight: 600,
                  fontSize: '0.88rem',
                  cursor: createMutation.isPending ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.45rem',
                }}
              >
                {createMutation.isPending ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />}
                <span>{createMutation.isPending ? 'Saving...' : 'Add Application'}</span>
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Slide-over CRM Detail Drawer */}
      {selectedApp && (
        <div
          onClick={() => setSelectedApp(null)}
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.4)',
            backdropFilter: 'blur(3px)',
            zIndex: 90,
            display: 'flex',
            justifyContent: 'flex-end',
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              width: '460px',
              maxWidth: '90vw',
              height: '100vh',
              backgroundColor: 'var(--bg-surface)',
              borderLeft: '1px solid var(--border-subtle)',
              padding: '2rem 1.75rem',
              overflowY: 'auto',
              display: 'flex',
              flexDirection: 'column',
              gap: '1.5rem',
              animation: 'fadeIn 0.2s ease-out',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <span
                  style={{
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    color: 'var(--primary)',
                  }}
                >
                  Application Details
                </span>
                <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-main)', marginTop: '2px' }}>
                  {selectedApp.company}
                </h2>
                <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>{selectedApp.jobTitle}</div>
              </div>
              <button
                onClick={() => setSelectedApp(null)}
                style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Stage Selector */}
            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
                Move Application Stage
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.5rem' }}>
                {columns.map((c) => {
                  const isActive = selectedApp.status === c.id;
                  return (
                    <button
                      key={c.id}
                      onClick={() => handleStatusChange(selectedApp._id, c.id)}
                      style={{
                        padding: '0.5rem',
                        borderRadius: 'var(--radius-sm)',
                        border: isActive ? `2px solid ${c.color}` : '1px solid var(--border-subtle)',
                        backgroundColor: isActive ? 'var(--bg-app)' : 'var(--bg-surface)',
                        color: 'var(--text-main)',
                        fontWeight: isActive ? 700 : 500,
                        fontSize: '0.78rem',
                        cursor: 'pointer',
                        textAlign: 'left',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.4rem',
                      }}
                    >
                      <span style={{ width: '6px', height: '6px', borderRadius: 'var(--radius-full)', backgroundColor: c.color }} />
                      <span>{c.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Offer Evaluator (If in Offer stage) */}
            {selectedApp.status === 'offer' && (
              <div
                style={{
                  padding: '1rem',
                  backgroundColor: 'var(--success-light)',
                  border: '1px solid var(--success)',
                  borderRadius: 'var(--radius-md)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.5rem',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--success)', fontWeight: 700, fontSize: '0.85rem' }}>
                  <Sparkles size={16} />
                  <span>Offer Negotiation Matrix Active</span>
                </div>
                <p style={{ fontSize: '0.78rem', color: 'var(--text-main)' }}>
                  This compensation package is recorded in your offers. Use the AI Career Co-pilot to generate counter-negotiation points.
                </p>
              </div>
            )}

            {/* Location & Details */}
            {selectedApp.location && (
              <div style={{ padding: '0.75rem 1rem', backgroundColor: 'var(--bg-app)', borderRadius: 'var(--radius-md)', fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                <strong>Location:</strong> {selectedApp.location}
              </div>
            )}

            {/* Delete Application Button */}
            <div style={{ marginTop: 'auto', paddingTop: '1rem', borderTop: '1px solid var(--border-subtle)' }}>
              <button
                onClick={() => handleDelete(selectedApp._id)}
                disabled={deleteMutation.isPending}
                style={{
                  width: '100%',
                  padding: '0.65rem',
                  backgroundColor: 'var(--danger-light)',
                  color: 'var(--danger)',
                  border: '1px solid var(--danger)',
                  borderRadius: 'var(--radius-md)',
                  fontWeight: 600,
                  fontSize: '0.82rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.4rem',
                }}
              >
                <Trash2 size={15} />
                <span>Delete Application</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
