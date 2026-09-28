# JobWise Frontend API Reference & Integration Guide

> **Version:** 1.0.0  
> **Environment:** Development & Production  
> **Base URL:** `http://localhost:5001` (Dev)  
> **API Prefix:** `/api/v1`  
> **Authentication Header:** `Authorization: Bearer <accessToken>`  
> **Cookie Handling:** `credentials: 'include'` (For `HttpOnly` refresh tokens)  
> **Date Generated:** September 2026

---

## Table of Contents
1. [Core Integration Principles & Types](#1-core-integration-principles--types)
2. [Error Handling & Status Codes](#2-error-handling--status-codes)
3. [System Diagnostics](#3-system-diagnostics)
4. [Authentication Module (`/auth`)](#4-authentication-module-auth)
5. [User Profile Management (`/users`)](#5-user-profile-management-users)
6. [Resume Management (`/resumes`)](#6-resume-management-resumes)
7. [Jobs & Match Feed (`/jobs`)](#7-jobs--match-feed-jobs)
8. [Application Tracker / Kanban (`/applications`)](#8-application-tracker--kanban-applications)
9. [Skill Gap Analytics (`/skill-gaps`)](#9-skill-gap-analytics-skill-gaps)
10. [AI Mock Interview Coach (`/interview-prep`)](#10-ai-mock-interview-coach-interview-prep)
11. [Freelance Gigs Marketplace (`/freelance-gigs`)](#11-freelance-gigs-marketplace-freelance-gigs)
12. [Postman & OpenAPI Exports](#12-postman--openapi-exports)

---

## 1. Core Integration Principles & Types

### Standard Envelope Format

Every backend response conforms to the following TypeScript interfaces:

```typescript
// 🟢 Standard Success Envelope
export interface ApiResponse<T> {
  success: true;
  data: T;
  pagination?: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

// 🔴 Standard Error Envelope
export interface ApiErrorResponse {
  success: false;
  error: {
    code: string;       // e.g., "VALIDATION_ERROR", "UNAUTHORIZED", "NOT_FOUND"
    message: string;    // Human-readable summary
    fields?: Record<string, string[]>; // Field-specific validation failures
  };
}
```

### Axios / Fetch Setup Best Practice

```typescript
import axios from 'axios';

export const apiClient = axios.create({
  baseURL: 'http://localhost:5001/api/v1',
  withCredentials: true, // Crucial for automatic HttpOnly refresh cookies
  headers: {
    'Content-Type': 'application/json',
  },
});

// Automatic Bearer Token Interceptor
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('jobwise_access_token');
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Automatic 401 Refresh Interceptor
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const { data } = await axios.post(
          'http://localhost:5001/api/v1/auth/refresh',
          {},
          { withCredentials: true }
        );
        const newToken = data.data.accessToken;
        localStorage.setItem('jobwise_access_token', newToken);
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return apiClient(originalRequest);
      } catch (refreshErr) {
        localStorage.removeItem('jobwise_access_token');
        window.location.href = '/login';
        return Promise.reject(refreshErr);
      }
    }
    return Promise.reject(error);
  }
);
```

---

## 2. Error Handling & Status Codes

| Status Code | Meaning | UI Recommended Action |
|:---:|---|---|
| `200` | OK | Update view state / toast notification |
| `201` | Created | Append new card / redirect to detail view |
| `400` | Validation Error | Highlight input fields using `error.fields` map |
| `401` | Unauthorized | Refresh token interceptor or redirect to `/login` |
| `403` | Forbidden | Show "Permission Denied" modal |
| `404` | Not Found | Show empty state or 404 screen |
| `409` | Conflict | Display conflict toast (e.g., "Email already registered") |
| `429` | Rate Limited | Display warning banner: "Too many requests. Please wait." |
| `500` | Server Error | Display generic error toast with retry button |

---

## 3. System Diagnostics

### 3.1 Health Probe
* **Endpoint:** `GET /health`
* **Auth:** None
* **Response (200 OK):**
```json
{
  "status": "ok",
  "uptime": 1248.5
}
```

### 3.2 Database Readiness Probe
* **Endpoint:** `GET /ready`
* **Auth:** None
* **Response (200 OK):**
```json
{
  "status": "ready",
  "database": "connected"
}
```

---

## 4. Authentication Module (`/auth`)

### 4.1 Register New Candidate
* **Endpoint:** `POST /api/v1/auth/register`
* **Auth:** None
* **Body:**
```json
{
  "name": "Dev Sharma",
  "email": "dev@example.com",
  "password": "Password123!",
  "role": "student" // "student" | "switcher" | "freelancer" (Optional, defaults to "student")
}
```
* **Response (201 Created):**
```json
{
  "success": true,
  "data": {
    "user": {
      "_id": "6aba38f3f670ee97574339e1",
      "name": "Dev Sharma",
      "email": "dev@example.com",
      "role": "student",
      "skills": [],
      "targetRoles": []
    },
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### 4.2 Candidate Login
* **Endpoint:** `POST /api/v1/auth/login`
* **Auth:** None
* **Body:**
```json
{
  "email": "dev@example.com",
  "password": "Password123!"
}
```
* **Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "user": {
      "_id": "6aba38f3f670ee97574339e1",
      "name": "Dev Sharma",
      "email": "dev@example.com",
      "role": "student"
    },
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```
* **Cookie Set:** `refreshToken` (HttpOnly, Secure in prod, SameSite=Strict)

### 4.3 Rotate Access Token
* **Endpoint:** `POST /api/v1/auth/refresh`
* **Auth:** Cookie-based (`refreshToken`)
* **Body:** None
* **Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### 4.4 User Logout
* **Endpoint:** `POST /api/v1/auth/logout`
* **Auth:** None
* **Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "message": "Successfully logged out"
  }
}
```

---

## 5. User Profile Management (`/users`)

### 5.1 Get Current Profile
* **Endpoint:** `GET /api/v1/users/me`
* **Auth:** `Bearer <accessToken>`
* **Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "_id": "6aba38f3f670ee97574339e1",
    "name": "Dev Sharma",
    "email": "dev@example.com",
    "role": "switcher",
    "skills": ["TypeScript", "Node.js", "Express", "MongoDB", "Redis"],
    "targetRoles": ["Staff Backend Systems Engineer"],
    "targetLocations": ["Remote", "San Francisco, CA"],
    "preferredComp": "$190,000 - $230,000",
    "aiUsage": {
      "monthlyTokensUsed": 450,
      "monthlyBudget": 200000,
      "budgetResetAt": "2026-10-28T09:30:00.000Z"
    },
    "createdAt": "2026-09-28T09:30:00.000Z"
  }
}
```

### 5.2 Update Profile
* **Endpoint:** `PATCH /api/v1/users/me`
* **Auth:** `Bearer <accessToken>`
* **Body (All fields optional):**
```json
{
  "name": "Dev Sharma",
  "targetRoles": ["Staff Backend Systems Engineer", "System Architect"],
  "targetLocations": ["Remote", "San Francisco, CA"],
  "skills": ["TypeScript", "Node.js", "Express", "MongoDB", "Redis"],
  "preferredComp": "$190,000 - $230,000"
}
```
* **Response (200 OK):** Returns updated user object.

### 5.3 Export Account Data (GDPR)
* **Endpoint:** `GET /api/v1/users/me/export`
* **Auth:** `Bearer <accessToken>`
* **Response (200 OK):** Complete consolidated JSON archive containing user profile, applications, notes, and interview prep history.

### 5.4 Delete Account
* **Endpoint:** `DELETE /api/v1/users/me`
* **Auth:** `Bearer <accessToken>`
* **Body:**
```json
{
  "confirmationText": "DELETE MY ACCOUNT"
}
```
* **Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "message": "Account successfully deleted"
  }
}
```

---

## 6. Resume Management (`/resumes`)

### 6.1 Upload Resume File
* **Endpoint:** `POST /api/v1/resumes/upload`
* **Auth:** `Bearer <accessToken>`
* **Content-Type:** `multipart/form-data`
* **Form Field:** `resume` (PDF or DOCX, max 5MB)
* **Response (201 Created):**
```json
{
  "success": true,
  "data": {
    "resume": {
      "_id": "6aba38f4f670ee97574339e2",
      "fileName": "Dev_Sharma_Resume.pdf",
      "fileSize": 142850,
      "score": {
        "overall": 94,
        "impact": 95,
        "brevity": 92,
        "atsParseability": 96,
        "actionableFeedback": [
          "Strong quantification of metrics and system scale."
        ]
      },
      "parsedData": {
        "contactInfo": {
          "name": "Dev Sharma",
          "email": "dev@example.com",
          "location": "San Francisco, CA"
        },
        "summary": "Staff Backend Systems Engineer with 7+ years architecting distributed microservices...",
        "experience": [],
        "education": [],
        "skills": ["TypeScript", "Node.js", "MongoDB", "Redis"]
      }
    }
  }
}
```

### 6.2 List User Resumes
* **Endpoint:** `GET /api/v1/resumes`
* **Auth:** `Bearer <accessToken>`
* **Response (200 OK):** Array of uploaded resumes with ATS scorecards.

### 6.3 Get Single Resume
* **Endpoint:** `GET /api/v1/resumes/:id`
* **Auth:** `Bearer <accessToken>`
* **Response (200 OK):** Single resume detail object.

### 6.4 Delete Resume
* **Endpoint:** `DELETE /api/v1/resumes/:id`
* **Auth:** `Bearer <accessToken>`
* **Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "message": "Resume deleted successfully"
  }
}
```

---

## 7. Jobs & Match Feed (`/jobs`)

### 7.1 Search & Ranked Job Feed
* **Endpoint:** `GET /api/v1/jobs`
* **Auth:** Optional (Logged-in users get personalized `match` calculations)
* **Query Parameters:**
  - `search`: string (e.g. `?search=distributed`)
  - `role`: string
  - `location`: string
  - `remote`: boolean (`true` / `false`)
  - `jobType`: `"full-time"` | `"internship"` | `"contract"` | `"part-time"`
  - `page`: number (default: `1`)
  - `limit`: number (default: `20`)
* **Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "job": {
        "_id": "6aba38f4f670ee97574339e2",
        "title": "Staff Backend Systems Engineer",
        "company": "Stripe",
        "location": "Remote",
        "jobType": "full-time",
        "salaryRange": "$195,000 - $230,000",
        "skills": ["TypeScript", "Node.js", "MongoDB", "Redis"]
      },
      "match": {
        "score": 95,
        "rationale": "Strong alignment with core skills: TypeScript, Node.js, MongoDB."
      }
    }
  ],
  "pagination": {
    "total": 1,
    "page": 1,
    "limit": 20,
    "totalPages": 1
  }
}
```

### 7.2 Get Single Job
* **Endpoint:** `GET /api/v1/jobs/:id`
* **Auth:** Optional
* **Response (200 OK):** Job object enriched with candidate match fit.

### 7.3 Create Job Listing
* **Endpoint:** `POST /api/v1/jobs`
* **Auth:** `Bearer <accessToken>`
* **Body:**
```json
{
  "title": "Staff Backend Systems Engineer",
  "company": "Stripe",
  "location": "Remote",
  "remote": true,
  "jobType": "full-time",
  "salaryRange": "$195k - $230k",
  "description": "Lead the design of next-generation distributed payment settlement...",
  "requirements": ["6+ years backend engineering"],
  "skills": ["TypeScript", "Node.js", "MongoDB", "Redis"]
}
```
* **Response (201 Created):** Returns created job document.

### 7.4 AI Resume Tailoring for Job
* **Endpoint:** `POST /api/v1/jobs/:id/tailor`
* **Auth:** `Bearer <accessToken>`
* **Body:**
```json
{
  "resumeVersionId": "6aba38f4f670ee97574339e2",
  "tone": "concise" // "concise" | "detailed" | "formal" (Optional, defaults to "concise")
}
```
* **Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "tailoredBullets": [
      "Engineered resilient, high-throughput Node.js/TypeScript backend services exceeding 99.9% uptime SLA.",
      "Spearheaded MongoDB query optimizations reducing p95 database query latency by 35%."
    ],
    "coverLetterDraft": "Dear Hiring Team,\n\nI am thrilled to submit my application...",
    "modelVersion": "claude-3-5-sonnet-20241022",
    "generatedAt": "2026-09-28T09:52:53.000Z"
  }
}
```

---

## 8. Application Tracker / Kanban (`/applications`)

### 8.1 List Tracked Applications
* **Endpoint:** `GET /api/v1/applications`
* **Auth:** `Bearer <accessToken>`
* **Query Params:** `?status=applied` (Optional filter)
* **Response (200 OK):** Array of applications for the Kanban board.

### 8.2 Track New Application
* **Endpoint:** `POST /api/v1/applications`
* **Auth:** `Bearer <accessToken>`
* **Body:**
```json
{
  "jobId": "6aba38f4f670ee97574339e2",
  "jobTitle": "Staff Backend Systems Engineer",
  "company": "Stripe",
  "location": "Remote",
  "status": "applied", // "applied" | "interviewing" | "offer" | "rejected" | "withdrawn"
  "tailoredBullets": [
    "Engineered high-throughput settlement pipelines with Express 5 and MongoDB Atlas"
  ]
}
```
* **Response (201 Created):** Returns created application card.

### 8.3 Get Single Application Details
* **Endpoint:** `GET /api/v1/applications/:id`
* **Auth:** `Bearer <accessToken>`
* **Response (200 OK):** Single application object with full stage history, timeline, and recruiter notes.

### 8.4 Update Application Status (Drag & Drop Column)
* **Endpoint:** `PATCH /api/v1/applications/:id/status`
* **Auth:** `Bearer <accessToken>`
* **Body:**
```json
{
  "status": "interviewing",
  "note": "HR screening cleared. Architectural round scheduled for Thursday." // Optional
}
```
* **Response (200 OK):** Updated application with appended timeline event.

### 8.5 Add Recruiter / Interview Note
* **Endpoint:** `POST /api/v1/applications/:id/notes`
* **Auth:** `Bearer <accessToken>`
* **Body:**
```json
{
  "content": "VP of Payments emphasized distributed locking patterns and idempotency keys."
}
```
* **Response (200 OK):** Updated application with appended note.

### 8.6 Delete Application Card
* **Endpoint:** `DELETE /api/v1/applications/:id`
* **Auth:** `Bearer <accessToken>`
* **Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "message": "Application deleted successfully"
  }
}
```

---

## 9. Skill Gap Analytics (`/skill-gaps`)

### 9.1 Get Candidate Skill Gap Breakdown
* **Endpoint:** `GET /api/v1/skill-gaps`
* **Auth:** `Bearer <accessToken>`
* **Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "userSkills": ["TypeScript", "Node.js", "Express", "MongoDB", "Redis"],
    "targetRoles": ["Staff Backend Systems Engineer"],
    "matchingSkills": ["TypeScript", "Node.js", "MongoDB", "Redis"],
    "missingSkills": [],
    "recommendedActions": [
      "Target high-visibility Staff-level distributed systems open source contributions."
    ]
  }
}
```

---

## 10. AI Mock Interview Coach (`/interview-prep`)

### 10.1 Generate Mock Interview Questions
* **Endpoint:** `POST /api/v1/interview-prep/generate`
* **Auth:** `Bearer <accessToken>`
* **Body:**
```json
{
  "jobTitle": "Staff Backend Systems Engineer",
  "company": "Stripe",
  "description": "Lead distributed payment transaction workflows and MongoDB scaling..."
}
```
* **Response (201 Created):**
```json
{
  "success": true,
  "data": {
    "_id": "6aba38f6f670ee97574339e4",
    "jobTitle": "Staff Backend Systems Engineer",
    "company": "Stripe",
    "questions": [
      {
        "id": "q1",
        "type": "technical",
        "question": "How do you handle race conditions or concurrent writes in a distributed MongoDB architecture?",
        "context": "Assesses backend concurrency control and database design capability."
      }
    ]
  }
}
```

### 10.2 List Mock Interview Sessions
* **Endpoint:** `GET /api/v1/interview-prep`
* **Auth:** `Bearer <accessToken>`
* **Response (200 OK):** Array of user's past interview preparation sessions.

### 10.3 Get Single Interview Prep Session
* **Endpoint:** `GET /api/v1/interview-prep/:id`
* **Auth:** `Bearer <accessToken>`
* **Response (200 OK):** Single interview prep session with all generated questions, submitted answers, and score evaluations.

### 10.4 Submit Answer for AI Evaluation
* **Endpoint:** `POST /api/v1/interview-prep/:id/evaluate`
* **Auth:** `Bearer <accessToken>`
* **Body:**
```json
{
  "questionId": "q1",
  "answer": "We enforce majority write concern (w: majority) and use optimistic concurrency control with document version keys..."
}
```
* **Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "evaluation": {
      "score": 88,
      "strengths": ["Strong rationale and distributed systems depth"],
      "improvements": ["Mention APM telemetry and metrics tracking"]
    },
    "questionId": "q1",
    "modelVersion": "claude-3-5-sonnet-20241022"
  }
}
```

---

## 11. Freelance Gigs Marketplace (`/freelance-gigs`)

### 11.1 List Open Freelance Gigs
* **Endpoint:** `GET /api/v1/freelance-gigs`
* **Auth:** None
* **Response (200 OK):** Array of freelance client postings.

### 11.2 Get Single Freelance Gig by ID
* **Endpoint:** `GET /api/v1/freelance-gigs/:id`
* **Auth:** None
* **Response (200 OK):** Single gig detail object with client scope, budget, and required skills.

### 11.3 Post Freelance Project
* **Endpoint:** `POST /api/v1/freelance-gigs`
* **Auth:** `Bearer <accessToken>`
* **Body:**
```json
{
  "title": "High-Throughput Webhook Ingestion Pipeline",
  "client": "FinTech Global Labs",
  "platform": "Upwork",
  "budget": "$5,500",
  "description": "Architect and implement an Express 5 and MongoDB Atlas processing pipeline...",
  "skills": ["TypeScript", "Node.js", "Express", "MongoDB", "Redis"]
}
```
* **Response (201 Created):** Returns created gig with initial status `"open"`.

### 11.4 Generate AI Proposal Pitch
* **Endpoint:** `POST /api/v1/freelance-gigs/:id/pitch`
* **Auth:** `Bearer <accessToken>`
* **Body:**
```json
{
  "tone": "persuasive" // "persuasive" | "technical" | "concise" (Optional, defaults to "persuasive")
}
```
* **Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "proposalDraft": "Dear Client,\n\nI reviewed your project requirements and would love to assist...",
    "modelVersion": "claude-3-5-sonnet-20241022"
  }
}
```

### 11.4 Update Freelance Gig Stage
* **Endpoint:** `PATCH /api/v1/freelance-gigs/:id/status`
* **Auth:** `Bearer <accessToken>`
* **Body:**
```json
{
  "status": "won" // "open" | "proposal_sent" | "in_discussion" | "won" | "completed" | "closed"
}
```
* **Response (200 OK):** Returns updated gig object.

---

## 12. Postman & OpenAPI Exports

The complete Postman suite containing all pre-configured endpoints, sample payloads, and auto-saving authorization test scripts is available locally in the repository:

- 📦 **Postman Collection:** [`backend/postman/collection.json`](file:///c:/Users/devsh/OneDrive/Desktop/JobWise/backend/postman/collection.json)
- 🌍 **Postman Environment:** [`backend/postman/environment.json`](file:///c:/Users/devsh/OneDrive/Desktop/JobWise/backend/postman/environment.json)
