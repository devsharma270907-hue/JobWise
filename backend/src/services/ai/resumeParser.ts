import mammoth from 'mammoth';
import pdfParse from 'pdf-parse';
import { claudeClient } from './claudeClient.js';
import { AppError } from '../../utils/ownershipCheck.js';
import { logger } from '../../utils/logger.js';

export interface StructuredResume {
  contactInfo: {
    name: string;
    email: string;
    phone?: string;
    location?: string;
    links?: string[];
  };
  summary?: string;
  experience: Array<{
    company: string;
    role: string;
    location?: string;
    startDate?: string;
    endDate?: string;
    current?: boolean;
    bullets: string[];
    skills?: string[];
  }>;
  education: Array<{
    institution: string;
    degree: string;
    fieldOfStudy?: string;
    graduationDate?: string;
    gpa?: string;
  }>;
  skills: string[];
  projects: Array<{
    title: string;
    description: string;
    technologies: string[];
    link?: string;
  }>;
  score: {
    overall: number;
    impact: number;
    brevity: number;
    atsParseability: number;
    actionableFeedback: string[];
  };
}

export class ResumeParserService {
  async extractRawText(buffer: Buffer, mimeType: string): Promise<string> {
    try {
      if (mimeType === 'application/pdf') {
        const parsedPdf = await pdfParse(buffer);
        return parsedPdf.text || '';
      }

      if (
        mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
        mimeType === 'application/msword'
      ) {
        const result = await mammoth.extractRawText({ buffer });
        return result.value || '';
      }

      return buffer.toString('utf8');
    } catch (error) {
      logger.error('Failed to extract raw text from resume document', {
        error: error instanceof Error ? error.message : String(error),
      });
      throw new AppError(
        'Failed to read resume document. Please check the file format.',
        422,
        'RESUME_PARSE_FAILED'
      );
    }
  }

  async parseAndStructure(
    rawText: string,
    userId?: string
  ): Promise<{ data: StructuredResume; tokensUsed: number; modelVersion: string }> {
    if (!rawText || rawText.trim().length < 50) {
      throw new AppError(
        'Resume contains insufficient text for analysis',
        422,
        'RESUME_PARSE_FAILED'
      );
    }

    const systemPrompt = `You are JobWise's expert AI Career Agent and Resume Analyst.
Your task is to parse unstructured resume text into a clean, complete, structured JSON schema, and evaluate the resume on ATS parseability, quantifiable impact, and brevity.
Generate constructive, actionable feedback points tailored to the candidate.`;

    const prompt = `Parse resume text and return structured JSON.
Resume text:
"""
${rawText}
"""

Required JSON Schema:
{
  "contactInfo": { "name": string, "email": string, "phone": string, "location": string, "links": string[] },
  "summary": string,
  "experience": [
    { "company": string, "role": string, "location": string, "startDate": string, "endDate": string, "current": boolean, "bullets": string[], "skills": string[] }
  ],
  "education": [
    { "institution": string, "degree": string, "fieldOfStudy": string, "graduationDate": string, "gpa": string }
  ],
  "skills": string[],
  "projects": [
    { "title": string, "description": string, "technologies": string[], "link": string }
  ],
  "score": {
    "overall": number (0-100),
    "impact": number (0-100),
    "brevity": number (0-100),
    "atsParseability": number (0-100),
    "actionableFeedback": string[]
  }
}`;

    return await claudeClient.generateStructuredResponse<StructuredResume>(prompt, systemPrompt, userId);
  }
}

export const resumeParserService = new ResumeParserService();
