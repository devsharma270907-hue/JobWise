import mongoose, { Document, Schema, Model } from 'mongoose';
import { StructuredResume } from '../../services/ai/resumeParser.js';

export interface IResume extends Document {
  _id: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  fileName: string;
  fileKey: string;
  mimeType: string;
  fileSize: number;
  parsedData: StructuredResume;
  score: {
    overall: number;
    impact: number;
    brevity: number;
    atsParseability: number;
    actionableFeedback: string[];
  };
  embedding?: number[];
  isDeleted: boolean;
  deletedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

const resumeSchema = new Schema<IResume>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    fileName: { type: String, required: true },
    fileKey: { type: String, required: true },
    mimeType: { type: String, required: true },
    fileSize: { type: Number, required: true },
    parsedData: { type: Schema.Types.Mixed, required: true },
    score: {
      overall: { type: Number, default: 0 },
      impact: { type: Number, default: 0 },
      brevity: { type: Number, default: 0 },
      atsParseability: { type: Number, default: 0 },
      actionableFeedback: { type: [String], default: [] },
    },
    embedding: { type: [Number], select: false },
    isDeleted: { type: Boolean, default: false, index: true },
    deletedAt: { type: Date, default: null },
  },
  {
    timestamps: true,
  }
);

resumeSchema.index({ userId: 1, isDeleted: 1 });

export const ResumeModel: Model<IResume> = mongoose.model<IResume>('Resume', resumeSchema);
