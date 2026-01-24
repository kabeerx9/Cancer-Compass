import { QueryClient } from '@tanstack/react-query';
import { templateApi } from './api';
import { templateKeys } from './keys';

export const templateMutations = {
  create: (queryClient: QueryClient) => ({
    mutationFn: templateApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: templateKeys.root });
    },
  }),
  update: (queryClient: QueryClient) => ({
    mutationFn: ({ id, data }: { id: string; data: any }) => templateApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: templateKeys.root });
    },
  }),
  delete: (queryClient: QueryClient) => ({
    mutationFn: templateApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: templateKeys.root });
    },
  }),
  assign: (queryClient: QueryClient) => ({
    mutationFn: ({ id, date }: { id: string; date: string }) => templateApi.assign(id, date),
    onSuccess: (_: unknown, variables: { id: string; date: string }) => {
       // Invalidate tasks for that date!
       // We need to import taskKeys.
       // Circular dependency? taskKeys is in tasks/keys.ts. template is in templates/.
       // It's fine to import keys from another feature.
       queryClient.invalidateQueries({ queryKey: ['tasks', 'date', variables.date] });
    },
  }),
};
