import { UserModel } from '../users/user.model.js';
import { JobModel } from '../jobs/job.model.js';
import { AppError } from '../../utils/ownershipCheck.js';

export interface SkillGapItem {
  skill: string;
  demandPercentage: number;
  priority: 'high' | 'medium' | 'low';
  suggestedProjects: string[];
  recommendedResources: Array<{ title: string; url: string }>;
}

export class SkillGapService {
  async analyzeGaps(userId: string): Promise<{
    userSkills: string[];
    targetRoles: string[];
    gapList: SkillGapItem[];
    matchingScore: number;
  }> {
    const user = await UserModel.findById(userId);
    if (!user) {
      throw new AppError('User not found', 404, 'NOT_FOUND');
    }

    const userSkills = user.skills || [];
    const targetRoles = user.targetRoles || [];
    const userSkillSet = new Set(userSkills.map((s) => s.toLowerCase().trim()));

    // Aggregate job postings for target roles
    const roleRegexes = targetRoles.map((r) => new RegExp(r, 'i'));
    const filter = roleRegexes.length > 0 ? { title: { $in: roleRegexes }, isDeleted: false } : { isDeleted: false };

    const matchingJobs = await JobModel.find(filter).limit(50);
    const skillCounts: Record<string, number> = {};

    for (const job of matchingJobs) {
      for (const skill of job.skills) {
        const normalized = skill.trim();
        if (normalized) {
          skillCounts[normalized] = (skillCounts[normalized] || 0) + 1;
        }
      }
    }

    const totalJobs = matchingJobs.length || 1;
    const gapList: SkillGapItem[] = [];
    let coveredCount = 0;
    let totalDemandCount = 0;

    for (const [skill, count] of Object.entries(skillCounts)) {
      totalDemandCount += count;
      const isOwned = userSkillSet.has(skill.toLowerCase());
      if (isOwned) {
        coveredCount += count;
      } else {
        const percentage = Math.round((count / totalJobs) * 100);
        const priority: 'high' | 'medium' | 'low' =
          percentage >= 40 ? 'high' : percentage >= 20 ? 'medium' : 'low';

        gapList.push({
          skill,
          demandPercentage: percentage,
          priority,
          suggestedProjects: [
            `Build a demo project featuring ${skill} to highlight on your resume.`,
            `Contribute an open-source PR or documentation update involving ${skill}.`,
          ],
          recommendedResources: [
            {
              title: `Official ${skill} Documentation & Guide`,
              url: `https://www.google.com/search?q=${encodeURIComponent(`${skill} documentation guide`)}`,
            },
            {
              title: `Interactive ${skill} Crash Course`,
              url: `https://www.google.com/search?q=${encodeURIComponent(`${skill} tutorial practical`)}`,
            },
          ],
        });
      }
    }

    // Sort gap list by priority and demand percentage
    gapList.sort((a, b) => b.demandPercentage - a.demandPercentage);

    const matchingScore = totalDemandCount > 0 ? Math.round((coveredCount / totalDemandCount) * 100) : 70;

    return {
      userSkills,
      targetRoles,
      gapList,
      matchingScore,
    };
  }
}

export const skillGapService = new SkillGapService();
