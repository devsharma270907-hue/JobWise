import { claudeClient } from './claudeClient.js';

export interface TailoringResult {
  tailoredBullets: string[];
  coverLetterDraft: string;
  modelVersion: string;
  generatedAt: string;
}

export class TailoringService {
  async tailorApplication(
    resumeSummary: string,
    resumeExperience: string,
    jobTitle: string,
    jobDescription: string,
    company: string,
    tone: string = 'concise',
    userId?: string
  ): Promise<TailoringResult> {
    const systemPrompt = `You are JobWise's expert AI Career Agent.
Your job is to tailor resume accomplishment bullets and compose a compelling cover letter draft specifically mapped to a given job description.
Tone: ${tone}. Focus on quantifiable achievements, direct keyword alignment, and genuine value proposition without hyperbole or fabrication.`;

    const prompt = `Tailor the candidate's application for the following job posting:
Company: ${company}
Job Title: ${jobTitle}
Job Description:
"""
${jobDescription}
"""

Candidate Profile:
Summary: ${resumeSummary}
Experience & Accomplishments:
"""
${resumeExperience}
"""

Return JSON format:
{
  "tailoredBullets": string[],
  "coverLetterDraft": string
}`;

    const { data, modelVersion } = await claudeClient.generateStructuredResponse<{
      tailoredBullets: string[];
      coverLetterDraft: string;
    }>(prompt, systemPrompt, userId);

    return {
      tailoredBullets: data.tailoredBullets || [],
      coverLetterDraft: data.coverLetterDraft || '',
      modelVersion,
      generatedAt: new Date().toISOString(),
    };
  }
}

export const tailoringService = new TailoringService();
