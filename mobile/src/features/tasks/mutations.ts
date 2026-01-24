import { QueryClient } from '@tanstack/react-query';
import { taskApi } from './api';
import { CreateTaskData, UpdateTaskData } from './types';
import { taskKeys } from './keys';

export const taskMutations = {
  create: (queryClient: QueryClient) => ({
    mutationFn: taskApi.create,
    onSuccess: (_: unknown, variables: CreateTaskData) => {
      // Invalidate queries for the specific date
      queryClient.invalidateQueries({ queryKey: taskKeys.byDate(variables.date) });
    },
  }),

  update: (queryClient: QueryClient) => ({
    mutationFn: ({ id, data }: { id: string; data: UpdateTaskData & { date?: string } }) =>
      taskApi.update(id, data),
    onSuccess: (_: unknown, variables: { id: string; data: UpdateTaskData & { date?: string } }) => {
      if (variables.data.date) {
         queryClient.invalidateQueries({ queryKey: taskKeys.byDate(variables.data.date) });
      } else {
         queryClient.invalidateQueries({ queryKey: taskKeys.root });
      }
    },
  }),

  toggleComplete: (queryClient: QueryClient) => ({
    mutationFn: ({ id }: { id: string }) => taskApi.toggleComplete(id),
    onSuccess: () => {
       queryClient.invalidateQueries({ queryKey: taskKeys.root });
    }
  }),

  delete: (queryClient: QueryClient) => ({
    mutationFn: taskApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: taskKeys.root });
    },
  }),
};
