---
name: jobwise-api-testing
description: >-
  Use this skill whenever the user asks to test, run, inspect, or execute the JobWise API endpoints
  via Postman, run the Postman collection, or verify backend API health and endpoint correctness.
---

# JobWise API Testing & Postman Execution Skill

This skill guides the execution, testing, and synchronization of the **JobWise API** using the **Postman MCP server** and local backend.

---

## 1. Quick Reference & Resource IDs

| Resource | Name | ID / UID |
|---|---|---|
| **Workspace** | `JobWise` | `eaf28298-57d9-4aa9-8ee3-2fc2e6a0d836` |
| **Collection** | `JobWise API - Complete Suite` | `58529204-fb876ec8-4c54-46e0-a8e0-f18657c588ee` |
| **Environment** | `JobWise Local Environment` | `58529204-5d32aac5-a8b7-4555-9d3c-020c460884f2` |
| **Local Files** | Backend Postman Directory | [`backend/postman/collection.json`](file:///c:/Users/devsh/OneDrive/Desktop/JobWise/backend/postman/collection.json) |

---

## 2. Automated Full Collection Execution Workflow

When the user asks to "run the tests", "test all endpoints", or "execute the Postman collection":

### Step 1: Confirm Backend is Running
Before triggering the runner, ensure the backend server is running on `http://localhost:5001`.
- Check health: `http://localhost:5001/health`
- If not running, start it:
  ```powershell
  cd backend
  npm run dev
  ```

### Step 2: Trigger Postman Runner via MCP
Call the `runCollection` tool on `postman-mcp-server`:
```json
{
  "ServerName": "postman-mcp-server",
  "ToolName": "runCollection",
  "Arguments": {
    "collectionId": "58529204-fb876ec8-4c54-46e0-a8e0-f18657c588ee",
    "environmentId": "58529204-5d32aac5-a8b7-4555-9d3c-020c460884f2"
  }
}
```

### Step 3: Interpret Results
- Check `Total requests` (should be 34)
- Check `Failed requests`
- Report any endpoint failure status codes and error payloads clearly to the user.

---

## 3. Testing Category-Specific Endpoints

The collection is organized into 9 distinct categories:

### 1. Health & Diagnostics
- `GET /health` — Liveness & uptime
- `GET /ready` — MongoDB readiness

### 2. Authentication
- `POST /api/v1/auth/register` — Creates user, auto-populates `{{accessToken}}` and `{{userId}}`
- `POST /api/v1/auth/login` — Issues token, sets refresh cookie
- `POST /api/v1/auth/refresh` — Rotates access token
- `POST /api/v1/auth/logout` — Revokes session

### 3. User Profile
- `GET /api/v1/users/me` — Requires Bearer token
- `PATCH /api/v1/users/me` — Updates `skills`, `targetRoles`, `targetLocations`
- `GET /api/v1/users/me/export` — GDPR full data dump
- `DELETE /api/v1/users/me` — Account termination

### 4. Resumes
- `POST /api/v1/resumes` — Uploads PDF/DOCX (multipart)
- `GET /api/v1/resumes` — Lists resumes (auto-saves `{{resumeId}}`)
- `GET /api/v1/resumes/:id` — Single resume details
- `DELETE /api/v1/resumes/:id` — Deletes resume

### 5. Jobs & Match Engine
- `GET /api/v1/jobs` — Ranked job feed (auto-saves `{{jobId}}`)
- `GET /api/v1/jobs/:id` — Single job details
- `POST /api/v1/jobs` — Creates job listing
- `POST /api/v1/jobs/:id/tailor` — AI-driven bullet customization

### 6. Application Tracker (Kanban)
- `GET /api/v1/applications` — Kanban view
- `POST /api/v1/applications` — Creates tracker entry (auto-saves `{{applicationId}}`)
- `PATCH /api/v1/applications/:id/status` — Moves Kanban column (`applied`, `interviewing`, `offer`, `rejected`)
- `POST /api/v1/applications/:id/notes` — Adds recruiter/interview notes
- `DELETE /api/v1/applications/:id` — Removes record

### 7. Skill Gap Analysis
- `GET /api/v1/skill-gaps` — Compares user skills to job requirements

### 8. AI Interview Preparation
- `POST /api/v1/interview-prep/generate` — Creates mock interview (auto-saves `{{prepSessionId}}`)
- `GET /api/v1/interview-prep` — Lists prep sessions
- `POST /api/v1/interview-prep/:id/evaluate` — AI evaluates candidate answer

### 9. Freelance Gigs
- `GET /api/v1/freelance-gigs` — Lists gigs (auto-saves `{{gigId}}`)
- `POST /api/v1/freelance-gigs` — Posts client project
- `POST /api/v1/freelance-gigs/:id/pitch` — AI proposal generator
- `PATCH /api/v1/freelance-gigs/:id` — Modifies budget/status

---

## 4. Manual Postman App Execution

If the user wants to test interactively inside their Postman desktop app:

1. Open Postman.
2. Select the **`JobWise`** workspace in the top-left menu.
3. In the top right, select the **`JobWise Local Environment`** from the environment dropdown.
4. Open the **`JobWise API - Complete Suite`** collection.
5. Execute **2. Authentication ➔ Login** or **Register** first. The test script will automatically populate `{{accessToken}}` across all subsequent requests.
