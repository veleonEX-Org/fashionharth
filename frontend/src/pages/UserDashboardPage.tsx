import React from "react";
import { useAuth } from "../state/AuthContext";
import { useQuery } from "@tanstack/react-query";
import { fetchMyTransactions, fetchMyTasks } from "../api/users";
import { UserTransactionsTable } from "../components/Dashboard/UserTransactionsTable";
import { UserTasksList } from "../components/Dashboard/UserTasksList";

const UserDashboardPage: React.FC = () => {
  const { user } = useAuth();

  const { data: transactions, isLoading: loadingTx } = useQuery({
    queryKey: ['my-transactions'],
    queryFn: fetchMyTransactions
  });

  const { data: tasks, isLoading: loadingTasks } = useQuery({
    queryKey: ['my-tasks'],
    queryFn: fetchMyTasks
  });

  if (!user) return null;

  return (
    <div className="space-y-10 pb-20">
      <div>
        <h1 className="text-3xl font-black tracking-tight text-zinc-900">Welcome back, {user.firstName || 'Fashionista'}</h1>
        <p className="mt-2 text-zinc-500 max-w-2xl">
          Track your orders, manage your payments, and see the status of your bespoke items below.
        </p>
      </div>
      
      {/* Account Overview Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-2xl border border-zinc-100 bg-white p-6 shadow-sm">
          <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest">Account Status</p>
          <div className="mt-2 flex items-center gap-2">
            <div className={`h-2 w-2 rounded-full ${user.isEmailVerified ? 'bg-green-500' : 'bg-orange-500'}`} />
            <span className="text-sm font-bold text-zinc-700">
                {user.isEmailVerified ? "Verified User" : "Verification Pending"}
            </span>
          </div>
        </div>
        <div className="rounded-2xl border border-zinc-100 bg-white p-6 shadow-sm">
            <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest">Active Orders</p>
            <p className="mt-1 text-2xl font-black text-zinc-900">
                {tasks ? tasks.filter(t => t.status !== 'completed').length : '-'}
            </p>
        </div>
        <div className="rounded-2xl border border-zinc-100 bg-white p-6 shadow-sm">
             <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest">Total Spent</p>
              <p className="mt-1 text-2xl font-black text-zinc-900">
                ₦{transactions ? transactions.reduce((acc, t) => acc + Number(t.amount), 0).toLocaleString() : '-'}
              </p>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-10">
        {/* Main Content: Orders */}
        <div className="lg:col-span-2 space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-xl font-black tracking-tight">Active Orders & Production</h2>
            </div>
            {loadingTasks ? (
                <div className="p-10 text-center"><div className="animate-spin h-6 w-6 border-2 border-black border-t-transparent rounded-full mx-auto"/></div>
            ) : (
                <UserTasksList tasks={tasks || []} />
            )}
        </div>

        {/* Sidebar: Transaction History */}
        <div className="space-y-6">
            <h2 className="text-xl font-black tracking-tight">Payment History</h2>
            <div className="rounded-2xl border border-zinc-100 bg-white shadow-sm overflow-hidden">
                {loadingTx ? (
                    <div className="p-10 text-center"><div className="animate-spin h-6 w-6 border-2 border-black border-t-transparent rounded-full mx-auto"/></div>
                ) : (
                    <div className="p-4">
                        <UserTransactionsTable transactions={transactions || []} />
                    </div>
                )}
            </div>
        </div>
      </div>
    </div>
  );
};

export default UserDashboardPage;






