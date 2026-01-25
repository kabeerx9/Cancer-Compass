import type { QueryClient } from '@tanstack/react-query';

import { taskApi } from './api';
import { taskKeys } from './keys';
import type { CreateTaskData, DailyTask, UpdateTaskData } from './types';

export const taskMutations = {
  create: (queryClient: QueryClient) => ({
    mutationKey: ['tasks'],
    mutationFn: taskApi.create,
    onMutate: async (variables: CreateTaskData) => {
      await queryClient.cancelQueries({
        queryKey: taskKeys.byDate(variables.date),
      });

      const previousTasks = queryClient.getQueryData<DailyTask[]>(
        taskKeys.byDate(variables.date)
      );

      queryClient.setQueryData<DailyTask[]>(
        taskKeys.byDate(variables.date),
        (old = []) => [
          {
            id: `temp-${Date.now()}`,
            userId: '',
            date: variables.date,
            title: variables.title,
            description: variables.description || null,
            isCompleted: false,
            order: old.length + 1,
            sourceType: 'custom',
            templateId: null,
            templateTaskId: null,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
          ...old,
        ]
      );

      return { previousTasks };
    },
    onError: (
      error: Error,
      variables: CreateTaskData,
      context: { previousTasks: DailyTask[] | undefined } | undefined
    ) => {
      if (context?.previousTasks) {
        queryClient.setQueryData(
          taskKeys.byDate(variables.date),
          context.previousTasks
        );
      }
    },
    onSuccess: (_: unknown, variables: CreateTaskData) => {
      queryClient.invalidateQueries({
        queryKey: taskKeys.byDate(variables.date),
      });
    },
    onSettled: () => {
      if (queryClient.isMutating({ mutationKey: ['tasks'] }) === 1) {
        queryClient.invalidateQueries({ queryKey: taskKeys.root });
      }
    },
  }),

  update: (queryClient: QueryClient) => ({
    mutationKey: ['tasks'],
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: UpdateTaskData & { date?: string };
    }) => taskApi.update(id, data),
    onMutate: async ({
      id,
      data,
    }: {
      id: string;
      data: UpdateTaskData & { date?: string };
    }) => {
      const date = data.date;
      if (!date) return { previousTasks: undefined, date: undefined };

      await queryClient.cancelQueries({ queryKey: taskKeys.byDate(date) });

      const previousTasks = queryClient.getQueryData<DailyTask[]>(
        taskKeys.byDate(date)
      );

      queryClient.setQueryData<DailyTask[]>(taskKeys.byDate(date), (old = []) =>
        old.map((task) => (task.id === id ? { ...task, ...data } : task))
      );

      return { previousTasks, date };
    },
    onError: (
      error: Error,
      variables: { id: string; data: UpdateTaskData & { date?: string } },
      context:
        | { previousTasks: DailyTask[] | undefined; date?: string }
        | undefined
    ) => {
      if (context?.date && context?.previousTasks) {
        queryClient.setQueryData(
          taskKeys.byDate(context.date),
          context.previousTasks
        );
      }
    },
    onSuccess: (
      _: unknown,
      variables: { id: string; data: UpdateTaskData & { date?: string } }
    ) => {
      if (variables.data.date) {
        queryClient.invalidateQueries({
          queryKey: taskKeys.byDate(variables.data.date),
        });
      } else {
        queryClient.invalidateQueries({ queryKey: taskKeys.root });
      }
    },
    onSettled: () => {
      if (queryClient.isMutating({ mutationKey: ['tasks'] }) === 1) {
        queryClient.invalidateQueries({ queryKey: taskKeys.root });
      }
    },
  }),

  toggleComplete: (queryClient: QueryClient) => ({
    mutationKey: ['tasks'],
    mutationFn: ({ id }: { id: string }) => taskApi.toggleComplete(id),
    onMutate: async ({ id }: { id: string }) => {
      await queryClient.cancelQueries({ queryKey: taskKeys.root });

      const previousTasksMap = new Map<string, DailyTask[]>();

      const queries = queryClient.getQueriesData<DailyTask[]>({
        queryKey: taskKeys.root,
      });

      for (const [queryKey, oldData] of queries) {
        if (oldData) {
          previousTasksMap.set(JSON.stringify(queryKey), [...oldData]);
          queryClient.setQueryData(
            queryKey,
            oldData.map((task) =>
              task.id === id
                ? { ...task, isCompleted: !task.isCompleted }
                : task
            )
          );
        }
      }

      return { previousTasksMap };
    },
    onError: (
      error: Error,
      _variables: { id: string },
      context:
        | { previousTasksMap: Map<string, DailyTask[]> | undefined }
        | undefined
    ) => {
      if (context?.previousTasksMap) {
        context.previousTasksMap.forEach((previousTasks, queryKeyStr) => {
          const queryKey = JSON.parse(queryKeyStr);
          queryClient.setQueryData(queryKey, previousTasks);
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: taskKeys.root });
    },
    onSettled: () => {
      if (queryClient.isMutating({ mutationKey: ['tasks'] }) === 1) {
        queryClient.invalidateQueries({ queryKey: taskKeys.root });
      }
    },
  }),

  delete: (queryClient: QueryClient) => ({
    mutationKey: ['tasks'],
    mutationFn: taskApi.delete,
    onMutate: async (id: string) => {
      await queryClient.cancelQueries({ queryKey: taskKeys.root });

      const previousTasksMap = new Map<string, DailyTask[]>();

      const queries = queryClient.getQueriesData<DailyTask[]>({
        queryKey: taskKeys.root,
      });

      for (const [queryKey, oldData] of queries) {
        if (oldData) {
          previousTasksMap.set(JSON.stringify(queryKey), [...oldData]);
          queryClient.setQueryData(
            queryKey,
            oldData.filter((task) => task.id !== id)
          );
        }
      }

      return { previousTasksMap };
    },
    onError: (
      error: Error,
      _variables: string,
      context:
        | { previousTasksMap: Map<string, DailyTask[]> | undefined }
        | undefined
    ) => {
      if (context?.previousTasksMap) {
        context.previousTasksMap.forEach((previousTasks, queryKeyStr) => {
          const queryKey = JSON.parse(queryKeyStr);
          queryClient.setQueryData(queryKey, previousTasks);
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: taskKeys.root });
    },
    onSettled: () => {
      if (queryClient.isMutating({ mutationKey: ['tasks'] }) === 1) {
        queryClient.invalidateQueries({ queryKey: taskKeys.root });
      }
    },
  }),
};
