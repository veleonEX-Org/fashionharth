import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { GoogleLogin } from "@react-oauth/google";
import { useAuth } from "../state/AuthContext";
import { http } from "../api/http";
import type { AuthTokens, User } from "../types/auth";
import { loginSchema } from "../validation/authSchemas";
import type { GoogleOAuthRequest } from "../types/oauth";
import { Input } from "../components/forms/Input";
import { Label } from "../components/forms/Label";

interface LocationState {
  from?: { 
    pathname?: string;
    search?: string;
    hash?: string;
  };
}

const LoginPage: React.FC = () => {
  const { setAuth } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as LocationState | undefined;

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [showResendButton, setShowResendButton] = useState(false);
  const [unverifiedEmail, setUnverifiedEmail] = useState("");

  const loginMutation = useMutation({
    mutationFn: async (values: { email: string; password: string }) => {
      const res = await http.post<{ user: User; tokens: AuthTokens }>(
        "/auth/login",
        values
      );
      return res.data;
    },
    onSuccess: (data) => {
      setAuth(data.user, data.tokens);
      toast.success(`Welcome back, ${data.user.firstName}!`);
      const from = state?.from;
      const isAuthPage = from?.pathname === "/login" || from?.pathname === "/register" || from?.pathname?.includes("/verify-email") || from?.pathname?.includes("/reset-password");
      const redirectTo = from && !isAuthPage
        ? `${from.pathname ?? ""}${from.search ?? ""}${from.hash ?? ""}` 
        : "/dashboard";
      navigate(redirectTo || "/dashboard", { replace: true });
    },
    onError: (err: any) => {
      // Check if error is related to email verification
      const errorMessage = err?.response?.data?.message || err.message;
      if (
        errorMessage?.toLowerCase().includes("verify your email") ||
        errorMessage?.toLowerCase().includes("email verification")
      ) {
        setError(errorMessage);
        setShowResendButton(true);
        setUnverifiedEmail(email);
      } else {
        setError(errorMessage);
        setShowResendButton(false);
      }
    },
  });

  const resendMutation = useMutation({
    mutationFn: async (email: string) => {
      await http.post("/auth/resend-verification", { email });
    },
    onSuccess: () => {
      toast.success("Verification email has been resent! Please check your inbox.");
    },
  });

  const oauthMutation = useMutation({
    mutationFn: async (payload: GoogleOAuthRequest) => {
      const res = await http.post<{ user: User; tokens: AuthTokens }>(
        "/auth/oauth/google",
        payload
      );
      return res.data;
    },
    onSuccess: (data) => {
      setAuth(data.user, data.tokens);
      toast.success(`Welcome, ${data.user.firstName}!`);
      const from = state?.from;
      const isAuthPage = from?.pathname === "/login" || from?.pathname === "/register" || from?.pathname?.includes("/verify-email") || from?.pathname?.includes("/reset-password");
      const redirectTo = from && !isAuthPage
        ? `${from.pathname ?? ""}${from.search ?? ""}${from.hash ?? ""}` 
        : "/dashboard";
      navigate(redirectTo || "/dashboard", { replace: true });
    },
    // Error handling is done globally in queryClient
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setShowResendButton(false);

    const parsed = loginSchema.safeParse({ email, password });
    if (!parsed.success) {
      const firstError = parsed.error.issues[0]?.message ?? "Invalid input.";
      setError(firstError);
      return;
    }

    loginMutation.mutate(parsed.data);
  };

  const handleResendVerification = () => {
    if (unverifiedEmail) {
      resendMutation.mutate(unverifiedEmail);
    }
  };

  const handleGoogleSuccess = (credentialResponse: any) => {
    if (credentialResponse.credential) {
      oauthMutation.mutate({ idToken: credentialResponse.credential });
    }
  };

  return (
    <div className="mx-auto max-w-md rounded-xl border border-border bg-card p-6 shadow">
      <h1 className="mb-4 text-xl font-semibold">Login</h1>
      {error && (
        <div className="mb-3 space-y-2">
          <p className="text-xs text-destructive">{error}</p>
          {showResendButton && (
            <button
              onClick={handleResendVerification}
              disabled={resendMutation.isPending}
              className="w-full rounded-md border border-warning/50 bg-warning/10 px-3 py-2 text-xs font-medium text-warning hover:bg-warning/20 disabled:cursor-not-allowed disabled:opacity-60 transition-colors"
            >
              {resendMutation.isPending
                ? "Resending..."
                : "📧 Resend Verification Email"}
            </button>
          )}
        </div>
      )}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
            required
          />
        </div>
        <div className="space-y-1">
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
            required
          />
        </div>
        <div className="flex items-center justify-between text-xs">
          <Link to="/forgot-password" state={location.state} className="text-primary hover:underline">
            Forgot password?
          </Link>
        </div>
        <button
          type="submit"
          disabled={loginMutation.isPending}
          className="flex w-full items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loginMutation.isPending ? "Signing in..." : "Sign in"}
        </button>
      </form>
      <div className="mt-4 border-t border-border pt-4 flex justify-center">
        <GoogleLogin
          onSuccess={handleGoogleSuccess}
          onError={() => {
            console.error("Google Login Failed");
            toast.error("Google Login Failed");
          }}
          theme="filled_black"
          shape="rectangular"
          width="100%"
        />
      </div>
      <p className="mt-4 text-xs text-muted-foreground">
        Don&apos;t have an account?{" "}
        <Link to="/register" state={location.state} className="text-primary hover:underline">
          Sign up
        </Link>
      </p>
    </div>
  );
};

export default LoginPage;
