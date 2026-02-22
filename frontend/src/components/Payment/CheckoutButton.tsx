import React, { useState } from 'react';
import { http } from '../../api/http';
import { toast } from 'react-hot-toast';
import { useAuth } from '../../state/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import { CheckoutModal } from './CheckoutModal';

interface CheckoutButtonProps {
  amount: number;
  currency: string;
  type: 'one-time' | 'subscription' | 'installment' | 'item';
  planId?: number;
  itemId?: number;
  label?: string;
  provider?: 'stripe' | 'paystack';
  fullWidth?: boolean;
  requiresDetails?: boolean;
  itemTitle?: string;
  className?: string;
}

export const CheckoutButton: React.FC<CheckoutButtonProps> = ({ 
  amount, 
  currency, 
  type, 
  planId,
  itemId,
  label = 'Checkout',
  provider = 'paystack',
  fullWidth = false,
  requiresDetails = false,
  itemTitle = 'Item',
  className = ''
}) => {
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleInitialClick = () => {
    if (!user) {
      toast.error('Please sign in to complete your order');
      navigate('/login', { state: { from: location } });
      return;
    }

    if (requiresDetails) {
      setShowModal(true);
    } else {
      handleCheckout();
    }
  };

  const handleCheckout = async (details?: { deliveryAddress: string; notes: string; quantity: number }) => {
    setLoading(true);
    try {
      const finalAmount = details?.quantity && details.quantity > 0 
        ? amount * details.quantity 
        : amount;

      const { data } = await http.post('/payments/create-checkout-session', {
        amount: finalAmount,
        currency,
        type,
        planId,
        itemId,
        provider,
        deliveryAddress: details?.deliveryAddress,
        notes: details?.notes,
        quantity: details?.quantity,
      });

      if (data.url) {
        window.location.href = data.url;
      } else {
        throw new Error('No checkout URL returned');
      }
    } catch (error: any) {
      console.error('Checkout error:', error);
      toast.error(error.response?.data?.message || 'Failed to initiate checkout');
    } finally {
      setLoading(false);
      setShowModal(false);
    }
  };

  return (
    <>
      <button
        onClick={handleInitialClick}
        disabled={loading}
        className={`relative group ${fullWidth ? 'w-full' : 'px-10'} py-4 bg-black text-white rounded-full font-black text-[10px] tracking-[0.2em] uppercase transition-all duration-300 hover:bg-zinc-800 disabled:opacity-50 overflow-hidden shadow-xl hover:shadow-2xl hover:-translate-y-1 active:scale-95 flex items-center justify-center ${className}`}
      >
        <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-primary/5 via-transparent to-primary/5 opacity-0 group-hover:opacity-100 transition-opacity" />
        {loading ? (
          <div className="flex items-center gap-3">
              <svg className="animate-spin h-4 w-4 text-primary" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span className="relative z-10">IN PROCESSING...</span>
          </div>
        ) : (
          <span className="relative z-10">{label}</span>
        )}
      </button>

      <CheckoutModal 
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onConfirm={handleCheckout}
        loading={loading}
        itemTitle={itemTitle}
      />
    </>
  );
};
