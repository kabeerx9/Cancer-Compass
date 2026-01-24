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
};
