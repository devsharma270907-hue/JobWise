# JobWise Backend API & Developer Handoff Specification

> **Version:** 1.0.0  
> **Environment:** Node.js 20+ / Express 5 / TypeScript  
> **Default Port:** 5001  
> **Primary Documentation:** [`API_DOCUMENTATION.md`](file:///c:/Users/devsh/OneDrive/Desktop/JobWise/API_DOCUMENTATION.md)  
> **Postman Suite:** `JobWise API - Complete Suite` (34 Endpoints)

---

## 🏛 System Architecture Overview

```mermaid
graph TD
    Client[Web Client / Postman / Mobile App] -->|HTTPS| Gateway[Helmet & CORS Security Layer]
    Gateway --> Limiter[Rate Limiters: Global 120/m, Auth 10/m]
    Limiter --> Parsers[Body & Cookie Parsers + Mongo Sanitize]
    Parsers --> AuthCheck{Auth Guard: JWT Verification}
    
    AuthCheck -->|Public| PublicRoutes[Health / Ready / Public Jobs]
    AuthCheck -->|Protected (Bearer Token)| ProtectedModules[Users / Resumes / Applications / Gigs / Interview Prep]
    
    ProtectedModules --> Controllers[Controllers & Service Layer]
    Controllers --> Atlas[(MongoDB Atlas via DoH SRV Resolver)]
    Controllers --> Claude[Anthropic Claude AI Engine]
    Controllers --> Storage[File Storage: ./uploads]
```

---

## 🚦 HTTP Status Codes & Scenarios

| Code | Status | Meaning | Typical Trigger Scenarios |
|:---:|---|---|---|
| **`200`** | **OK** | Request completed successfully | Fetching profiles, updating application stages, answer evaluations |
| **`201`** | **Created** | Resource created | `POST /register`, `POST /applications`, `POST /jobs`, `POST /interview-prep/generate` |
| **`400`** | **Bad Request** | Malformed request or validation failure | Missing required fields, regex failure (password), malformed JSON payload |
| **`401`** | **Unauthorized** | Missing, expired, or invalid token | No `Authorization: Bearer <token>`, expired JWT, invalid signature |
| **`403`** | **Forbidden** | Ownership check failure | Attempting to update or delete another user's application, resume, or gig |
| **`404`** | **Not Found** | Resource does not exist | Application ID or Job ID not found, unknown endpoint |
| **`409`** | **Conflict** | Resource duplicate | Registering an email that already exists in MongoDB (`E11000`) |
| **`429`** | **Too Many Requests** | Rate limit exceeded | Exceeded 10 failed logins/min or 120 API requests/min |
| **`500`** | **Internal Error** | Unhandled server error | AI provider failure or unexpected runtime exception |
| **`503`** | **Service Unavailable** | Infrastructure degraded | Database connection down during `/ready` probe |

---

## 🔄 Multi-Scenario Business Logic Flows

### 1. Application Kanban Lifecycle
```
[saved] ──> [applied] ──> [interviewing] ──> [offer]
   │             │               │
   └──> [withdrawn] / [rejected] <┘
```
- **Scenario A (Direct Application):** Application created directly in `applied` stage with tailored bullets.
- **Scenario B (Stage Transitions):** Moving through `interviewing` ➔ `offer`. Each stage change appends historical notes.
- **Scenario C (Discard / Withdrawal):** User withdraws from application (`withdrawn`) or recruiter rejects (`rejected`).

### 2. Freelance Gig Lifecycle
```
[open] ──> [proposal_sent] ──> [in_discussion] ──> [won] ──> [completed]
  │
  └──> [closed] (Cancelled / Expired)
```

---

## 📂 Category-Wise Endpoint Summary (34 Endpoints)

| Category | Endpoint | Method | Auth | Key Features & Auto-Saves |
|---|---|:---:|:---:|---|
| **Health** | `/health` | `GET` | ❌ | Server process uptime |
| | `/ready` | `GET` | ❌ | MongoDB connection verification |
| **Auth** | `/api/v1/auth/register` | `POST` | ❌ | Auto-saves `{{accessToken}}` and `{{userId}}` |
| | `/api/v1/auth/login` | `POST` | ❌ | Issues JWT + HttpOnly refresh cookie |
| | `/api/v1/auth/refresh` | `POST` | ❌ (Cookie) | Token rotation |
| | `/api/v1/auth/logout` | `POST` | ✅ / Optional | Invalidate token in DB & clear cookie |
| **Users** | `/api/v1/users/me` | `GET` | ✅ | Profile + token budget status |
| | `/api/v1/users/me` | `PATCH` | ✅ | Update skills, target roles, locations |
| | `/api/v1/users/me/export` | `GET` | ✅ | Full GDPR account data download |
| | `/api/v1/users/me` | `DELETE` | ✅ | Requires `"DELETE MY ACCOUNT"` confirmation |
| **Resumes** | `/api/v1/resumes` | `POST` | ✅ | Multipart PDF/DOCX file upload |
| | `/api/v1/resumes` | `GET` | ✅ | List user resumes (auto-saves `{{resumeId}}`) |
| | `/api/v1/resumes/:id` | `GET` | ✅ | Parsed resume details |
| | `/api/v1/resumes/:id` | `DELETE` | ✅ | Removes file and database entry |
| **Jobs** | `/api/v1/jobs` | `GET` | Optional | Ranked match feed based on user skills |
| | `/api/v1/jobs/:id` | `GET` | Optional | Job details & requirements |
| | `/api/v1/jobs` | `POST` | ✅ | Create new job listing |
| | `/api/v1/jobs/:id/tailor` | `POST` | ✅ | AI resume bullet tailoring for specific job |
| **Applications** | `/api/v1/applications` | `GET` | ✅ | Kanban board view |
| | `/api/v1/applications` | `POST` | ✅ | Create tracker record (auto-saves `{{applicationId}}`) |
| | `/api/v1/applications/:id` | `GET` | ✅ | Application history & notes |
| | `/api/v1/applications/:id/status` | `PATCH` | ✅ | Stage transition (`saved`, `applied`, `interviewing`, etc.) |
| | `/api/v1/applications/:id/notes` | `POST` | ✅ | Add interviewer note |
| | `/api/v1/applications/:id` | `DELETE` | ✅ | Remove application record |
| **Skill Gaps** | `/api/v1/skill-gaps` | `GET` | ✅ | Gap analysis & recommended learning roadmap |
| **Interview Prep** | `/api/v1/interview-prep/generate` | `POST` | ✅ | AI generates 5 questions (auto-saves `{{prepSessionId}}`) |
| | `/api/v1/interview-prep` | `GET` | ✅ | List user sessions |
| | `/api/v1/interview-prep/:id` | `GET` | ✅ | Fetch session questions & answers |
| | `/api/v1/interview-prep/:id/evaluate`| `POST` | ✅ | AI grades answer & provides model response |
| **Freelance** | `/api/v1/freelance-gigs` | `GET` | ✅ | Marketplace feed (auto-saves `{{gigId}}`) |
| | `/api/v1/freelance-gigs/:id` | `GET` | ✅ | Gig details |
| | `/api/v1/freelance-gigs` | `POST` | ✅ | Post client gig |
| | `/api/v1/freelance-gigs/:id/pitch` | `POST` | ✅ | AI-generated client pitch/proposal |
| | `/api/v1/freelance-gigs/:id` | `PATCH` | ✅ | Update gig status/budget |

---

## 🛠 Solved Gotchas & Developer Knowledge Base

> [!IMPORTANT]
> **1. Express 5 `req.query` Immutability**  
> In Express 5, `req.query` is getter-only. Sanitizers or reassignments will throw `TypeError`. Use `Object.defineProperty` or reference the prototype setter patch in [`src/app.ts`](file:///c:/Users/devsh/OneDrive/Desktop/JobWise/backend/src/app.ts).

> [!TIP]
> **2. Atlas DNS & `SSL alert 80`**  
> Dynamic IPs and Windows c-ares DNS trigger `EBADRESP`. [`src/config/db.ts`](file:///c:/Users/devsh/OneDrive/Desktop/JobWise/backend/src/config/db.ts) resolves SRV records via Google DNS-over-HTTPS (`https://dns.google/resolve`).

> [!CAUTION]
> **3. Database Case Sensitivity**  
> MongoDB Atlas requires exact database casing: `JobWise` (not `jobwise`).

---

## 🚀 Incoming Developer Quickstart

```powershell
cd backend
npm install
npm run dev
```

Run test suite via Postman MCP skill:
> Say: *"Run the Postman tests"* to execute all 34 requests automatically.
