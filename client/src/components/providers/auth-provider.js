"use client";

import { Provider } from "react-redux";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";
import store from "@/store";
import AuthBootstrap from "@/components/auth/AuthBootstrap";

export default function Providers({ children }) {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <QueryClientProvider client={queryClient}>
      <Provider store={store}>
        <AuthBootstrap>{children}</AuthBootstrap>
      </Provider>
    </QueryClientProvider>
  );
}
