import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { http } from "../../../api/http";
import { PaginatedTable } from "../../../components/table/PaginatedTable";
import type { Column } from "../../../components/table/DataTable";
import type { Item, PaginatedItems } from "../../../types/item";
import { getErrorMessage } from "../../../utils/errorHandler";

const StaffListItemsPage: React.FC = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState<string>("");
  const [search, setSearch] = useState("");

  const { data, isLoading } = useQuery<PaginatedItems>({
    queryKey: ["staff-items", page, status, search],
    queryFn: async () => {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: "10",
      });
      if (status) params.append("status", status);
      if (search) params.append("search", search);
      const res = await http.get<PaginatedItems>(`/items?${params}`);
      return res.data;
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await http.delete(`/items/${id}`);
    },
    onSuccess: () => {
      toast.success("Item deleted successfully.");
      queryClient.invalidateQueries({ queryKey: ["staff-items"] });
    },
    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
  });

  const handleDelete = (item: Item) => {
    if (window.confirm(`Are you sure you want to delete "${item.title}"?`)) {
      deleteMutation.mutate(item.id);
    }
  };

  const handleExport = () => {
    if (!data) return;
    const csv = [
      ["ID", "Title", "Description", "Status", "Created At"].join(","),
      ...data.items.map((item) =>
        [
          item.id,
          `"${item.title}"`,
          `"${item.description || ""}"`,
          item.status,
          item.createdAt,
        ].join(",")
      ),
    ].join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `items-${new Date().toISOString()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Items exported successfully.");
  };

  const columns: Column<Item>[] = [
    {
      key: "id",
      header: "ID",
      sortable: true,
    },
    {
      key: "title",
      header: "Title",
      sortable: true,
    },
    {
      key: "description",
      header: "Description",
      render: (item) => (
        <span className="max-w-xs truncate">
          {item.description || "—"}
        </span>
      ),
    },
    {
      key: "status",
      header: "Status",
      render: (item) => (
        <span
          className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-semibold ${
            item.status === "active"
              ? "bg-approve/20 text-approve"
              : item.status === "inactive"
              ? "bg-pending/20 text-pending"
              : "bg-muted text-muted-foreground"
          }`}
        >
          {item.status}
        </span>
      ),
    },
    {
      key: "createdAt",
      header: "Created At",
      render: (item) => new Date(item.createdAt).toLocaleDateString(),
      sortable: true,
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Staff - Items</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Manage items accessible to staff.
        </p>
      </div>

      {/* Filters */}
      <div className="flex gap-4 rounded-xl border border-border bg-muted/60 p-4">
        <input
          type="text"
          placeholder="Search items..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
          className="flex-1 rounded-md border border-border bg-black/40 px-3 py-2 text-sm text-foreground outline-none focus:border-primary"
        />
        <select
          value={status}
          onChange={(e) => {
            setStatus(e.target.value);
            setPage(1);
          }}
          className="rounded-md border border-border bg-black/40 px-3 py-2 text-sm text-foreground outline-none focus:border-primary"
        >
          <option value="">All Status</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
          <option value="archived">Archived</option>
        </select>
      </div>

      {/* Table */}
      <PaginatedTable
        data={data?.items || []}
        columns={columns}
        currentPage={data?.page || 1}
        totalPages={data?.totalPages || 0}
        total={data?.total || 0}
        limit={10}
        onPageChange={setPage}
        onDelete={handleDelete}
        viewPath={(item) => `/staff/items/${item.id}`}
        editPath={(item) => `/staff/items/${item.id}/edit`}
        loading={isLoading}
        onAddNew={() => navigate("/staff/items/new")}
        addNewLabel="Add New Item"
        onExport={handleExport}
        exportLabel="Export CSV"
      />
    </div>
  );
};

export default StaffListItemsPage;
