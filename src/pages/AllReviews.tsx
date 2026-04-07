import { useEffect, useState } from "react";
import { Search, Filter, SlidersHorizontal, Loader2 } from "lucide-react";
import ReviewCard from "@/src/components/ReviewCard";
import { Review } from "@/src/types";
import { cn } from "@/src/lib/utils";
import { api } from "@/src/lib/api";

export default function AllReviews() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const data = await api.getReviews();
        setReviews(data);
      } catch (error) {
        console.error("API Error:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchReviews();
  }, []);

  const filteredReviews = reviews.filter(r => {
    const matchesSearch = 
      r.student_name.toLowerCase().includes(search.toLowerCase()) ||
      r.content.toLowerCase().includes(search.toLowerCase()) ||
      r.email.toLowerCase().includes(search.toLowerCase()) ||
      r.id.toLowerCase().includes(search.toLowerCase());
    
    const matchesFilter = filter === "All" || r.sentiment === filter;
    
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="p-8 space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">Student Reviews</h1>
          <p className="text-slate-400">Browse and filter all feedback entries.</p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
          <div className="relative group w-full md:w-64">
            <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-brand-400 transition-colors" />
            <input 
              type="text" 
              placeholder="Search reviews..."
              className="w-full bg-white/5 border border-white/10 rounded-xl pl-11 pr-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-brand-600/50 transition-all"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          
          <div className="flex gap-2 overflow-x-auto pb-2 sm:pb-0 no-scrollbar">
            {["All", "Positive", "Neutral", "Negative"].map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={cn(
                  "px-4 py-2.5 rounded-xl border transition-all text-sm font-medium whitespace-nowrap",
                  filter === f 
                    ? "bg-brand-600 border-brand-500 text-white" 
                    : "bg-white/5 border-white/10 text-slate-400 hover:bg-white/10"
                )}
              >
                {f}
              </button>
            ))}
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-24 gap-4">
          <Loader2 className="w-10 h-10 text-brand-600 animate-spin" />
          <p className="text-slate-500 font-medium">Loading reviews...</p>
        </div>
      ) : (
        <>
          <div className="flex justify-between items-center text-sm text-slate-500">
            <p>Showing {filteredReviews.length} reviews</p>
            <div className="flex items-center gap-2">
              <SlidersHorizontal className="w-4 h-4" />
              <span>Sorted by Newest</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredReviews.map((review) => (
              <ReviewCard key={review.id} review={review} onUpdate={() => {
                const fetchReviews = async () => {
                  try {
                    const data = await api.getReviews();
                    setReviews(data);
                  } catch (error) {
                    console.error("API Error:", error);
                  }
                };
                fetchReviews();
              }} />
            ))}
          </div>

          {filteredReviews.length === 0 && (
            <div className="text-center py-24 glass-card">
              <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4">
                <Filter className="w-8 h-8 text-slate-600" />
              </div>
              <h3 className="text-xl font-bold mb-2">No reviews found</h3>
              <p className="text-slate-500">Try adjusting your search or filter settings.</p>
            </div>
          )}
        </>
      )}
    </div>
  );
}
