import React from 'react';
import { Transaction } from '../../api/users';
import { format } from 'date-fns';

interface Props {
  transactions: Transaction[];
}

export const UserTransactionsTable: React.FC<Props> = ({ transactions }) => {
  if (transactions.length === 0) {
    return (
      <div className="text-center py-10 bg-zinc-50 rounded-xl border border-dashed border-zinc-200">
        <p className="text-zinc-400 text-sm">No transactions found</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-sm">
        <thead>
          <tr className="border-b border-zinc-100 text-zinc-400 text-[10px] uppercase tracking-widest">
            <th className="pb-4 font-black">Date</th>
            <th className="pb-4 font-black">Type</th>
            <th className="pb-4 font-black">Amount</th>
            <th className="pb-4 font-black">Status</th>
            <th className="pb-4 font-black">Details</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-zinc-50">
          {transactions.map((tx) => (
            <React.Fragment key={tx.id}>
              <tr className="group">
                <td className="py-4 text-zinc-600 font-medium">
                  {format(new Date(tx.created_at), 'MMM d, yyyy')}
                </td>
                <td className="py-4">
                  <span className={`px-2 py-1 rounded-md text-[10px] uppercase font-bold tracking-wider ${
                    tx.type === 'installment' ? 'bg-purple-50 text-purple-600' : 'bg-zinc-100 text-zinc-600'
                  }`}>
                    {tx.type}
                  </span>
                </td>
                <td className="py-4 font-bold text-zinc-900">
                  {tx.currency} {Number(tx.amount).toFixed(2)}
                </td>
                <td className="py-4">
                  <span className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                    tx.status === 'succeeded' || tx.status === 'completed' 
                      ? 'bg-green-50 text-green-600' 
                      : tx.status === 'pending' 
                        ? 'bg-orange-50 text-orange-600' 
                        : 'bg-red-50 text-red-600'
                  }`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${
                      tx.status === 'succeeded' || tx.status === 'completed' ? 'bg-green-500' : tx.status === 'pending' ? 'bg-orange-500' : 'bg-red-500'
                    }`} />
                    {tx.status}
                  </span>
                </td>
                <td className="py-4 text-zinc-400 text-xs">
                  Via {tx.provider}
                </td>
              </tr>
              {tx.installments && tx.installments.length > 0 && (
                <tr>
                  <td colSpan={5} className="pb-6 pt-0 pl-4">
                    <div className="bg-zinc-50 rounded-lg p-4 text-xs">
                      <p className="font-bold text-zinc-500 uppercase tracking-wider mb-3 text-[10px]">Installment Schedule</p>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                        {tx.installments.map((inst, idx) => (
                          <div key={idx} className="bg-white border border-zinc-100 p-3 rounded-md flex items-center justify-between shadow-sm">
                            <div>
                              <div className="font-bold text-zinc-700">Payment {inst.installment_number}</div>
                              <div className="text-zinc-400 text-[10px] mt-0.5">Due: {format(new Date(inst.due_date), 'MMM d, yyyy')}</div>
                            </div>
                            <div className="text-right">
                                <div className="font-black text-black">₦{Number(inst.amount).toLocaleString()}</div>
                                <div className={`text-[9px] font-bold uppercase tracking-wider mt-1 ${
                                    inst.status === 'paid' || inst.status === 'succeeded' ? 'text-green-500' : 'text-orange-400'
                                }`}>
                                    {inst.status}
                                </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </td>
                </tr>
              )}
            </React.Fragment>
          ))}
        </tbody>
      </table>
    </div>
  );
};
