import React from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { http } from "../api/http";

interface StaffOverview {
  totalAssignments: number;
  ongoingAssignments: number;
  message: string;
}

const StaffDashboardPage: React.FC = () => {
  const { data, isLoading } = useQuery({
    queryKey: ["staff-overview"],
    queryFn: async () => {
      const res = await http.get<StaffOverview>("/staff/overview");
      return res.data;
    }
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Staff Dashboard</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Your daily operations and production assignments.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <div className="rounded-xl border border-border bg-card p-4 text-sm shadow-sm">
          <p className="text-xs text-muted-foreground font-bold uppercase tracking-wider">Total Assignments</p>
          <p className="mt-1 text-2xl font-semibold text-foreground">
            {isLoading ? "…" : data?.totalAssignments ?? "-"}
          </p>
        </div>
        <div className="rounded-xl border border-border bg-card p-4 text-sm shadow-sm">
          <p className="text-xs text-muted-foreground font-bold uppercase tracking-wider">Ongoing Assignments</p>
          <p className="mt-1 text-2xl font-semibold text-primary">
            {isLoading ? "…" : data?.ongoingAssignments ?? "-"}
          </p>
        </div>
        <div className="rounded-xl border border-border bg-card p-4 text-sm shadow-sm transition-all hover:shadow-md">
          <Link to="/staff/portal" className="block">
             <p className="text-xs text-primary font-bold uppercase tracking-wider">Production Portal</p>
             <p className="mt-1 text-xl font-bold text-foreground underline underline-offset-4">CLICK TO VIEW TASKS →</p>
          </Link>
        </div>
        <div className="rounded-xl border border-border bg-card p-4 text-sm shadow-sm">
          <p className="text-xs text-muted-foreground font-bold uppercase tracking-wider">Status</p>
          <p className="mt-1 text-sm font-medium text-approve">
            {isLoading ? "Loading..." : "Online & Ready"}
          </p>
        </div>
      </div>

      <div className="mt-8 grid gap-6 md:grid-cols-2">
         <Link 
           to="/staff/portal" 
           className="flex items-center justify-between rounded-2xl bg-foreground p-8 text-background transition-all hover:bg-gray-800"
         >
            <div>
               <h2 className="text-2xl font-bold">Manage Ongoing Tasks</h2>
               <p className="text-muted-foreground mt-2">View deadlines and mark tasks as complete in your production queue.</p>
            </div>
            <div className="text-4xl">🧵</div>
         </Link>
         <Link 
           to="/staff/support" 
           className="flex items-center justify-between rounded-2xl bg-primary p-8 text-primary-foreground transition-all hover:bg-primary/90"
         >
            <div>
               <h2 className="text-2xl font-bold">Customer Support</h2>
               <p className="text-primary-foreground/80 mt-2">Respond to customer enquiries and provide assistance.</p>
            </div>
            <div className="text-4xl">💬</div>
         </Link>
      </div>
    </div>
  );
};

export default StaffDashboardPage;
