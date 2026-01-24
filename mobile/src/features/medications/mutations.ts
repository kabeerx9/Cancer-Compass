import type { QueryClient } from '@tanstack/react-query';

import { medicationApi } from './api';
import { medicationKeys } from './keys';
import type {
  CreateMedicationData,
  Medication,
  UpdateMedicationData,
} from './types';

export const medicationMutations = {
  create: (queryClient: QueryClient) => ({
    mutationFn: (data: CreateMedicationData) => medicationApi.create(data),
    onSuccess: () => {
      // Invalidate both today and all to keep data in sync
      queryClient.invalidateQueries({ queryKey: medicationKeys.today() });
      queryClient.invalidateQueries({ queryKey: medicationKeys.all() });
    },
  }),

  update: (queryClient: QueryClient) => ({
    mutationFn: ({ id, data }: { id: string; data: UpdateMedicationData }) =>
      medicationApi.update(id, data),
    onSuccess: (
      _data: Medication,
      variables: { id: string; data: UpdateMedicationData }
    ) => {
      // Invalidate both today and all to keep data in sync
      queryClient.invalidateQueries({ queryKey: medicationKeys.today() });
      queryClient.invalidateQueries({ queryKey: medicationKeys.all() });
      queryClient.invalidateQueries({
        queryKey: medicationKeys.detail(variables.id),
      });
    },
  }),

  delete: (queryClient: QueryClient) => ({
    mutationFn: (id: string) => medicationApi.delete(id),
    onSuccess: () => {
      // Invalidate both today and all to keep data in sync
      queryClient.invalidateQueries({ queryKey: medicationKeys.today() });
      queryClient.invalidateQueries({ queryKey: medicationKeys.all() });
    },
  }),

  log: (queryClient: QueryClient) => ({
    mutationKey: ['medications'],
    mutationFn: ({ id, status }: { id: string; status: 'taken' | 'skipped' }) =>
      medicationApi.log(id, status),
    onMutate: async ({ id, status }) => {
      // Cancel any in-flight queries to prevent race conditions
      await queryClient.cancelQueries({ queryKey: medicationKeys.today() });

      // Snapshot previous value for rollback
      const previousMeds = queryClient.getQueryData<Medication[]>(medicationKeys.today());

      // Optimistically update today's medications
      queryClient.setQueryData<Medication[]>(
        medicationKeys.today(),
        (old = []) =>
          old.map((med) =>
            med.id === id ? { ...med, todayStatus: status } : med
          )
      );

      // Return context with previous value for rollback
      return { previousMeds };
    },
    onError: (error, variables, context) => {
      // Rollback to previous value on error
      if (context?.previousMeds) {
        queryClient.setQueryData(medicationKeys.today(), context.previousMeds);
      }
    },
    onSettled: () => {
      // Only invalidate if this is the last medication mutation running
      // This prevents concurrent mutations from overwriting each other
      if (queryClient.isMutating({ mutationKey: ['medications'] }) === 1) {
        queryClient.invalidateQueries({ queryKey: medicationKeys.today() });
      }
    },
  }),
};
