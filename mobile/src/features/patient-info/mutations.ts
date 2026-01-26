import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Alert } from 'react-native';

import { patientInfoApi } from './api';
import { patientInfoKeys } from './keys';
import type { CreateContactData, UpdateContactData, UpdatePatientInfoData } from './types';

export const patientInfoMutations = {
  useUpdatePatientInfo: () => {
    const queryClient = useQueryClient();

    return useMutation({
      mutationKey: ['patient-info', 'update'],
      mutationFn: (data: UpdatePatientInfoData) => patientInfoApi.updatePatientInfo(data),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: patientInfoKeys.info() });
        queryClient.invalidateQueries({ queryKey: patientInfoKeys.shareableText() });
      },
      onError: (error: Error) => {
        Alert.alert('Error', error.message || 'Failed to update patient info');
      },
    });
  },

  useCreateContact: () => {
    const queryClient = useQueryClient();

    return useMutation({
      mutationKey: ['contacts', 'create'],
      mutationFn: (data: CreateContactData) => patientInfoApi.createContact(data),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: patientInfoKeys.contacts() });
        queryClient.invalidateQueries({ queryKey: patientInfoKeys.shareableText() });
      },
      onError: (error: Error) => {
        Alert.alert('Error', error.message || 'Failed to create contact');
      },
    });
  },

  useUpdateContact: () => {
    const queryClient = useQueryClient();

    return useMutation({
      mutationKey: ['contacts', 'update'],
      mutationFn: ({ id, data }: { id: string; data: UpdateContactData }) =>
        patientInfoApi.updateContact(id, data),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: patientInfoKeys.contacts() });
        queryClient.invalidateQueries({ queryKey: patientInfoKeys.shareableText() });
      },
      onError: (error: Error) => {
        Alert.alert('Error', error.message || 'Failed to update contact');
      },
    });
  },

  useDeleteContact: () => {
    const queryClient = useQueryClient();

    return useMutation({
      mutationKey: ['contacts', 'delete'],
      mutationFn: (id: string) => patientInfoApi.deleteContact(id),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: patientInfoKeys.contacts() });
        queryClient.invalidateQueries({ queryKey: patientInfoKeys.shareableText() });
      },
      onError: (error: Error) => {
        Alert.alert('Error', error.message || 'Failed to delete contact');
      },
    });
  },
};
