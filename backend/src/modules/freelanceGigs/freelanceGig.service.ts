import { FreelanceGigModel, IFreelanceGig, GigStatus } from './freelanceGig.model.js';
import { CreateGigInput } from './freelanceGig.schema.js';
import { UserModel } from '../users/user.model.js';
import { claudeClient } from '../../services/ai/claudeClient.js';
import { AppError } from '../../utils/ownershipCheck.js';

export class FreelanceGigService {
  async listGigs(userId?: string, status?: GigStatus): Promise<IFreelanceGig[]> {
    const filter: Record<string, unknown> = { isDeleted: false };
    if (status) {
      filter.status = status;
    }
    if (userId) {
      filter.$or = [{ userId }, { userId: { $exists: false } }];
    }
    return await FreelanceGigModel.find(filter).sort({ createdAt: -1 });
  }

  async getGigById(gigId: string): Promise<IFreelanceGig> {
    const gig = await FreelanceGigModel.findOne({ _id: gigId, isDeleted: false });
    if (!gig) {
      throw new AppError('Gig not found', 404, 'NOT_FOUND');
    }
    return gig;
  }

  async createGig(userId: string, input: CreateGigInput): Promise<IFreelanceGig> {
    const gig = new FreelanceGigModel({
      ...input,
      userId,
    });
    return await gig.save();
  }

  async draftPitch(
    userId: string,
    gigId: string,
    tone: string = 'persuasive'
  ): Promise<{ proposalDraft: string; modelVersion: string }> {
    const gig = await this.getGigById(gigId);
    const user = await UserModel.findById(userId);

    const userSkills = user?.skills.join(', ') || 'Full-Stack Development';
    const systemPrompt = `You are JobWise's expert Freelance Proposal and Pitch Specialist.
Draft a high-converting, professional, tailored freelance proposal.
Highlight relevant skills, address client requirements directly, and propose actionable next steps.
Tone: ${tone}.`;

    const prompt = `Draft proposal for freelance project:
Title: ${gig.title}
Client: ${gig.client}
Budget: ${gig.budget || 'Open'}
Project Scope:
"""
${gig.description}
"""

Freelancer Skills & Background:
${userSkills}

Return JSON format:
{
  "proposalDraft": string
}`;

    const { data, modelVersion } = await claudeClient.generateStructuredResponse<{
      proposalDraft: string;
    }>(prompt, systemPrompt, userId);

    gig.proposalDraft = data.proposalDraft;
    gig.status = 'proposal_sent';
    await gig.save();

    return {
      proposalDraft: data.proposalDraft,
      modelVersion,
    };
  }

  async updateStatus(gigId: string, status: GigStatus): Promise<IFreelanceGig> {
    const gig = await this.getGigById(gigId);
    gig.status = status;
    return await gig.save();
  }
}

export const freelanceGigService = new FreelanceGigService();
