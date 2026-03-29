import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Phone, Loader2, CheckCircle2, X } from "lucide-react";
import { useAuth } from "./AuthProvider";
import { api } from "@/src/lib/api";

export default function CompleteProfileModal() {
  const { user, profile, refreshProfile } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user && !profile?.phone_number) {
      setIsOpen(true);
    } else {
      setIsOpen(false);
    }
  }, [user, profile]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    
    setIsSubmitting(true);
    setError(null);

    try {
      await api.updateProfile({
        uid: user.uid,
        email: user.email,
        display_name: user.displayName,
        photo_url: user.photoURL,
        phone_number: phoneNumber,
        bio: profile?.bio || "",
        location: profile?.location || ""
      });
      
      setIsSuccess(true);
      await refreshProfile();
      setTimeout(() => {
        setIsOpen(false);
      }, 2000);
    } catch (err: any) {
      setError(err.message || "Failed to update profile");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="glass-card w-full max-w-md p-8 relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-brand-600/10 rounded-full blur-3xl -mr-16 -mt-16" />
          
          {!isSuccess ? (
            <div className="relative z-10 space-y-6">
              <div className="text-center space-y-2">
                <div className="w-16 h-16 bg-brand-600/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Phone className="w-8 h-8 text-brand-400" />
                </div>
                <h2 className="text-2xl font-bold">Welcome, {user?.displayName}!</h2>
                <p className="text-slate-400">Please provide your mobile number to complete your profile.</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                {error && (
                  <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs text-center">
                    {error}
                  </div>
                )}
                
                <div className="space-y-2">
                  <label className="text-xs font-medium text-slate-500 uppercase tracking-wider">Mobile Number</label>
                  <div className="relative">
                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <input 
                      type="tel" 
                      required
                      placeholder="+1 (555) 000-0000"
                      className="w-full bg-white/5 border border-white/10 rounded-xl pl-12 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-brand-600/50 transition-all"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                    />
                  </div>
                </div>

                <button 
                  type="submit"
                  disabled={isSubmitting || phoneNumber.length < 5}
                  className="btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    "Complete Profile"
                  )}
                </button>
              </form>
            </div>
          ) : (
            <div className="relative z-10 text-center py-8 space-y-4">
              <div className="w-16 h-16 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-8 h-8 text-emerald-400" />
              </div>
              <h2 className="text-2xl font-bold">All Set!</h2>
              <p className="text-slate-400">Your profile is now complete. Redirecting you...</p>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
