import { ApplicationModel, IApplication, ApplicationStatus } from './application.model.js';
import { CreateApplicationInput } from './application.schema.js';
import { assertOwnership, AppError } from '../../utils/ownershipCheck.js';
import { Types } from 'mongoose';

export class ApplicationService {
  async createApplication(userId: string, input: CreateApplicationInput): Promise<IApplication> {
    // Check duplicate application if jobId is provided
    if (input.jobId && Types.ObjectId.isValid(input.jobId)) {
      const existing = await ApplicationModel.findOne({
        userId,
        jobId: input.jobId,
        isDeleted: false,
      });
      if (existing) {
        throw new AppError(
          'An application for this job is already saved or tracked',
          409,
          'DUPLICATE_APPLICATION'
        );
      }
    }

    const application = new ApplicationModel({
      userId,
      jobId: input.jobId ? new Types.ObjectId(input.jobId) : undefined,
      jobTitle: input.jobTitle,
      company: input.company,
      location: input.location,
      status: input.status || 'saved',
      tailoredBullets: input.tailoredBullets,
      coverLetter: input.coverLetter,
      resumeVersionId: input.resumeVersionId ? new Types.ObjectId(input.resumeVersionId) : undefined,
      appliedAt: input.status === 'applied' ? new Date() : undefined,
      followUpDate: input.followUpDate ? new Date(input.followUpDate) : undefined,
      timeline: [
        {
          status: input.status || 'saved',
          date: new Date(),
          note: 'Application record initiated',
        },
      ],
    });

    return await application.save();
  }

  async listApplications(
    userId: string,
    status?: ApplicationStatus
  ): Promise<{ data: IApplication[]; countsByStatus: Record<string, number> }> {
    const filter: Record<string, unknown> = { userId, isDeleted: false };
    if (status) {
      filter.status = status;
    }

    const applications = await ApplicationModel.find(filter).sort({ updatedAt: -1 });

    const allUserApps = await ApplicationModel.find({ userId, isDeleted: false }, { status: 1 });
    const countsByStatus: Record<string, number> = {
      saved: 0,
      applied: 0,
      interviewing: 0,
      offer: 0,
      rejected: 0,
      withdrawn: 0,
    };

    for (const app of allUserApps) {
      if (countsByStatus[app.status] !== undefined) {
        countsByStatus[app.status] = (countsByStatus[app.status] || 0) + 1;
      }
    }

    return {
      data: applications,
      countsByStatus,
    };
  }

  async getApplicationById(userId: string, applicationId: string): Promise<IApplication> {
    return await assertOwnership(ApplicationModel, applicationId, userId);
  }

  async updateStatus(
    userId: string,
    applicationId: string,
    newStatus: ApplicationStatus,
    note?: string
  ): Promise<IApplication> {
    const application = await assertOwnership(ApplicationModel, applicationId, userId);

    application.status = newStatus;
    if (newStatus === 'applied' && !application.appliedAt) {
      application.appliedAt = new Date();
    }

    application.timeline.push({
      status: newStatus,
      date: new Date(),
      note: note || `Status updated to ${newStatus}`,
    });

    return await application.save();
  }

  async addNote(userId: string, applicationId: string, content: string): Promise<IApplication> {
    const application = await assertOwnership(ApplicationModel, applicationId, userId);
    application.notes.push({
      content,
      createdAt: new Date(),
    });
    return await application.save();
  }

  async deleteApplication(userId: string, applicationId: string): Promise<void> {
    const application = await assertOwnership(ApplicationModel, applicationId, userId);
    application.isDeleted = true;
    application.deletedAt = new Date();
    await application.save();
  }
}

export const applicationService = new ApplicationService();
