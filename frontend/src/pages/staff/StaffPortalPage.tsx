import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchTasks, updateTask } from "../../api/admin";
import { useAuth } from "../../state/AuthContext";
import toast from "react-hot-toast";
import { format } from "date-fns";
import { BackButton } from "../../components/ui/BackButton";

const StaffPortalPage: React.FC = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<"ongoing" | "completed">("ongoing");

  const { data: tasks, isLoading } = useQuery({
    queryKey: ["tasks", user?.id, activeTab],
    queryFn: () => fetchTasks({ 
      assignedTo: user?.id, 
      status: activeTab === "ongoing" ? "ongoing" : "completed" 
    }),
    enabled: !!user?.id,
  });
  
  const extractOrderTitle = (notes: string | null, category: string) => {
    if (!notes) return category;
    const match = notes.match(/item:\s*([^.]+)/);
    return match ? match[1].trim() : category;
  };

  const completeMutation = useMutation({
    mutationFn: (id: number) => updateTask(id, { status: "completed" }),
    onSuccess: () => {
      toast.success("Task completed!");
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
    },
  });

  return (
    <div className="space-y-6">
       {/* <div className="md:flex md:flex-row flex-col items-center justify-between border-b border-border pb-4"> */}
       <div className="md:flex md:flex-row flex-col items-center justify-between border-b border-border pb-4">
          <div className="flex flex-col gap-4 flex-1">
            <BackButton to="/dashboard" />
            <div>
             <h1 className="md:text-2xl text-xl font-bold text-foreground ">Staff Production Portal</h1>
             <p className="text-sm text-muted-foreground md:mb-0 mb-2">Manage your assigned production assignments.</p>
            </div>
          </div>
          <div className="flex bg-muted rounded-full p-1  w-fit">
             <button
               onClick={() => setActiveTab("ongoing")}
               className={`rounded-full px-6 py-1.5 text-xs font-bold transition-all ${
                 activeTab === "ongoing" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
               }`}
             >
               ONGOING
             </button>
             <button
               onClick={() => setActiveTab("completed")}
               className={`rounded-full px-6 py-1.5 text-xs font-bold transition-all ${
                 activeTab === "completed" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
               }`}
             >
               COMPLETED
             </button>
          </div>
       </div>

       <div className="grid grid-cols-1 gap-4">
          {tasks?.map((t: any) => {
             const isOverdue = new Date(t.deadline) < new Date() && t.status !== "completed";
             
             return (
               <div 
                 key={t.id} 
                 className={`group relative overflow-hidden rounded-2xl border bg-card p-6 transition-all hover:shadow-md ${
                   isOverdue ? "border-destructive/30" : "border-border"
                 }`}
               >
                  {isOverdue && (
                     <div className="absolute top-0 right-0 rounded-bl-xl bg-destructive px-3 py-1 text-[10px] font-bold text-destructive-foreground uppercase tracking-widest">
                        OVERDUE
                     </div>
                  )}
                  
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                     <div className="space-y-1">
                         <div className="text-[10px] text-primary uppercase font-black tracking-widest mt-0.5">
                             {extractOrderTitle(t.notes, t.category)}
                         </div>
                         <h3 className="text-lg font-bold text-foreground">{t.customerName}</h3>
                         {t.customerPhone && <p className="text-xs text-muted-foreground">{t.customerPhone}</p>}
                         {t.deliveryDestination && (
                            <div className="flex items-center gap-1 text-[10px] text-primary font-bold uppercase mt-1">
                               📍 {t.deliveryDestination}
                            </div>
                         )}
                         {t.quantity && t.quantity > 1 && (
                            <p className="text-[10px] font-black text-foreground uppercase mt-1">Qty: {t.quantity}</p>
                         )}
                         {t.productionNotes && (
                            <div className="mt-2 p-2 bg-muted/50 rounded-lg border border-border/50">
                                <p className="text-[9px] font-black uppercase text-muted-foreground mb-0.5">User Instructions:</p>
                                <p className="text-xs italic text-foreground leading-tight">"{t.productionNotes}"</p>
                            </div>
                         )}
                         {t.notes && <p className="text-[11px] text-muted-foreground line-clamp-1 mt-1 italic">{t.notes}</p>}
                      </div>

                     <div className="flex items-center gap-8">
                        <div className="md:text-right">
                           <div className="text-xs text-muted-foreground uppercase font-bold">Deadline</div>
                           <div className={`text-sm font-bold ${isOverdue ? "text-destructive" : "text-foreground"}`}>
                              {format(new Date(t.deadline), "MMM d, yyyy")}
                           </div>
                           <div className="text-[10px] text-muted-foreground">Due: {format(new Date(t.dueDate), "MMM d")}</div>
                        </div>

                        {activeTab === "ongoing" && (
                           <button
                             onClick={() => completeMutation.mutate(t.id)}
                             disabled={completeMutation.isPending}
                             className="rounded-full bg-black px-6 py-2 text-xs font-bold text-white hover:bg-primary transition-colors disabled:opacity-50"
                           >
                             DONE
                           </button>
                        )}
                     </div>
                  </div>
               </div>
             );
          })}
          
          {isLoading && <div className="text-center py-12 text-muted-foreground">Loading assignments...</div>}
          {tasks?.length === 0 && (
             <div className="text-center py-12 bg-muted/10 rounded-2xl border-2 border-dashed border-border">
                <p className="text-muted-foreground mb-2">No {activeTab} tasks found.</p>
                {activeTab === "ongoing" && <p className="text-xs text-muted-foreground">You&apos;re all caught up!</p>}
             </div>
          )}
       </div>
    </div>
  );
};

export default StaffPortalPage;
