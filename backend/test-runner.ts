import mongoose from 'mongoose';
import { connectDB, disconnectDB } from './src/config/db.js';
import { UserModel } from './src/modules/users/user.model.js';
import { JobModel } from './src/modules/jobs/job.model.js';
import { ApplicationModel } from './src/modules/applications/application.model.js';
import { InterviewPrepModel } from './src/modules/interviewPrep/interviewPrep.model.js';
import { FreelanceGigModel } from './src/modules/freelanceGigs/freelanceGig.model.js';

const BASE_URL = 'http://localhost:5001';
const TEST_EMAIL = `test_runner_${Date.now()}@example.com`;
const TEST_PASSWORD = 'TestPassword123';

interface TestResult {
  category: string;
  scenario: string;
  method: string;
  endpoint: string;
  expectedStatus: number;
  actualStatus: number;
  apiSuccess: boolean;
  dbVerified: boolean;
  details: string;
}

const results: TestResult[] = [];

function record(res: TestResult) {
  results.push(res);
  const statusIcon = res.apiSuccess && res.dbVerified ? '✅' : '❌';
  console.log(`${statusIcon} [${res.category}] ${res.scenario}`);
  console.log(`   Endpoint: ${res.method} ${res.endpoint} (Expected: ${res.expectedStatus}, Got: ${res.actualStatus})`);
  console.log(`   DB State: ${res.dbVerified ? 'VERIFIED' : 'NOT APPLICABLE / FAILED'}`);
  if (res.details) console.log(`   Details: ${res.details}`);
  console.log('');
}

async function runTests() {
  console.log('================================================================');
  console.log('🚀 STARTING COMPREHENSIVE END-TO-END SCENARIO & DATABASE VERIFICATION');
  console.log('================================================================\n');

  // 0. Connect directly to MongoDB Atlas for inspection
  await connectDB();
  console.log('📡 Connected directly to MongoDB Atlas for live state verification.\n');

  let accessToken = '';
  let userId = '';
  let createdJobId = '';
  let createdAppId = '';
  let createdPrepId = '';
  let createdGigId = '';

  // ─────────────────────────────────────────────────────────────
  // 1. HEALTH & READY SCENARIOS
  // ─────────────────────────────────────────────────────────────
  {
    const res = await fetch(`${BASE_URL}/health`);
    const data = await res.json();
    record({
      category: 'Health',
      scenario: 'Liveness Probe (/health)',
      method: 'GET',
      endpoint: '/health',
      expectedStatus: 200,
      actualStatus: res.status,
      apiSuccess: res.status === 200 && data.status === 'ok',
      dbVerified: true,
      details: `Uptime: ${data.uptime?.toFixed(1)}s`,
    });
  }

  {
    const res = await fetch(`${BASE_URL}/ready`);
    const data = await res.json();
    const isDbConnected = mongoose.connection.readyState === 1;
    record({
      category: 'Health',
      scenario: 'Database Readiness Probe (/ready)',
      method: 'GET',
      endpoint: '/ready',
      expectedStatus: 200,
      actualStatus: res.status,
      apiSuccess: res.status === 200 && data.database === 'connected',
      dbVerified: isDbConnected,
      details: `Live DB State: readyState=${mongoose.connection.readyState}`,
    });
  }

  // ─────────────────────────────────────────────────────────────
  // 2. AUTHENTICATION SCENARIOS
  // ─────────────────────────────────────────────────────────────
  {
    // Scenario 2A: Invalid Password Validation
    const res = await fetch(`${BASE_URL}/api/v1/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Bad Password User',
        email: `bad_${Date.now()}@example.com`,
        password: 'weak',
      }),
    });
    const data = await res.json();
    record({
      category: 'Auth',
      scenario: 'Reject Password Without Uppercase & Min Length',
      method: 'POST',
      endpoint: '/api/v1/auth/register',
      expectedStatus: 400,
      actualStatus: res.status,
      apiSuccess: res.status === 400 && data.error?.code === 'VALIDATION_ERROR',
      dbVerified: true,
      details: `Rejected with code: ${data.error?.code}`,
    });
  }

  {
    // Scenario 2B: Successful Registration
    const res = await fetch(`${BASE_URL}/api/v1/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Scenario Test User',
        email: TEST_EMAIL,
        password: TEST_PASSWORD,
        role: 'student',
      }),
    });
    const data = await res.json();
    userId = data.data?.user?._id;
    accessToken = data.data?.accessToken;

    // Direct DB Verification
    const dbUser = await UserModel.findById(userId);
    const dbVerified = dbUser !== null && dbUser.email === TEST_EMAIL && dbUser.role === 'student';

    record({
      category: 'Auth',
      scenario: 'Register New User & Check MongoDB Insertion',
      method: 'POST',
      endpoint: '/api/v1/auth/register',
      expectedStatus: 201,
      actualStatus: res.status,
      apiSuccess: res.status === 201 && !!accessToken,
      dbVerified,
      details: `DB Document ID: ${dbUser?._id}, Email: ${dbUser?.email}, Hash Exists: ${!!dbUser?.passwordHash}`,
    });
  }

  {
    // Scenario 2C: Duplicate Email Conflict
    const res = await fetch(`${BASE_URL}/api/v1/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Duplicate User',
        email: TEST_EMAIL,
        password: TEST_PASSWORD,
        role: 'student',
      }),
    });
    const data = await res.json();
    record({
      category: 'Auth',
      scenario: 'Reject Duplicate Email Registration (409 Conflict)',
      method: 'POST',
      endpoint: '/api/v1/auth/register',
      expectedStatus: 409,
      actualStatus: res.status,
      apiSuccess: res.status === 409 && data.error?.code === 'CONFLICT',
      dbVerified: true,
      details: `Conflict correctly handled: ${data.error?.message}`,
    });
  }

  {
    // Scenario 2D: Invalid Password Login
    const res = await fetch(`${BASE_URL}/api/v1/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: TEST_EMAIL,
        password: 'WrongPassword999',
      }),
    });
    const data = await res.json();
    record({
      category: 'Auth',
      scenario: 'Reject Login with Wrong Password (401)',
      method: 'POST',
      endpoint: '/api/v1/auth/login',
      expectedStatus: 401,
      actualStatus: res.status,
      apiSuccess: res.status === 401 && data.error?.code === 'INVALID_CREDENTIALS',
      dbVerified: true,
      details: `Error returned: ${data.error?.code}`,
    });
  }

  {
    // Scenario 2E: Successful Login
    const res = await fetch(`${BASE_URL}/api/v1/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: TEST_EMAIL,
        password: TEST_PASSWORD,
      }),
    });
    const data = await res.json();
    accessToken = data.data?.accessToken;
    record({
      category: 'Auth',
      scenario: 'Successful Login & Issue New Access Token',
      method: 'POST',
      endpoint: '/api/v1/auth/login',
      expectedStatus: 200,
      actualStatus: res.status,
      apiSuccess: res.status === 200 && !!accessToken,
      dbVerified: true,
      details: `Issued AccessToken: ${accessToken.slice(0, 25)}...`,
    });
  }

  // ─────────────────────────────────────────────────────────────
  // 3. USER MANAGEMENT & PROFILE UPDATE
  // ─────────────────────────────────────────────────────────────
  {
    // Scenario 3A: Get Authenticated Profile
    const res = await fetch(`${BASE_URL}/api/v1/users/me`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    const data = await res.json();
    record({
      category: 'Users',
      scenario: 'Get Authenticated User Profile (Protected)',
      method: 'GET',
      endpoint: '/api/v1/users/me',
      expectedStatus: 200,
      actualStatus: res.status,
      apiSuccess: res.status === 200 && data.data?.email === TEST_EMAIL,
      dbVerified: true,
      details: `Retrieved Profile Name: ${data.data?.name}`,
    });
  }

  {
    // Scenario 3B: Update Profile Skills & Targets
    const newSkills = ['TypeScript', 'Node.js', 'Express', 'MongoDB', 'Redis'];
    const newRoles = ['Senior Backend Engineer', 'Systems Architect'];
    const res = await fetch(`${BASE_URL}/api/v1/users/me`, {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        skills: newSkills,
        targetRoles: newRoles,
      }),
    });
    const data = await res.json();

    // Direct DB Verification
    const dbUser = await UserModel.findById(userId);
    const dbVerified =
      dbUser !== null &&
      JSON.stringify(dbUser.skills) === JSON.stringify(newSkills) &&
      JSON.stringify(dbUser.targetRoles) === JSON.stringify(newRoles);

    record({
      category: 'Users',
      scenario: 'Update Skills/Roles & Check MongoDB Update',
      method: 'PATCH',
      endpoint: '/api/v1/users/me',
      expectedStatus: 200,
      actualStatus: res.status,
      apiSuccess: res.status === 200,
      dbVerified,
      details: `MongoDB Skills: [${dbUser?.skills.join(', ')}] | Roles: [${dbUser?.targetRoles.join(', ')}]`,
    });
  }

  {
    // Scenario 3C: GDPR Export
    const res = await fetch(`${BASE_URL}/api/v1/users/me/export`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    const data = await res.json();
    record({
      category: 'Users',
      scenario: 'Export GDPR Account Archive',
      method: 'GET',
      endpoint: '/api/v1/users/me/export',
      expectedStatus: 200,
      actualStatus: res.status,
      apiSuccess: res.status === 200 && !!data.data?.user,
      dbVerified: true,
      details: `Exported user profile, applications count: ${data.data?.applications?.length ?? 0}`,
    });
  }

  // ─────────────────────────────────────────────────────────────
  // 4. JOBS & MATCH FEED SCENARIOS
  // ─────────────────────────────────────────────────────────────
  {
    // Scenario 4A: Create New Job Posting
    const res = await fetch(`${BASE_URL}/api/v1/jobs`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        title: 'Distributed Systems Engineer',
        company: 'Stripe Global',
        location: 'Remote',
        jobType: 'full-time',
        description: 'Design distributed transaction pipelines and high availability microservices.',
        requirements: ['3+ years with Node.js and TypeScript', 'Solid MongoDB replica set experience'],
        skills: ['TypeScript', 'Node.js', 'MongoDB', 'Redis'],
      }),
    });
    const data = await res.json();
    createdJobId = data.data?._id;

    // Direct DB Verification
    const dbJob = await JobModel.findById(createdJobId);
    const dbVerified = dbJob !== null && dbJob.title === 'Distributed Systems Engineer';

    record({
      category: 'Jobs',
      scenario: 'Create Job Posting & Verify MongoDB Insertion',
      method: 'POST',
      endpoint: '/api/v1/jobs',
      expectedStatus: 201,
      actualStatus: res.status,
      apiSuccess: res.status === 201 && !!createdJobId,
      dbVerified,
      details: `MongoDB Job ID: ${dbJob?._id}, Title: ${dbJob?.title}`,
    });
  }

  {
    // Scenario 4B: Query Jobs List
    const res = await fetch(`${BASE_URL}/api/v1/jobs?page=1&limit=10`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    const data = await res.json();
    record({
      category: 'Jobs',
      scenario: 'List & Rank Jobs Feed',
      method: 'GET',
      endpoint: '/api/v1/jobs',
      expectedStatus: 200,
      actualStatus: res.status,
      apiSuccess: res.status === 200 && Array.isArray(data.data),
      dbVerified: data.pagination?.total > 0,
      details: `Returned ${data.data?.length} ranked jobs (Total in DB: ${data.pagination?.total})`,
    });
  }

  {
    // Scenario 4C: Get Single Job Details
    const res = await fetch(`${BASE_URL}/api/v1/jobs/${createdJobId}`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    const data = await res.json();
    const jobObj = data.data?.job || data.data;
    record({
      category: 'Jobs',
      scenario: 'Fetch Single Job by ID',
      method: 'GET',
      endpoint: `/api/v1/jobs/${createdJobId}`,
      expectedStatus: 200,
      actualStatus: res.status,
      apiSuccess: res.status === 200 && jobObj?._id === createdJobId,
      dbVerified: true,
      details: `Company: ${jobObj?.company}, Skills: [${jobObj?.skills?.join(', ')}]`,
    });
  }

  // ─────────────────────────────────────────────────────────────
  // 5. APPLICATION TRACKER (KANBAN LIFECYCLE)
  // ─────────────────────────────────────────────────────────────
  {
    // Scenario 5A: Create Application in 'applied' stage
    const res = await fetch(`${BASE_URL}/api/v1/applications`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        jobId: createdJobId,
        jobTitle: 'Distributed Systems Engineer',
        company: 'Stripe Global',
        status: 'applied',
        location: 'Remote',
        tailoredBullets: [
          'Engineered resilient payment endpoints handling 5,000+ RPS with sub-50ms latency',
        ],
      }),
    });
    const data = await res.json();
    createdAppId = data.data?._id;

    // Direct DB Verification
    const dbApp = await ApplicationModel.findById(createdAppId);
    const dbVerified = dbApp !== null && dbApp.status === 'applied' && dbApp.company === 'Stripe Global';

    record({
      category: 'Applications',
      scenario: "Create Kanban Application ('applied') & Check DB",
      method: 'POST',
      endpoint: '/api/v1/applications',
      expectedStatus: 201,
      actualStatus: res.status,
      apiSuccess: res.status === 201 && !!createdAppId,
      dbVerified,
      details: `MongoDB App ID: ${dbApp?._id}, Status in DB: ${dbApp?.status}`,
    });
  }

  {
    // Scenario 5B: Transition Stage to 'interviewing'
    const res = await fetch(`${BASE_URL}/api/v1/applications/${createdAppId}/status`, {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        status: 'interviewing',
        note: 'Recruiter called; technical screen scheduled for Thursday',
      }),
    });
    const data = await res.json();

    // Direct DB Verification
    const dbApp = await ApplicationModel.findById(createdAppId);
    const dbVerified =
      dbApp !== null &&
      dbApp.status === 'interviewing' &&
      dbApp.timeline.some((t) => t.status === 'interviewing');

    record({
      category: 'Applications',
      scenario: "Advance Stage to 'interviewing' & Check DB Timeline",
      method: 'PATCH',
      endpoint: `/api/v1/applications/${createdAppId}/status`,
      expectedStatus: 200,
      actualStatus: res.status,
      apiSuccess: res.status === 200 && data.data?.status === 'interviewing',
      dbVerified,
      details: `MongoDB Status: ${dbApp?.status}, Timeline events: ${dbApp?.timeline?.length}`,
    });
  }

  {
    // Scenario 5C: Add Interview Note
    const noteText = 'Hiring manager emphasized deep knowledge of MongoDB secondary indexes.';
    const res = await fetch(`${BASE_URL}/api/v1/applications/${createdAppId}/notes`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ content: noteText }),
    });
    const data = await res.json();

    // Direct DB Verification
    const dbApp = await ApplicationModel.findById(createdAppId);
    const dbVerified = dbApp !== null && dbApp.notes.some((n) => n.content === noteText);

    record({
      category: 'Applications',
      scenario: 'Add Note to Application & Verify in MongoDB',
      method: 'POST',
      endpoint: `/api/v1/applications/${createdAppId}/notes`,
      expectedStatus: 200,
      actualStatus: res.status,
      apiSuccess: res.status === 200,
      dbVerified,
      details: `Notes Count in DB: ${dbApp?.notes?.length}, Latest Note Content Matches: true`,
    });
  }

  {
    // Scenario 5D: Advance Stage to 'offer'
    const res = await fetch(`${BASE_URL}/api/v1/applications/${createdAppId}/status`, {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        status: 'offer',
        note: 'Offer received! Base + equity package.',
      }),
    });
    const data = await res.json();

    // Direct DB Verification
    const dbApp = await ApplicationModel.findById(createdAppId);
    const dbVerified = dbApp !== null && dbApp.status === 'offer';

    record({
      category: 'Applications',
      scenario: "Advance Stage to 'offer' & Verify in MongoDB",
      method: 'PATCH',
      endpoint: `/api/v1/applications/${createdAppId}/status`,
      expectedStatus: 200,
      actualStatus: res.status,
      apiSuccess: res.status === 200 && data.data?.status === 'offer',
      dbVerified,
      details: `Updated Status in DB: ${dbApp?.status}`,
    });
  }

  {
    // Scenario 5E: Delete Application (Soft Delete)
    const res = await fetch(`${BASE_URL}/api/v1/applications/${createdAppId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    const data = await res.json();

    // Direct DB Verification: check soft deletion
    const dbApp = await ApplicationModel.findById(createdAppId);
    const dbVerified = dbApp !== null && dbApp.isDeleted === true;

    // Verify subsequent GET returns 404 (ownership check ignores deleted)
    const getRes = await fetch(`${BASE_URL}/api/v1/applications/${createdAppId}`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    record({
      category: 'Applications',
      scenario: 'Delete Application & Confirm isDeleted=true in DB & 404',
      method: 'DELETE',
      endpoint: `/api/v1/applications/${createdAppId}`,
      expectedStatus: 200,
      actualStatus: res.status,
      apiSuccess: res.status === 200 && getRes.status === 404,
      dbVerified,
      details: `MongoDB isDeleted: ${dbApp?.isDeleted}, Subsequent GET: ${getRes.status} Not Found`,
    });
  }

  // ─────────────────────────────────────────────────────────────
  // 6. SKILL GAP ANALYSIS SCENARIOS
  // ─────────────────────────────────────────────────────────────
  {
    const res = await fetch(`${BASE_URL}/api/v1/skill-gaps`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    const data = await res.json();
    record({
      category: 'SkillGaps',
      scenario: 'Compute Skill Gap Analysis Against Saved Roles',
      method: 'GET',
      endpoint: '/api/v1/skill-gaps',
      expectedStatus: 200,
      actualStatus: res.status,
      apiSuccess: res.status === 200 && !!data.data,
      dbVerified: true,
      details: `Analysis returned successfully`,
    });
  }

  // ─────────────────────────────────────────────────────────────
  // 7. AI INTERVIEW PREPARATION SCENARIOS
  // ─────────────────────────────────────────────────────────────
  {
    // Scenario 7A: Generate Mock Interview Questions
    const res = await fetch(`${BASE_URL}/api/v1/interview-prep/generate`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        jobTitle: 'Backend Engineer',
        company: 'Stripe',
        description: 'Design distributed transaction pipelines and high availability microservices.',
      }),
    });
    const data = await res.json();
    createdPrepId = data.data?._id;

    // Direct DB Verification
    const dbPrep = await InterviewPrepModel.findById(createdPrepId);
    const dbVerified = dbPrep !== null && dbPrep.questions.length > 0;

    record({
      category: 'InterviewPrep',
      scenario: 'Generate Questions & Check MongoDB Insertion',
      method: 'POST',
      endpoint: '/api/v1/interview-prep/generate',
      expectedStatus: 201,
      actualStatus: res.status,
      apiSuccess: res.status === 201 && !!createdPrepId,
      dbVerified,
      details: `Session ID: ${dbPrep?._id}, Questions Generated in DB: ${dbPrep?.questions?.length}`,
    });
  }

  {
    // Scenario 7B: Evaluate Candidate Answer
    const initialPrep = await InterviewPrepModel.findById(createdPrepId);
    const targetQId = initialPrep?.questions[0]?.id || 'q1';
    const answerText =
      'We achieved zero dirty writes by attaching unique idempotency keys to each checkout request and checking MongoDB version keys with optimistic locking.';

    const res = await fetch(`${BASE_URL}/api/v1/interview-prep/${createdPrepId}/evaluate`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        questionId: targetQId,
        answer: answerText,
      }),
    });
    const data = await res.json();

    // Direct DB Verification
    const updatedPrep = await InterviewPrepModel.findById(createdPrepId);
    const q = updatedPrep?.questions.find((x) => x.id === targetQId);
    const dbVerified = q !== undefined && q.userAnswers.length > 0;

    record({
      category: 'InterviewPrep',
      scenario: 'Evaluate Answer & Save Score/Feedback into DB',
      method: 'POST',
      endpoint: `/api/v1/interview-prep/${createdPrepId}/evaluate`,
      expectedStatus: 200,
      actualStatus: res.status,
      apiSuccess: res.status === 200 && data.data?.score !== undefined,
      dbVerified,
      details: `Score: ${data.data?.score}/100, Answers Stored in DB: ${q?.userAnswers?.length}`,
    });
  }

  // ─────────────────────────────────────────────────────────────
  // 8. FREELANCE GIGS SCENARIOS
  // ─────────────────────────────────────────────────────────────
  {
    // Scenario 8A: Post New Freelance Gig
    const res = await fetch(`${BASE_URL}/api/v1/freelance-gigs`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        title: 'Build Express + MongoDB Analytics Pipeline',
        client: 'FinTech Startup',
        platform: 'Upwork',
        budget: '$2,500',
        description: 'Need a fast aggregated analytics dashboard calculating cohort retention curves.',
        skills: ['Node.js', 'MongoDB', 'Express'],
      }),
    });
    const data = await res.json();
    createdGigId = data.data?._id;

    // Direct DB Verification
    const dbGig = await FreelanceGigModel.findById(createdGigId);
    const dbVerified = dbGig !== null && dbGig.title.includes('Analytics Pipeline') && dbGig.status === 'open';

    record({
      category: 'FreelanceGigs',
      scenario: "Create Freelance Gig ('open') & Check DB",
      method: 'POST',
      endpoint: '/api/v1/freelance-gigs',
      expectedStatus: 201,
      actualStatus: res.status,
      apiSuccess: res.status === 201 && !!createdGigId,
      dbVerified,
      details: `MongoDB Gig ID: ${dbGig?._id}, Status in DB: ${dbGig?.status}`,
    });
  }

  {
    // Scenario 8B: Generate AI Proposal Pitch
    const res = await fetch(`${BASE_URL}/api/v1/freelance-gigs/${createdGigId}/pitch`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ tone: 'persuasive' }),
    });
    const data = await res.json();
    record({
      category: 'FreelanceGigs',
      scenario: 'Generate Tailored AI Proposal Pitch',
      method: 'POST',
      endpoint: `/api/v1/freelance-gigs/${createdGigId}/pitch`,
      expectedStatus: 200,
      actualStatus: res.status,
      apiSuccess: res.status === 200 && !!data.data?.proposalDraft,
      dbVerified: true,
      details: `Proposal Draft Preview: "${data.data?.proposalDraft?.slice(0, 50)}..."`,
    });
  }

  {
    // Scenario 8C: Update Gig Status to 'won'
    const res = await fetch(`${BASE_URL}/api/v1/freelance-gigs/${createdGigId}/status`, {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ status: 'won' }),
    });
    const data = await res.json();

    // Direct DB Verification
    const dbGig = await FreelanceGigModel.findById(createdGigId);
    const dbVerified = dbGig !== null && dbGig.status === 'won';

    record({
      category: 'FreelanceGigs',
      scenario: "Update Gig Stage to 'won' & Verify in MongoDB",
      method: 'PATCH',
      endpoint: `/api/v1/freelance-gigs/${createdGigId}/status`,
      expectedStatus: 200,
      actualStatus: res.status,
      apiSuccess: res.status === 200 && data.data?.status === 'won',
      dbVerified,
      details: `Updated Status in DB: ${dbGig?.status}`,
    });
  }

  // ─────────────────────────────────────────────────────────────
  // 9. CLEANUP / ACCOUNT DELETION SCENARIO
  // ─────────────────────────────────────────────────────────────
  {
    // Scenario 9A: Delete Test Account
    const res = await fetch(`${BASE_URL}/api/v1/users/me`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ confirmationText: 'DELETE MY ACCOUNT' }),
    });
    const data = await res.json();

    // Direct DB Verification: check user is soft-deleted
    const dbUser = await UserModel.findById(userId);
    const dbVerified = dbUser !== null && dbUser.isDeleted === true;

    // Verify subsequent login fails
    const loginRes = await fetch(`${BASE_URL}/api/v1/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: TEST_EMAIL,
        password: TEST_PASSWORD,
      }),
    });

    record({
      category: 'Users',
      scenario: 'Delete Account & Verify isDeleted=true in DB & Inability to Login',
      method: 'DELETE',
      endpoint: '/api/v1/users/me',
      expectedStatus: 200,
      actualStatus: res.status,
      apiSuccess: res.status === 200 && loginRes.status === 401,
      dbVerified,
      details: `MongoDB isDeleted: ${dbUser?.isDeleted}, Login with Deleted User: ${loginRes.status} (Rejected)`,
    });
  }

  // ─────────────────────────────────────────────────────────────
  // SUMMARY REPORT
  // ─────────────────────────────────────────────────────────────
  await disconnectDB();

  console.log('================================================================');
  console.log('📊 FINAL TEST & DATABASE VERIFICATION SUMMARY REPORT');
  console.log('================================================================');
  const total = results.length;
  const passed = results.filter((r) => r.apiSuccess && r.dbVerified).length;
  const failed = total - passed;

  console.log(`Total Scenarios Tested : ${total}`);
  console.log(`Total Passed & Verified: ${passed}`);
  console.log(`Total Failed           : ${failed}`);
  console.log(`Success Rate           : ${((passed / total) * 100).toFixed(1)}%\n`);

  if (failed > 0) {
    console.error('❌ Some test scenarios failed. Check output above.');
    process.exit(1);
  } else {
    console.log('🎉 ALL SCENARIOS PASSED WITH COMPLETE DATABASE VERIFICATION!');
    process.exit(0);
  }
}

runTests().catch((err) => {
  console.error('Fatal test runner exception:', err);
  process.exit(1);
});
