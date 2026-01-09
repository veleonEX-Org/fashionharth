import React, { createContext, useContext, useEffect, useState } from "react";
import type { AuthState, AuthTokens, User } from "../types/auth";
import { http } from "../api/http";
import {
  clearStoredTokens,
  getStoredTokens,
  storeTokens,
} from "../utils/tokenStorage";

interface AuthContextValue extends AuthState {
  setAuth: (user: User, tokens: AuthTokens) => void;
  clearAuth: () => void;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const initialState: AuthState = {
  user: null,
  tokens: null,
  loading: true,
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [state, setState] = useState<AuthState>(initialState);

  // Initialize from localStorage.
  useEffect(() => {
    const tokens = getStoredTokens();
    if (!tokens) {
      setState((prev) => ({ ...prev, loading: false }));
      return;
    }

    (async () => {
      try {
        const res = await http.get<User>("/auth/me");
        setState({ user: res.data, tokens, loading: false });
      } catch {
        clearStoredTokens();
        setState({ user: null, tokens: null, loading: false });
      }
    })();
  }, []);

  const setAuth = (user: User, tokens: AuthTokens) => {
    storeTokens(tokens);
    setState({ user, tokens, loading: false });
  };

  const clearAuth = () => {
    clearStoredTokens();
    setState({ user: null, tokens: null, loading: false });
  };

  const refreshProfile = async () => {
    const res = await http.get<User>("/auth/me");
    setState((prev) => ({ ...prev, user: res.data }));
  };

  const value: AuthContextValue = {
    ...state,
    setAuth,
    clearAuth,
    refreshProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextValue => {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return ctx;
};
