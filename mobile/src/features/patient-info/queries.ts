import { useQuery } from '@tanstack/react-query';

import { patientInfoApi } from './api';
import { patientInfoKeys } from './keys';

export const patientInfoQueries = {
  usePatientInfo: () => {
    return useQuery({
      queryKey: patientInfoKeys.info(),
      queryFn: patientInfoApi.getPatientInfo,
    });
  },

  useContacts: () => {
    return useQuery({
      queryKey: patientInfoKeys.contacts(),
      queryFn: patientInfoApi.getAllContacts,
    });
  },

  useContactsByCategory: (category: string) => {
    return useQuery({
      queryKey: patientInfoKeys.contactsByCategory(category),
      queryFn: () => patientInfoApi.getContactsByCategory(category),
      enabled: !!category,
    });
  },

  useContactById: (id: string) => {
    return useQuery({
      queryKey: patientInfoKeys.contactById(id),
      queryFn: () => patientInfoApi.getContactById(id),
      enabled: !!id,
    });
  },

  useShareableText: () => {
    return useQuery({
      queryKey: patientInfoKeys.shareableText(),
      queryFn: patientInfoApi.getShareableText,
      enabled: false, // Only fetch when explicitly called
    });
  },
};
