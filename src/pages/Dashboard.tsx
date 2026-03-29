import { useEffect, useState } from "react";
import { 
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip, 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Legend,
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar
} from "recharts";
import { Users, Star, MessageSquare, TrendingUp, Smile, Frown } from "lucide-react";
import StatCard from "@/src/components/StatCard";
import ReviewCard from "@/src/components/ReviewCard";
import { Stats, Review } from "@/src/types";
import { cn } from "@/src/lib/utils";
import { api } from "@/src/lib/api";

export default function Dashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [recentReviews, setRecentReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsData, reviewsData] = await Promise.all([
          api.getStats(),
          api.getReviews()
        ]);
        setStats(statsData);
        setRecentReviews(reviewsData.slice(0, 5));
      } catch (error: any) {
        console.error("API Error:", error);
        setError(error.message || "Failed to connect to the database. Please ensure your Firebase configuration is correct.");
      } finally {
        setLoading(false);
      }
    };
    fetchData();

    // Auto-refresh every 30 seconds
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[80vh]">
        <div className="w-12 h-12 border-4 border-brand-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className="flex flex-col items-center justify-center h-[80vh] p-8 text-center space-y-4">
        <div className="w-16 h-16 bg-rose-500/10 rounded-full flex items-center justify-center">
          <Frown className="w-8 h-8 text-rose-500" />
        </div>
        <h2 className="text-2xl font-bold">Database Connection Error</h2>
        <p className="text-slate-400 max-w-md">
          {error || "We couldn't retrieve the analytics data. This usually happens when the Firebase connection is not established."}
        </p>
        <div className="p-4 bg-white/5 rounded-xl border border-white/10 text-sm text-slate-500">
          Tip: Check your <code className="text-brand-400">Firebase Configuration</code> in the .env file.
        </div>
      </div>
    );
  }

  const pieData = [
    { name: "Positive", value: stats.sentiments.Positive || 0, color: "#10b981" },
    { name: "Neutral", value: stats.sentiments.Neutral || 0, color: "#f59e0b" },
    { name: "Negative", value: stats.sentiments.Negative || 0, color: "#f43f5e" }
  ];

  const trendData = stats.trendData;
  const radarData = stats.radarData;

  return (
    <div className="p-8 space-y-8">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold mb-2">Analytics Dashboard</h1>
          <p className="text-slate-400">Real-time insights from student feedback.</p>
        </div>
        <div className="hidden md:flex items-center gap-2">
          <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
          <p className="text-sm text-slate-500">Live • Last updated: {new Date().toLocaleTimeString()}</p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
        <StatCard 
          title="Total Reviews" 
          value={stats.total} 
          icon={MessageSquare} 
          trend="+12%" 
          trendUp 
          color="bg-brand-600/20 text-brand-400" 
        />
        <StatCard 
          title="Avg Rating" 
          value={stats.avgRating.toFixed(1)} 
          icon={Star} 
          trend="+0.2" 
          trendUp 
          color="bg-amber-500/20 text-amber-400" 
        />
        <StatCard 
          title="Positive" 
          value={stats.sentiments.Positive || 0} 
          icon={Smile} 
          trend="+5%" 
          trendUp 
          color="bg-emerald-500/20 text-emerald-400" 
        />
        <StatCard 
          title="Negative" 
          value={stats.sentiments.Negative || 0} 
          icon={Frown} 
          trend="-2%" 
          trendUp={false} 
          color="bg-rose-500/20 text-rose-400" 
        />
        <StatCard 
          title="Active Students" 
          value={stats.activeStudents.toString()} 
          icon={Users} 
          color="bg-indigo-500/20 text-indigo-400" 
        />
        <StatCard 
          title="Growth" 
          value="24%" 
          icon={TrendingUp} 
          trend="+8%" 
          trendUp 
          color="bg-violet-500/20 text-violet-400" 
        />
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Sentiment Donut */}
        <div className="glass-card">
          <h3 className="text-xl font-bold mb-6">Sentiment Distribution</h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={80}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }}
                  itemStyle={{ color: '#f8fafc' }}
                />
                <Legend verticalAlign="bottom" height={36}/>
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Sentiment Trend */}
        <div className="glass-card">
          <h3 className="text-xl font-bold mb-6">Sentiment Trend (Weekly)</h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trendData}>
                <defs>
                  <linearGradient id="colorPos" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="name" stroke="#64748b" fontSize={12} />
                <YAxis stroke="#64748b" fontSize={12} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }}
                />
                <Area type="monotone" dataKey="positive" stroke="#10b981" fillOpacity={1} fill="url(#colorPos)" />
                <Area type="monotone" dataKey="negative" stroke="#f43f5e" fill="transparent" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Emotion Radar */}
        <div className="glass-card">
          <h3 className="text-xl font-bold mb-6">Feedback Dimensions</h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
                <PolarGrid stroke="rgba(255,255,255,0.1)" />
                <PolarAngleAxis dataKey="subject" stroke="#64748b" fontSize={12} />
                <PolarRadiusAxis stroke="rgba(255,255,255,0.1)" />
                <Radar
                  name="Current Term"
                  dataKey="A"
                  stroke="#8b5cf6"
                  fill="#8b5cf6"
                  fillOpacity={0.5}
                />
                <Radar
                  name="Previous Term"
                  dataKey="B"
                  stroke="#64748b"
                  fill="#64748b"
                  fillOpacity={0.3}
                />
                <Legend />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent Feed */}
        <div className="glass-card">
          <h3 className="text-xl font-bold mb-6">Live Review Feed</h3>
          <div className="space-y-4">
            {recentReviews.map((review) => (
              <ReviewCard 
                key={review.id} 
                review={review} 
                onUpdate={async () => {
                  try {
                    const [statsData, reviewsData] = await Promise.all([
                      api.getStats(),
                      api.getReviews()
                    ]);
                    setStats(statsData);
                    setRecentReviews(reviewsData.slice(0, 5));
                  } catch (error) {
                    console.error("Refresh error:", error);
                  }
                }}
              />
            ))}
            {recentReviews.length === 0 && (
              <p className="text-center text-slate-500 py-12">No reviews yet.</p>
            )}
          </div>
        </div>

        {/* Top Keywords */}
        <div className="glass-card lg:col-span-2">
          <h3 className="text-xl font-bold mb-6">Common Feedback Themes</h3>
          <div className="flex flex-wrap gap-3">
            {Array.from(new Set(recentReviews.flatMap(r => r.keywords || []))).slice(0, 15).map((kw) => (
              <span key={kw} className="px-4 py-2 rounded-xl bg-brand-600/10 text-brand-400 border border-brand-600/20 text-sm font-medium">
                #{kw}
              </span>
            ))}
            {recentReviews.length === 0 && (
              <p className="text-center text-slate-500 w-full py-8">No keywords analyzed yet.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
