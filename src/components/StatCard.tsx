import { LucideIcon } from "lucide-react";
import { cn } from "@/src/lib/utils";
import { motion } from "motion/react";
import { GlowCard } from "./ui/spotlight-card";

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: string;
  trendUp?: boolean;
  color: string;
}

export default function StatCard({ title, value, icon: Icon, trend, trendUp, color }: StatCardProps) {
  return (
    <GlowCard 
      customSize 
      className="group h-auto"
      glowColor={color.includes('emerald') ? 'green' : color.includes('rose') ? 'red' : color.includes('amber') ? 'orange' : color.includes('indigo') ? 'blue' : 'purple'}
    >
      <div className="flex justify-between items-start mb-4">
        <div className={cn("p-3 rounded-xl transition-transform group-hover:scale-110", color)}>
          <Icon className="w-6 h-6" />
        </div>
        {trend && (
          <span className={cn(
            "text-xs font-bold px-2 py-1 rounded-lg",
            trendUp ? "bg-emerald-500/10 text-emerald-400" : "bg-rose-500/10 text-rose-400"
          )}>
            {trend}
          </span>
        )}
      </div>
      <p className="text-slate-400 text-sm font-medium mb-1">{title}</p>
      <h3 className="text-3xl font-bold tracking-tight">{value}</h3>
    </GlowCard>
  );
}
