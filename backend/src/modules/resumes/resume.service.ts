import { ResumeModel, IResume } from './resume.model.js';
import { storageService } from '../../services/storage/storage.service.js';
import { resumeParserService } from '../../services/ai/resumeParser.js';
import { UserModel } from '../users/user.model.js';
import { assertOwnership } from '../../utils/ownershipCheck.js';
import { logger } from '../../utils/logger.js';

export class ResumeService {
  async uploadAndParse(
    userId: string,
    file: Express.Multer.File
  ): Promise<{ resume: IResume; modelVersion: string; generatedAt: string }> {
    // 1. Store encrypted file
    const saved = await storageService.saveFile(file);

    // 2. Extract text
    const rawText = await resumeParserService.extractRawText(file.buffer, file.mimetype);

    // 3. Structure with AI
    const { data: structured, modelVersion } = await resumeParserService.parseAndStructure(
      rawText,
      userId
    );

    // 4. Save to database
    const resume = new ResumeModel({
      userId,
      fileName: saved.originalName,
      fileKey: saved.fileKey,
      mimeType: saved.mimeType,
      fileSize: saved.size,
      parsedData: structured,
      score: structured.score,
    });

    await resume.save();

    // 5. Update user profile skills if present
    if (structured.skills && structured.skills.length > 0) {
      await UserModel.findByIdAndUpdate(userId, {
        $addToSet: { skills: { $each: structured.skills } },
      });
    }

    logger.info('Resume parsed and saved successfully', {
      resumeId: resume._id.toString(),
      userId,
    });

    return {
      resume,
      modelVersion,
      generatedAt: new Date().toISOString(),
    };
  }

  async listUserResumes(
    userId: string,
    page: number = 1,
    limit: number = 20
  ): Promise<{ data: IResume[]; total: number; page: number; limit: number; totalPages: number }> {
    const skip = (page - 1) * limit;
    const [data, total] = await Promise.all([
      ResumeModel.find({ userId, isDeleted: false })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      ResumeModel.countDocuments({ userId, isDeleted: false }),
    ]);

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit) || 1,
    };
  }

  async getResumeById(userId: string, resumeId: string): Promise<IResume> {
    return await assertOwnership(ResumeModel, resumeId, userId);
  }

  async deleteResume(userId: string, resumeId: string): Promise<void> {
    const resume = await assertOwnership(ResumeModel, resumeId, userId);
    resume.isDeleted = true;
    resume.deletedAt = new Date();
    await resume.save();

    // Delete encrypted storage file
    await storageService.deleteFile(resume.fileKey);
  }
}

export const resumeService = new ResumeService();
