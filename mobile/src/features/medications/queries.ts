import { queryOptions, useQuery } from '@tanstack/react-query';

import { medicationApi } from './api';
import { medicationKeys } from './keys';

export const medicationQueries = {
  all: () =>
    queryOptions({
      queryKey: medicationKeys.all(),
      queryFn: medicationApi.getAll,
      staleTime: 30_000, // 30 seconds
    }),

  today: () =>
    queryOptions({
      queryKey: medicationKeys.today(),
      queryFn: medicationApi.getToday,
      staleTime: 30_000,
      refetchOnWindowFocus: false, // Mobile doesn't need window focus refetch
    }),

  detail: (id: string) =>
    queryOptions({
      queryKey: medicationKeys.detail(id),
      queryFn: () => medicationApi.getById(id),
      staleTime: 60_000, // 1 minute
    }),

  history: (id: string) =>
    queryOptions({
      queryKey: medicationKeys.history(id),
      queryFn: () => medicationApi.getHistory(id),
      staleTime: 30_000,
      enabled: !!id,
    }),

  // Hook for getting active medications
  useActiveMedications: () => {
    return useQuery({
      queryKey: medicationKeys.all(),
      queryFn: medicationApi.getAll,
      select: (data) => data.filter((med) => med.isActive),
      staleTime: 30_000,
    });
  },
};
