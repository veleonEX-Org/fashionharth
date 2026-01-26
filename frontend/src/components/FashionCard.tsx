import React from "react";
import { Link } from "react-router-dom";
import { Item } from "../types/item";
import { SmartImage } from "./ui/SmartImage";

interface FashionCardProps {
  item: Item;
  onFavorite?: (id: number) => void;
}

const FashionCard: React.FC<FashionCardProps> = ({ item, onFavorite }) => {
  return (
    <div className="group relative overflow-hidden rounded-xl bg-card border border-border shadow-sm transition-all duration-500 hover:shadow-xl hover:-translate-y-1">
      {/* Image Container */}
      <div className="relative aspect-[3/4] overflow-hidden bg-muted">
        {item.imageUrl ? (
          <SmartImage
            src={item.imageUrl}
            alt={item.title}
            className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
            containerClassName="h-full w-full"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-muted text-muted-foreground">
            <span className="text-sm">No Image</span>
          </div>
        )}
        
        {/* Overlay Gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
        
        {/* Hover Action Buttons */}
        <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2 translate-y-10 opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100 px-4">
          <Link
            to={`/item/${item.id}`}
            className="flex-1 rounded-full bg-white px-4 py-2 text-center text-xs font-bold text-black hover:bg-gray-50 transition-colors shadow-lg"
          >
            VIEW DETAILS
          </Link>
          {onFavorite && (
            <button
              onClick={(e) => {
                e.preventDefault();
                onFavorite(item.id);
              }}
              className="rounded-full bg-white/90 backdrop-blur-md px-3 py-2 text-black hover:bg-white transition-colors shadow-lg"
            >
              ♥
            </button>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        <div className="flex justify-between items-start mb-1">
          <p className="text-xs font-medium text-primary uppercase tracking-wider">{item.category}</p>
          {item.isTrending && (
            <span className="inline-block rounded-full bg-black px-2 py-0.5 text-[10px] font-bold text-white">
              TRENDING
            </span>
          )}
        </div>
        <h3 className="text-lg font-bold text-foreground truncate">{item.title}</h3>
        <p className="mt-1 text-sm text-muted-foreground line-clamp-2">{item.description}</p>
        <div className="mt-3 flex items-center justify-between">
          <span className="text-xl font-light text-foreground">₦{item.price.toLocaleString()}</span>
        </div>
      </div>
    </div>
  );
};

export default FashionCard;
