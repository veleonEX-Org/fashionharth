import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { fetchPublicItems } from "../api/items";
import { toggleFavorite } from "../api/looks";
import { useAuth } from "../state/AuthContext";
import toast from "react-hot-toast";
import FashionCard from "../components/FashionCard";

const LandingPage: React.FC = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [maxPrice, setMaxPrice] = useState(1000);

  const { data, isLoading } = useQuery({
    queryKey: ["public-items", category, maxPrice, search],
    queryFn: () =>
      fetchPublicItems({
        category: category === "All" ? undefined : category,
        maxPrice,
        search: search || undefined
      }),
  });

  const favoriteMutation = useMutation({
    mutationFn: (itemId: number) => toggleFavorite(itemId, "add"),
    onSuccess: () => {
      toast.success("Added to your wishlist!");
      queryClient.invalidateQueries({ queryKey: ["favorites"] });
    },
    onError: () => {
      toast.error("Failed to add to wishlist");
    }
  });

  const handleFavorite = (id: number) => {
    if (!user) return toast.error("Please login to wishlist items");
    favoriteMutation.mutate(id);
  };

  const categories = ["Dresses", "Tops", "Bottoms", "Shoes", "Accessories", "Outerwear"];

  return (
    <div className="space-y-12 pb-20">
      {/* Hero Section */}
      <section className="relative h-[85vh] w-full overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center">
          <div className="absolute inset-0 bg-black/30 backdrop-blur-[1px]" />
        </div>
        <div className="relative z-10 flex h-full flex-col items-center justify-center text-center px-4">
          <h1 className="font-heading text-6xl md:text-8xl font-bold text-white tracking-tighter mb-6 drop-shadow-xl">
            MODERN <span className="text-primary italic">ELEGANCE</span>
          </h1>
          <p className="max-w-xl text-lg md:text-xl text-gray-100 mb-8 font-light drop-shadow-md">
            Discover the stories behind the threads. Fashion re-imagined for the bold and the free.
          </p>
          <Link
            to="/trending"
            className="rounded-full bg-white text-black px-10 py-4 font-bold text-sm tracking-widest hover:bg-primary hover:text-white transition-all duration-300 shadow-2xl hover:scale-105 hover:shadow-primary/50"
          >
            EXPLORE TRENDING
          </Link>
        </div>
      </section>
      
      {/* Ads Banner */}
      <section className="mx-auto max-w-7xl px-4 py-8">
        <div className="group relative h-64 md:h-96 w-full overflow-hidden rounded-[2rem] shadow-2xl ring-1 ring-white/10 transition-all hover:ring-primary/50">
          <img 
            src="/convocation-sale.png" 
            alt="Convocation Sale" 
            className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/40 to-transparent flex flex-col justify-center px-10 md:px-20">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-primary/20 backdrop-blur-md px-4 py-1.5 text-[10px] font-bold tracking-widest text-primary uppercase border border-primary/30">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
              </span>
              Limited Time Offer
            </div>
            <h2 className="text-4xl md:text-6xl font-black text-white mb-3 tracking-tighter drop-shadow-2xl">
              CONVOCATION <span className="text-primary italic">SALE</span>
            </h2>
            <p className="max-w-md text-base md:text-xl text-gray-200 mb-8 font-medium leading-relaxed drop-shadow-lg">
              Craft your legacy with custom tailored suits and kaftans. Perfect for your big day.
            </p>
            <Link 
              to="/pricing" 
              className="w-fit rounded-full bg-white px-10 py-4 text-xs font-black tracking-widest text-black hover:bg-primary hover:text-white transition-all duration-300 shadow-[0_0_40px_rgba(255,255,255,0.1)] hover:shadow-primary/40 hover:-translate-y-1"
            >
              START MAKING PAYMENT NOW
            </Link>
          </div>
          
          {/* Decorative glass elements */}
          <div className="absolute bottom-10 right-10 hidden md:flex flex-col gap-2 rounded-2xl bg-white/5 backdrop-blur-md p-4 border border-white/10 shadow-2xl">
            <div className="text-white font-bold text-2xl">25% OFF</div>
            <div className="text-gray-400 text-[10px] font-bold tracking-widest">ON ALL CUSTOM ORDERS</div>
          </div>
        </div>
      </section>

      {/* Filter & Search Bar */}
      <section className="sticky top-4 z-30 mx-auto max-w-6xl rounded-2xl border border-border bg-card/80 backdrop-blur-xl p-4 shadow-xl transition-all">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          {/* Categories */}
          <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0 scrollbar-hide">
            <button
              onClick={() => setCategory("")}
              className={`whitespace-nowrap rounded-full px-4 py-2 text-xs font-bold transition-colors ${
                category === "" ? "bg-foreground text-background" : "bg-muted text-muted-foreground hover:bg-muted/80"
              }`}
            >
              ALL
            </button>
            {categories.map((c) => (
              <button
                key={c}
                onClick={() => setCategory(c)}
                className={`whitespace-nowrap rounded-full px-4 py-2 text-xs font-bold transition-colors ${
                  category === c ? "bg-foreground text-background" : "bg-muted text-muted-foreground hover:bg-muted/80"
                }`}
              >
                {c.toUpperCase()}
              </button>
            ))}
          </div>

          {/* Search */}
          <div className="relative w-full md:w-64">
             <input
              type="text"
              placeholder="Search collections..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-full border border-border bg-muted px-4 py-2 pl-10 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary placeholder-muted-foreground"
            />
            <svg
              className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>
      </section>

      {/* Grid */}
      <section className="mx-auto max-w-7xl px-4">
        {isLoading ? (
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="aspect-[3/4] animate-pulse rounded-xl bg-muted" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {data?.items.map((item) => (
              <FashionCard key={item.id} item={item} onFavorite={handleFavorite} />
            ))}
          </div>
        )}
        
        {data?.items.length === 0 && (
          <div className="py-20 text-center">
            <h3 className="text-2xl font-bold text-muted-foreground">No items found</h3>
            <p className="text-muted-foreground">Try adjusting your filters.</p>
          </div>
        )}
      </section>
    </div>
  );
};

export default LandingPage;
