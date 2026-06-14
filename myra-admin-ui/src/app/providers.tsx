import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { PropsWithChildren } from "react";
import { Toaster } from "@/components/ui/toast";
import { I18nProvider } from "@/i18n";
import { appConfig } from "@/lib/config";
import { ThemeProvider } from "@/shared/theme/ThemeProvider";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: appConfig.VITE_API_RETRY_ATTEMPTS,
      refetchOnWindowFocus: false,
      staleTime: 30_000
    }
  }
});

export function AppProviders({ children }: PropsWithChildren) {
  return (
    <ThemeProvider>
      <QueryClientProvider client={queryClient}>
        <I18nProvider>
          {children}
          <Toaster />
        </I18nProvider>
      </QueryClientProvider>
    </ThemeProvider>
  );
}
