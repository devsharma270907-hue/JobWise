export interface MatchResult {
  fitScore: number;
  matchedSkills: string[];
  missingSkills: string[];
  rationale: string;
}

export class JobMatcherService {
  computeMatch(
    candidateSkills: string[],
    jobSkills: string[],
    candidateRolePreference?: string[],
    jobTitle?: string
  ): MatchResult {
    const candidateSet = new Set(candidateSkills.map((s) => s.toLowerCase().trim()));
    const normalizedJobSkills = jobSkills.map((s) => s.trim());

    const matched: string[] = [];
    const missing: string[] = [];

    for (const skill of normalizedJobSkills) {
      if (candidateSet.has(skill.toLowerCase())) {
        matched.push(skill);
      } else {
        missing.push(skill);
      }
    }

    const totalRequired = normalizedJobSkills.length || 1;
    let baseScore = Math.round((matched.length / totalRequired) * 100);

    // Boost if candidate's target roles match job title
    if (candidateRolePreference && jobTitle) {
      const titleLower = jobTitle.toLowerCase();
      const hasRoleMatch = candidateRolePreference.some((role) =>
        titleLower.includes(role.toLowerCase())
      );
      if (hasRoleMatch) {
        baseScore = Math.min(100, baseScore + 15);
      }
    }

    const fitScore = Math.min(100, Math.max(10, baseScore));

    let rationale = '';
    if (matched.length > 0 && missing.length > 0) {
      rationale = `Matches your ${matched.slice(0, 3).join(', ')} experience; missing: ${missing.slice(0, 2).join(', ')}.`;
    } else if (matched.length > 0) {
      rationale = `Strong alignment with your core skills: ${matched.slice(0, 4).join(', ')}.`;
    } else {
      rationale = `Entry opportunity; requires building experience with ${missing.slice(0, 3).join(', ')}.`;
    }

    return {
      fitScore,
      matchedSkills: matched,
      missingSkills: missing,
      rationale,
    };
  }
}

export const jobMatcherService = new JobMatcherService();
