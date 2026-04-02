import React, { useState } from "react";
import { Star, Calendar, Hash, Quote, Edit2, Trash2, Loader2, Save, X } from "lucide-react";
import { cn } from "@/src/lib/utils";
import { Review } from "@/src/types";
import { useAuth } from "./AuthProvider";
import { api } from "@/src/lib/api";
import { analyzeSentiment } from "@/src/lib/gemini";

const ReviewCard: React.FC<{ review: Review; onUpdate?: () => void }> = ({ review, onUpdate }) => {
  const { user } = useAuth();
  const isOwner = user && user.uid === review.uid;
  
  const [isEditing, setIsEditing] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editContent, setEditContent] = useState(review.content);
  const [editRating, setEditRating] = useState(review.rating);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDelete = async () => {
    if (!isOwner) return;
    setIsDeleting(true);
    setError(null);
    try {
      await api.deleteReview(review.id);
      onUpdate?.();
    } catch (err: any) {
      console.error("Delete error:", err);
      setError("Failed to delete review. Please try again.");
      setIsDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  const handleSave = async () => {
    if (editContent.length < 10) {
      setError("Review must be at least 10 characters long.");
      return;
    }
    setIsSaving(true);
    setError(null);
    try {
      // Re-analyze sentiment if content changed
      let sentimentData = {
        sentiment: review.sentiment,
        confidence: review.confidence,
        keywords: review.keywords
      };

      if (editContent !== review.content) {
        const analysis = await analyzeSentiment(editContent);
        sentimentData = {
          sentiment: analysis.sentiment,
          confidence: analysis.confidence,
          keywords: analysis.keywords,
          dimensions: analysis.dimensions,
          summary: analysis.summary
        } as any;
      }

      await api.updateReview(review.id, {
        content: editContent,
        rating: editRating,
        ...sentimentData
      });
      
      setIsEditing(false);
      onUpdate?.();
    } catch (err: any) {
      console.error("Update error:", err);
      setError("Failed to update review");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="glass-card flex flex-col h-full group">
      <div className="flex justify-between items-start mb-4 gap-2">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 rounded-full bg-brand-600/20 shrink-0 flex items-center justify-center font-bold text-brand-400">
            {review.student_name?.[0] || "?"}
          </div>
          <div className="min-w-0">
            <h4 className="font-bold truncate" title={review.student_name}>{review.student_name}</h4>
            <p className="text-xs text-slate-500 truncate" title={review.email}>{review.email}</p>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {isOwner && !isEditing && !showDeleteConfirm && (
            <div className="flex items-center gap-1 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity">
              <button 
                onClick={() => setIsEditing(true)}
                className="p-1.5 rounded-lg hover:bg-white/5 text-slate-400 hover:text-brand-400 transition-colors"
                title="Edit Review"
              >
                <Edit2 className="w-3.5 h-3.5" />
              </button>
              <button 
                onClick={() => setShowDeleteConfirm(true)}
                className="p-1.5 rounded-lg hover:bg-white/5 text-slate-400 hover:text-rose-400 transition-colors"
                title="Delete Review"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
          {showDeleteConfirm && (
            <div className="flex items-center gap-2 bg-rose-500/10 border border-rose-500/20 rounded-lg px-2 py-1">
              <span className="text-[10px] font-bold text-rose-400 uppercase">Confirm?</span>
              <button 
                onClick={handleDelete}
                disabled={isDeleting}
                className="p-1 rounded-md bg-rose-500 text-white hover:bg-rose-600 transition-colors disabled:opacity-50"
              >
                {isDeleting ? <Loader2 className="w-3 h-3 animate-spin" /> : <Trash2 className="w-3 h-3" />}
              </button>
              <button 
                onClick={() => setShowDeleteConfirm(false)}
                disabled={isDeleting}
                className="p-1 rounded-md bg-white/10 text-slate-400 hover:bg-white/20 transition-colors disabled:opacity-50"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          )}
          <div className={cn(
            "px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest",
            review.sentiment === "Positive" ? "bg-emerald-500/10 text-emerald-400" : 
            review.sentiment === "Negative" ? "bg-rose-500/10 text-rose-400" : "bg-amber-500/10 text-amber-400"
          )}>
            {review.sentiment}
          </div>
        </div>
      </div>

      {isEditing ? (
        <div className="space-y-4 flex-1">
          <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map((num) => (
              <button
                key={num}
                onClick={() => setEditRating(num)}
                className="focus:outline-none"
              >
                <Star 
                  className={cn("w-5 h-5", num <= editRating ? "text-amber-400 fill-current" : "text-slate-700")} 
                />
              </button>
            ))}
          </div>
          <textarea
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-brand-600/50 transition-all text-sm text-slate-300 min-h-[100px]"
            value={editContent}
            onChange={(e) => setEditContent(e.target.value)}
            placeholder="Edit your review..."
          />
          {error && <p className="text-rose-400 text-[10px]">{error}</p>}
          <div className="flex gap-2">
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="flex-1 flex items-center justify-center gap-2 py-2 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-bold transition-all disabled:opacity-50"
            >
              {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              Save Changes
            </button>
            <button
              onClick={() => {
                setIsEditing(false);
                setEditContent(review.content);
                setEditRating(review.rating);
                setError(null);
              }}
              className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-xs font-bold transition-all"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      ) : (
        <>
          <div className="flex gap-1 mb-4">
            {[1, 2, 3, 4, 5].map((num) => (
              <Star 
                key={num} 
                className={cn("w-4 h-4", num <= review.rating ? "text-amber-400 fill-current" : "text-slate-700")} 
              />
            ))}
          </div>

          <div className="relative mb-6 flex-1">
            <Quote className="w-8 h-8 text-white/5 absolute -top-2 -left-2" />
            <p className="text-slate-300 text-sm leading-relaxed relative z-10 italic">
              "{review.content}"
            </p>
            {review.summary && (
              <div className="mt-3 p-3 rounded-xl bg-brand-600/5 border border-brand-600/10">
                <p className="text-[10px] text-brand-400 font-bold uppercase tracking-widest mb-1">AI Summary</p>
                <p className="text-xs text-slate-400 italic leading-snug">
                  {review.summary}
                </p>
              </div>
            )}
          </div>

          <div className="pt-4 border-t border-white/5 flex flex-wrap gap-2 mb-4">
            {(Array.isArray(review.keywords) ? review.keywords : []).map((kw: string) => (
              <span key={kw} className="px-2 py-1 rounded-md bg-white/5 text-[10px] text-slate-400 border border-white/5">
                #{kw}
              </span>
            ))}
          </div>
        </>
      )}

      {error && !isEditing && (
        <p className="text-rose-400 text-[10px] mb-2 text-center">{error}</p>
      )}

      <div className="flex justify-between items-center text-[10px] text-slate-500 font-mono">
        <div className="flex items-center gap-1">
          <Hash className="w-3 h-3" />
          {review.id}
        </div>
        <div className="flex items-center gap-1">
          <Calendar className="w-3 h-3" />
          {new Date(review.created_at).toLocaleDateString()}
        </div>
      </div>
    </div>
  );
};

export default ReviewCard;
