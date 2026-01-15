import React, { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { http } from "../../../api/http";
import { FormField } from "../../../components/forms/FormField";
import { Input } from "../../../components/forms/Input";
import { Textarea } from "../../../components/forms/Textarea";
import { Select } from "../../../components/forms/Select";
import { fetchCategories } from "../../../api/categories";
import type { CreateItemPayload, Item } from "../../../types/item";
import { z } from "zod";
import { BackButton } from "../../../components/ui/BackButton";

const itemSchema = z.object({
  title: z.string().min(1, "Title is required.").max(255),
  description: z.string().nullable().optional(),
  status: z.enum(["active", "inactive", "archived"]),
});

const StaffAddItemPage: React.FC = () => {
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState<"active" | "inactive" | "archived">(
    "active"
  );
  const [category, setCategory] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  const { data: categories } = useQuery({
    queryKey: ["categories"],
    queryFn: fetchCategories,
  });

  React.useEffect(() => {
    if (categories && categories.length > 0 && !category) {
      setCategory(categories[0].name);
    }
  }, [categories, category]);

  const mutation = useMutation({
    mutationFn: async (payload: CreateItemPayload) => {
      const res = await http.post<Item>("/items", payload);
      return res.data;
    },
    onSuccess: () => {
      toast.success("Item created successfully!");
      navigate("/staff/items");
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    const parsed = itemSchema.safeParse({
      title,
      description: description || null,
      status,
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

    mutation.mutate({
      ...parsed.data,
      category,
    } as CreateItemPayload);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4">
        <BackButton to="/staff/items" />
        <div>
          <h1 className="text-2xl font-semibold">Add New Item</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Create a new item in the system.
          </p>
        </div>
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

        <FormField label="Category" name="category" required error={errors.category}>
          <Select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            options={[
              { value: "", label: "Select category" },
              ...(categories?.map((cat) => ({ value: cat.name, label: cat.name })) || []),
            ]}
            error={errors.category}
          />
        </FormField>

        <div className="flex gap-3">
          <button
            type="submit"
            disabled={mutation.isPending}
            className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {mutation.isPending ? "Creating..." : "Create Item"}
          </button>
          <button
            type="button"
            onClick={() => navigate("/staff/items")}
            className="rounded-md border border-border bg-input px-4 py-2 text-sm font-medium text-muted-foreground hover:border-primary hover:text-primary"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default StaffAddItemPage;
