import { useState, useEffect } from "react";
import { GoogleGenAI } from "@google/genai";
import { Review } from "@/src/types";
import { Sparkles, Brain, AlertCircle, CheckCircle2, Lightbulb, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { GlowCard } from "./ui/spotlight-card";

interface InstructorInsightsProps {
  reviews: Review[];
}

interface InsightData {
  summary: string;
  strengths: string[];
  weaknesses: string[];
  actionPlan: string[];
}

export default function InstructorInsights({ reviews }: InstructorInsightsProps) {
  const [insights, setInsights] = useState<InsightData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const generateInsights = async () => {
    if (reviews.length === 0) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });
      
      // Only analyze the most recent 50 reviews to keep it focused and efficient
      const recentReviews = reviews.slice(0, 50);
      const reviewsText = recentReviews.map(r => 
        `Rating: ${r.rating}/5, Sentiment: ${r.sentiment}, Content: ${r.content}`
      ).join("\n---\n");

      const prompt = `
        Analyze the following student feedback from a Flipped Classroom environment and provide strategic instructor insights.
        
        Feedback Data (Recent 50 reviews):
        ${reviewsText}
        
        Return the analysis in a strict JSON format with the following structure:
        {
          "summary": "A 2-3 sentence overview of the general student sentiment and major themes.",
          "strengths": ["List 3 specific things that are working well based on positive feedback"],
          "weaknesses": ["List 3 specific areas of concern or friction points based on negative/neutral feedback"],
          "actionPlan": ["List 3-4 concrete, actionable steps the instructor can take next week to improve the learning experience"]
        }
      `;

      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
        }
      });

      const text = response.text;
      if (text) {
        setInsights(JSON.parse(text));
        setLastUpdated(new Date());
      }
    } catch (err) {
      console.error("Gemini Error:", err);
      setError("Failed to generate AI insights. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Re-generate insights whenever the number of reviews changes
    if (reviews.length > 0) {
      generateInsights();
    }
  }, [reviews.length]);

  if (reviews.length === 0) return null;

  return (
    <GlowCard customSize className="overflow-hidden relative group h-auto" glowColor="purple">
      <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
        <Brain className="w-24 h-24 text-brand-400" />
      </div>

      <div className="flex items-center justify-between mb-6 relative z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-brand-600/20 flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-brand-400" />
          </div>
          <div>
            <h3 className="text-xl font-bold">AI Instructor Insights</h3>
            <div className="flex items-center gap-2">
              <p className="text-sm text-slate-400">Strategic analysis powered by Gemini</p>
              {lastUpdated && !loading && (
                <span className="text-[10px] text-emerald-500/60 font-mono">
                  • Updated {lastUpdated.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              )}
            </div>
          </div>
        </div>
        <button 
          onClick={generateInsights}
          disabled={loading}
          className="px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-sm font-medium transition-colors flex items-center gap-2 disabled:opacity-50"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
          Regenerate
        </button>
      </div>

      <AnimatePresence mode="wait">
        {loading ? (
          <motion.div 
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="py-12 flex flex-col items-center justify-center space-y-4"
          >
            <div className="relative">
              <div className="w-12 h-12 border-4 border-brand-600/20 rounded-full" />
              <div className="absolute top-0 left-0 w-12 h-12 border-4 border-brand-600 border-t-transparent rounded-full animate-spin" />
            </div>
            <p className="text-slate-400 animate-pulse">Analyzing student sentiment patterns...</p>
          </motion.div>
        ) : error ? (
          <motion.div 
            key="error"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="p-6 bg-rose-500/10 border border-rose-500/20 rounded-xl text-center"
          >
            <AlertCircle className="w-8 h-8 text-rose-500 mx-auto mb-2" />
            <p className="text-rose-400">{error}</p>
          </motion.div>
        ) : insights ? (
          <motion.div 
            key="content"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8 relative z-10"
          >
            <div className="p-4 bg-brand-600/5 border border-brand-600/10 rounded-xl">
              <p className="text-slate-300 italic leading-relaxed">
                "{insights.summary}"
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h4 className="flex items-center gap-2 font-bold text-emerald-400">
                  <CheckCircle2 className="w-5 h-5" />
                  Key Strengths
                </h4>
                <ul className="space-y-2">
                  {insights.strengths.map((s, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-slate-400">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                      {s}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="space-y-4">
                <h4 className="flex items-center gap-2 font-bold text-rose-400">
                  <AlertCircle className="w-5 h-5" />
                  Areas for Improvement
                </h4>
                <ul className="space-y-2">
                  {insights.weaknesses.map((w, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-slate-400">
                      <span className="w-1.5 h-1.5 rounded-full bg-rose-500 mt-1.5 shrink-0" />
                      {w}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="pt-6 border-t border-white/5">
              <h4 className="flex items-center gap-2 font-bold text-brand-400 mb-4">
                <Lightbulb className="w-5 h-5" />
                Strategic Action Plan
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {insights.actionPlan.map((plan, i) => (
                  <div key={i} className="p-4 bg-white/5 border border-white/10 rounded-xl text-sm text-slate-300 flex gap-3">
                    <span className="flex items-center justify-center w-6 h-6 rounded-lg bg-brand-600/20 text-brand-400 font-bold shrink-0">
                      {i + 1}
                    </span>
                    {plan}
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </GlowCard>
  );
}
