import React, { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { fetchPublicItems } from "../api/items";
import { fetchTrendingNews, TrendingNews } from "../api/trending";
import { Item } from "../types/item";
import { BackButton } from "../components/ui/BackButton";

type CombinedTrend = 
  | { type: "item"; data: Item }
  | { type: "news"; data: TrendingNews };

const TrendingPage: React.FC = () => {
  const { data: itemsData, isLoading: itemsLoading } = useQuery({
    queryKey: ["publicItems", "trending"],
    queryFn: () => fetchPublicItems({ isTrending: true, limit: 10 }),
  });

  const { data: newsData, isLoading: newsLoading } = useQuery({
    queryKey: ["trendingNews"],
    queryFn: () => fetchTrendingNews(10),
  });

  const combinedData = useMemo(() => {
    const items: CombinedTrend[] = (itemsData?.items || []).map(item => ({ type: "item", data: item }));
    const news: CombinedTrend[] = (newsData || []).map(newsItem => ({ type: "news", data: newsItem }));
    
    // Mix and sort by createdAt desc
    return [...items, ...news].sort((a, b) => {
      const dateA = new Date(a.type === "item" ? a.data.createdAt : b.type === "item" ? b.data.createdAt : 0).getTime();
      const dateB = new Date(b.type === "item" ? b.data.createdAt : b.type === "news" ? b.data.createdAt : 0).getTime();
      
      // Fix sort logic: 
      const timeA = new Date(a.data.createdAt).getTime();
      const timeB = new Date(b.data.createdAt).getTime();
      return timeB - timeA;
    });
  }, [itemsData, newsData]);

  const isLoading = itemsLoading || newsLoading;

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-20 bg-white">
      <div className="bg-gray-50 py-12 text-center border-b border-gray-100">
        <div className="mx-auto max-w-7xl px-4 flex justify-start mb-4">
           <BackButton />
        </div>
        <h1 className="font-heading text-4xl font-extrabold uppercase tracking-tight text-gray-900 md:text-8xl">
          Trending <span className="text-primary italic">Now</span>
        </h1>
        <p className="mt-6 text-xl text-gray-500">Curated styles & Global Fashion Insights.</p>
      </div>

      <div className="mx-auto max-w-7xl px-4 space-y-16 md:space-y-32 pt-20">
        {combinedData.map((trend, index) => {
           const isItem = trend.type === "item";
           // Align alternating left/right
           const isEven = index % 2 === 0;

           return (
            <div
              key={isItem ? `item-${trend.data.id}` : `news-${trend.data.id}`}
              className={`flex flex-col gap-8 md:gap-12 lg:items-center ${
                isEven ? "lg:flex-row" : "lg:flex-row-reverse"
              }`}
            >
              {/* Image Section */}
              <div className="flex-1">
                {isItem ? (
                  <Link to={`/item/${trend.data.id}`} className="block overflow-hidden rounded-2xl group relative aspect-[4/5] shadow-2xl">
                     {trend.data.imageUrl ? (
                        <img
                          src={trend.data.imageUrl}
                          alt={trend.data.title}
                          className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105 filter grayscale group-hover:grayscale-0"
                        />
                     ) : (
                        <div className="flex h-full w-full items-center justify-center bg-gray-100 text-gray-400">No Image</div>
                     )}
                     <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors duration-500" />
                  </Link>
                ) : (
                  <a href={trend.data.originalUrl} target="_blank" rel="noopener noreferrer" className="block overflow-hidden rounded-2xl group relative aspect-[4/5] shadow-2xl">
                     {trend.data.imageUrl ? (
                        <img
                          src={trend.data.imageUrl}
                          alt={trend.data.title}
                          className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                        />
                     ) : (
                        <div className="flex h-full w-full items-center justify-center bg-gray-100 text-gray-400">No Image</div>
                     )}
                     <div className="absolute bottom-4 left-4 bg-black/70 text-white text-xs px-3 py-1 rounded backdrop-blur-md uppercase tracking-wider">
                        Source: {trend.data.sourceName}
                     </div>
                  </a>
                )}
              </div>
              
              {/* Content Section */}
              <div className="flex-1 md:space-y-6 lg:p-12">
                 <div className={`h-1 w-20 mb-2 md:mb-8 ${isItem ? 'bg-primary' : 'bg-purple-600'}`} />
                 
                 <div className="flex items-center gap-2 mb-2">
                    {!isItem && <span className="text-xs font-bold tracking-widest uppercase text-purple-600 border border-purple-200 px-2 py-1 rounded">Global Trend</span>}
                    {isItem && <span className="text-xs font-bold tracking-widest uppercase text-primary border border-primary/30 px-2 py-1 rounded">Exclusive</span>}
                 </div>

                 <h2 className="text-xl font-bold text-gray-900 md:text-5xl">{trend.data.title}</h2>
                 <div className="text-lg text-gray-600 leading-relaxed font-light space-y-4">
                    <p>{isItem ? (trend.data.story || trend.data.description) : trend.data.summary}</p>
                 </div>
                 
                 <div className="md:pt-8">
                    {isItem ? (
                      <Link
                        to={`/item/${trend.data.id}`}
                        className="inline-flex items-center text-sm font-bold uppercase tracking-widest text-primary hover:text-black transition-colors"
                      >
                        Shop This Style <span className="ml-2 text-xl">→</span>
                      </Link>
                    ) : (
                      <a
                        href={trend.data.originalUrl}
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="inline-flex items-center text-sm font-bold uppercase tracking-widest text-purple-600 hover:text-black transition-colors"
                      >
                        Read on {trend.data.sourceName} <span className="ml-2 text-xl">↗</span>
                      </a>
                    )}
                 </div>
              </div>
            </div>
           );
        })}

        {combinedData.length === 0 && (
            <div className="text-center text-gray-500">
                <p>No trending items or news at the moment. Check back soon.</p>
            </div>
        )}
      </div>
    </div>
  );
};

export default TrendingPage;
