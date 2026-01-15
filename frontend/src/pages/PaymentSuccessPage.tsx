import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Link } from 'react-router-dom';
import { useAuth } from '../state/AuthContext';
import { http } from '../api/http';

const PaymentSuccessPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { refreshProfile } = useAuth(); // To potentially update user data e.g. balances
  
  // Paystack uses 'trxref' or 'reference', Stripe uses 'session_id'
  const sessionId = searchParams.get('session_id');
  const reference = searchParams.get('reference') || searchParams.get('trxref');
  const providerParam = searchParams.get('provider');
  
  const hasVerified = React.useRef(false);

  useEffect(() => {
    const verify = async () => {
        if (hasVerified.current) return;
        
        // Determine provider: use URL param if available, otherwise guess
        let provider = providerParam;
        if (!provider) {
            provider = sessionId && sessionId !== '{CHECKOUT_SESSION_ID}' ? 'stripe' : 'paystack';
        }

        if (!sessionId && !reference) return;

        hasVerified.current = true;
        try {
            console.log(`[FRONTEND VERIFY] Calling backend to verify ${provider} payment. Ref: ${reference || sessionId}`);
            await http.post('/payments/verify', {
                provider,
                reference,
                sessionId
            });
        } catch (err) {
            console.error("Verification failed", err);
        }
    };

    verify();
  }, [sessionId, reference, providerParam]);

  return (
    <div className="min-h-screen bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-zinc-800 via-black to-black text-white flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center space-y-8">
        <div className="relative inline-block">
            <div className="absolute inset-0 bg-green-500 blur-[80px] opacity-20 rounded-full"></div>
            <div className="relative h-24 w-24 mx-auto bg-zinc-900/80 backdrop-blur-xl rounded-full border border-green-500/30 flex items-center justify-center shadow-2xl">
                <svg className="w-10 h-10 text-green-500 drop-shadow-[0_0_8px_rgba(34,197,94,0.5)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
            </div>
        </div>

        <div>
            <h1 className="text-4xl md:text-5xl font-black tracking-tighter mb-4 bg-clip-text text-transparent bg-gradient-to-br from-white to-zinc-500">
                Order Confirmed!
            </h1>
            <p className="text-zinc-400 text-lg font-medium">Thank you for your purchase. Your style journey continues.</p>
            {reference && (
                <p className="text-[10px] text-zinc-500 mt-6 font-mono bg-zinc-900/80 inline-block px-4 py-2 rounded-full border border-zinc-800">
                    REF: <span className="text-zinc-300 select-all">{reference}</span>
                </p>
            )}
        </div>

        <div className="pt-8 space-y-4">
            <Link 
                to="/dashboard" 
                className="block w-full py-4 bg-primary text-white font-black tracking-[0.2em] text-xs uppercase rounded-xl hover:scale-105 transition-transform shadow-[0_0_20px_rgba(var(--primary-rgb),0.4)]"
            >
                Return to Dashboard
            </Link>
            <Link 
                to="/trending" 
                className="block w-full py-4 border border-zinc-700 text-zinc-300 font-black tracking-[0.2em] text-xs uppercase rounded-xl hover:bg-zinc-800 hover:text-white hover:border-zinc-500 transition-all"
            >
                Browse More Trends
            </Link>
        </div>
      </div>
    </div>
  );
};

export default PaymentSuccessPage;
