export const templateKeys = {
  root: ['templates'] as const,
  detail: (id: string) => [...templateKeys.root, 'detail', id] as const,
};
