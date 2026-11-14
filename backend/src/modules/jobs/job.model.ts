import mongoose, { Document, Schema, Model } from 'mongoose';

export interface IRecruiterInfo {
  name: string;
  title: string;
  email?: string;
  linkedInUrl?: string;
  avatarUrl?: string;
}

export interface IJob extends Document {
  _id: mongoose.Types.ObjectId;
  title: string;
  company: string;
  location: string;
  remote: boolean;
  jobType: 'full-time' | 'internship' | 'contract' | 'part-time';
  experienceLevel: 'entry' | 'mid' | 'senior';
  salaryRange?: string;
  description: string;
  requirements: string[];
  skills: string[];
  externalUrl?: string;
  recruiter?: IRecruiterInfo;
  source: 'feed' | 'user' | 'partner';
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const jobSchema = new Schema<IJob>(
  {
    title: { type: String, required: true, trim: true, index: true },
    company: { type: String, required: true, trim: true, index: true },
    location: { type: String, required: true, trim: true },
    remote: { type: Boolean, default: false },
    jobType: {
      type: String,
      enum: ['full-time', 'internship', 'contract', 'part-time'],
      default: 'full-time',
    },
    experienceLevel: {
      type: String,
      enum: ['entry', 'mid', 'senior'],
      default: 'entry',
    },
    salaryRange: { type: String },
    description: { type: String, required: true },
    requirements: { type: [String], default: [] },
    skills: { type: [String], default: [], index: true },
    externalUrl: { type: String },
    recruiter: {
      name: { type: String },
      title: { type: String },
      email: { type: String },
      linkedInUrl: { type: String },
      avatarUrl: { type: String },
    },
    source: { type: String, enum: ['feed', 'user', 'partner'], default: 'feed' },
    isDeleted: { type: Boolean, default: false, index: true },
  },
  {
    timestamps: true,
  }
);

// Full text search index on title, company, description, and skills
jobSchema.index({
  title: 'text',
  company: 'text',
  description: 'text',
  skills: 'text',
});

export const JobModel: Model<IJob> = mongoose.model<IJob>('Job', jobSchema);
