import { useEffect, useState, useMemo } from "react";
import { 
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip, 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Legend,
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar
} from "recharts";
import { Users, Star, MessageSquare, TrendingUp, Smile, Frown, Filter, Calendar, Search, SlidersHorizontal } from "lucide-react";
import StatCard from "@/src/components/StatCard";
import ReviewCard from "@/src/components/ReviewCard";
import InstructorInsights from "@/src/components/InstructorInsights";
import { Stats, Review, Sentiment } from "@/src/types";
import { cn } from "@/src/lib/utils";
import { api } from "@/src/lib/api";
import { motion, AnimatePresence } from "motion/react";

export default function Dashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [allReviews, setAllReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [sentimentFilter, setSentimentFilter] = useState<Sentiment | "All">("All");
  const [courseFilter, setCourseFilter] = useState<string>("All");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsData, reviewsData] = await Promise.all([
          api.getStats(),
          api.getReviews()
        ]);
        setStats(statsData);
        setAllReviews(reviewsData);
      } catch (error: any) {
        console.error("API Error:", error);
        setError(error.message || "Failed to connect to the database. Please ensure your Firebase configuration is correct.");
      } finally {
        setLoading(false);
      }
    };
    fetchData();

    // Auto-refresh every 60 seconds
    const interval = setInterval(fetchData, 60000);
    return () => clearInterval(interval);
  }, []);

  const courses = useMemo(() => {
    const uniqueCourses = Array.from(new Set(allReviews.map(r => r.course_name).filter(Boolean)));
    return ["All", ...uniqueCourses];
  }, [allReviews]);

  const filteredReviews = useMemo(() => {
    return allReviews.filter(review => {
      const matchesSearch = review.content.toLowerCase().includes(searchQuery.toLowerCase()) || 
                           review.student_name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesSentiment = sentimentFilter === "All" || review.sentiment === sentimentFilter;
      const matchesCourse = courseFilter === "All" || review.course_name === courseFilter;
      
      return matchesSearch && matchesSentiment && matchesCourse;
    });
  }, [allReviews, searchQuery, sentimentFilter, courseFilter]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[80vh]">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-brand-600/20 rounded-full" />
          <div className="absolute top-0 left-0 w-16 h-16 border-4 border-brand-600 border-t-transparent rounded-full animate-spin" />
        </div>
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

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <motion.div 
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="p-4 sm:p-8 space-y-8 max-w-7xl mx-auto"
    >
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
        <div>
          <motion.h1 variants={itemVariants} className="text-3xl font-bold mb-2 bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
            Analytics Dashboard
          </motion.h1>
          <motion.p variants={itemVariants} className="text-slate-400">Real-time insights from student feedback.</motion.p>
        </div>
        <motion.div variants={itemVariants} className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
          <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
          <p className="text-xs font-medium text-emerald-400">Live Updates Enabled</p>
        </motion.div>
      </div>

      {/* Stats Grid */}
      <motion.div variants={containerVariants} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 sm:gap-6">
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
      </motion.div>

      {/* AI Insights Section */}
      <motion.div variants={itemVariants}>
        <InstructorInsights reviews={allReviews} />
      </motion.div>

      {/* Filters Section */}
      <motion.div variants={itemVariants} className="glass-card p-4 sm:p-6 space-y-4">
        <div className="flex items-center gap-2 mb-2">
          <SlidersHorizontal className="w-4 h-4 text-brand-400" />
          <h3 className="font-bold">Advanced Filters</h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input 
              type="text"
              placeholder="Search feedback..."
              className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-600/50 transition-all"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="relative">
            <select 
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-600/50 transition-all appearance-none text-slate-200 cursor-pointer"
              value={sentimentFilter}
              onChange={(e) => setSentimentFilter(e.target.value as any)}
            >
              <option value="All" className="bg-[#0f172a] text-white">All Sentiments</option>
              <option value="Positive" className="bg-[#0f172a] text-white">Positive</option>
              <option value="Neutral" className="bg-[#0f172a] text-white">Neutral</option>
              <option value="Negative" className="bg-[#0f172a] text-white">Negative</option>
            </select>
            <Filter className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500 pointer-events-none" />
          </div>
          <div className="relative">
            <select 
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-600/50 transition-all appearance-none text-slate-200 cursor-pointer"
              value={courseFilter}
              onChange={(e) => setCourseFilter(e.target.value)}
            >
              {courses.map(course => (
                <option key={course} value={course} className="bg-[#0f172a] text-white">
                  {course === "All" ? "All Courses" : course}
                </option>
              ))}
            </select>
            <Filter className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500 pointer-events-none" />
          </div>
          <div className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-sm text-slate-400">
            <Calendar className="w-4 h-4" />
            <span>Last 30 Days</span>
          </div>
        </div>
      </motion.div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Sentiment Donut */}
        <motion.div variants={itemVariants} className="glass-card">
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
        </motion.div>

        {/* Sentiment Trend */}
        <motion.div variants={itemVariants} className="glass-card">
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
        </motion.div>

        {/* Emotion Radar */}
        <motion.div variants={itemVariants} className="glass-card">
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
        </motion.div>

        {/* Recent Feed */}
        <motion.div variants={itemVariants} className="glass-card">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold">Live Review Feed</h3>
            <span className="text-xs text-slate-500">{filteredReviews.length} results</span>
          </div>
          <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
            <AnimatePresence mode="popLayout">
              {filteredReviews.slice(0, 10).map((review) => (
                <motion.div
                  key={review.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  layout
                >
                  <ReviewCard 
                    review={review} 
                    onUpdate={async () => {
                      try {
                        const [statsData, reviewsData] = await Promise.all([
                          api.getStats(),
                          api.getReviews()
                        ]);
                        setStats(statsData);
                        setAllReviews(reviewsData);
                      } catch (error) {
                        console.error("Refresh error:", error);
                      }
                    }}
                  />
                </motion.div>
              ))}
            </AnimatePresence>
            {filteredReviews.length === 0 && (
              <p className="text-center text-slate-500 py-12">No reviews match your filters.</p>
            )}
          </div>
        </motion.div>

        {/* Top Keywords */}
        <motion.div variants={itemVariants} className="glass-card lg:col-span-2">
          <h3 className="text-xl font-bold mb-6">Common Feedback Themes</h3>
          <div className="flex flex-wrap gap-3">
            {Array.from(new Set(allReviews.flatMap(r => r.keywords || []))).slice(0, 20).map((kw) => (
              <motion.span 
                key={kw} 
                whileHover={{ scale: 1.05 }}
                className="px-4 py-2 rounded-xl bg-brand-600/10 text-brand-400 border border-brand-600/20 text-sm font-medium cursor-default"
              >
                #{kw}
              </motion.span>
            ))}
            {allReviews.length === 0 && (
              <p className="text-center text-slate-500 w-full py-8">No keywords analyzed yet.</p>
            )}
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}
