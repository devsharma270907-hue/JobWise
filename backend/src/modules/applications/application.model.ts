import mongoose, { Document, Schema, Model } from 'mongoose';

export type ApplicationStatus =
  | 'saved'
  | 'applied'
  | 'interviewing'
  | 'offer'
  | 'rejected'
  | 'withdrawn';

export interface ITimelineEvent {
  status: ApplicationStatus;
  date: Date;
  note?: string;
}

export interface IApplicationNote {
  content: string;
  createdAt: Date;
}

export interface IApplication extends Document {
  _id: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  jobId?: mongoose.Types.ObjectId;
  jobTitle: string;
  company: string;
  location?: string;
  status: ApplicationStatus;
  tailoredBullets: string[];
  coverLetter?: string;
  resumeVersionId?: mongoose.Types.ObjectId;
  appliedAt?: Date;
  timeline: ITimelineEvent[];
  notes: IApplicationNote[];
  followUpDate?: Date;
  isDeleted: boolean;
  deletedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

const timelineSchema = new Schema<ITimelineEvent>(
  {
    status: {
      type: String,
      enum: ['saved', 'applied', 'interviewing', 'offer', 'rejected', 'withdrawn'],
      required: true,
    },
    date: { type: Date, default: Date.now },
    note: { type: String },
  },
  { _id: false }
);

const noteSchema = new Schema<IApplicationNote>(
  {
    content: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

const applicationSchema = new Schema<IApplication>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    jobId: { type: Schema.Types.ObjectId, ref: 'Job', index: true },
    jobTitle: { type: String, required: true, trim: true },
    company: { type: String, required: true, trim: true },
    location: { type: String },
    status: {
      type: String,
      enum: ['saved', 'applied', 'interviewing', 'offer', 'rejected', 'withdrawn'],
      default: 'saved',
      index: true,
    },
    tailoredBullets: { type: [String], default: [] },
    coverLetter: { type: String },
    resumeVersionId: { type: Schema.Types.ObjectId, ref: 'Resume' },
    appliedAt: { type: Date },
    timeline: { type: [timelineSchema], default: [] },
    notes: { type: [noteSchema], default: [] },
    followUpDate: { type: Date },
    isDeleted: { type: Boolean, default: false, index: true },
    deletedAt: { type: Date, default: null },
  },
  {
    timestamps: true,
  }
);

applicationSchema.index({ userId: 1, jobId: 1, isDeleted: 1 });

export const ApplicationModel: Model<IApplication> = mongoose.model<IApplication>(
  'Application',
  applicationSchema
);
