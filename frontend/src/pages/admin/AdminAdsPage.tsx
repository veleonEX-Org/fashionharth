import React, { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchAds, createAd, updateAd, deleteAd, Ad } from "../../api/ads";
import toast from "react-hot-toast";
import { BackButton } from "../../components/ui/BackButton";
import { Input } from "../../components/forms/Input";
import { ImageUpload } from "../../components/forms/ImageUpload";

const AdminAdsPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAd, setEditingAd] = useState<Ad | null>(null);
  const [imageUrl, setImageUrl] = useState("");

  useEffect(() => {
    if (editingAd) {
      setImageUrl(editingAd.imageUrl);
    } else {
      setImageUrl("");
    }
  }, [editingAd]);

  const { data: ads, isLoading } = useQuery({
    queryKey: ["admin-ads"],
    queryFn: fetchAds,
  });

  const createMutation = useMutation({
    mutationFn: createAd,
    onSuccess: () => {
      toast.success("Ad created successfully");
      queryClient.invalidateQueries({ queryKey: ["admin-ads"] });
      queryClient.invalidateQueries({ queryKey: ["ads"] });
      setIsModalOpen(false);
    },
    onError: (error: any) => toast.error(error.message || "Failed to create ad"),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<Ad> }) => updateAd(id, data),
    onSuccess: () => {
      toast.success("Ad updated successfully");
      queryClient.invalidateQueries({ queryKey: ["admin-ads"] });
      queryClient.invalidateQueries({ queryKey: ["ads"] });
      setIsModalOpen(false);
      setEditingAd(null);
    },
    onError: (error: any) => toast.error(error.message || "Failed to update ad"),
  });

  const deleteMutation = useMutation({
    mutationFn: deleteAd,
    onSuccess: () => {
      toast.success("Ad deleted successfully");
      queryClient.invalidateQueries({ queryKey: ["admin-ads"] });
      queryClient.invalidateQueries({ queryKey: ["ads"] });
    },
    onError: (error: any) => toast.error(error.message || "Failed to delete ad"),
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    if (!imageUrl) {
      toast.error("Please upload an image");
      return;
    }

    const data = {
      title: formData.get("title") as string,
      description: formData.get("description") as string,
      imageUrl,
      linkUrl: formData.get("linkUrl") as string || null,
      badgeText: formData.get("badgeText") as string || null,
      offerText: formData.get("offerText") as string || null,
      offerSubtext: formData.get("offerSubtext") as string || null,
      status: formData.get("status") as "active" | "inactive",
    };

    if (editingAd) {
      updateMutation.mutate({ id: editingAd.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const handleEdit = (ad: Ad) => {
    setEditingAd(ad);
    setIsModalOpen(true);
  };

  const handleDelete = (id: number) => {
    if (window.confirm("Are you sure you want to delete this ad?")) {
      deleteMutation.mutate(id);
    }
  };

  return (
    <div className="mx-auto max-w-6xl space-y-8 p-4 md:p-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <BackButton />
          <h1 className="text-3xl font-bold text-foreground">Manage Ads</h1>
        </div>
        <button
          onClick={() => {
            setEditingAd(null);
            setIsModalOpen(true);
          }}
          className="rounded-full bg-primary px-6 py-2 text-sm font-bold text-white shadow-lg transition-all hover:scale-105 active:scale-95"
        >
          + Create New Ad
        </button>
      </div>

      {isLoading ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-64 animate-pulse rounded-2xl bg-muted" />
          ))}
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {ads?.map((ad) => (
            <div key={ad.id} className="group overflow-hidden rounded-2xl border border-border bg-card shadow-sm transition-all hover:shadow-md">
              <div className="relative h-40 overflow-hidden">
                <img src={ad.imageUrl} alt={ad.title} className="h-full w-full object-cover" />
                <div className={`absolute top-2 right-2 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase text-white ${ad.status === "active" ? "bg-approve" : "bg-muted-foreground"}`}>
                  {ad.status}
                </div>
              </div>
              <div className="p-4">
                <h3 className="font-bold text-foreground line-clamp-1">{ad.title}</h3>
                <p className="mt-1 text-xs text-muted-foreground line-clamp-2 min-h-[2.5rem]">{ad.description}</p>
                <div className="mt-4 flex items-center justify-end gap-2">
                  <button
                    onClick={() => handleEdit(ad)}
                    className="rounded-lg bg-secondary/10 px-3 py-1.5 text-xs font-bold text-secondary transition-colors hover:bg-secondary/20"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(ad.id)}
                    className="rounded-lg bg-destructive/10 px-3 py-1.5 text-xs font-bold text-destructive transition-colors hover:bg-destructive/20"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
          {ads?.length === 0 && (
            <div className="col-span-full py-20 text-center text-muted-foreground">
              No ads created yet.
            </div>
          )}
        </div>
      )}

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-sm bg-black/50">
          <div className="w-full max-w-lg overflow-hidden rounded-3xl border border-border bg-card shadow-2xl">
            <div className="border-b border-border p-6 font-bold text-foreground">
              {editingAd ? "Edit Ad" : "Create New Ad"}
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground leading-none">Title</label>
                <Input name="title" defaultValue={editingAd?.title} required placeholder="Summer Sale" />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground leading-none">Description</label>
                <textarea
                  name="description"
                  defaultValue={editingAd?.description || ""}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  placeholder="Get up to 50% off on all summer collections..."
                />
              </div>
              
              <ImageUpload
                label="Ad Banner Image"
                value={imageUrl}
                onChange={setImageUrl}
                folder="ads"
              />

              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground leading-none">Link URL (Optional)</label>
                <Input name="linkUrl" defaultValue={editingAd?.linkUrl || ""} placeholder="/trending" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground leading-none">Badge Text</label>
                  <Input name="badgeText" defaultValue={editingAd?.badgeText || ""} placeholder="Limited Time Offer" />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground leading-none">Status</label>
                  <select name="status" defaultValue={editingAd?.status || "active"} className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground leading-none">Offer Text</label>
                  <Input name="offerText" defaultValue={editingAd?.offerText || ""} placeholder="25% OFF" />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground leading-none">Offer Subtext</label>
                  <Input name="offerSubtext" defaultValue={editingAd?.offerSubtext || ""} placeholder="ON ALL ORDERS" />
                </div>
              </div>

              <div className="mt-8 flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="rounded-lg px-4 py-2 text-sm font-bold text-muted-foreground hover:bg-muted"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createMutation.isPending || updateMutation.isPending}
                  className="rounded-lg bg-primary px-6 py-2 text-sm font-bold text-white shadow-lg transition-all hover:scale-105 active:scale-95 disabled:opacity-50"
                >
                  {editingAd ? "Update Ad" : "Create Ad"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminAdsPage;
