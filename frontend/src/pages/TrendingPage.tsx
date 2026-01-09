import React from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { fetchPublicItems } from "../api/items";

const TrendingPage: React.FC = () => {
  const { data, isLoading } = useQuery({
    queryKey: ["publicItems", "trending"],
    queryFn: () => fetchPublicItems({ isTrending: true, limit: 10 }),
  });

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-20 bg-white">
      <div className="bg-gray-50 py-20 text-center border-b border-gray-100">
        <h1 className="font-heading text-5xl font-extrabold uppercase tracking-tight text-gray-900 md:text-8xl">
          Trending <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-purple-600">NOW</span>
        </h1>
        <p className="mt-6 text-xl text-gray-500">Curated styles defining the moment.</p>
      </div>

      <div className="mx-auto max-w-7xl px-4 space-y-32 pt-20">
        {data?.items.map((item, index) => (
          <div
            key={item.id}
            className={`flex flex-col gap-12 lg:items-center ${
              index % 2 === 0 ? "lg:flex-row" : "lg:flex-row-reverse"
            }`}
          >
            <div className="flex-1">
              <Link to={`/item/${item.id}`} className="block overflow-hidden rounded-2xl group relative aspect-[4/5] shadow-2xl">
                  {item.imageUrl ? (
                     <img
                      src={item.imageUrl}
                      alt={item.title}
                      className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105 filter grayscale group-hover:grayscale-0"
                    />
                  ) : (
                     <div className="flex h-full w-full items-center justify-center bg-gray-100 text-gray-400">No Image</div>
                  )}
                 <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors duration-500" />
              </Link>
            </div>
            
            <div className="flex-1 space-y-6 lg:p-12">
               <div className="h-1 w-20 bg-primary mb-8" />
               <h2 className="text-4xl font-bold text-gray-900 md:text-5xl">{item.title}</h2>
               <div className="text-lg text-gray-600 leading-relaxed font-light space-y-4">
                  <p>{item.story || item.description}</p>
               </div>
               <div className="pt-8">
                  <Link
                    to={`/item/${item.id}`}
                    className="inline-flex items-center text-sm font-bold uppercase tracking-widest text-primary hover:text-black transition-colors"
                  >
                    Read the Full Story <span className="ml-2 text-xl">→</span>
                  </Link>
               </div>
            </div>
          </div>
        ))}

        {(!data?.items || data.items.length === 0) && (
            <div className="text-center text-gray-500">
                <p>No trending items at the moment. Check back soon.</p>
            </div>
        )}
      </div>
    </div>
  );
};

export default TrendingPage;
