import React from 'react';
import { useAuth } from '../../auth/AuthProvider';
import { useNavigate } from 'react-router-dom';
import {
  Sparkles,
  Clock,
  ArrowRight,
  Building2,
  MapPin,
  ChevronRight,
  Flame,
  FileText,
  Briefcase,
  Plus,
} from 'lucide-react';
import { useApplications } from '../../lib/api/applications';
import { useJobs } from '../../lib/api/jobs';
import { useResumes } from '../../lib/api/resumes';

export const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { data: appData } = useApplications();

  const counts = appData?.countsByStatus || {
    saved: 0,
    applied: 0,
    interviewing: 0,
    offer: 0,
    rejected: 0,
  };
  const applications = appData?.data || [];
  const totalApps = (counts.saved || 0) + (counts.applied || 0) + (counts.interviewing || 0) + (counts.offer || 0);

  // Dynamic funnel stages from user's live applications
  const funnelStages = [
    {
      label: 'Saved',
      count: counts.saved || 0,
      pct: totalApps > 0 ? `${Math.round(((counts.saved || 0) / totalApps) * 100)}%` : '0%',
      color: 'var(--text-muted)',
    },
    {
      label: 'Applied',
      count: counts.applied || 0,
      pct: totalApps > 0 ? `${Math.round(((counts.applied || 0) / totalApps) * 100)}%` : '0%',
      color: 'var(--info)',
    },
    {
      label: 'Interviewing',
      count: counts.interviewing || 0,
      pct: totalApps > 0 ? `${Math.round(((counts.interviewing || 0) / totalApps) * 100)}%` : '0%',
      color: 'var(--warning)',
    },
    {
      label: 'Offers',
      count: counts.offer || 0,
      pct: totalApps > 0 ? `${Math.round(((counts.offer || 0) / totalApps) * 100)}%` : '0%',
      color: 'var(--success)',
    },
  ];

  // Dynamic follow-up alerts from real applied/interviewing items
  const followUpAlerts = applications
    .filter((a) => a.status === 'applied' || a.status === 'interviewing')
    .slice(0, 3)
    .map((a) => {
      const days = Math.max(1, Math.round((Date.now() - new Date(a.updatedAt || a.createdAt).getTime()) / (1000 * 60 * 60 * 24)));
      return {
        company: a.company,
        role: a.jobTitle,
        days,
        status: a.status === 'applied' ? `Applied (${days}d ago)` : `Interviewing (${days}d in stage)`,
        action: a.status === 'applied' ? 'Send Follow-up Note' : 'Review Interview Notes',
      };
    });

  const isDemoUser = user?.email === 'demo@jobwise.ai';

  const { data: jobsResponse } = useJobs({ limit: 3 });
  const { data: resumes = [] } = useResumes();
  const hasUploadedResume = resumes.length > 0;

  const dynamicMatches = (jobsResponse?.data || []).slice(0, 3).map((item) => ({
    id: item.job._id,
    title: item.job.title,
    company: item.job.company,
    location: item.job.location,
    comp: item.job.salaryRange || 'Competitive',
    matchScore: item.match?.fitScore ?? (hasUploadedResume ? 75 : 85),
    rationale:
      item.match?.rationale ||
      `Matches key skills: ${item.job.skills.slice(0, 3).join(', ')}.`,
  }));

  const demoMatches = [
    {
      id: 'job-1',
      title: 'Software Engineer, Early Career',
      company: 'Datadog',
      location: 'New York / Remote',
      comp: '$120,000 - $145,000',
      matchScore: 92,
      rationale: 'Strong React & Node match; aligns with your target full-stack focus.',
    },
    {
      id: 'job-2',
      title: 'Full Stack Developer',
      company: 'Vercel',
      location: 'Remote',
      comp: '$130,000 - $160,000',
      matchScore: 88,
      rationale: 'TypeScript & Next.js synergy; missing: Docker deployment experience.',
    },
    {
      id: 'job-3',
      title: 'Associate Product Engineer',
      company: 'Figma',
      location: 'San Francisco, CA',
      comp: '$125,000 - $150,000',
      matchScore: 84,
      rationale: 'High UI polish & component architecture alignment.',
    },
  ];

  const topMatches =
    dynamicMatches.length > 0
      ? dynamicMatches
      : isDemoUser
      ? demoMatches
      : [];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Hero Welcome Banner with Logo Emblem */}
      <div
        className="card-surface"
        style={{
          padding: '1.75rem 2rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: 'linear-gradient(135deg, var(--bg-surface) 0%, var(--primary-light) 100%)',
          border: '1px solid var(--border-subtle)',
          position: 'relative',
          overflow: 'hidden',
          flexWrap: 'wrap',
          gap: '1rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', zIndex: 1 }}>
          <img
            src="/jobwise-logo.png"
            alt="JobWise"
            style={{ width: '68px', height: '68px', objectFit: 'contain' }}
          />
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
              <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-main)' }}>
                Welcome, {user?.name?.split(' ')[0] || 'Seeker'}!
              </h1>
              {totalApps > 0 ? (
                <span
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                    padding: '2px 8px',
                    backgroundColor: 'rgba(245, 158, 11, 0.15)',
                    color: '#d97706',
                    borderRadius: 'var(--radius-full)',
                    fontSize: '0.72rem',
                    fontWeight: 700,
                  }}
                >
                  <Flame size={12} /> Active Pipeline ({totalApps} trackings)
                </span>
              ) : (
                <span
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                    padding: '2px 8px',
                    backgroundColor: 'var(--primary-light)',
                    color: 'var(--primary)',
                    borderRadius: 'var(--radius-full)',
                    fontSize: '0.72rem',
                    fontWeight: 700,
                  }}
                >
                  <Sparkles size={12} /> Ready to Launch
                </span>
              )}
            </div>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', marginTop: '0.25rem' }}>
              {totalApps > 0
                ? `Your AI career co-pilot is actively monitoring ${totalApps} applications in your CRM pipeline.`
                : 'Your career cockpit is completely clean. Feed your target jobs, track applications, and optimize your resume.'}
            </p>
          </div>
        </div>

        <button
          onClick={() => navigate('/jobs')}
          style={{
            zIndex: 1,
            padding: '0.65rem 1.15rem',
            backgroundColor: 'var(--primary)',
            color: 'var(--primary-fg)',
            border: 'none',
            borderRadius: 'var(--radius-md)',
            fontWeight: 600,
            fontSize: '0.85rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            boxShadow: '0 4px 12px -2px var(--primary-glow)',
          }}
        >
          <Sparkles size={16} />
          <span>Browse Job Matches</span>
        </button>
      </div>

      {/* If Brand New User (0 Applications), show Quick Start Onboarding Actions */}
      {totalApps === 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
          <div
            onClick={() => navigate('/resume')}
            className="card-surface card-interactive"
            style={{ padding: '1.25rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '1rem' }}
          >
            <div style={{ width: '44px', height: '44px', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--primary-light)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <FileText size={22} />
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: '0.92rem', color: 'var(--text-main)' }}>1. Upload Your Resume</div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Get instant ATS score & keyword match breakdown</div>
            </div>
          </div>

          <div
            onClick={() => navigate('/applications')}
            className="card-surface card-interactive"
            style={{ padding: '1.25rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '1rem' }}
          >
            <div style={{ width: '44px', height: '44px', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--success-light)', color: 'var(--success)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Plus size={22} />
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: '0.92rem', color: 'var(--text-main)' }}>2. Add Target Companies</div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Organize your search in the Kanban CRM pipeline</div>
            </div>
          </div>

          <div
            onClick={() => navigate('/jobs')}
            className="card-surface card-interactive"
            style={{ padding: '1.25rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '1rem' }}
          >
            <div style={{ width: '44px', height: '44px', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--warning-light)', color: 'var(--warning)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Briefcase size={22} />
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: '0.92rem', color: 'var(--text-main)' }}>3. Explore Opportunities</div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Discover high-match internships & tech roles</div>
            </div>
          </div>
        </div>
      )}

      {/* Metrics Row: Funnel Conversion + Weekly Velocity Target */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>
        {/* Job Search Funnel Card */}
        <div className="card-surface" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <h2 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-main)' }}>Application Funnel</h2>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Live conversion across your search lifecycle</p>
            </div>
            <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--primary)', cursor: 'pointer' }} onClick={() => navigate('/applications')}>
              View Board →
            </span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.75rem' }}>
            {funnelStages.map((stage) => (
              <div
                key={stage.label}
                style={{
                  padding: '0.85rem 0.5rem',
                  backgroundColor: 'var(--bg-app)',
                  borderRadius: 'var(--radius-md)',
                  textAlign: 'center',
                  border: '1px solid var(--border-subtle)',
                }}
              >
                <span style={{ fontSize: '1.4rem', fontWeight: 800, color: stage.color, display: 'block' }}>
                  {stage.count}
                </span>
                <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-main)' }}>{stage.label}</span>
                <span style={{ fontSize: '0.68rem', color: 'var(--text-subtle)', display: 'block', marginTop: '2px' }}>
                  {stage.pct}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Weekly Velocity Meter */}
        <div className="card-surface" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <h2 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-main)' }}>Weekly Velocity</h2>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Target: 10 quality tailored submissions</p>
            </div>
            <span
              style={{
                padding: '0.2rem 0.6rem',
                backgroundColor: totalApps >= 5 ? 'var(--success-light)' : 'var(--primary-light)',
                color: totalApps >= 5 ? 'var(--success)' : 'var(--primary)',
                borderRadius: 'var(--radius-full)',
                fontSize: '0.72rem',
                fontWeight: 700,
              }}
            >
              {Math.min(100, Math.round((totalApps / 10) * 100))}% Achieved
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem', fontSize: '0.82rem', fontWeight: 600 }}>
                <span>{totalApps} Tracked</span>
                <span style={{ color: 'var(--text-muted)' }}>{Math.max(0, 10 - totalApps)} Remaining</span>
              </div>
              <div
                style={{
                  height: '10px',
                  backgroundColor: 'var(--border-subtle)',
                  borderRadius: 'var(--radius-full)',
                  overflow: 'hidden',
                }}
              >
                <div
                  style={{
                    height: '100%',
                    width: `${Math.min(100, Math.round((totalApps / 10) * 100))}%`,
                    backgroundColor: 'var(--primary)',
                    borderRadius: 'var(--radius-full)',
                    transition: 'width 0.4s ease',
                  }}
                />
              </div>
            </div>
          </div>
          <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
            Pro-tip: Tailored applications submitted between Tuesday and Thursday have a 42% higher recruiter open rate.
          </p>
        </div>
      </div>

      {/* Ghosting Detector Follow-Up Alerts */}
      {followUpAlerts.length > 0 && (
        <div
          className="card-surface"
          style={{
            padding: '1.25rem 1.5rem',
            borderLeft: '4px solid var(--warning)',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.75rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Clock size={17} style={{ color: 'var(--warning)' }} />
            <span style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-main)' }}>
              Ghosting Detector & Follow-Up Strategist
            </span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '0.75rem' }}>
            {followUpAlerts.map((alert, i) => (
              <div
                key={i}
                style={{
                  padding: '0.75rem 1rem',
                  backgroundColor: 'var(--bg-app)',
                  borderRadius: 'var(--radius-md)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '0.5rem',
                }}
              >
                <div>
                  <div style={{ fontSize: '0.84rem', fontWeight: 700, color: 'var(--text-main)' }}>
                    {alert.company} — {alert.role}
                  </div>
                  <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>{alert.status}</div>
                </div>
                <button
                  onClick={() => navigate('/applications')}
                  style={{
                    padding: '0.35rem 0.75rem',
                    backgroundColor: 'var(--primary-light)',
                    color: 'var(--primary)',
                    border: 'none',
                    borderRadius: 'var(--radius-sm)',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {alert.action}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Top 3 AI Job Matches */}
      <div className="card-surface" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-main)' }}>Curated Job Matches</h2>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
              Verified tech openings and internships from live partners
            </p>
          </div>
          <button
            onClick={() => navigate('/jobs')}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--primary)',
              fontSize: '0.82rem',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.25rem',
            }}
          >
            <span>Explore All</span>
            <ArrowRight size={14} />
          </button>
        </div>

        {topMatches.length > 0 ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1rem' }}>
            {topMatches.map((job) => (
              <div
                key={job.id}
                onClick={() => navigate('/jobs')}
                className="card-surface card-interactive"
                style={{
                  padding: '1.25rem',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  gap: '1rem',
                  cursor: 'pointer',
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '0.5rem' }}>
                    <div>
                      <h3 style={{ fontSize: '0.96rem', fontWeight: 700, color: 'var(--text-main)' }}>{job.title}</h3>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                          <Building2 size={13} /> {job.company}
                        </span>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                          <MapPin size={13} /> {job.location}
                        </span>
                      </div>
                    </div>
                    <span
                      style={{
                        padding: '3px 8px',
                        backgroundColor: 'var(--success-light)',
                        color: 'var(--success)',
                        borderRadius: 'var(--radius-full)',
                        fontSize: '0.75rem',
                        fontWeight: 800,
                      }}
                    >
                      {job.matchScore}%
                    </span>
                  </div>

                  <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.75rem', lineHeight: 1.4 }}>
                    {job.rationale}
                  </p>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '0.75rem', borderTop: '1px solid var(--border-subtle)', fontSize: '0.8rem' }}>
                  <span style={{ fontWeight: 700, color: 'var(--text-main)' }}>{job.comp}</span>
                  <span style={{ color: 'var(--primary)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '2px' }}>
                    Tailor Resume <ChevronRight size={13} />
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div
            style={{
              padding: '2.5rem 1.5rem',
              textAlign: 'center',
              backgroundColor: 'var(--bg-app)',
              borderRadius: 'var(--radius-md)',
              border: '1px dashed var(--border-subtle)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '0.65rem',
            }}
          >
            <Briefcase size={32} style={{ color: 'var(--text-subtle)' }} />
            <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-main)' }}>No Target Jobs Added Yet</h3>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', maxWidth: '400px', lineHeight: 1.4 }}>
              Your workspace is fresh. Track opportunities in the Job Feed or configure your target roles in Settings to view tailored match scores.
            </p>
            <button
              onClick={() => navigate('/jobs')}
              style={{
                marginTop: '0.25rem',
                padding: '0.55rem 1.1rem',
                backgroundColor: 'var(--primary)',
                color: 'var(--primary-fg)',
                border: 'none',
                borderRadius: 'var(--radius-md)',
                fontSize: '0.84rem',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              Explore Job Feed
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
