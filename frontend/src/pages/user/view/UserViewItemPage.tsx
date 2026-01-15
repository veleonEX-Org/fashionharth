import React from "react";
import { useQuery } from "@tanstack/react-query";
import { useParams, useNavigate } from "react-router-dom";
import { http } from "../../../api/http";
import type { Item } from "../../../types/item";
import { BackButton } from "../../../components/ui/BackButton";

const UserViewItemPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data: item, isLoading } = useQuery<Item>({
    queryKey: ["user-item", id],
    queryFn: async () => {
      const res = await http.get<Item>(`/items/${id}`);
      return res.data;
    },
    enabled: !!id,
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-sm text-gray-300">Loading...</p>
      </div>
    );
  }

  if (!item) {
    return (
      <div className="space-y-4">
        <p className="text-sm text-destructive">Item not found.</p>
        <button
          onClick={() => navigate("/user/items")}
          className="rounded-md border border-border bg-input px-4 py-2 text-sm font-medium text-muted-foreground hover:border-primary hover:text-primary"
        >
          Back to List
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4">
        <BackButton to="/user/items" />
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold">{item.title}</h1>
            <p className="mt-1 text-sm text-muted-foreground">Item Details</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => navigate(`/user/items/${item.id}/edit`)}
              className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90"
            >
              Edit
            </button>
          </div>
        </div>
      </div>

      <div className="space-y-4 rounded-xl border border-border bg-card p-6">
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <p className="text-xs text-muted-foreground">ID</p>
            <p className="mt-1 text-sm font-medium">{item.id}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Status</p>
            <p className="mt-1">
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
            </p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Created At</p>
            <p className="mt-1 text-sm">
              {new Date(item.createdAt).toLocaleString()}
            </p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Updated At</p>
            <p className="mt-1 text-sm">
              {new Date(item.updatedAt).toLocaleString()}
            </p>
          </div>
        </div>

        <div>
          <p className="text-xs text-muted-foreground">Description</p>
          <p className="mt-1 text-sm text-foreground">
            {item.description || "—"}
          </p>
        </div>

        <div>
          <p className="text-xs text-muted-foreground">Role Access</p>
          <div className="mt-1 flex gap-2">
            {item.roleAccess.map((role) => (
              <span
                key={role}
                className="rounded bg-primary/20 px-2 py-1 text-xs text-primary"
              >
                {role}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserViewItemPage;
