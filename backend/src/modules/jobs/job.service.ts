import { JobModel, IJob } from './job.model.js';
import { CreateJobInput, QueryJobsInput, TailorJobInput } from './job.schema.js';
import { jobMatcherService, MatchResult } from '../../services/ai/jobMatcher.js';
import { tailoringService, TailoringResult } from '../../services/ai/tailoring.js';
import { ResumeModel } from '../resumes/resume.model.js';
import { UserModel } from '../users/user.model.js';
import { assertOwnership, AppError } from '../../utils/ownershipCheck.js';

export interface EnrichedJob extends Record<string, unknown> {
  job: IJob;
  match?: MatchResult;
}

export class JobService {
  async queryJobs(
    input: QueryJobsInput,
    userId?: string
  ): Promise<{ data: EnrichedJob[]; total: number; page: number; limit: number; totalPages: number }> {
    const filter: Record<string, unknown> = { isDeleted: false };

    if (input.search) {
      filter.$text = { $search: input.search };
    }
    if (input.location) {
      filter.location = { $regex: input.location, $options: 'i' };
    }
    if (input.remote !== undefined) {
      filter.remote = input.remote;
    }
    if (input.jobType) {
      filter.jobType = input.jobType;
    }

    const page = input.page || 1;
    const limit = input.limit || 20;
    const skip = (page - 1) * limit;

    const [jobs, total] = await Promise.all([
      JobModel.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
      JobModel.countDocuments(filter),
    ]);

    // If user is logged in, enrich with personalized fit matching
    let userSkills: string[] = [];
    let userTargetRoles: string[] = [];

    if (userId) {
      const [user, latestResume] = await Promise.all([
        UserModel.findById(userId),
        ResumeModel.findOne({ userId, isDeleted: false }).sort({ createdAt: -1 }),
      ]);
      const skillSet = new Set<string>();
      if (user?.skills) {
        user.skills.forEach((s) => skillSet.add(s));
      }
      if (latestResume?.parsedData?.skills) {
        latestResume.parsedData.skills.forEach((s) => skillSet.add(s));
      }
      userSkills = Array.from(skillSet);
      if (user?.targetRoles) {
        userTargetRoles = user.targetRoles;
      }
    }

    const enriched: EnrichedJob[] = jobs.map((job) => {
      let match: MatchResult | undefined;
      if (userSkills.length > 0 || userTargetRoles.length > 0) {
        match = jobMatcherService.computeMatch(
          userSkills,
          job.skills,
          userTargetRoles,
          job.title
        );
      }
      return {
        job,
        match,
      };
    });

    // If matches computed, sort by fitScore descending
    if (userSkills.length > 0) {
      enriched.sort((a, b) => (b.match?.fitScore || 0) - (a.match?.fitScore || 0));
    }

    return {
      data: enriched,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit) || 1,
    };
  }

  async getJobById(jobId: string, userId?: string): Promise<EnrichedJob> {
    const job = await JobModel.findOne({ _id: jobId, isDeleted: false });
    if (!job) {
      throw new AppError('Job not found', 404, 'NOT_FOUND');
    }

    let match: MatchResult | undefined;
    if (userId) {
      const user = await UserModel.findById(userId);
      if (user && user.skills.length > 0) {
        match = jobMatcherService.computeMatch(
          user.skills,
          job.skills,
          user.targetRoles,
          job.title
        );
      }
    }

    return { job, match };
  }

  async createJob(input: CreateJobInput): Promise<IJob> {
    const job = new JobModel(input);
    return await job.save();
  }

  async tailorForJob(
    userId: string,
    jobId: string,
    input: TailorJobInput
  ): Promise<TailoringResult> {
    const job = await JobModel.findOne({ _id: jobId, isDeleted: false });
    if (!job) {
      throw new AppError('Job not found', 404, 'NOT_FOUND');
    }

    // Verify resume ownership
    const resume = await assertOwnership(ResumeModel, input.resumeVersionId, userId);

    const summary = resume.parsedData?.summary || 'Experienced software professional';
    const experienceText = (resume.parsedData?.experience || [])
      .map((e) => `${e.role} at ${e.company}: ${e.bullets.join(' ')}`)
      .join('\n');

    return await tailoringService.tailorApplication(
      summary,
      experienceText,
      job.title,
      job.description,
      job.company,
      input.tone,
      userId
    );
  }
}

export const jobService = new JobService();
