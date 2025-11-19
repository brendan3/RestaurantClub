import { Link, useLocation } from "wouter";
import { Home, Map, Users, User, PlusCircle, MessageCircle } from "lucide-react";
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
    <div className="min-h-screen bg-background font-sans flex flex-col md:flex-row max-w-screen-2xl mx-auto shadow-2xl shadow-black/5 overflow-hidden">
      
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-64 border-r bg-sidebar p-6 shrink-0 sticky top-0 h-screen">
        <div className="flex items-center gap-3 mb-10">
          <img src={ASSETS.mascot} alt="Mascot" className="w-12 h-12 object-contain drop-shadow-md" />
          <div>
            <h1 className="font-heading font-bold text-xl text-primary leading-tight">Restaurant<br/><span className="text-foreground">Club</span></h1>
          </div>
        </div>

        <nav className="flex-1 space-y-2">
          {navItems.map((item) => {
            const isActive = location === item.href;
            return (
              <Link key={item.href} href={item.href} className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 font-medium group ${
                  isActive 
                    ? "bg-primary text-primary-foreground shadow-md shadow-primary/20" 
                    : "text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                }`}>
                  <item.icon className={`w-5 h-5 ${isActive ? "fill-current" : "group-hover:scale-110 transition-transform"}`} />
                  {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="mt-auto pt-6 border-t border-sidebar-border">
          <div className="bg-gradient-to-br from-orange-100 to-orange-50 dark:from-orange-950/30 dark:to-orange-900/10 p-4 rounded-2xl border border-orange-100 dark:border-orange-900/20">
            <p className="text-xs font-medium text-muted-foreground mb-2">Next Dinner</p>
            <p className="text-sm font-bold text-foreground">La Trattoria</p>
            <p className="text-xs text-primary mt-1">in 12 days</p>
          </div>
        </div>
      </aside>

      {/* Mobile Header */}
      <header className="md:hidden sticky top-0 z-40 bg-background/80 backdrop-blur-md border-b px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
           <img src={ASSETS.mascot} alt="Mascot" className="w-8 h-8 object-contain" />
           <span className="font-heading font-bold text-lg">Restaurant Club</span>
        </div>
        <button className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
          <User className="w-4 h-4" />
        </button>
      </header>

      {/* Main Content */}
      <main className="flex-1 w-full pb-24 md:pb-0 overflow-x-hidden">
        <div className="container mx-auto max-w-4xl p-4 md:p-8 animate-in fade-in duration-500">
          {children}
        </div>
      </main>

      {/* Mobile Bottom Nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-background border-t px-6 py-2 flex justify-between items-center z-50 safe-area-pb">
        {navItems.map((item) => {
          const isActive = location === item.href;
          return (
            <Link key={item.href} href={item.href} className={`flex flex-col items-center gap-1 p-2 rounded-lg transition-colors ${
                isActive ? "text-primary" : "text-muted-foreground hover:text-foreground"
              }`}>
                <div className={`relative ${isActive ? "-translate-y-1" : ""} transition-transform duration-200`}>
                  <item.icon className={`w-6 h-6 ${isActive ? "fill-current" : ""}`} strokeWidth={isActive ? 2.5 : 2} />
                  {isActive && <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-1 h-1 bg-primary rounded-full" />}
                </div>
                <span className="text-[10px] font-medium">{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
