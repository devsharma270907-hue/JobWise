# Rule: Continuous API Documentation Synchronization

## Purpose
Ensure that [`API_DOCUMENTATION.md`](file:///c:/Users/devsh/OneDrive/Desktop/JobWise/API_DOCUMENTATION.md) and [`backend/postman/collection.json`](file:///c:/Users/devsh/OneDrive/Desktop/JobWise/backend/postman/collection.json) always reflect the true, current state of all backend API endpoints and schemas.

---

## Trigger Conditions
This rule triggers whenever any of the following files or components are created, modified, or removed:
- Route definitions (`backend/src/modules/**/*.routes.ts`, `backend/src/app.ts`)
- Controller methods (`backend/src/modules/**/*.controller.ts`)
- Validation schemas (`backend/src/modules/**/*.schema.ts`, `backend/src/middleware/validate.ts`)
- Data models (`backend/src/modules/**/*.model.ts`)
- Authentication / Authorization middleware (`backend/src/middleware/auth.ts`)
- Response handlers or error handlers (`backend/src/middleware/errorHandler.ts`)

---

## Mandatory Requirements

Whenever making changes to any backend API endpoint or route:

1. **Update [`API_DOCUMENTATION.md`](file:///c:/Users/devsh/OneDrive/Desktop/JobWise/API_DOCUMENTATION.md):**
   - **Method & Path:** Document the exact HTTP verb and path.
   - **Authentication:** Clearly mark whether Bearer token or cookie is required.
   - **Request Schema:** Document all query parameters, URL path parameters, and request body fields (including types, constraints, and default values).
   - **Status Codes & Scenarios:** Explicitly document all possible HTTP status codes:
     - `200` / `201`: Success scenario with exact response JSON shape.
     - `400`: Validation failure scenarios (e.g. invalid fields, regex failure, malformed JSON).
     - `401`: Missing or expired authentication.
     - `403`: Ownership check or permission failure.
     - `404`: Entity not found scenarios.
     - `409`: Duplicate key / conflict scenarios.
   - **Business Logic Lifecycles:** If an entity status changes (e.g., Application Kanban, Gig lifecycle), document the valid transitions.

2. **Sync Postman Collection:**
   - Update [`backend/postman/collection.json`](file:///c:/Users/devsh/OneDrive/Desktop/JobWise/backend/postman/collection.json) with the new/updated endpoint, headers, and sample body.
   - If using the Postman MCP server, ensure collection changes are synchronized so `jobwise-api-testing` skill can execute test runs accurately.

3. **No Drift Policy:**
   - Do NOT complete any API task without updating documentation in the same turn or step. Code and documentation must never drift apart.
