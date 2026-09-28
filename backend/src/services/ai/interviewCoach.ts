import { claudeClient } from './claudeClient.js';

export interface GeneratedQuestion {
  id: string;
  type: 'behavioral' | 'technical';
  question: string;
  context: string;
}

export interface AnswerEvaluation {
  score: number;
  strengths: string[];
  improvements: string[];
}

export class InterviewCoachService {
  async generateQuestions(
    jobTitle: string,
    company: string,
    description: string,
    userId?: string
  ): Promise<{ questions: GeneratedQuestion[]; modelVersion: string }> {
    const systemPrompt = `You are JobWise's expert AI Technical and Behavioral Interview Coach.
Generate 4-5 focused, role-specific interview questions mapped strictly to the given job description and company context.
Include both STAR-method behavioral scenarios and technical deep-dives.`;

    const prompt = `Generate interview questions for:
Role: ${jobTitle}
Company: ${company}
Job Description:
"""
${description}
"""

Return JSON format:
{
  "questions": [
    {
      "id": "q1",
      "type": "behavioral" | "technical",
      "question": string,
      "context": string
    }
  ]
}`;

    const { data, modelVersion } = await claudeClient.generateStructuredResponse<{
      questions: GeneratedQuestion[];
    }>(prompt, systemPrompt, userId);

    return {
      questions: data.questions || [],
      modelVersion,
    };
  }

  async evaluateAnswer(
    question: string,
    userAnswer: string,
    userId?: string
  ): Promise<{ evaluation: AnswerEvaluation; modelVersion: string }> {
    const systemPrompt = `You are JobWise's AI Interview Coach.
Evaluate the candidate's interview answer. Provide an objective score (0-100), concise strengths, and concrete suggestions for improvement (such as applying the STAR format: Situation, Task, Action, Result, or detailing technical metrics).`;

    const prompt = `Question:
"${question}"

Candidate's Answer:
"${userAnswer}"

Return JSON format:
{
  "score": number (0-100),
  "strengths": string[],
  "improvements": string[]
}`;

    const { data, modelVersion } = await claudeClient.generateStructuredResponse<AnswerEvaluation>(
      prompt,
      systemPrompt,
      userId
    );

    return {
      evaluation: data,
      modelVersion,
    };
  }
}

export const interviewCoachService = new InterviewCoachService();
