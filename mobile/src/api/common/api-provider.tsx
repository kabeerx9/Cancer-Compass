import { useAuth } from '@clerk/clerk-expo';
import { useReactQueryDevTools } from '@dev-plugins/react-query';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import * as React from 'react';

import { setTokenGetter } from './client';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000, // 30 seconds
      gcTime: 5 * 60 * 1000, // 5 minutes (formerly cacheTime)
      retry: 2,
      refetchOnReconnect: true,
      refetchOnWindowFocus: false, // Disable for mobile
    },
    mutations: {
      retry: 0,
    },
  },
});

export function APIProvider({ children }: { children: React.ReactNode }) {
  const { getToken, isLoaded } = useAuth();
  useReactQueryDevTools(queryClient);

  // Set token getter for axios interceptor
  React.useEffect(() => {
    if (isLoaded) {
      setTokenGetter(async () => {
        try {
          return await getToken();
        } catch {
          return null;
        }
      });
    }
  }, [getToken, isLoaded]);

  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}
