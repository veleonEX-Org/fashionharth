import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchTasks, createTask, fetchCustomers, fetchUsers, updateTask } from "../../api/admin";
import { fetchCategories } from "../../api/categories";
import { FormField } from "../../components/forms/FormField";
import { Input } from "../../components/forms/Input";
import { Select } from "../../components/forms/Select";
import { Textarea } from "../../components/forms/Textarea";
import { BackButton } from "../../components/ui/BackButton";
import Modal from "../../components/Modal";
import toast from "react-hot-toast";
import { format, parseISO } from "date-fns";
import { Eye, Clock, CheckCircle2, AlertCircle, MapPin } from "lucide-react";

const AdminTasksPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [isAdding, setIsAdding] = useState(false);
  const [editingTaskId, setEditingTaskId] = useState<number | null>(null);
  const [viewingTask, setViewingTask] = useState<any | null>(null);
  
  // Form state
  const [customerId, setCustomerId] = useState("");
  const [category, setCategory] = useState("");
  const [totalAmount, setTotalAmount] = useState("");
  const [amountPaid, setAmountPaid] = useState("");
  const [productionCost, setProductionCost] = useState("");
  const [assignedTo, setAssignedTo] = useState("");
  const [startDate, setStartDate] = useState(format(new Date(), "yyyy-MM-dd"));
  const [dueDate, setDueDate] = useState("");
  const [notes, setNotes] = useState("");
  const [status, setStatus] = useState("pending");
  const [deliveryDestination, setDeliveryDestination] = useState("");

  // Filter & Sort State
  const [filterStatus, setFilterStatus] = useState("");
  const [filterPayment, setFilterPayment] = useState("");
  const [sortBy, setSortBy] = useState<'deadline' | 'created_at'>("deadline");
  const [sortOrder, setSortOrder] = useState<'ASC' | 'DESC'>("ASC");

  const { data: tasks, isLoading: tasksLoading } = useQuery({
    queryKey: ["tasks", filterStatus, filterPayment, sortBy, sortOrder],
    queryFn: () => fetchTasks({ 
      status: filterStatus || undefined, 
      paymentStatus: filterPayment as 'paid' | 'unpaid' | undefined,
      sortBy,
      sortOrder
    }),
  });

  const { data: customers } = useQuery({
    queryKey: ["customers"],
    queryFn: () => fetchCustomers(),
  });

  const { data: users } = useQuery({
    queryKey: ["users"],
    queryFn: () => fetchUsers(),
  });

  const { data: categories } = useQuery({
    queryKey: ["categories"],
    queryFn: () => fetchCategories(),
  });

  const staffs = users?.filter((u: any) => u.role === "staff" || u.role === "admin") || [];

  const extractOrderTitle = (notes: string | null, category: string) => {
    if (!notes) return category;
    const match = notes.match(/item:\s*([^.]+)/);
    return match ? match[1].trim() : category;
  };

  const createMutation = useMutation({
    mutationFn: createTask,
    onSuccess: () => {
      toast.success("Task created successfully");
      setIsAdding(false);
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      resetForm();
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) => updateTask(id, data),
    onSuccess: () => {
      toast.success("Task updated successfully");
      setEditingTaskId(null);
      setIsAdding(false);
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      resetForm();
    },
  });

  const markCompleteMutation = useMutation({
    mutationFn: (id: number) => updateTask(id, { status: "completed" }),
    onSuccess: () => {
      toast.success("Task marked as completed");
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
    },
  });

  const resetForm = () => {
    setCustomerId("");
    setTotalAmount("");
    setAmountPaid("");
    setProductionCost("");
    setDueDate("");
    setNotes("");
    setCategory(categories?.[0]?.name || "");
    setAssignedTo("");
    setStartDate(format(new Date(), "yyyy-MM-dd"));
    setStatus("pending");
    setDeliveryDestination("");
  };

  const handleEdit = (task: any) => {
    setEditingTaskId(task.id);
    setCustomerId(task.customerId.toString());
    setCategory(task.category);
    setTotalAmount(task.totalAmount.toString());
    setAmountPaid(task.amountPaid.toString());
    setProductionCost(task.productionCost.toString());
    setAssignedTo(task.assignedTo?.toString() || "");
    setStartDate(task.startDate ? format(parseISO(task.startDate), "yyyy-MM-dd") : "");
    setDueDate(task.dueDate ? format(parseISO(task.dueDate), "yyyy-MM-dd") : "");
    setNotes(task.notes || "");
    setStatus(task.status);
    setDeliveryDestination(task.deliveryDestination || "");
    setIsAdding(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerId || !dueDate) return toast.error("Please select customer and due date");

    const payload = {
      customerId: Number(customerId),
      category,
      totalAmount: Number(totalAmount),
      amountPaid: Number(amountPaid),
      productionCost: Number(productionCost),
      assignedTo: assignedTo ? Number(assignedTo) : undefined,
      startDate: startDate || undefined,
      dueDate,
      notes,
      status: status as any,
      deliveryDestination,
    };

    if (editingTaskId) {
      updateMutation.mutate({ id: editingTaskId, data: payload });
    } else {
      createMutation.mutate(payload);
    }
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
            onClick={() => {
              if (isAdding) {
                setIsAdding(false);
                setEditingTaskId(null);
                resetForm();
              } else {
                setIsAdding(true);
                setEditingTaskId(null);
                resetForm();
              }
            }}
            className="rounded-full bg-black px-6 py-2 text-sm font-bold text-white hover:bg-gray-800 transition-colors"
          >
            {isAdding ? "CANCEL" : "NEW TASK"}
          </button>
        </div>
      </div>

      {/* Filters & Sorting */}
      <div className="flex flex-wrap items-center gap-4 bg-gray-50 p-4 rounded-2xl border border-gray-200">
         <div className="w-full sm:w-auto">
            <label className="text-xs font-bold text-gray-500 uppercase ml-1">Status</label>
            <select 
               className="w-full mt-1 rounded-lg border-gray-200 text-sm py-2 px-3 focus:ring-black focus:border-black"
               value={filterStatus}
               onChange={(e) => setFilterStatus(e.target.value)}
            >
               <option value="">All Statuses</option>
               <option value="pending">Pending</option>
               <option value="in_progress">In Progress</option>
               <option value="completed">Completed</option>
            </select>
         </div>
         <div className="w-full sm:w-auto">
            <label className="text-xs font-bold text-gray-500 uppercase ml-1">Payment</label>
            <select 
               className="w-full mt-1 rounded-lg border-gray-200 text-sm py-2 px-3 focus:ring-black focus:border-black"
               value={filterPayment}
               onChange={(e) => setFilterPayment(e.target.value)}
            >
               <option value="">All Payments</option>
               <option value="paid">Fully Paid</option>
               <option value="unpaid">Unpaid / Partial</option>
            </select>
         </div>
         <div className="w-full sm:w-auto">
            <label className="text-xs font-bold text-gray-500 uppercase ml-1">Sort By</label>
            <select 
               className="w-full mt-1 rounded-lg border-gray-200 text-sm py-2 px-3 focus:ring-black focus:border-black"
               value={sortBy}
               onChange={(e) => setSortBy(e.target.value as any)}
            >
               <option value="deadline">Deadline</option>
               <option value="created_at">Date Created</option>
            </select>
         </div>
         <div className="w-full sm:w-auto">
            <label className="text-xs font-bold text-gray-500 uppercase ml-1">Order</label>
            <select 
               className="w-full mt-1 rounded-lg border-gray-200 text-sm py-2 px-3 focus:ring-black focus:border-black"
               value={sortOrder}
               onChange={(e) => setSortOrder(e.target.value as any)}
            >
               <option value="ASC">Ascending (Oldest First)</option>
               <option value="DESC">Descending (Newest First)</option>
            </select>
         </div>
      </div>

      {isAdding && (
        <form onSubmit={handleSubmit} className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm space-y-4">
           <h2 className="text-lg font-bold text-gray-900">{editingTaskId ? "Edit Task" : "Add New Task"}</h2>
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
                       { label: "Select a category", value: "" },
                       ...(categories?.map((cat: any) => ({ label: cat.name, value: cat.name })) || [])
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
           
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               <FormField label="Status" name="status">
                  <Select
                     value={status}
                     onChange={(e) => setStatus(e.target.value)}
                     options={[
                        { label: "Pending", value: "pending" },
                        { label: "In Progress", value: "in_progress" },
                        { label: "Completed", value: "completed" },
                     ]}
                  />
               </FormField>
                <FormField label="Notes" name="notes">
                   <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Additional instructions..." />
                </FormField>
                <FormField label="Delivery Destination" name="destination">
                   <Input value={deliveryDestination} onChange={(e) => setDeliveryDestination(e.target.value)} placeholder="Address or delivery point..." />
                </FormField>
             </div>

            <button
              type="submit"
              disabled={createMutation.isPending || updateMutation.isPending}
              className="w-full rounded-full bg-primary py-3 text-sm font-bold text-white hover:opacity-90 transition-opacity"
            >
              {createMutation.isPending || updateMutation.isPending ? "SAVING..." : editingTaskId ? "UPDATE TASK" : "REGISTER TASK"}
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
              <th className="px-6 py-4">Dates</th>
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
                    <div className="text-[10px] text-primary uppercase font-black tracking-widest mt-0.5">
                        {extractOrderTitle(t.notes, t.category)}
                    </div>
                    {t.deliveryDestination && (
                      <div className="mt-1 text-[10px] text-gray-400 font-medium">
                        📍 {t.deliveryDestination}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-gray-900 font-medium">₦{t.totalAmount.toLocaleString()}</div>
                    <div className={`text-xs ${remains > 0 ? "text-red-500 font-bold" : "text-green-500"}`}>
                       {remains > 0 ? `Unpaid: ₦${remains.toLocaleString()}` : "Fully Paid"}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-2">
                           <span className="text-[10px] font-bold text-gray-400 w-12">DUE</span>
                           <span className={`text-sm font-bold ${isOverdue ? "text-red-600" : "text-gray-900"}`}>
                              {format(new Date(t.deadline), "MMM d, yyyy")}
                           </span>
                        </div>
                        <div className="flex items-center gap-2">
                           <span className="text-[10px] font-bold text-gray-400 w-12">CREATED</span>
                           <span className="text-xs text-gray-500">
                              {t.createdAt ? format(parseISO(t.createdAt), "MMM d, yyyy") : "-"}
                           </span>
                        </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-block rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${
                       t.status === "completed" ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"
                    }`}>
                       {t.status}
                    </span>
                    <div className="text-xs text-gray-500 mt-1">@{t.assigneeName || "Unassigned"}</div>
                  </td>
                  <td className="px-6 py-4 text-right space-x-2">
                    <button
                      onClick={() => setViewingTask(t)}
                      className="text-xs font-bold text-primary hover:text-black uppercase"
                    >
                      View
                    </button>
                    <button
                      onClick={() => handleEdit(t)}
                      className="text-xs font-bold text-gray-500 hover:text-black uppercase"
                    >
                      Edit
                    </button>
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
                        <div className="text-[10px] text-primary uppercase font-black tracking-widest mt-1">
                            {extractOrderTitle(t.notes, t.category)}
                        </div>
                        {t.deliveryDestination && (
                          <div className="mt-1 text-[10px] text-gray-500 font-semibold italic">
                            to: {t.deliveryDestination}
                          </div>
                        )}
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
                         <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Timeline</span>
                         <div className={`text-xs font-bold mt-1 ${isOverdue ? "text-red-600" : "text-gray-900"}`}>
                            Due: {format(new Date(t.deadline), "MMM d")}
                         </div>
                         <div className="text-[10px] text-gray-400">
                            Created: {t.createdAt ? format(parseISO(t.createdAt), "MMM d") : "-"}
                         </div>
                      </div>
                   </div>

                  <div className="flex items-center justify-between">
                     <div>
                        <div className="text-sm font-bold text-gray-900">₦{t.totalAmount.toLocaleString()}</div>
                        <div className={`text-[10px] font-bold ${remains > 0 ? "text-red-500" : "text-green-500"}`}>
                           {remains > 0 ? `-₦${remains.toLocaleString()} UNPAID` : "FULLY PAID"}
                        </div>
                     </div>
                     <div className="flex gap-2">
                        <button
                          onClick={() => setViewingTask(t)}
                          className="rounded-full bg-primary/10 px-4 py-2 text-xs font-bold text-primary hover:bg-primary hover:text-white transition-colors"
                        >
                          VIEW
                        </button>
                        <button
                          onClick={() => handleEdit(t)}
                          className="rounded-full bg-gray-100 px-4 py-2 text-xs font-bold text-gray-600 hover:bg-gray-200 transition-colors"
                        >
                          EDIT
                        </button>
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
               </div>
            );
         })}
         {tasks?.length === 0 && !tasksLoading && <div className="p-8 text-center text-gray-400">No tasks found.</div>}
      </div>

      {/* Task Detail Modal */}
      {viewingTask && (
        <Modal 
          isOpen={!!viewingTask} 
          onClose={() => setViewingTask(null)} 
          title={`Task Details - #${viewingTask.id.toString().padStart(4, '0')}`}
        >
          <div className="space-y-3 pt-0">
            {/* Status & Customer Summary */}
            <div className="flex items-center justify-between p-3 bg-muted/30 rounded-2xl border border-border/50">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-xl border ${
                  viewingTask.status === 'completed' 
                    ? 'text-green-600 bg-green-50 border-green-100' 
                    : viewingTask.status === 'in_progress'
                    ? 'text-blue-600 bg-blue-50 border-blue-100'
                    : 'text-orange-600 bg-orange-50 border-orange-100'
                }`}>
                  {viewingTask.status === 'completed' ? <CheckCircle2 className="w-4 h-4" /> : <Clock className="w-4 h-4 animate-pulse" />}
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground leading-none">
                    {extractOrderTitle(viewingTask.notes, viewingTask.category)}
                  </p>
                  <p className="text-xs font-black uppercase text-foreground mt-1">{viewingTask.status.replace('_', ' ')}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground leading-none">Task ID</p>
                <p className="text-xs font-black text-foreground mt-1">#{viewingTask.id.toString().padStart(4, '0')}</p>
              </div>
            </div>

            {/* Customer Info */}
            <div className="p-3 bg-muted/50 rounded-2xl border border-border">
              <p className="text-[9px] text-muted-foreground font-black uppercase tracking-widest mb-2">Customer</p>
              <div className="font-bold text-gray-900">{viewingTask.customerName}</div>
              <div className="text-xs text-gray-500">{viewingTask.customerPhone}</div>
            </div>

            {/* Finance Grid */}
            <div className="grid grid-cols-3 gap-3">
              <div className="p-3 bg-muted/50 rounded-2xl border border-border">
                <p className="text-[9px] text-muted-foreground font-black uppercase tracking-widest mb-1">Total Value</p>
                <p className="text-xs font-black text-foreground italic">₦{viewingTask.totalAmount.toLocaleString()}</p>
              </div>
              <div className="p-3 bg-muted/50 rounded-2xl border border-border">
                <p className="text-[9px] text-muted-foreground font-black uppercase tracking-widest mb-1">Paid</p>
                <p className="text-xs font-black text-approve italic">₦{viewingTask.amountPaid.toLocaleString()}</p>
              </div>
              <div className="p-3 bg-muted/50 rounded-2xl border border-border">
                <p className="text-[9px] text-muted-foreground font-black uppercase tracking-widest mb-1">Balance</p>
                <p className="text-xs font-black text-red-500 italic">₦{Math.max(0, viewingTask.totalAmount - viewingTask.amountPaid).toLocaleString()}</p>
              </div>
            </div>

            {/* Production Cost */}
            <div className="p-3 bg-muted/50 rounded-2xl border border-border">
              <p className="text-[9px] text-muted-foreground font-black uppercase tracking-widest mb-1">Production Cost</p>
              <p className="text-xs font-black text-foreground italic">₦{viewingTask.productionCost?.toLocaleString() || '0'}</p>
            </div>

            {/* Delivery & Timeline Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {/* Delivery */}
              <div className="p-3 bg-muted/50 rounded-2xl border border-border">
                <p className="text-[9px] text-muted-foreground font-black uppercase tracking-widest mb-1">Delivery Destination</p>
                <div className="flex items-start gap-2">
                  <MapPin className="w-3.5 h-3.5 text-primary shrink-0 mt-0.5" />
                  <p className="text-xs font-bold text-foreground leading-tight line-clamp-2">
                    {viewingTask.deliveryDestination || "No address provided"}
                  </p>
                </div>
              </div>

              {/* Timeline */}
              <div className="p-3 bg-muted/50 rounded-2xl border border-border">
                <p className="text-[9px] text-muted-foreground font-black uppercase tracking-widest mb-1">Timeline</p>
                <div className="space-y-2">
                  {viewingTask.startDate && (
                    <div className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-foreground" />
                      <p className="text-[10px] font-black text-foreground uppercase italic shrink-0">Started:</p>
                      <p className="text-[10px] text-muted-foreground">{format(parseISO(viewingTask.startDate), 'dd/MM/yy')}</p>
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-approve shadow-[0_0_8px_rgba(var(--approve),0.5)]" />
                    <p className="text-[10px] font-black text-foreground uppercase italic shrink-0">Due:</p>
                    <p className="text-[10px] text-muted-foreground">{format(new Date(viewingTask.deadline), 'dd/MM/yy')}</p>
                  </div>
                  {viewingTask.createdAt && (
                    <div className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-gray-400" />
                      <p className="text-[10px] font-black text-foreground uppercase italic shrink-0">Created:</p>
                      <p className="text-[10px] text-muted-foreground">{format(parseISO(viewingTask.createdAt), 'dd/MM/yy')}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Assignee */}
            <div className="p-3 bg-muted/50 rounded-2xl border border-border">
              <p className="text-[9px] text-muted-foreground font-black uppercase tracking-widest mb-1">Assigned To</p>
              <p className="text-xs font-bold text-foreground">@{viewingTask.assigneeName || "Unassigned"}</p>
            </div>

            {/* Production Details */}
            {(viewingTask.productionNotes || viewingTask.notes) && (
              <div className="p-3 bg-orange-50/20 rounded-2xl border border-orange-100/30">
                <div className="flex items-center gap-2 mb-1">
                  <AlertCircle className="w-3.5 h-3.5 text-orange-600" />
                  <p className="text-[9px] text-orange-600 font-black uppercase tracking-widest">Production Analysis</p>
                </div>
                {viewingTask.productionNotes && (
                  <div className="mb-2">
                    <p className="text-[10px] text-orange-800 font-bold uppercase tracking-tight mb-0.5">User Instructions:</p>
                    <p className="text-[11px] text-orange-900/80 leading-relaxed italic">"{viewingTask.productionNotes}"</p>
                  </div>
                )}
                 {viewingTask.quantity && viewingTask.quantity > 1 && (
                  <div className="mb-2">
                    <p className="text-[10px] text-orange-800 font-bold uppercase tracking-tight mb-0.5">Quantity Order:</p>
                    <p className="text-[11px] text-orange-900/80 leading-relaxed font-bold italic">{viewingTask.quantity} Pieces</p>
                  </div>
                )}
                {viewingTask.notes && (
                  <div>
                    <p className="text-[10px] text-orange-800 font-bold uppercase tracking-tight mb-0.5">System Memo:</p>
                    <p className="text-[11px] text-orange-900/80 leading-relaxed italic line-clamp-3">"{viewingTask.notes}"</p>
                  </div>
                )}
              </div>
            )}

            <button 
              onClick={() => setViewingTask(null)}
              className="w-full py-3.5 rounded-2xl bg-foreground text-card text-[11px] font-black uppercase tracking-widest hover:opacity-90 transition-all transform active:scale-[0.98] mt-2 shadow-lg shadow-foreground/10"
            >
              Close Details
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default AdminTasksPage;
