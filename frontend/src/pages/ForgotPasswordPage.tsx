import React, { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { http } from "../api/http";
import { forgotPasswordSchema } from "../validation/authSchemas";
import { Input } from "../components/forms/Input";
import { Label } from "../components/forms/Label";

const ForgotPasswordPage: React.FC = () => {
  const [email, setEmail] = useState("");
  const [validationError, setValidationError] = useState<string | null>(null);

  const mutation = useMutation({
    mutationFn: async (payload: { email: string }) => {
      await http.post("/auth/forgot-password", payload);
    },
    onSuccess: () => {
      toast.success(
        "If an account exists for this email, you will receive a reset link shortly."
      );
      setEmail("");
      setValidationError(null);
    },
    // Error handling is done globally in queryClient
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);

    const parsed = forgotPasswordSchema.safeParse({ email });
    if (!parsed.success) {
      const firstError = parsed.error.issues[0]?.message ?? "Invalid input.";
      setValidationError(firstError);
      toast.error(firstError);
      return;
    }

    mutation.mutate(parsed.data);
  };

  return (
    <div className="mx-auto max-w-md rounded-xl border border-border bg-card p-6 shadow">
      <h1 className="mb-4 text-xl font-semibold">Forgot password</h1>
      {validationError && (
        <p className="mb-3 text-xs text-destructive">{validationError}</p>
      )}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <button
          type="submit"
          disabled={mutation.isPending}
          className="flex w-full items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {mutation.isPending ? "Sending..." : "Send reset link"}
        </button>
      </form>
    </div>
  );
};

export default ForgotPasswordPage;


