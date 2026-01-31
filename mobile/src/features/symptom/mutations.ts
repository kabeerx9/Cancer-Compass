import type { QueryClient } from '@tanstack/react-query';

import { symptomApi } from './api';
import { symptomKeys } from './keys';
import type { CreateSymptomLogData, SymptomLog, UpdateSymptomLogData } from './types';

export const symptomMutations = {
  createOrUpdate: (queryClient: QueryClient) => ({
    mutationKey: ['symptoms'],
    mutationFn: (data: CreateSymptomLogData) => symptomApi.createOrUpdate(data),
    onMutate: async (newLog: CreateSymptomLogData) => {
      await queryClient.cancelQueries({ queryKey: symptomKeys.all() });

      const previousLogs = queryClient.getQueryData<SymptomLog[]>(symptomKeys.all());

      const optimisticLog: SymptomLog = {
        id: `temp-${Date.now()}`,
        userId: 'temp',
        date: newLog.date,
        content: newLog.content,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      queryClient.setQueryData<SymptomLog[]>(symptomKeys.all(), (old = []) => {
        // Remove existing entry for this date if any
        const filtered = old.filter((log) => log.date !== newLog.date);
        return [optimisticLog, ...filtered];
      });

      return { previousLogs, optimisticId: optimisticLog.id };
    },
    onError: (error: Error, variables: CreateSymptomLogData, context: any) => {
      if (context?.previousLogs) {
        queryClient.setQueryData(symptomKeys.all(), context.previousLogs);
      }
    },
    onSettled: () => {
      if (queryClient.isMutating({ mutationKey: ['symptoms'] }) === 1) {
        queryClient.invalidateQueries({ queryKey: symptomKeys.all() });
        queryClient.invalidateQueries({ queryKey: symptomKeys.today() });
      }
    },
  }),

  update: (queryClient: QueryClient) => ({
    mutationKey: ['symptoms'],
    mutationFn: ({ id, data }: { id: string; data: UpdateSymptomLogData }) =>
      symptomApi.update(id, data),
    onMutate: async ({ id, data }: { id: string; data: UpdateSymptomLogData }) => {
      await queryClient.cancelQueries({ queryKey: symptomKeys.all() });

      const previousLogs = queryClient.getQueryData<SymptomLog[]>(symptomKeys.all());

      queryClient.setQueryData<SymptomLog[]>(symptomKeys.all(), (old = []) =>
        old.map((log) => (log.id === id ? { ...log, content: data.content } : log))
      );

      return { previousLogs };
    },
    onError: (error: Error, variables: { id: string; data: UpdateSymptomLogData }, context: any) => {
      if (context?.previousLogs) {
        queryClient.setQueryData(symptomKeys.all(), context.previousLogs);
      }
    },
    onSettled: () => {
      if (queryClient.isMutating({ mutationKey: ['symptoms'] }) === 1) {
        queryClient.invalidateQueries({ queryKey: symptomKeys.all() });
      }
    },
  }),

  delete: (queryClient: QueryClient) => ({
    mutationKey: ['symptoms'],
    mutationFn: (id: string) => symptomApi.delete(id),
    onMutate: async (id: string) => {
      await queryClient.cancelQueries({ queryKey: symptomKeys.all() });

      const previousLogs = queryClient.getQueryData<SymptomLog[]>(symptomKeys.all());

      queryClient.setQueryData<SymptomLog[]>(symptomKeys.all(), (old = []) =>
        old.filter((log) => log.id !== id)
      );

      return { previousLogs };
    },
    onError: (error: Error, variables: string, context: any) => {
      if (context?.previousLogs) {
        queryClient.setQueryData(symptomKeys.all(), context.previousLogs);
      }
    },
    onSettled: () => {
      if (queryClient.isMutating({ mutationKey: ['symptoms'] }) === 1) {
        queryClient.invalidateQueries({ queryKey: symptomKeys.all() });
      }
    },
  }),
};
