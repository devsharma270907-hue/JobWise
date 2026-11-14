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
    salaryRange: '$125,000 - $145,000',
    description:
      'Join Stripe product infrastructure. You will design, build, and deploy reliable financial APIs handling billions of dollars in daily transactions with rigorous safety guarantees.',
    requirements: [
      'Proficiency in TypeScript, JavaScript, or Java/Go',
      'Solid foundations in distributed systems, REST APIs, and database fundamentals',
      'Strong problem-solving and algorithmic thinking',
    ],
    skills: ['TypeScript', 'JavaScript', 'Node.js', 'React', 'MongoDB', 'Docker', 'REST APIs'],
    externalUrl: 'https://www.linkedin.com/jobs/view/stripe-software-engineer-new-grad',
    recruiter: {
      name: 'Sarah Jenkins',
      title: 'Senior Technical Recruiter @ Stripe',
      email: 'sarah.jenkins@stripe.com',
      linkedInUrl: 'https://www.linkedin.com/in/sarah-jenkins-stripe',
    },
    source: 'feed',
  },
  {
    title: 'Frontend Engineer (React / TypeScript)',
    company: 'Linear',
    location: 'Remote',
    remote: true,
    jobType: 'full-time',
    experienceLevel: 'mid',
    salaryRange: '$135,000 - $160,000',
    description:
      'Linear builds software tools that streamline modern software development. We are seeking a frontend engineer passionate about high-fidelity user experiences, micro-interactions, and keyboard-first design.',
    requirements: [
      '2+ years experience building complex client-side applications with React and TypeScript',
      'Deep understanding of browser performance, state synchronization, and modern CSS',
      'Meticulous attention to aesthetic detail and fluid animations',
    ],
    skills: ['React', 'TypeScript', 'CSS', 'TanStack Query', 'State Management', 'Web Performance'],
    externalUrl: 'https://www.linkedin.com/jobs/view/linear-frontend-engineer',
    recruiter: {
      name: 'Marcus Zhao',
      title: 'Head of Engineering Talent @ Linear',
      email: 'marcus.zhao@linear.app',
      linkedInUrl: 'https://www.linkedin.com/in/marcus-zhao-linear',
    },
    source: 'feed',
  },
  {
    title: 'Full-Stack Developer Intern',
    company: 'Vercel',
    location: 'Remote',
    remote: true,
    jobType: 'internship',
    experienceLevel: 'entry',
    salaryRange: '$48 - $58 / hr ($100,000 annualized)',
    description:
      'Join Vercel as a full-stack engineering intern. You will collaborate on core Next.js developer workflow features, Turbopack optimizations, and open-source tooling.',
    requirements: [
      'Currently enrolled in CS, Software Engineering, or related technical degree',
      'Familiarity with Next.js, Node.js, and TypeScript',
      'Passion for developer tooling, serverless architectures, and web ecosystems',
    ],
    skills: ['React', 'Node.js', 'TypeScript', 'Next.js', 'Git', 'CI/CD'],
    externalUrl: 'https://www.linkedin.com/jobs/view/vercel-fullstack-intern',
    recruiter: {
      name: 'Chloe Vance',
      title: 'University & Early Career Lead @ Vercel',
      email: 'chloe.vance@vercel.com',
      linkedInUrl: 'https://www.linkedin.com/in/chloe-vance-talent',
    },
    source: 'feed',
  },
  {
    title: 'Backend Engineer - AI Developer Platform',
    company: 'Anthropic',
    location: 'San Francisco, CA / Hybrid',
    remote: false,
    jobType: 'full-time',
    experienceLevel: 'mid',
    salaryRange: '$165,000 - $195,000',
    description:
      'Help scale AI developer platform backend services for Claude. You will build high-reliability ingestion pipelines, manage rate-limiting subsystems, and optimize inference routing.',
    requirements: [
      'Demonstrated experience building scalable backend microservices with Node.js/Python',
      'Experience with PostgreSQL or MongoDB at scale',
      'Understanding of LLM tool-calling, embeddings, and vector databases',
    ],
    skills: ['Node.js', 'TypeScript', 'MongoDB', 'Vector Databases', 'Express', 'Redis', 'Docker'],
    externalUrl: 'https://www.linkedin.com/jobs/view/anthropic-backend-ai-engineer',
    recruiter: {
      name: 'Dr. Julian Hayes',
      title: 'Senior AI Systems Sourcer @ Anthropic',
      email: 'julian.hayes@anthropic.com',
      linkedInUrl: 'https://www.linkedin.com/in/julian-hayes-ai',
    },
    source: 'feed',
  },
  {
    title: 'Associate Product Engineer',
    company: 'Figma',
    location: 'San Francisco, CA / Remote',
    remote: true,
    jobType: 'full-time',
    experienceLevel: 'entry',
    salaryRange: '$130,000 - $155,000',
    description:
      'Build collaborative tools for millions of designers and engineers. You will build responsive canvas workflows, design system libraries, and real-time multiplayer features.',
    requirements: [
      'Strong mastery of modern JavaScript/TypeScript and web standards',
      'Passion for developer-designer workflows and accessible UI components',
      'Solid computer science fundamentals and data structure fluency',
    ],
    skills: ['TypeScript', 'React', 'Canvas API', 'WebGL', 'CSS', 'Figma API'],
    externalUrl: 'https://www.linkedin.com/jobs/view/figma-associate-product-engineer',
    recruiter: {
      name: 'Jessica Miller',
      title: 'Design Engineering Talent Partner @ Figma',
      email: 'jessica.miller@figma.com',
      linkedInUrl: 'https://www.linkedin.com/in/jessica-miller-figma',
    },
    source: 'feed',
  },
  {
    title: 'Cloud Infrastructure Engineer',
    company: 'Datadog',
    location: 'New York, NY / Remote',
    remote: true,
    jobType: 'full-time',
    experienceLevel: 'mid',
    salaryRange: '$140,000 - $170,000',
    description:
      'Scale Datadog telemetry ingestion clusters across AWS, GCP, and Azure. Develop automated service meshes, observability pipelines, and Kubernetes deployment controllers.',
    requirements: [
      'Experience with Kubernetes, Docker, and cloud infrastructure as code (Terraform)',
      'Backend systems development in Go, Python, or Node.js',
      'Understanding of high-throughput streaming architectures (Kafka, gRPC)',
    ],
    skills: ['Kubernetes', 'Docker', 'AWS', 'Go', 'Node.js', 'Terraform', 'Observability'],
    externalUrl: 'https://www.linkedin.com/jobs/view/datadog-cloud-infrastructure',
    recruiter: {
      name: 'Elena Rostova',
      title: 'Lead Technical Recruiter @ Datadog',
      email: 'elena.rostova@datadog.com',
      linkedInUrl: 'https://www.linkedin.com/in/elena-rostova-datadog',
    },
    source: 'feed',
  },
  {
    title: 'Full Stack Engineer - Workspaces & Blocks',
    company: 'Notion',
    location: 'San Francisco, CA / Remote',
    remote: true,
    jobType: 'full-time',
    experienceLevel: 'mid',
    salaryRange: '$145,000 - $175,000',
    description:
      'Shape the future of workspace productivity. You will engineer block-based document trees, offline synchronization engines, and AI-assisted workspace actions.',
    requirements: [
      'Deep fluency with React, TypeScript, and modern browser rendering pipelines',
      'Experience building rich text editors or complex collaborative state machines',
      'Pragmatic approach to shipping user-facing software',
    ],
    skills: ['React', 'TypeScript', 'Node.js', 'PostgreSQL', 'State Machines', 'WebSockets'],
    externalUrl: 'https://www.linkedin.com/jobs/view/notion-full-stack-workspaces',
    recruiter: {
      name: 'Alex Rivera',
      title: 'Senior Talent Partner @ Notion',
      email: 'a.rivera@notion.so',
      linkedInUrl: 'https://www.linkedin.com/in/alex-rivera-notion',
    },
    source: 'feed',
  },
  {
    title: 'Platform & DevOps Engineer',
    company: 'GitHub',
    location: 'Remote',
    remote: true,
    jobType: 'full-time',
    experienceLevel: 'entry',
    salaryRange: '$125,000 - $150,000',
    description:
      'Empower 100+ million developers by maintaining high-availability GitHub Actions runners, CI/CD telemetry, and containerized deployment infrastructure.',
    requirements: [
      'Familiarity with GitHub Actions, Linux system administration, and shell scripting',
      'Understanding of containerization (Docker) and cloud deployments (Azure/AWS)',
      'Eagerness to learn production SRE practices and incident management',
    ],
    skills: ['GitHub Actions', 'Docker', 'Linux', 'Bash', 'TypeScript', 'CI/CD', 'Azure'],
    externalUrl: 'https://www.linkedin.com/jobs/view/github-platform-devops-engineer',
    recruiter: {
      name: 'Liam O’Connor',
      title: 'Staff Technical Recruiter @ GitHub / Microsoft',
      email: 'liam.oconnor@github.com',
      linkedInUrl: 'https://www.linkedin.com/in/liam-oconnor-github',
    },
    source: 'feed',
  },
  {
    title: 'Machine Learning / AI Platform Engineer',
    company: 'OpenAI',
    location: 'San Francisco, CA / Hybrid',
    remote: false,
    jobType: 'full-time',
    experienceLevel: 'mid',
    salaryRange: '$170,000 - $210,000',
    description:
      'Train and serve state-of-the-art multimodal foundation models. Develop low-latency inference runtimes, distributed GPU scheduling clusters, and high-throughput vector indexers.',
    requirements: [
      'Proficiency in Python, PyTorch, and CUDA performance optimization',
      'Experience with distributed systems, GPU cluster orchestration, and Ray/Kubernetes',
      'Solid foundations in deep learning architectures and transformers',
    ],
    skills: ['Python', 'PyTorch', 'FastAPI', 'Docker', 'Kubernetes', 'CUDA', 'Vector Databases'],
    externalUrl: 'https://www.linkedin.com/jobs/view/openai-ml-platform-engineer',
    recruiter: {
      name: 'Dr. Evelyn Reed',
      title: 'Principal AI Talent Partner @ OpenAI',
      email: 'evelyn.reed@openai.com',
      linkedInUrl: 'https://www.linkedin.com/in/evelyn-reed-openai',
    },
    source: 'feed',
  },
  {
    title: 'Mobile Application Engineer (React Native)',
    company: 'Coinbase',
    location: 'Remote',
    remote: true,
    jobType: 'full-time',
    experienceLevel: 'mid',
    salaryRange: '$135,000 - $165,000',
    description:
      'Architect cryptographic transaction flows, hardware wallet bridges, and lightning-fast charting widgets across iOS and Android on a unified React Native architecture.',
    requirements: [
      '2+ years building production mobile apps in React Native and TypeScript',
      'Experience with native iOS (Swift) or Android (Kotlin) module bridging',
      'Knowledge of offline caching, state management, and biometric security',
    ],
    skills: ['React Native', 'TypeScript', 'iOS', 'Android', 'Redux', 'REST APIs', 'Mobile Security'],
    externalUrl: 'https://www.linkedin.com/jobs/view/coinbase-mobile-engineer',
    recruiter: {
      name: 'Marcus Bell',
      title: 'Senior Mobile Engineering Recruiter @ Coinbase',
      email: 'marcus.bell@coinbase.com',
      linkedInUrl: 'https://www.linkedin.com/in/marcus-bell-coinbase',
    },
    source: 'feed',
  },
  {
    title: 'Distributed Systems & Edge Engineer (Go)',
    company: 'Cloudflare',
    location: 'Austin, TX / Remote',
    remote: true,
    jobType: 'full-time',
    experienceLevel: 'mid',
    salaryRange: '$140,000 - $170,000',
    description:
      'Work on Cloudflare Workers edge network. Build high-concurrency proxies, DDoS mitigation heuristics, and low-latency DNS resolvers handling 55+ million HTTP requests per second.',
    requirements: [
      'Hands-on experience in Go, Rust, or C/C++ in networked Linux environments',
      'Deep understanding of TCP/IP, TLS, HTTP/2, and HTTP/3 protocols',
      'Experience optimizing memory allocations and concurrency primitives (goroutines/channels)',
    ],
    skills: ['Go', 'Distributed Systems', 'Rust', 'Linux', 'Docker', 'PostgreSQL', 'Networking'],
    externalUrl: 'https://www.linkedin.com/jobs/view/cloudflare-edge-engineer',
    recruiter: {
      name: 'Nadia Petrova',
      title: 'Staff Systems Recruiter @ Cloudflare',
      email: 'n.petrova@cloudflare.com',
      linkedInUrl: 'https://www.linkedin.com/in/nadia-petrova-cloudflare',
    },
    source: 'feed',
  },
  {
    title: 'Frontend UI/UX Design Technologist',
    company: 'Airbnb',
    location: 'San Francisco, CA / Remote',
    remote: true,
    jobType: 'full-time',
    experienceLevel: 'entry',
    salaryRange: '$130,000 - $155,000',
    description:
      'Bridge product design and core web engineering. Prototype interactive guest reservation flows, advance accessible web components, and maintain Airbnb’s unified design system.',
    requirements: [
      'Fluency with modern React, TypeScript, and semantic HTML5 accessibility standards (ARIA)',
      'Expertise in CSS architecture, responsive layout mathematics, and SVG animation',
      'Passionate about visual design hierarchy and micro-interactions',
    ],
    skills: ['React', 'TypeScript', 'CSS', 'Accessibility', 'Design Systems', 'HTML5', 'Figma'],
    externalUrl: 'https://www.linkedin.com/jobs/view/airbnb-frontend-design-technologist',
    recruiter: {
      name: 'Hannah Brooks',
      title: 'Design Technology Talent Lead @ Airbnb',
      email: 'hannah.brooks@airbnb.com',
      linkedInUrl: 'https://www.linkedin.com/in/hannah-brooks-airbnb',
    },
    source: 'feed',
  },
  {
    title: 'Data Platform & Pipeline Engineer',
    company: 'Snowflake',
    location: 'San Mateo, CA / Remote',
    remote: true,
    jobType: 'full-time',
    experienceLevel: 'mid',
    salaryRange: '$145,000 - $175,000',
    description:
      'Engineer robust real-time batch and streaming ETL pipelines. Build analytical data lakes, optimize SQL warehousing schemas, and automate data quality validation.',
    requirements: [
      'Experience in Python, SQL, and distributed compute frameworks (Spark/Flink)',
      'Familiarity with Kafka streaming and workflow orchestrators (Airflow/Prefect)',
      'Experience designing star and snowflake warehouse schemas for multi-tenant analytics',
    ],
    skills: ['Python', 'SQL', 'Apache Spark', 'Kafka', 'AWS', 'Docker', 'Data Modeling'],
    externalUrl: 'https://www.linkedin.com/jobs/view/snowflake-data-platform-engineer',
    recruiter: {
      name: 'Devon Patel',
      title: 'Lead Data Infrastructure Recruiter @ Snowflake',
      email: 'devon.patel@snowflake.com',
      linkedInUrl: 'https://www.linkedin.com/in/devon-patel-snowflake',
    },
    source: 'feed',
  },
  {
    title: 'Security & Cryptography Software Engineer',
    company: '1Password',
    location: 'Remote',
    remote: true,
    jobType: 'full-time',
    experienceLevel: 'mid',
    salaryRange: '$140,000 - $165,000',
    description:
      'Secure passwords, biometrics, and cryptographic secrets for 100,000+ businesses. Implement zero-knowledge protocols, WebAuthn passkey synchronizers, and end-to-end encrypted vaults.',
    requirements: [
      'Proficiency in Rust, TypeScript, or Node.js',
      'Solid theoretical knowledge of public-key cryptography (RSA, ECC, ChaCha20, Argon2)',
      'Commitment to secure coding practices and threat modeling methodologies',
    ],
    skills: ['Rust', 'TypeScript', 'Node.js', 'Cryptography', 'WebAuthn', 'Docker', 'Security'],
    externalUrl: 'https://www.linkedin.com/jobs/view/1password-security-engineer',
    recruiter: {
      name: 'Simon Tremblay',
      title: 'Security & Systems Recruiter @ 1Password',
      email: 'simon.tremblay@1password.com',
      linkedInUrl: 'https://www.linkedin.com/in/simon-tremblay-1password',
    },
    source: 'feed',
  },
  {
    title: 'Product Engineer (Merchant Core & Checkout)',
    company: 'Shopify',
    location: 'Remote',
    remote: true,
    jobType: 'full-time',
    experienceLevel: 'entry',
    salaryRange: '$120,000 - $145,000',
    description:
      'Empower millions of independent entrepreneurs worldwide. Build checkout customization extensions, order routing logic, and high-availability merchant dashboard interfaces.',
    requirements: [
      'Experience building web applications with Ruby on Rails, TypeScript, or React',
      'Knowledge of relational database queries (MySQL / PostgreSQL) and caching (Redis)',
      'Strong empathy for small business owners and merchant user journeys',
    ],
    skills: ['Ruby', 'TypeScript', 'React', 'GraphQL', 'MySQL', 'Node.js', 'REST APIs'],
    externalUrl: 'https://www.linkedin.com/jobs/view/shopify-product-engineer',
    recruiter: {
      name: 'Claire Dubois',
      title: 'Early Career Engineering Recruiter @ Shopify',
      email: 'claire.dubois@shopify.com',
      linkedInUrl: 'https://www.linkedin.com/in/claire-dubois-shopify',
    },
    source: 'feed',
  },
  {
    title: 'Site Reliability Engineer (SRE & Cloud)',
    company: 'Netflix',
    location: 'Los Gatos, CA / Remote',
    remote: true,
    jobType: 'full-time',
    experienceLevel: 'mid',
    salaryRange: '$160,000 - $190,000',
    description:
      'Ensure 99.999% availability for 260+ million streaming members worldwide. Manage Kubernetes clusters across multiple AWS availability zones, conduct chaos experiments, and build automated canary rollouts.',
    requirements: [
      'Demonstrated experience managing AWS infrastructure as code (Terraform)',
      'Expertise with container orchestration (Kubernetes) and telemetry metrics (Prometheus/Grafana)',
      'Proficiency scripting in Python, Go, or Bash for automated incident remediation',
    ],
    skills: ['Kubernetes', 'AWS', 'Python', 'Go', 'Terraform', 'Prometheus', 'Linux'],
    externalUrl: 'https://www.linkedin.com/jobs/view/netflix-site-reliability-engineer',
    recruiter: {
      name: 'Travis Sterling',
      title: 'Staff SRE Talent Partner @ Netflix',
      email: 'tsterling@netflix.com',
      linkedInUrl: 'https://www.linkedin.com/in/travis-sterling-netflix',
    },
    source: 'feed',
  },
  {
    title: 'Full-Stack Developer (Edge & PostgreSQL)',
    company: 'Supabase',
    location: 'Remote',
    remote: true,
    jobType: 'full-time',
    experienceLevel: 'mid',
    salaryRange: '$135,000 - $160,000',
    description:
      'Build the open-source Firebase alternative. Develop real-time database change listener webhooks, row-level security (RLS) policies, and Next.js developer portal tools.',
    requirements: [
      'Experience in full-stack TypeScript, Node.js, and PostgreSQL',
      'Understanding of PostgreSQL extensions, indexing, and connection pooling (PgBouncer)',
      'Familiarity with open-source development and modern Jamstack workflows',
    ],
    skills: ['TypeScript', 'Node.js', 'PostgreSQL', 'React', 'Next.js', 'Docker', 'REST APIs'],
    externalUrl: 'https://www.linkedin.com/jobs/view/supabase-fullstack-developer',
    recruiter: {
      name: 'Antti Nieminen',
      title: 'Developer Platform Recruiter @ Supabase',
      email: 'antti@supabase.com',
      linkedInUrl: 'https://www.linkedin.com/in/antti-nieminen-supabase',
    },
    source: 'feed',
  },
  {
    title: 'QA Automation & SDET Engineer',
    company: 'Atlassian',
    location: 'Remote',
    remote: true,
    jobType: 'full-time',
    experienceLevel: 'entry',
    salaryRange: '$115,000 - $138,000',
    description:
      'Champion engineering quality across Jira and Confluence cloud suites. Architect end-to-end browser automation suites with Playwright, performance regression tests, and automated CI pipelines.',
    requirements: [
      'Proficiency writing automation suites in TypeScript or JavaScript with Playwright / Cypress',
      'Experience testing REST APIs and asynchronous webhooks with Postman or Jest',
      'Familiarity with CI/CD pipelines (GitHub Actions, Bitbucket Pipelines)',
    ],
    skills: ['TypeScript', 'Playwright', 'Jest', 'CI/CD', 'Docker', 'REST APIs', 'Postman'],
    externalUrl: 'https://www.linkedin.com/jobs/view/atlassian-qa-automation-sdet',
    recruiter: {
      name: 'Rachel Adams',
      title: 'Technical Quality Recruiter @ Atlassian',
      email: 'radams@atlassian.com',
      linkedInUrl: 'https://www.linkedin.com/in/rachel-adams-atlassian',
    },
    source: 'feed',
  },
  {
    title: 'Associate Backend Engineer (Java / Microservices)',
    company: 'DoorDash',
    location: 'San Francisco, CA / Hybrid',
    remote: false,
    jobType: 'full-time',
    experienceLevel: 'entry',
    salaryRange: '$125,000 - $145,000',
    description:
      'Power logistics routing and delivery dispatch algorithms. Build fault-tolerant Spring Boot microservices, Kafka event queues, and MySQL storage layers handling peak dinner order surges.',
    requirements: [
      'Foundational CS fluency in Java, Kotlin, or C#',
      'Knowledge of REST API conventions, relational database schemas, and caching',
      'Eagerness to learn distributed event-driven systems and microservice architectures',
    ],
    skills: ['Java', 'Spring Boot', 'MySQL', 'Kafka', 'Docker', 'REST APIs', 'Git'],
    externalUrl: 'https://www.linkedin.com/jobs/view/doordash-associate-backend-engineer',
    recruiter: {
      name: 'Brandon Cole',
      title: 'University & Early Career Recruiter @ DoorDash',
      email: 'bcole@doordash.com',
      linkedInUrl: 'https://www.linkedin.com/in/brandon-cole-doordash',
    },
    source: 'feed',
  },
  {
    title: 'Technical Product Manager (Developer Workflows)',
    company: 'Linear',
    location: 'Remote',
    remote: true,
    jobType: 'full-time',
    experienceLevel: 'mid',
    salaryRange: '$140,000 - $170,000',
    description:
      'Lead product specifications for project roadmaps, cycle planning, and GitHub/GitLab integrations. Write crisp specifications, prioritize developer feedback, and guide engineering sprints.',
    requirements: [
      '2+ years in technical product management or software engineering',
      'Experience with SQL queries, metric instrumentation, and agile methodologies',
      'Deep understanding of modern software development life cycles and developer tooling',
    ],
    skills: ['Product Management', 'Agile', 'SQL', 'Scrum', 'Jira', 'Figma', 'Git'],
    externalUrl: 'https://www.linkedin.com/jobs/view/linear-technical-product-manager',
    recruiter: {
      name: 'Marcus Zhao',
      title: 'Head of Engineering & Product Talent @ Linear',
      email: 'marcus.zhao@linear.app',
      linkedInUrl: 'https://www.linkedin.com/in/marcus-zhao-linear',
    },
    source: 'feed',
  },
];

export class JobFeedService {
  async seedIfEmpty(): Promise<void> {
    try {
      const count = await JobModel.countDocuments();
      if (count < INITIAL_SEED_JOBS.length) {
        logger.info('Refreshing curated job and internship listings with recruiter metadata...');
        // Clean out stale initial records and populate complete synthetic tech job feed
        await JobModel.deleteMany({ source: 'feed' });
        await JobModel.insertMany(INITIAL_SEED_JOBS);
        logger.info(`Successfully populated ${INITIAL_SEED_JOBS.length} realistic job listings with recruiter info`);
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
