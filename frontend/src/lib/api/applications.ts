import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { client } from './client';

export interface ApplicationTimelineEvent {
  status: string;
  date: string;
  note?: string;
}

export interface ApplicationNote {
  content: string;
  createdAt: string;
}

export interface Application {
  _id: string;
  userId: string;
  jobId?: string;
  jobTitle: string;
  company: string;
  location?: string;
  status: 'saved' | 'applied' | 'interviewing' | 'offer' | 'rejected' | 'withdrawn';
  tailoredBullets?: string[];
  coverLetter?: string;
  followUpDate?: string;
  notes?: ApplicationNote[];
  timeline?: ApplicationTimelineEvent[];
  salary?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ApplicationListResponse {
  data: Application[];
  countsByStatus: {
    saved: number;
    applied: number;
    interviewing: number;
    offer: number;
    rejected: number;
    withdrawn: number;
  };
}

export const useApplications = (status?: string) => {
  return useQuery({
    queryKey: ['applications', status],
    queryFn: async () => {
      const url = status ? `/applications?status=${status}` : '/applications';
      const res = await client.get<{
        success: boolean;
        data: Application[];
        metadata?: { countsByStatus: Record<string, number> };
        countsByStatus?: Record<string, number>;
      }>(url);
      const counts = res.data.metadata?.countsByStatus || res.data.countsByStatus || {
        saved: 0,
        applied: 0,
        interviewing: 0,
        offer: 0,
        rejected: 0,
        withdrawn: 0,
      };
      return {
        data: res.data.data || [],
        countsByStatus: counts,
      };
    },
  });
};

export const useCreateApplication = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: {
      jobTitle: string;
      company: string;
      location?: string;
      status?: string;
      coverLetter?: string;
      followUpDate?: string;
    }) => {
      const res = await client.post('/applications', payload);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['applications'] });
    },
  });
};

export const useUpdateApplicationStatus = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, status, note }: { id: string; status: string; note?: string }) => {
      const res = await client.patch(`/applications/${id}/status`, { status, note });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['applications'] });
    },
  });
};

export const useDeleteApplication = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await client.delete(`/applications/${id}`);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['applications'] });
    },
  });
};

export const useAddApplicationNote = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, content }: { id: string; content: string }) => {
      const res = await client.post(`/applications/${id}/notes`, { content });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['applications'] });
    },
  });
};
