JobWise — Product Requirements Document
Autonomous AI Career Agent for Students, Job Seekers & Freelancers

Version: 1.0 (Draft) Stack baseline: MERN + TypeScript (adapted from internal Full-Stack Project Blueprint v2.2) Owner: Product / Engineering Audience: Founders, engineers, AI coding assistants, designers, early pilot users Status: Pre-build — for review before Section 11 "Bootstrap Prompt" is run

⚠️ Version Safety Rule carried over from the blueprint: no dependency version in this PRD is authoritative. Before any package.json is written, web-search each package for latest stable + advisories and confirm with npm show <pkg> version. Never copy semver literals from this document.

Table of Contents
Product Overview
Problem Statement & Goals
Target Users & Personas
Core Features
Key User Flows
Tech Stack
Repository Structure
Environment Variables
Backend Architecture
AI Agent & Data Pipeline
API Documentation Standard
Backend Security & Privacy Checklist
Frontend Architecture
Frontend Security Checklist
Success Metrics (KPIs)
Roadmap / Phasing
Master Bootstrap Prompt
Open Questions & Risks
1. Product Overview

JobWise is an autonomous AI career agent that acts as a personal career co-pilot for students, early-career job seekers, and freelancers. Instead of a passive job board, JobWise actively works on the user's behalf: it reads and analyzes their resume, discovers and ranks relevant jobs/internships/gigs, surfaces skill gaps against target roles, tailors resumes and cover letters per application, preps the user for interviews with role-specific practice, and tracks every application through its lifecycle in one place.

The product's differentiator is agentic behavior — JobWise doesn't just return search results, it takes multi-step actions (analyze → match → recommend → draft → track) and explains its reasoning, while keeping the human in the loop for anything that gets submitted externally.

2. Problem Statement & Goals

Problem: Students and early-career job seekers spend enormous unstructured effort on the job search: manually tailoring resumes per posting, guessing which skills to build, tracking applications across spreadsheets/email/job boards, and getting little structured interview practice. Freelancers face a parallel problem matching their skills to gigs and tailoring pitches.

Goals (v1):

Reduce time-to-tailored-application from ~45 min to under 5 min per job.
Give every user a concrete, ranked skill-gap plan against their top 3 target roles.
Centralize application tracking so nothing falls through the cracks (single source of truth).
Provide interview practice that is role- and job-description-specific, not generic.
Maintain strict control over resume/PII data — this is sensitive personal data and the security bar must match that.

Non-goals (v1):

JobWise does not auto-submit applications on external ATS platforms without explicit user confirmation per submission.
JobWise is not an employer-facing ATS or applicant-screening tool in v1 (see Roadmap for a possible v2 employer surface).
JobWise does not guarantee job placement or make promises about interview/offer outcomes.
3. Target Users & Personas
Persona	Description	Primary Jobs-to-be-Done
Student Seeker (primary)	Undergrad/grad student applying to internships or first full-time roles	"Tell me what jobs fit me, what I'm missing, and help me apply fast."
Early-Career Switcher	1–5 yrs experience, pivoting industries or roles	"Help me reposition my resume and find roles that value transferable skills."
Freelancer/Gig Worker	Independent contractor matching skills to gigs/projects	"Match me to gigs, help me pitch, track proposals and payment status."
4. Core Features
4.1 Resume Analysis
Upload resume (PDF/DOCX) → structured parse (experience, education, skills, projects).
AI-generated resume score with actionable, specific feedback (not generic platitudes).
Detects formatting/ATS-parseability issues.
4.2 Job & Internship Discovery + Matching
Aggregates postings from connected job-board APIs / partner feeds and user-added URLs.
Ranks postings by fit score computed from resume + stated preferences (role, location, comp, remote).
Explains why a job matched ("matches your React + Node experience; missing: GraphQL").
4.3 Skill Gap Analysis
Compares user's current skill profile against aggregate requirements of their target roles.
Produces a prioritized gap list with suggested learning resources/projects to close each gap.
4.4 Application Tailoring
Generates a tailored resume bullet set and cover letter draft per job description.
User reviews and edits before anything is exported/submitted — no silent auto-submission.
Version history per application (which resume/cover-letter variant was used where).
4.5 Interview Preparation
Generates likely interview questions from the job description + company context.
Mock interview mode with AI feedback on answers (text or voice transcript).
Behavioral (STAR-method) and technical prep tracks.
4.6 Application Tracking
Kanban-style pipeline: Saved → Applied → Interviewing → Offer → Rejected → Withdrawn.
Reminders/follow-up nudges (e.g., "no response in 10 business days").
Central timeline per application: documents used, notes, interview dates, contacts.
4.7 Freelancer Mode (parallel track)
Gig matching against freelance marketplaces/feeds.
Proposal/pitch drafting tailored to gig briefs.
Lightweight pipeline for proposals sent → in discussion → won → completed.
5. Key User Flows
Onboarding: Sign up → upload resume → AI parses & scores it → user sets target roles/locations/comp → initial job matches shown.
Daily/weekly loop: User opens dashboard → sees new ranked matches + skill-gap nudges → saves jobs → requests tailored application for a saved job → reviews/edits → marks as applied (tracker updates).
Interview loop: User marks an application "Interviewing" → JobWise generates a prep pack for that specific job → user runs mock interview → gets feedback → logs real interview outcome.
Freelancer loop: User switches to Freelancer Mode → sees ranked gigs → requests tailored pitch → tracks proposal status.
6. Tech Stack

Same verification discipline as the base blueprint applies: every package below is a name to verify, not a version to copy. Web search + npm show <pkg> version + advisory check before any install.

Layer	Choice	Notes
Runtime	Node.js	Search current Active LTS
Framework	Express	Verify latest stable major
Language	TypeScript	Strict mode everywhere
Database	MongoDB Atlas	Resumes/PII stored here — see Section 12
ODM	Mongoose	Match driver/Atlas compatibility
Vector store	MongoDB Atlas Vector Search (or Pinecone as alt.)	For resume↔job semantic matching embeddings
Validation	Zod	Env + request bodies
Auth	Google OAuth + Email/Password	Passport.js strategies
JWT	jsonwebtoken	Access (15m) + refresh (7d)
Password hashing	bcryptjs	Cost ≥ 10
AI/LLM provider	Claude API (Anthropic) via @anthropic-ai/sdk	Resume parsing, matching rationale, tailoring, interview Q&A/feedback
Resume parsing	pdf-parse / mammoth (docx) + LLM structuring pass	Extract raw text, then structure via LLM with a strict JSON schema
File storage	S3-compatible bucket (pre-signed URLs)	Resumes and generated documents
Security headers	helmet	Tune CSP for SPA
CORS	cors	Explicit origin allowlist
Rate limiting	express-rate-limit	Stricter on /ai/* routes (cost control)
NoSQL sanitize	express-mongo-sanitize	Injection prevention
Job scheduling	node-cron	Nightly job-feed ingestion, follow-up reminder scans
Email	nodemailer	Follow-up nudges, digest emails
Logging	winston	No resume content or PII in logs
Monitoring	@sentry/node	Error tracking; scrub PII in beforeSend
Frontend	React + Vite	SPA
Routing	react-router-dom	Protected routes
Server state	TanStack Query	Caching + retries
HTTP client	Axios	Refresh interceptors
Forms	React Hook Form + Zod	Validated forms
HTML sanitize	DOMPurify	For any AI-generated rich text rendered as HTML
Kanban/board UI	@dnd-kit/core	Application tracker board
Deploy: Frontend	Vercel	
Deploy: Backend	Render / Railway	
Deploy: DB	MongoDB Atlas	IP allowlist required

Token lifetime standard (unchanged from blueprint):

Access JWT: 15 minutes — Authorization: Bearer header
Refresh token: 7 days — HttpOnly; Secure; SameSite=Strict cookie
7. Repository Structure
JobWise/
├── backend/
│   ├── src/
│   │   ├── server.ts
│   │   ├── app.ts
│   │   ├── config/
│   │   │   ├── env.ts
│   │   │   ├── db.ts
│   │   │   └── passport.ts
│   │   ├── middleware/
│   │   │   ├── requireAuth.ts
│   │   │   ├── validate.ts
│   │   │   ├── roleGuard.ts
│   │   │   ├── aiRateLimit.ts        # per-user AI-call budget guard
│   │   │   └── errorHandler.ts
│   │   ├── modules/
│   │   │   ├── auth/
│   │   │   ├── users/
│   │   │   ├── resumes/               # upload, parse, score
│   │   │   ├── jobs/                  # ingestion, listing, matching
│   │   │   ├── skillGaps/
│   │   │   ├── applications/          # tailored docs + tracker
│   │   │   ├── interviewPrep/
│   │   │   └── freelanceGigs/
│   │   ├── services/
│   │   │   ├── ai/
│   │   │   │   ├── claudeClient.ts    # thin wrapper around Anthropic SDK
│   │   │   │   ├── resumeParser.ts
│   │   │   │   ├── jobMatcher.ts      # embeddings + rerank
│   │   │   │   ├── tailoring.ts
│   │   │   │   └── interviewCoach.ts
│   │   │   ├── jobFeed.service.ts     # partner API ingestion via node-cron
│   │   │   ├── email.service.ts
│   │   │   └── cron.service.ts
│   │   ├── sockets/
│   │   │   └── index.ts               # live match/status updates
│   │   ├── utils/
│   │   │   ├── jwt.ts
│   │   │   ├── encryption.ts          # AES-256-GCM for stored resume files/PII
│   │   │   ├── ownershipCheck.ts
│   │   │   └── tokenCompare.ts
│   │   └── types/
│   ├── postman/
│   ├── .env.example
│   ├── package.json
│   └── tsconfig.json
│
├── frontend/
│   ├── src/
│   │   ├── main.tsx
│   │   ├── App.tsx
│   │   ├── lib/
│   │   │   ├── env.ts
│   │   │   └── api/
│   │   │       ├── client.ts
│   │   │       └── refreshClient.ts
│   │   ├── auth/
│   │   ├── components/
│   │   ├── features/
│   │   │   ├── resume/
│   │   │   ├── jobs/
│   │   │   ├── skillGaps/
│   │   │   ├── applications/          # tracker board
│   │   │   ├── interviewPrep/
│   │   │   └── freelance/
│   │   └── pages/
│   ├── .env.example
│   └── package.json
│
└── docs/
    ├── JOBWISE_PRD.md                 # this file
    └── BACKEND_PLANNING.md

Rules (unchanged from blueprint): never commit .env, node_modules, dist/, build/; always commit .env.example; one env-validation source of truth per side; TypeScript strict mode always on.

8. Environment Variables
Backend .env.example (additions on top of blueprint baseline)
env
# ── Server / DB / JWT / OAuth / CORS / Encryption / Email ─────────────
# (same as base blueprint — see Section 3 of PROJECT_BLUEPRINT.md)

# ── AI Provider ─────────────────────────────────────────────────────────
ANTHROPIC_API_KEY=replace_with_key
AI_MODEL_DEFAULT=claude-sonnet-5
AI_MONTHLY_TOKEN_BUDGET_PER_USER=200000

# ── File Storage (resumes, generated docs) ──────────────────────────────
S3_BUCKET=jobwise-user-files
S3_REGION=us-east-1
S3_ACCESS_KEY_ID=replace
S3_SECRET_ACCESS_KEY=replace

# ── Vector Search ─────────────────────────────────────────────────────
VECTOR_INDEX_NAME=job_embeddings_v1

# ── Job Feed Partners ───────────────────────────────────────────────────
JOB_FEED_API_KEY=replace
JOB_FEED_POLL_CRON=0 3 * * *
Frontend .env.example (additions)
env
VITE_API_BASE_URL=http://localhost:5000
VITE_ENABLE_FREELANCE_MODE=true
VITE_ENABLE_MOCK_INTERVIEW=true

Env validation follows the exact Zod pattern in Section 3 of the base blueprint — AI_* and S3_* keys added to envSchema as required/optional per feature flag.

9. Backend Architecture
Middleware stack order

Same 11-step order as the base blueprint (Sentry → helmet → cors → body parsing → mongo-sanitize → morgan → global rate limit → auth-route rate limit → routes → Sentry error handler → central error handler), with one addition: an aiRateLimit middleware mounted on /api/v1/ai/* and any route that triggers an LLM call (resume parse, matching explanation, tailoring, interview coach), enforcing a per-user monthly token budget to control cost and abuse.

Standard response shapes

Identical to base blueprint — { success, data } / { success: false, error: { code, message, fields? } } / paginated variant. AI-generated content responses additionally carry a generatedAt and modelVersion field for traceability:

json
{
  "success": true,
  "data": {
    "tailoredBullets": ["..."],
    "modelVersion": "claude-sonnet-5",
    "generatedAt": "2026-09-25T10:00:00Z"
  }
}
Ownership & timing-safe comparisons

assertOwnership() and crypto.timingSafeEqual() patterns from the base blueprint apply unchanged — used on every resume, application, and gig record lookup.

10. AI Agent & Data Pipeline

This is the part of JobWise that differs most from the generic blueprint, so it gets its own section.

10.1 Resume ingestion pipeline
User uploads PDF/DOCX → stored encrypted in S3 (never in Mongo directly).
Text extraction (pdf-parse/mammoth) → raw text.
LLM structuring pass with a strict JSON schema (Zod-validated on the way back) → structured resume object (experience, education, skills, projects).
Embedding generated from structured resume → stored in vector index for matching.
10.2 Job matching
Job feed ingestion (cron) pulls postings from partner APIs → normalized → embedded → stored.
On-demand or scheduled matching job: cosine similarity search between user's resume embedding and job embeddings → top-N candidates.
LLM rerank + rationale pass over top-N candidates only (to control cost) → final ranked list with a one-line "why this matches" explanation per job.
10.3 Tailoring & interview prep
Tailoring calls are scoped to a single job at a time and always return a draft the user must approve — never auto-submitted to an external ATS.
Interview prep generates questions from job description + (optionally) company research; mock-interview feedback is generated per answer, not batched, so the user can iterate.
10.4 Cost & reliability guardrails
Per-user monthly token budget (env-configured), enforced by aiRateLimit middleware.
All LLM calls wrapped with retry/backoff and a fallback message if the provider errors — never leave the user on a blank state.
Cache resume structuring and job embeddings — never re-run the same parse/embedding unless the source document changed (hash-compare).
10.5 Data retention & user control
Users can delete their resume and all derived data (embeddings, tailored drafts) at any time — cascades through Mongo and the vector index and S3.
Structured resume data and generated drafts are treated as sensitive PII — see Section 12.
11. API Documentation Standard

Uses the same template as the base blueprint (Section 5) for every endpoint. Example filled in for a JobWise-specific endpoint:

### POST /api/v1/jobs/:id/tailor

**Description:** Generates a tailored resume-bullet set and cover-letter draft for a specific saved job.
**Auth required:** Yes
**Minimum role:** owner

#### Request
Headers:
  Authorization: Bearer <accessToken>
  Content-Type: application/json

Path params:
  :id — MongoDB ObjectId of the saved job

Body:
  {
    "resumeVersionId": "64a1...",   // Required. Which resume version to tailor from.
    "tone": "concise"               // Optional. Default: "concise". One of: concise | detailed | formal.
  }

#### Response — 200 OK
  {
    "success": true,
    "data": {
      "tailoredBullets": ["..."],
      "coverLetterDraft": "...",
      "modelVersion": "claude-sonnet-5",
      "generatedAt": "2026-09-25T10:00:00Z"
    }
  }

#### Response — 429 Rate Limited (AI budget)
  { "success": false, "error": { "code": "AI_BUDGET_EXCEEDED", "message": "Monthly AI usage limit reached" } }

#### Use cases
  - User has saved a job and wants a ready-to-edit tailored application.

#### Business rules
  - Never auto-submitted; user must explicitly export/copy the draft.
  - Counts against the user's monthly AI token budget.

Full endpoint set to document per module: auth, users, resumes, jobs, skillGaps, applications, interviewPrep, freelanceGigs — each following this template, plus the Error Codes Master Reference table from the base blueprint (Section 5), extended with:

HTTP	Code	When to use
429	AI_BUDGET_EXCEEDED	User hit their monthly AI token budget
422	RESUME_PARSE_FAILED	Resume text extraction or LLM structuring failed validation
409	DUPLICATE_APPLICATION	Job already saved/tracked for this user
12. Backend Security & Privacy Checklist

All items from the base blueprint's Section 6 apply unchanged (env/config, auth, API security, infra). JobWise-specific additions, given resumes and career data are sensitive PII:

 Resume files stored encrypted at rest in S3; never stored as raw binary in MongoDB
 Structured resume data (name, contact info, work history) encrypted at the field level or in an access-scoped collection
 GET /users/me/export includes resumes, structured resume data, tailored drafts, and application history (GDPR-style portability)
 DELETE /users/me cascades to: S3 files, structured resume docs, vector-index embeddings, tailored drafts, application records — confirmation-text required
 AI provider calls never include unrelated users' data in the same prompt/context
 Per-user monthly AI token budget enforced server-side (aiRateLimit), not just client-side
 No resume text, structured PII, or AI-generated drafts ever logged (Winston) or sent to Sentry breadcrumbs
 Job-feed partner API keys stored server-side only — never exposed to frontend
 Rate limiting on /api/v1/ai/* separate from and stricter than general /api limit
 Vector index access scoped so one user's embeddings are never returned in another user's match query
13. Frontend Architecture

Axios client, refresh-token interceptor, in-memory tokenStore, AuthProvider, RequireAuth, and TanStack Query hook patterns are identical to the base blueprint (Section 7) — reuse verbatim.

JobWise-specific frontend additions:

Resume upload flow: drag-and-drop → progress indicator → parsed-preview screen where the user confirms/corrects extracted fields before it's used for matching.
Match feed: infinite-scroll or paginated list of ranked jobs with the "why this matched" explanation surfaced inline (not hidden behind a click).
Skill gap view: prioritized list with a simple visual (e.g., bar per skill: have vs. need) and linked resources.
Application tracker board: Kanban columns (Saved → Applied → Interviewing → Offer → Rejected/Withdrawn) using @dnd-kit/core; drag between columns updates status via a TanStack mutation.
Interview prep/mock interview: chat-style UI, one question at a time, feedback rendered after each answer (not batched at the end).
AI content review pattern: any AI-generated text (tailored bullets, cover letters, interview questions) is rendered as editable text areas, never auto-submitted anywhere — the user always has an explicit "Approve/Export" action.
14. Frontend Security Checklist

All items from the base blueprint's Section 8 apply unchanged (token/session security, XSS prevention, CSRF, dependencies, data handling, route security). JobWise-specific additions:

 Resume file previews rendered via safe viewers only (no dangerouslySetInnerHTML on parsed resume text without DOMPurify)
 AI-generated cover letters/bullets sanitized before render if displayed as rich text
 File upload restricted client-side to .pdf/.docx, size-capped (e.g., 5MB), re-validated server-side
 No resume content or structured PII persisted to localStorage/sessionStorage
15. Success Metrics (KPIs)
Metric	Target (v1 pilot)
Median time from "save job" to "tailored draft ready"	< 2 minutes
% of users completing resume upload + parse in onboarding	> 80%
% of matched jobs marked "relevant" by user feedback	> 60%
Weekly active users returning to tracker	> 40% of signups
Mock interview sessions per active user / month	≥ 2
AI budget overage rate (users hitting monthly cap)	< 5%
16. Roadmap / Phasing
Phase 1 (MVP): Resume upload/parse, job matching (single feed source), application tracker, basic tailoring (bullets only).
Phase 2: Skill gap analysis, full cover-letter tailoring, interview prep (text-based).
Phase 3: Mock interview with voice input/transcript, freelancer mode, multi-source job feed aggregation.
Phase 4 (exploratory): Employer-facing surface (candidate discovery), browser extension for one-click "save this job," calendar integration for interview scheduling.
17. Master Bootstrap Prompt

Adapted from the base blueprint's Section 11.1 — copy into an AI coding assistant once this PRD is approved:

Build a production-ready full-stack app with TypeScript for JobWise, an AI career agent.

Industry: Career/EdTech (job search + freelance gig matching)
Primary resources: resumes, jobs, applications, skillGaps, interviewPrep, freelanceGigs

── Backend ──────────────────────────────────────────────────────────────
- Monorepo: backend/ (Express 5 + Mongoose + TypeScript) and frontend/ (Vite + React + TypeScript)
- Before writing any package.json: web search each dependency for latest stable + advisories,
  confirm with `npm show <pkg> version` — never copy versions from any blueprint doc
- Structure per Section 7 of JOBWISE_PRD.md, including services/ai/ for Claude SDK integration
- Auth: Google OAuth + email/password; JWT access (15min) + refresh (7d) rotation, per base blueprint
- AI integration: Anthropic SDK wrapper (services/ai/claudeClient.ts); resume structuring,
  job-match reranking, tailoring, and interview coach all as separate service modules with
  strict Zod-validated I/O schemas
- Per-user monthly AI token budget enforced via aiRateLimit middleware
- Vector search (MongoDB Atlas Vector Search) for resume↔job embedding matching
- Security middleware order per base blueprint Section 4, plus aiRateLimit on /api/v1/ai/*
- Resume files in S3 (encrypted at rest); structured resume data field-level encrypted
- assertOwnership() in every controller; crypto.timingSafeEqual() for all token comparisons
- Zod validation on every route; consistent { success, data } / { success:false, error } shape
- Winston + Sentry with zero resume content or PII in logs/breadcrumbs
- node-cron for job-feed ingestion and application follow-up reminders
- GET /health and GET /ready

── Frontend ─────────────────────────────────────────────────────────────
- Axios + single-flight refresh interceptor + in-memory token store (per base blueprint Section 7)
- Resume upload with parsed-preview confirmation step before first match run
- Match feed with inline "why this matched" explanation
- Skill gap view, Kanban application tracker (@dnd-kit/core), interview prep chat UI
- All AI-generated content shown as editable + requires explicit Approve/Export action
- React Hook Form + Zod for all forms; DOMPurify for any AI-generated rich text

── Deliverables ─────────────────────────────────────────────────────────
1. .env.example (backend + frontend) including AI_*, S3_*, VECTOR_* keys
2. Root .gitignore + .cursorignore per base blueprint Section 9
3. README with setup, seed, run instructions + CI workflow (npm ci, typecheck, test, npm audit)
4. Postman collection covering resumes, jobs, applications, AI endpoints
5. Full API documentation per Section 11 of JOBWISE_PRD.md for every endpoint
6. TypeScript strict-mode tsconfig for backend and frontend
18. Open Questions & Risks
Job feed sourcing: which partner APIs/scrapers are licensed for use? (Legal review needed before Phase 1 ships.)
AI cost model: what's the sustainable per-user AI budget at scale, and does pricing need a paid tier to cover it?
ATS auto-submission: is there future demand (and acceptable risk) for direct submission to platforms like Greenhouse/Lever via their APIs, vs. keeping the "copy/export, you submit" model indefinitely?
Accuracy liability: how do we disclose that skill-gap and interview feedback are AI-generated guidance, not guarantees, to manage user expectations?
Data residency: any student-data-privacy regulations (e.g., FERPA-adjacent concerns) if JobWise partners with universities directly?

This PRD inherits its engineering conventions (security checklist, env pattern, middleware order, error shape) from the internal Full-Stack Project Blueprint v2.2. Section 6 (Tech Stack) and Sections 9–14 should be re-validated against that blueprint's Version Safety Rule before implementation begins.