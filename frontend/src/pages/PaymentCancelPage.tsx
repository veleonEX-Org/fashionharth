import React from 'react';
import { Link } from 'react-router-dom';

const PaymentCancelPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center space-y-8">
        <div className="relative inline-block">
            <div className="absolute inset-0 bg-red-500 blur-[60px] opacity-20 rounded-full"></div>
            <div className="relative h-24 w-24 mx-auto bg-zinc-900 rounded-full border border-red-500/30 flex items-center justify-center">
                <svg className="w-10 h-10 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
            </div>
        </div>

        <div>
            <h1 className="text-4xl font-black tracking-tighter mb-4">Payment Cancelled</h1>
            <p className="text-zinc-400 text-lg">Your transaction was not completed. No charges were made.</p>
        </div>

        <div className="pt-8 space-y-4">
            <Link 
                to="/pricing" 
                className="block w-full py-4 bg-white text-black font-black tracking-[0.2em] text-xs uppercase rounded-xl hover:scale-105 transition-transform"
            >
                Try Again
            </Link>
            <Link 
                to="/" 
                className="block w-full py-4 border border-zinc-800 text-zinc-400 font-black tracking-[0.2em] text-xs uppercase rounded-xl hover:bg-zinc-900 transition-colors"
            >
                Return Home
            </Link>
        </div>
      </div>
    </div>
  );
};

export default PaymentCancelPage;
