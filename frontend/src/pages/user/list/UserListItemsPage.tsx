import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { http } from "../../../api/http";
import { PaginatedTable } from "../../../components/table/PaginatedTable";
import type { Column } from "../../../components/table/DataTable";
import type { Item, PaginatedItems } from "../../../types/item";
import { getErrorMessage } from "../../../utils/errorHandler";
import { Input } from "../../../components/forms/Input";
import { Select } from "../../../components/forms/Select";
import { BackButton } from "../../../components/ui/BackButton";

const UserListItemsPage: React.FC = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState<string>("");
  const [search, setSearch] = useState("");

  const { data, isLoading } = useQuery<PaginatedItems>({
    queryKey: ["user-items", page, status, search],
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
      queryClient.invalidateQueries({ queryKey: ["user-items"] });
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
      <div className="flex flex-col gap-4">
        <BackButton />
        <div>
          <h1 className="text-2xl font-semibold">My Items</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            View and manage your items.
          </p>
        </div>
      </div>

      <div className="flex gap-4 rounded-xl border border-border bg-card p-4 shadow-sm">
        <Input
          type="text"
          placeholder="Search items..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
          className="flex-1"
        />
        <Select
          value={status}
          onChange={(e) => {
            setStatus(e.target.value);
            setPage(1);
          }}
          options={[
            { value: "", label: "All Status" },
            { value: "active", label: "Active" },
            { value: "inactive", label: "Inactive" },
            { value: "archived", label: "Archived" },
          ]}
          className="w-40"
        />
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
        viewPath={(item) => `/user/items/${item.id}`}
        editPath={(item) => `/user/items/${item.id}/edit`}
        loading={isLoading}
        onAddNew={() => navigate("/user/items/new")}
        addNewLabel="Add New Item"
        onExport={handleExport}
        exportLabel="Export CSV"
      />
    </div>
  );
};

export default UserListItemsPage;
