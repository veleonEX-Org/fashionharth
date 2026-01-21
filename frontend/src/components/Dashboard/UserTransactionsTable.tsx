import React, { useState } from 'react';
import { Transaction } from '../../api/users';
import { format } from 'date-fns';
import Modal from '../Modal';
import { CreditCard, Calendar, CheckCircle2, AlertCircle, Eye, ArrowRight, Clock } from 'lucide-react';
import { http } from '../../api/http';
import { toast } from 'react-hot-toast';

interface Props {
  transactions: Transaction[];
}

export const UserTransactionsTable: React.FC<Props> = ({ transactions }) => {
  const [selectedTx, setSelectedTx] = useState<Transaction | null>(null);
  const [filter, setFilter] = useState<'all' | 'installment' | 'one-time'>('all');

  if (transactions.length === 0) {
    return (
      <div className="text-center py-10 bg-zinc-50 rounded-2xl border border-dashed border-zinc-200">
        <p className="text-zinc-400 text-xs font-medium uppercase tracking-widest">No history yet</p>
      </div>
    );
  }

  const filteredTransactions = transactions.filter(tx => {
    if (filter === 'all') return true;
    return tx.type === filter;
  });

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center px-1">
        <select 
          value={filter}
          onChange={(e) => setFilter(e.target.value as any)}
          className="bg-zinc-50 border border-zinc-100 text-zinc-900 text-[9px] font-black uppercase tracking-wider rounded-xl px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-zinc-200 cursor-pointer"
        >
          <option value="all">Filter: All Payments</option>
          <option value="one-time">Filter: One-time</option>
          <option value="installment">Filter: Installments</option>
        </select>
        <p className="text-[9px] font-black uppercase tracking-widest text-zinc-400">{filteredTransactions.length} Receipts</p>
      </div>

      <div className="space-y-2">
        {filteredTransactions.map((tx) => (
          <div 
            key={tx.id} 
            className="group p-3 bg-white border border-zinc-100 rounded-2xl transition-all cursor-pointer hover:border-zinc-300 active:scale-[0.98]"
            onClick={() => setSelectedTx(tx)}
          >
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-zinc-50 border border-zinc-100 text-zinc-400">
                  <CreditCard className="w-3.5 h-3.5" />
                </div>
                <div>
                  <p className="text-[11px] font-black text-foreground uppercase tracking-tight">
                    {tx.description || `${tx.type} Payment`}
                  </p>
                  <p className="text-[9px] text-muted-foreground font-medium uppercase tracking-widest">
                    {format(new Date(tx.created_at), 'dd MMM yyyy')}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-xs font-black text-foreground italic">₦{Number(tx.amount).toLocaleString()}</p>
                <div className="text-[8px] font-black uppercase tracking-widest mt-0.5 text-approve">
                    Successful
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {selectedTx && (
        <Modal 
          isOpen={!!selectedTx} 
          onClose={() => setSelectedTx(null)} 
          title="Payment Receipt"
        >
          <div className="space-y-4 pt-0">
            <div className="flex flex-col items-center justify-center p-6 bg-muted/30 rounded-3xl border border-border/50 text-center">
                <div className="w-12 h-12 rounded-2xl bg-approve/10 border border-approve/20 flex items-center justify-center mb-4">
                    <CheckCircle2 className="w-6 h-6 text-approve" />
                </div>
                <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1">Payment Successful</p>
                <p className="text-2xl font-black text-foreground italic">₦{Number(selectedTx.amount).toLocaleString()}</p>
            </div>

            <div className="space-y-2">
                <div className="flex justify-between p-3 bg-muted/50 rounded-2xl border border-border">
                    <p className="text-[9px] text-muted-foreground font-black uppercase tracking-widest">Description</p>
                    <p className="text-[10px] font-bold text-foreground text-right">{selectedTx.description || 'Fashion Purchase'}</p>
                </div>
                <div className="flex justify-between p-3 bg-muted/50 rounded-2xl border border-border">
                    <p className="text-[9px] text-muted-foreground font-black uppercase tracking-widest">Date</p>
                    <p className="text-[10px] font-bold text-foreground">{format(new Date(selectedTx.created_at), 'MMMM d, yyyy')}</p>
                </div>
                <div className="flex justify-between p-3 bg-muted/50 rounded-2xl border border-border">
                    <p className="text-[9px] text-muted-foreground font-black uppercase tracking-widest">Reference</p>
                    <p className="text-[10px] font-bold text-foreground uppercase tracking-tighter">{selectedTx.id.toString().padStart(8, '0')}</p>
                </div>
                <div className="flex justify-between p-3 bg-muted/50 rounded-2xl border border-border">
                    <p className="text-[9px] text-muted-foreground font-black uppercase tracking-widest">Method</p>
                    <p className="text-[10px] font-bold text-foreground uppercase">{selectedTx.provider}</p>
                </div>
            </div>

            <button 
              onClick={() => setSelectedTx(null)}
              className="w-full py-4 rounded-2xl bg-foreground text-card text-xs font-black uppercase tracking-widest hover:opacity-90 transition-all transform active:scale-[0.98]"
            >
              Done
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
};
