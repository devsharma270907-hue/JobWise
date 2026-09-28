import mongoose, { Document, Schema, Model } from 'mongoose';

export type GigStatus = 'open' | 'proposal_sent' | 'in_discussion' | 'won' | 'completed' | 'closed';

export interface IFreelanceGig extends Document {
  _id: mongoose.Types.ObjectId;
  userId?: mongoose.Types.ObjectId;
  title: string;
  client: string;
  platform: string;
  budget?: string;
  description: string;
  skills: string[];
  status: GigStatus;
  proposalDraft?: string;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const freelanceGigSchema = new Schema<IFreelanceGig>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', index: true },
    title: { type: String, required: true, trim: true },
    client: { type: String, required: true, trim: true },
    platform: { type: String, default: 'Direct' },
    budget: { type: String },
    description: { type: String, required: true },
    skills: { type: [String], default: [] },
    status: {
      type: String,
      enum: ['open', 'proposal_sent', 'in_discussion', 'won', 'completed', 'closed'],
      default: 'open',
    },
    proposalDraft: { type: String },
    isDeleted: { type: Boolean, default: false, index: true },
  },
  {
    timestamps: true,
  }
);

export const FreelanceGigModel: Model<IFreelanceGig> = mongoose.model<IFreelanceGig>(
  'FreelanceGig',
  freelanceGigSchema
);
