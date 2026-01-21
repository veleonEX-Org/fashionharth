import React, { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchTasks } from "../../api/admin";
import { BackButton } from "../../components/ui/BackButton";
import { format, subDays, startOfYear, startOfMonth, startOfWeek, endOfDay, parseISO } from "date-fns";
import { Task } from "../../types/task";

const AdminFinancePage: React.FC = () => {
  const [dateRange, setDateRange] = useState<string>("all");
  const [customStart, setCustomStart] = useState<string>("");
  const [customEnd, setCustomEnd] = useState<string>("");

  const { minDate, maxDate } = useMemo(() => {
    const now = new Date();
    let min: Date | undefined;
    let max: Date | undefined = endOfDay(now);

    switch (dateRange) {
      case "year":
        min = startOfYear(now);
        break;
      case "month":
        min = startOfMonth(now);
        break;
      case "week":
        min = startOfWeek(now);
        break;
      case "custom":
        if (customStart) min = new Date(customStart);
        if (customEnd) max = endOfDay(new Date(customEnd));
        break;
      case "all":
      default:
        min = undefined;
        max = undefined;
        break;
    }

    return {
      minDate: min ? min.toISOString() : undefined,
      maxDate: max ? max.toISOString() : undefined
    };
  }, [dateRange, customStart, customEnd]);

  const { data: tasks, isLoading } = useQuery({
    queryKey: ["tasks", "finance", minDate, maxDate],
    queryFn: () => fetchTasks({ minDate, maxDate }),
  });

  const stats = useMemo(() => {
    if (!tasks) return { revenue: 0, received: 0, cost: 0, profit: 0, count: 0 };
    
    return tasks.reduce((acc: any, t: any) => {
      const revenue = Number(t.totalAmount) || 0;
      const received = Number(t.amountPaid) || 0;
      const cost = Number(t.productionCost) || 0;
      // Profit based on Charged Amount - Cost. Alternatively could be Received - Cost.
      // Usually "Revenue" in accounting is what you charged (Accrual).
      // "Profit" = Revenue - Expenses.
      const profit = revenue - cost;

      return {
        revenue: acc.revenue + revenue,
        received: acc.received + received,
        cost: acc.cost + cost,
        profit: acc.profit + profit,
        count: acc.count + 1
      };
    }, { revenue: 0, received: 0, cost: 0, profit: 0, count: 0 });
  }, [tasks]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4">
        <BackButton />
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Financial Overview</h1>
            <p className="text-sm text-gray-500">Track revenue, production costs, and profit profitability.</p>
          </div>
          
          <div className="flex items-center gap-2 bg-white p-1 rounded-lg border border-gray-200 shadow-sm">
             <select 
                value={dateRange} 
                onChange={(e) => setDateRange(e.target.value)}
                className="bg-transparent border-none text-sm font-bold text-gray-700 focus:ring-0 cursor-pointer py-1 px-3"
             >
                <option value="all">All Time</option>
                <option value="year">This Year</option>
                <option value="month">This Month</option>
                <option value="week">This Week</option>
                <option value="custom">Custom Range</option>
             </select>
          </div>
        </div>
      </div>

      {dateRange === "custom" && (
         <div className="flex items-center gap-4 bg-gray-50 p-4 rounded-xl border border-gray-200">
            <div className="flex flex-col gap-1">
               <label className="text-xs font-bold text-gray-500 uppercase">From</label>
               <input 
                  type="date" 
                  value={customStart}
                  onChange={(e) => setCustomStart(e.target.value)}
                  className="rounded-lg border-gray-200 text-sm"
               />
            </div>
            <div className="flex flex-col gap-1">
               <label className="text-xs font-bold text-gray-500 uppercase">To</label>
               <input 
                  type="date" 
                  value={customEnd}
                  onChange={(e) => setCustomEnd(e.target.value)}
                  className="rounded-lg border-gray-200 text-sm"
               />
            </div>
         </div>
      )}

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
           <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Total Revenue (Charged)</p>
           <p className="mt-2 text-2xl font-bold text-gray-900">
              {isLoading ? "..." : `₦${stats.revenue.toLocaleString()}`}
           </p>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
           <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Cash Collected</p>
           <p className="mt-2 text-2xl font-bold text-green-600">
              {isLoading ? "..." : `₦${stats.received.toLocaleString()}`}
           </p>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
           <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Production Cost</p>
           <p className="mt-2 text-2xl font-bold text-red-600">
              {isLoading ? "..." : `₦${stats.cost.toLocaleString()}`}
           </p>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm bg-gradient-to-br from-gray-900 to-black text-white">
           <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Net Profit</p>
           <p className="mt-2 text-2xl font-bold text-white">
              {isLoading ? "..." : `₦${stats.profit.toLocaleString()}`}
           </p>
           <p className="text-xs text-gray-400 mt-1">Based on Total Charged - Cost</p>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
        <div className="px-6 py-4 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
           <h3 className="font-bold text-gray-900">Transactions ({stats.count})</h3>
        </div>
        <div className="overflow-x-auto">
           <table className="w-full text-left text-sm">
             <thead className="bg-white text-xs font-bold uppercase tracking-wider text-gray-500 border-b border-gray-100">
               <tr>
                 <th className="px-6 py-4">Date</th>
                 <th className="px-6 py-4">Customer</th>
                 <th className="px-6 py-4">Category</th>
                 <th className="px-6 py-4 text-right">Charged</th>
                 <th className="px-6 py-4 text-right">Paid</th>
                 <th className="px-6 py-4 text-right">Cost</th>
                 <th className="px-6 py-4 text-right">Profit</th>
               </tr>
             </thead>
             <tbody className="divide-y divide-gray-50">
               {isLoading && (
                  <tr>
                     <td colSpan={7} className="px-6 py-8 text-center text-gray-400">Loading data...</td>
                  </tr>
               )}
               {tasks?.map((t: any) => {
                 const revenue = Number(t.totalAmount) || 0;
                 const cost = Number(t.productionCost) || 0;
                 const paid = Number(t.amountPaid) || 0;
                 const profit = revenue - cost;
                 
                 return (
                   <tr key={t.id} className="hover:bg-gray-50 transition-colors">
                     <td className="px-6 py-4 text-gray-600">
                        {t.createdAt ? format(parseISO(t.createdAt), "MMM d, yyyy") : "-"}
                     </td>
                     <td className="px-6 py-4 font-medium text-gray-900">
                        {t.customerName}
                     </td>
                     <td className="px-6 py-4">
                        <span className="inline-block rounded-md bg-gray-100 px-2 py-1 text-xs font-bold text-gray-600 uppercase">
                           {t.category}
                        </span>
                     </td>
                     <td className="px-6 py-4 text-right font-medium text-gray-900">
                        ₦{revenue.toLocaleString()}
                     </td>
                     <td className="px-6 py-4 text-right font-medium text-green-600">
                        ₦{paid.toLocaleString()}
                     </td>
                     <td className="px-6 py-4 text-right font-medium text-red-600">
                        -₦{cost.toLocaleString()}
                     </td>
                     <td className="px-6 py-4 text-right font-bold text-gray-900">
                        ₦{profit.toLocaleString()}
                     </td>
                   </tr>
                 );
               })}
               {!isLoading && tasks?.length === 0 && (
                  <tr>
                     <td colSpan={7} className="px-6 py-8 text-center text-gray-400">No transactions found for this period.</td>
                  </tr>
               )}
             </tbody>
           </table>
        </div>
      </div>
    </div>
  );
};

export default AdminFinancePage;
