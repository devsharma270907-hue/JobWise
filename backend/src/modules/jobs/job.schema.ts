import { z } from 'zod';

export const createJobSchema = z.object({
  title: z.string().min(2).max(200),
  company: z.string().min(1).max(200),
  location: z.string().min(1).max(200),
  remote: z.boolean().optional().default(false),
  jobType: z.enum(['full-time', 'internship', 'contract', 'part-time']).optional().default('full-time'),
  experienceLevel: z.enum(['entry', 'mid', 'senior']).optional().default('entry'),
  salaryRange: z.string().optional(),
  description: z.string().min(10),
  requirements: z.array(z.string()).optional().default([]),
  skills: z.array(z.string()).optional().default([]),
  externalUrl: z.string().url().optional(),
});

export const queryJobsSchema = z.object({
  search: z.string().optional(),
  role: z.string().optional(),
  location: z.string().optional(),
  remote: z.string().transform((v) => v === 'true').optional(),
  jobType: z.string().optional(),
  page: z.string().transform(Number).optional().default('1'),
  limit: z.string().transform(Number).optional().default('20'),
});

export const tailorJobSchema = z.object({
  resumeVersionId: z.string().min(1, 'resumeVersionId is required'),
  tone: z.enum(['concise', 'detailed', 'formal']).optional().default('concise'),
});

export type CreateJobInput = z.infer<typeof createJobSchema>;
export type QueryJobsInput = z.infer<typeof queryJobsSchema>;
export type TailorJobInput = z.infer<typeof tailorJobSchema>;
