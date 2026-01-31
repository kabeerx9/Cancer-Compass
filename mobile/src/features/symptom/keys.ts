export const symptomKeys = {
  all: () => ['symptoms'] as const,
  lists: () => [...symptomKeys.all(), 'list'] as const,
  list: (filters: string) => [...symptomKeys.lists(), { filters }] as const,
  today: () => [...symptomKeys.all(), 'today'] as const,
  details: () => [...symptomKeys.all(), 'detail'] as const,
  detail: (id: string) => [...symptomKeys.details(), id] as const,
  range: (startDate: string, endDate: string) =>
    [...symptomKeys.all(), 'range', `${startDate}-${endDate}`] as const,
  summary: (startDate: string, endDate: string) =>
    [...symptomKeys.all(), 'summary', `${startDate}-${endDate}`] as const,
};
