import React, { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { fetchPublicItems } from "../api/items";
import { saveLook, fetchFavorites } from "../api/looks";
import { useAuth } from "../state/AuthContext";
import toast from "react-hot-toast";
import { http } from "../api/http";
import { Loader2 } from "lucide-react";
import { BackButton } from "../components/ui/BackButton";

const COLOR_PALETTES = [
  { name: "Monochromatic", colors: ["#000000", "#333333", "#666666", "#999999"], description: "Elegant and elongating. Uses different shades of the same hue." },
  { name: "Complementary", colors: ["#D4A373", "#283618", "#FEFAE0", "#BC6C25"], description: "High contrast and vibrant. Uses colors opposite each other on the wheel." },
  { name: "Analogous", colors: ["#A87B50", "#D4A373", "#E9C46A", "#F4A261"], description: "Harmonious and pleasing to the eye. Uses colors next to each other." },
  { name: "Earth Tones", colors: ["#A87B50", "#582F0E", "#7F4F24", "#936639"], description: "Natural and sophisticated. Perfect for timeless fashion." },
];

const StyleMePage: React.FC = () => {
  const { user } = useAuth();
  const [userPhoto, setUserPhoto] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [customColor, setCustomColor] = useState("#A87B50");
  const [isWearing, setIsWearing] = useState(false);

  // Suggested items
  const { data: suggestedData } = useQuery({
    queryKey: ["suggested-items"],
    queryFn: () => fetchPublicItems({ limit: 8 }),
  });

  // User Favorites
  const { data: favoritesData } = useQuery({
    queryKey: ["favorites"],
    queryFn: fetchFavorites,
    enabled: !!user,
  });

  const lookMutation = useMutation({
    mutationFn: saveLook,
    onSuccess: () => {
      toast.success("Design saved to your profile!");
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || "Failed to save look");
    }
  });

  const wardrobe = user && favoritesData?.length ? favoritesData : (suggestedData?.items || []);

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please upload an image file");
      return;
    }

    const formData = new FormData();
    formData.append("image", file);
    formData.append("folder", "avatars");

    setIsUploading(true);
    try {
      const { data } = await http.post<{ imageUrl: string }>("/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setUserPhoto(data.imageUrl);
      toast.success("Photo uploaded successfully!");
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to upload photo");
    } finally {
      setIsUploading(false);
    }
  };

  const handleSaveLook = () => {
    if (!user) return toast.error("Please login to save your custom looks");
    if (!selectedItem) return toast.error("Select an item first");
    
    lookMutation.mutate({
      itemId: selectedItem.id,
      customColor,
      avatarUrl: userPhoto || undefined
    });
  };

  const handlePreOrder = () => {
    if (!user) return toast.error("Please login to preorder");
    toast.success("Look finalized! Redirecting to preorder...");
  };

  return (
    <div className="space-y-12 pb-24">
      <div className="mx-auto max-w-7xl px-4 flex justify-start pt-8">
        <BackButton />
      </div>
      <section className="text-center space-y-4 max-w-2xl mx-auto">
        <h1 className="text-4xl md:text-5xl font-bold tracking-tighter">STYLE <span className="text-primary italic">STUDIO</span></h1>
        <p className="text-gray-500 text-lg">Experiment with colors, match your favorites, and visualize your future self.</p>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <aside className="lg:col-span-3 space-y-8">
          <div className="rounded-3xl bg-gray-50 p-6 border border-gray-100">
            <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
              <span className="text-2xl">🎨</span> Color Guide
            </h2>
            <div className="space-y-6">
              {COLOR_PALETTES.map((palette) => (
                <div key={palette.name} className="space-y-2">
                  <h3 className="text-xs font-bold uppercase tracking-widest text-gray-400">{palette.name}</h3>
                  <div className="flex gap-2">
                    {palette.colors.map((c) => (
                      <div 
                        key={c} 
                        className="h-8 w-8 rounded-full border border-white shadow-sm cursor-pointer hover:scale-110 transition-transform" 
                        style={{ backgroundColor: c }}
                        onClick={() => setCustomColor(c)}
                      />
                    ))}
                  </div>
                  <p className="text-[10px] text-gray-500 leading-tight">{palette.description}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-3xl border border-gray-100 p-6 space-y-4">
             <h2 className="text-lg font-bold">Try Custom Color</h2>
             <input 
               type="color" 
               value={customColor} 
               onChange={(e) => setCustomColor(e.target.value)}
               className="h-12 w-full rounded-xl cursor-pointer bg-transparent border-none"
             />
             <div className="text-center py-2 px-4 rounded-xl bg-gray-50 font-mono text-sm">
                {customColor.toUpperCase()}
             </div>
          </div>
        </aside>

        <main className="lg:col-span-6 space-y-6">
          <div className="relative aspect-[3/4] rounded-[40px] bg-gray-100 overflow-hidden border-2 border-dashed border-gray-300 flex items-center justify-center group">
               {userPhoto ? (
                 <div className="relative h-full w-full">
                    <img src={userPhoto} alt="User representation" className="h-full w-full object-cover" />
                    {isWearing && selectedItem && (
                      <div 
                        className="absolute inset-x-0 bottom-0 top-0 flex items-center justify-center animate-in fade-in zoom-in duration-500"
                        style={{ 
                          backgroundColor: `${customColor}44`,
                          mixBlendMode: "multiply"
                        }}
                      >
                         <div className="relative group/overlay">
                            <img 
                              src={selectedItem.imageUrl || selectedItem.image_url} 
                              alt="Overlaid Item" 
                              className="max-h-[80%] max-w-[80%] object-contain drop-shadow-2xl"
                            />
                            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover/overlay:opacity-100 transition-opacity">
                               <span className="bg-black text-white px-4 py-2 rounded-full text-xs font-bold">CUSTOMIZED VIEW</span>
                            </div>
                         </div>
                      </div>
                    )}
                 </div>
               ) : (
                  <div className="text-center p-8 space-y-4 transition-transform group-hover:scale-105">
                    <div className="text-6xl mb-4">👤</div>
                    <h3 className="text-xl font-bold">Create Your 2D Avatar</h3>
                    <p className="text-sm text-gray-400 max-w-xs">Upload a photo to see how our collection fits your silhouette.</p>
                    <label className={`inline-flex items-center gap-2 rounded-full bg-black text-white px-8 py-3 font-bold text-xs tracking-widest cursor-pointer hover:bg-primary transition-colors ${isUploading ? "opacity-50 cursor-not-allowed" : ""}`}>
                       {isUploading ? (
                         <>
                           <Loader2 className="h-4 w-4 animate-spin" />
                           UPLOADING...
                         </>
                       ) : (
                         "UPLOAD PHOTO"
                       )}
                       <input type="file" className="hidden" onChange={handlePhotoUpload} accept="image/*" disabled={isUploading} />
                    </label>
                  </div>
               )}
               {userPhoto && (
                  <button onClick={() => setUserPhoto(null)} className="absolute top-6 right-6 h-10 w-10 rounded-full bg-white/80 backdrop-blur-md text-black flex items-center justify-center hover:bg-white transition-colors shadow-lg">✕</button>
               )}
          </div>

          <div className="grid grid-cols-2 gap-4">
             <button
               onClick={() => setIsWearing(!isWearing)}
               disabled={!userPhoto || !selectedItem}
               className="rounded-full bg-black py-4 text-xs font-bold tracking-widest text-white hover:bg-primary transition-all disabled:opacity-30"
             >
               {isWearing ? "REMOVE ITEM" : "APPLY STYLE"}
             </button>
             <button
               onClick={handleSaveLook}
               disabled={!isWearing || lookMutation.isPending}
               className="rounded-full border-2 border-black py-4 text-xs font-bold tracking-widest text-black hover:bg-black hover:text-white transition-all disabled:opacity-30"
             >
               {lookMutation.isPending ? "SAVING..." : "SAVE DESIGN"}
             </button>
          </div>
          <button
             onClick={handlePreOrder}
             disabled={!isWearing}
             className="w-full rounded-full bg-primary py-4 text-xs font-bold tracking-widest text-white hover:opacity-90 transition-all disabled:opacity-30"
          >
             FINAL PREORDER
          </button>
        </main>

        <aside className="lg:col-span-3 space-y-6">
           <div className="rounded-3xl border border-gray-100 p-6 h-full flex flex-col">
              <h2 className="text-xl font-bold mb-6">Wardrobe</h2>
              <div className="flex-1 space-y-4 overflow-y-auto pr-2 max-h-[600px]">
                 {wardrobe.map((item: any) => (
                   <div 
                     key={item.id}
                     onClick={() => setSelectedItem(item)}
                     className={`group cursor-pointer rounded-2xl border p-3 transition-all ${
                       selectedItem?.id === item.id ? "border-primary bg-primary/5 shadow-md" : "border-gray-100 hover:border-gray-200"
                     }`}
                   >
                      <div className="aspect-square rounded-xl overflow-hidden bg-gray-50 mb-3">
                         <img src={item.imageUrl || item.image_url} alt={item.title} className="h-full w-full object-cover group-hover:scale-110 transition-transform duration-500" />
                      </div>
                      <h4 className="text-xs font-bold truncate uppercase">{item.title}</h4>
                      <p className="text-[10px] text-gray-400 mt-0.5">{item.category}</p>
                   </div>
                 ))}
              </div>
           </div>
        </aside>
      </div>
    </div>
  );
};

export default StyleMePage;
