import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { useAuth } from "../state/AuthContext";
import { http } from "../api/http";
import { registerSchema } from "../validation/authSchemas";
import type { RegisterPayload } from "../types/auth";
import Modal from "../components/Modal";
import { Input } from "../components/forms/Input";
import { Label } from "../components/forms/Label";
import { GoogleLogin } from "@react-oauth/google";
import { useNavigate } from "react-router-dom";
import type { GoogleOAuthRequest } from "../types/oauth";
import type { AuthTokens, User } from "../types/auth";

const RegisterPage: React.FC = () => {
  const { clearAuth, setAuth } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [validationError, setValidationError] = useState<string | null>(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [registeredEmail, setRegisteredEmail] = useState("");
  const [verificationLink, setVerificationLink] = useState("");

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
      navigate("/dashboard", { replace: true });
    },
  });

  const registerMutation = useMutation({
    mutationFn: async (payload: RegisterPayload) => {
      const { data } = await http.post<{ verificationLink: string }>("/auth/register", payload);
      return data;
    },
    onSuccess: (data, variables) => {
      clearAuth();
      setRegisteredEmail(variables.email);
      setVerificationLink(data.verificationLink);
      setShowSuccessModal(true);
      setFirstName("");
      setLastName("");
      setEmail("");
      setPassword("");
      setConfirmPassword("");
      setValidationError(null);
    },
    // Error handling is done globally in queryClient
  });

  const resendMutation = useMutation({
    mutationFn: async (email: string) => {
      const { data } = await http.post<{ verificationLink: string }>("/auth/resend-verification", { email });
      return data;
    },
    onSuccess: (data) => {
      setVerificationLink(data.verificationLink);
      toast.success("Verification email has been resent!");
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);

    const parsed = registerSchema.safeParse({
      firstName,
      lastName,
      email,
      password,
      confirmPassword,
    });

    if (!parsed.success) {
      const firstError = parsed.error.issues[0]?.message ?? "Invalid input.";
      setValidationError(firstError);
      toast.error(firstError);
      return;
    }

    const { confirmPassword: _omit, ...payload } = parsed.data;
    registerMutation.mutate(payload);
  };

  const handleResendVerification = () => {
    if (registeredEmail) {
      resendMutation.mutate(registeredEmail);
    }
  };

  const handleGoogleSuccess = (credentialResponse: any) => {
    if (credentialResponse.credential) {
      oauthMutation.mutate({ idToken: credentialResponse.credential });
    }
  };

  return (
    <>
      <div className="mx-auto max-w-md rounded-xl border border-border bg-card p-6 shadow">
        <h1 className="mb-4 text-xl font-semibold">Create an account</h1>
        {validationError && (
          <p className="mb-3 text-xs text-destructive">{validationError}</p>
        )}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex gap-3">
            <div className="flex-1 space-y-1">
              <Label htmlFor="firstName">First name</Label>
              <Input
                id="firstName"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                required
              />
            </div>
            <div className="flex-1 space-y-1">
              <Label htmlFor="lastName">Last name</Label>
              <Input
                id="lastName"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                required
              />
            </div>
          </div>
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
              autoComplete="new-password"
              required
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="confirmPassword">Confirm password</Label>
            <Input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              autoComplete="new-password"
              required
            />
          </div>
          <button
            type="submit"
            disabled={registerMutation.isPending}
            className="flex w-full items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {registerMutation.isPending
              ? "Creating account..."
              : "Create account"}
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

        {verificationLink && (
          <div className="mt-4 break-all rounded-lg bg-yellow-500/10 border border-yellow-500/20 p-3 text-xs">
            <p className="font-medium text-yellow-600 dark:text-yellow-400 mb-1">
              Dev Mode: Verification Link
            </p>
            <a 
              href={verificationLink} 
              className="text-primary underline hover:opacity-80 transition-opacity"
              target="_blank"
              rel="noopener noreferrer"
            >
              {verificationLink}
            </a>
          </div>
        )}
        <p className="mt-4 text-xs text-muted-foreground">
          Already have an account?{" "}
          <Link to="/login" state={location.state} className="text-primary hover:underline">
            Sign in
          </Link>
        </p>
      </div>

      <Modal
        isOpen={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
        title="Registration Successful! 🎉"
      >
        <div className="space-y-4">
          <div className="rounded-lg bg-approve/10 border border-approve/20 p-4">
            <p className="text-sm text-approve font-medium mb-2">
              ✓ Your account has been created successfully!
            </p>
            <p className="text-xs text-muted-foreground">
              We've sent a verification email to{" "}
              <span className="font-semibold text-primary">
                {registeredEmail}
              </span>
            </p>
          </div>

          <div className="space-y-2">
            <p className="text-xs text-muted-foreground">
              Please check your inbox and click the verification link to
              activate your account.
            </p>
            <p className="text-xs text-muted-foreground">
              Didn't receive the email?
            </p>
          </div>

          {verificationLink && (
            <div className="rounded-lg bg-primary/5 border border-primary/10 p-4 space-y-2">
              <p className="text-xs font-semibold text-primary">
                Immediate Verification Link (Dev):
              </p>
              <div className="break-all p-2 bg-background rounded border text-[10px] font-mono">
                <a 
                  href={verificationLink} 
                  className="text-primary hover:underline"
                  target="_blank" 
                  rel="noopener noreferrer"
                >
                  {verificationLink}
                </a>
              </div>
            </div>
          )}

          <button
            onClick={handleResendVerification}
            disabled={resendMutation.isPending}
            className="w-full rounded-md border border-primary/50 bg-primary/10 px-4 py-2 text-sm font-medium text-primary hover:bg-primary/20 disabled:cursor-not-allowed disabled:opacity-60 transition-colors"
          >
            {resendMutation.isPending
              ? "Resending..."
              : "Resend Verification Email"}
          </button>

          <button
            onClick={() => setShowSuccessModal(false)}
            className="w-full rounded-md bg-muted/50 px-4 py-2 text-sm font-medium text-muted-foreground hover:bg-muted transition-colors"
          >
            Close
          </button>
        </div>
      </Modal>
    </>
  );
};

export default RegisterPage;
