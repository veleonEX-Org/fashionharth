import React from "react";
import { DataTable, type Column } from "./DataTable";

interface PaginatedTableProps<T> {
  data: T[];
  columns: Column<T>[];
  currentPage: number;
  totalPages: number;
  total: number;
  limit: number;
  onPageChange: (page: number) => void;
  onEdit?: (item: T) => void;
  onDelete?: (item: T) => void;
  onView?: (item: T) => void;
  viewPath?: (item: T) => string;
  editPath?: (item: T) => string;
  loading?: boolean;
  emptyMessage?: string;
  onAddNew?: () => void;
  addNewLabel?: string;
  onExport?: () => void;
  exportLabel?: string;
}

export function PaginatedTable<T extends { id: number }>({
  data,
  columns,
  currentPage,
  totalPages,
  total,
  limit,
  onPageChange,
  onEdit,
  onDelete,
  onView,
  viewPath,
  editPath,
  loading = false,
  emptyMessage = "No items found.",
  onAddNew,
  addNewLabel = "Add New",
  onExport,
  exportLabel = "Export",
}: PaginatedTableProps<T>) {
  const startItem = total === 0 ? 0 : (currentPage - 1) * limit + 1;
  const endItem = Math.min(currentPage * limit, total);

  return (
    <div className="space-y-4">
      {/* Header with actions */}
      <div className="flex items-center justify-between">
        <div className="text-sm text-foreground">
          Showing {startItem} to {endItem} of {total} items
        </div>
        <div className="flex gap-2">
          {onExport && (
            <button
              onClick={onExport}
              className="rounded-md border border-border bg-black/5 px-3 py-1.5 text-xs font-medium text-foreground hover:border-primary hover:text-primary"
            >
              {exportLabel}
            </button>
          )}
          {onAddNew && (
            <button
              onClick={onAddNew}
              className="rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground hover:opacity-90"
            >
              {addNewLabel}
            </button>
          )}
        </div>
      </div>

      {/* Table */}
      <DataTable
        data={data}
        columns={columns}
        onEdit={onEdit}
        onDelete={onDelete}
        onView={onView}
        viewPath={viewPath}
        editPath={editPath}
        loading={loading}
        emptyMessage={emptyMessage}
      />

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-xs text-foreground">
            Page {currentPage} of {totalPages}
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => onPageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="rounded-md border border-border bg-black/5 px-3 py-1.5 text-xs font-medium text-foreground hover:border-primary hover:text-primary disabled:cursor-not-allowed disabled:opacity-40"
            >
              Previous
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1)
              .filter(
                (page) =>
                  page === 1 ||
                  page === totalPages ||
                  (page >= currentPage - 1 && page <= currentPage + 1)
              )
              .map((page, index, array) => (
                <React.Fragment key={page}>
                  {index > 0 && array[index - 1] !== page - 1 && (
                    <span className="px-2 text-xs text-foreground">...</span>
                  )}
                  <button
                    onClick={() => onPageChange(page)}
                    className={`rounded-md border border-border px-3 py-1.5 text-xs font-medium ${
                      currentPage === page
                        ? "bg-primary text-primary-foreground"
                        : "bg-black/5 text-foreground hover:border-primary hover:text-primary"
                    }`}
                  >
                    {page}
                  </button>
                </React.Fragment>
              ))}
            <button
              onClick={() => onPageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="rounded-md border border-border bg-black/5 px-3 py-1.5 text-xs font-medium text-foreground hover:border-primary hover:text-primary disabled:cursor-not-allowed disabled:opacity-40"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}




