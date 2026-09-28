import { z } from 'zod';

export const generateInterviewPrepSchema = z.object({
  jobId: z.string().optional(),
  jobTitle: z.string().min(1, 'jobTitle is required'),
  company: z.string().min(1, 'company is required'),
  description: z.string().min(10, 'job description is required'),
});

export const evaluateInterviewAnswerSchema = z.object({
  questionId: z.string().min(1, 'questionId is required'),
  answer: z.string().min(5, 'answer must be at least 5 characters'),
});

export type GenerateInterviewPrepInput = z.infer<typeof generateInterviewPrepSchema>;
export type EvaluateInterviewAnswerInput = z.infer<typeof evaluateInterviewAnswerSchema>;
