import React from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { fetchCategories } from "../api/categories";
import { BackButton } from "../components/ui/BackButton";

const CategoriesPage: React.FC = () => {
  const { data: categories = [], isLoading } = useQuery({
    queryKey: ["categories"],
    queryFn: fetchCategories,
  });

  return (
    <div className="space-y-8 pb-20">
      <div className="flex flex-col gap-4">
        <BackButton />
        <div>
          <h1 className="text-4xl font-black tracking-tighter text-foreground uppercase">
            All <span className="text-primary italic">Categories</span>
          </h1>
          <p className="text-muted-foreground">
            Explore our collections by category.
          </p>
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-48 animate-pulse rounded-2xl bg-muted" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((category) => (
            <Link
              key={category.id}
              to={`/?category=${encodeURIComponent(category.name)}`}
              className="group relative h-48 overflow-hidden rounded-2xl border border-border bg-card p-8 transition-all hover:border-primary/50 hover:shadow-2xl hover:shadow-primary/10"
            >
              <div className="relative z-10 flex h-full flex-col justify-between">
                <div>
                  <h3 className="text-2xl font-bold text-foreground group-hover:text-primary transition-colors">
                    {category.name.toUpperCase()}
                  </h3>
                  {category.description && (
                    <p className="mt-2 text-sm text-muted-foreground line-clamp-2">
                      {category.description}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-2 text-xs font-bold tracking-widest text-primary opacity-0 group-hover:opacity-100 transition-all translate-x-[-10px] group-hover:translate-x-0">
                  EXPLORE COLLECTION
                  <svg
                    className="h-4 w-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M17 8l4 4m0 0l-4 4m4-4H3"
                    />
                  </svg>
                </div>
              </div>
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            </Link>
          ))}
        </div>
      )}

      {categories.length === 0 && !isLoading && (
        <div className="py-20 text-center">
          <h3 className="text-2xl font-bold text-muted-foreground">No categories found</h3>
        </div>
      )}
    </div>
  );
};

export default CategoriesPage;
