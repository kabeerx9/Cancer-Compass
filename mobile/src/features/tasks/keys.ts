export const taskKeys = {
  root: ['tasks'] as const,
  byDate: (date: string) => [...taskKeys.root, 'date', date] as const,
};
