import bcrypt from 'bcryptjs';
import { UserModel } from '../modules/users/user.model.js';
import { ApplicationModel } from '../modules/applications/application.model.js';
import { ResumeModel } from '../modules/resumes/resume.model.js';
import { FreelanceGigModel } from '../modules/freelanceGigs/freelanceGig.model.js';
import { InterviewPrepModel } from '../modules/interviewPrep/interviewPrep.model.js';
import { logger } from '../utils/logger.js';

export const seedService = {
  async seedDemoUser(): Promise<void> {
    try {
      const demoEmail = 'demo@jobwise.ai';
      let user = await UserModel.findOne({ email: demoEmail });

      if (!user) {
        const passwordHash = await bcrypt.hash('DemoPass123!', 10);
        user = await UserModel.create({
          name: 'Alex Morgan',
          email: demoEmail,
          passwordHash,
          role: 'student',
          targetRoles: ['Full Stack Engineer', 'Frontend Developer', 'Software Engineer'],
          targetLocations: ['Remote', 'San Francisco, CA', 'New York, NY'],
          preferredComp: '$120,000 - $150,000',
          skills: ['React', 'TypeScript', 'Node.js', 'Express', 'MongoDB', 'CSS', 'TailwindCSS'],
          aiUsage: {
            monthlyTokensUsed: 14200,
            monthlyBudget: 200000,
            budgetResetAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          },
        });
        logger.info(`Seeded demo user account: ${demoEmail} / DemoPass123!`);
      }

      // 1. Seed or refresh rich sample applications with recruiter communications
      const appCount = await ApplicationModel.countDocuments({ userId: user._id, isDeleted: false });
      if (appCount === 0 || appCount < 5) {
        await ApplicationModel.deleteMany({ userId: user._id });
        const sampleApps = [
          {
            userId: user._id,
            company: 'Stripe',
            jobTitle: 'Software Engineer - New Grad',
            location: 'San Francisco, CA / Remote',
            status: 'interviewing',
            tailoredBullets: [
              'Architected high-throughput React dashboard components reducing telemetry latency by 35%.',
              'Engineered resilient webhook idempotency logic handling up to 15,000 events/sec in Node.js.',
            ],
            notes: [
              {
                content:
                  'Recruiter Call (Sarah Jenkins, Senior Talent Lead @ Stripe): "Very impressed with your distributed systems background. Moving forward to technical screen on Thursday 2 PM PST."',
                createdAt: new Date(Date.now() - 5 * 86400000),
              },
              {
                content:
                  'Technical Screen with Marcus (Staff Engineer): Passed! Feedback: Clean algorithm implementation and strong questions about Stripe API idempotency.',
                createdAt: new Date(Date.now() - 2 * 86400000),
              },
            ],
            followUpDate: new Date(Date.now() + 2 * 86400000),
            timeline: [
              { status: 'saved', date: new Date(Date.now() - 14 * 86400000), note: 'Discovered job posting via Stripe Engineering blog' },
              { status: 'applied', date: new Date(Date.now() - 10 * 86400000), note: 'Submitted application tailored with ATS Resume v2' },
              { status: 'interviewing', date: new Date(Date.now() - 5 * 86400000), note: 'Invited to Round 1 Technical Screen' },
            ],
          },
          {
            userId: user._id,
            company: 'Vercel',
            jobTitle: 'Full-Stack Developer Intern',
            location: 'Remote',
            status: 'offer',
            tailoredBullets: [
              'Developed open-source Next.js micro-framework plugins with TypeScript strict mode.',
              'Optimized edge runtime streaming responses reducing TTFB by 42%.',
            ],
            notes: [
              {
                content:
                  'Official Offer Received from Chloe Vance (University Lead @ Vercel): $55/hr ($114,400 annualized) + $5,000 relocation stipend + MacBook Pro M3 Max hardware kit.',
                createdAt: new Date(Date.now() - 1 * 86400000),
              },
              {
                content: 'Counter-proposal strategy drafted in JobWise Offer Matrix.',
                createdAt: new Date(),
              },
            ],
            timeline: [
              { status: 'saved', date: new Date(Date.now() - 30 * 86400000) },
              { status: 'applied', date: new Date(Date.now() - 24 * 86400000) },
              { status: 'interviewing', date: new Date(Date.now() - 14 * 86400000) },
              { status: 'offer', date: new Date(Date.now() - 1 * 86400000), note: 'Formal Offer Letter signed by VP of Talent' },
            ],
          },
          {
            userId: user._id,
            company: 'Datadog',
            jobTitle: 'Full Stack Engineer',
            location: 'New York, NY / Remote',
            status: 'interviewing',
            tailoredBullets: [
              'Architected high-throughput React dashboard components reducing telemetry latency by 35%.',
              'Integrated TypeScript with strict null checks across 40+ REST endpoints.',
            ],
            notes: [
              {
                content:
                  'Recruiter Note (Elena Rostova, Lead Talent Partner): "Super excited about your profile. Scheduled System Design round with Core Telemetry team."',
                createdAt: new Date(Date.now() - 4 * 86400000),
              },
            ],
            timeline: [
              { status: 'saved', date: new Date(Date.now() - 18 * 86400000) },
              { status: 'applied', date: new Date(Date.now() - 12 * 86400000) },
              { status: 'interviewing', date: new Date(Date.now() - 4 * 86400000) },
            ],
          },
          {
            userId: user._id,
            company: 'Linear',
            jobTitle: 'Frontend Engineer (React / TypeScript)',
            location: 'Remote',
            status: 'applied',
            tailoredBullets: ['Crafted accessible payment and task management UI components complying with WCAG 2.1 AA.'],
            notes: [
              {
                content:
                  'Application submitted via Linear referral portal. Recruiter: Marcus Zhao (Head of Talent @ Linear). Automated receipt acknowledged.',
                createdAt: new Date(Date.now() - 7 * 86400000),
              },
            ],
            timeline: [
              { status: 'saved', date: new Date(Date.now() - 10 * 86400000) },
              { status: 'applied', date: new Date(Date.now() - 7 * 86400000) },
            ],
          },
          {
            userId: user._id,
            company: 'Figma',
            jobTitle: 'Associate Product Engineer',
            location: 'San Francisco, CA / Remote',
            status: 'saved',
            tailoredBullets: [],
            notes: [
              {
                content:
                  'Recruiter outreach: Jessica Miller (Design Engineering Talent Partner) reached out on LinkedIn regarding early-career opening.',
                createdAt: new Date(Date.now() - 2 * 86400000),
              },
            ],
            timeline: [{ status: 'saved', date: new Date(Date.now() - 2 * 86400000) }],
          },
        ];

        await ApplicationModel.insertMany(sampleApps);
        logger.info(`Seeded ${sampleApps.length} sample applications for demo user.`);
      }

      // 2. Seed primary resume version if none exists
      const resumeCount = await ResumeModel.countDocuments({ userId: user._id, isDeleted: false });
      if (resumeCount === 0) {
        await ResumeModel.create({
          userId: user._id,
          fileName: 'alex_morgan_resume.pdf',
          fileKey: 'resumes/demo-resume.pdf',
          mimeType: 'application/pdf',
          fileSize: 1048576,
          parsedData: {
            basics: {
              name: 'Alex Morgan',
              email: 'demo@jobwise.ai',
              phone: '+1 (555) 234-5678',
              location: 'San Francisco, CA',
            },
            skills: ['React', 'TypeScript', 'Node.js', 'Express', 'MongoDB', 'Docker', 'REST APIs', 'Git', 'Next.js'],
            experience: [
              {
                company: 'TechCorp Labs',
                role: 'Software Engineering Intern',
                startDate: '2025-06',
                endDate: '2025-08',
                description: 'Built React microfrontends and Express 5 API endpoints.',
              },
            ],
            education: [
              {
                institution: 'State University',
                degree: 'B.S. in Computer Science',
                year: '2026',
              },
            ],
          },
          score: {
            overall: 88,
            impact: 90,
            brevity: 85,
            atsParseability: 92,
            actionableFeedback: [
              'Strong quantifiable metrics in experience bullets.',
              'Good keyword density for full-stack roles.',
            ],
          },
        });
        logger.info('Seeded primary ATS-optimized resume for demo user.');
      }

      // 3. Seed Freelance Gigs for demo user
      const gigCount = await FreelanceGigModel.countDocuments({ userId: user._id, isDeleted: false });
      if (gigCount === 0) {
        await FreelanceGigModel.insertMany([
          {
            userId: user._id,
            title: 'Full Stack React & Node Dashboard Development',
            client: 'FinFlow SaaS (US)',
            platform: 'Upwork',
            budget: '$3,200 Fixed',
            description: 'Build analytics charts, real-time webhook ingestion handlers, and user management portal in React & Express.',
            skills: ['React', 'Node.js', 'TypeScript', 'TailwindCSS', 'Recharts'],
            status: 'won',
            proposalDraft: 'Hi, I specialize in high-performance React and Node telemetry dashboards with clean architectural separation.',
          },
          {
            userId: user._id,
            title: 'Stripe Elements & Checkout Security Audit',
            client: 'Apex Retail',
            platform: 'Direct',
            budget: '$75 / hr',
            description: 'Audit checkout latency, upgrade to Stripe payment element, and implement idempotency retry headers.',
            skills: ['TypeScript', 'Stripe API', 'Node.js', 'Express'],
            status: 'in_discussion',
            proposalDraft: 'I have extensive experience deploying idempotent Stripe checkout flows complying with PCI-DSS guidelines.',
          },
          {
            userId: user._id,
            title: 'Mobile MVP with React Native & Supabase',
            client: 'HabitHero Startup',
            platform: 'Contra',
            budget: '$4,500 Fixed',
            description: 'Build cross-platform mobile app for iOS and Android with push notifications and social authentication.',
            skills: ['React Native', 'Supabase', 'TypeScript', 'TailwindCSS'],
            status: 'open',
          },
        ]);
        logger.info('Seeded 3 freelance gigs for demo user.');
      }

      // 4. Seed Interview Prep Sessions for demo user
      const prepCount = await InterviewPrepModel.countDocuments({ userId: user._id });
      if (prepCount === 0) {
        await InterviewPrepModel.create({
          userId: user._id,
          jobTitle: 'Software Engineer',
          company: 'Stripe',
          questions: [
            {
              id: 'q-1',
              type: 'behavioral',
              question: 'Tell me about a time you handled a difficult technical tradeoff under tight deadlines.',
              context: 'Assessing engineering maturity, STAR storytelling, and balance between speed and architectural debt.',
              userAnswers: [
                {
                  answer:
                    'At TechCorp Labs, we needed to ship our analytics portal before customer demo day. We chose optimistic UI updates with cached fallback instead of complex full-duplex WebSockets, cutting implementation time from 2 weeks to 3 days while meeting latency SLA.',
                  score: 92,
                  strengths: ['Clear Situation and Task definition', 'Quantified time savings from 2 weeks to 3 days', 'Focus on customer SLA'],
                  improvements: ['Could elaborate more on post-launch follow-up telemetry.'],
                  submittedAt: new Date(Date.now() - 2 * 86400000),
                },
              ],
            },
            {
              id: 'q-2',
              type: 'technical',
              question: 'How would you architect a distributed rate-limiter for high-volume payment APIs?',
              context: 'System design question evaluating Redis token bucket or sliding window counter architectures.',
              userAnswers: [
                {
                  answer:
                    'I would use a sliding window log or Redis token bucket algorithm executed via atomic Lua scripts to prevent race conditions across multi-region API gateways.',
                  score: 94,
                  strengths: ['Identified race condition mitigation via Redis Lua scripts', 'Knowledge of sliding window rate limiting'],
                  improvements: ['Mention fallback behavior when Redis cache nodes undergo failover.'],
                  submittedAt: new Date(Date.now() - 1 * 86400000),
                },
              ],
            },
          ],
        });
        logger.info('Seeded mock interview prep sessions for demo user.');
      }
    } catch (err) {
      logger.error('Error during demo seeding:', { error: err instanceof Error ? err.message : String(err) });
    }
  },
};
