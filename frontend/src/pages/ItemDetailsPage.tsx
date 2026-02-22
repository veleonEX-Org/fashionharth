import React, { useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { fetchItemById } from "../api/items";
import { useAuth } from "../state/AuthContext";
import toast from "react-hot-toast";
import { CheckoutButton } from "../components/Payment/CheckoutButton";
import { EnquiryModal } from "../components/EnquiryModal";
import { BackButton } from "../components/ui/BackButton";
import { calculateInstallmentPeriods } from "../utils/installment";
import { SmartImage } from "../components/ui/SmartImage";
import { FashionLoader } from "../components/ui/FashionLoader";
import { TestimonialsSection } from "../components/TestimonialsSection";
import { MessageCircle, ShieldCheck, Truck, RotateCcw, Clock, Star, CheckCircle2 } from "lucide-react";

const WHATSAPP_NUMBER = "2349000000000"; // Replace with actual number

const ItemDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<"details" | "story" | "reviews">("story");
  const [isEnquiryOpen, setIsEnquiryOpen] = useState(false);
  const [paymentMode, setPaymentMode] = useState<"full" | "installment">("full");

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
  
  const handleWhatsApp = () => {
    if (!item) return;
    const text = encodeURIComponent(`Hi, I'm interested in ordering the "${item.title}". Is it available?`);
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${text}`, "_blank");
  };


  if (isLoading) {
    return <FashionLoader message="Unveiling the details..." />;
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
  
  // Use actual reviews from metadata, or fallback to mock reviews
  const hasActualReviews = item.reviews && item.reviews.length > 0;
  const reviews = hasActualReviews 
      ? item.reviews 
      : [
          { name: "Chioma A.", rating: 5, text: "The fit is absolutely perfect. Delivery was faster than expected!" },
          { name: "David K.", rating: 5, text: "Premium quality indeed. Wore this to my convocation and got so many compliments." },
          { name: "Sarah J.", rating: 4, text: "Beautiful fabric, exactly as shown in the pictures." }
      ];

  const reviewCount = hasActualReviews ? item.reviews!.length : 128; // Fallback "social proof" count
  const averageRating = hasActualReviews 
      ? (item.reviews!.reduce((acc, r) => acc + r.rating, 0) / item.reviews!.length).toFixed(1)
      : 4.9;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 md:py-16">
      <div className="mb-4 md:mb-8">
        <BackButton />
      </div>

      <div className="grid gap-8 lg:gap-12 lg:grid-cols-2">
        {/* Image Section */}
        <div className="space-y-4 md:space-y-6">
            <div className="relative aspect-[3/4] overflow-hidden rounded-2xl bg-zinc-900 shadow-2xl">
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent z-10" />
              {item.imageUrl ? (
                <SmartImage
                  src={item.imageUrl}
                  alt={item.title}
                  className="h-full w-full object-cover transition-transform duration-700 hover:scale-110"
                  containerClassName="h-full w-full"
                />
              ) : (
                 <div className="flex h-full w-full items-center justify-center text-zinc-700">
                  No Image
                </div>
              )}
               {item.isTrending && (
                <div className="absolute top-4 left-4 lg:top-6 lg:left-6 z-20 rounded-full bg-primary px-3 py-1 lg:px-4 lg:py-2 text-[8px] lg:text-[10px] font-black tracking-[0.2em] text-white shadow-lg uppercase">
                  Trending Piece
                </div>
              )}
              {/* Inspiration Image Overlay */}
              {item.inspiredImageUrl && (
                <div className="absolute top-4 right-4 lg:top-6 lg:right-6 z-20 h-16 w-16 lg:h-24 lg:w-24 overflow-hidden rounded-lg border-2 border-white/20 shadow-xl backdrop-blur-md">
                  <SmartImage
                    src={item.inspiredImageUrl}
                    alt="Inspiration"
                    className="h-full w-full object-cover"
                    containerClassName="h-full w-full"
                  />
                  <div className="absolute bottom-0 left-0 right-0 bg-black/40 py-1 text-center text-[6px] lg:text-[8px] font-black uppercase tracking-widest text-white">
                    Inspiration
                  </div>
                </div>
              )}
            </div>
            
            {/* Value/Trust Props Mini-bar for Mobile/Desktop */}
            <div className="grid grid-cols-3 gap-2 text-center">
                 <div className="flex flex-col items-center gap-1 lg:gap-2 p-3 lg:p-4 rounded-xl bg-zinc-50 border border-zinc-100">
                    <Truck className="h-4 w-4 lg:h-5 lg:w-5 text-zinc-800" />
                    <span className="text-[8px] lg:text-[10px] font-bold uppercase tracking-wide text-zinc-500">Fast Delivery</span>
                 </div>
                 <div className="flex flex-col items-center gap-1 lg:gap-2 p-3 lg:p-4 rounded-xl bg-zinc-50 border border-zinc-100">
                    <ShieldCheck className="h-4 w-4 lg:h-5 lg:w-5 text-zinc-800" />
                    <span className="text-[8px] lg:text-[10px] font-bold uppercase tracking-wide text-zinc-500">Secure Payment</span>
                 </div>
                 <div className="flex flex-col items-center gap-1 lg:gap-2 p-3 lg:p-4 rounded-xl bg-zinc-50 border border-zinc-100">
                    <RotateCcw className="h-4 w-4 lg:h-5 lg:w-5 text-zinc-800" />
                    <span className="text-[8px] lg:text-[10px] font-bold uppercase tracking-wide text-zinc-500">Easy Returns</span>
                 </div>
            </div>
        </div>

        {/* Info Section */}
        <div className="flex flex-col justify-start space-y-6 md:space-y-8">
            {/* Urgency Banner */}
            <div className="flex items-center gap-2 rounded-lg bg-amber-50 px-4 py-2 text-amber-700 border border-amber-100 animate-pulse">
                <Clock className="h-4 w-4" />
                <span className="text-xs font-bold uppercase tracking-wide">High Demand: Only 3 slots left for this design</span>
            </div>

          <div>
            <div className="flex items-center justify-between">
                <div className="mb-2 md:mb-4 inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-[10px] font-bold tracking-widest uppercase">
                  Handcrafted Excellence
                </div>
                <div className="flex items-center gap-1 text-amber-400">
                    <Star className="h-4 w-4 fill-current" />
                    <span className="text-sm font-bold text-zinc-800">{averageRating}</span>
                    <span className="text-xs text-zinc-400 font-medium">({reviewCount} reviews)</span>
                </div>
            </div>
            
            <h1 className="text-3xl md:text-6xl font-black tracking-tighter text-zinc-900 leading-[0.9]">{item.title}</h1>
            
            <div className="mt-4 md:mt-6 flex flex-wrap items-baseline gap-3 md:gap-4">
              {item.discountPercentage && item.discountPercentage > 0 ? (
                <>
                  <span className="text-3xl md:text-4xl font-black text-zinc-900">
                    ₦{(item.price * (1 - item.discountPercentage / 100)).toLocaleString()}
                  </span>
                  <span className="text-lg md:text-xl font-bold text-zinc-400 line-through decoration-2">
                    ₦{item.price.toLocaleString()}
                  </span>
                  <span className="rounded-full bg-red-500/10 px-3 py-1 text-xs font-black text-red-500 uppercase tracking-widest">
                    {item.discountPercentage}% OFF
                  </span>
                </>
              ) : (
                <span className="text-3xl md:text-4xl font-black text-zinc-900">₦{item.price.toLocaleString()}</span>
              )}
              <span className="text-zinc-400 font-bold text-sm tracking-widest uppercase border-l pl-4 border-zinc-200">{item.category}</span>
            </div>
          </div>

          {/* Social Proof Text */}
          <div className="p-3 bg-zinc-50 border-l-4 border-primary text-xs text-zinc-600 font-medium italic">
             "Most of our customers for this item ordered 2 weeks in advance due to high demand."
          </div>

          <div className="flex gap-8 border-b border-zinc-100 pb-0 overflow-x-auto scrollbar-hide">
            <button
              onClick={() => setActiveTab("story")}
              className={`pb-4 text-[10px] font-black tracking-[0.2em] transition-all uppercase whitespace-nowrap ${
                activeTab === "story" ? "border-b-2 border-primary text-black" : "text-zinc-400 hover:text-black"
              }`}
            >
              The Background
            </button>
            <button
              onClick={() => setActiveTab("details")}
              className={`pb-4 text-[10px] font-black tracking-[0.2em] transition-all uppercase whitespace-nowrap ${
                activeTab === "details" ? "border-b-2 border-primary text-black" : "text-zinc-400 hover:text-black"
              }`}
            >
              Fabric & Fit
            </button>
             <button
              onClick={() => setActiveTab("reviews")}
              className={`pb-4 text-[10px] font-black tracking-[0.2em] transition-all uppercase whitespace-nowrap ${
                activeTab === "reviews" ? "border-b-2 border-primary text-black" : "text-zinc-400 hover:text-black"
              }`}
            >
              Reviews ({reviews?.length || 0})
            </button>
          </div>

          <div className="min-h-[120px]">
            {activeTab === "story" && (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
                <p className="text-lg md:text-xl leading-relaxed text-zinc-500 font-medium italic">
                  "{item.story || "This piece was inspired by the intersection of traditional heritage and modern silhouette."}"
                </p>
                {item.inspiredImageUrl && (
                  <div className="flex items-start gap-4 rounded-2xl bg-zinc-50 p-4 border border-zinc-100">
                    <SmartImage 
                      src={item.inspiredImageUrl} 
                      alt="The Inspiration" 
                      className="h-16 w-16 md:h-20 md:w-20 rounded-xl object-cover shadow-md"
                      containerClassName="h-16 w-16 md:h-20 md:w-20"
                    />
                    <div>
                      <h4 className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-1">Inspiration Source</h4>
                      <p className="text-sm text-zinc-600 font-medium">The visual Muse behind this unique silhouette and aesthetic details.</p>
                    </div>
                  </div>
                )}
              </div>
            )} 
            
            {activeTab === "details" && (
                <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-500">
                    <p className="text-base md:text-lg leading-relaxed text-zinc-600 font-medium">
                        {item.description || "Premium fabric selection with tailored precision. Designed for an impeccable drape and lasting comfort."}
                    </p>
                    <ul className="space-y-2 mt-4">
                        <li className="flex items-center gap-2 text-sm text-zinc-600"><CheckCircle2 className="h-4 w-4 text-green-500" /> Premium Cotton-Linen Blend</li>
                        <li className="flex items-center gap-2 text-sm text-zinc-600"><CheckCircle2 className="h-4 w-4 text-green-500" /> Professional Dry Clean Only</li>
                        <li className="flex items-center gap-2 text-sm text-zinc-600"><CheckCircle2 className="h-4 w-4 text-green-500" /> Available in Custom Sizes</li>
                    </ul>
                </div>
            )}

            {activeTab === "reviews" && (
                <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-500">
                    {reviews?.map((r, i) => (
                        <div key={i} className="p-4 rounded-xl bg-zinc-50 border border-zinc-100">
                            <div className="flex items-center justify-between mb-2">
                                <span className="font-bold text-sm text-zinc-900">{r.name}</span>
                                <div className="flex text-amber-400">
                                    {[...Array(5)].map((_, idx) => (
                                        <Star key={idx} className={`h-3 w-3 ${idx < r.rating ? "fill-current" : "text-zinc-200"}`} />
                                    ))}
                                </div>
                            </div>
                            <p className="text-zinc-600 text-sm italic">"{r.text}"</p>
                        </div>
                    ))}
                    {!hasActualReviews && (
                        <p className="text-[10px] text-zinc-400 italic text-center">Showing recent reviews from verified customers (Mock Data for this demo item)</p>
                    )}
                </div>
            )}
          </div>

          <div className="space-y-6 pt-4 border-t border-zinc-100">
            {/* Payment Mode Toggle */}
            <div className="flex p-1 bg-zinc-100 rounded-full w-full max-w-sm mx-auto">
               <button
                  onClick={() => setPaymentMode("full")}
                  className={`flex-1 py-2 px-4 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all ${
                      paymentMode === "full" ? "bg-black text-white shadow-md" : "text-zinc-500 hover:text-black"
                  }`}
               >
                  Full Payment
               </button>
               <button
                  onClick={() => setPaymentMode("installment")}
                  className={`flex-1 py-2 px-4 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all ${
                      paymentMode === "installment" ? "bg-black text-white shadow-md" : "text-zinc-500 hover:text-black"
                  }`}
               >
                  Pay Small Small
               </button>
            </div>

            {/* Dynamic Payment Info for Installments */}
            {paymentMode === "installment" && (
                <div className="bg-primary/5 border border-primary/20 rounded-xl p-4 text-center animate-in fade-in zoom-in-95 duration-300">
                    <p className="text-xs text-zinc-600 mb-1 font-bold uppercase tracking-wide">Installment Breakdown</p>
                    <div className="flex items-baseline justify-center gap-1 text-primary">
                        <span className="text-2xl font-black">
                             ₦{Math.ceil((item.discountPercentage ? item.price * (1 - item.discountPercentage / 100) : item.price) / calculateInstallmentPeriods(user, item.category)).toLocaleString()}
                        </span>
                        <span className="text-sm font-bold opacity-80">/ month</span>
                    </div>
                    <p className="text-[10px] text-zinc-400 mt-2">
                        For {calculateInstallmentPeriods(user, item.category)} months. {user?.isStudent ? "(Student Plan Applied)" : ""}
                    </p>
                </div>
            )}
            
            {/* WhatsApp Button - PRIMARY ACTION */}
            <button
                onClick={handleWhatsApp}
                className="w-full flex items-center justify-center gap-3 rounded-full bg-[#25D366] px-8 py-4 text-white shadow-lg shadow-[#25D366]/20 transition-all hover:scale-[1.02] hover:bg-[#20bd5a]"
            >
                <MessageCircle className="h-6 w-6" />
                <div className="text-left">
                    <div className="text-[10px] font-bold uppercase tracking-widest opacity-90">Instant Order</div>
                    <div className="text-lg font-black tracking-tight leading-none">ORDER ON WHATSAPP</div>
                </div>
            </button>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               {paymentMode === "full" ? (
                    <CheckoutButton 
                        amount={item.discountPercentage ? item.price * (1 - item.discountPercentage / 100) : item.price}
                        currency="NGN"
                        type="item"
                        itemId={item.id}
                        label="PAY FULL AMOUNT"
                        provider="paystack"
                        requiresDetails={true}
                        itemTitle={item.title}
                        fullWidth
                        className="bg-zinc-900 text-white border-zinc-900 hover:bg-zinc-800"
                    />
                ) : (
                     <CheckoutButton 
                        amount={Math.ceil((item.discountPercentage ? item.price * (1 - item.discountPercentage / 100) : item.price) / calculateInstallmentPeriods(user, item.category))}
                        currency="NGN"
                        type="installment"
                        itemId={item.id}
                        label="START INSTALLMENT PLAN"
                        provider="paystack"
                        requiresDetails={true}
                        itemTitle={item.title}
                        fullWidth
                        className="bg-primary text-white border-primary hover:bg-primary/90"
                    />
                )}
                
                <button
                    onClick={() => {
                        if (!user) {
                             navigate("/login", { state: { from: location.pathname } });
                             return;
                        }
                        setIsEnquiryOpen(true);
                    }}
                    className="w-full rounded-full border-2 border-zinc-200 px-8 py-4 text-[10px] font-black tracking-[0.2em] text-zinc-500 hover:border-black hover:text-black transition-all uppercase"
                >
                    Other Enquiries
                </button>
            </div>
          </div>
        </div>
      </div>
      
      {item && (
        <EnquiryModal
          isOpen={isEnquiryOpen}
          onClose={() => setIsEnquiryOpen(false)}
          item={{ id: item.id, name: item.title }}
        />
      )}

      {/* Social Proof Section at Bottom of Product Page - REINFORCING TRUST BEFORE EXIT */}
      <TestimonialsSection />
    </div>
  );
};

export default ItemDetailsPage;
