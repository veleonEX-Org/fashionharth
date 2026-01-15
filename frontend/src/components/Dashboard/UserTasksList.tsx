import React from 'react';
import { UserTask } from '../../api/users';
import { format, differenceInDays } from 'date-fns';

interface Props {
  tasks: UserTask[];
}

export const UserTasksList: React.FC<Props> = ({ tasks }) => {
  if (tasks.length === 0) {
    return (
      <div className="text-center py-10 bg-zinc-50 rounded-xl border border-dashed border-zinc-200">
        <p className="text-zinc-400 text-sm">No active orders or tasks found</p>
      </div>
    );
  }

  return (
    <div className="grid gap-4">
      {tasks.map((task) => {
        const daysLeft = differenceInDays(new Date(task.deadline), new Date());
        
        return (
          <div key={task.id} className="relative overflow-hidden bg-white border border-zinc-100 rounded-2xl p-6 shadow-sm transition-all hover:shadow-md hover:border-zinc-200 group">
             {/* Progress Bar Background */}
             <div className="absolute bottom-0 left-0 h-1 bg-zinc-100 w-full">
                <div 
                    className={`h-full ${task.status === 'completed' ? 'bg-green-500' : 'bg-primary'}`} 
                    style={{ width: task.status === 'completed' ? '100%' : task.status === 'in_progress' ? '60%' : '10%' }}
                />
             </div>

            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-4">
              <div>
                <div className="flex items-center gap-3 mb-2">
                    <span className="px-2 py-0.5 rounded-md bg-zinc-900 text-white text-[10px] font-black tracking-widest uppercase">
                        {task.category}
                    </span>
                    <span className={`text-[10px] font-bold tracking-wider uppercase ${
                        task.status === 'completed' ? 'text-green-600' : task.status === 'in_progress' ? 'text-blue-600' : 'text-zinc-400'
                    }`}>
                        {task.status.replace('_', ' ')}
                    </span>
                </div>
                <h3 className="text-lg font-black tracking-tight text-zinc-900">
                    Order #{task.id.toString().padStart(4, '0')}
                </h3>
              </div>
              
              <div className="text-right">
                 <div className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-1">Estimated Delivery</div>
                 <div className={`text-xl font-black ${daysLeft < 3 && task.status !== 'completed' ? 'text-red-500' : 'text-zinc-900'}`}>
                    {format(new Date(task.deadline), 'MMMM d, yyyy')}
                 </div>
                 {task.status !== 'completed' && (
                     <div className="text-xs font-medium text-zinc-500 mt-1">
                        {daysLeft > 0 ? `${daysLeft} days remaining` : 'Due Soon'}
                     </div>
                 )}
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 py-4 border-t border-zinc-50">
                <div>
                    <div className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider mb-1">Total Cost</div>
                    <div className="font-bold text-zinc-900">${Number(task.totalAmount).toFixed(2)}</div>
                </div>
                <div>
                    <div className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider mb-1">Paid So Far</div>
                    <div className="font-bold text-green-600">${Number(task.amountPaid).toFixed(2)}</div>
                </div>
                <div>
                    <div className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider mb-1">Date Ordered</div>
                    <div className="font-bold text-zinc-700">{format(new Date(task.createdAt), 'MMM d, yyyy')}</div>
                </div>
                 <div>
                    <div className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider mb-1">Started On</div>
                    <div className="font-bold text-zinc-700">
                        {task.startDate ? format(new Date(task.startDate), 'MMM d, yyyy') : '-'}
                    </div>
                </div>
            </div>

            {task.notes && (
                <div className="mt-2 bg-zinc-50 p-3 rounded-lg border border-zinc-100/50">
                    <p className="text-xs text-zinc-500 italic">"{task.notes}"</p>
                </div>
            )}
          </div>
        );
      })}
    </div>
  );
};
