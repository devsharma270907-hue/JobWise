import { InterviewPrepModel, IInterviewPrep } from './interviewPrep.model.js';
import { GenerateInterviewPrepInput, EvaluateInterviewAnswerInput } from './interviewPrep.schema.js';
import { interviewCoachService, AnswerEvaluation } from '../../services/ai/interviewCoach.js';
import { assertOwnership, AppError } from '../../utils/ownershipCheck.js';
import { Types } from 'mongoose';

export class InterviewPrepService {
  async generatePrep(
    userId: string,
    input: GenerateInterviewPrepInput
  ): Promise<{ session: IInterviewPrep; modelVersion: string }> {
    const { questions, modelVersion } = await interviewCoachService.generateQuestions(
      input.jobTitle,
      input.company,
      input.description,
      userId
    );

    const session = new InterviewPrepModel({
      userId,
      jobId: input.jobId && Types.ObjectId.isValid(input.jobId) ? new Types.ObjectId(input.jobId) : undefined,
      jobTitle: input.jobTitle,
      company: input.company,
      questions: questions.map((q) => ({
        id: q.id,
        type: q.type,
        question: q.question,
        context: q.context,
        userAnswers: [],
      })),
    });

    await session.save();

    return { session, modelVersion };
  }

  async evaluateAnswer(
    userId: string,
    sessionId: string,
    input: EvaluateInterviewAnswerInput
  ): Promise<{ evaluation: AnswerEvaluation; questionId: string; modelVersion: string }> {
    const session = await assertOwnership(InterviewPrepModel, sessionId, userId);

    const question = session.questions.find((q) => q.id === input.questionId);
    if (!question) {
      throw new AppError('Question not found in this prep session', 404, 'NOT_FOUND');
    }

    const { evaluation, modelVersion } = await interviewCoachService.evaluateAnswer(
      question.question,
      input.answer,
      userId
    );

    question.userAnswers.push({
      answer: input.answer,
      score: evaluation.score,
      strengths: evaluation.strengths,
      improvements: evaluation.improvements,
      submittedAt: new Date(),
    });

    await session.save();

    return {
      evaluation,
      questionId: input.questionId,
      modelVersion,
    };
  }

  async getSession(userId: string, sessionId: string): Promise<IInterviewPrep> {
    return await assertOwnership(InterviewPrepModel, sessionId, userId);
  }

  async listUserSessions(userId: string): Promise<IInterviewPrep[]> {
    return await InterviewPrepModel.find({ userId }).sort({ createdAt: -1 });
  }
}

export const interviewPrepService = new InterviewPrepService();
