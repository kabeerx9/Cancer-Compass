import { queryOptions, useQuery } from '@tanstack/react-query';

import { symptomApi } from './api';
import { symptomKeys } from './keys';

export const symptomQueries = {
  all: () =>
    queryOptions({
      queryKey: symptomKeys.all(),
      queryFn: symptomApi.getAll,
      staleTime: 30_000,
    }),

  today: () =>
    queryOptions({
      queryKey: symptomKeys.today(),
      queryFn: symptomApi.checkToday,
      staleTime: 60_000,
    }),

  byDateRange: (startDate: string, endDate: string) =>
    queryOptions({
      queryKey: symptomKeys.range(startDate, endDate),
      queryFn: () => symptomApi.getByDateRange(startDate, endDate),
      staleTime: 60_000,
      enabled: !!startDate && !!endDate,
    }),

  summary: (startDate: string, endDate: string) =>
    queryOptions({
      queryKey: symptomKeys.summary(startDate, endDate),
      queryFn: () => symptomApi.getSummary(startDate, endDate),
      staleTime: 5 * 60_000, // 5 minutes - summaries can be regenerated
      enabled: !!startDate && !!endDate,
    }),

  // Hook for checking today's log
  useTodayCheck: () => {
    return useQuery({
      queryKey: symptomKeys.today(),
      queryFn: symptomApi.checkToday,
      staleTime: 5 * 60_000,
    });
  },
};
