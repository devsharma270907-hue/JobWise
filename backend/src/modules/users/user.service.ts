import { UserModel, IUser } from './user.model.js';
import { UpdateProfileInput, DeleteAccountInput } from './user.schema.js';
import { AppError } from '../../utils/ownershipCheck.js';
import { ResumeModel } from '../resumes/resume.model.js';
import { ApplicationModel } from '../applications/application.model.js';
import { InterviewPrepModel } from '../interviewPrep/interviewPrep.model.js';
import { logger } from '../../utils/logger.js';

export class UserService {
  async getProfile(userId: string): Promise<IUser> {
    const user = await UserModel.findOne({ _id: userId, isDeleted: false }).select(
      '-passwordHash -refreshTokens'
    );
    if (!user) {
      throw new AppError('User not found', 404, 'NOT_FOUND');
    }
    return user;
  }

  async updateProfile(userId: string, input: UpdateProfileInput): Promise<IUser> {
    const user = await UserModel.findOneAndUpdate(
      { _id: userId, isDeleted: false },
      { $set: input },
      { new: true, runValidators: true }
    ).select('-passwordHash -refreshTokens');

    if (!user) {
      throw new AppError('User not found', 404, 'NOT_FOUND');
    }

    return user;
  }

  async exportUserData(userId: string): Promise<Record<string, unknown>> {
    const user = await UserModel.findById(userId).select('-passwordHash -refreshTokens');
    if (!user || user.isDeleted) {
      throw new AppError('User not found', 404, 'NOT_FOUND');
    }

    const resumes = await ResumeModel.find({ userId, isDeleted: false });
    const applications = await ApplicationModel.find({ userId, isDeleted: false });
    const interviewPreps = await InterviewPrepModel.find({ userId });

    return {
      exportedAt: new Date().toISOString(),
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        skills: user.skills,
        targetRoles: user.targetRoles,
        targetLocations: user.targetLocations,
        preferredComp: user.preferredComp,
        createdAt: user.createdAt,
      },
      resumes: resumes.map((r) => ({
        id: r._id,
        fileName: r.fileName,
        parsedData: r.parsedData,
        score: r.score,
        createdAt: r.createdAt,
      })),
      applications: applications.map((a) => ({
        id: a._id,
        jobTitle: a.jobTitle,
        company: a.company,
        status: a.status,
        tailoredBullets: a.tailoredBullets,
        coverLetter: a.coverLetter,
        timeline: a.timeline,
        appliedAt: a.appliedAt,
      })),
      interviewPreps: interviewPreps.map((i) => ({
        id: i._id,
        jobTitle: i.jobTitle,
        company: i.company,
        questions: i.questions,
        createdAt: i.createdAt,
      })),
    };
  }

  async deleteUserAccount(userId: string, input: DeleteAccountInput): Promise<void> {
    if (input.confirmationText !== 'DELETE MY ACCOUNT') {
      throw new AppError('Confirmation text mismatch', 400, 'CONFIRM_TEXT_MISMATCH');
    }

    const user = await UserModel.findById(userId);
    if (!user || user.isDeleted) {
      throw new AppError('User not found', 404, 'NOT_FOUND');
    }

    // Soft delete user record and revoke active sessions
    user.isDeleted = true;
    user.deletedAt = new Date();
    user.refreshTokens = [];
    await user.save();

    // Cascade soft delete to resumes and applications
    await ResumeModel.updateMany({ userId }, { $set: { isDeleted: true, deletedAt: new Date() } });
    await ApplicationModel.updateMany({ userId }, { $set: { isDeleted: true, deletedAt: new Date() } });

    logger.info('User account deleted and data cascade executed', { userId });
  }
}

export const userService = new UserService();
