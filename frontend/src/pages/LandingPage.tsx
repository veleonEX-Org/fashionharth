import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link, useSearchParams } from "react-router-dom";
import { fetchPublicItems } from "../api/items";
import { fetchCategories } from "../api/categories";
import { toggleFavorite } from "../api/looks";
import { useAuth } from "../state/AuthContext";
import toast from "react-hot-toast";
import FashionCard from "../components/FashionCard";
import { Input } from "../components/forms/Input";
import AdSection from "../components/AdSection";


const LandingPage: React.FC = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const initialCategory = searchParams.get("category") || "";
  
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState(initialCategory);
  const [minPrice, setMinPrice] = useState<number | undefined>(undefined);
  const [maxPrice, setMaxPrice] = useState<number | undefined>(undefined);

  React.useEffect(() => {
    const cat = searchParams.get("category") || "";
    setCategory(cat);
  }, [searchParams]);

  const { data, isLoading } = useQuery({
    queryKey: ["public-items", category, minPrice, maxPrice, search],
    queryFn: () =>
      fetchPublicItems({
        category: category === "" ? undefined : category,
        minPrice,
        maxPrice,
        search: search || undefined
      }),
  });

  const { data: categoriesData } = useQuery({
    queryKey: ["categories"],
    queryFn: fetchCategories,
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

  const categories = categoriesData?.map(c => c.name) || [];

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
      <AdSection />


      {/* Filter & Search Bar */}
      <section className="sticky top-4 z-30 mx-auto max-w-6xl rounded-2xl border border-border bg-card/80 backdrop-blur-xl p-4 shadow-xl transition-all">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          {/* Categories */}
          <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0 scrollbar-hide">
            <button
              onClick={() => {
                setCategory("");
                setSearchParams(prev => {
                  prev.delete("category");
                  return prev;
                });
              }}
              className={`whitespace-nowrap rounded-full px-4 py-2 text-xs font-bold transition-colors ${
                category === "" ? "bg-foreground text-background" : "bg-muted text-muted-foreground hover:bg-muted/80"
              }`}
            >
              ALL
            </button>
            {categories.map((c) => (
              <button
                key={c}
                onClick={() => {
                  setCategory(c);
                  setSearchParams(prev => {
                    prev.set("category", c);
                    return prev;
                  });
                }}
                className={`whitespace-nowrap rounded-full px-4 py-2 text-xs font-bold transition-colors ${
                  category === c ? "bg-foreground text-background" : "bg-muted text-muted-foreground hover:bg-muted/80"
                }`}
              >
                {c.toUpperCase()}
              </button>
            ))}
            <Link
              to="/categories"
              className="whitespace-nowrap rounded-full px-4 py-2 text-xs font-bold bg-primary text-white hover:bg-primary/80 transition-colors"
            >
              VIEW ALL
            </Link>
          </div>

          {/* Search & Price */}
          <div className="flex flex-col gap-4 md:flex-row md:items-center">
            <div className="flex items-center gap-2">
              <div className="relative w-24">
                <Input
                  type="number"
                  placeholder="Min"
                  value={minPrice || ""}
                  onChange={(e) => setMinPrice(e.target.value ? Number(e.target.value) : undefined)}
                  className="rounded-full px-4 h-9"
                />
              </div>
              <span className="text-muted-foreground">-</span>
              <div className="relative w-24">
                <Input
                  type="number"
                  placeholder="Max"
                  value={maxPrice || ""}
                  onChange={(e) => setMaxPrice(e.target.value ? Number(e.target.value) : undefined)}
                  className="rounded-full px-4 h-9"
                />
              </div>
            </div>

            <div className="relative w-full md:w-64">
               <Input
                type="text"
                placeholder="Search collections..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="rounded-full pl-10 h-9"
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
        </div>
      </section>

      {/* Collections Grid */}
      <section className="mx-auto max-w-7xl px-4 space-y-16">
        {isLoading ? (
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="aspect-[3/4] animate-pulse rounded-xl bg-muted" />
            ))}
          </div>
        ) : (
          <>
            {/* Trending Section - only show if there are trending items and we are on All view */}
            {category === "" && !search && data?.items.filter(i => i.isTrending).length! > 0 && (
              <div className="space-y-8">
                <div className="flex items-center gap-4">
                  <h2 className="text-3xl font-black tracking-tighter text-foreground uppercase">Trending <span className="text-primary italic">Now</span></h2>
                  <div className="h-px flex-1 bg-border" />
                </div>
                <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
                  {data?.items.filter(i => i.isTrending).map((item) => (
                    <FashionCard key={item.id} item={item} onFavorite={handleFavorite} />
                  ))}
                </div>
              </div>
            )}

            {/* Main Section */}
            <div className="space-y-8">
              <div className="flex items-center gap-4">
                <h2 className="text-3xl font-black tracking-tighter text-foreground uppercase">
                  {search ? `Search Results` : category !== "" ? `${category} Collection` : `All Collections`}
                </h2>
                <div className="h-px flex-1 bg-border" />
              </div>
              <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
                {data?.items.filter(i => {
                  if (search || category !== "") return true; // Show everything if filtered
                  return !i.isTrending; // Only non-trending in the main grid if on 'All' view
                }).map((item) => (
                  <FashionCard key={item.id} item={item} onFavorite={handleFavorite} />
                ))}
              </div>
            </div>
          </>
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
