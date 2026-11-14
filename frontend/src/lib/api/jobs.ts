import { useQuery } from '@tanstack/react-query';
import { client } from './client';

export interface RecruiterInfo {
  name: string;
  title: string;
  email?: string;
  linkedInUrl?: string;
  avatarUrl?: string;
}

export interface JobMatchResult {
  fitScore: number;
  matchedSkills: string[];
  missingSkills: string[];
  rationale: string;
}

export interface JobItemData {
  _id: string;
  title: string;
  company: string;
  location: string;
  remote: boolean;
  jobType: string;
  experienceLevel: string;
  salaryRange?: string;
  description: string;
  requirements: string[];
  skills: string[];
  externalUrl?: string;
  recruiter?: RecruiterInfo;
  createdAt: string;
  updatedAt: string;
}

export interface EnrichedJobItem {
  job: JobItemData;
  match?: JobMatchResult;
}

export interface JobListResponse {
  success: boolean;
  data: EnrichedJobItem[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export const useJobs = (params?: { search?: string; remote?: boolean; page?: number; limit?: number }) => {
  return useQuery({
    queryKey: ['jobs', params],
    queryFn: async () => {
      const res = await client.get<JobListResponse>('/jobs', {
        params: {
          limit: params?.limit || 30,
          page: params?.page || 1,
          search: params?.search,
          remote: params?.remote,
        },
      });
      return res.data;
    },
  });
};
