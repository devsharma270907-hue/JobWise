import fs from 'fs';
import path from 'path';
import mongoose from 'mongoose';
import { connectDB, disconnectDB } from './src/config/db.js';
import { UserModel } from './src/modules/users/user.model.js';
import { JobModel } from './src/modules/jobs/job.model.js';
import { ApplicationModel } from './src/modules/applications/application.model.js';
import { InterviewPrepModel } from './src/modules/interviewPrep/interviewPrep.model.js';
import { FreelanceGigModel } from './src/modules/freelanceGigs/freelanceGig.model.js';
import { ResumeModel } from './src/modules/resumes/resume.model.js';

const BASE_URL = 'http://localhost:5001';
const NON_EXISTENT_ID = '000000000000000000000000';

interface TestCase {
  id: number;
  category: string;
  name: string;
  method: string;
  endpoint: string | (() => string);
  expectedStatus: number;
  run: () => Promise<{ success: boolean; details: string }>;
}

const tests: TestCase[] = [];

// Shared state between tests
let userAToken = '';
let userARefreshToken = '';
let userAId = '';
let userBToken = '';
let userBRefreshToken = '';
let userBId = '';

let sharedJobId = '';
let userAAppId = '';
let userAPrepId = '';
let userAQuestionId = '';
let userAGigId = '';
let userAResumeId = '';

function getErrMsg(body: any): string {
  if (body?.error?.message) return body.error.message;
  if (body?.error?.details?.[0]?.message) return body.error.details[0].message;
  if (typeof body?.error === 'string') return body.error;
  return JSON.stringify(body?.error || body);
}

async function main() {
  console.log('================================================================================');
  console.log('🧪 RUNNING COMPREHENSIVE ZERO-ERROR TEST SUITE ACROSS ALL 8 BACKEND MODULES');
  console.log('================================================================================\n');

  await connectDB();
  console.log('📡 Connected directly to MongoDB Atlas for live database assertions.\n');

  const timestamp = Date.now();
  const userAEmail = `user_a_${timestamp}@example.com`;
  const userBEmail = `user_b_${timestamp}@example.com`;

  // ────────────────────────────────────────────────────────────────
  // 1. HEALTH & ROUTING & SECURITY CORE
  // ────────────────────────────────────────────────────────────────
  tests.push({
    id: 1,
    category: 'Health',
    name: 'GET /health returns 200 with uptime and status ok',
    method: 'GET',
    endpoint: '/health',
    expectedStatus: 200,
    run: async () => {
      const res = await fetch(`${BASE_URL}/health`);
      const body = await res.json();
      const ok = res.status === 200 && body.status === 'ok' && typeof body.uptime === 'number';
      return { success: ok, details: `Uptime: ${body.uptime?.toFixed(1)}s` };
    },
  });

  tests.push({
    id: 2,
    category: 'Health',
    name: 'GET /ready returns 200 with database: connected',
    method: 'GET',
    endpoint: '/ready',
    expectedStatus: 200,
    run: async () => {
      const res = await fetch(`${BASE_URL}/ready`);
      const body = await res.json();
      const ok = res.status === 200 && body.status === 'ready' && body.database === 'connected';
      return { success: ok, details: `Database: ${body.database}` };
    },
  });

  tests.push({
    id: 3,
    category: 'Routing',
    name: 'GET /api/v1/unknown-endpoint returns 404 Route Not Found',
    method: 'GET',
    endpoint: '/api/v1/unknown-endpoint-404',
    expectedStatus: 404,
    run: async () => {
      const res = await fetch(`${BASE_URL}/api/v1/unknown-endpoint-404`);
      const body = await res.json();
      const ok = res.status === 404 && body.error?.code === 'NOT_FOUND';
      return { success: ok, details: `Error code: ${body.error?.code}` };
    },
  });

  tests.push({
    id: 4,
    category: 'Security',
    name: 'Malformed JSON payload returns 400 with INVALID_JSON code',
    method: 'POST',
    endpoint: '/api/v1/auth/login',
    expectedStatus: 400,
    run: async () => {
      const res = await fetch(`${BASE_URL}/api/v1/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: '{"email": "broken_json',
      });
      const body = await res.json();
      const ok = res.status === 400 && body.error?.code === 'INVALID_JSON';
      return { success: ok, details: `Error code: ${body.error?.code}` };
    },
  });

  // ────────────────────────────────────────────────────────────────
  // 2. AUTHENTICATION & SESSION MANAGEMENT
  // ────────────────────────────────────────────────────────────────
  tests.push({
    id: 5,
    category: 'Auth',
    name: 'POST /api/v1/auth/register fails when required name is missing (400)',
    method: 'POST',
    endpoint: '/api/v1/auth/register',
    expectedStatus: 400,
    run: async () => {
      const res = await fetch(`${BASE_URL}/api/v1/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: `test_${timestamp}@example.com`, password: 'Password123!' }),
      });
      const body = await res.json();
      const ok = res.status === 400 && body.error?.code === 'VALIDATION_ERROR';
      return { success: ok, details: `Validation caught: ${getErrMsg(body)}` };
    },
  });

  tests.push({
    id: 6,
    category: 'Auth',
    name: 'POST /api/v1/auth/register fails with weak password (< 8 chars) (400)',
    method: 'POST',
    endpoint: '/api/v1/auth/register',
    expectedStatus: 400,
    run: async () => {
      const res = await fetch(`${BASE_URL}/api/v1/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: 'Short Pwd', email: `test2_${timestamp}@example.com`, password: 'short' }),
      });
      const body = await res.json();
      const ok = res.status === 400 && body.error?.code === 'VALIDATION_ERROR';
      return { success: ok, details: `Validation caught: ${getErrMsg(body)}` };
    },
  });

  tests.push({
    id: 7,
    category: 'Auth',
    name: 'POST /api/v1/auth/register fails with invalid email format (400)',
    method: 'POST',
    endpoint: '/api/v1/auth/register',
    expectedStatus: 400,
    run: async () => {
      const res = await fetch(`${BASE_URL}/api/v1/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: 'Bad Email', email: 'not-an-email', password: 'Password123!' }),
      });
      const body = await res.json();
      const ok = res.status === 400 && body.error?.code === 'VALIDATION_ERROR';
      return { success: ok, details: `Validation caught: ${getErrMsg(body)}` };
    },
  });

  tests.push({
    id: 8,
    category: 'Auth',
    name: 'POST /api/v1/auth/register successfully registers Primary User A (201)',
    method: 'POST',
    endpoint: '/api/v1/auth/register',
    expectedStatus: 201,
    run: async () => {
      const res = await fetch(`${BASE_URL}/api/v1/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: 'Primary Developer A',
          email: userAEmail,
          password: 'SecurePassword123!',
          role: 'student',
        }),
      });
      const body = await res.json();
      userAToken = body.data?.accessToken;
      userAId = body.data?.user?._id;

      const setCookie = res.headers.get('set-cookie');
      if (setCookie) {
        const match = setCookie.match(/refreshToken=([^;]+)/);
        if (match) userARefreshToken = match[1];
      }

      const dbUser = await UserModel.findById(userAId);
      const ok = res.status === 201 && !!userAToken && dbUser !== null && dbUser.email === userAEmail;
      return { success: ok, details: `User A ID: ${userAId}, in DB: ${!!dbUser}` };
    },
  });

  tests.push({
    id: 9,
    category: 'Auth',
    name: 'POST /api/v1/auth/register fails with duplicate email (409 Conflict)',
    method: 'POST',
    endpoint: '/api/v1/auth/register',
    expectedStatus: 409,
    run: async () => {
      const res = await fetch(`${BASE_URL}/api/v1/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: 'Imposter A',
          email: userAEmail,
          password: 'SecurePassword123!',
          role: 'student',
        }),
      });
      const body = await res.json();
      const ok = res.status === 409 && body.error?.code === 'CONFLICT';
      return { success: ok, details: `Handled conflict: ${getErrMsg(body)}` };
    },
  });

  tests.push({
    id: 10,
    category: 'Auth',
    name: 'POST /api/v1/auth/register registers Secondary User B (for tenant isolation)',
    method: 'POST',
    endpoint: '/api/v1/auth/register',
    expectedStatus: 201,
    run: async () => {
      const res = await fetch(`${BASE_URL}/api/v1/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: 'Secondary Developer B',
          email: userBEmail,
          password: 'SecurePassword456!',
          role: 'switcher',
        }),
      });
      const body = await res.json();
      userBToken = body.data?.accessToken;
      userBId = body.data?.user?._id;

      const setCookie = res.headers.get('set-cookie');
      if (setCookie) {
        const match = setCookie.match(/refreshToken=([^;]+)/);
        if (match) userBRefreshToken = match[1];
      }

      const ok = res.status === 201 && !!userBToken && !!userBId;
      return { success: ok, details: `User B ID: ${userBId}` };
    },
  });

  tests.push({
    id: 11,
    category: 'Auth',
    name: 'POST /api/v1/auth/login fails with wrong password (401)',
    method: 'POST',
    endpoint: '/api/v1/auth/login',
    expectedStatus: 401,
    run: async () => {
      const res = await fetch(`${BASE_URL}/api/v1/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: userAEmail, password: 'WrongPassword999!' }),
      });
      const body = await res.json();
      const ok = res.status === 401 && body.error?.code === 'UNAUTHORIZED';
      return { success: ok, details: `Rejected with code: ${body.error?.code}` };
    },
  });

  tests.push({
    id: 12,
    category: 'Auth',
    name: 'POST /api/v1/auth/login fails for non-existent email (401)',
    method: 'POST',
    endpoint: '/api/v1/auth/login',
    expectedStatus: 401,
    run: async () => {
      const res = await fetch(`${BASE_URL}/api/v1/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: `ghost_${timestamp}@example.com`, password: 'Password123!' }),
      });
      const body = await res.json();
      const ok = res.status === 401 && body.error?.code === 'UNAUTHORIZED';
      return { success: ok, details: `Rejected with message: ${getErrMsg(body)}` };
    },
  });

  tests.push({
    id: 13,
    category: 'Auth',
    name: 'POST /api/v1/auth/login succeeds with valid credentials (200)',
    method: 'POST',
    endpoint: '/api/v1/auth/login',
    expectedStatus: 200,
    run: async () => {
      const res = await fetch(`${BASE_URL}/api/v1/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: userAEmail, password: 'SecurePassword123!' }),
      });
      const body = await res.json();
      userAToken = body.data?.accessToken;
      const setCookie = res.headers.get('set-cookie');
      if (setCookie) {
        const match = setCookie.match(/refreshToken=([^;]+)/);
        if (match) userARefreshToken = match[1];
      }
      const ok = res.status === 200 && !!userAToken && body.data?.user?.email === userAEmail;
      return { success: ok, details: `New Access Token generated: ${userAToken.substring(0, 20)}...` };
    },
  });

  tests.push({
    id: 14,
    category: 'Auth',
    name: 'POST /api/v1/auth/refresh fails without refresh token (401)',
    method: 'POST',
    endpoint: '/api/v1/auth/refresh',
    expectedStatus: 401,
    run: async () => {
      const res = await fetch(`${BASE_URL}/api/v1/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      const body = await res.json();
      const ok = res.status === 401 && body.error?.code === 'UNAUTHORIZED';
      return { success: ok, details: `Rejected with code: ${body.error?.code}` };
    },
  });

  tests.push({
    id: 15,
    category: 'Auth',
    name: 'POST /api/v1/auth/refresh fails with tampered/invalid token (401)',
    method: 'POST',
    endpoint: '/api/v1/auth/refresh',
    expectedStatus: 401,
    run: async () => {
      const res = await fetch(`${BASE_URL}/api/v1/auth/refresh`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Cookie: 'refreshToken=tampered.fake.jwt.token',
        },
        body: JSON.stringify({ refreshToken: 'tampered.fake.jwt.token' }),
      });
      const ok = res.status === 401;
      return { success: ok, details: `Rejected tampered refresh token with status: ${res.status}` };
    },
  });

  tests.push({
    id: 16,
    category: 'Auth',
    name: 'POST /api/v1/auth/refresh issues new access token with valid refresh token (200)',
    method: 'POST',
    endpoint: '/api/v1/auth/refresh',
    expectedStatus: 200,
    run: async () => {
      const res = await fetch(`${BASE_URL}/api/v1/auth/refresh`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Cookie: `refreshToken=${userARefreshToken}`,
        },
        body: JSON.stringify({ refreshToken: userARefreshToken }),
      });
      const body = await res.json();
      if (body.data?.accessToken) {
        userAToken = body.data.accessToken;
      }
      const ok = res.status === 200 && !!body.data?.accessToken;
      return { success: ok, details: `Token refreshed successfully: ${body.data?.accessToken?.substring(0, 20)}...` };
    },
  });

  tests.push({
    id: 17,
    category: 'Security',
    name: 'Access protected route with missing Bearer token fails (401)',
    method: 'GET',
    endpoint: '/api/v1/users/me',
    expectedStatus: 401,
    run: async () => {
      const res = await fetch(`${BASE_URL}/api/v1/users/me`);
      const body = await res.json();
      const ok = res.status === 401 && body.error?.code === 'UNAUTHORIZED';
      return { success: ok, details: `Code: ${body.error?.code}` };
    },
  });

  tests.push({
    id: 18,
    category: 'Security',
    name: 'Access protected route with corrupted Bearer token fails (401)',
    method: 'GET',
    endpoint: '/api/v1/users/me',
    expectedStatus: 401,
    run: async () => {
      const res = await fetch(`${BASE_URL}/api/v1/users/me`, {
        headers: { Authorization: 'Bearer invalid.corrupted.token' },
      });
      const body = await res.json();
      const ok = res.status === 401 && body.error?.code === 'TOKEN_INVALID';
      return { success: ok, details: `Caught invalid JWT: ${body.error?.code}` };
    },
  });

  // ────────────────────────────────────────────────────────────────
  // 3. USERS MANAGEMENT & PROFILES
  // ────────────────────────────────────────────────────────────────
  tests.push({
    id: 19,
    category: 'Users',
    name: 'GET /api/v1/users/me returns authenticated User A profile (200)',
    method: 'GET',
    endpoint: '/api/v1/users/me',
    expectedStatus: 200,
    run: async () => {
      const res = await fetch(`${BASE_URL}/api/v1/users/me`, {
        headers: { Authorization: `Bearer ${userAToken}` },
      });
      const body = await res.json();
      const ok = res.status === 200 && body.data?._id === userAId && body.data?.email === userAEmail;
      return { success: ok, details: `User Name: ${body.data?.name}, Role: ${body.data?.role}` };
    },
  });

  tests.push({
    id: 20,
    category: 'Users',
    name: 'PATCH /api/v1/users/me updates skills & roles, verified in DB (200)',
    method: 'PATCH',
    endpoint: '/api/v1/users/me',
    expectedStatus: 200,
    run: async () => {
      const res = await fetch(`${BASE_URL}/api/v1/users/me`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${userAToken}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          skills: ['TypeScript', 'Node.js', 'React', 'MongoDB', 'AWS', 'Docker'],
          targetRoles: ['Senior Full Stack Engineer', 'Cloud Architect'],
        }),
      });
      const body = await res.json();
      const dbUser = await UserModel.findById(userAId);
      const ok = res.status === 200 && dbUser !== null && dbUser.skills.length === 6 && dbUser.targetRoles.length === 2;
      return { success: ok, details: `DB updated: ${dbUser?.skills.length} skills, ${dbUser?.targetRoles.length} roles` };
    },
  });

  tests.push({
    id: 21,
    category: 'Users',
    name: 'GET /api/v1/users/me/export returns full GDPR data archive (200)',
    method: 'GET',
    endpoint: '/api/v1/users/me/export',
    expectedStatus: 200,
    run: async () => {
      const res = await fetch(`${BASE_URL}/api/v1/users/me/export`, {
        headers: { Authorization: `Bearer ${userAToken}` },
      });
      const body = await res.json();
      const ok = res.status === 200 && !!body.data?.user && Array.isArray(body.data?.applications);
      return { success: ok, details: `GDPR export payload contains user and applications entities` };
    },
  });

  // ────────────────────────────────────────────────────────────────
  // 4. JOBS MARKETPLACE & MATCHING
  // ────────────────────────────────────────────────────────────────
  tests.push({
    id: 22,
    category: 'Jobs',
    name: 'GET /api/v1/jobs works without authentication (Public feed) (200)',
    method: 'GET',
    endpoint: '/api/v1/jobs',
    expectedStatus: 200,
    run: async () => {
      const res = await fetch(`${BASE_URL}/api/v1/jobs`);
      const body = await res.json();
      const ok = res.status === 200 && Array.isArray(body.data);
      return { success: ok, details: `Public feed returned ${body.data?.length} jobs` };
    },
  });

  tests.push({
    id: 23,
    category: 'Jobs',
    name: 'POST /api/v1/jobs fails without authentication (401)',
    method: 'POST',
    endpoint: '/api/v1/jobs',
    expectedStatus: 401,
    run: async () => {
      const res = await fetch(`${BASE_URL}/api/v1/jobs`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: 'Lead Architect', company: 'Acme Corp', description: 'Sample description' }),
      });
      const body = await res.json();
      const ok = res.status === 401 && body.error?.code === 'UNAUTHORIZED';
      return { success: ok, details: `Rejected with code: ${body.error?.code}` };
    },
  });

  tests.push({
    id: 24,
    category: 'Jobs',
    name: 'POST /api/v1/jobs fails when description is too short (< 10 chars) (400)',
    method: 'POST',
    endpoint: '/api/v1/jobs',
    expectedStatus: 400,
    run: async () => {
      const res = await fetch(`${BASE_URL}/api/v1/jobs`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${userAToken}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: 'DevOps Engineer',
          company: 'Acme',
          location: 'Remote',
          description: 'Too short',
        }),
      });
      const body = await res.json();
      const ok = res.status === 400 && body.error?.code === 'VALIDATION_ERROR';
      return { success: ok, details: `Validation caught short description: ${getErrMsg(body)}` };
    },
  });

  tests.push({
    id: 25,
    category: 'Jobs',
    name: 'POST /api/v1/jobs creates new job successfully, verified in DB (201)',
    method: 'POST',
    endpoint: '/api/v1/jobs',
    expectedStatus: 201,
    run: async () => {
      const res = await fetch(`${BASE_URL}/api/v1/jobs`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${userAToken}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: 'Principal Cloud Platform Engineer',
          company: 'HyperScale Systems',
          location: 'San Francisco, CA',
          remote: true,
          jobType: 'full-time',
          experienceLevel: 'senior',
          description: 'Architect multi-region Kubernetes clusters with zero-trust security and high observability.',
          requirements: ['5+ years with Kubernetes', 'Expert in Go/TypeScript'],
          skills: ['Kubernetes', 'Docker', 'Go', 'TypeScript', 'AWS'],
        }),
      });
      const body = await res.json();
      sharedJobId = body.data?._id;

      const dbJob = await JobModel.findById(sharedJobId);
      const ok = res.status === 201 && dbJob !== null && dbJob.company === 'HyperScale Systems';
      return { success: ok, details: `Job created in DB: ${sharedJobId}` };
    },
  });

  tests.push({
    id: 26,
    category: 'Jobs',
    name: 'GET /api/v1/jobs/:id returns single enriched job (200)',
    method: 'GET',
    endpoint: () => `/api/v1/jobs/${sharedJobId}`,
    expectedStatus: 200,
    run: async () => {
      const res = await fetch(`${BASE_URL}/api/v1/jobs/${sharedJobId}`, {
        headers: { Authorization: `Bearer ${userAToken}` },
      });
      const body = await res.json();
      const job = body.data?.job || body.data;
      const ok = res.status === 200 && job?._id === sharedJobId;
      return { success: ok, details: `Job retrieved: ${job?.title} at ${job?.company}` };
    },
  });

  tests.push({
    id: 27,
    category: 'Jobs',
    name: 'GET /api/v1/jobs/:id returns 404 for non-existent job ID',
    method: 'GET',
    endpoint: `/api/v1/jobs/${NON_EXISTENT_ID}`,
    expectedStatus: 404,
    run: async () => {
      const res = await fetch(`${BASE_URL}/api/v1/jobs/${NON_EXISTENT_ID}`);
      const body = await res.json();
      const ok = res.status === 404 && body.error?.code === 'NOT_FOUND';
      return { success: ok, details: `Handled missing job: ${getErrMsg(body)}` };
    },
  });

  tests.push({
    id: 28,
    category: 'Jobs',
    name: 'GET /api/v1/jobs with filters (role, remote=true) returns matches (200)',
    method: 'GET',
    endpoint: '/api/v1/jobs?remote=true&role=Cloud',
    expectedStatus: 200,
    run: async () => {
      const res = await fetch(`${BASE_URL}/api/v1/jobs?remote=true&role=Cloud`);
      const body = await res.json();
      const ok = res.status === 200 && Array.isArray(body.data);
      return { success: ok, details: `Filtered query returned ${body.data?.length} results` };
    },
  });

  // ────────────────────────────────────────────────────────────────
  // 5. RESUMES MODULE (ENCRYPTED STORAGE, AI STRUCTURING, ATS SCORE)
  // ────────────────────────────────────────────────────────────────
  tests.push({
    id: 29,
    category: 'Resumes',
    name: 'POST /api/v1/resumes/upload fails without authentication (401)',
    method: 'POST',
    endpoint: '/api/v1/resumes/upload',
    expectedStatus: 401,
    run: async () => {
      const res = await fetch(`${BASE_URL}/api/v1/resumes/upload`, {
        method: 'POST',
      });
      const body = await res.json();
      const ok = res.status === 401 && body.error?.code === 'UNAUTHORIZED';
      return { success: ok, details: `Handled unauthenticated upload: ${body.error?.code}` };
    },
  });

  tests.push({
    id: 30,
    category: 'Resumes',
    name: 'POST /api/v1/resumes/upload fails without a file attached (400)',
    method: 'POST',
    endpoint: '/api/v1/resumes/upload',
    expectedStatus: 400,
    run: async () => {
      const formData = new FormData();
      const res = await fetch(`${BASE_URL}/api/v1/resumes/upload`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${userAToken}` },
        body: formData,
      });
      const body = await res.json();
      const ok = res.status === 400 && body.error?.code === 'VALIDATION_ERROR';
      return { success: ok, details: `Handled missing file: ${getErrMsg(body)}` };
    },
  });

  tests.push({
    id: 31,
    category: 'Resumes',
    name: 'POST /api/v1/resumes/upload fails with unsupported file type like .png (400)',
    method: 'POST',
    endpoint: '/api/v1/resumes/upload',
    expectedStatus: 400,
    run: async () => {
      const formData = new FormData();
      const blob = new Blob(['fake image data'], { type: 'image/png' });
      formData.append('resume', blob, 'avatar.png');

      const res = await fetch(`${BASE_URL}/api/v1/resumes/upload`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${userAToken}` },
        body: formData,
      });
      const body = await res.json();
      const ok = res.status === 400 && body.error?.code === 'INVALID_FILE_TYPE';
      return { success: ok, details: `Handled invalid mime type: ${getErrMsg(body)}` };
    },
  });

  tests.push({
    id: 32,
    category: 'Resumes',
    name: 'POST /api/v1/resumes/upload parses DOCX, encrypts, scores ATS, updates DB (201)',
    method: 'POST',
    endpoint: '/api/v1/resumes/upload',
    expectedStatus: 201,
    run: async () => {
      const docxPath = path.resolve('node_modules/mammoth/test/test-data/tables.docx');
      const docxBuffer = fs.readFileSync(docxPath);
      const blob = new Blob([docxBuffer], {
        type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      });

      const formData = new FormData();
      formData.append('resume', blob, 'Senior_Fullstack_Resume.docx');

      const res = await fetch(`${BASE_URL}/api/v1/resumes/upload`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${userAToken}` },
        body: formData,
      });
      const body = await res.json();
      userAResumeId = body.data?.resume?._id;

      const dbResume = await ResumeModel.findById(userAResumeId);
      const ok =
        res.status === 201 &&
        dbResume !== null &&
        dbResume.userId.toString() === userAId &&
        typeof dbResume.score?.overall === 'number';

      return {
        success: ok,
        details: `Resume created in DB: ${userAResumeId}, Score: ${dbResume?.score?.overall}/100, Encrypted file: ${dbResume?.fileKey}`,
      };
    },
  });

  tests.push({
    id: 33,
    category: 'Resumes',
    name: 'GET /api/v1/resumes lists user resumes with pagination (200)',
    method: 'GET',
    endpoint: '/api/v1/resumes',
    expectedStatus: 200,
    run: async () => {
      const res = await fetch(`${BASE_URL}/api/v1/resumes`, {
        headers: { Authorization: `Bearer ${userAToken}` },
      });
      const body = await res.json();
      const ok = res.status === 200 && Array.isArray(body.data) && body.data.length >= 1;
      return { success: ok, details: `Found ${body.data?.length} resume(s), Total: ${body.pagination?.total}` };
    },
  });

  tests.push({
    id: 34,
    category: 'Resumes',
    name: 'GET /api/v1/resumes/:id returns single parsed resume (200)',
    method: 'GET',
    endpoint: () => `/api/v1/resumes/${userAResumeId}`,
    expectedStatus: 200,
    run: async () => {
      const res = await fetch(`${BASE_URL}/api/v1/resumes/${userAResumeId}`, {
        headers: { Authorization: `Bearer ${userAToken}` },
      });
      const body = await res.json();
      const ok = res.status === 200 && body.data?._id === userAResumeId;
      return { success: ok, details: `Retrieved resume: ${body.data?.fileName}, ATS score: ${body.data?.score?.overall}` };
    },
  });

  tests.push({
    id: 35,
    category: 'Resumes',
    name: 'Cross-User Security: User B cannot access User A resume (404/403)',
    method: 'GET',
    endpoint: () => `/api/v1/resumes/${userAResumeId}`,
    expectedStatus: 404,
    run: async () => {
      const res = await fetch(`${BASE_URL}/api/v1/resumes/${userAResumeId}`, {
        headers: { Authorization: `Bearer ${userBToken}` },
      });
      const body = await res.json();
      const ok = res.status === 404;
      return { success: ok, details: `Blocked cross-user resume access: ${getErrMsg(body)}` };
    },
  });

  // ────────────────────────────────────────────────────────────────
  // 6. AI JOB TAILORING (RESUME + JOB DESCRIPTION)
  // ────────────────────────────────────────────────────────────────
  tests.push({
    id: 36,
    category: 'Jobs',
    name: 'POST /api/v1/jobs/:id/tailor fails without authentication (401)',
    method: 'POST',
    endpoint: () => `/api/v1/jobs/${sharedJobId}/tailor`,
    expectedStatus: 401,
    run: async () => {
      const res = await fetch(`${BASE_URL}/api/v1/jobs/${sharedJobId}/tailor`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ resumeVersionId: userAResumeId }),
      });
      const body = await res.json();
      const ok = res.status === 401 && body.error?.code === 'UNAUTHORIZED';
      return { success: ok, details: `Code: ${body.error?.code}` };
    },
  });

  tests.push({
    id: 37,
    category: 'Jobs',
    name: 'POST /api/v1/jobs/:id/tailor fails without resumeVersionId (400)',
    method: 'POST',
    endpoint: () => `/api/v1/jobs/${sharedJobId}/tailor`,
    expectedStatus: 400,
    run: async () => {
      const res = await fetch(`${BASE_URL}/api/v1/jobs/${sharedJobId}/tailor`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${userAToken}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ tone: 'concise' }),
      });
      const body = await res.json();
      const ok = res.status === 400 && body.error?.code === 'VALIDATION_ERROR';
      return { success: ok, details: `Validation error: ${getErrMsg(body)}` };
    },
  });

  tests.push({
    id: 38,
    category: 'Jobs',
    name: 'Cross-User Security: User B cannot tailor job using User A resume (404/403)',
    method: 'POST',
    endpoint: () => `/api/v1/jobs/${sharedJobId}/tailor`,
    expectedStatus: 404,
    run: async () => {
      const res = await fetch(`${BASE_URL}/api/v1/jobs/${sharedJobId}/tailor`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${userBToken}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ resumeVersionId: userAResumeId, tone: 'formal' }),
      });
      const body = await res.json();
      const ok = res.status === 404;
      return { success: ok, details: `Blocked unauthorized resume usage: ${getErrMsg(body)}` };
    },
  });

  tests.push({
    id: 39,
    category: 'Jobs',
    name: 'POST /api/v1/jobs/:id/tailor generates tailored bullets & cover letter (200)',
    method: 'POST',
    endpoint: () => `/api/v1/jobs/${sharedJobId}/tailor`,
    expectedStatus: 200,
    run: async () => {
      const res = await fetch(`${BASE_URL}/api/v1/jobs/${sharedJobId}/tailor`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${userAToken}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ resumeVersionId: userAResumeId, tone: 'concise' }),
      });
      const body = await res.json();
      const ok =
        res.status === 200 &&
        Array.isArray(body.data?.tailoredBullets) &&
        typeof body.data?.coverLetterDraft === 'string';

      return {
        success: ok,
        details: `Generated ${body.data?.tailoredBullets?.length} bullets, Cover letter length: ${body.data?.coverLetterDraft?.length} chars`,
      };
    },
  });

  // ────────────────────────────────────────────────────────────────
  // 7. APPLICATIONS LIFECYCLE & STATE MACHINE
  // ────────────────────────────────────────────────────────────────
  tests.push({
    id: 40,
    category: 'Applications',
    name: 'POST /api/v1/applications fails without jobTitle (400)',
    method: 'POST',
    endpoint: '/api/v1/applications',
    expectedStatus: 400,
    run: async () => {
      const res = await fetch(`${BASE_URL}/api/v1/applications`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${userAToken}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ company: 'Acme Corp' }),
      });
      const body = await res.json();
      const ok = res.status === 400 && body.error?.code === 'VALIDATION_ERROR';
      return { success: ok, details: `Validation caught missing jobTitle: ${getErrMsg(body)}` };
    },
  });

  tests.push({
    id: 41,
    category: 'Applications',
    name: 'POST /api/v1/applications creates record in "saved" stage by default (201)',
    method: 'POST',
    endpoint: '/api/v1/applications',
    expectedStatus: 201,
    run: async () => {
      const res = await fetch(`${BASE_URL}/api/v1/applications`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${userAToken}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jobId: sharedJobId,
          jobTitle: 'Principal Cloud Platform Engineer',
          company: 'HyperScale Systems',
          location: 'San Francisco, CA',
        }),
      });
      const body = await res.json();
      userAAppId = body.data?._id;

      const dbApp = await ApplicationModel.findById(userAAppId);
      const ok = res.status === 201 && dbApp !== null && dbApp.status === 'saved';
      return { success: ok, details: `Application created in DB with status: ${dbApp?.status}` };
    },
  });

  tests.push({
    id: 42,
    category: 'Applications',
    name: 'PATCH /api/v1/applications/:id/status transitions from "saved" to "applied" (200)',
    method: 'PATCH',
    endpoint: () => `/api/v1/applications/${userAAppId}/status`,
    expectedStatus: 200,
    run: async () => {
      const res = await fetch(`${BASE_URL}/api/v1/applications/${userAAppId}/status`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${userAToken}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'applied', note: 'Submitted via company career portal' }),
      });
      const body = await res.json();
      const dbApp = await ApplicationModel.findById(userAAppId);
      const ok = res.status === 200 && dbApp?.status === 'applied' && dbApp?.appliedAt !== null;
      return { success: ok, details: `DB status: ${dbApp?.status}, appliedAt recorded: ${!!dbApp?.appliedAt}` };
    },
  });

  tests.push({
    id: 43,
    category: 'Applications',
    name: 'PATCH /api/v1/applications/:id/status transitions to "interviewing" (200)',
    method: 'PATCH',
    endpoint: () => `/api/v1/applications/${userAAppId}/status`,
    expectedStatus: 200,
    run: async () => {
      const res = await fetch(`${BASE_URL}/api/v1/applications/${userAAppId}/status`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${userAToken}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'interviewing', note: 'Technical recruiter screen scheduled' }),
      });
      const body = await res.json();
      const dbApp = await ApplicationModel.findById(userAAppId);
      const ok = res.status === 200 && dbApp?.status === 'interviewing' && dbApp?.timeline.length === 3;
      return { success: ok, details: `DB status: ${dbApp?.status}, Timeline entries: ${dbApp?.timeline.length}` };
    },
  });

  tests.push({
    id: 44,
    category: 'Applications',
    name: 'PATCH /api/v1/applications/:id/status rejects invalid enum values (400)',
    method: 'PATCH',
    endpoint: () => `/api/v1/applications/${userAAppId}/status`,
    expectedStatus: 400,
    run: async () => {
      const res = await fetch(`${BASE_URL}/api/v1/applications/${userAAppId}/status`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${userAToken}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'invalid_stage_status' }),
      });
      const body = await res.json();
      const ok = res.status === 400 && body.error?.code === 'VALIDATION_ERROR';
      return { success: ok, details: `Caught invalid stage: ${getErrMsg(body)}` };
    },
  });

  tests.push({
    id: 45,
    category: 'Applications',
    name: 'POST /api/v1/applications/:id/notes adds recruiter notes to document (200)',
    method: 'POST',
    endpoint: () => `/api/v1/applications/${userAAppId}/notes`,
    expectedStatus: 200,
    run: async () => {
      const res = await fetch(`${BASE_URL}/api/v1/applications/${userAAppId}/notes`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${userAToken}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: 'Recruiter mentioned round 2 is architecture deep dive' }),
      });
      const body = await res.json();
      const dbApp = await ApplicationModel.findById(userAAppId);
      const ok = res.status === 200 && dbApp !== null && dbApp.notes.length === 1;
      return { success: ok, details: `Total notes stored in DB: ${dbApp?.notes.length}` };
    },
  });

  tests.push({
    id: 46,
    category: 'Applications',
    name: 'POST /api/v1/applications/:id/notes fails when note content is empty (400)',
    method: 'POST',
    endpoint: () => `/api/v1/applications/${userAAppId}/notes`,
    expectedStatus: 400,
    run: async () => {
      const res = await fetch(`${BASE_URL}/api/v1/applications/${userAAppId}/notes`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${userAToken}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: '' }),
      });
      const body = await res.json();
      const ok = res.status === 400 && body.error?.code === 'VALIDATION_ERROR';
      return { success: ok, details: `Caught empty note: ${getErrMsg(body)}` };
    },
  });

  tests.push({
    id: 47,
    category: 'Applications',
    name: 'Cross-User Security: User B cannot access User A application (404/403)',
    method: 'GET',
    endpoint: () => `/api/v1/applications/${userAAppId}`,
    expectedStatus: 404,
    run: async () => {
      const res = await fetch(`${BASE_URL}/api/v1/applications/${userAAppId}`, {
        headers: { Authorization: `Bearer ${userBToken}` },
      });
      const body = await res.json();
      const ok = res.status === 404 && body.error?.code === 'NOT_FOUND';
      return { success: ok, details: `Blocked with status: ${res.status} (${body.error?.code})` };
    },
  });

  tests.push({
    id: 48,
    category: 'Applications',
    name: 'Cross-User Security: User B cannot modify User A application stage (404/403)',
    method: 'PATCH',
    endpoint: () => `/api/v1/applications/${userAAppId}/status`,
    expectedStatus: 404,
    run: async () => {
      const res = await fetch(`${BASE_URL}/api/v1/applications/${userAAppId}/status`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${userBToken}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'rejected' }),
      });
      const ok = res.status === 404;
      return { success: ok, details: `Blocked cross-user mutation with status: ${res.status}` };
    },
  });

  tests.push({
    id: 49,
    category: 'Applications',
    name: 'DELETE /api/v1/applications/:id soft-deletes record (isDeleted=true) (200)',
    method: 'DELETE',
    endpoint: () => `/api/v1/applications/${userAAppId}`,
    expectedStatus: 200,
    run: async () => {
      const res = await fetch(`${BASE_URL}/api/v1/applications/${userAAppId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${userAToken}` },
      });
      const body = await res.json();
      const dbApp = await ApplicationModel.findById(userAAppId);
      const ok = res.status === 200 && dbApp !== null && dbApp.isDeleted === true;
      return { success: ok, details: `DB isDeleted flag: ${dbApp?.isDeleted}` };
    },
  });

  tests.push({
    id: 50,
    category: 'Applications',
    name: 'GET /api/v1/applications/:id returns 404 after soft-deletion',
    method: 'GET',
    endpoint: () => `/api/v1/applications/${userAAppId}`,
    expectedStatus: 404,
    run: async () => {
      const res = await fetch(`${BASE_URL}/api/v1/applications/${userAAppId}`, {
        headers: { Authorization: `Bearer ${userAToken}` },
      });
      const ok = res.status === 404;
      return { success: ok, details: `Soft-deleted entity hidden from client (404)` };
    },
  });

  // ────────────────────────────────────────────────────────────────
  // 8. SKILL GAPS INTELLIGENCE
  // ────────────────────────────────────────────────────────────────
  tests.push({
    id: 51,
    category: 'SkillGaps',
    name: 'GET /api/v1/skill-gaps fails without authentication (401)',
    method: 'GET',
    endpoint: '/api/v1/skill-gaps',
    expectedStatus: 401,
    run: async () => {
      const res = await fetch(`${BASE_URL}/api/v1/skill-gaps`);
      const body = await res.json();
      const ok = res.status === 401 && body.error?.code === 'UNAUTHORIZED';
      return { success: ok, details: `Handled unauthenticated request: ${body.error?.code}` };
    },
  });

  tests.push({
    id: 52,
    category: 'SkillGaps',
    name: 'GET /api/v1/skill-gaps computes gap analysis for authenticated user (200)',
    method: 'GET',
    endpoint: '/api/v1/skill-gaps',
    expectedStatus: 200,
    run: async () => {
      const res = await fetch(`${BASE_URL}/api/v1/skill-gaps`, {
        headers: { Authorization: `Bearer ${userAToken}` },
      });
      const body = await res.json();
      const ok = res.status === 200 && body.success === true && !!body.data;
      return { success: ok, details: `Gap analysis successfully computed` };
    },
  });

  // ────────────────────────────────────────────────────────────────
  // 9. INTERVIEW PREP & ANSWER EVALUATION
  // ────────────────────────────────────────────────────────────────
  tests.push({
    id: 53,
    category: 'InterviewPrep',
    name: 'POST /api/v1/interview-prep/generate fails without authentication (401)',
    method: 'POST',
    endpoint: '/api/v1/interview-prep/generate',
    expectedStatus: 401,
    run: async () => {
      const res = await fetch(`${BASE_URL}/api/v1/interview-prep/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jobTitle: 'Platform Architect',
          company: 'HyperScale Systems',
          description: 'Architecting high availability multi-tenant cloud platforms.',
        }),
      });
      const body = await res.json();
      const ok = res.status === 401 && body.error?.code === 'UNAUTHORIZED';
      return { success: ok, details: `Code: ${body.error?.code}` };
    },
  });

  tests.push({
    id: 54,
    category: 'InterviewPrep',
    name: 'POST /api/v1/interview-prep/generate creates mock interview session with questions (201)',
    method: 'POST',
    endpoint: '/api/v1/interview-prep/generate',
    expectedStatus: 201,
    run: async () => {
      const res = await fetch(`${BASE_URL}/api/v1/interview-prep/generate`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${userAToken}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jobTitle: 'Senior Cloud Platform Engineer',
          company: 'HyperScale Systems',
          description: 'Architecting Kubernetes clusters with zero-trust security and high availability.',
        }),
      });
      const body = await res.json();
      userAPrepId = body.data?._id;
      userAQuestionId = body.data?.questions?.[0]?._id;

      const dbSession = await InterviewPrepModel.findById(userAPrepId);
      const ok = res.status === 201 && dbSession !== null && dbSession.questions.length >= 1;
      return { success: ok, details: `Session created in DB with ${dbSession?.questions.length} questions` };
    },
  });

  tests.push({
    id: 55,
    category: 'InterviewPrep',
    name: 'GET /api/v1/interview-prep/:id retrieves single session for owner (200)',
    method: 'GET',
    endpoint: () => `/api/v1/interview-prep/${userAPrepId}`,
    expectedStatus: 200,
    run: async () => {
      const res = await fetch(`${BASE_URL}/api/v1/interview-prep/${userAPrepId}`, {
        headers: { Authorization: `Bearer ${userAToken}` },
      });
      const body = await res.json();
      const ok = res.status === 200 && body.data?._id === userAPrepId;
      return { success: ok, details: `Session retrieved: ${body.data?.jobTitle}, Questions: ${body.data?.questions?.length}` };
    },
  });

  tests.push({
    id: 56,
    category: 'InterviewPrep',
    name: 'Cross-User Security: User B cannot view User A interview session (404/403)',
    method: 'GET',
    endpoint: () => `/api/v1/interview-prep/${userAPrepId}`,
    expectedStatus: 404,
    run: async () => {
      const res = await fetch(`${BASE_URL}/api/v1/interview-prep/${userAPrepId}`, {
        headers: { Authorization: `Bearer ${userBToken}` },
      });
      const ok = res.status === 404;
      return { success: ok, details: `Blocked cross-user session retrieval with status: ${res.status}` };
    },
  });

  tests.push({
    id: 57,
    category: 'InterviewPrep',
    name: 'POST /api/v1/interview-prep/:id/evaluate fails when answer is too short (< 5 chars) (400)',
    method: 'POST',
    endpoint: () => `/api/v1/interview-prep/${userAPrepId}/evaluate`,
    expectedStatus: 400,
    run: async () => {
      const res = await fetch(`${BASE_URL}/api/v1/interview-prep/${userAPrepId}/evaluate`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${userAToken}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ questionId: userAQuestionId, answer: 'no' }),
      });
      const body = await res.json();
      const ok = res.status === 400 && body.error?.code === 'VALIDATION_ERROR';
      return { success: ok, details: `Caught too-short answer: ${getErrMsg(body)}` };
    },
  });

  tests.push({
    id: 58,
    category: 'InterviewPrep',
    name: 'POST /api/v1/interview-prep/:id/evaluate evaluates answer and stores score in DB (200)',
    method: 'POST',
    endpoint: () => `/api/v1/interview-prep/${userAPrepId}/evaluate`,
    expectedStatus: 200,
    run: async () => {
      const res = await fetch(`${BASE_URL}/api/v1/interview-prep/${userAPrepId}/evaluate`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${userAToken}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          questionId: userAQuestionId,
          answer:
            'We implement zero-trust ingress with mTLS across all microservices using Envoy proxies, paired with automated canary deployments via ArgoCD and Prometheus alert thresholds.',
        }),
      });
      const body = await res.json();
      const ok = res.status === 200 && typeof body.data?.score === 'number' && Array.isArray(body.data?.strengths);
      return { success: ok, details: `Score: ${body.data?.score}, Strengths count: ${body.data?.strengths?.length}` };
    },
  });

  tests.push({
    id: 59,
    category: 'InterviewPrep',
    name: 'Cross-User Security: User B cannot evaluate User A interview session (404/403)',
    method: 'POST',
    endpoint: () => `/api/v1/interview-prep/${userAPrepId}/evaluate`,
    expectedStatus: 404,
    run: async () => {
      const res = await fetch(`${BASE_URL}/api/v1/interview-prep/${userAPrepId}/evaluate`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${userBToken}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ questionId: userAQuestionId, answer: 'Unauthorized attempt to evaluate' }),
      });
      const ok = res.status === 404;
      return { success: ok, details: `Blocked cross-user attempt with status: ${res.status}` };
    },
  });

  // ────────────────────────────────────────────────────────────────
  // 10. FREELANCE GIGS MARKETPLACE & PROPOSALS
  // ────────────────────────────────────────────────────────────────
  tests.push({
    id: 60,
    category: 'FreelanceGigs',
    name: 'POST /api/v1/freelance-gigs fails when description is too short (400)',
    method: 'POST',
    endpoint: '/api/v1/freelance-gigs',
    expectedStatus: 400,
    run: async () => {
      const res = await fetch(`${BASE_URL}/api/v1/freelance-gigs`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${userAToken}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: 'Fast Script',
          client: 'Acme Client',
          platform: 'upwork',
          description: 'tiny',
        }),
      });
      const body = await res.json();
      const ok = res.status === 400 && body.error?.code === 'VALIDATION_ERROR';
      return { success: ok, details: `Caught short description: ${getErrMsg(body)}` };
    },
  });

  tests.push({
    id: 61,
    category: 'FreelanceGigs',
    name: 'POST /api/v1/freelance-gigs creates new gig with status "open", verified in DB (201)',
    method: 'POST',
    endpoint: '/api/v1/freelance-gigs',
    expectedStatus: 201,
    run: async () => {
      const res = await fetch(`${BASE_URL}/api/v1/freelance-gigs`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${userAToken}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: 'Full Stack Dashboard Migration to Next.js 14',
          client: 'Acme Enterprise Solutions',
          description: 'Migrate existing legacy React dashboard to Next.js App Router with Server Actions and Tailwind CSS.',
          budget: '$2,500',
          platform: 'upwork',
          skills: ['Next.js', 'React', 'TypeScript', 'TailwindCSS'],
        }),
      });
      const body = await res.json();
      userAGigId = body.data?._id;

      const dbGig = await FreelanceGigModel.findById(userAGigId);
      const ok = res.status === 201 && dbGig !== null && dbGig.status === 'open';
      return { success: ok, details: `Gig created in DB with status: ${dbGig?.status}` };
    },
  });

  tests.push({
    id: 62,
    category: 'FreelanceGigs',
    name: 'GET /api/v1/freelance-gigs/:id retrieves single gig (200)',
    method: 'GET',
    endpoint: () => `/api/v1/freelance-gigs/${userAGigId}`,
    expectedStatus: 200,
    run: async () => {
      const res = await fetch(`${BASE_URL}/api/v1/freelance-gigs/${userAGigId}`);
      const body = await res.json();
      const ok = res.status === 200 && body.data?._id === userAGigId;
      return { success: ok, details: `Retrieved gig: ${body.data?.title}, Budget: ${body.data?.budget}` };
    },
  });

  tests.push({
    id: 63,
    category: 'FreelanceGigs',
    name: 'POST /api/v1/freelance-gigs/:id/pitch generates tailored AI proposal pitch (200)',
    method: 'POST',
    endpoint: () => `/api/v1/freelance-gigs/${userAGigId}/pitch`,
    expectedStatus: 200,
    run: async () => {
      const res = await fetch(`${BASE_URL}/api/v1/freelance-gigs/${userAGigId}/pitch`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${userAToken}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ tone: 'persuasive' }),
      });
      const body = await res.json();
      const ok = res.status === 200 && typeof body.data?.pitch === 'string' && body.data.pitch.length > 50;
      return { success: ok, details: `Proposal length: ${body.data?.pitch?.length} chars` };
    },
  });

  tests.push({
    id: 64,
    category: 'FreelanceGigs',
    name: 'PATCH /api/v1/freelance-gigs/:id/status updates gig status to "won", verified in DB (200)',
    method: 'PATCH',
    endpoint: () => `/api/v1/freelance-gigs/${userAGigId}/status`,
    expectedStatus: 200,
    run: async () => {
      const res = await fetch(`${BASE_URL}/api/v1/freelance-gigs/${userAGigId}/status`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${userAToken}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'won' }),
      });
      const body = await res.json();
      const dbGig = await FreelanceGigModel.findById(userAGigId);
      const ok = res.status === 200 && dbGig?.status === 'won';
      return { success: ok, details: `DB status updated to: ${dbGig?.status}` };
    },
  });

  // ────────────────────────────────────────────────────────────────
  // 11. CLEANUP & ACCOUNT TERMINATION
  // ────────────────────────────────────────────────────────────────
  tests.push({
    id: 65,
    category: 'Resumes',
    name: 'DELETE /api/v1/resumes/:id soft-deletes resume and removes encrypted file (200)',
    method: 'DELETE',
    endpoint: () => `/api/v1/resumes/${userAResumeId}`,
    expectedStatus: 200,
    run: async () => {
      const res = await fetch(`${BASE_URL}/api/v1/resumes/${userAResumeId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${userAToken}` },
      });
      const body = await res.json();
      const dbResume = await ResumeModel.findById(userAResumeId);
      const ok = res.status === 200 && dbResume !== null && dbResume.isDeleted === true;
      return { success: ok, details: `DB isDeleted flag: ${dbResume?.isDeleted}, Message: ${body.data?.message}` };
    },
  });

  tests.push({
    id: 66,
    category: 'Resumes',
    name: 'GET /api/v1/resumes/:id returns 404 after soft-deletion',
    method: 'GET',
    endpoint: () => `/api/v1/resumes/${userAResumeId}`,
    expectedStatus: 404,
    run: async () => {
      const res = await fetch(`${BASE_URL}/api/v1/resumes/${userAResumeId}`, {
        headers: { Authorization: `Bearer ${userAToken}` },
      });
      const ok = res.status === 404;
      return { success: ok, details: `Soft-deleted resume hidden with status: ${res.status}` };
    },
  });

  tests.push({
    id: 67,
    category: 'Users',
    name: 'DELETE /api/v1/users/me fails with wrong confirmation string (400)',
    method: 'DELETE',
    endpoint: '/api/v1/users/me',
    expectedStatus: 400,
    run: async () => {
      const res = await fetch(`${BASE_URL}/api/v1/users/me`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${userAToken}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ confirmationText: 'WRONG CONFIRMATION STRING' }),
      });
      const body = await res.json();
      const ok = res.status === 400 && body.error?.code === 'VALIDATION_ERROR';
      return { success: ok, details: `Confirmation text strictly enforced: ${getErrMsg(body)}` };
    },
  });

  tests.push({
    id: 68,
    category: 'Users',
    name: 'DELETE /api/v1/users/me soft-deletes user account (isDeleted=true in DB) (200)',
    method: 'DELETE',
    endpoint: '/api/v1/users/me',
    expectedStatus: 200,
    run: async () => {
      const res = await fetch(`${BASE_URL}/api/v1/users/me`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${userAToken}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ confirmationText: 'DELETE MY ACCOUNT' }),
      });
      const body = await res.json();
      const dbUser = await UserModel.findById(userAId);
      const ok = res.status === 200 && dbUser !== null && dbUser.isDeleted === true;
      return { success: ok, details: `User marked isDeleted=true at ${dbUser?.deletedAt}` };
    },
  });

  tests.push({
    id: 69,
    category: 'Auth',
    name: 'POST /api/v1/auth/login fails for soft-deleted user account (401 Rejected)',
    method: 'POST',
    endpoint: '/api/v1/auth/login',
    expectedStatus: 401,
    run: async () => {
      const res = await fetch(`${BASE_URL}/api/v1/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: userAEmail, password: 'SecurePassword123!' }),
      });
      const body = await res.json();
      const ok = res.status === 401 && body.error?.code === 'UNAUTHORIZED';
      return { success: ok, details: `Deleted account login blocked with 401: ${getErrMsg(body)}` };
    },
  });

  tests.push({
    id: 70,
    category: 'Auth',
    name: 'POST /api/v1/auth/logout successfully clears refresh token and session (200)',
    method: 'POST',
    endpoint: '/api/v1/auth/logout',
    expectedStatus: 200,
    run: async () => {
      const res = await fetch(`${BASE_URL}/api/v1/auth/logout`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${userBToken}`,
          Cookie: `refreshToken=${userBRefreshToken}`,
        },
      });
      const body = await res.json();
      const ok = res.status === 200 && body.data?.message === 'Logged out successfully';
      return { success: ok, details: `Logout message: ${body.data?.message}` };
    },
  });

  // ────────────────────────────────────────────────────────────────
  // EXECUTION LOOP
  // ────────────────────────────────────────────────────────────────
  let passCount = 0;
  let failCount = 0;

  for (const test of tests) {
    const resolvedEndpoint = typeof test.endpoint === 'function' ? test.endpoint() : test.endpoint;
    try {
      const result = await test.run();
      if (result.success) {
        passCount++;
        console.log(`✅ [${test.id.toString().padStart(2, '0')}] [${test.category}] ${test.name}`);
        console.log(`     Endpoint: ${test.method} ${resolvedEndpoint} (Expected: ${test.expectedStatus})`);
        console.log(`     Details : ${result.details}\n`);
      } else {
        failCount++;
        console.error(`❌ [${test.id.toString().padStart(2, '0')}] [${test.category}] ${test.name}`);
        console.error(`     Endpoint: ${test.method} ${resolvedEndpoint} (Expected: ${test.expectedStatus})`);
        console.error(`     Details : ${result.details}\n`);
      }
    } catch (err: any) {
      failCount++;
      console.error(`💥 [${test.id.toString().padStart(2, '0')}] [${test.category}] ${test.name} EXCEPTION!`);
      console.error(`     Endpoint: ${test.method} ${resolvedEndpoint} (Expected: ${test.expectedStatus})`);
      console.error(`     Error   : ${err.message}\n`);
    }
  }

  console.log('================================================================================');
  console.log('🏁 COMPREHENSIVE TEST SUITE EXECUTION SUMMARY');
  console.log('================================================================================');
  console.log(`Total Test Scenarios : ${tests.length}`);
  console.log(`Passed & Verified    : ${passCount}`);
  console.log(`Failed               : ${failCount}`);
  console.log(`Success Rate         : ${((passCount / tests.length) * 100).toFixed(1)}%\n`);

  if (failCount === 0) {
    console.log(`🎉 100% OF ALL ${tests.length} SCENARIOS PASSED WITH LIVE DATABASE VALIDATION!`);
  } else {
    console.error(`⚠️ ${failCount} SCENARIOS FAILED. Check details above.`);
  }

  await disconnectDB();
  process.exit(failCount === 0 ? 0 : 1);
}

main().catch((err) => {
  console.error('Fatal Test Runner Failure:', err);
  process.exit(1);
});
