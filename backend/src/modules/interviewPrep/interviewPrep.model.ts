import mongoose, { Document, Schema, Model } from 'mongoose';

export interface IUserAnswer {
  answer: string;
  score: number;
  strengths: string[];
  improvements: string[];
  submittedAt: Date;
}

export interface IPrepQuestion {
  id: string;
  type: 'behavioral' | 'technical';
  question: string;
  context: string;
  userAnswers: IUserAnswer[];
}

export interface IInterviewPrep extends Document {
  _id: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  jobId?: mongoose.Types.ObjectId;
  jobTitle: string;
  company: string;
  questions: IPrepQuestion[];
  createdAt: Date;
  updatedAt: Date;
}

const userAnswerSchema = new Schema<IUserAnswer>(
  {
    answer: { type: String, required: true },
    score: { type: Number, required: true },
    strengths: { type: [String], default: [] },
    improvements: { type: [String], default: [] },
    submittedAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

const prepQuestionSchema = new Schema<IPrepQuestion>(
  {
    id: { type: String, required: true },
    type: { type: String, enum: ['behavioral', 'technical'], required: true },
    question: { type: String, required: true },
    context: { type: String, required: true },
    userAnswers: { type: [userAnswerSchema], default: [] },
  },
  { _id: false }
);

const interviewPrepSchema = new Schema<IInterviewPrep>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    jobId: { type: Schema.Types.ObjectId, ref: 'Job' },
    jobTitle: { type: String, required: true },
    company: { type: String, required: true },
    questions: { type: [prepQuestionSchema], default: [] },
  },
  {
    timestamps: true,
  }
);

export const InterviewPrepModel: Model<IInterviewPrep> = mongoose.model<IInterviewPrep>(
  'InterviewPrep',
  interviewPrepSchema
);
