import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

export interface Column<T> {
  key: keyof T | string;
  header: string;
  render?: (item: T) => React.ReactNode;
  sortable?: boolean;
}

interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  onEdit?: (item: T) => void;
  onDelete?: (item: T) => void;
  onView?: (item: T) => void;
  viewPath?: (item: T) => string;
  editPath?: (item: T) => string;
  loading?: boolean;
  emptyMessage?: string;
}

export function DataTable<T extends { id: number }>({
  data,
  columns,
  onEdit,
  onDelete,
  onView,
  viewPath,
  editPath,
  loading = false,
  emptyMessage = "No items found.",
}: DataTableProps<T>) {
  const navigate = useNavigate();
  const [sortColumn, setSortColumn] = useState<keyof T | string | null>(null);
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");

  const handleSort = (column: Column<T>) => {
    if (!column.sortable) return;
    if (sortColumn === column.key) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortColumn(column.key);
      setSortDirection("asc");
    }
  };

  const handleView = (item: T) => {
    if (onView) {
      onView(item);
    } else if (viewPath) {
      navigate(viewPath(item));
    }
  };

  const handleEdit = (item: T) => {
    if (onEdit) {
      onEdit(item);
    } else if (editPath) {
      navigate(editPath(item));
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-sm text-foreground">Loading...</p>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-sm text-foreground">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Desktop Table View */}
      <div className="hidden md:block overflow-x-auto rounded-lg border border-border">
        <table className="w-full">
          <thead className="bg-muted/60">
            <tr>
              {columns.map((column) => (
                <th
                  key={String(column.key)}
                  className={`px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-foreground ${
                    column.sortable ? "cursor-pointer hover:bg-muted" : ""
                  }`}
                  onClick={() => handleSort(column)}
                >
                  <div className="flex items-center gap-2">
                    {column.header}
                    {column.sortable && sortColumn === column.key && (
                      <span className="text-primary">
                        {sortDirection === "asc" ? "↑" : "↓"}
                      </span>
                    )}
                  </div>
                </th>
              ))}
              {(onEdit || onDelete || onView || viewPath) && (
                <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-foreground">
                  Actions
                </th>
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {data.map((item) => (
              <tr
                key={item.id}
                className="hover:bg-muted/30 transition-colors"
              >
                {columns.map((column) => (
                  <td key={String(column.key)} className="px-4 py-3 text-sm text-foreground">
                    {column.render
                      ? column.render(item)
                      : String(item[column.key as keyof T] ?? "")}
                  </td>
                ))}
                {(onEdit || onDelete || onView || viewPath) && (
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      {(onView || viewPath) && (
                        <button
                          onClick={() => handleView(item)}
                          className="rounded px-2 py-1 text-xs text-primary hover:bg-primary/10"
                        >
                          View
                        </button>
                      )}
                      {(onEdit || editPath) && (
                        <button
                          onClick={() => handleEdit(item)}
                          className="rounded px-2 py-1 text-xs text-blue-400 hover:bg-blue-400/10"
                        >
                          Edit
                        </button>
                      )}
                      {onDelete && (
                        <button
                          onClick={() => onDelete(item)}
                          className="rounded px-2 py-1 text-xs text-red-500 hover:bg-red-500/10"
                        >
                          Delete
                        </button>
                      )}
                    </div>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Card View */}
      <div className="grid grid-cols-1 gap-4 md:hidden">
        {data.map((item) => (
          <div key={item.id} className="rounded-xl border border-border bg-card p-4 shadow-sm space-y-3">
             <div className="flex items-start justify-between">
                <div className="space-y-1">
                   {columns.slice(0, 2).map((column, idx) => (
                      <div key={String(column.key)}>
                         {idx === 0 ? (
                            <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest block">{column.header}</span>
                         ) : null}
                         <div className={idx === 0 ? "text-sm font-bold text-foreground" : "text-xs text-foreground"}>
                            {column.render ? column.render(item) : String(item[column.key as keyof T] ?? "")}
                         </div>
                      </div>
                   ))}
                </div>
                <div className="flex gap-1">
                   {(onView || viewPath) && (
                      <button 
                        onClick={() => handleView(item)}
                        className="rounded-lg bg-primary/10 p-2 text-primary"
                      >
                         <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0z"/><circle cx="12" cy="12" r="3"/></svg>
                      </button>
                   )}
                   {(onEdit || editPath) && (
                      <button 
                        onClick={() => handleEdit(item)}
                        className="rounded-lg bg-blue-400/10 p-2 text-blue-400"
                      >
                         <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>
                      </button>
                   )}
                   {onDelete && (
                      <button 
                        onClick={() => onDelete(item)}
                        className="rounded-lg bg-red-500/10 p-2 text-red-500"
                      >
                         <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="m19 6-2 14H7L5 20 3 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M5 6l1-1h12l1 1"/></svg>
                      </button>
                   )}
                </div>
             </div>
             <div className="grid grid-cols-2 gap-y-3 pt-3 border-t border-border">
                {columns.slice(2).map((column) => (
                   <div key={String(column.key)}>
                      <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest block">{column.header}</span>
                      <div className="text-xs text-gray-300 mt-0.5">
                         {column.render ? column.render(item) : String(item[column.key as keyof T] ?? "")}
                      </div>
                   </div>
                ))}
             </div>
          </div>
        ))}
      </div>
    </div>
  );
}




