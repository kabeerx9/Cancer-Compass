import { queryOptions } from '@tanstack/react-query';
import { templateApi } from './api';
import { templateKeys } from './keys';

export const templateQueries = {
  all: () =>
    queryOptions({
      queryKey: templateKeys.root,
      queryFn: templateApi.getAll,
    }),
};
