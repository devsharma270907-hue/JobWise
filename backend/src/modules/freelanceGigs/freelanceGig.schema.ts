import { z } from 'zod';

export const createGigSchema = z.object({
  title: z.string().min(2).max(200),
  client: z.string().min(1).max(200),
  platform: z.string().optional().default('Direct'),
  budget: z.string().optional(),
  description: z.string().min(10),
  skills: z.array(z.string()).optional().default([]),
});

export const draftPitchSchema = z.object({
  tone: z.enum(['persuasive', 'technical', 'concise']).optional().default('persuasive'),
});

export const updateGigStatusSchema = z.object({
  status: z.enum(['open', 'proposal_sent', 'in_discussion', 'won', 'completed', 'closed']),
});

export type CreateGigInput = z.infer<typeof createGigSchema>;
export type DraftPitchInput = z.infer<typeof draftPitchSchema>;
export type UpdateGigStatusInput = z.infer<typeof updateGigStatusSchema>;
