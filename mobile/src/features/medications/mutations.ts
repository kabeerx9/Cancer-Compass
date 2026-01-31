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
    mutationKey: ['medications'],
    mutationFn: (data: CreateMedicationData) => medicationApi.create(data),
    onSuccess: () => {
      // Immediately invalidate on success
      queryClient.invalidateQueries({ queryKey: medicationKeys.today() });
      queryClient.invalidateQueries({ queryKey: medicationKeys.all() });
    },
    onSettled: () => {
      // Also invalidate on settled as a backup
      queryClient.invalidateQueries({ queryKey: medicationKeys.today() });
      queryClient.invalidateQueries({ queryKey: medicationKeys.all() });
    },
  }),

  update: (queryClient: QueryClient) => ({
    mutationKey: ['medications'],
    mutationFn: ({ id, data }: { id: string; data: UpdateMedicationData }) =>
      medicationApi.update(id, data),
    onMutate: async ({
      id,
      data,
    }: {
      id: string;
      data: UpdateMedicationData;
    }) => {
      // Cancel any in-flight queries to prevent race conditions
      await queryClient.cancelQueries({ queryKey: medicationKeys.all() });

      // Snapshot previous value for rollback
      const previousMeds = queryClient.getQueryData<Medication[]>(
        medicationKeys.all()
      );

      // Optimistically update medications list
      queryClient.setQueryData<Medication[]>(medicationKeys.all(), (old = []) =>
        old.map((med) => (med.id === id ? { ...med, ...data } : med))
      );

      return { previousMeds };
    },
    onError: (
      error: Error,
      variables: { id: string; data: UpdateMedicationData },
      context: { previousMeds: Medication[] | undefined } | undefined
    ) => {
      // Rollback to previous value on error
      if (context?.previousMeds) {
        queryClient.setQueryData(medicationKeys.all(), context.previousMeds);
      }
    },
    onSuccess: (
      _data: Medication,
      variables: { id: string; data: UpdateMedicationData }
    ) => {
      // Nothing here - wait for all concurrent mutations to complete
    },
    onSettled: () => {
      // Only invalidate if this is the last medication mutation running
      if (queryClient.isMutating({ mutationKey: ['medications'] }) === 1) {
        queryClient.invalidateQueries({ queryKey: medicationKeys.today() });
        queryClient.invalidateQueries({ queryKey: medicationKeys.all() });
      }
    },
  }),

  delete: (queryClient: QueryClient) => ({
    mutationKey: ['medications'],
    mutationFn: (id: string) => medicationApi.delete(id),
    onMutate: async (id: string) => {
      // Cancel any in-flight queries to prevent race conditions
      await queryClient.cancelQueries({ queryKey: medicationKeys.all() });

      // Snapshot previous value for rollback
      const previousMeds = queryClient.getQueryData<Medication[]>(
        medicationKeys.all()
      );

      // Optimistically remove from medications list
      queryClient.setQueryData<Medication[]>(medicationKeys.all(), (old = []) =>
        old.filter((med) => med.id !== id)
      );

      return { previousMeds };
    },
    onError: (
      error: Error,
      variables: string,
      context: { previousMeds: Medication[] | undefined } | undefined
    ) => {
      // Rollback to previous value on error
      if (context?.previousMeds) {
        queryClient.setQueryData(medicationKeys.all(), context.previousMeds);
      }
    },
    onSuccess: () => {
      // Nothing here - wait for all concurrent mutations to complete
    },
    onSettled: () => {
      // Only invalidate if this is the last medication mutation running
      if (queryClient.isMutating({ mutationKey: ['medications'] }) === 1) {
        queryClient.invalidateQueries({ queryKey: medicationKeys.today() });
        queryClient.invalidateQueries({ queryKey: medicationKeys.all() });
      }
    },
  }),

  log: (queryClient: QueryClient) => ({
    mutationKey: ['medications'],
    mutationFn: ({ id, status }: { id: string; status: 'taken' | 'skipped' }) =>
      medicationApi.log(id, status),
    onMutate: async ({
      id,
      status,
    }: {
      id: string;
      status: 'taken' | 'skipped';
    }) => {
      // Cancel any in-flight queries to prevent race conditions
      await queryClient.cancelQueries({ queryKey: medicationKeys.today() });

      // Snapshot previous value for rollback
      const previousMeds = queryClient.getQueryData<Medication[]>(
        medicationKeys.today()
      );

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
    onError: (
      error: Error,
      variables: { id: string; status: 'taken' | 'skipped' },
      context: { previousMeds: Medication[] | undefined } | undefined
    ) => {
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
