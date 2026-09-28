import { z } from 'zod';

export const createApplicationSchema = z.object({
  jobId: z.string().optional(),
  jobTitle: z.string().min(1, 'jobTitle is required'),
  company: z.string().min(1, 'company is required'),
  location: z.string().optional(),
  status: z
    .enum(['saved', 'applied', 'interviewing', 'offer', 'rejected', 'withdrawn'])
    .optional()
    .default('saved'),
  tailoredBullets: z.array(z.string()).optional().default([]),
  coverLetter: z.string().optional(),
  resumeVersionId: z.string().optional(),
  followUpDate: z.string().datetime().optional(),
});

export const updateApplicationStatusSchema = z.object({
  status: z.enum(['saved', 'applied', 'interviewing', 'offer', 'rejected', 'withdrawn']),
  note: z.string().optional(),
});

export const addNoteSchema = z.object({
  content: z.string().min(1, 'Note content cannot be empty'),
});

export type CreateApplicationInput = z.infer<typeof createApplicationSchema>;
export type UpdateApplicationStatusInput = z.infer<typeof updateApplicationStatusSchema>;
export type AddNoteInput = z.infer<typeof addNoteSchema>;
