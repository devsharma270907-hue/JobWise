import React, { useRef, useState } from 'react';
import {
  Upload,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Loader2,
  Trash2,
  Plus,
  AlertCircle,
} from 'lucide-react';
import { useResumes, useUploadResume, useDeleteResume } from '../../lib/api/resumes';

export const ResumePage: React.FC = () => {
  const { data: resumes = [] } = useResumes();
  const uploadMutation = useUploadResume();
  const deleteMutation = useDeleteResume();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isDragging, setIsDragging] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState<string | null>(null);

  const activeResume = resumes[0]; // Most recent resume for logged-in user

  const processFile = async (file: File) => {
    if (!file) return;

    // Check size limit: 5MB
    if (file.size > 5 * 1024 * 1024) {
      setUploadError('File size exceeds the 5MB limit. Please upload a smaller file.');
      return;
    }

    setUploadError(null);
    setUploadSuccess(null);

    try {
      await uploadMutation.mutateAsync(file);
      setUploadSuccess(`Successfully uploaded and analyzed "${file.name}"!`);
      setTimeout(() => setUploadSuccess(null), 5000);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (err: any) {
      const msg =
        err.response?.data?.error?.message ||
        'Failed to parse resume document. Please ensure your PDF contains readable text.';
      setUploadError(msg);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const atsScore = activeResume?.score?.overall || 0;
  const feedback = Array.isArray(activeResume?.score?.actionableFeedback)
    ? activeResume.score.actionableFeedback
    : [];
  const experience = Array.isArray(activeResume?.parsedData?.experience)
    ? activeResume.parsedData.experience
    : [];
  const skills = Array.isArray(activeResume?.parsedData?.skills)
    ? activeResume.parsedData.skills
    : [];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-main)', letterSpacing: '-0.02em' }}>
            Resume Analysis & ATS Scoring
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '0.2rem' }}>
            AI-structured extraction, ATS parseability audit, and version tailoring history.
          </p>
        </div>

        {activeResume && (
          <button
            onClick={() => fileInputRef.current?.click()}
            style={{
              padding: '0.6rem 1.1rem',
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
            <Plus size={16} />
            <span>Upload New Version</span>
          </button>
        )}
      </div>

      {uploadError && (
        <div
          style={{
            padding: '0.85rem 1.25rem',
            backgroundColor: 'var(--danger-light)',
            border: '1px solid var(--danger)',
            borderRadius: 'var(--radius-md)',
            color: 'var(--danger)',
            fontSize: '0.86rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.65rem',
          }}
        >
          <AlertCircle size={18} style={{ flexShrink: 0 }} />
          <span>{uploadError}</span>
        </div>
      )}

      {uploadSuccess && (
        <div
          style={{
            padding: '0.85rem 1.25rem',
            backgroundColor: 'var(--success-light)',
            border: '1px solid var(--success)',
            borderRadius: 'var(--radius-md)',
            color: 'var(--success)',
            fontSize: '0.86rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.65rem',
          }}
        >
          <CheckCircle2 size={18} style={{ flexShrink: 0 }} />
          <span>{uploadSuccess}</span>
        </div>
      )}

      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept=".pdf,.docx,.txt"
        style={{ display: 'none' }}
      />

      {/* Upload Zone & Status */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '1.5rem' }}>
        {/* Upload Dropzone */}
        <div
          onClick={() => fileInputRef.current?.click()}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className="card-surface"
          style={{
            padding: '2.5rem 2rem',
            border: isDragging ? '2px dashed var(--primary)' : '2px dashed var(--border-strong)',
            borderRadius: 'var(--radius-lg)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            textAlign: 'center',
            cursor: 'pointer',
            backgroundColor: isDragging ? 'var(--primary-light)' : 'var(--bg-app)',
            transition: 'all var(--transition-fast)',
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
              marginBottom: '1rem',
            }}
          >
            {uploadMutation.isPending ? <Loader2 size={26} className="animate-spin" /> : <Upload size={26} />}
          </div>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-main)' }}>
            {uploadMutation.isPending ? 'Uploading & Parsing Resume...' : activeResume ? 'Replace or Upload New Resume' : 'Upload your Master Resume'}
          </h3>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: '0.35rem', maxWidth: '340px' }}>
            Click or drop your PDF or DOCX file here. Encrypted at rest.
          </p>
          <span style={{ fontSize: '0.72rem', color: 'var(--text-subtle)', marginTop: '0.75rem' }}>
            Supported formats: PDF, DOCX (Max 5MB)
          </span>
        </div>

        {/* ATS Score Card */}
        <div className="card-surface" style={{ padding: '1.75rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-main)' }}>ATS Parseability Audit</h3>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                {activeResume ? `File: ${activeResume.fileName}` : 'No resume uploaded yet'}
              </p>
            </div>
            <div
              style={{
                width: '58px',
                height: '58px',
                borderRadius: 'var(--radius-full)',
                border: activeResume ? '4px solid var(--primary)' : '4px dashed var(--border-subtle)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 800,
                fontSize: '1.15rem',
                color: activeResume ? 'var(--primary)' : 'var(--text-muted)',
              }}
            >
              {activeResume ? atsScore : '—'}
            </div>
          </div>

          {activeResume ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', marginTop: '0.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.82rem' }}>
                <CheckCircle2 size={16} style={{ color: 'var(--success)', flexShrink: 0 }} />
                <span>Standard ATS-readable Headings</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.82rem' }}>
                <CheckCircle2 size={16} style={{ color: 'var(--success)', flexShrink: 0 }} />
                <span>Metric-driven Impact Bullets</span>
              </div>
              {feedback.map((item, idx) => (
                <div key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem', fontSize: '0.82rem', color: 'var(--warning)' }}>
                  <AlertTriangle size={15} style={{ flexShrink: 0, marginTop: '2px' }} />
                  <span>{item}</span>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ padding: '1.5rem 0', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.84rem' }}>
              Upload a resume to generate your real-time ATS parseability audit score and keyword density report.
            </div>
          )}
        </div>
      </div>

      {/* Parsed Structure Preview or Clean Empty State */}
      {activeResume ? (
        <div className="card-surface" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-main)' }}>Structured Resume Data</h3>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Verified data points used for semantic job matching</p>
            </div>
            <button
              onClick={() => deleteMutation.mutate(activeResume._id)}
              style={{
                padding: '0.45rem 0.85rem',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--danger)',
                backgroundColor: 'var(--danger-light)',
                color: 'var(--danger)',
                fontSize: '0.8rem',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
              }}
            >
              <Trash2 size={14} />
              <span>Delete Resume</span>
            </button>
          </div>

          {skills.length > 0 && (
            <div>
              <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '0.4rem' }}>Extracted Skills:</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                {skills.map((skill, idx) => (
                  <span
                    key={idx}
                    style={{
                      padding: '2px 8px',
                      borderRadius: 'var(--radius-full)',
                      backgroundColor: 'var(--primary-light)',
                      color: 'var(--primary)',
                      fontSize: '0.75rem',
                      fontWeight: 600,
                    }}
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}

          {experience.map((exp: any, i: number) => {
            const expTitle = exp.title || exp.role || 'Role / Position';
            const expBullets: string[] = Array.isArray(exp.bullets)
              ? exp.bullets
              : exp.description
              ? [exp.description]
              : [];

            return (
              <div
                key={i}
                style={{
                  padding: '1rem',
                  backgroundColor: 'var(--bg-app)',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-subtle)',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                  <span style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--text-main)' }}>{expTitle}</span>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    {exp.startDate || ''} {exp.endDate ? `– ${exp.endDate}` : ''}
                  </span>
                </div>
                <div style={{ fontSize: '0.82rem', color: 'var(--primary)', fontWeight: 600, marginTop: '2px' }}>
                  {exp.company}
                </div>
                {expBullets.length > 0 && (
                  <ul style={{ marginTop: '0.65rem', paddingLeft: '1.25rem', fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                    {expBullets.map((b, idx) => (
                      <li key={idx} style={{ marginBottom: '4px' }}>
                        {b}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <div
          className="card-surface"
          style={{
            padding: '2.5rem',
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '0.75rem',
            borderRadius: 'var(--radius-lg)',
            border: '1px dashed var(--border-subtle)',
          }}
        >
          <FileText size={36} style={{ color: 'var(--text-subtle)' }} />
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-main)' }}>
            Your Resume Profile is Empty
          </h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.84rem', maxWidth: '380px' }}>
            Upload your resume above. JobWise will parse your experience, calculate your ATS score, and enable 1-click tailored applications.
          </p>
        </div>
      )}
    </div>
  );
};
