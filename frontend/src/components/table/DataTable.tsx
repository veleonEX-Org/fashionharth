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
        <p className="text-sm text-gray-300">Loading...</p>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-sm text-gray-300">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-border">
      <table className="w-full">
        <thead className="bg-muted/60">
          <tr>
            {columns.map((column) => (
              <th
                key={String(column.key)}
                className={`px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-300 ${
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
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-300">
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
                <td key={String(column.key)} className="px-4 py-3 text-sm">
                  {column.render
                    ? column.render(item)
                    : String(item[column.key as keyof T] ?? "")}
                </td>
              ))}
              {(onEdit || onDelete || onView || viewPath) && (
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    {(onView || viewPath) && (
                      <button
                        onClick={() => handleView(item)}
                        className="rounded px-2 py-1 text-xs text-primary hover:bg-primary/10"
                        title="View"
                      >
                        View
                      </button>
                    )}
                    {(onEdit || editPath) && (
                      <button
                        onClick={() => handleEdit(item)}
                        className="rounded px-2 py-1 text-xs text-blue-400 hover:bg-blue-400/10"
                        title="Edit"
                      >
                        Edit
                      </button>
                    )}
                    {onDelete && (
                      <button
                        onClick={() => onDelete(item)}
                        className="rounded px-2 py-1 text-xs text-red-400 hover:bg-red-400/10"
                        title="Delete"
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
  );
}




