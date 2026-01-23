import type { QueryClient } from '@tanstack/react-query';
import { medicationApi } from './api';
import { medicationKeys } from './keys';
import type { CreateMedicationData, UpdateMedicationData, Medication } from './types';

export const medicationMutations = {
  create: (queryClient: QueryClient) => ({
    mutationFn: (data: CreateMedicationData) => medicationApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: medicationKeys.root });
    },
  }),

  update: (queryClient: QueryClient) => ({
    mutationFn: ({ id, data }: { id: string; data: UpdateMedicationData }) =>
      medicationApi.update(id, data),
    onSuccess: (_data: Medication, variables: { id: string; data: UpdateMedicationData }) => {
      queryClient.invalidateQueries({ queryKey: medicationKeys.root });
      queryClient.invalidateQueries({ queryKey: medicationKeys.detail(variables.id) });
    },
  }),

  delete: (queryClient: QueryClient) => ({
    mutationFn: (id: string) => medicationApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: medicationKeys.root });
    },
  }),

  log: (queryClient: QueryClient) => ({
    mutationFn: ({ id, status }: { id: string; status: 'taken' | 'skipped' }) =>
      medicationApi.log(id, status),
    onSuccess: () => {
      // Invalidate both today and all to keep data in sync
      queryClient.invalidateQueries({ queryKey: medicationKeys.today() });
      queryClient.invalidateQueries({ queryKey: medicationKeys.all() });
    },
  }),
};
