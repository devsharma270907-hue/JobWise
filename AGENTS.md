# JobWise Project - Agent Guidelines & Rules

## 1. Continuous API Documentation Rule (MANDATORY)

Whenever ANY change, addition, modification, or removal is made to backend APIs or endpoints:
1. **Immediately update [`API_DOCUMENTATION.md`](./API_DOCUMENTATION.md):**
   - Keep the endpoint catalog up-to-date with exact HTTP verbs, paths, headers, and request schemas.
   - Document all HTTP status codes (`200`, `201`, `400`, `401`, `403`, `404`, `409`, `429`, `500`) with concrete response scenarios and error payloads.
   - Detail multi-scenario lifecycle state machines (e.g. Application stages: `saved` -> `applied` -> `interviewing` -> `offer` -> `rejected`/`withdrawn`).
2. **Synchronize Postman Suite:**
   - Keep [`backend/postman/collection.json`](./backend/postman/collection.json) and [`backend/postman/environment.json`](./backend/postman/environment.json) synchronized with working sample payloads and auto-saving test scripts.
   - Run or verify tests with the `jobwise-api-testing` skill whenever endpoints change.
3. **Zero Documentation Drift:**
   - An API change is considered incomplete until both code and documentation match.

---

## 2. Core Architectural & Backend Standards

- **Express 5 Compatibility:** `req.query` is getter-only. Never assign directly to `req.query = ...`; always use safe descriptor assignment or the prototype patch in `src/app.ts`.
- **Database Connection:** Use the DNS-over-HTTPS (DoH) resolver in `src/config/db.ts` to avoid Windows/ISP c-ares `EBADRESP` drops when connecting to MongoDB Atlas.
- **Database Casing:** The MongoDB Atlas database name MUST always be `JobWise` (exact CamelCase).
- **Zod Schema Validation:** All incoming requests (`req.body`, `req.query`, `req.params`) must pass through Zod validation in `src/middleware/validate.ts`.
- **Structured Logging:** Preserve Winston symbol keys (`Symbol(level)`) when sanitizing logs so Winston's `colorize()` does not crash.
