# JobWise 🚀

**Autonomous AI Career Agent for Students, Job Seekers & Freelancers**

Built on the **Full-Stack Project Blueprint v2.2** with **Express 5 + TypeScript + MongoDB + Anthropic Claude**.

---

## 📌 Features

- **Resume Analysis & Parsing**: Upload PDF/DOCX resumes, extract clean structured data via AI, evaluate ATS parseability, impact, and brevity with constructive feedback.
- **Job Discovery & Personal Match Fit**: Ranks postings by semantic skill fit against user profiles, explaining precisely why each role matched.
- **Skill Gap Analysis**: Aggregates target role requirements across the market and produces a prioritized learning/project roadmap.
- **Application Tailoring**: Generates job-specific tailored resume accomplishments and personalized cover letters with human approval before export.
- **Application Tracking**: Full Kanban-style pipeline (`Saved` → `Applied` → `Interviewing` → `Offer` → `Rejected` → `Withdrawn`) with notes and timeline history.
- **Role-Specific Interview Prep**: Generates STAR-method behavioral and technical interview questions, grading candidate responses with iterative feedback.
- **Freelance Mode**: Parallel track for gig discovery, proposal/pitch drafting, and freelance contract tracking.

---

## 🛡️ Security & Privacy Engineering

- **Strict Version Safety**: All dependencies verified against registry advisories; zero critical/high vulnerabilities (`npm audit clean`).
- **Cryptographic Protection**:
  - Resumes stored encrypted at rest with **AES-256-GCM** (never stored as raw binaries).
  - Passwords hashed with **bcryptjs** (cost factor 10+).
  - Timing-safe token comparison with `crypto.timingSafeEqual()`.
- **Dual-Token Auth & Session Rotation**:
  - Access JWT (15m, `Authorization: Bearer` header).
  - Refresh JWT (7d, stored in `HttpOnly; Secure; SameSite=Strict` cookie).
  - Refresh token rotation on every `/auth/refresh` call with automated breach detection (revokes all sessions on replay).
  - Account lockout after 5 consecutive failed attempts (15-minute lock).
- **IDOR Defense**: `assertOwnership()` in every controller ensures users can never access or infer the existence of another user's records (always returns `404 Not Found`, never `403`).
- **PII Scrubbing**: Zero passwords, tokens, raw resume text, or PII logged in Winston console/file logs.
- **Defensive Middleware**: Helmet security headers, explicit CORS allowlist, Express Mongo Sanitize (NoSQL injection prevention), and tiered Rate Limiting (general, strict auth, and monthly AI token budget).
- **GDPR Rights**: `GET /api/v1/users/me/export` (data portability) and `DELETE /api/v1/users/me` (requires `"DELETE MY ACCOUNT"` confirmation, cascading to all documents and storage).

---

## 🚀 Quick Start (Backend)

### 1. Prerequisites
- **Node.js**: `v24.x` (or active LTS)
- **MongoDB**: Local MongoDB community server running on port `27017` or MongoDB Atlas URI

### 2. Environment Setup
Navigate to `backend/` and copy the environment template:

```bash
cd backend
cp .env.example .env
```

The repository includes a ready-to-run `.env` configured with pre-generated cryptographic keys.

### 3. Run in Development Mode

```bash
cd backend
npm run dev
```

The server starts at `http://localhost:5000`:
- **Liveness probe**: `GET http://localhost:5000/health`
- **Readiness probe**: `GET http://localhost:5000/ready`
- **API Base**: `http://localhost:5000/api/v1`

### 4. Build for Production

```bash
npm run build
npm start
```

### 5. Type Checking & Auditing

```bash
npm run typecheck    # Strict TypeScript verification
npm audit            # Verify zero security advisories
```

---

## 📬 Postman Testing

1. Import `backend/postman/collection.json` into Postman.
2. Import `backend/postman/environment.json`.
3. Execute the requests in sequence:
   - `POST /api/v1/auth/register` (creates user, saves tokens automatically)
   - `GET /api/v1/users/me` (retrieves authenticated profile)
   - `GET /api/v1/jobs` (lists pre-seeded job postings with personalized fit score)
   - `POST /api/v1/applications` (creates an application tracker card)
   - `PATCH /api/v1/applications/:id/status` (updates Kanban stage)
   - `GET /api/v1/skill-gaps` (analyzes candidate market deficiencies)
   - `POST /api/v1/interview-prep/generate` (generates AI mock interview questions)

---

## 📚 API Endpoints Summary

| Method | Endpoint | Auth | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/health` | Public | Liveness probe |
| `GET` | `/ready` | Public | Readiness probe (verifies MongoDB) |
| `POST` | `/api/v1/auth/register` | Public | Register new user |
| `POST` | `/api/v1/auth/login` | Public | Login (returns access token & sets HttpOnly cookie) |
| `POST` | `/api/v1/auth/refresh` | Cookie | Rotate refresh token & grant new access token |
| `POST` | `/api/v1/auth/logout` | Auth | Revoke refresh token & clear cookie |
| `GET` | `/api/v1/users/me` | Auth | Get current profile |
| `PATCH`| `/api/v1/users/me` | Auth | Update target roles & preferences |
| `GET` | `/api/v1/users/me/export` | Auth | GDPR user data export |
| `DELETE`| `/api/v1/users/me` | Auth | Cascading delete account (`DELETE MY ACCOUNT`) |
| `POST` | `/api/v1/resumes/upload` | Auth | Upload PDF/DOCX, AES-256 encrypted, AI parse |
| `GET` | `/api/v1/resumes` | Auth | List candidate resumes |
| `GET` | `/api/v1/jobs` | Public/Auth | List jobs with personalized match rationale |
| `POST` | `/api/v1/jobs` | Auth | Post a manual job |
| `POST` | `/api/v1/jobs/:id/tailor`| Auth | Tailor resume bullets and cover letter |
| `GET` | `/api/v1/applications` | Auth | Get Kanban board applications and counts |
| `POST` | `/api/v1/applications` | Auth | Track an application |
| `PATCH`| `/api/v1/applications/:id/status` | Auth | Move application through Kanban stages |
| `GET` | `/api/v1/skill-gaps` | Auth | Calculate skill gaps against target roles |
| `POST` | `/api/v1/interview-prep/generate` | Auth | Generate role-specific interview pack |
| `POST` | `/api/v1/interview-prep/:id/evaluate` | Auth | Grade mock interview answer (STAR format) |
| `GET` | `/api/v1/freelance-gigs`| Public/Auth | Browse freelance gigs |
| `POST` | `/api/v1/freelance-gigs/:id/pitch` | Auth | Draft high-converting freelance pitch |
