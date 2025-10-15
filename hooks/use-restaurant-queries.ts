'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Restaurant } from '@/lib/types-vineyard';

export interface PaginationInfo {
  page: number;
  limit: number;
  totalCount: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface RestaurantsResponse {
  restaurants: Restaurant[];
  pagination: PaginationInfo;
}

export interface RestaurantsParams {
  page?: number;
  limit?: number;
  search?: string;
}

// Query keys
export const restaurantQueryKeys = {
  all: ['restaurants'] as const,
  lists: () => [...restaurantQueryKeys.all, 'list'] as const,
  list: (params: RestaurantsParams) => [...restaurantQueryKeys.lists(), params] as const,
  details: () => [...restaurantQueryKeys.all, 'detail'] as const,
  detail: (id: string) => [...restaurantQueryKeys.details(), id] as const,
};

// Fetch restaurants with pagination and search
export const useRestaurants = (params: RestaurantsParams = {}) => {
  const { page = 1, limit = 10, search = '' } = params;
  
  return useQuery({
    queryKey: restaurantQueryKeys.list({ page, limit, search }),
    queryFn: async (): Promise<RestaurantsResponse> => {
      const searchParams = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        ...(search && { search }),
      });

      const response = await fetch(`/api/admin/restaurants?${searchParams}`);
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to fetch restaurants');
      }

      const data = await response.json();
      return data.data;
    },
    staleTime: 30 * 1000, // 30 seconds
  });
};

// Fetch single restaurant
export const useRestaurant = (id: string) => {
  return useQuery({
    queryKey: restaurantQueryKeys.detail(id),
    queryFn: async (): Promise<Restaurant> => {
      const response = await fetch(`/api/admin/restaurants/${id}`);
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to fetch restaurant');
      }

      const data = await response.json();
      
      // Ensure we always return a valid restaurant object
      if (!data.data) {
        throw new Error('Restaurant data not found');
      }
      
      return data.data;
    },
    enabled: !!id && id !== 'new',
    retry: (failureCount, error) => {
      // Don't retry if it's a 404 error
      if (error.message.includes('not found')) {
        return false;
      }
      return failureCount < 3;
    },
  });
};

// Create restaurant mutation
export const useCreateRestaurant = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (restaurant: Partial<Restaurant>): Promise<Restaurant> => {
      const response = await fetch('/api/admin/restaurants', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(restaurant),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to create restaurant');
      }

      const data = await response.json();
      return data.data;
    },
    onSuccess: () => {
      // Invalidate and refetch restaurant lists
      queryClient.invalidateQueries({ queryKey: restaurantQueryKeys.lists() });
      toast.success('Restaurant created successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to create restaurant');
    },
  });
};

// Update restaurant mutation
export const useUpdateRestaurant = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, restaurant }: { id: string; restaurant: Partial<Restaurant> }): Promise<Restaurant> => {
      const response = await fetch(`/api/admin/restaurants/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(restaurant),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to update restaurant');
      }

      const data = await response.json();
      return data.data;
    },
    onSuccess: (data, variables) => {
      // Invalidate and refetch restaurant lists
      queryClient.invalidateQueries({ queryKey: restaurantQueryKeys.lists() });
      // Update the specific restaurant cache
      queryClient.setQueryData(restaurantQueryKeys.detail(variables.id), data);
      toast.success('Restaurant updated successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update restaurant');
    },
  });
};

// Delete restaurant mutation
export const useDeleteRestaurant = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string): Promise<void> => {
      const response = await fetch(`/api/admin/restaurants/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to delete restaurant');
      }
    },
    onSuccess: (_, id) => {
      // Invalidate and refetch restaurant lists
      queryClient.invalidateQueries({ queryKey: restaurantQueryKeys.lists() });
      // Remove the specific restaurant from cache
      queryClient.removeQueries({ queryKey: restaurantQueryKeys.detail(id) });
      toast.success('Restaurant deleted successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to delete restaurant');
    },
  });
};
