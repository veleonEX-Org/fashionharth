import type { AuthTokens } from "../types/auth";

const TOKEN_KEY = "fs_template_tokens";

export function getStoredTokens(): AuthTokens | null {
  const raw = localStorage.getItem(TOKEN_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as AuthTokens;
  } catch {
    localStorage.removeItem(TOKEN_KEY);
    return null;
  }
}

export function storeTokens(tokens: AuthTokens): void {
  localStorage.setItem(TOKEN_KEY, JSON.stringify(tokens));
}

export function clearStoredTokens(): void {
  localStorage.removeItem(TOKEN_KEY);
}






