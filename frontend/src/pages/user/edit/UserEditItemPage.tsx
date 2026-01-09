import React, { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { http } from "../../../api/http";
import { FormField } from "../../../components/forms/FormField";
import { Input } from "../../../components/forms/Input";
import { Textarea } from "../../../components/forms/Textarea";
import { Select } from "../../../components/forms/Select";
import { MultiSelect } from "../../../components/forms/MultiSelect";
import type { UpdateItemPayload, Item } from "../../../types/item";
import { z } from "zod";

const itemSchema = z.object({
  title: z.string().min(1, "Title is required.").max(255).optional(),
  description: z.string().nullable().optional(),
  status: z.enum(["active", "inactive", "archived"]).optional(),
  roleAccess: z
    .array(z.enum(["admin", "staff", "user"]))
    .min(1, "At least one role access is required.")
    .optional(),
});

const UserEditItemPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState<"active" | "inactive" | "archived">(
    "active"
  );
  const [roleAccess, setRoleAccess] = useState<string[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const { data: item, isLoading } = useQuery<Item>({
    queryKey: ["user-item", id],
    queryFn: async () => {
      const res = await http.get<Item>(`/items/${id}`);
      return res.data;
    },
    enabled: !!id,
  });

  useEffect(() => {
    if (item) {
      setTitle(item.title);
      setDescription(item.description || "");
      setStatus(item.status);
      setRoleAccess(item.roleAccess);
    }
  }, [item]);

  const mutation = useMutation({
    mutationFn: async (payload: UpdateItemPayload) => {
      const res = await http.put<Item>(`/items/${id}`, payload);
      return res.data;
    },
    onSuccess: () => {
      toast.success("Item updated successfully!");
      queryClient.invalidateQueries({ queryKey: ["user-items"] });
      queryClient.invalidateQueries({ queryKey: ["user-item", id] });
      navigate(`/user/items/${id}`);
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    const parsed = itemSchema.safeParse({
      title,
      description: description || null,
      status,
      roleAccess: roleAccess as ("admin" | "staff" | "user")[],
    });

    if (!parsed.success) {
      const fieldErrors: Record<string, string> = {};
      parsed.error.issues.forEach((issue) => {
        const path = issue.path[0] as string;
        fieldErrors[path] = issue.message;
      });
      setErrors(fieldErrors);
      return;
    }

    mutation.mutate(parsed.data);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-sm text-muted-foreground">Loading...</p>
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
      <div>
        <h1 className="text-2xl font-semibold">Edit Item</h1>
        <p className="mt-1 text-sm text-muted-foreground">Update item details.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4 rounded-xl border border-border bg-card p-6">
        <FormField label="Title" name="title" required error={errors.title}>
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            error={errors.title}
            placeholder="Enter item title"
          />
        </FormField>

        <FormField
          label="Description"
          name="description"
          error={errors.description}
        >
          <Textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            error={errors.description}
            rows={4}
            placeholder="Enter item description (optional)"
          />
        </FormField>

        <FormField label="Status" name="status" required error={errors.status}>
          <Select
            value={status}
            onChange={(e) =>
              setStatus(e.target.value as "active" | "inactive" | "archived")
            }
            options={[
              { value: "active", label: "Active" },
              { value: "inactive", label: "Inactive" },
              { value: "archived", label: "Archived" },
            ]}
            error={errors.status}
          />
        </FormField>

        <FormField
          label="Role Access"
          name="roleAccess"
          required
          error={errors.roleAccess}
        >
          <MultiSelect
            value={roleAccess}
            onChange={setRoleAccess}
            options={[
              { value: "admin", label: "Admin" },
              { value: "staff", label: "Staff" },
              { value: "user", label: "User" },
            ]}
            error={errors.roleAccess}
            placeholder="Select roles that can access this item"
          />
        </FormField>

        <div className="flex gap-3">
          <button
            type="submit"
            disabled={mutation.isPending}
            className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {mutation.isPending ? "Updating..." : "Update Item"}
          </button>
          <button
            type="button"
            onClick={() => navigate(`/user/items/${id}`)}
            className="rounded-md border border-border bg-input px-4 py-2 text-sm font-medium text-muted-foreground hover:border-primary hover:text-primary"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default UserEditItemPage;




