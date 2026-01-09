import React, { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { http } from "../../../api/http";
import { FormField } from "../../../components/forms/FormField";
import { Input } from "../../../components/forms/Input";
import { Textarea } from "../../../components/forms/Textarea";
import { Select } from "../../../components/forms/Select";
import { MultiSelect } from "../../../components/forms/MultiSelect";
import type { CreateItemPayload, Item } from "../../../types/item";
import { z } from "zod";

const itemSchema = z.object({
  title: z.string().min(1, "Title is required.").max(255),
  description: z.string().nullable().optional(),
  status: z.enum(["active", "inactive", "archived"]),
  roleAccess: z
    .array(z.enum(["admin", "staff", "user"]))
    .min(1, "At least one role access is required."),
  price: z.number().min(0).default(0),
  category: z.string().min(1, "Category is required"),
  story: z.string().nullable().optional(),
  isTrending: z.boolean().default(false),
  imageUrl: z.string().url().nullable().optional().or(z.literal("")),
});

const AdminAddItemPage: React.FC = () => {
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState<"active" | "inactive" | "archived">(
    "active"
  );
  const [roleAccess, setRoleAccess] = useState<string[]>(["user"]);
  const [price, setPrice] = useState("0");
  const [category, setCategory] = useState("Dresses");
  const [story, setStory] = useState("");
  const [isTrending, setIsTrending] = useState(false);
  const [imageUrl, setImageUrl] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  const mutation = useMutation({
    mutationFn: async (payload: CreateItemPayload) => {
      const res = await http.post<Item>("/items", payload);
      return res.data;
    },
    onSuccess: () => {
      toast.success("Item created successfully!");
      navigate("/admin/items");
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
      price: parseFloat(price),
      category,
      story: story || null,
      isTrending,
      imageUrl: imageUrl || null,
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

    mutation.mutate(parsed.data as any);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Add New Item</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Create a new item in the system.
        </p>
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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField label="Price" name="price" required error={errors.price}>
            <Input
              type="number"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              error={errors.price}
              placeholder="0.00"
            />
          </FormField>

          <FormField label="Category" name="category" required error={errors.category}>
            <Select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              options={[
                { value: "Dresses", label: "Dresses" },
                { value: "Tops", label: "Tops" },
                { value: "Bottoms", label: "Bottoms" },
                { value: "Shoes", label: "Shoes" },
                { value: "Accessories", label: "Accessories" },
                { value: "Outerwear", label: "Outerwear" },
              ]}
              error={errors.category}
            />
          </FormField>
        </div>

        <FormField label="Image URL" name="imageUrl" error={errors.imageUrl}>
          <Input
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
            error={errors.imageUrl}
            placeholder="https://..."
          />
        </FormField>

        <FormField label="The Story" name="story" error={errors.story}>
          <Textarea
            value={story}
            onChange={(e) => setStory(e.target.value)}
            error={errors.story}
            rows={4}
            placeholder="Tell the story behind this design inspired by..."
          />
        </FormField>

        <div className="flex items-center gap-2 py-2">
          <input
            type="checkbox"
            id="isTrending"
            checked={isTrending}
            onChange={(e) => setIsTrending(e.target.checked)}
            className="h-4 w-4 rounded border-border bg-input text-primary focus:ring-primary"
          />
          <label htmlFor="isTrending" className="text-sm font-medium text-foreground">
            Show in Trending
          </label>
        </div>

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
            {mutation.isPending ? "Creating..." : "Create Item"}
          </button>
          <button
            type="button"
            onClick={() => navigate("/admin/items")}
            className="rounded-md border border-border bg-input px-4 py-2 text-sm font-medium text-muted-foreground hover:border-primary hover:text-primary"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default AdminAddItemPage;
