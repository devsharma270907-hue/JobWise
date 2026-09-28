import { z } from 'zod';

export const updateProfileSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  targetRoles: z.array(z.string()).optional(),
  targetLocations: z.array(z.string()).optional(),
  preferredComp: z.string().optional(),
  skills: z.array(z.string()).optional(),
});

export const deleteAccountSchema = z.object({
  confirmationText: z.literal('DELETE MY ACCOUNT'),
});

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
export type DeleteAccountInput = z.infer<typeof deleteAccountSchema>;
