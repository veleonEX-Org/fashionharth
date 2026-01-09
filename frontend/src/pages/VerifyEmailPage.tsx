import React, { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { http } from "../api/http";

const VerifyEmailPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const [status, setStatus] = useState<
    "idle" | "pending" | "success" | "error"
  >("idle");
  const [message, setMessage] = useState<string | null>(null);

  const verifyMutation = useMutation({
    mutationFn: async (payload: { token: string }) => {
      await http.post("/auth/verify-email", payload);
    },
    onSuccess: () => {
      setStatus("success");
      setMessage("Your email has been verified. You can now log in.");
      toast.success("Email verified successfully!");
    },
    onError: () => {
      setStatus("error");
      setMessage("Unable to verify email. The token may be invalid or expired.");
      // Error toast is handled globally
    },
  });

  useEffect(() => {
    if (!token) {
      setStatus("error");
      setMessage("Missing verification token.");
      toast.error("Missing verification token.");
      return;
    }

    setStatus("pending");
    verifyMutation.mutate({ token });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  return (
    <div className="mx-auto max-w-md rounded-xl border border-border bg-muted/60 p-6 shadow">
      <h1 className="mb-4 text-xl font-semibold">Verify email</h1>
      {status === "pending" && (
        <p className="text-sm text-gray-300">Verifying your email...</p>
      )}
      {message && (
        <p
          className={`text-sm ${
            status === "success" ? "text-emerald-400" : "text-red-400"
          }`}
        >
          {message}
        </p>
      )}
    </div>
  );
};

export default VerifyEmailPage;

