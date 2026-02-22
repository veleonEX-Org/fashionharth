import React from "react";
import { MessageCircle, Star, Quote } from "lucide-react";
import { SmartImage } from "./ui/SmartImage";

export const TestimonialsSection: React.FC = () => {
  const testimonials = [
    {
      name: "Tunde B.",
      role: "Convocation Client",
      text: "I was worried about the fit since I ordered online, but it was perfect! The delivery was right on time for my graduation.",
      rating: 5,
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=faces"
    },
    {
      name: "Amaka O.",
      role: "Wedding Guest",
      text: "The quality of the fabric is unmatched. Everyone at the wedding was asking where I got my outfit. sending my friends to you!",
      rating: 5,
      avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop&crop=faces"
    },
    {
      name: "Ibrahim Y.",
      role: "Corporate Order",
      text: "Professional service. The suits for my groomsmen were sharp. Definitely ordering again for my office wear.",
      rating: 5,
      avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop&crop=faces"
    }
  ];

  const whatsappChats = [
    {
      bg: "bg-[#DCF8C6]",
      text: "Good afternoon! I received the package just now. The Native wear is too Clean! 🙌🙌",
      time: "14:30"
    },
    {
      bg: "bg-white",
      text: "So happy you love it! sending you the care instructions now.",
      time: "14:32",
      isReply: true
    },
    {
      bg: "bg-[#DCF8C6]",
      text: "Please I want to order 2 more for my brothers. Is the black one still available?",
      time: "14:35"
    }
  ];

  return (
    <section className="py-12 md:py-20 bg-zinc-50 border-y border-zinc-200 overflow-hidden">
      <div className="mx-auto max-w-7xl px-4">
        
        <div className="text-center mb-10 md:mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 md:px-4 md:py-2 rounded-full bg-white border border-zinc-200 shadow-sm mb-4">
            <div className="flex -space-x-2">
               {[1,2,3].map(i => (
                   <div key={i} className="h-5 w-5 md:h-6 md:w-6 rounded-full bg-zinc-200 border-2 border-white overflow-hidden">
                        <img src={`https://i.pravatar.cc/100?img=${i+10}`} alt="User" />
                   </div>
               ))}
            </div>
            <span className="text-[10px] md:text-xs font-bold uppercase tracking-wide text-zinc-600">Trusted by 500+ Customers</span>
          </div>
          <h2 className="text-2xl md:text-5xl font-black tracking-tighter text-zinc-900 uppercase">
            Stories from the <span className="text-primary italic">Community</span>
          </h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12 items-center">
            {/* WhatsApp Chat Simulation */}
            <div className="relative mx-auto w-full max-w-sm rounded-[2rem] md:rounded-[2.5rem] bg-zinc-900 p-3 md:p-4 shadow-2xl border-4 border-zinc-800">
                <div className="absolute top-0 left-1/2 h-5 md:h-6 w-24 md:w-32 -translate-x-1/2 bg-zinc-800 rounded-b-xl z-20"></div>
                <div className="h-full w-full rounded-[1.5rem] md:rounded-[2rem] bg-[#E5DDD5] overflow-hidden relative">
                    <div className="absolute inset-0 opacity-10 bg-[url('https://repo.github.io/whatsapp-chat-parser/images/background.png')]"></div>
                    
                    {/* Header */}
                    <div className="sticky top-0 z-10 bg-[#075E54] p-3 md:p-4 text-white flex items-center gap-3">
                        <div className="h-8 w-8 rounded-full bg-white/20 flex items-center justify-center">
                             <MessageCircle className="h-5 w-5" />
                        </div>
                        <div>
                            <div className="text-sm font-bold">VeleonEx Support</div>
                            <div className="text-[10px] opacity-80">online</div>
                        </div>
                    </div>

                    {/* Chats */}
                    <div className="p-4 space-y-4 pt-6">
                        {whatsappChats.map((chat, i) => (
                            <div key={i} className={`flex ${chat.isReply ? "justify-start" : "justify-end"}`}>
                                <div className={`max-w-[85%] rounded-lg p-3 shadow-sm text-xs leading-relaxed relative ${chat.isReply ? "bg-white rounded-tl-none" : "bg-[#DCF8C6] rounded-tr-none"}`}>
                                    {chat.text}
                                    <div className="text-[8px] text-zinc-400 text-right mt-1">{chat.time}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                    
                    {/* Input Area (Visual) */}
                    <div className="absolute bottom-0 left-0 right-0 bg-white p-2 flex items-center gap-2">
                        <div className="flex-1 h-8 rounded-full bg-zinc-100"></div>
                        <div className="h-8 w-8 rounded-full bg-[#075E54]"></div>
                    </div>
                </div>
            </div>

            {/* Testimonials Grid */}
            <div className="grid gap-4 md:gap-6">
                {testimonials.map((t, i) => (
                    <div key={i} className="p-4 md:p-6 rounded-2xl bg-white border border-zinc-100 shadow-sm hover:shadow-md transition-shadow">
                        <div className="flex items-start justify-between mb-4">
                            <div className="flex items-center gap-3">
                                <div className="h-10 w-10 rounded-full bg-zinc-100 overflow-hidden">
                                    <img src={t.avatar} alt={t.name} className="h-full w-full object-cover" />
                                </div>
                                <div>
                                    <h4 className="font-bold text-sm text-zinc-900">{t.name}</h4>
                                    <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">{t.role}</p>
                                </div>
                            </div>
                            <Quote className="h-6 w-6 text-primary/20" />
                        </div>
                        <p className="text-sm text-zinc-600 font-medium leading-relaxed">"{t.text}"</p>
                        <div className="flex gap-1 mt-4 text-amber-400">
                             {[...Array(5)].map((_, idx) => (
                                <Star key={idx} className="h-3 w-3 fill-current" />
                             ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
        
        <div className="mt-10 md:mt-16 text-center">
             <div className="inline-block p-6 rounded-2xl bg-primary/5 border border-primary/10">
                <h3 className="text-lg md:text-xl font-bold text-zinc-900 mb-2">Ready to join them?</h3>
                <p className="text-zinc-600 mb-6 text-sm">Experience the premium service and quality for yourself.</p>
                <a href="#collections" className="inline-flex items-center justify-center rounded-full bg-black px-8 py-3 text-xs font-bold uppercase tracking-widest text-white hover:bg-zinc-800 transition-colors">
                    Shop Now
                </a>
             </div>
        </div>

      </div>
    </section>
  );
};
