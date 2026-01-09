import React from "react";
import { useAuth } from "../state/AuthContext";

const UserDashboardPage: React.FC = () => {
  const { user } = useAuth();

  if (!user) return null;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Your dashboard</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          This area is dedicated to regular users. Customize it with your product&apos;s core
          experience.
        </p>
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-xl border border-border bg-card p-4 text-sm">
          <p className="text-xs text-muted-foreground">Account</p>
          <p className="mt-1 text-sm text-foreground">{user.email}</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-4 text-sm">
          <p className="text-xs text-muted-foreground">Status</p>
          <p className="mt-1 text-sm text-foreground">
            {user.isEmailVerified ? "Email verified" : "Email verification pending"}
          </p>
        </div>
        <div className="rounded-xl border border-border bg-card p-4 text-sm">
          <p className="text-xs text-muted-foreground">Role</p>
          <p className="mt-1 text-sm text-foreground">{user.role}</p>
        </div>
      </div>
    </div>
  );
};

export default UserDashboardPage;






