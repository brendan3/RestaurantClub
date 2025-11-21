import { Link, useLocation } from "wouter";
import { Home, Map, Users, User, MessageCircle } from "lucide-react";
import { ASSETS } from "@/lib/mockData";

export default function AppShell({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();

  const navItems = [
    { href: "/", icon: Home, label: "Home" },
    { href: "/social", icon: MessageCircle, label: "Social" },
    { href: "/history", icon: Map, label: "History" },
    { href: "/club", icon: Users, label: "Club" },
    { href: "/profile", icon: User, label: "Me" },
  ];

  return (
    <div className="min-h-screen bg-background font-sans flex flex-col md:flex-row max-w-screen-2xl mx-auto overflow-hidden">
      
      {/* Desktop Sidebar - Floating Style */}
      <aside className="hidden md:flex flex-col w-20 lg:w-64 p-4 shrink-0 sticky top-0 h-screen">
        <div className="bg-card/50 h-full rounded-[2rem] border border-white/50 shadow-sm p-4 flex flex-col">
            <div className="flex items-center justify-center lg:justify-start gap-3 mb-8 p-2">
            <img src={ASSETS.mascot} alt="Mascot" className="w-10 h-10 object-contain drop-shadow-sm hover:scale-110 transition-transform duration-500" />
            <div className="hidden lg:block">
                <h1 className="font-heading font-bold text-xl text-primary leading-tight tracking-tight">Restaurant<br/><span className="text-foreground/80">Club</span></h1>
            </div>
            </div>

            <nav className="flex-1 space-y-1">
            {navItems.map((item) => {
                const isActive = location === item.href;
                return (
                <Link key={item.href} href={item.href} className={`flex items-center justify-center lg:justify-start gap-3 px-3 py-3 rounded-2xl transition-all duration-300 font-medium group relative ${
                    isActive 
                        ? "bg-white shadow-sm text-primary" 
                        : "text-muted-foreground hover:bg-white/60 hover:text-foreground"
                    }`}>
                    <item.icon className={`w-5 h-5 ${isActive ? "fill-current" : "group-hover:scale-110 transition-transform"}`} strokeWidth={2.5} />
                    <span className="hidden lg:block">{item.label}</span>
                    {isActive && <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-primary rounded-r-full lg:hidden" />}
                </Link>
                );
            })}
            </nav>

            <div className="mt-auto pt-6 border-t border-border/50 hidden lg:block">
            <div className="bg-primary/5 p-4 rounded-2xl border border-primary/10">
                <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1">Next Up</p>
                <p className="text-sm font-bold text-foreground">La Trattoria</p>
                <p className="text-xs text-primary font-medium mt-1">in 12 days</p>
            </div>
            </div>
        </div>
      </aside>

      {/* Mobile Header */}
      <header className="md:hidden sticky top-0 z-40 bg-background/80 backdrop-blur-xl border-b border-white/20 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
           <img src={ASSETS.mascot} alt="Mascot" className="w-8 h-8 object-contain" />
           <span className="font-heading font-bold text-lg text-foreground/90">Restaurant Club</span>
        </div>
        <button className="w-9 h-9 rounded-full bg-white shadow-sm flex items-center justify-center text-foreground/80">
          <User className="w-4 h-4" />
        </button>
      </header>

      {/* Main Content */}
      <main className="flex-1 w-full pb-24 md:pb-0 overflow-x-hidden">
        <div className="container mx-auto max-w-5xl p-4 md:p-8 animate-in fade-in zoom-in-95 duration-700 ease-out">
          {children}
        </div>
      </main>

      {/* Mobile Bottom Nav */}
      <nav className="md:hidden fixed bottom-4 left-4 right-4 bg-white/90 backdrop-blur-xl border border-white/50 shadow-float rounded-full px-6 py-3 flex justify-between items-center z-50">
        {navItems.map((item) => {
          const isActive = location === item.href;
          return (
            <Link key={item.href} href={item.href} className={`flex flex-col items-center justify-center w-12 h-12 rounded-full transition-all duration-300 ${
                isActive ? "bg-primary/10 text-primary scale-110" : "text-muted-foreground hover:text-foreground"
              }`}>
                <item.icon className={`w-5 h-5 ${isActive ? "fill-current" : ""}`} strokeWidth={2.5} />
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
