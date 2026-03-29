import { motion } from "motion/react";
import { ArrowRight, Star, Shield, Zap, BarChart3, MessageSquare } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "@/src/components/AuthProvider";

export default function Home() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative pt-20 pb-32 px-6 overflow-hidden">
        <div className="max-w-7xl mx-auto text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <span className="px-4 py-2 rounded-full bg-brand-600/10 border border-brand-600/20 text-brand-400 text-sm font-medium mb-6 inline-block">
              Revolutionizing Flipped Classrooms
            </span>
            <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-8 bg-gradient-to-b from-white to-slate-400 bg-clip-text text-transparent">
              Understand Student Feedback <br /> with AI Precision
            </h1>
            <p className="text-lg md:text-xl text-slate-400 max-w-2xl mx-auto mb-10">
              FlipSense uses advanced sentiment analysis to help educators decode student reviews, 
              track engagement trends, and improve the flipped classroom experience.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link to="/submit" className="btn-primary flex items-center gap-2 w-full sm:w-auto justify-center">
                Submit a Review <ArrowRight className="w-4 h-4" />
              </Link>
              <Link to="/dashboard" className="px-6 py-3 rounded-xl border border-white/10 hover:bg-white/5 transition-all w-full sm:w-auto">
                View Dashboard
              </Link>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4, duration: 0.8 }}
            className="mt-20 relative"
          >
            <div className="glass rounded-3xl p-4 md:p-8 shadow-2xl border-white/10 max-w-5xl mx-auto overflow-hidden">
              <video 
                autoPlay 
                loop 
                muted 
                playsInline
                className="rounded-2xl w-full shadow-inner object-cover aspect-video"
              >
                <source src="https://assets.mixkit.co/videos/42928/42928-720.mp4" type="video/mp4" />
                Your browser does not support the video tag.
              </video>
            </div>
            {/* Floating Stats */}
            <div className="absolute -top-10 -right-10 hidden lg:block">
              <div className="glass-card p-4 animate-bounce [animation-duration:3s]">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center">
                    <Zap className="w-5 h-5 text-emerald-400" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-400">Live Analysis</p>
                    <p className="font-bold">99.2% Accuracy</p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section className="py-24 px-6 bg-slate-900/50">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { icon: MessageSquare, title: "AI Sentiment Analysis", desc: "Instantly classify feedback as positive, negative, or neutral using advanced AI models." },
              { icon: BarChart3, title: "Interactive Visuals", desc: "Track sentiment trends and emotion distributions with beautiful, real-time charts." },
              { icon: Shield, title: "Unique ID Tracking", desc: "Every review gets a unique, auto-generated ID for easy reference and tracking." }
            ].map((f, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="glass-card"
              >
                <div className="w-12 h-12 rounded-xl bg-brand-600/20 flex items-center justify-center mb-6">
                  <f.icon className="w-6 h-6 text-brand-400" />
                </div>
                <h3 className="text-xl font-bold mb-3">{f.title}</h3>
                <p className="text-slate-400 leading-relaxed">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Auth Mock Section */}
      {!user && (
        <section className="py-24 px-6">
          <div className="max-w-3xl mx-auto glass-card text-center p-12">
            <h2 className="text-3xl font-bold mb-6">Join the Community</h2>
            <p className="text-slate-400 mb-10">Sign in to track your reviews and see how your feedback shapes the classroom.</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="flex items-center justify-center gap-3 px-6 py-3 rounded-xl bg-white text-slate-950 font-semibold hover:bg-slate-200 transition-all">
                <img src="https://www.google.com/favicon.ico" className="w-5 h-5" alt="Google" />
                Continue with Google
              </button>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
