'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

export interface Vineyard {
  id: string;
  vineyard_id: string;
  vineyard: string;
  region: string;
  sub_region: string;
  type: string;
  g: number;
  g_ratig_user: string;
  lowest_cost_per_adult: number;
  highest_cost_per_adult: number;
  reason_1?: string;
  reason_2?: string;
  reason_3?: string;
  reason_4?: string;
  reason_5?: string;
  image_url?: string;
  maplink?: string;
  latitude?: number;
  longitude?: number;
  tasting_only?: boolean;
  tour_and_tasting?: boolean;
  pairing_and_lunch?: boolean;
  vine_experience?: boolean;
  masterclass_workshop?: boolean;
}

export interface PaginationInfo {
  page: number;
  limit: number;
  totalCount: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface VineyardsResponse {
  vineyards: Vineyard[];
  pagination: PaginationInfo;
}

export interface VineyardsParams {
  page?: number;
  limit?: number;
  search?: string;
}

// Query keys
export const vineyardQueryKeys = {
  all: ['vineyards'] as const,
  lists: () => [...vineyardQueryKeys.all, 'list'] as const,
  list: (params: VineyardsParams) => [...vineyardQueryKeys.lists(), params] as const,
  details: () => [...vineyardQueryKeys.all, 'detail'] as const,
  detail: (id: string) => [...vineyardQueryKeys.details(), id] as const,
};

// Fetch vineyards with pagination and search
export const useVineyards = (params: VineyardsParams = {}) => {
  const { page = 1, limit = 10, search = '' } = params;
  
  return useQuery({
    queryKey: vineyardQueryKeys.list({ page, limit, search }),
    queryFn: async (): Promise<VineyardsResponse> => {
      const searchParams = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        ...(search && { search }),
      });

      const response = await fetch(`/api/admin/vineyards?${searchParams}`);
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to fetch vineyards');
      }

      const data = await response.json();
      return data.data;
    },
    staleTime: 30 * 1000, // 30 seconds
  });
};

// Fetch single vineyard
export const useVineyard = (id: string) => {
  return useQuery({
    queryKey: vineyardQueryKeys.detail(id),
    queryFn: async (): Promise<Vineyard> => {
      const response = await fetch(`/api/admin/vineyards/${id}`);
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to fetch vineyard');
      }

      const data = await response.json();
      return data.data;
    },
    enabled: !!id && id !== 'new',
  });
};

// Create vineyard mutation
export const useCreateVineyard = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (vineyard: Partial<Vineyard>): Promise<Vineyard> => {
      const response = await fetch('/api/admin/vineyards', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(vineyard),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to create vineyard');
      }

      const data = await response.json();
      return data.data;
    },
    onSuccess: () => {
      // Invalidate and refetch vineyard lists
      queryClient.invalidateQueries({ queryKey: vineyardQueryKeys.lists() });
      toast.success('Vineyard created successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to create vineyard');
    },
  });
};

// Update vineyard mutation
export const useUpdateVineyard = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, vineyard }: { id: string; vineyard: Partial<Vineyard> }): Promise<Vineyard> => {
      const response = await fetch(`/api/admin/vineyards/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(vineyard),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to update vineyard');
      }

      const data = await response.json();
      return data.data;
    },
    onSuccess: (data, variables) => {
      // Invalidate and refetch vineyard lists
      queryClient.invalidateQueries({ queryKey: vineyardQueryKeys.lists() });
      // Update the specific vineyard cache
      queryClient.setQueryData(vineyardQueryKeys.detail(variables.id), data);
      toast.success('Vineyard updated successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update vineyard');
    },
  });
};

// Delete vineyard mutation
export const useDeleteVineyard = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string): Promise<void> => {
      const response = await fetch(`/api/admin/vineyards/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to delete vineyard');
      }
    },
    onSuccess: (_, id) => {
      // Invalidate and refetch vineyard lists
      queryClient.invalidateQueries({ queryKey: vineyardQueryKeys.lists() });
      // Remove the specific vineyard from cache
      queryClient.removeQueries({ queryKey: vineyardQueryKeys.detail(id) });
      toast.success('Vineyard deleted successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to delete vineyard');
    },
  });
};

// Upload image mutation
export const useUploadImage = () => {
  return useMutation({
    mutationFn: async (file: File): Promise<{ imageUrl: string; publicId: string }> => {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/admin/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to upload image');
      }

      const data = await response.json();
      return data.data;
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to upload image');
    },
  });
};
