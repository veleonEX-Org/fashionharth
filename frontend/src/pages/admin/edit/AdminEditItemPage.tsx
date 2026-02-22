import React, { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { http } from "../../../api/http";
import { fetchCategories } from "../../../api/categories";
import { FormField } from "../../../components/forms/FormField";
import { Input } from "../../../components/forms/Input";
import { Textarea } from "../../../components/forms/Textarea";
import { Select } from "../../../components/forms/Select";
import { Checkbox } from "../../../components/forms/Checkbox";
import { ImageUpload } from "../../../components/forms/ImageUpload";
import { BackButton } from "../../../components/ui/BackButton";
import { ReviewsManager } from "../../../components/admin/ReviewsManager";
import type { UpdateItemPayload, Item, Review } from "../../../types/item";
import { z } from "zod";

const itemSchema = z.object({
  title: z.string().min(1, "Title is required.").max(255).optional(),
  description: z.string().nullable().optional(),
  status: z.enum(["active", "inactive", "archived"]).optional(),

  price: z.number().min(0).optional(),
  category: z.string().min(1, "Category is required").optional(),
  story: z.string().nullable().optional(),
  isTrending: z.boolean().optional(),
  imageUrl: z.string().url().nullable().optional().or(z.literal("")),
  inspiredImageUrl: z.string().url().nullable().optional().or(z.literal("")),
  discountPercentage: z.number().min(0).max(100).optional(),
  installmentDuration: z.number().min(0).nullable().optional(),
});

const AdminEditItemPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState<"active" | "inactive" | "archived">(
    "active"
  );

  const [price, setPrice] = useState("0");
  const [discountPercentage, setDiscountPercentage] = useState("0");
  const [installmentDuration, setInstallmentDuration] = useState(""); 
  
  const [category, setCategory] = useState("");
  const [story, setStory] = useState("");
  const [isTrending, setIsTrending] = useState(false);
  const [imageUrl, setImageUrl] = useState("");
  const [inspiredImageUrl, setInspiredImageUrl] = useState("");
  const [reviews, setReviews] = useState<Review[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const { data: item, isLoading } = useQuery<Item>({
    queryKey: ["admin-item", id],
    queryFn: async () => {
      const res = await http.get<Item>(`/items/${id}`);
      return res.data;
    },
    enabled: !!id,
  });

  const { data: categories } = useQuery({
    queryKey: ["categories"],
    queryFn: fetchCategories,
  });

  useEffect(() => {
    if (item) {
      setTitle(item.title);
      setDescription(item.description || "");
      setStatus(item.status);

      setPrice(item.price.toString());
      setCategory(item.category);
      setStory(item.story || "");
      setIsTrending(item.isTrending);
      setImageUrl(item.imageUrl || "");
      setInspiredImageUrl(item.inspiredImageUrl || "");
      
      setDiscountPercentage((item.discountPercentage || 0).toString());
      setInstallmentDuration(item.installmentDuration !== null && item.installmentDuration !== undefined ? item.installmentDuration.toString() : "");
      
      // Load reviews if they exist (assuming stored in metadata on backend but served as property on frontend Item type)
      // Note: Backend 'toPublicItem' maps metadata.reviews -> item.reviews
      if (item.reviews) {
        setReviews(item.reviews);
      } else if (item.metadata && Array.isArray((item.metadata as any).reviews)) {
         // Fallback if not mapped yet
         setReviews((item.metadata as any).reviews);
      }
    }
  }, [item]);

  const mutation = useMutation({
    mutationFn: async (payload: UpdateItemPayload) => {
      const res = await http.put<Item>(`/items/${id}`, payload);
      return res.data;
    },
    onSuccess: () => {
      toast.success("Item updated successfully!");
      queryClient.invalidateQueries({ queryKey: ["admin-items"] });
      queryClient.invalidateQueries({ queryKey: ["admin-item", id] });
      navigate(`/admin/items/${id}`);
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    const parsed = itemSchema.safeParse({
      title,
      description: description || null,
      status,

      price: parseFloat(price),
      category,
      story: story || null,
      isTrending,
      imageUrl: imageUrl || null,
      inspiredImageUrl: inspiredImageUrl || null,
      discountPercentage: parseFloat(discountPercentage),
      installmentDuration: installmentDuration ? parseInt(installmentDuration) : null,
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

    // Include reviews in metadata
    // We send it as part of 'metadata' payload
    mutation.mutate({
      ...parsed.data,
      metadata: {
        reviews: reviews
      }
    });
  };

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
          onClick={() => navigate("/admin/items")}
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
        <BackButton />
        <div>
          <h1 className="text-2xl font-semibold">Edit Item</h1>
          <p className="mt-1 text-sm text-muted-foreground">Update item details and manage content.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8 rounded-xl border border-border bg-card p-6">
        <div className="space-y-4">
            <h3 className="font-bold text-lg">Basic Info</h3>
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
            <FormField label="Price (₦)" name="price" required error={errors.price}>
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
                    { value: "", label: "Select category" },
                    ...(categories?.map((cat) => ({ value: cat.name, label: cat.name })) || []),
                ]}
                error={errors.category}
                />
            </FormField>
            </div>
        </div>
        
        <div className="space-y-4 pt-4 border-t border-border">
             <h3 className="font-bold text-lg">Sales & Trending</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField label="Discount (%)" name="discountPercentage" error={errors.discountPercentage}>
                <Input
                type="number"
                value={discountPercentage}
                onChange={(e) => setDiscountPercentage(e.target.value)}
                error={errors.discountPercentage}
                placeholder="0"
                min={0}
                max={100}
                />
            </FormField>

            <FormField label="Installment Months" name="installmentDuration" error={errors.installmentDuration}>
                <Input
                type="number"
                value={installmentDuration}
                onChange={(e) => setInstallmentDuration(e.target.value)}
                error={errors.installmentDuration}
                placeholder="(Optional) Default: Dynamic"
                min={0}
                />
                <p className="text-[10px] text-muted-foreground mt-1">Set '0' to disable installments. Leave empty for default dynamic logic.</p>
            </FormField>
            </div>
             <Checkbox
                id="isTrending"
                label="Show in Trending"
                checked={isTrending}
                onChange={(e) => setIsTrending(e.target.checked)}
            />
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
        </div>

        <div className="space-y-4 pt-4 border-t border-border">
            <h3 className="font-bold text-lg">Visuals & Story</h3>
            <ImageUpload
            label="Product Image"
            value={imageUrl}
            onChange={setImageUrl}
            folder="products"
            error={errors.imageUrl}
            />

            <ImageUpload
            label="Inspired Image (Overlay)"
            value={inspiredImageUrl}
            onChange={setInspiredImageUrl}
            folder="inspired"
            error={errors.inspiredImageUrl}
            />

            <FormField label="The Story" name="story" error={errors.story}>
            <Textarea
                value={story}
                onChange={(e) => setStory(e.target.value)}
                error={errors.story}
                rows={4}
                placeholder="Tell the story behind this design inspired by..."
            />
            </FormField>
        </div>
        
        {/* Social Proof Manager */}
        <div className="space-y-4 pt-4 border-t border-border">
            <h3 className="font-bold text-lg">Social Proof</h3>
            <ReviewsManager reviews={reviews} onChange={setReviews} />
        </div>

        <div className="flex gap-3 pt-6">
          <button
            type="submit"
            disabled={mutation.isPending}
            className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {mutation.isPending ? "Updating..." : "Update Item"}
          </button>
          <button
            type="button"
            onClick={() => navigate(`/admin/items/${id}`)}
            className="rounded-md border border-border bg-input px-4 py-2 text-sm font-medium text-muted-foreground hover:border-primary hover:text-primary"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default AdminEditItemPage;
