import React from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { http } from "../api/http";

interface AdminStats {
  totalUsers: number;
  activeSessions: number;
  totalItems: number;
  totalTasks: number;
  totalCustomers: number;
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

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 pt-6">
        <Link to="/admin/items" className="group rounded-2xl border border-border bg-card p-6 shadow-sm transition-all hover:shadow-xl hover:-translate-y-1">
          <div className="flex items-start justify-between mb-4">
            <div className="text-3xl">👗</div>
            <div className="bg-primary/10 text-primary px-3 py-1 rounded-full text-sm font-bold">
              {isLoading ? "…" : data?.totalItems ?? 0}
            </div>
          </div>
          <h3 className="font-bold text-foreground group-hover:text-primary transition-colors">Manage Dresses</h3>
          <p className="text-xs text-muted-foreground mt-2">Post new designs and manage categories.</p>
        </Link>
        <Link to="/admin/customers" className="group rounded-2xl border border-border bg-card p-6 shadow-sm transition-all hover:shadow-xl hover:-translate-y-1">
          <div className="flex items-start justify-between mb-4">
            <div className="text-3xl">👥</div>
            <div className="bg-primary/10 text-primary px-3 py-1 rounded-full text-sm font-bold">
              {isLoading ? "…" : data?.totalCustomers ?? 0}
            </div>
          </div>
          <h3 className="font-bold text-foreground group-hover:text-primary transition-colors">Customers</h3>
          <p className="text-xs text-muted-foreground mt-2">Manage measurements and client data.</p>
        </Link>
        <Link to="/admin/tasks" className="group rounded-2xl border border-border bg-card p-6 shadow-sm transition-all hover:shadow-xl hover:-translate-y-1">
          <div className="flex items-start justify-between mb-4">
            <div className="text-3xl">🧵</div>
            <div className="bg-primary/10 text-primary px-3 py-1 rounded-full text-sm font-bold">
              {isLoading ? "…" : data?.totalTasks ?? 0}
            </div>
          </div>
          <h3 className="font-bold text-foreground group-hover:text-primary transition-colors">Production</h3>
          <p className="text-xs text-muted-foreground mt-2">Track tasks and production deadlines.</p>
        </Link>
        <Link to="/admin/users" className="group rounded-2xl border border-border bg-card p-6 shadow-sm transition-all hover:shadow-xl hover:-translate-y-1">
          <div className="flex items-start justify-between mb-4">
            <div className="text-3xl">🛡️</div>
            <div className="bg-primary/10 text-primary px-3 py-1 rounded-full text-sm font-bold">
              {isLoading ? "…" : data?.totalUsers ?? 0}
            </div>
          </div>
          <h3 className="font-bold text-foreground group-hover:text-primary transition-colors">Users & Staff</h3>
          <p className="text-xs text-muted-foreground mt-2">Manage roles and permissions.</p>
        </Link>
        <Link to="/admin/categories" className="group rounded-2xl border border-border bg-card p-6 shadow-sm transition-all hover:shadow-xl hover:-translate-y-1">
          <div className="mb-4 text-3xl">📏</div>
          <h3 className="font-bold text-foreground group-hover:text-primary transition-colors">Categories</h3>
          <p className="text-xs text-muted-foreground mt-2">Manage dress types and measurements.</p>
        </Link>
        <Link to="/admin/support" className="group rounded-2xl border border-border bg-card p-6 shadow-sm transition-all hover:shadow-xl hover:-translate-y-1">
          <div className="mb-4 text-3xl">💬</div>
          <h3 className="font-bold text-foreground group-hover:text-primary transition-colors">Customer Support</h3>
          <p className="text-xs text-muted-foreground mt-2">Respond to customer enquiries.</p>
        </Link>
      </div>

      <div className="rounded-2xl border border-blue-100 bg-blue-50 p-6">
        <h3 className="text-lg font-bold text-blue-900 mb-2">Trend Crawler</h3>
        <p className="text-sm text-blue-700 mb-4">
          Manually trigger the fashion trend crawler to fetch the latest news from configured sources.
          Use this if you want to update the trending feed immediately.
        </p>
        <CrawlerButton />
      </div>
    </div>
  );
};

import { forceCrawl } from "../api/trending";
import toast from "react-hot-toast";

const CrawlerButton: React.FC = () => {
  const [isLoading, setIsLoading] = React.useState(false);

  const handleCrawl = async () => {
    try {
      setIsLoading(true);
      await forceCrawl();
      toast.success("Crawler started! Check back in a few minutes.");
    } catch (error) {
      toast.error("Failed to start crawler.");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      onClick={handleCrawl}
      disabled={isLoading}
      className="inline-flex items-center justify-center rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-blue-200 transition-all hover:bg-blue-700 hover:shadow-blue-300 disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {isLoading ? (
        <>
          <svg className="mr-2 h-4 w-4 animate-spin text-white" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Starting Crawler...
        </>
      ) : (
        <>
          <span className="mr-2">🔄</span> Sync Now
        </>
      )}
    </button>
  );
};

export default AdminDashboardPage;
