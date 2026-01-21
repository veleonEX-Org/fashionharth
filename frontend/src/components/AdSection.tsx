
import React, { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchAds, Ad } from "../api/ads";
import { Link } from "react-router-dom";

const AdSection: React.FC = () => {
  const { data: ads, isLoading } = useQuery({
    queryKey: ["ads"],
    queryFn: fetchAds,
  });

  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (ads && ads.length > 1) {
      const interval = setInterval(() => {
        setCurrentIndex((prev) => (prev + 1) % ads.length);
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [ads]);

  if (isLoading || !ads || ads.length === 0) {
    return null;
  }

  const currentAd = ads[currentIndex];

  return (
    <section className="mx-auto max-w-7xl px-4 py-8">
      <div className="group relative min-h-[400px] md:h-96 w-full overflow-hidden rounded-[2rem] shadow-2xl ring-1 ring-white/10 transition-all hover:ring-primary/50">
        <img 
          src={currentAd.imageUrl} 
          alt={currentAd.title} 
          className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/40 to-transparent flex flex-col justify-center px-6 md:px-20 py-10">
          {currentAd.badgeText && (
            <div className="mb-4 self-start inline-flex items-center gap-2 rounded-full bg-primary/20 backdrop-blur-md px-4 py-1.5 text-[10px] md:text-xs font-bold tracking-widest text-primary uppercase border border-primary/30">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-primary"></span>
              </span>
              {currentAd.badgeText}
            </div>
          )}
          
          <h2 className="text-3xl md:text-6xl font-black text-white mb-3 tracking-tighter drop-shadow-2xl uppercase leading-tight">
            {currentAd.title}
          </h2>
          
          {currentAd.description && (
            <p className="max-w-md text-sm md:text-xl text-gray-200 mb-8 font-medium leading-relaxed drop-shadow-lg">
              {currentAd.description}
            </p>
          )}

          {currentAd.linkUrl && (
            <Link 
              to={currentAd.linkUrl}
              className="self-start rounded-full bg-primary px-8 py-3 text-sm font-bold text-white transition-all hover:scale-105 hover:bg-primary/90 shadow-lg"
            >
              SHOP NOW
            </Link>
          )}
        </div>
        
        {/* Decorative glass elements - Optimized for mobile: hidden on small screens if no space, or repositioned */}
        {(currentAd.offerText || currentAd.offerSubtext) && (
          <div className="absolute bottom-6 right-6 md:bottom-10 md:right-10 flex flex-col gap-1 md:gap-2 rounded-2xl bg-white/5 backdrop-blur-md p-3 md:p-4 border border-white/10 shadow-2xl">
            {currentAd.offerText && <div className="text-white font-bold text-lg md:text-2xl">{currentAd.offerText}</div>}
            {currentAd.offerSubtext && <div className="text-gray-400 text-[8px] md:text-[10px] font-bold tracking-widest uppercase">{currentAd.offerSubtext}</div>}
          </div>
        )}

        {/* Carousel Indicators */}
        {ads.length > 1 && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
            {ads.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentIndex(idx)}
                className={`h-1.5 rounded-full transition-all ${idx === currentIndex ? "w-8 bg-primary" : "w-1.5 bg-white/30"}`}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default AdSection;
