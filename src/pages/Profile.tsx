import { useEffect, useState } from "react";
import { User as UserIcon, Mail, Phone, MapPin, Calendar, Star, MessageSquare, Award, Edit3, Save, X, Loader2 } from "lucide-react";
import { Review } from "@/src/types";
import ReviewCard from "@/src/components/ReviewCard";
import { cn } from "@/src/lib/utils";
import { useAuth } from "@/src/components/AuthProvider";
import { api } from "@/src/lib/api";

export default function Profile() {
  const { user, profile, refreshProfile } = useAuth();
  const [userReviews, setUserReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editData, setEditData] = useState({
    display_name: "",
    phone_number: "",
    bio: "",
    location: ""
  });

  useEffect(() => {
    if (profile) {
      setEditData({
        display_name: profile.display_name || user?.displayName || "",
        phone_number: profile.phone_number || "",
        bio: profile.bio || "",
        location: profile.location || ""
      });
    }
  }, [profile, user]);

  useEffect(() => {
    const fetchUserReviews = async () => {
      if (!user?.email) return;
      try {
        const reviews = await api.getReviews();
        const filtered = reviews.filter(r => r.email === user.email);
        setUserReviews(filtered);
      } catch (error) {
        console.error("API Error:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchUserReviews();
  }, [user]);

  const handleSave = async () => {
    if (!user) return;
    setIsSaving(true);
    try {
      await api.updateProfile({
        uid: user.uid,
        email: user.email,
        display_name: editData.display_name,
        phone_number: editData.phone_number,
        photo_url: user.photoURL,
        bio: editData.bio,
        location: editData.location
      });
      await refreshProfile();
      setIsEditing(false);
    } catch (error) {
      console.error("Save Error:", error);
    } finally {
      setIsSaving(false);
    }
  };

  if (!user) return null;

  const avgRating = userReviews.length > 0 
    ? (userReviews.reduce((acc, r) => acc + r.rating, 0) / userReviews.length).toFixed(1) 
    : "0.0";

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-8">
      {/* Profile Header */}
      <div className="glass-card p-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-brand-600/10 rounded-full blur-[80px] -mr-32 -mt-32" />
        
        <div className="flex flex-col md:flex-row gap-8 items-center md:items-start relative z-10">
          <div className="relative">
            <div className="w-32 h-32 rounded-2xl overflow-hidden border-4 border-white/10 shadow-2xl bg-slate-800 flex items-center justify-center">
              {user.photoURL ? (
                <img src={user.photoURL} alt={user.displayName || ""} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
              ) : (
                <UserIcon className="w-16 h-16 text-slate-600" />
              )}
            </div>
            <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-brand-600 rounded-lg flex items-center justify-center border-2 border-slate-950">
              <Award className="w-4 h-4 text-white" />
            </div>
          </div>

          <div className="flex-1 text-center md:text-left space-y-4">
            <div className="flex flex-col md:flex-row items-center md:items-start justify-between gap-4">
              <div>
                {isEditing ? (
                  <input 
                    className="text-4xl font-bold mb-1 bg-white/5 border border-white/10 rounded-lg px-2 py-1 focus:outline-none focus:ring-2 focus:ring-brand-600/50"
                    value={editData.display_name}
                    onChange={(e) => setEditData({ ...editData, display_name: e.target.value })}
                  />
                ) : (
                  <h1 className="text-4xl font-bold mb-1">{profile?.display_name || user.displayName}</h1>
                )}
                <p className="text-brand-400 font-medium">Student</p>
              </div>
              
              <div className="flex gap-2">
                {isEditing ? (
                  <>
                    <button 
                      onClick={handleSave}
                      disabled={isSaving}
                      className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white transition-all disabled:opacity-50"
                    >
                      {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                      Save
                    </button>
                    <button 
                      onClick={() => setIsEditing(false)}
                      className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all"
                    >
                      <X className="w-4 h-4" />
                      Cancel
                    </button>
                  </>
                ) : (
                  <button 
                    onClick={() => setIsEditing(true)}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-brand-600/20 text-brand-400 border border-brand-600/30 hover:bg-brand-600/30 transition-all"
                  >
                    <Edit3 className="w-4 h-4" />
                    Edit Profile
                  </button>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm text-slate-400">
              <div className="flex items-center justify-center md:justify-start gap-2">
                <Mail className="w-4 h-4" />
                {user.email}
              </div>
              <div className="flex items-center justify-center md:justify-start gap-2">
                <Calendar className="w-4 h-4" />
                Joined {profile?.joined ? new Date(profile.joined).toLocaleDateString() : "Mar 2026"}
              </div>
              <div className="flex items-center justify-center md:justify-start gap-2">
                <MapPin className="w-4 h-4" />
                {isEditing ? (
                  <input 
                    className="bg-white/5 border border-white/10 rounded px-2 py-0.5 focus:outline-none"
                    placeholder="Location"
                    value={editData.location}
                    onChange={(e) => setEditData({ ...editData, location: e.target.value })}
                  />
                ) : (
                  profile?.location || "Not set"
                )}
              </div>
              <div className="flex items-center justify-center md:justify-start gap-2">
                <Phone className="w-4 h-4" />
                {isEditing ? (
                  <input 
                    className="bg-white/5 border border-white/10 rounded px-2 py-0.5 focus:outline-none"
                    placeholder="Phone Number"
                    value={editData.phone_number}
                    onChange={(e) => setEditData({ ...editData, phone_number: e.target.value })}
                  />
                ) : (
                  profile?.phone_number || "Not set"
                )}
              </div>
            </div>

            {isEditing ? (
              <textarea 
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-brand-600/50 transition-all text-sm text-slate-400"
                placeholder="Write a short bio..."
                rows={3}
                value={editData.bio}
                onChange={(e) => setEditData({ ...editData, bio: e.target.value })}
              />
            ) : (
              profile?.bio && <p className="text-sm text-slate-400 leading-relaxed">{profile.bio}</p>
            )}
          </div>

          <div className="flex gap-4">
            <div className="glass px-6 py-4 rounded-2xl text-center">
              <p className="text-2xl font-bold">{userReviews.length}</p>
              <p className="text-xs text-slate-500 uppercase tracking-wider">Reviews</p>
            </div>
            <div className="glass px-6 py-4 rounded-2xl text-center">
              <p className="text-2xl font-bold">{avgRating}</p>
              <p className="text-xs text-slate-500 uppercase tracking-wider">Avg Rating</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Stats Column */}
        <div className="space-y-6">
          <div className="glass-card">
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
              <Star className="w-5 h-5 text-amber-400" />
              Achievements
            </h3>
            <div className="space-y-3">
              {[
                { name: "First Review", date: "Mar 10, 2026", icon: "🌱" },
                { name: "Constructive Critic", date: "Mar 12, 2026", icon: "✍️" },
                { name: "Top Contributor", date: "Mar 15, 2026", icon: "🏆" }
              ].map((a, i) => (
                <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/5">
                  <span className="text-2xl">{a.icon}</span>
                  <div>
                    <p className="text-sm font-bold">{a.name}</p>
                    <p className="text-[10px] text-slate-500">{a.date}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Reviews Column */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-brand-400" />
              My Recent Reviews
            </h3>
          </div>

          <div className="grid grid-cols-1 gap-6">
            {userReviews.map((review) => (
              <ReviewCard key={review.id} review={review} onUpdate={() => {
                const fetchUserReviews = async () => {
                  if (!user?.email) return;
                  try {
                    const reviews = await api.getUserReviews(user.email);
                    setUserReviews(reviews);
                  } catch (error) {
                    console.error("API Error:", error);
                  }
                };
                fetchUserReviews();
              }} />
            ))}
            {userReviews.length === 0 && !loading && (
              <div className="text-center py-12 glass-card">
                <p className="text-slate-500">You haven't submitted any reviews yet.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
