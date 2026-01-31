import { queryOptions, useQuery } from '@tanstack/react-query';

import { sosMedicineApi } from './api';
import { sosMedicineKeys } from './keys';

export const sosMedicineQueries = {
  all: () =>
    queryOptions({
      queryKey: sosMedicineKeys.all(),
      queryFn: sosMedicineApi.getAll,
      staleTime: 30_000,
    }),

  active: () =>
    queryOptions({
      queryKey: [...sosMedicineKeys.all(), 'active'],
      queryFn: sosMedicineApi.getActive,
      staleTime: 30_000,
    }),

  detail: (id: string) =>
    queryOptions({
      queryKey: sosMedicineKeys.detail(id),
      queryFn: () => sosMedicineApi.getById(id),
      staleTime: 60_000,
      enabled: !!id,
    }),

  logs: (id: string) =>
    queryOptions({
      queryKey: sosMedicineKeys.medicineLogs(id),
      queryFn: () => sosMedicineApi.getLogs(id),
      staleTime: 30_000,
      enabled: !!id,
    }),

  allLogs: (startDate?: string, endDate?: string) =>
    queryOptions({
      queryKey: sosMedicineKeys.allLogs(startDate && endDate ? `${startDate}-${endDate}` : undefined),
      queryFn: () => sosMedicineApi.getAllLogs(startDate, endDate),
      staleTime: 30_000,
    }),

  stats: (startDate?: string, endDate?: string) =>
    queryOptions({
      queryKey: sosMedicineKeys.statsRange(startDate && endDate ? `${startDate}-${endDate}` : 'all'),
      queryFn: () => sosMedicineApi.getStats(startDate, endDate),
      staleTime: 60_000,
    }),

  // Hooks
  useActiveSosMedicines: () => {
    return useQuery({
      queryKey: [...sosMedicineKeys.all(), 'active'],
      queryFn: sosMedicineApi.getActive,
      staleTime: 30_000,
    });
  },
};
