export type Sentiment = "Positive" | "Negative" | "Neutral";

export interface Review {
  id: string;
  student_name: string;
  email: string;
  rating: number;
  content: string;
  sentiment: Sentiment;
  confidence: number;
  keywords: string[];
  created_at: string;
  uid: string;
  summary?: string;
  dimensions?: {
    clarity: number;
    engagement: number;
    pacing: number;
    difficulty: number;
    resources: number;
    support: number;
  };
}

export interface Stats {
  total: number;
  sentiments: Record<string, number>;
  avgRating: number;
  activeStudents: number;
  trendData: { name: string; positive: number; negative: number; neutral: number }[];
  radarData: { subject: string; A: number; B: number; fullMark: number }[];
}
