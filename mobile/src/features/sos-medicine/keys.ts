export const sosMedicineKeys = {
  all: () => ['sos-medicines'] as const,
  lists: () => [...sosMedicineKeys.all(), 'list'] as const,
  list: (filters: string) => [...sosMedicineKeys.lists(), { filters }] as const,
  details: () => [...sosMedicineKeys.all(), 'detail'] as const,
  detail: (id: string) => [...sosMedicineKeys.details(), id] as const,
  logs: () => [...sosMedicineKeys.all(), 'logs'] as const,
  medicineLogs: (id: string) => [...sosMedicineKeys.logs(), 'medicine', id] as const,
  allLogs: (dateRange?: string) => [...sosMedicineKeys.logs(), 'all', dateRange || 'all'] as const,
  stats: () => [...sosMedicineKeys.all(), 'stats'] as const,
  statsRange: (range: string) => [...sosMedicineKeys.stats(), range] as const,
};
