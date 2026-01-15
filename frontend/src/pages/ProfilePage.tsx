import React, { useEffect, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { useAuth } from "../state/AuthContext";
import { http } from "../api/http";
import type { User } from "../types/auth";
import {
  profileUpdateSchema,
  changePasswordSchema,
} from "../validation/authSchemas";
import { Input } from "../components/forms/Input";
import { Label } from "../components/forms/Label";
import { BackButton } from "../components/ui/BackButton";

const ProfilePage: React.FC = () => {
  const { user, refreshProfile } = useAuth();
  const [firstName, setFirstName] = useState(user?.firstName ?? "");
  const [lastName, setLastName] = useState(user?.lastName ?? "");
  const [validationError, setValidationError] = useState<string | null>(null);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [showPasswordForm, setShowPasswordForm] = useState(false);

  const mutation = useMutation({
    mutationFn: async (payload: { firstName: string; lastName: string }) => {
      const res = await http.put<User>("/auth/me", payload);
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

  const changePasswordMutation = useMutation({
    mutationFn: async (payload: unknown) => {
      await http.post("/auth/change-password", payload);
    },
    onSuccess: () => {
      toast.success("Password changed successfully!");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmNewPassword("");
      setPasswordError(null);
    },
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

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError(null);

    const parsed = changePasswordSchema.safeParse({
      currentPassword,
      newPassword,
      confirmNewPassword,
    });

    if (!parsed.success) {
      const firstError = parsed.error.issues[0]?.message ?? "Invalid input.";
      setPasswordError(firstError);
      toast.error(firstError);
      return;
    }

    changePasswordMutation.mutate(parsed.data);
  };

  if (!user) {
    return null;
  }

  return (
    <div className="space-y-6">
      <BackButton />
      <div className="rounded-xl border border-border bg-card p-6 shadow">
        <h1 className="mb-2 text-xl font-semibold">Profile</h1>
        <p className="text-xs text-muted-foreground">
          Manage your basic account information. Email and role are read-only in
          this starter.
        </p>
        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
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
            <Label>Email</Label>
            <div className="rounded-md border border-border bg-muted px-3 py-2 text-sm text-muted-foreground font-medium">
              {user.email}
            </div>
          </div>
          <div className="space-y-1">
            <Label>Role</Label>
            <div className="inline-flex items-center rounded-full border border-border bg-muted px-3 py-1 text-xs uppercase tracking-wide text-muted-foreground font-semibold">
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

      <div className="rounded-xl border border-border bg-card p-6 shadow">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-xl font-semibold">Change Password</h2>
          <button
            type="button"
            onClick={() => setShowPasswordForm(!showPasswordForm)}
            className="text-sm text-primary hover:underline font-medium"
          >
            {showPasswordForm ? "Hide Password Form" : "Show Password Form"}
          </button>
        </div>
        
        {!showPasswordForm && (
            <p className="text-xs text-muted-foreground">
              Update your password securely.
            </p>
        )}

        {showPasswordForm && (
          <>
            <p className="text-xs text-muted-foreground">
              Update your password securely.
            </p>
            <form onSubmit={handlePasswordSubmit} className="mt-4 space-y-4">
              <div className="space-y-1">
                <Label htmlFor="currentPassword">Current Password</Label>
                <Input
                  id="currentPassword"
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="newPassword">New Password</Label>
                <Input
                  id="newPassword"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="confirmNewPassword">Confirm New Password</Label>
                <Input
                  id="confirmNewPassword"
                  type="password"
                  value={confirmNewPassword}
                  onChange={(e) => setConfirmNewPassword(e.target.value)}
                  required
                />
              </div>
              <button
                type="submit"
                disabled={changePasswordMutation.isPending}
                className="mt-2 inline-flex items-center justify-center rounded-md bg-destructive px-4 py-2 text-sm font-medium text-destructive-foreground hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {changePasswordMutation.isPending
                  ? "Updating..."
                  : "Update Password"}
              </button>
              {passwordError && (
                <p className="mt-2 text-xs text-destructive">{passwordError}</p>
              )}
            </form>
          </>
        )}
      </div>
    </div>
  );
};

export default ProfilePage;
