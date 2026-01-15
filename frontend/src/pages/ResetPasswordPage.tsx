import React, { useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { http } from "../api/http";
import { resetPasswordSchema } from "../validation/authSchemas";
import { Input } from "../components/forms/Input";
import { Label } from "../components/forms/Label";

const ResetPasswordPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get("token");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [validationError, setValidationError] = useState<string | null>(null);

  const mutation = useMutation({
    mutationFn: async (payload: { token: string; password: string }) => {
      await http.post("/auth/reset-password", payload);
    },
    onSuccess: () => {
      toast.success("Password has been reset. You can now log in.");
      setPassword("");
      setConfirmPassword("");
      setValidationError(null);
      setTimeout(() => navigate("/login"), 2000);
    },
    // Error handling is done globally in queryClient
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);

    if (!token) {
      const errorMsg = "Missing reset token.";
      setValidationError(errorMsg);
      toast.error(errorMsg);
      return;
    }

    const parsed = resetPasswordSchema.safeParse({ password, confirmPassword });
    if (!parsed.success) {
      const firstError = parsed.error.issues[0]?.message ?? "Invalid input.";
      setValidationError(firstError);
      toast.error(firstError);
      return;
    }

    mutation.mutate({ token, password: parsed.data.password });
  };

  return (
    <div className="mx-auto max-w-md rounded-xl border border-border bg-card p-6 shadow">
      <h1 className="mb-4 text-xl font-semibold">Reset password</h1>
      {validationError && (
        <p className="mb-3 text-xs text-destructive">{validationError}</p>
      )}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1">
          <Label htmlFor="password">New password</Label>
          <Input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <div className="space-y-1">
          <Label htmlFor="confirmPassword">Confirm new password</Label>
          <Input
            id="confirmPassword"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />
        </div>
        <button
          type="submit"
          disabled={mutation.isPending}
          className="flex w-full items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {mutation.isPending ? "Resetting..." : "Reset password"}
        </button>
      </form>
    </div>
  );
};

export default ResetPasswordPage;
