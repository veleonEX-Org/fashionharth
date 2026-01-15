import React from 'react';
import { CheckoutButton } from '../components/Payment/CheckoutButton';
import { BackButton } from '../components/ui/BackButton';

const PricingPage: React.FC = () => {
  const [provider, setProvider] = React.useState<'stripe' | 'paystack'>('paystack');

  const plans = [
    {
      name: 'Essential Access',
      price: 49,
      type: 'one-time' as const,
      description: 'Lifetime ownership of our core fashion technology.',
      features: ['Full 2D Avatar Access', 'Basic Style History', 'Standard Support', 'Core Collections'],
      icon: (
        <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
        </svg>
      )
    },
    {
      name: 'Style Connoisseur',
      price: 19,
      type: 'subscription' as const,
      description: 'The ultimate experience for the modern trendsetter.',
      features: ['Unlimited Save Slots', 'Early Access Items', 'Personal Stylist Bot', 'Priority VIP Support', 'Exclusive Collaborations'],
      isPopular: true,
      icon: (
        <svg className="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
        </svg>
      )
    },
    {
      name: 'Premium Flexibility',
      price: 20,
      type: 'installment' as const,
      description: 'Get full access today, pay in manageable segments.',
      features: ['Total Feature Access', '3 Easy Payments', 'No Hidden Interest', 'Dedicated Support Manager'],
      label: '3 x ₦20',
      icon: (
        <svg className="w-8 h-8 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      )
    }
  ];

  return (
    <div className="relative min-h-screen py-24 px-4 overflow-hidden">
      {/* Dynamic Background Elements */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[500px] bg-primary/10 blur-[120px] rounded-full -z-10" />
      <div className="absolute bottom-0 right-0 w-[300px] h-[300px] bg-purple-500/10 blur-[100px] rounded-full -z-10" />

      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <BackButton />
        </div>
        <div className="text-center mb-20">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-[10px] font-bold tracking-widest uppercase mb-6">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
            </span>
            Flexible Payment Options
          </div>
          <h1 className="text-5xl md:text-7xl font-black mb-6 tracking-tighter">
            Elevate Your <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary via-white to-primary bg-300% animate-shimmer">Wardrobe</span>
          </h1>
          <p className="text-gray-400 max-w-xl mx-auto mb-12 font-medium leading-relaxed">
            Choose a plan that fits your lifestyle. Seamlessly transition between traditional payments and modern flexibility.
          </p>

          <div className="inline-flex p-1.5 bg-black/40 backdrop-blur-xl rounded-2xl border border-white/10 mb-8 shadow-2xl">
            <button 
              onClick={() => setProvider('stripe')}
              className={`flex items-center gap-2 px-8 py-3 rounded-xl text-xs font-black tracking-widest uppercase transition-all duration-500 ${provider === 'stripe' ? 'bg-primary text-white shadow-[0_0_20px_rgba(var(--primary-rgb),0.3)]' : 'text-gray-500 hover:text-white'}`}
            >
              Stripe Global
            </button>
            <button 
              onClick={() => setProvider('paystack')}
              className={`flex items-center gap-2 px-8 py-3 rounded-xl text-xs font-black tracking-widest uppercase transition-all duration-500 ${provider === 'paystack' ? 'bg-primary text-white shadow-[0_0_20px_rgba(var(--primary-rgb),0.3)]' : 'text-gray-500 hover:text-white'}`}
            >
              Paystack Africa
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 items-stretch">
          {plans.map((plan, idx) => (
            <div 
              key={idx} 
              className={`group relative flex flex-col p-10 rounded-[2.5rem] transition-all duration-500 hover:-translate-y-4 border ${
                plan.isPopular 
                  ? 'bg-gradient-to-b from-white/10 to-transparent border-primary/50 shadow-[0_0_80px_rgba(var(--primary-rgb),0.1)] scale-105 z-10' 
                  : 'bg-white/[0.03] border-white/10 hover:border-white/20'
              }`}
            >
              {plan.isPopular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-primary text-white text-[10px] font-black px-6 py-2 rounded-full uppercase tracking-[0.2em] shadow-xl">
                  Popular Choice
                </div>
              )}
              
              <div className="mb-8">
                <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-8 border ${plan.isPopular ? 'bg-primary/20 border-primary/30' : 'bg-white/5 border-white/10'}`}>
                  {plan.icon}
                </div>
                <h3 className="text-2xl font-black mb-2 tracking-tight">{plan.name}</h3>
                <p className="text-gray-500 text-sm font-medium leading-relaxed mb-8">{plan.description}</p>
                
                <div className="flex items-baseline gap-1">
                  <span className="text-6xl font-black tracking-tighter">₦{plan.price}</span>
                  <span className="text-gray-500 font-bold text-sm tracking-widest uppercase">
                    {plan.type === 'subscription' ? '/month' : plan.type === 'installment' ? '/mo (x3)' : '/once'}
                  </span>
                </div>
              </div>

              <div className="flex-grow">
                <div className="h-px w-full bg-gradient-to-r from-transparent via-white/10 to-transparent mb-10" />
                <ul className="space-y-6 mb-12">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-center text-sm font-semibold text-gray-300">
                      <div className={`mr-4 p-1 rounded-full ${plan.isPopular ? 'bg-primary/20' : 'bg-white/10'}`}>
                        <svg className={`h-3 w-3 ${plan.isPopular ? 'text-primary' : 'text-gray-400'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="pt-4 mt-auto">
                <CheckoutButton 
                  amount={plan.price} 
                  currency="NGN" 
                  type={plan.type} 
                  provider={provider}
                  label={plan.type === 'subscription' ? 'START SUBSCRIPTION' : 'GET ACCESS NOW'}
                />
              </div>

              {/* Decorative accent for popular plan */}
              {plan.isPopular && (
                <div className="absolute inset-0 rounded-[2.5rem] pointer-events-none border-2 border-primary/10 animate-pulse" />
              )}
            </div>
          ))}
        </div>
        
        <div className="mt-20 text-center">
          <p className="text-gray-500 text-xs font-bold tracking-widest uppercase mb-4">Trusted by trendsetters globally</p>
          <div className="flex flex-wrap justify-center gap-8 opacity-30 grayscale contrast-125">
             <span className="text-2xl font-black italic">VOGUE</span>
             <span className="text-2xl font-black">GQ</span>
             <span className="text-2xl font-black tracking-widest">EST.1992</span>
             <span className="text-2xl font-black">ELLE</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PricingPage;
