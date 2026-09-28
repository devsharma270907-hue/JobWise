import { JobModel } from '../modules/jobs/job.model.js';
import { logger } from '../utils/logger.js';

const INITIAL_SEED_JOBS = [
  {
    title: 'Software Engineer - New Grad',
    company: 'Stripe',
    location: 'San Francisco, CA / Remote',
    remote: true,
    jobType: 'full-time',
    experienceLevel: 'entry',
    salaryRange: '$120,000 - $145,000',
    description:
      'We are looking for motivated new graduate software engineers to join Stripe infrastructure and product teams. You will design, build, and deploy reliable financial APIs.',
    requirements: [
      'Proficiency in TypeScript, JavaScript, or Java/Go',
      'Solid foundations in distributed systems, REST APIs, and database fundamentals',
      'Strong problem-solving and algorithmic thinking',
    ],
    skills: ['TypeScript', 'JavaScript', 'Node.js', 'React', 'MongoDB', 'Docker', 'REST APIs'],
    source: 'feed',
  },
  {
    title: 'Frontend Engineer (React/TypeScript)',
    company: 'Linear',
    location: 'Remote',
    remote: true,
    jobType: 'full-time',
    experienceLevel: 'mid',
    salaryRange: '$130,000 - $160,000',
    description:
      'Linear builds software tools that streamline software project management. We are seeking a frontend engineer passionate about high-fidelity user experiences and micro-interactions.',
    requirements: [
      '2+ years experience building complex client-side applications with React and TypeScript',
      'Deep understanding of browser performance, state management, and modern CSS',
      'Attention to aesthetic detail and fluid animations',
    ],
    skills: ['React', 'TypeScript', 'CSS', 'TanStack Query', 'State Management', 'Web Performance'],
    source: 'feed',
  },
  {
    title: 'Full-Stack Developer Intern',
    company: 'Vercel',
    location: 'Remote',
    remote: true,
    jobType: 'internship',
    experienceLevel: 'entry',
    salaryRange: '$45 - $55 / hr',
    description:
      'Join Vercel as a full-stack engineering intern. You will collaborate on core developer workflow features and open-source tooling.',
    requirements: [
      'Currently enrolled in CS, Software Engineering, or related technical degree',
      'Familiarity with Next.js, Node.js, and TypeScript',
      'Passion for developer tooling and web ecosystems',
    ],
    skills: ['React', 'Node.js', 'TypeScript', 'Next.js', 'Git', 'CI/CD'],
    source: 'feed',
  },
  {
    title: 'Backend Engineer - AI Applications',
    company: 'Anthropic',
    location: 'San Francisco, CA',
    remote: false,
    jobType: 'full-time',
    experienceLevel: 'mid',
    salaryRange: '$150,000 - $185,000',
    description:
      'Help scale AI developer platform backend services. You will build high-reliability ingestion pipelines, manage rate-limiting subsystems, and optimize inference routing.',
    requirements: [
      'Demonstrated experience building scalable backend microservices with Node.js/Python',
      'Experience with PostgreSQL or MongoDB at scale',
      'Understanding of LLM tool-calling, embeddings, and vector databases',
    ],
    skills: ['Node.js', 'TypeScript', 'MongoDB', 'Vector Databases', 'Express', 'Redis', 'Docker'],
    source: 'feed',
  },
];

export class JobFeedService {
  async seedIfEmpty(): Promise<void> {
    try {
      const count = await JobModel.countDocuments();
      if (count === 0) {
        logger.info('Seeding initial curated job and internship listings...');
        await JobModel.insertMany(INITIAL_SEED_JOBS);
        logger.info(`Successfully seeded ${INITIAL_SEED_JOBS.length} jobs`);
      }
    } catch (error) {
      logger.error('Failed to seed initial job listings', {
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }

  async pollAndIngest(): Promise<void> {
    logger.info('Running scheduled job feed sync...');
    // Real partner feed ingestion placeholder / scheduler hook
  }
}

export const jobFeedService = new JobFeedService();
