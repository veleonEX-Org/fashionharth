import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchTasks, createTask, fetchCustomers, fetchUsers, updateTask } from "../../api/admin";
import { FormField } from "../../components/forms/FormField";
import { Input } from "../../components/forms/Input";
import { Select } from "../../components/forms/Select";
import { Textarea } from "../../components/forms/Textarea";
import { BackButton } from "../../components/ui/BackButton";
import toast from "react-hot-toast";
import { format, differenceInDays } from "date-fns";

const AdminTasksPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [isAdding, setIsAdding] = useState(false);
  
  // Form state
  const [customerId, setCustomerId] = useState("");
  const [category, setCategory] = useState("Kaftan");
  const [totalAmount, setTotalAmount] = useState("");
  const [amountPaid, setAmountPaid] = useState("");
  const [productionCost, setProductionCost] = useState("");
  const [assignedTo, setAssignedTo] = useState("");
  const [startDate, setStartDate] = useState(format(new Date(), "yyyy-MM-dd"));
  const [dueDate, setDueDate] = useState("");
  const [notes, setNotes] = useState("");

  const { data: tasks, isLoading: tasksLoading } = useQuery({
    queryKey: ["tasks"],
    queryFn: () => fetchTasks(),
  });

  const { data: customers } = useQuery({
    queryKey: ["customers"],
    queryFn: () => fetchCustomers(),
  });

  const { data: users } = useQuery({
    queryKey: ["users"],
    queryFn: () => fetchUsers(),
  });

  const staffs = users?.filter((u: any) => u.role === "staff" || u.role === "admin") || [];

  const createMutation = useMutation({
    mutationFn: createTask,
    onSuccess: () => {
      toast.success("Task created successfully");
      setIsAdding(false);
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      // Reset
      setCustomerId(""); setTotalAmount(""); setAmountPaid(""); setProductionCost(""); setDueDate(""); setNotes("");
    },
  });

  const markCompleteMutation = useMutation({
    mutationFn: (id: number) => updateTask(id, { status: "completed" }),
    onSuccess: () => {
      toast.success("Task marked as completed");
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerId || !dueDate) return toast.error("Please select customer and due date");

    createMutation.mutate({
      customerId: Number(customerId),
      category,
      totalAmount: Number(totalAmount),
      amountPaid: Number(amountPaid),
      productionCost: Number(productionCost),
      assignedTo: assignedTo ? Number(assignedTo) : undefined,
      startDate: startDate || undefined,
      dueDate,
      notes,
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4">
        <BackButton />
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Production Tasks</h1>
            <p className="text-sm text-gray-500">Track orders and manage production deadlines.</p>
          </div>
          <button
            onClick={() => setIsAdding(!isAdding)}
            className="rounded-full bg-black px-6 py-2 text-sm font-bold text-white hover:bg-gray-800 transition-colors"
          >
            {isAdding ? "CANCEL" : "NEW TASK"}
          </button>
        </div>
      </div>

      {isAdding && (
        <form onSubmit={handleSubmit} className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm space-y-4">
           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField label="Select Customer" name="customer" required>
                 <Select
                    value={customerId}
                    onChange={(e) => setCustomerId(e.target.value)}
                    options={[
                       { label: "Select a customer", value: "" },
                       ...(customers?.map((c: any) => ({ label: c.name, value: c.id.toString() })) || [])
                    ]}
                 />
              </FormField>
              <FormField label="Category" name="category" required>
                 <Select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    options={[
                       { label: "Kaftan", value: "Kaftan" },
                       { label: "Suit", value: "Suit" },
                       { label: "Agbada", value: "Agbada" },
                       { label: "Other", value: "Other" },
                    ]}
                 />
              </FormField>
              <FormField label="Total Amount Charged" name="total">
                 <Input type="number" value={totalAmount} onChange={(e) => setTotalAmount(e.target.value)} placeholder="0.00" />
              </FormField>
              <FormField label="Amount Paid" name="paid">
                 <Input type="number" value={amountPaid} onChange={(e) => setAmountPaid(e.target.value)} placeholder="0.00" />
              </FormField>
              <FormField label="Production Cost" name="cost">
                 <Input type="number" value={productionCost} onChange={(e) => setProductionCost(e.target.value)} placeholder="0.00" />
              </FormField>
              <FormField label="Assign To (Staff)" name="staff">
                 <Select
                    value={assignedTo}
                    onChange={(e) => setAssignedTo(e.target.value)}
                    options={[
                       { label: "Unassigned", value: "" },
                       ...(staffs?.map((s: any) => ({ label: s.firstName + " " + s.lastName, value: s.id.toString() })) || [])
                    ]}
                 />
              </FormField>
              <FormField label="Start Date" name="start">
                 <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
              </FormField>
              <FormField label="Due Date" name="due" required>
                 <Input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
              </FormField>
           </div>
           
           <FormField label="Notes" name="notes">
              <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Additional instructions..." />
           </FormField>

           <button
             type="submit"
             disabled={createMutation.isPending}
             className="w-full rounded-full bg-primary py-3 text-sm font-bold text-white hover:opacity-90 transition-opacity"
           >
             {createMutation.isPending ? "REGISTERING..." : "REGISTER TASK"}
           </button>
        </form>
      )}

      {/* Desktop Table */}
      <div className="hidden md:block overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-50 text-xs font-bold uppercase tracking-wider text-gray-500">
            <tr>
              <th className="px-6 py-4">Customer / Item</th>
              <th className="px-6 py-4">Finance</th>
              <th className="px-6 py-4">Deadline</th>
              <th className="px-6 py-4">Status / Assignee</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {tasks?.map((t: any) => {
              const remains = t.totalAmount - t.amountPaid;
              const isOverdue = new Date(t.deadline) < new Date() && t.status !== "completed";
              
              return (
                <tr key={t.id} className={`hover:bg-gray-50 transition-colors ${isOverdue ? "bg-red-50" : ""}`}>
                  <td className="px-6 py-4">
                    <div className="font-bold text-gray-900">{t.customerName}</div>
                    <div className="text-xs text-gray-500">{t.customerPhone}</div>
                    <div className="text-xs text-primary uppercase font-bold">{t.category}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-gray-900 font-medium">${t.totalAmount}</div>
                    <div className={`text-xs ${remains > 0 ? "text-red-500 font-bold" : "text-green-500"}`}>
                       {remains > 0 ? `Unpaid: $${remains}` : "Fully Paid"}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className={`font-bold ${isOverdue ? "text-red-600" : "text-gray-900"}`}>
                       {format(new Date(t.deadline), "MMM d, yyyy")}
                    </div>
                    <div className="text-xs text-gray-400">Due: {format(new Date(t.dueDate), "MMM d")}</div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-block rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${
                       t.status === "completed" ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"
                    }`}>
                       {t.status}
                    </span>
                    <div className="text-xs text-gray-500 mt-1">@{t.assigneeName || "Unassigned"}</div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    {t.status !== "completed" && (
                       <button
                         onClick={() => markCompleteMutation.mutate(t.id)}
                         className="text-xs font-bold text-primary hover:text-black uppercase"
                       >
                         Mark Complete
                       </button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {tasksLoading && <div className="p-8 text-center text-gray-400">Loading tasks...</div>}
        {tasks?.length === 0 && !tasksLoading && <div className="p-8 text-center text-gray-400">No tasks found.</div>}
      </div>

      {/* Mobile Optimized View */}
      <div className="md:hidden space-y-4">
         {tasksLoading && <div className="p-8 text-center text-gray-400">Loading tasks...</div>}
         {tasks?.map((t: any) => {
            const remains = t.totalAmount - t.amountPaid;
            const isOverdue = new Date(t.deadline) < new Date() && t.status !== "completed";
            
            return (
               <div key={t.id} className={`rounded-xl border border-gray-200 bg-white p-5 shadow-sm space-y-4 ${isOverdue ? "border-red-200 bg-red-50/30" : ""}`}>
                  <div className="flex items-start justify-between">
                     <div>
                        <div className="font-bold text-gray-900">{t.customerName}</div>
                        <div className="text-xs text-primary uppercase font-bold mt-0.5">{t.category}</div>
                     </div>
                     <span className={`inline-block rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${
                        t.status === "completed" ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"
                     }`}>
                        {t.status}
                     </span>
                  </div>

                  <div className="grid grid-cols-2 gap-4 py-3 border-y border-gray-100">
                     <div>
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Status</span>
                        <div className="text-xs text-gray-500 mt-1">@{t.assigneeName || "Unassigned"}</div>
                     </div>
                     <div>
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Deadline</span>
                        <div className={`text-xs font-bold mt-1 ${isOverdue ? "text-red-600" : "text-gray-900"}`}>
                           {format(new Date(t.deadline), "MMM d, yyyy")}
                        </div>
                     </div>
                  </div>

                  <div className="flex items-center justify-between">
                     <div>
                        <div className="text-sm font-bold text-gray-900">${t.totalAmount}</div>
                        <div className={`text-[10px] font-bold ${remains > 0 ? "text-red-500" : "text-green-500"}`}>
                           {remains > 0 ? `-$${remains} UNPAID` : "FULLY PAID"}
                        </div>
                     </div>
                     {t.status !== "completed" && (
                        <button
                          onClick={() => markCompleteMutation.mutate(t.id)}
                          className="rounded-full bg-primary/10 px-4 py-2 text-xs font-bold text-primary hover:bg-primary hover:text-white transition-colors"
                        >
                          MARK DONE
                        </button>
                     )}
                  </div>
               </div>
            );
         })}
         {tasks?.length === 0 && !tasksLoading && <div className="p-8 text-center text-gray-400">No tasks found.</div>}
      </div>
    </div>
  );
};

export default AdminTasksPage;
