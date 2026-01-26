import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { Toaster } from "react-hot-toast";
import App from "./App";
import "./index.css";
import { AuthProvider } from "./state/AuthContext";
import { queryClient } from "./lib/queryClient";
import { ScrollToTop } from "./components/ScrollToTop";

import { GoogleOAuthProvider } from "@react-oauth/google";

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <BrowserRouter>
      <ScrollToTop />
      <QueryClientProvider client={queryClient}>
        <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID || ""}>
          <AuthProvider>
          <App />
          <Toaster
            position="top-right"
            containerStyle={{
              zIndex: 999999, // higher than modals, drawers, etc.
              // top: 80, // Avoid overlap with sticky header
            }}
            toastOptions={{
              duration: 4000,
              style: {
                background: "white",
                color: "var(--color-gray-50)",
                border: "1px solid var(--color-gray-700)",
              },
              success: {
                iconTheme: {
                  primary: "var(--color-success)",
                  secondary: "var(--color-gray-50)",
                },
              },
              error: {
                iconTheme: {
                  primary: "var(--color-error)",
                  secondary: "var(--color-gray-50)",
                },
              },
            }}
          />
        </AuthProvider>
      </GoogleOAuthProvider>
      <ReactQueryDevtools initialIsOpen={false} />
      </QueryClientProvider>
    </BrowserRouter>
  </React.StrictMode>
);


