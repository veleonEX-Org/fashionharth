import React, { useState } from "react";
import { http } from "../../api/http";
import { useAuth } from "../../state/AuthContext";
import { User } from "../../types/auth";
import toast from "react-hot-toast";
import { PartyPopper, Phone, Save, X } from "lucide-react";

export const CompleteProfileCard: React.FC = () => {
  const { user, refreshProfile } = useAuth();
  const [phone, setPhone] = useState(user?.phone || "");
  
  // Parse existing DOB or default
  const initialDate = user?.dob ? new Date(user.dob) : null;
  const [birthMonth, setBirthMonth] = useState(initialDate ? initialDate.getUTCMonth() + 1 : "");
  const [birthDay, setBirthDay] = useState(initialDate ? initialDate.getUTCDate() : "");
  
  const [loading, setLoading] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  if (dismissed || (user?.phone && user?.dob)) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    // Combine day/month into a dummy year 2000 date string
    const dob = (birthMonth && birthDay) ? `2000-${String(birthMonth).padStart(2, '0')}-${String(birthDay).padStart(2, '0')}` : null;

    setLoading(true);
    try {
      await http.put<User>("/auth/me", {
        firstName: user.firstName,
        lastName: user.lastName,
        phone,
        dob,
      });

      await refreshProfile();
      
      toast.success("Profile updated successfully!");
    } catch (error) {
      console.error(error);
      toast.error("Failed to update profile.");
    } finally {
      setLoading(false);
    }
  };

  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  return (
    <div className="relative overflow-hidden rounded-3xl border border-indigo-100 bg-gradient-to-br from-white to-indigo-50/50 p-6 shadow-sm transition-all animate-in fade-in slide-in-from-top-4">
      <div className="absolute top-0 right-0 p-4">
        <button 
          onClick={() => setDismissed(true)}
          className="rounded-full p-2 hover:bg-black/5 text-zinc-400 hover:text-zinc-600 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="flex flex-col md:flex-row gap-6 items-start">
        <div className="p-4 rounded-2xl bg-indigo-100 text-indigo-600">
          <PartyPopper className="w-6 h-6" />
        </div>
        
        <div className="flex-1 space-y-4 w-full">
          <div>
            <h3 className="text-lg font-black text-zinc-900 tracking-tight">Complete your profile</h3>
            <p className="text-sm text-zinc-500">
              Add your phone number and birthday to receive exclusive birthday offers and updates.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col lg:flex-row gap-4 items-end w-full">
            <div className="flex-1 w-full space-y-1.5">
              <label htmlFor="phone" className="text-xs font-bold text-zinc-500 uppercase tracking-wider">
                Phone Number
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                <input
                  id="phone"
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+234..."
                  className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-zinc-200 bg-white text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all placeholder:text-zinc-300"
                />
              </div>
            </div>

            <div className="flex-[1.5] w-full space-y-1.5">
              <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">
                Birthday
              </label>
              <div className="flex gap-2">
                <select
                  value={birthMonth}
                  onChange={(e) => setBirthMonth(e.target.value)}
                  className="flex-1 px-3 py-2.5 rounded-xl border border-zinc-200 bg-white text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-zinc-900"
                >
                  <option value="">Month</option>
                  {months.map((m, i) => (
                    <option key={m} value={i + 1}>{m}</option>
                  ))}
                </select>
                <select
                  value={birthDay}
                  onChange={(e) => setBirthDay(e.target.value)}
                  className="w-24 px-3 py-2.5 rounded-xl border border-zinc-200 bg-white text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-zinc-900"
                >
                  <option value="">Day</option>
                  {Array.from({ length: 31 }, (_, i) => i + 1).map(d => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full lg:w-auto px-6 py-2.5 bg-zinc-900 hover:bg-black text-white rounded-xl text-sm font-bold shadow-lg shadow-zinc-900/10 hover:shadow-xl hover:shadow-zinc-900/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  Save
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
