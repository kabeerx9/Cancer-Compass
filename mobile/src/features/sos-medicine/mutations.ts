import type { QueryClient } from '@tanstack/react-query';

import { sosMedicineApi } from './api';
import { sosMedicineKeys } from './keys';
import type {
  CreateSosMedicineData,
  LogSosMedicineData,
  SosMedicine,
  SosMedicineLog,
  UpdateSosMedicineData,
} from './types';

export const sosMedicineMutations = {
  create: (queryClient: QueryClient) => ({
    mutationKey: ['sos-medicines'],
    mutationFn: (data: CreateSosMedicineData) => sosMedicineApi.create(data),
    onMutate: async (newMedicine: CreateSosMedicineData) => {
      await queryClient.cancelQueries({ queryKey: sosMedicineKeys.all() });

      const previousMedicines = queryClient.getQueryData<SosMedicine[]>(sosMedicineKeys.all());

      const optimisticMedicine: SosMedicine = {
        id: `temp-${Date.now()}`,
        userId: 'temp',
        name: newMedicine.name,
        purpose: newMedicine.purpose || null,
        dosage: newMedicine.dosage || null,
        instructions: newMedicine.instructions || null,
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      queryClient.setQueryData<SosMedicine[]>(sosMedicineKeys.all(), (old = []) => [
        ...old,
        optimisticMedicine,
      ]);

      return { previousMedicines, optimisticId: optimisticMedicine.id };
    },
    onError: (error: Error, variables: CreateSosMedicineData, context: any) => {
      if (context?.previousMedicines) {
        queryClient.setQueryData(sosMedicineKeys.all(), context.previousMedicines);
      }
    },
    onSettled: () => {
      if (queryClient.isMutating({ mutationKey: ['sos-medicines'] }) === 1) {
        queryClient.invalidateQueries({ queryKey: sosMedicineKeys.all() });
      }
    },
  }),

  update: (queryClient: QueryClient) => ({
    mutationKey: ['sos-medicines'],
    mutationFn: ({ id, data }: { id: string; data: UpdateSosMedicineData }) =>
      sosMedicineApi.update(id, data),
    onMutate: async ({ id, data }: { id: string; data: UpdateSosMedicineData }) => {
      await queryClient.cancelQueries({ queryKey: sosMedicineKeys.all() });

      const previousMedicines = queryClient.getQueryData<SosMedicine[]>(sosMedicineKeys.all());

      queryClient.setQueryData<SosMedicine[]>(sosMedicineKeys.all(), (old = []) =>
        old.map((med) => (med.id === id ? { ...med, ...data } : med))
      );

      return { previousMedicines };
    },
    onError: (error: Error, variables: { id: string; data: UpdateSosMedicineData }, context: any) => {
      if (context?.previousMedicines) {
        queryClient.setQueryData(sosMedicineKeys.all(), context.previousMedicines);
      }
    },
    onSettled: () => {
      if (queryClient.isMutating({ mutationKey: ['sos-medicines'] }) === 1) {
        queryClient.invalidateQueries({ queryKey: sosMedicineKeys.all() });
      }
    },
  }),

  delete: (queryClient: QueryClient) => ({
    mutationKey: ['sos-medicines'],
    mutationFn: (id: string) => sosMedicineApi.delete(id),
    onMutate: async (id: string) => {
      await queryClient.cancelQueries({ queryKey: sosMedicineKeys.all() });

      const previousMedicines = queryClient.getQueryData<SosMedicine[]>(sosMedicineKeys.all());

      queryClient.setQueryData<SosMedicine[]>(sosMedicineKeys.all(), (old = []) =>
        old.filter((med) => med.id !== id)
      );

      return { previousMedicines };
    },
    onError: (error: Error, variables: string, context: any) => {
      if (context?.previousMedicines) {
        queryClient.setQueryData(sosMedicineKeys.all(), context.previousMedicines);
      }
    },
    onSettled: () => {
      if (queryClient.isMutating({ mutationKey: ['sos-medicines'] }) === 1) {
        queryClient.invalidateQueries({ queryKey: sosMedicineKeys.all() });
      }
    },
  }),

  log: (queryClient: QueryClient) => ({
    mutationKey: ['sos-medicines', 'log'],
    mutationFn: ({ id, data }: { id: string; data: LogSosMedicineData }) =>
      sosMedicineApi.log(id, data),
    onMutate: async ({ id, data }: { id: string; data: LogSosMedicineData }) => {
      await queryClient.cancelQueries({ queryKey: sosMedicineKeys.logs() });

      const previousLogs = queryClient.getQueryData<SosMedicineLog[]>(sosMedicineKeys.logs());

      const optimisticLog: SosMedicineLog = {
        id: `temp-${Date.now()}`,
        sosMedicineId: id,
        takenAt: data.takenAt,
        notes: data.notes || null,
        createdAt: new Date().toISOString(),
      };

      queryClient.setQueryData<SosMedicineLog[]>(sosMedicineKeys.logs(), (old = []) => [
        optimisticLog,
        ...old,
      ]);

      return { previousLogs };
    },
    onError: (error: Error, variables: { id: string; data: LogSosMedicineData }, context: any) => {
      if (context?.previousLogs) {
        queryClient.setQueryData(sosMedicineKeys.logs(), context.previousLogs);
      }
    },
    onSettled: () => {
      if (queryClient.isMutating({ mutationKey: ['sos-medicines', 'log'] }) === 1) {
        queryClient.invalidateQueries({ queryKey: sosMedicineKeys.logs() });
        queryClient.invalidateQueries({ queryKey: sosMedicineKeys.stats() });
      }
    },
  }),
};
