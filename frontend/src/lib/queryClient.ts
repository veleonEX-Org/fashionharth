import { QueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { getErrorMessage } from "../utils/errorHandler";

// Central React Query client for the app.
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60,
      refetchOnWindowFocus: false,
      retry: 1,
      // Global error handler for queries
      onError: (error) => {
        const message = getErrorMessage(error);
        toast.error(message);
      },
    },
    mutations: {
      // Global error handler for mutations
      onError: (error) => {
        const message = getErrorMessage(error);
        toast.error(message);
      },
    },
  },
});



