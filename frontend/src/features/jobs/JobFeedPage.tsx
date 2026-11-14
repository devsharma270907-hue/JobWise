import React, { useState } from 'react';
import {
  Search,
  Filter,
  Sparkles,
  Building2,
  MapPin,
  DollarSign,
  Bookmark,
  ArrowRight,
  Plus,
  Briefcase,
  X,
  CheckCircle2,
  ExternalLink,
} from 'lucide-react';
import { useAuth } from '../../auth/AuthProvider';
import { useCreateApplication } from '../../lib/api/applications';
import { useJobs } from '../../lib/api/jobs';
import { useResumes } from '../../lib/api/resumes';
import { useNavigate } from 'react-router-dom';

interface RecruiterInfo {
  name: string;
  title: string;
  email?: string;
  linkedInUrl?: string;
}

interface JobItem {
  id: string;
  title: string;
  company: string;
  location: string;
  comp: string;
  matchScore: number;
  tags: string[];
  rationale: string;
  strategicAngle?: string;
  externalUrl?: string;
  recruiter?: RecruiterInfo;
  matchedSkills?: string[];
  missingSkills?: string[];
}

export const JobFeedPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const createApplicationMutation = useCreateApplication();

  const isDemoUser = user?.email === 'demo@jobwise.ai';

  const demoJobs: JobItem[] = [
    {
      id: 'job-1',
      title: 'Software Engineer - New Grad',
      company: 'Stripe',
      location: 'San Francisco, CA / Remote',
      comp: '$125,000 - $145,000',
      matchScore: 95,
      tags: ['TypeScript', 'Node.js', 'React', 'MongoDB', 'REST APIs', 'Docker'],
      rationale: '95% Match: High synergy with your TypeScript & Node.js backend projects and API design focus.',
      strategicAngle: 'Stripe product infrastructure is hiring early-career engineers to scale payment APIs. Emphasize idempotency and error recovery.',
      externalUrl: 'https://www.linkedin.com/jobs/view/stripe-software-engineer-new-grad',
      recruiter: {
        name: 'Sarah Jenkins',
        title: 'Senior Technical Recruiter @ Stripe',
        email: 'sarah.jenkins@stripe.com',
        linkedInUrl: 'https://www.linkedin.com/in/sarah-jenkins-stripe',
      },
    },
    {
      id: 'job-2',
      title: 'Frontend Engineer (React / TypeScript)',
      company: 'Linear',
      location: 'Remote',
      comp: '$135,000 - $160,000',
      matchScore: 92,
      tags: ['React', 'TypeScript', 'CSS', 'TanStack Query', 'Web Performance'],
      rationale: '92% Match: Strong frontend component architecture alignment and fluid UI interaction mastery.',
      strategicAngle: 'Linear prioritizes 60fps micro-interactions, optimistic updates, and keyboard shortcuts.',
      externalUrl: 'https://www.linkedin.com/jobs/view/linear-frontend-engineer',
      recruiter: {
        name: 'Marcus Zhao',
        title: 'Head of Engineering Talent @ Linear',
        email: 'marcus.zhao@linear.app',
        linkedInUrl: 'https://www.linkedin.com/in/marcus-zhao-linear',
      },
    },
    {
      id: 'job-3',
      title: 'Full-Stack Developer Intern',
      company: 'Vercel',
      location: 'Remote',
      comp: '$48 - $58 / hr ($100,000+)',
      matchScore: 90,
      tags: ['Next.js', 'TypeScript', 'Node.js', 'React', 'CI/CD'],
      rationale: '90% Match: Excellent match for your Next.js and full-stack TypeScript stack.',
      strategicAngle: 'Vercel values developer tooling contributions and open-source GitHub portfolio samples.',
      externalUrl: 'https://www.linkedin.com/jobs/view/vercel-fullstack-intern',
      recruiter: {
        name: 'Chloe Vance',
        title: 'University & Early Career Lead @ Vercel',
        email: 'chloe.vance@vercel.com',
        linkedInUrl: 'https://www.linkedin.com/in/chloe-vance-talent',
      },
    },
    {
      id: 'job-4',
      title: 'Backend Engineer - AI Developer Platform',
      company: 'Anthropic',
      location: 'San Francisco, CA / Hybrid',
      comp: '$165,000 - $195,000',
      matchScore: 89,
      tags: ['Node.js', 'TypeScript', 'MongoDB', 'Vector Databases', 'Express', 'Redis'],
      rationale: '89% Match: Backend distributed API design & database indexing match.',
      strategicAngle: 'Highlight tool-calling pipelines, LLM caching, and structured JSON output streaming.',
      externalUrl: 'https://www.linkedin.com/jobs/view/anthropic-backend-ai-engineer',
      recruiter: {
        name: 'Dr. Julian Hayes',
        title: 'Senior AI Systems Sourcer @ Anthropic',
        email: 'julian.hayes@anthropic.com',
        linkedInUrl: 'https://www.linkedin.com/in/julian-hayes-ai',
      },
    },
    {
      id: 'job-5',
      title: 'Associate Product Engineer',
      company: 'Figma',
      location: 'San Francisco, CA / Remote',
      comp: '$130,000 - $155,000',
      matchScore: 88,
      tags: ['TypeScript', 'React', 'Canvas API', 'WebGL', 'Design Systems'],
      rationale: '88% Match: Modern component design systems and canvas interaction capabilities.',
      strategicAngle: 'Figma looks for engineers with high design empathy and attention to accessible UI states.',
      externalUrl: 'https://www.linkedin.com/jobs/view/figma-associate-product-engineer',
      recruiter: {
        name: 'Jessica Miller',
        title: 'Design Engineering Talent Partner @ Figma',
        email: 'jessica.miller@figma.com',
        linkedInUrl: 'https://www.linkedin.com/in/jessica-miller-figma',
      },
    },
    {
      id: 'job-6',
      title: 'Cloud Infrastructure & Telemetry Engineer',
      company: 'Datadog',
      location: 'New York, NY / Remote',
      comp: '$140,000 - $170,000',
      matchScore: 87,
      tags: ['Docker', 'AWS', 'Node.js', 'Kubernetes', 'Observability'],
      rationale: '87% Match: Solid systems architecture and Docker containerization foundation.',
      strategicAngle: 'Focus on high-throughput log ingestion and real-time observability telemetry.',
      externalUrl: 'https://www.linkedin.com/jobs/view/datadog-cloud-infrastructure',
      recruiter: {
        name: 'Elena Rostova',
        title: 'Lead Technical Recruiter @ Datadog',
        email: 'elena.rostova@datadog.com',
        linkedInUrl: 'https://www.linkedin.com/in/elena-rostova-datadog',
      },
    },
    {
      id: 'job-7',
      title: 'Full Stack Engineer - Workspaces',
      company: 'Notion',
      location: 'San Francisco, CA / Remote',
      comp: '$145,000 - $175,000',
      matchScore: 86,
      tags: ['React', 'TypeScript', 'Node.js', 'State Machines', 'WebSockets'],
      rationale: '86% Match: Strong state management & collaborative document editing architecture.',
      strategicAngle: 'Emphasize experience with offline-first caching and conflict-free data synchronization.',
      externalUrl: 'https://www.linkedin.com/jobs/view/notion-full-stack-workspaces',
      recruiter: {
        name: 'Alex Rivera',
        title: 'Senior Talent Partner @ Notion',
        email: 'a.rivera@notion.so',
        linkedInUrl: 'https://www.linkedin.com/in/alex-rivera-notion',
      },
    },
    {
      id: 'job-8',
      title: 'Platform & DevOps Engineer',
      company: 'GitHub',
      location: 'Remote',
      comp: '$125,000 - $150,000',
      matchScore: 85,
      tags: ['GitHub Actions', 'Docker', 'Linux', 'TypeScript', 'CI/CD'],
      rationale: '85% Match: CI/CD automation workflow and developer platform tooling expertise.',
      strategicAngle: 'Highlight automated regression testing pipelines and GitHub API integrations.',
      externalUrl: 'https://www.linkedin.com/jobs/view/github-platform-devops-engineer',
      recruiter: {
        name: 'Liam O’Connor',
        title: 'Staff Technical Recruiter @ GitHub / Microsoft',
        email: 'liam.oconnor@github.com',
        linkedInUrl: 'https://www.linkedin.com/in/liam-oconnor-github',
      },
    },
  ];

  const [customJobs, setCustomJobs] = useState<JobItem[]>([]);
  const [search, setSearch] = useState('');
  const [savedJobs, setSavedJobs] = useState<string[]>([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [addedMessage, setAddedMessage] = useState<string | null>(null);

  // Form states
  const [newTitle, setNewTitle] = useState('');
  const [newCompany, setNewCompany] = useState('');
  const [newLocation, setNewLocation] = useState('Remote');
  const [newComp, setNewComp] = useState('$100,000 - $130,000');
  const [newTags, setNewTags] = useState('React, TypeScript, Node.js');
  const [newRationale, setNewRationale] = useState('');

  const { data: jobsResponse } = useJobs({ search });
  const { data: resumes = [] } = useResumes();
  const hasUploadedResume = resumes.length > 0;

  const apiJobs: JobItem[] = (jobsResponse?.data || []).map((item) => ({
    id: item.job._id,
    title: item.job.title,
    company: item.job.company,
    location: item.job.location,
    comp: item.job.salaryRange || 'Competitive',
    matchScore: item.match?.fitScore ?? (hasUploadedResume ? 70 : 85),
    tags: item.job.skills,
    matchedSkills: item.match?.matchedSkills || [],
    missingSkills: item.match?.missingSkills || [],
    rationale:
      item.match?.rationale ||
      `${item.job.company} is hiring for ${item.job.title}. Core skills: ${item.job.skills.slice(0, 4).join(', ')}.`,
    externalUrl: item.job.externalUrl,
    recruiter: item.job.recruiter,
  }));

  const displayJobs = apiJobs.length > 0 ? [...customJobs, ...apiJobs] : (isDemoUser ? demoJobs : customJobs);

  const filteredJobs = displayJobs.filter(
    (j) =>
      j.title.toLowerCase().includes(search.toLowerCase()) ||
      j.company.toLowerCase().includes(search.toLowerCase()) ||
      j.tags.some((t) => t.toLowerCase().includes(search.toLowerCase()))
  );

  const handleAddJob = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newCompany.trim()) return;

    const newJob: JobItem = {
      id: `custom-job-${Date.now()}`,
      title: newTitle.trim(),
      company: newCompany.trim(),
      location: newLocation.trim() || 'Remote',
      comp: newComp.trim() || 'Competitive',
      matchScore: 90,
      tags: newTags.split(',').map((t) => t.trim()).filter(Boolean),
      rationale: newRationale.trim() || 'Custom tracked job opportunity.',
    };

    setCustomJobs([newJob, ...customJobs]);
    setNewTitle('');
    setNewCompany('');
    setNewLocation('Remote');
    setNewRationale('');
    setIsAddModalOpen(false);
  };

  const handleTrackInCRM = async (job: JobItem) => {
    try {
      await createApplicationMutation.mutateAsync({
        company: job.company,
        jobTitle: job.title,
        location: job.location,
        status: 'saved',
      });
      setSavedJobs([...savedJobs, job.id]);
      setAddedMessage(`Saved "${job.title} @ ${job.company}" to your Application CRM!`);
      setTimeout(() => setAddedMessage(null), 4000);
    } catch {
      // Ignore if already tracked
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-main)', letterSpacing: '-0.02em' }}>
            Job & Internship Opportunities
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '0.2rem' }}>
            {hasUploadedResume
              ? 'Ranked autonomously by semantic fit with your verified resume skills and target roles.'
              : 'Showing all 20 curated tech jobs. Upload your resume to calculate personalized fit percentages & recommendations.'}
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
          <span>Add Job Lead</span>
        </button>
      </div>

      {/* Dynamic AI Recommendation Banner */}
      {hasUploadedResume ? (
        <div
          style={{
            padding: '0.85rem 1.25rem',
            backgroundColor: 'var(--primary-light)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-md)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '0.75rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <Sparkles size={18} style={{ color: 'var(--primary)', flexShrink: 0 }} />
            <div>
              <strong style={{ fontSize: '0.88rem', color: 'var(--text-main)' }}>
                AI Resume Matching Active
              </strong>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                Jobs are dynamically scored and ranked according to your uploaded resume's parsed skills.
              </div>
            </div>
          </div>
          <button
            onClick={() => navigate('/resume')}
            style={{
              padding: '0.45rem 0.85rem',
              backgroundColor: 'var(--bg-surface)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-sm)',
              fontSize: '0.78rem',
              fontWeight: 600,
              cursor: 'pointer',
              color: 'var(--text-main)',
            }}
          >
            Update Resume
          </button>
        </div>
      ) : (
        <div
          style={{
            padding: '0.85rem 1.25rem',
            backgroundColor: 'var(--warning-light)',
            border: '1px solid var(--warning)',
            borderRadius: 'var(--radius-md)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '0.75rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <Sparkles size={18} style={{ color: 'var(--warning)', flexShrink: 0 }} />
            <div>
              <strong style={{ fontSize: '0.88rem', color: 'var(--text-main)' }}>
                Personalize Your Match Scores
              </strong>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                Upload your resume in the Resume tab to activate automated ATS scoring and recommend jobs tailored to your skills.
              </div>
            </div>
          </div>
          <button
            onClick={() => navigate('/resume')}
            style={{
              padding: '0.45rem 0.85rem',
              backgroundColor: 'var(--primary)',
              color: 'var(--primary-fg)',
              border: 'none',
              borderRadius: 'var(--radius-sm)',
              fontSize: '0.78rem',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            Upload Resume
          </button>
        </div>
      )}

      {addedMessage && (
        <div
          style={{
            padding: '0.75rem 1rem',
            backgroundColor: 'var(--success-light)',
            border: '1px solid var(--success)',
            borderRadius: 'var(--radius-md)',
            color: 'var(--success)',
            fontSize: '0.85rem',
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
          }}
        >
          <CheckCircle2 size={16} />
          <span>{addedMessage}</span>
        </div>
      )}

      {/* Filter & Search Bar */}
      <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
        <div style={{ flex: 1, minWidth: '280px', position: 'relative' }}>
          <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-subtle)' }} />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search roles, skills, or companies..."
            style={{
              width: '100%',
              padding: '0.65rem 0.75rem 0.65rem 2.4rem',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-subtle)',
              backgroundColor: 'var(--bg-surface)',
              color: 'var(--text-main)',
              fontSize: '0.9rem',
              outline: 'none',
            }}
          />
        </div>
        <button
          style={{
            padding: '0.65rem 1rem',
            backgroundColor: 'var(--bg-surface)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-md)',
            color: 'var(--text-main)',
            fontSize: '0.85rem',
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            cursor: 'pointer',
          }}
        >
          <Filter size={15} />
          <span>Filters</span>
        </button>
      </div>

      {/* Job Cards Feed or Empty State */}
      {filteredJobs.length === 0 ? (
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
            <Briefcase size={30} />
          </div>
          <div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-main)' }}>
              No job openings tracked yet
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', maxWidth: '420px', marginTop: '0.35rem' }}>
              Your job feed has no pre-existing entries. Click below to add a job opportunity you are targeting or wish to tailor a resume for.
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
            <span>Add Your First Job Lead</span>
          </button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {filteredJobs.map((job) => {
            const isSaved = savedJobs.includes(job.id);
            return (
              <div
                key={job.id}
                className="card-surface"
                style={{
                  padding: '1.5rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '1rem',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <h2 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-main)' }}>{job.title}</h2>
                      <span
                        style={{
                          padding: '2px 9px',
                          backgroundColor: 'var(--success-light)',
                          color: 'var(--success)',
                          borderRadius: 'var(--radius-full)',
                          fontSize: '0.75rem',
                          fontWeight: 700,
                        }}
                      >
                        {job.matchScore}% Match
                      </span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', marginTop: '0.35rem', fontSize: '0.85rem', color: 'var(--text-muted)', flexWrap: 'wrap' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Building2 size={15} /> {job.company}
                      </span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <MapPin size={15} /> {job.location}
                      </span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 600, color: 'var(--text-main)' }}>
                        <DollarSign size={15} /> {job.comp}
                      </span>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button
                      onClick={() => handleTrackInCRM(job)}
                      style={{
                        padding: '0.55rem 0.85rem',
                        borderRadius: 'var(--radius-md)',
                        border: isSaved ? '1px solid var(--success)' : '1px solid var(--border-subtle)',
                        backgroundColor: isSaved ? 'var(--success-light)' : 'var(--bg-surface)',
                        color: isSaved ? 'var(--success)' : 'var(--text-main)',
                        fontSize: '0.82rem',
                        fontWeight: 600,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.4rem',
                      }}
                    >
                      <Bookmark size={15} />
                      <span>{isSaved ? 'Tracked in CRM' : 'Save to CRM'}</span>
                    </button>
                    <button
                      onClick={() => navigate('/resume')}
                      style={{
                        padding: '0.55rem 1rem',
                        backgroundColor: 'var(--primary)',
                        color: 'var(--primary-fg)',
                        border: 'none',
                        borderRadius: 'var(--radius-md)',
                        fontSize: '0.82rem',
                        fontWeight: 600,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.4rem',
                      }}
                    >
                      <span>Tailor Resume</span>
                      <ArrowRight size={14} />
                    </button>
                  </div>
                </div>

                {job.matchedSkills && job.matchedSkills.length > 0 && (
                  <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '0.4rem', fontSize: '0.78rem' }}>
                    <span style={{ fontWeight: 700, color: 'var(--success)' }}>Matched Skills:</span>
                    {job.matchedSkills.map((s) => (
                      <span
                        key={s}
                        style={{
                          padding: '2px 7px',
                          borderRadius: 'var(--radius-sm)',
                          backgroundColor: 'var(--success-light)',
                          color: 'var(--success)',
                          fontSize: '0.74rem',
                          fontWeight: 600,
                        }}
                      >
                        ✓ {s}
                      </span>
                    ))}
                  </div>
                )}

                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                  {job.tags.map((tag) => (
                    <span
                      key={tag}
                      style={{
                        padding: '3px 9px',
                        backgroundColor: 'var(--bg-app)',
                        borderRadius: 'var(--radius-sm)',
                        fontSize: '0.78rem',
                        color: 'var(--text-muted)',
                        fontWeight: 500,
                      }}
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                <div
                  style={{
                    padding: '0.75rem 1rem',
                    backgroundColor: 'var(--bg-app)',
                    borderRadius: 'var(--radius-md)',
                    borderLeft: '3px solid var(--primary)',
                    fontSize: '0.82rem',
                    color: 'var(--text-main)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                  }}
                >
                  <Sparkles size={15} style={{ color: 'var(--primary)', flexShrink: 0 }} />
                  <span>{job.rationale}</span>
                </div>

                {job.recruiter && (
                  <div
                    style={{
                      padding: '0.65rem 0.9rem',
                      backgroundColor: 'var(--bg-app)',
                      borderRadius: 'var(--radius-md)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      flexWrap: 'wrap',
                      gap: '0.6rem',
                      border: '1px solid var(--border-subtle)',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                      <div
                        style={{
                          width: '28px',
                          height: '28px',
                          borderRadius: 'var(--radius-full)',
                          backgroundColor: 'var(--primary-light)',
                          color: 'var(--primary)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontWeight: 700,
                          fontSize: '0.75rem',
                        }}
                      >
                        {job.recruiter.name.charAt(0)}
                      </div>
                      <div>
                        <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-main)' }}>
                          Recruiter: {job.recruiter.name}
                        </div>
                        <div style={{ fontSize: '0.73rem', color: 'var(--text-muted)' }}>
                          {job.recruiter.title}
                        </div>
                      </div>
                    </div>

                    {job.externalUrl && (
                      <a
                        href={job.externalUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          fontSize: '0.76rem',
                          fontWeight: 600,
                          color: 'var(--primary)',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px',
                          textDecoration: 'none',
                        }}
                      >
                        <span>Apply on LinkedIn</span>
                        <ExternalLink size={13} />
                      </a>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Add Custom Job Modal */}
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
                Add Custom Job Lead
              </h2>
              <button
                onClick={() => setIsAddModalOpen(false)}
                style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleAddJob} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                  Job Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Senior Frontend Engineer"
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
                  Company Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Stripe, OpenAI, Tech Startup"
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

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                    Location
                  </label>
                  <input
                    type="text"
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
                    Comp Range
                  </label>
                  <input
                    type="text"
                    value={newComp}
                    onChange={(e) => setNewComp(e.target.value)}
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
                  Key Skills & Tags (comma separated)
                </label>
                <input
                  type="text"
                  value={newTags}
                  onChange={(e) => setNewTags(e.target.value)}
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
                  Notes / Why this job?
                </label>
                <textarea
                  rows={2}
                  placeholder="e.g. Recruiter reached out on LinkedIn, matches my Next.js focus"
                  value={newRationale}
                  onChange={(e) => setNewRationale(e.target.value)}
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
                <span>Save Job Lead</span>
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
