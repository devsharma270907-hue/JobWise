import mongoose, { Document, Schema, Model } from 'mongoose';

export interface IRefreshToken {
  tokenHash: string;
  createdAt: Date;
  expiresAt: Date;
}

export interface IAIUsage {
  monthlyTokensUsed: number;
  monthlyBudget: number;
  budgetResetAt: Date;
}

export interface IUser extends Document {
  _id: mongoose.Types.ObjectId;
  name: string;
  email: string;
  passwordHash?: string;
  googleId?: string;
  role: 'student' | 'switcher' | 'freelancer' | 'admin';
  targetRoles: string[];
  targetLocations: string[];
  preferredComp?: string;
  skills: string[];
  refreshTokens: IRefreshToken[];
  failedLoginAttempts: number;
  lockUntil: Date | null;
  aiUsage: IAIUsage;
  isDeleted: boolean;
  deletedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

const refreshTokenSchema = new Schema<IRefreshToken>(
  {
    tokenHash: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
    expiresAt: { type: Date, required: true },
  },
  { _id: false }
);

const aiUsageSchema = new Schema<IAIUsage>(
  {
    monthlyTokensUsed: { type: Number, default: 0 },
    monthlyBudget: { type: Number, default: 200000 },
    budgetResetAt: {
      type: Date,
      default: () => {
        const nextMonth = new Date();
        nextMonth.setMonth(nextMonth.getMonth() + 1);
        return nextMonth;
      },
    },
  },
  { _id: false }
);

const userSchema = new Schema<IUser>(
  {
    name: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    passwordHash: { type: String },
    googleId: { type: String, sparse: true, index: true },
    role: {
      type: String,
      enum: ['student', 'switcher', 'freelancer', 'admin'],
      default: 'student',
    },
    targetRoles: { type: [String], default: [] },
    targetLocations: { type: [String], default: [] },
    preferredComp: { type: String },
    skills: { type: [String], default: [] },
    refreshTokens: { type: [refreshTokenSchema], default: [] },
    failedLoginAttempts: { type: Number, default: 0 },
    lockUntil: { type: Date, default: null },
    aiUsage: { type: aiUsageSchema, default: () => ({}) },
    isDeleted: { type: Boolean, default: false, index: true },
    deletedAt: { type: Date, default: null },
  },
  {
    timestamps: true,
  }
);

// Indexes
userSchema.index({ email: 1, isDeleted: 1 });

export const UserModel: Model<IUser> = mongoose.model<IUser>('User', userSchema);
