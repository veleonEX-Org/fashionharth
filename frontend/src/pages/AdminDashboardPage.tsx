import React from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { http } from "../api/http";

interface AdminStats {
  totalUsers: number;
  activeSessions: number;
  totalItems: number;
  totalTasks: number;
  message: string;
}

const AdminDashboardPage: React.FC = () => {
  const { data, isLoading } = useQuery({
    queryKey: ["admin-stats"],
    queryFn: async () => {
      const res = await http.get<AdminStats>("/admin/stats");
      return res.data;
    }
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Admin Dashboard</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Welcome back. Here's what's happening today.
          </p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <div className="rounded-xl border border-border bg-card p-4 text-sm shadow-sm transition-all hover:shadow-md">
          <p className="text-xs text-muted-foreground font-bold uppercase tracking-wider">Total users</p>
          <p className="mt-1 text-2xl font-semibold text-foreground">
            {isLoading ? "…" : data?.totalUsers ?? "-"}
          </p>
        </div>
        <div className="rounded-xl border border-border bg-card p-4 text-sm shadow-sm transition-all hover:shadow-md">
          <p className="text-xs text-muted-foreground font-bold uppercase tracking-wider">Active sessions</p>
          <p className="mt-1 text-2xl font-semibold text-foreground">
            {isLoading ? "…" : data?.activeSessions ?? "-"}
          </p>
        </div>
        <div className="rounded-xl border border-border bg-card p-4 text-sm shadow-sm transition-all hover:shadow-md">
          <p className="text-xs text-muted-foreground font-bold uppercase tracking-wider">Production Tasks</p>
          <p className="mt-1 text-2xl font-semibold text-primary">
            {isLoading ? "…" : data?.totalTasks ?? "-"}
          </p>
        </div>
        <div className="rounded-xl border border-border bg-card p-4 text-sm shadow-sm transition-all hover:shadow-md">
          <p className="text-xs text-muted-foreground font-bold uppercase tracking-wider">Status</p>
          <p className="mt-1 text-sm font-medium text-approve">
            {isLoading ? "Loading..." : "System Online"}
          </p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 pt-6">
        <Link to="/admin/items" className="group rounded-2xl border border-border bg-card p-6 shadow-sm transition-all hover:shadow-xl hover:-translate-y-1">
          <div className="mb-4 text-3xl">👗</div>
          <h3 className="font-bold text-foreground group-hover:text-primary transition-colors">Manage Dresses</h3>
          <p className="text-xs text-muted-foreground mt-2">Post new designs and manage categories.</p>
        </Link>
        <Link to="/admin/customers" className="group rounded-2xl border border-border bg-card p-6 shadow-sm transition-all hover:shadow-xl hover:-translate-y-1">
          <div className="mb-4 text-3xl">👥</div>
          <h3 className="font-bold text-foreground group-hover:text-primary transition-colors">Customers</h3>
          <p className="text-xs text-muted-foreground mt-2">Manage measurements and client data.</p>
        </Link>
        <Link to="/admin/tasks" className="group rounded-2xl border border-border bg-card p-6 shadow-sm transition-all hover:shadow-xl hover:-translate-y-1">
          <div className="mb-4 text-3xl">🧵</div>
          <h3 className="font-bold text-foreground group-hover:text-primary transition-colors">Production</h3>
          <p className="text-xs text-muted-foreground mt-2">Track tasks and production deadlines.</p>
        </Link>
        <Link to="/admin/users" className="group rounded-2xl border border-border bg-card p-6 shadow-sm transition-all hover:shadow-xl hover:-translate-y-1">
          <div className="mb-4 text-3xl">🛡️</div>
          <h3 className="font-bold text-foreground group-hover:text-primary transition-colors">Users & Staff</h3>
          <p className="text-xs text-muted-foreground mt-2">Manage roles and permissions.</p>
        </Link>
      </div>
    </div>
  );
};

export default AdminDashboardPage;
