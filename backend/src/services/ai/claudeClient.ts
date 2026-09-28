import Anthropic from '@anthropic-ai/sdk';
import { env } from '../../config/env.js';
import { logger } from '../../utils/logger.js';
import { UserModel } from '../../modules/users/user.model.js';

class ClaudeClient {
  private client: Anthropic | null = null;

  constructor() {
    if (env.ANTHROPIC_API_KEY && env.ANTHROPIC_API_KEY !== 'mock_dev_key') {
      this.client = new Anthropic({
        apiKey: env.ANTHROPIC_API_KEY,
      });
    }
  }

  async generateStructuredResponse<T>(
    prompt: string,
    systemPrompt: string,
    userId?: string
  ): Promise<{ data: T; tokensUsed: number; modelVersion: string }> {
    const modelVersion = env.AI_MODEL_DEFAULT;

    // Use mock fallback if Anthropic client is not configured
    if (!this.client) {
      logger.info('Using local AI mock engine (no external API key provided)');
      const mockResult = this.getMockResponse<T>(prompt);
      return {
        data: mockResult,
        tokensUsed: 150,
        modelVersion: `${modelVersion}-dev-mock`,
      };
    }

    try {
      const response = await this.client.messages.create({
        model: modelVersion,
        max_tokens: 3000,
        system: `${systemPrompt}\n\nCRITICAL: Respond ONLY with valid, raw JSON. Do NOT include markdown code blocks, backticks, or any conversational text.`,
        messages: [
          {
            role: 'user',
            content: prompt,
          },
        ],
      });

      const textBlock = response.content.find((c) => c.type === 'text');
      const text = textBlock ? textBlock.text : '{}';

      // Clean response in case LLM wrapped it in ```json ... ```
      const cleaned = text.replace(/```json/gi, '').replace(/```/g, '').trim();
      const parsedData = JSON.parse(cleaned) as T;

      const tokensUsed = (response.usage?.input_tokens || 0) + (response.usage?.output_tokens || 0);

      // Track usage on user record if userId provided
      if (userId) {
        await UserModel.findByIdAndUpdate(userId, {
          $inc: { 'aiUsage.monthlyTokensUsed': tokensUsed },
        });
      }

      return {
        data: parsedData,
        tokensUsed,
        modelVersion,
      };
    } catch (error) {
      logger.error('Error invoking Anthropic Claude API', {
        error: error instanceof Error ? error.message : String(error),
      });
      // Graceful fallback to avoid leaving the user on a broken screen per PRD Section 10.4
      const fallback = this.getMockResponse<T>(prompt);
      return {
        data: fallback,
        tokensUsed: 0,
        modelVersion: `${modelVersion}-fallback`,
      };
    }
  }

  private getMockResponse<T>(prompt: string): T {
    const lower = prompt.toLowerCase();

    // 1. Resume parsing
    if (lower.includes('parse resume') || lower.includes('resume text')) {
      return {
        contactInfo: {
          name: 'Alex Johnson',
          email: 'alex.johnson@example.com',
          phone: '+1 (555) 234-5678',
          location: 'San Francisco, CA',
          links: ['https://linkedin.com/in/alexjohnson', 'https://github.com/alexj'],
        },
        summary: 'Full-Stack Software Engineer with 2+ years experience building scalable web applications with TypeScript, React, and Node.js.',
        experience: [
          {
            company: 'TechCorp Solutions',
            role: 'Junior Full-Stack Engineer',
            location: 'San Francisco, CA',
            startDate: '2023-01',
            endDate: 'Present',
            current: true,
            bullets: [
              'Architected RESTful microservices with Node.js and Express handling 50k+ daily active users.',
              'Revamped frontend search experience in React and TypeScript, increasing user retention by 18%.',
            ],
            skills: ['Node.js', 'Express', 'React', 'TypeScript', 'MongoDB'],
          },
        ],
        education: [
          {
            institution: 'University of California, Berkeley',
            degree: 'Bachelor of Science',
            fieldOfStudy: 'Computer Science',
            graduationDate: '2023-05',
            gpa: '3.8',
          },
        ],
        skills: ['TypeScript', 'JavaScript', 'Node.js', 'Express', 'React', 'MongoDB', 'Docker', 'Git'],
        projects: [
          {
            title: 'CloudCollab',
            description: 'Real-time collaborative document editor with WebSocket synchronization.',
            technologies: ['React', 'Node.js', 'Socket.io', 'Redis'],
            link: 'https://github.com/alexj/cloudcollab',
          },
        ],
        score: {
          overall: 82,
          impact: 85,
          brevity: 80,
          atsParseability: 90,
          actionableFeedback: [
            'Quantify the performance outcomes of your RESTful API refactor with specific latency benchmarks.',
            'Include cloud deployment experience (e.g. AWS or Docker containerization) explicitly in the experience section.',
            'Target keywords like CI/CD, Kubernetes, and GraphQL to improve ATS matching for Senior roles.',
          ],
        },
      } as unknown as T;
    }

    // 2. Tailoring
    if (lower.includes('tailor') || lower.includes('cover letter')) {
      return {
        tailoredBullets: [
          'Engineered resilient, high-throughput Node.js/TypeScript backend services, exceeding 99.9% uptime SLA.',
          'Built modern, responsive React web components optimized for accessibility and core web vitals.',
          'Spearheaded MongoDB query optimizations, reducing p95 database query latency by 35%.',
        ],
        coverLetterDraft: `Dear Hiring Team,\n\nI am thrilled to submit my application for this role. With my background in TypeScript, React, and Node.js backend development, I have proven experience delivering performant, user-centric software solutions. In my previous role, I engineered microservices serving tens of thousands of users and optimized database latency by 35%.\n\nI am excited by your company's mission and would love the opportunity to contribute to your engineering team.\n\nSincerely,\nCandidate`,
      } as unknown as T;
    }

    // 3. Interview Evaluation
    if (lower.includes('candidate\'s answer') || lower.includes('evaluate') || lower.includes('score": number')) {
      return {
        score: 88,
        strengths: ['Clear explanation of the problem context', 'Strong technical rationale for chosen solution with optimistic locking'],
        improvements: ['Elaborate more on how you measured the business outcome', 'Mention monitoring tools like APM or logs used to verify resolution'],
      } as unknown as T;
    }

    // 4. Interview Questions Generation
    if (lower.includes('interview') || lower.includes('generate interview questions')) {
      return {
        questions: [
          {
            id: 'q1',
            type: 'technical',
            question: 'How do you handle race conditions or concurrent writes in a distributed MongoDB architecture?',
            context: 'Assesses backend concurrency control and database design capability.',
          },
          {
            id: 'q2',
            type: 'behavioral',
            question: 'Tell me about a time you identified a critical production performance bottleneck. How did you diagnose and resolve it?',
            context: 'STAR-method question assessing debugging methodology and composure under pressure.',
          },
        ],
      } as unknown as T;
    }

    // 5. Freelance Pitch / Proposal
    if (lower.includes('proposal') || lower.includes('pitch') || lower.includes('freelance')) {
      return {
        proposalDraft: 'Dear Client,\n\nI reviewed your project requirements and would love to assist. With extensive hands-on experience in TypeScript, Node.js, and MongoDB, I have engineered multiple scalable analytics pipelines and high-performance microservices. I look forward to discussing the milestones and delivering exceptional results for your project.\n\nBest regards,\nFull-Stack Engineer',
      } as unknown as T;
    }

    // Fallback default
    return {
      result: 'Processed successfully',
      rationale: 'Matches role requirements based on skills and experience profile.',
    } as unknown as T;
  }
}

export const claudeClient = new ClaudeClient();
