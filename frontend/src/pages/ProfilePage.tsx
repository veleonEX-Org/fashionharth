import React, { useEffect, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { useAuth } from "../state/AuthContext";
import { http } from "../api/http";
import type { User } from "../types/auth";
import { profileUpdateSchema } from "../validation/authSchemas";

const ProfilePage: React.FC = () => {
  const { user, refreshProfile } = useAuth();
  const [firstName, setFirstName] = useState(user?.firstName ?? "");
  const [lastName, setLastName] = useState(user?.lastName ?? "");
  const [validationError, setValidationError] = useState<string | null>(null);

  const mutation = useMutation({
    mutationFn: async (payload: { firstName: string; lastName: string }) => {
      const res = await http.put<User>("/users/me", payload);
      return res.data;
    },
    onSuccess: async (updated: User) => {
      await refreshProfile();
      toast.success("Profile updated successfully!");
      setFirstName(updated.firstName);
      setLastName(updated.lastName);
      setValidationError(null);
    },
    // Error handling is done globally in queryClient
  });

  useEffect(() => {
    if (user) {
      setFirstName(user.firstName);
      setLastName(user.lastName);
    }
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);

    const parsed = profileUpdateSchema.safeParse({ firstName, lastName });
    if (!parsed.success) {
      const firstError = parsed.error.issues[0]?.message ?? "Invalid input.";
      setValidationError(firstError);
      toast.error(firstError);
      return;
    }

    mutation.mutate(parsed.data);
  };

  if (!user) {
    return null;
  }

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-border bg-card p-6 shadow">
        <h1 className="mb-2 text-xl font-semibold">Profile</h1>
        <p className="text-xs text-muted-foreground">
          Manage your basic account information. Email and role are read-only in
          this starter.
        </p>
        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div className="flex gap-3">
            <div className="flex-1 space-y-1 text-sm">
              <label className="block text-foreground" htmlFor="firstName">
                First name
              </label>
              <input
                id="firstName"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className="w-full rounded-md border border-border bg-input px-3 py-2 text-sm text-foreground outline-none focus:border-primary"
              />
            </div>
            <div className="flex-1 space-y-1 text-sm">
              <label className="block text-foreground" htmlFor="lastName">
                Last name
              </label>
              <input
                id="lastName"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className="w-full rounded-md border border-border bg-input px-3 py-2 text-sm text-foreground outline-none focus:border-primary"
              />
            </div>
          </div>
          <div className="space-y-1 text-sm">
            <label className="block text-foreground">Email</label>
            <div className="rounded-md border border-border bg-muted px-3 py-2 text-sm text-muted-foreground">
              {user.email}
            </div>
          </div>
          <div className="space-y-1 text-sm">
            <label className="block text-foreground">Role</label>
            <div className="inline-flex items-center rounded-full border border-border bg-muted px-3 py-1 text-xs uppercase tracking-wide text-muted-foreground">
              {user.role}
            </div>
          </div>
          <button
            type="submit"
            disabled={mutation.isPending}
            className="mt-2 inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {mutation.isPending ? "Saving..." : "Save changes"}
          </button>
          {validationError && (
            <p className="mt-2 text-xs text-destructive">{validationError}</p>
          )}
        </form>
      </div>
    </div>
  );
};

export default ProfilePage;
