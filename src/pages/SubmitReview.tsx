import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Star, Send, Loader2, CheckCircle2, Copy, RefreshCw } from "lucide-react";
import { Link } from "react-router-dom";
import { analyzeSentiment } from "@/src/lib/gemini";
import { cn } from "@/src/lib/utils";
import { api } from "@/src/lib/api";
import { useAuth } from "@/src/components/AuthProvider";

export default function SubmitReview() {
  const { user } = useAuth();
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isChecking, setIsChecking] = useState(true);
  const [userReviews, setUserReviews] = useState<any[]>([]);
  const [limitReached, setLimitReached] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    student_name: user?.displayName || "",
    email: user?.email || "",
    rating: 5,
    content: ""
  });
  const [result, setResult] = useState<any>(null);

  useEffect(() => {
    const checkExisting = async () => {
      if (!user || !user.email) {
        setIsChecking(false);
        return;
      }
      try {
        const reviews = await api.getUserReviews(user.email);
        setUserReviews(reviews);
        if (reviews.length >= 3) {
          setLimitReached(true);
          setResult(reviews[0]);
          setStep(3);
        }
      } catch (err) {
        console.error("Error checking user reviews:", err);
      } finally {
        setIsChecking(false);
      }
    };
    checkExisting();
  }, [user]);

  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        student_name: user.displayName || "",
        email: user.email || ""
      }));
    }
  }, [user]);

  const generateId = () => {
    const date = new Date().toISOString().slice(2, 10).replace(/-/g, "");
    const random = Math.random().toString(36).substring(2, 6).toUpperCase();
    return `RV${date}-${random}`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setIsSubmitting(true);
    setError(null);

    try {
      const analysis = await analyzeSentiment(formData.content);
      const reviewId = generateId();
      
      const reviewData = {
        id: reviewId,
        student_name: formData.student_name,
        email: formData.email,
        rating: formData.rating,
        content: formData.content,
        sentiment: analysis.sentiment,
        confidence: analysis.confidence,
        keywords: analysis.keywords,
        dimensions: analysis.dimensions,
        summary: analysis.summary,
        uid: user.uid
      };

      await api.submitReview(reviewData);
      setResult(reviewData);
      const updatedReviews = [...userReviews, reviewData];
      setUserReviews(updatedReviews);
      if (updatedReviews.length >= 3) {
        setLimitReached(true);
      }
      setStep(3);
    } catch (error: any) {
      console.error(error);
      setError(error.message || "An unexpected error occurred.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isChecking) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-4">
        <Loader2 className="w-10 h-10 text-brand-600 animate-spin" />
        <p className="text-slate-500 font-medium">Checking submission status...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-12 px-6">
      <div className="mb-12 text-center">
        <h1 className="text-4xl font-bold mb-4">Submit Your Feedback</h1>
        <p className="text-slate-400">Help us improve the flipped classroom experience with your honest review.</p>
        {!limitReached && userReviews.length > 0 && (
          <p className="mt-4 text-brand-400 font-medium">
            You have submitted {userReviews.length}/3 reviews.
          </p>
        )}
      </div>

      <div className="glass-card p-8 md:p-12 relative overflow-hidden">
        {/* Progress Bar */}
        <div className="absolute top-0 left-0 w-full h-1 bg-white/5">
          <motion.div 
            className="h-full bg-brand-600"
            animate={{ width: `${(step / 3) * 100}%` }}
          />
        </div>

        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-8"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-400">Full Name</label>
                  <input 
                    type="text" 
                    placeholder="John Doe"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-brand-600/50 transition-all"
                    value={formData.student_name}
                    onChange={(e) => setFormData({ ...formData, student_name: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-400">Email Address</label>
                  <input 
                    type="email" 
                    placeholder="john@college.edu"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-brand-600/50 transition-all"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-4">
                <label className="text-sm font-medium text-slate-400">Rating</label>
                <div className="flex gap-4">
                  {[1, 2, 3, 4, 5].map((num) => (
                    <button
                      key={num}
                      type="button"
                      onClick={() => setFormData({ ...formData, rating: num })}
                      className={cn(
                        "w-12 h-12 rounded-xl flex items-center justify-center transition-all",
                        formData.rating >= num ? "bg-brand-600 text-white" : "bg-white/5 text-slate-500 hover:bg-white/10"
                      )}
                    >
                      <Star className={cn("w-6 h-6", formData.rating >= num && "fill-current")} />
                    </button>
                  ))}
                </div>
              </div>

              <button 
                onClick={() => setStep(2)}
                disabled={!formData.student_name || !formData.email}
                className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next Step
              </button>
            </motion.div>
          )}

          {step === 2 && (
            <motion.form
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              onSubmit={handleSubmit}
              className="space-y-8"
            >
              {error && (
                <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm">
                  {error}
                </div>
              )}

              <div className="space-y-2">
                <div className="flex justify-between items-end">
                  <label className="text-sm font-medium text-slate-400">Your Feedback</label>
                  <span className="text-xs text-slate-500">{formData.content.length} / 500</span>
                </div>
                <textarea 
                  placeholder="Tell us about your experience with the flipped classroom..."
                  rows={6}
                  maxLength={500}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-brand-600/50 transition-all resize-none"
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                />
              </div>

              <div className="flex gap-4">
                <button 
                  type="button"
                  onClick={() => setStep(1)}
                  className="px-6 py-3 rounded-xl border border-white/10 hover:bg-white/5 transition-all"
                >
                  Back
                </button>
                <button 
                  type="submit"
                  disabled={isSubmitting || formData.content.length < 10}
                  className="btn-primary flex-1 flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Analyzing with AI...
                    </>
                  ) : (
                    <>
                      <Send className="w-5 h-5" />
                      Submit Review
                    </>
                  )}
                </button>
              </div>
            </motion.form>
          )}

          {step === 3 && result && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center space-y-8"
            >
              <div className="w-20 h-20 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle2 className="w-10 h-10 text-emerald-400" />
              </div>
              
              <div>
                <h2 className="text-3xl font-bold mb-2">
                  {limitReached ? "Submission Limit Reached" : "Review Submitted!"}
                </h2>
                <p className="text-slate-400">
                  {limitReached 
                    ? "You have already shared 3 reviews for this classroom, which is the maximum limit." 
                    : `Your feedback has been analyzed and saved. You have ${3 - userReviews.length} submissions remaining.`}
                </p>
              </div>

              <div className="glass p-6 rounded-2xl border-brand-600/30 bg-brand-600/5 max-w-sm mx-auto">
                <p className="text-xs text-brand-400 font-bold uppercase tracking-widest mb-2">Unique Review ID</p>
                <div className="flex items-center justify-center gap-3">
                  <code className="text-xl font-mono text-white">{result.id}</code>
                  <button 
                    onClick={() => navigator.clipboard.writeText(result.id)}
                    className="p-2 hover:bg-white/10 rounded-lg transition-all text-slate-400 hover:text-white"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 max-w-sm mx-auto">
                <div className="glass p-4 rounded-xl">
                  <p className="text-xs text-slate-400 mb-1">Sentiment</p>
                  <p className={cn(
                    "font-bold",
                    result.sentiment === "Positive" ? "text-emerald-400" : 
                    result.sentiment === "Negative" ? "text-rose-400" : "text-amber-400"
                  )}>{result.sentiment}</p>
                </div>
                <div className="glass p-4 rounded-xl">
                  <p className="text-xs text-slate-400 mb-1">Confidence</p>
                  <p className="font-bold">{(result.confidence * 100).toFixed(0)}%</p>
                </div>
              </div>

              <div className="flex flex-col gap-4 max-w-sm mx-auto">
                <Link 
                  to="/dashboard"
                  className="btn-primary w-full flex items-center justify-center gap-2"
                >
                  Go to Dashboard
                </Link>
                {!limitReached && (
                  <button 
                    onClick={() => {
                      setStep(1);
                      setFormData({ student_name: user?.displayName || "", email: user?.email || "", rating: 5, content: "" });
                      setResult(null);
                    }}
                    className="text-sm text-slate-500 hover:text-slate-300 transition-colors"
                  >
                    Submit Another Review ({3 - userReviews.length} left)
                  </button>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
