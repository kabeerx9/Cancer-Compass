export const patientInfoKeys = {
  root: ['patient-info'] as const,
  info: () => [...patientInfoKeys.root, 'info'] as const,
  contacts: () => [...patientInfoKeys.root, 'contacts'] as const,
  contactById: (id: string) => [...patientInfoKeys.contacts(), id] as const,
  contactsByCategory: (category: string) => [...patientInfoKeys.contacts(), 'category', category] as const,
  shareableText: () => [...patientInfoKeys.root, 'share'] as const,
};
