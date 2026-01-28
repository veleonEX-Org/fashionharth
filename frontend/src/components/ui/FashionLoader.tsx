import React, { useState, useEffect } from 'react';
import { Shirt, ShoppingBag, Watch, Gem, Footprints, Layers, Package } from 'lucide-react';

interface FashionLoaderProps {
  message?: string;
  fullScreen?: boolean;
}

const MESSAGES = [
  "Waking up the style engine...",
  "Sorting through the latest trends...",
  "Preparing your curated collection...",
  "Fetching fashion insights...",
  "Polishing the runway...",
  "Organizing the wardrobe...",
];

export const FashionLoader: React.FC<FashionLoaderProps> = ({ 
  message: initialMessage, 
  fullScreen = true 
}) => {
  const [messageIndex, setMessageIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setMessageIndex((prev) => (prev + 1) % MESSAGES.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const containerClasses = fullScreen 
    ? "fixed inset-0 z-50 flex flex-col items-center justify-center bg-gray-900/90 backdrop-blur-md"
    : "relative w-full h-64 flex flex-col items-center justify-center bg-gray-900/50 rounded-xl overflow-hidden";

  return (
    <div className={containerClasses}>
      <style>{`
        @keyframes float-up {
          0% { transform: translateY(20px) scale(0.5); opacity: 0; }
          20% { opacity: 1; }
          80% { opacity: 1; }
          100% { transform: translateY(-100px) scale(1.2); opacity: 0; }
        }
        @keyframes orbit {
          from { transform: rotate(0deg) translateX(60px) rotate(0deg); }
          to { transform: rotate(360deg) translateX(60px) rotate(-360deg); }
        }
        @keyframes scan {
          0% { top: 0%; opacity: 0; }
          50% { opacity: 1; }
          100% { top: 100%; opacity: 0; }
        }
        .animate-float-up {
          animation: float-up 3s infinite ease-out;
        }
        .animate-orbit {
          animation: orbit 4s infinite linear;
        }
        .animate-scan {
          animation: scan 2s infinite linear;
        }
        .delay-1 { animation-delay: 0.5s; }
        .delay-2 { animation-delay: 1.2s; }
        .delay-3 { animation-delay: 1.8s; }
        .delay-4 { animation-delay: 2.5s; }
      `}</style>

      <div className="relative w-32 h-32 flex items-center justify-center">
        {/* Scanning Line */}
        <div className="absolute left-0 right-0 h-1 bg-gradient-to-r from-transparent via-purple-500 to-transparent z-10 animate-scan" />

        {/* Central Bundle */}
        <div className="relative z-20 bg-gray-800 p-6 rounded-2xl shadow-2xl border border-purple-500/30 animate-pulse">
          <Package className="w-12 h-12 text-purple-400" />
        </div>

        {/* Floating Clothes */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute left-1/4 animate-float-up delay-1">
            <Shirt className="w-6 h-6 text-pink-400" />
          </div>
          <div className="absolute left-2/4 animate-float-up delay-2">
            <ShoppingBag className="w-6 h-6 text-blue-400" />
          </div>
          <div className="absolute left-3/4 animate-float-up delay-3">
            <Watch className="w-6 h-6 text-amber-400" />
          </div>
          <div className="absolute left-1/2 animate-float-up delay-4">
            <Gem className="w-6 h-6 text-cyan-400" />
          </div>
          <div className="absolute left-1/3 animate-float-up delay-1" style={{ animationDelay: '2s' }}>
            <Footprints className="w-6 h-6 text-emerald-400" />
          </div>
        </div>

        {/* Orbiting Elements */}
        <div className="absolute animate-orbit">
          <div className="w-2 h-2 bg-purple-500 rounded-full blur-[1px]" />
        </div>
        <div className="absolute animate-orbit delay-2">
          <div className="w-2 h-2 bg-pink-500 rounded-full blur-[1px]" />
        </div>
      </div>

      <div className="mt-8 text-center space-y-2">
        <h3 className="text-xl font-medium text-white transition-all duration-500">
          {initialMessage || MESSAGES[messageIndex]}
        </h3>
        <p className="text-gray-400 text-sm animate-pulse">
          Our servers are warming up...
        </p>
      </div>

      <div className="mt-12 w-48 h-1.5 bg-gray-800 rounded-full overflow-hidden border border-gray-700">
        <div className="h-full bg-gradient-to-r from-purple-500 via-pink-500 to-purple-500 w-full animate-[shimmer_2s_infinite_linear]" 
             style={{
               backgroundSize: '200% 100%',
               animation: 'shimmer 2s infinite linear'
             }}
        />
      </div>

      <style>{`
        @keyframes shimmer {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
      `}</style>
    </div>
  );
};
