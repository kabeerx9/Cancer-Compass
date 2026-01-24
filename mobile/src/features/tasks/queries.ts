import { queryOptions } from '@tanstack/react-query';

import { taskApi } from './api';
import { taskKeys } from './keys';

export const taskQueries = {
  byDate: (date: string) =>
    queryOptions({
      queryKey: taskKeys.byDate(date),
      queryFn: () => taskApi.getByDate(date),
      staleTime: 1000 * 60, // 1 minute
    }),
};
