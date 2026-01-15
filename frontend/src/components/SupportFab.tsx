import React, { useState } from 'react';
import { MessageCircle, Phone, Smartphone, X, MessageSquare } from 'lucide-react';
import { EnquiryModal } from './EnquiryModal';
import { useAuth } from '../state/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';

export const SupportFab = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const toggle = () => setIsOpen(!isOpen);

  const handleChat = () => {
    if (!user) {
      // Pass the current location to redirect back after login
      navigate('/login', { state: { from: location } });
      return;
    }
    setIsModalOpen(true);
    setIsOpen(false);
  };
    
  return (
    <>
      <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3 print:hidden">
        {isOpen && (
          <div className="flex flex-col items-end gap-3 transition-all duration-200 animate-in slide-in-from-bottom-5 fade-in">
             {/* WhatsApp - Using a generic number/link */}
             <a 
               href="https://wa.me/" 
               target="_blank"
               rel="noreferrer"
               className="flex items-center gap-2 rounded-full bg-green-500 px-4 py-2 text-white shadow-lg hover:bg-green-600 transition-transform hover:scale-105"
             >
               <span className="text-sm font-medium">WhatsApp</span>
               <Smartphone size={18} />
             </a>
             
             {/* Call */}
             <a 
               href="tel:+1234567890" 
               className="flex items-center gap-2 rounded-full bg-blue-500 px-4 py-2 text-white shadow-lg hover:bg-blue-600 transition-transform hover:scale-105"
             >
               <span className="text-sm font-medium">Call Us</span>
               <Phone size={18} />
             </a>

             {/* Message/Chat */}
             <button 
               onClick={handleChat}
               className="flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-primary-foreground shadow-lg hover:opacity-90 transition-transform hover:scale-105"
             >
               <span className="text-sm font-medium">Message Us</span>
               <MessageSquare size={18} />
             </button>
          </div>
        )}

        <button
          onClick={toggle}
          className={`flex h-14 w-14 items-center justify-center rounded-full shadow-xl transition-all duration-300 ${
            isOpen ? "bg-red-500 hover:bg-red-600 rotate-90" : "bg-primary text-primary-foreground hover:bg-primary/90"
          }`}
          aria-label="Support options"
        >
          {isOpen ? <X size={24} /> : <MessageCircle size={28} />}
        </button>
      </div>

      <EnquiryModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
      />
    </>
  );
};
