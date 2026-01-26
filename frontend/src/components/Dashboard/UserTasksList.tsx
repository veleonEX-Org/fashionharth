import React, { useState } from 'react';
import { UserTask } from '../../api/users';
import { format } from 'date-fns';
import Modal from '../Modal';
import { Eye, Clock, Tag, Calendar, CheckCircle2, AlertCircle, TrendingUp, Wallet, MapPin } from 'lucide-react';
import { http } from '../../api/http';
import { toast } from 'react-hot-toast';

interface Props {
  tasks: UserTask[];
}

export const UserTasksList: React.FC<Props> = ({ tasks }) => {
  const [selectedTask, setSelectedTask] = useState<UserTask | null>(null);
  const [filter, setFilter] = useState<'all' | 'pending' | 'in_progress' | 'completed'>('all');
  const [sortBy, setSortBy] = useState<'delivery' | 'newest'>('delivery');
  const [isPaying, setIsPaying] = useState<number | null>(null);

  const handlePayInstallment = async (installmentNumber: number) => {
    if (!selectedTask || !selectedTask.transactionId) return;
    
    setIsPaying(installmentNumber);
    try {
        const { data } = await http.post('/payments/create-checkout-session', {
            transactionId: selectedTask.transactionId,
            installmentNumber,
            type: 'installment',
            provider: 'paystack'
        });

        if (data.url) {
            window.location.href = data.url;
        }
    } catch (error: any) {
        toast.error(error.response?.data?.message || "Failed to initiate payment");
    } finally {
        setIsPaying(null);
    }
  };

  if (tasks.length === 0) {
    return (
      <div className="text-center py-12 bg-white rounded-3xl border border-dashed border-zinc-200">
        <div className="mx-auto w-12 h-12 bg-zinc-50 rounded-full flex items-center justify-center mb-4">
            <Clock className="w-6 h-6 text-zinc-300" />
        </div>
        <p className="text-zinc-500 font-medium">No orders found yet.</p>
        <p className="text-zinc-400 text-xs mt-1">When you place an order, it will appear here.</p>
      </div>
    );
  }

  const extractOrderTitle = (notes: string | null, category: string) => {
    if (!notes) return category;
    const match = notes.match(/item:\s*([^.]+)/);
    return match ? match[1].trim() : category;
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed': return 'text-green-600 bg-green-50 border-green-100';
      case 'in_progress': return 'text-blue-600 bg-blue-50 border-blue-100';
      case 'pending': return 'text-orange-600 bg-orange-50 border-orange-100';
      default: return 'text-zinc-500 bg-zinc-50 border-zinc-100';
    }
  };

  const filteredAndSortedTasks = tasks
    .filter(task => {
        if (filter === 'all') return true;
        return task.status.toLowerCase() === filter;
    })
    .sort((a, b) => {
        if (sortBy === 'delivery') {
            return new Date(a.deadline).getTime() - new Date(b.deadline).getTime();
        } else {
            return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        }
    });

  return (
    <div className="space-y-4">
      {/* Filters & Sorting */}
      <div className="flex flex-col sm:flex-row gap-2 justify-between items-start sm:items-center px-1">
        <select 
          value={filter}
          onChange={(e) => setFilter(e.target.value as any)}
          className="bg-zinc-50 border border-zinc-100 text-zinc-900 text-[9px] font-black uppercase tracking-wider rounded-xl px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-zinc-200 cursor-pointer"
        >
          <option value="all">Filter: All</option>
          <option value="pending">Filter: Pending</option>
          <option value="in_progress">Filter: In Progress</option>
          <option value="completed">Filter: Completed</option>
        </select>
        
        <select 
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as any)}
          className="bg-zinc-50 border border-zinc-100 text-zinc-900 text-[9px] font-black uppercase tracking-wider rounded-xl px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-zinc-200 cursor-pointer"
        >
          <option value="delivery">Sort: Delivery</option>
          <option value="newest">Sort: Newest</option>
        </select>
      </div>

      <div className="space-y-2">
        {filteredAndSortedTasks.map((task) => (
            <div 
                key={task.id} 
                className="group p-3 bg-white border border-zinc-100 rounded-2xl hover:border-zinc-300 transition-all cursor-pointer active:scale-[0.98]"
                onClick={() => setSelectedTask(task)}
            >
            <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-zinc-900 flex items-center justify-center text-white shrink-0">
                        <Tag className="w-4 h-4" />
                    </div>
                    <div>
                        <div className="flex items-center gap-2">
                            <span className="text-[11px] font-black text-zinc-900 uppercase tracking-tight">
                                {extractOrderTitle(task.notes, task.category)}
                            </span>
                            <span className="text-[9px] font-bold text-zinc-400">#{task.id.toString().padStart(4, '0')}</span>
                        </div>
                        <div className="text-[9px] text-zinc-400 font-medium uppercase tracking-widest">
                            Ordered {format(new Date(task.createdAt), 'dd/MM/yy')}
                        </div>
                    </div>
                </div>

                <div className="text-right">
                    <div className={`inline-flex items-center px-1.5 py-0.5 rounded-full text-[8px] font-black uppercase tracking-wider border ${getStatusColor(task.status)}`}>
                        {task.status.replace('_', ' ')}
                    </div>
                    <div className="flex items-center justify-end gap-1 mt-1 text-zinc-400">
                        <Calendar className="w-2.5 h-2.5" />
                        <span className="text-[10px] font-bold text-zinc-900 italic">
                            {format(new Date(task.deadline), 'dd/MM/yy')}
                        </span>
                    </div>

                    <div className="mt-2 text-right">
                        <div className="flex items-center justify-end gap-2 text-[9px] font-black uppercase tracking-tight text-zinc-400">
                            <span>₦{Number(task.amountPaid).toLocaleString()}</span>
                            <span>/</span>
                            <span className="text-zinc-900">₦{Number(task.totalAmount).toLocaleString()}</span>
                        </div>
                        <div className="mt-1 h-1 w-24 ml-auto bg-zinc-100 rounded-full overflow-hidden">
                            <div 
                                className={`h-full transition-all duration-500 rounded-full ${Number(task.amountPaid) >= Number(task.totalAmount) ? 'bg-approve' : 'bg-primary'}`}
                                style={{ width: `${Math.min(100, (Number(task.amountPaid) / Number(task.totalAmount)) * 100)}%` }}
                            />
                        </div>
                    </div>
                     <p className="text-xs font-black text-foreground italic cursor-pointer text-primary underline mt-2">view</p>
                </div>
            </div>
            
            </div>
        ))}
        {filteredAndSortedTasks.length === 0 && (
          <div className="text-center py-8">
            <p className="text-zinc-400 text-[10px] uppercase font-black tracking-widest">No orders found for this filter</p>
          </div>
        )}
      </div>

      {/* Detail Modal */}
      {selectedTask && (
        <Modal 
            isOpen={!!selectedTask} 
            onClose={() => setSelectedTask(null)} 
            title={`Order Analysis - #${selectedTask.id.toString().padStart(4, '0')}`}
        >
            <div className="space-y-3 pt-0">
                {/* Status & ID Summary */}
                <div className="flex items-center justify-between p-3 bg-muted/30 rounded-2xl border border-border/50">
                    <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-xl border ${getStatusColor(selectedTask.status)}`}>
                            {selectedTask.status === 'completed' ? <CheckCircle2 className="w-4 h-4" /> : <Clock className="w-4 h-4 animate-pulse" />}
                        </div>
                        <div>
                            <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground leading-none">
                                {extractOrderTitle(selectedTask.notes, selectedTask.category)}
                            </p>
                            <p className="text-xs font-black uppercase text-foreground mt-1">{selectedTask.status.replace('_', ' ')}</p>
                        </div>
                    </div>
                    <div className="text-right">
                        <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground leading-none">Order ID</p>
                        <p className="text-xs font-black text-foreground mt-1">#{selectedTask.id.toString().padStart(4, '0')}</p>
                    </div>
                </div>

                {/* Main Info Grid */}
                <div className="grid grid-cols-3 gap-3">
                    <div className="p-3 bg-muted/50 rounded-2xl border border-border">
                        <p className="text-[9px] text-muted-foreground font-black uppercase tracking-widest mb-1">Total Value</p>
                        <p className="text-xs font-black text-foreground italic">₦{Number(selectedTask.totalAmount).toLocaleString()}</p>
                    </div>
                    <div className="p-3 bg-muted/50 rounded-2xl border border-border">
                        <p className="text-[9px] text-muted-foreground font-black uppercase tracking-widest mb-1">Paid</p>
                        <p className="text-xs font-black text-approve italic">₦{Number(selectedTask.amountPaid).toLocaleString()}</p>
                    </div>
                    <div className="p-3 bg-muted/50 rounded-2xl border border-border">
                        <p className="text-[9px] text-muted-foreground font-black uppercase tracking-widest mb-1">Left</p>
                        <p className="text-xs font-black text-red-500 italic">₦{Math.max(0, Number(selectedTask.totalAmount) - Number(selectedTask.amountPaid)).toLocaleString()}</p>
                    </div>
                </div>

                {/* Delivery & Timeline Row */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {/* Delivery */}
                    <div className="p-3 bg-muted/50 rounded-2xl border border-border">
                        <p className="text-[9px] text-muted-foreground font-black uppercase tracking-widest mb-1">Shipping To</p>
                        <div className="flex items-start gap-2">
                            <MapPin className="w-3.5 h-3.5 text-primary shrink-0 mt-0.5" />
                            <p className="text-xs font-bold text-foreground leading-tight line-clamp-2">
                                {selectedTask.deliveryDestination || "No address provided"}
                            </p>
                        </div>
                    </div>

                    {/* Timeline (Compact) */}
                    <div className="p-3 bg-muted/50 rounded-2xl border border-border">
                        <p className="text-[9px] text-muted-foreground font-black uppercase tracking-widest mb-1">Timeline</p>
                        <div className="space-y-2">
                            <div className="flex items-center gap-2">
                                <div className="w-1.5 h-1.5 rounded-full bg-foreground" />
                                <p className="text-[10px] font-black text-foreground uppercase italic shrink-0">Ordered:</p>
                                <p className="text-[10px] text-muted-foreground">{format(new Date(selectedTask.createdAt), 'dd/MM/yy')}</p>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-1.5 h-1.5 rounded-full bg-approve shadow-[0_0_8px_rgba(var(--approve),0.5)]" />
                                <p className="text-[10px] font-black text-foreground uppercase italic shrink-0">Delivery:</p>
                                <p className="text-[10px] text-muted-foreground">{format(new Date(selectedTask.deadline), 'dd/MM/yy')}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Production Notes & Details */}
                {(selectedTask.productionNotes || selectedTask.notes) && (
                    <div className="p-3 bg-orange-50/20 rounded-2xl border border-orange-100/30">
                        <div className="flex items-center gap-2 mb-1">
                            <AlertCircle className="w-3.5 h-3.5 text-orange-600" />
                            <p className="text-[9px] text-orange-600 font-black uppercase tracking-widest">Production Analysis</p>
                        </div>
                        {selectedTask.productionNotes && (
                            <div className="mb-2">
                                <p className="text-[10px] text-orange-800 font-bold uppercase tracking-tight mb-0.5">User Instructions:</p>
                                <p className="text-[11px] text-orange-900/80 leading-relaxed italic">"{selectedTask.productionNotes}"</p>
                            </div>
                        )}
                        {selectedTask.quantity && selectedTask.quantity > 1 && (
                            <div className="mb-2">
                                <p className="text-[10px] text-orange-800 font-bold uppercase tracking-tight mb-0.5">Quantity:</p>
                                <p className="text-[11px] text-orange-900/80 leading-relaxed italic">{selectedTask.quantity} Pieces</p>
                            </div>
                        )}
                        {selectedTask.notes && (
                            <div>
                                <p className="text-[10px] text-orange-800 font-bold uppercase tracking-tight mb-0.5">System Memo:</p>
                                <p className="text-[11px] text-orange-900/80 leading-relaxed italic line-clamp-2">"{selectedTask.notes}"</p>
                            </div>
                        )}
                    </div>
                )}

                {/* Installments Section */}
                {selectedTask.installments && selectedTask.installments.length > 0 && (
                    <div className="space-y-2 mt-4">
                        <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Payment Schedule</p>
                        <div className="space-y-2 max-h-[30vh] overflow-y-auto pr-1">
                            {selectedTask.installments.map((inst, idx) => {
                                const isNext = selectedTask.installments?.find(i => i.status === 'pending')?.installment_number === inst.installment_number;
                                const isPaid = inst.status === 'paid' || inst.status === 'succeeded';
                                const isPending = inst.status === 'pending';
                                const isPastDue = isPending && new Date(inst.due_date) < new Date();

                                let installmentBorderClass = "border-border/50 bg-muted/30";
                                if (isPaid) {
                                    installmentBorderClass = "bg-approve/[0.02] border-approve/10";
                                } else if (isPastDue) {
                                    installmentBorderClass = "border-red-500 animate-border-pulse-red bg-red-50/10";
                                } else if (isPending) {
                                    installmentBorderClass = "border-orange-400 bg-orange-50/10";
                                }

                                return (
                                    <div key={idx} className={`p-3 rounded-2xl border flex items-center justify-between ${installmentBorderClass}`}>
                                        <div className="flex items-center gap-3">
                                            <div className={`w-6 h-6 rounded-lg flex items-center justify-center text-[10px] font-black border ${
                                                isPaid ? 'bg-approve text-card border-approve' : 'bg-card text-foreground border-border'
                                            }`}>
                                                {inst.installment_number}
                                            </div>
                                            <div>
                                                <p className="text-[10px] font-black text-foreground uppercase tracking-tight">Part {inst.installment_number}</p>
                                                <p className="text-[9px] text-muted-foreground uppercase">{format(new Date(inst.due_date), 'dd/MM/yy')}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <div className="text-right">
                                                <p className="text-xs font-black text-foreground italic">₦{Number(inst.amount).toLocaleString()}</p>
                                                <p className={`text-[8px] font-black uppercase tracking-widest ${isPaid ? 'text-approve' : 'text-orange-500'}`}>
                                                    {inst.status}
                                                </p>
                                            </div>
                                            {isNext && !isPaid && (
                                                <button 
                                                    onClick={() => handlePayInstallment(inst.installment_number)}
                                                    disabled={isPaying !== null}
                                                    className="bg-foreground text-card p-1.5 px-3 rounded-xl hover:opacity-90 active:scale-95 transition-all disabled:opacity-50"
                                                >
                                                    {isPaying === inst.installment_number ? (
                                                        <div className="w-3 h-3 border-2 border-card border-t-transparent rounded-full animate-spin" />
                                                    ) : (
                                                         <span className="text-[10px] font-black uppercase tracking-wider">Pay</span>
                                                    )}
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}
                <button 
                    onClick={() => setSelectedTask(null)}
                    className="w-full py-3.5 rounded-2xl bg-foreground text-card text-[11px] font-black uppercase tracking-widest hover:opacity-90 transition-all transform active:scale-[0.98] mt-2 shadow-lg shadow-foreground/10"
                >
                    Close Analysis
                </button>
            </div>
        </Modal>
      )}
    </div>
  );
};
