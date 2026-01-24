import { queryOptions } from '@tanstack/react-query';
import { templateApi } from './api';
import { templateKeys } from './keys';

export const templateQueries = {
  all: () =>
    queryOptions({
      queryKey: templateKeys.root,
      queryFn: templateApi.getAll,
    }),

  assignedDays: (startDate: string, endDate: string) =>
    queryOptions({
      queryKey: ['assigned-days', startDate, endDate],
      queryFn: () => templateApi.getAssignedDays(startDate, endDate),
    }),
};
