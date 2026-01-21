import React from "react";
import { useAuth } from "../state/AuthContext";
import { useQuery } from "@tanstack/react-query";
import { fetchMyTransactions, fetchMyTasks } from "../api/users";
import { UserTransactionsTable } from "../components/Dashboard/UserTransactionsTable";
import { UserTasksList } from "../components/Dashboard/UserTasksList";
import { Wallet, ShoppingBag } from "lucide-react";

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

  const totalSpent = React.useMemo(() => {
    if (!transactions) return 0;
    return transactions.reduce((acc, t) => acc + Number(t.amount), 0);
  }, [transactions]);

  const pendingInstallments = React.useMemo(() => {
    if (!tasks) return 0;
    return tasks.reduce((acc, t) => {
      if (t.installments) {
        return acc + t.installments.filter(i => i.status !== 'paid' && i.status !== 'succeeded').length;
      }
      return acc;
    }, 0);
  }, [tasks]);

  if (!user) return null;

  return (
    <div className="space-y-6 md:space-y-10 pb-20">
      <div>
        <h1 className="text-xl md:text-3xl font-black tracking-tight text-zinc-900">Welcome back, {(user.firstName || 'Fashionista').charAt(0).toUpperCase() + (user.firstName || 'Fashionista').slice(1)}</h1>
        <p className="mt-2 text-zinc-500 max-w-2xl">
          Track your orders, manage your payments, and see the status of your bespoke items below.
        </p>
      </div>
      
      {/* Unified Account Overview Card */}
      <div className="rounded-3xl border border-zinc-100 bg-white p-2 shadow-sm overflow-hidden">
        <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-zinc-50">
          {/* Total Spent */}
          <div className="md:p-6 p-2 flex items-start gap-4 hover:bg-zinc-50/50 transition-colors">
            <div className="p-3 bg-zinc-900 rounded-2xl">
              <Wallet className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest">Total Spent</p>
              <div className="flex items-baseline gap-2">
                <p className="mt-1 text-lg md:text-2xl font-black text-zinc-900 italic tracking-tight">
                  ₦{totalSpent.toLocaleString()}
                </p>
                {pendingInstallments > 0 && (
                  <span className="text-[10px] font-bold text-orange-600 uppercase italic">
                    {pendingInstallments} Pending Installments
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Active Orders */}
          <div className="md:p-6 p-2 flex items-start gap-4 hover:bg-zinc-50/50 transition-colors">
            <div className="p-3 bg-orange-50 rounded-2xl">
              <ShoppingBag className="w-5 h-5 text-orange-600" />
            </div>
            <div>
              <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest">Active Orders</p>
              <div className="flex items-baseline gap-2">
                <p className="mt-1 md:text-2xl text-lg font-black text-zinc-900 italic tracking-tight">
                  {tasks ? tasks.filter(t => t.status !== 'completed').length : '0'}
                </p>
                <span className="text-[10px] font-bold text-zinc-400 uppercase">Items</span>
              </div>
            </div>
          </div>

          {/* Account Status */}
          {/* <div className="p-6 flex items-start gap-4 hover:bg-zinc-50/50 transition-colors">
            <div className={`p-3 rounded-2xl ${user.isEmailVerified ? 'bg-green-50' : 'bg-orange-50'}`}>
              {user.isEmailVerified ? (
                <ShieldCheck className="w-5 h-5 text-green-600" />
              ) : (
                <ShieldAlert className="w-5 h-5 text-orange-600" />
              )}
            </div>
            <div>
              <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest">Account Status</p>
              <div className="mt-1 flex items-center gap-2">
                <div className={`h-2 w-2 rounded-full ${user.isEmailVerified ? 'bg-green-500 animate-pulse' : 'bg-orange-500'}`} />
                <span className="text-sm font-black text-zinc-900 uppercase tracking-tight">
                    {user.isEmailVerified ? "Verified" : "Pending"}
                </span>
              </div>
            </div>
          </div> */}
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6 lg:gap-10">
        {/* Main Content: Orders */}
        <div className="lg:col-span-2 space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-lg font-black tracking-tight">Orders</h2>
            </div>
            {loadingTasks ? (
                <div className="p-10 text-center"><div className="animate-spin h-6 w-6 border-2 border-black border-t-transparent rounded-full mx-auto"/></div>
            ) : (
                <UserTasksList tasks={tasks || []} />
            )}
        </div>

        {/* Sidebar: Transaction History */}
        <div className="md:space-y-6 space-y-4">
            <h2 className="md:text-xl text-lg font-black tracking-tight">Payment History</h2>
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
