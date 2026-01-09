import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { fetchItemById } from "../api/items";
import { useAuth } from "../state/AuthContext";
import toast from "react-hot-toast";
import { CheckoutButton } from "../components/Payment/CheckoutButton";

const ItemDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<"details" | "story">("story");

  const { data: item, isLoading, error } = useQuery({
    queryKey: ["item", id],
    queryFn: () => fetchItemById(Number(id)),
    enabled: !!id,
  });

  const handleAction = (action: "favorite") => {
    if (action === "favorite") {
       toast.success("Added to favorites");
    }
  };

  const [paymentMode, setPaymentMode] = useState<"full" | "installment">("full");

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (error || !item) {
    return (
      <div className="flex min-h-screen items-center justify-center text-center">
        <div>
          <h2 className="text-2xl font-bold">Item not found</h2>
          <button onClick={() => navigate(-1)} className="mt-4 text-primary hover:underline">
            Go back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 md:py-16">
      <div className="grid gap-12 lg:grid-cols-2">
        {/* Image Section */}
        <div className="relative aspect-[3/4] overflow-hidden rounded-2xl bg-zinc-900 shadow-2xl overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent z-10" />
          {item.imageUrl ? (
            <img
              src={item.imageUrl}
              alt={item.title}
              className="h-full w-full object-cover transition-transform duration-700 hover:scale-110"
            />
          ) : (
             <div className="flex h-full w-full items-center justify-center text-zinc-700">
              No Image
            </div>
          )}
           {item.isTrending && (
            <div className="absolute top-6 left-6 z-20 rounded-full bg-primary px-4 py-2 text-[10px] font-black tracking-[0.2em] text-white shadow-lg uppercase">
              Trending Piece
            </div>
          )}
        </div>

        {/* Info Section */}
        <div className="flex flex-col justify-center space-y-10">
          <div>
            <div className="mb-4 inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-[10px] font-bold tracking-widest uppercase">
              Handcrafted Excellence
            </div>
            <h1 className="text-5xl font-black tracking-tighter text-zinc-900 md:text-7xl leading-[0.9]">{item.title}</h1>
            <div className="mt-6 flex items-baseline gap-2">
              <span className="text-4xl font-black text-zinc-900">${item.price.toFixed(2)}</span>
              <span className="text-zinc-400 font-bold text-sm tracking-widest uppercase">{item.category}</span>
            </div>
          </div>

          <div className="flex gap-8 border-b border-zinc-100 pb-0">
            <button
              onClick={() => setActiveTab("story")}
              className={`pb-4 text-[10px] font-black tracking-[0.2em] transition-all uppercase ${
                activeTab === "story" ? "border-b-2 border-primary text-black" : "text-zinc-400 hover:text-black"
              }`}
            >
              The Background
            </button>
            <button
              onClick={() => setActiveTab("details")}
              className={`pb-4 text-[10px] font-black tracking-[0.2em] transition-all uppercase ${
                activeTab === "details" ? "border-b-2 border-primary text-black" : "text-zinc-400 hover:text-black"
              }`}
            >
              Fabric & Fit
            </button>
          </div>

          <div className="min-h-[120px]">
            {activeTab === "story" ? (
              <p className="text-xl leading-relaxed text-zinc-500 font-medium italic">
                "{item.story || "This piece was inspired by the intersection of traditional heritage and modern silhouette."}"
              </p>
            ) : (
              <p className="text-lg leading-relaxed text-zinc-600 font-medium">
                {item.description || "Premium fabric selection with tailored precision. Designed for an impeccable drape and lasting comfort."}
              </p>
            )}
          </div>

          {/* Payment Mode Selector */}
          <div className="space-y-4">
            <p className="text-[10px] font-black tracking-widest text-zinc-400 uppercase">Selection Payment Method</p>
            <div className="grid grid-cols-2 gap-4">
              <button 
                onClick={() => setPaymentMode("full")}
                className={`p-4 rounded-2xl border-2 transition-all text-left ${paymentMode === "full" ? "border-black bg-black text-white" : "border-zinc-100 bg-zinc-50 hover:border-zinc-200"}`}
              >
                <div className="font-black text-xs tracking-widest uppercase mb-1">Pay in Full</div>
                <div className={`text-[10px] font-bold block ${paymentMode === "full" ? "text-zinc-400" : "text-zinc-500"}`}>Immediate order processing</div>
              </button>
              <button 
                onClick={() => setPaymentMode("installment")}
                className={`p-4 rounded-2xl border-2 transition-all text-left ${paymentMode === "installment" ? "border-black bg-black text-white" : "border-zinc-100 bg-zinc-50 hover:border-zinc-200"}`}
              >
                <div className="font-black text-xs tracking-widest uppercase mb-1">Installments</div>
                <div className={`text-[10px] font-bold block ${paymentMode === "installment" ? "text-zinc-400" : "text-zinc-500"}`}>From ${(item.price / 3).toFixed(2)} / month</div>
              </button>
            </div>
          </div>

          <div className="flex flex-col gap-4 md:flex-row">
            <CheckoutButton 
              amount={item.price}
              currency="USD"
              type={paymentMode === "full" ? "item" : "installment"}
              itemId={item.id}
              label={paymentMode === "installment" ? "START INSTALLMENTS" : "ORDER NOW"}
              fullWidth
            />
            <button
              onClick={() => handleAction("favorite")}
              className="flex-1 rounded-full border border-zinc-200 bg-transparent px-8 py-4 text-center text-[10px] font-black tracking-[0.2em] text-black transition-all hover:bg-zinc-50 hover:border-zinc-400"
            >
              WISHLIST
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ItemDetailsPage;
