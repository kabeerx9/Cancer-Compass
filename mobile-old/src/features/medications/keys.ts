export const medicationKeys = {
  root: ['medications'] as const,
  all: () => [...medicationKeys.root, 'all'] as const,
  today: () => [...medicationKeys.root, 'today'] as const,
  detail: (id: string) => [...medicationKeys.root, 'detail', id] as const,
};
