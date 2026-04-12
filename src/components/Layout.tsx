import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { LayoutDashboard, PlusCircle, ListFilter, User, Home, BookOpen, GraduationCap, School, Pencil, LogOut } from "lucide-react";
import { cn } from "@/src/lib/utils";
import { useAuth } from "./AuthProvider";
import { auth, signOut } from "@/src/lib/firebase";
import { MeshGradient } from "@paper-design/shaders-react";
import { useWebGLSupport } from "@/src/lib/webgl";

export default function Layout({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);
  const hasWebGL = useWebGLSupport();

  const handleLogout = async () => {
    await signOut(auth);
    navigate("/login");
  };

  const navItems = [
    { name: "Home", path: "/", icon: Home },
    { name: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
    { name: "Submit Review", path: "/submit", icon: PlusCircle },
    { name: "All Reviews", path: "/reviews", icon: ListFilter },
    { name: "My Profile", path: "/profile", icon: User },
  ];

  // Close mobile menu when route changes
  React.useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-slate-950">
      {/* Sidebar */}
      <aside className={cn(
        "w-full md:w-64 glass border-r border-white/10 md:h-screen sticky top-0 z-50 flex flex-col transition-all duration-300",
        isMobileMenuOpen ? "h-screen" : "h-auto md:h-screen"
      )}>
        <div className="p-6 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 bg-brand-600 rounded-xl flex items-center justify-center shadow-lg shadow-brand-600/40 group-hover:scale-110 transition-transform">
              <span className="text-xl font-bold">F</span>
            </div>
            <span className="font-bold text-xl tracking-tight">FlipSense</span>
          </Link>

          {/* Mobile Toggle */}
          <button 
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2 text-slate-400 hover:text-white transition-colors"
          >
            {isMobileMenuOpen ? (
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>
            )}
          </button>
        </div>

        <div className={cn(
          "flex-1 flex flex-col overflow-hidden transition-all duration-300",
          isMobileMenuOpen ? "opacity-100 max-h-screen" : "opacity-0 max-h-0 md:opacity-100 md:max-h-screen"
        )}>
          <nav className="px-4 space-y-2 flex-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={cn(
                    "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group",
                    isActive 
                      ? "bg-brand-600/20 text-brand-400 border border-brand-600/30" 
                      : "text-slate-400 hover:text-slate-100 hover:bg-white/5"
                  )}
                >
                  <Icon className={cn("w-5 h-5", isActive ? "text-brand-400" : "text-slate-500 group-hover:text-slate-300")} />
                  <span className="font-medium">{item.name}</span>
                </Link>
              );
            })}
          </nav>

          <div className="p-4 border-t border-white/5 space-y-4">
            <div className="flex items-center gap-3 px-4 py-2">
              <div className="w-8 h-8 rounded-full bg-brand-600/20 flex items-center justify-center text-brand-400 font-bold text-xs">
                {user?.displayName?.[0] || "U"}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-medium text-slate-200 truncate">{user?.displayName}</p>
                <p className="text-[10px] text-slate-500 truncate">{user?.email}</p>
              </div>
            </div>
            <button 
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-rose-400 hover:bg-rose-500/10 transition-all"
            >
              <LogOut className="w-5 h-5" />
              <span className="font-medium">Logout</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 relative overflow-x-hidden">
        {/* New Shader Background with Fallback */}
        <div className="fixed inset-0 pointer-events-none z-0">
          {hasWebGL === true ? (
            <MeshGradient
              className="w-full h-full"
              colors={["#000000", "#1a1a1a", "#0f172a", "#1e293b"]}
              speed={0.5}
            />
          ) : hasWebGL === false ? (
            <div className="w-full h-full bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950" />
          ) : null}
          {/* Subtle overlay to ensure readability */}
          <div className="absolute inset-0 bg-slate-950/40 backdrop-blur-[2px]" />
        </div>
        
        <div className="relative z-10">
          {children}
        </div>
      </main>
    </div>
  );
}
